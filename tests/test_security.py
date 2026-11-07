import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_security_headers_present(client):
    """Verify all OWASP recommended security headers are present on API responses."""
    response = client.get("/")
    assert response.status_code == 200
    headers = response.headers
    
    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "DENY"
    assert headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert headers.get("X-Permitted-Cross-Domain-Policies") == "none"
    assert "default-src 'none'" in headers.get("Content-Security-Policy", "")
    assert "max-age=" in headers.get("Strict-Transport-Security", "")
    assert "camera=()" in headers.get("Permissions-Policy", "")
    assert headers.get("Cross-Origin-Opener-Policy") == "same-origin"

def test_traceback_not_leaked_on_predict_internal_error(client, monkeypatch):
    """Verify CWE-209: Internal exceptions do not leak stack traces or internal paths to clients."""
    from heartflow_backend import inference
    
    def raise_internal_error(*args, **kwargs):
        raise RuntimeError("SecretInternalDatabasePath: C:\\sensitive\\credentials.key failed!")

    monkeypatch.setattr(inference, "evaluate", raise_internal_error)
    
    payload = {
        "Heart_Rate": 78.0,
        "SpO2_Level": 98.0,
        "Systolic_BP": 120.0,
        "Diastolic_BP": 80.0,
        "Body_Temp": 37.0,
    }
    response = client.post("/heartflow/predict", json=payload)
    assert response.status_code == 500
    text = response.text
    assert "Traceback" not in text
    assert "SecretInternalDatabasePath" not in text
    assert "credentials.key" not in text
    assert "Inference processing failed" in text

def test_dataset_pagination_bounds_validation(client):
    """Verify negative limit or zero page are rejected at boundary with 422."""
    # Negative limit
    res_neg_limit = client.get("/heartflow/dataset?limit=-10")
    assert res_neg_limit.status_code == 422

    # Zero limit
    res_zero_limit = client.get("/heartflow/dataset?limit=0")
    assert res_zero_limit.status_code == 422

    # Zero page
    res_zero_page = client.get("/heartflow/dataset?page=0")
    assert res_zero_page.status_code == 422

    # Exceeding max limit (100)
    res_huge_limit = client.get("/heartflow/dataset?limit=500")
    assert res_huge_limit.status_code == 422

def test_export_tinyml_model_injection_sanitization(client):
    """Verify model_name parameters are sanitized against C header breakout injection."""
    malicious_model = "rf*/\n#include <evil.h>\n/*"
    response = client.get("/heartflow/export_tinyml", params={"model_name": malicious_model})
    assert response.status_code == 200
    data = response.json()
    # Should safely return an error or sanitized name, never raw breakout
    if "code" in data:
        assert "#include <evil.h>" not in data["code"]
    else:
        assert "error" in data

def test_retrain_rejects_non_csv_file(client, monkeypatch):
    """Verify upload handler rejects dangerous or non-CSV file extensions."""
    monkeypatch.setenv("P1_ENABLE_RETRAIN", "1")
    fake_exe = b"MZ\x90\x00\x03\x00\x00\x00"
    files = {"file": ("malicious_payload.exe", fake_exe, "application/octet-stream")}
    response = client.post("/heartflow/retrain", files=files)
    assert response.status_code == 400
    assert "only csv files" in response.text.lower()

def test_retrain_rejects_empty_file(client, monkeypatch):
    """Verify empty uploads are rejected."""
    monkeypatch.setenv("P1_ENABLE_RETRAIN", "1")
    files = {"file": ("empty.csv", b"", "text/csv")}
    response = client.post("/heartflow/retrain", files=files)
    assert response.status_code == 400
    assert "empty" in response.text.lower()

def test_patient_data_schema_extra_attributes_ignored(client):
    """Verify extra/unknown attributes in PatientData are safely stripped/ignored."""
    payload = {
        "Heart_Rate": 75.0,
        "SpO2_Level": 98.0,
        "Systolic_BP": 120.0,
        "Diastolic_BP": 80.0,
        "Body_Temp": 37.0,
        "is_admin": True,
        "__proto__": {"polluted": True},
        "role": "superadmin"
    }
    response = client.post("/heartflow/predict", json=payload)
    assert response.status_code == 200

def test_websocket_origin_security(client):
    """Verify unauthorized WebSocket origins are closed with code 1008 (CSWSH defense)."""
    # Unauthorized cross-origin connection
    with pytest.raises(Exception):
        with client.websocket_connect(
            "/heartflow/ws/feed",
            headers={"Origin": "https://malicious-phishing-site.com"}
        ) as ws:
            ws.receive_json()

    # Authorized origin
    with client.websocket_connect(
        "/heartflow/ws/feed",
        headers={"Origin": "https://rachit-mangawa.github.io"}
    ) as ws:
        frame = ws.receive_json()
        assert "sensor_data" in frame

def test_rate_limiting_enforcement(client, monkeypatch):
    """Verify rate limiter blocks excessive rapid requests with HTTP 429."""
    # Ensure rate limiting is enabled
    monkeypatch.setenv("P1_RATE_LIMIT_ENABLED", "1")
    
    # Send rapid requests to /health
    responses = [client.get("/heartflow/health") for _ in range(350)]
    status_codes = [r.status_code for r in responses]
    assert 429 in status_codes
    rate_limited_response = next(r for r in responses if r.status_code == 429)
    assert "Retry-After" in rate_limited_response.headers
    assert "Rate limit exceeded" in rate_limited_response.json().get("detail", "")
