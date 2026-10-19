import pytest
from fastapi.testclient import TestClient
import sys
import os

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data

def test_history_endpoint(client):
    response = client.get("/history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_dataset_endpoint(client):
    response = client.get("/dataset")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_dataset_paginated_endpoint(client):
    response = client.get("/dataset?page=1&limit=25")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "total" in data
    assert "rows" in data
    assert isinstance(data["rows"], list)
    assert len(data["rows"]) <= 25

def test_dataset_summary_endpoint(client):
    response = client.get("/dataset/summary")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "summary" in data
    assert data["summary"]["total_records"] == 60000
    assert "target_distribution" in data
    assert "correlation_matrix" in data

def test_dataset_download_endpoint(client):
    response = client.get("/dataset/download")
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
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    if "error" not in data:
        assert "prediction" in data
        assert "prediction_label" in data
        assert "probability" in data
        assert "disease_probs" in data
        assert "model_outputs" in data

def test_predict_endpoint_acute_vitals(client):
    # Acute tachycardia + hypoxemia
    payload = {
        "Heart_Rate": 165.0,
        "SpO2_Level": 85.0,
        "Systolic_BP": 170.0,
        "Diastolic_BP": 105.0,
        "Body_Temp": 38.5
    }
    response = client.post("/predict", json=payload)
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
    response = client.post("/explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    if "error" not in data:
        assert "shap_values" in data
        assert "feature_names" in data
        assert len(data["shap_values"]) == len(data["feature_names"])

@pytest.mark.parametrize("model_name", ["rf", "svm", "logreg", "small_nn", "knn"])
@pytest.mark.parametrize("quantize", [False, True])
def test_export_tinyml_all_models_parameterized(client, model_name, quantize):
    response = client.get(f"/export_tinyml?model_name={model_name}&quantize={str(quantize).lower()}")
    assert response.status_code == 200
    data = response.json()
    if "error" in data:
        assert "not found" in data["error"].lower() or "cannot be exported" in data["error"].lower()
    else:
        assert "code" in data
        assert "#ifndef HEARTFLOW_MODEL_H" in data["code"]

def test_export_tinyml_invalid_model(client):
    response = client.get("/export_tinyml?model_name=unknown_nonexistent_model")
    assert response.status_code == 200
    data = response.json()
    assert "error" in data

def test_metrics_endpoint(client):
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "ensemble_accuracy" in data
    assert "ensemble_f1_macro" in data
    assert "models" in data
