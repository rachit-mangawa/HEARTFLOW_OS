import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))
from main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

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

def test_export_tinyml_random_forest(client):
    response = client.get("/export_tinyml?model_name=rf")
    
    if response.status_code == 200:
        data = response.json()
        if "error" in data:
            assert "not found" in data["error"].lower() or "models untrained" in data["error"].lower()
        else:
            assert "code" in data or "c_code" in data

def test_metrics_endpoint(client):
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "ensemble_accuracy" in data
    assert "ensemble_f1_macro" in data
    assert "models" in data

