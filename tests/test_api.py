import pytest
import os
import sys
import subprocess
from fastapi import FastAPI
from fastapi.testclient import TestClient
from heartflow_backend.router import router
from heartflow_backend import warmup

@pytest.fixture(scope="module")
def app():
    _app = FastAPI()
    _app.include_router(router, prefix="/heartflow")
    return _app

@pytest.fixture(scope="module")
def client(app):
    with TestClient(app) as c:
        yield c

def test_health_endpoint(client):
    response = client.get("/heartflow/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "models_loaded" in data
    assert "retrain_enabled" in data

def test_history_endpoint(client):
    response = client.get("/heartflow/history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_dataset_endpoint(client):
    response = client.get("/heartflow/dataset")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_dataset_paginated_endpoint(client):
    response = client.get("/heartflow/dataset?page=1&limit=25")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "total" in data
    assert "rows" in data
    assert isinstance(data["rows"], list)
    assert len(data["rows"]) <= 25

def test_dataset_summary_endpoint(client):
    response = client.get("/heartflow/dataset/summary")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "summary" in data
    assert data["summary"]["total_records"] >= 60000
    assert "target_distribution" in data
    assert "correlation_matrix" in data

def test_dataset_download_endpoint(client):
    response = client.get("/heartflow/dataset/download")
    assert response.status_code == 200
    assert "text/csv" in response.headers.get("content-type", "")

def test_predict_endpoint_valid_telemetry(client):
    payload = {
        "Heart_Rate": 78.0,
        "SpO2_Level": 98.5,
        "Systolic_BP": 120.0,
        "Diastolic_BP": 80.0,
        "Body_Temp": 37.0
    }
    response = client.post("/heartflow/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    if "error" not in data:
        assert "prediction" in data
        assert "prediction_label" in data
        assert "probability" in data
        assert "disease_probs" in data
        assert "model_outputs" in data

def test_predict_endpoint_acute_vitals(client):
    payload = {
        "Heart_Rate": 165.0,
        "SpO2_Level": 85.0,
        "Systolic_BP": 170.0,
        "Diastolic_BP": 105.0,
        "Body_Temp": 38.5
    }
    response = client.post("/heartflow/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    if "error" not in data:
        assert "prediction" in data
        assert "prediction_label" in data
        assert data["prediction"] in [True, False, 0, 1]

def test_explain_endpoint(client):
    payload = {
        "Heart_Rate": 82.0,
        "SpO2_Level": 97.0,
        "Systolic_BP": 125.0,
        "Diastolic_BP": 82.0,
        "Body_Temp": 37.1
    }
    response = client.post("/heartflow/explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    if "error" not in data:
        assert "shap_values" in data
        assert "feature_names" in data
        assert len(data["shap_values"]) == len(data["feature_names"])

@pytest.mark.parametrize("model_name", ["rf", "svm", "logreg", "small_nn", "knn"])
@pytest.mark.parametrize("quantize", [False, True])
def test_export_tinyml_all_models_parameterized(client, model_name, quantize):
    response = client.get(f"/heartflow/export_tinyml?model_name={model_name}&quantize={str(quantize).lower()}")
    assert response.status_code == 200
    data = response.json()
    if "error" in data:
        assert "not found" in data["error"].lower() or "cannot be exported" in data["error"].lower()
    else:
        assert "code" in data
        assert "#ifndef HEARTFLOW_MODEL_H" in data["code"]

def test_export_tinyml_invalid_model(client):
    response = client.get("/heartflow/export_tinyml?model_name=unknown_nonexistent_model")
    assert response.status_code == 200
    data = response.json()
    assert "error" in data

def test_metrics_endpoint(client):
    response = client.get("/heartflow/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "ensemble_accuracy" in data
    assert "ensemble_f1_macro" in data
    assert "models" in data

def test_import_is_fast_and_creates_no_files(tmp_path):
    test_p1 = str(tmp_path / "p1")
    cmd = [
        sys.executable,
        "-X", "importtime",
        "-c",
        f"import os, sys\n"
        f"p1 = r'{test_p1}'\n"
        f"assert not os.path.exists(p1)\n"
        f"import heartflow_backend.router\n"
        f"assert not os.path.exists(p1), 'Files created on import'\n"
    ]
    env = os.environ.copy()
    env["TEMP"] = str(tmp_path)
    env["TMP"] = str(tmp_path)
    env["TMPDIR"] = str(tmp_path)
    res = subprocess.run(cmd, env=env, capture_output=True, text=True)
    assert res.returncode == 0, f"Import test failed:\n{res.stderr}"
    lines = [l for l in res.stderr.splitlines() if "heartflow_backend.router" in l]
    assert len(lines) > 0
    parts = lines[0].split("|")
    self_time = int(parts[0].replace("import time:", "").strip())
    assert self_time < 1_000_000, f"Self time {self_time} us >= 1s"

def test_warmup_and_health(client):
    warmup()
    response = client.get("/heartflow/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Healthy"
    assert data["models_loaded"] is True
    assert all(data["models"].values())

def test_retrain_disabled(client, monkeypatch):
    monkeypatch.setenv("P1_ENABLE_RETRAIN", "0")
    csv_bytes = b"Heart Rate,SpO2 Level,Systolic BP,Diastolic BP,Body Temperature\n80,98,120,80,37.0\n"
    files = {"file": ("data.csv", csv_bytes, "text/csv")}
    response = client.post("/heartflow/retrain", files=files)
    assert response.status_code == 403
    data = response.json()
    assert data["retrain_enabled"] is False
    assert "disabled" in data["error"].lower()

def test_retrain_enabled(client, monkeypatch):
    monkeypatch.setenv("P1_ENABLE_RETRAIN", "1")
    csv_bytes = b"Heart Rate,SpO2 Level,Systolic BP,Diastolic BP,Body Temperature\n80,98,120,80,37.0\n"
    files = {"file": ("data.csv", csv_bytes, "text/csv")}
    response = client.post("/heartflow/retrain", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"

def test_websocket_connect_and_receive(client):
    with client.websocket_connect("/heartflow/ws/feed") as ws:
        frame1 = ws.receive_json()
        assert "sensor_data" in frame1
        assert "Heart_Rate" in frame1["sensor_data"]
        frame2 = ws.receive_json()
        assert "sensor_data" in frame2
        frame3 = ws.receive_json()
        assert "sensor_data" in frame3
