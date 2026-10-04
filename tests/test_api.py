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

def test_export_tinyml_random_forest(client):
    response = client.get("/export_tinyml?model_name=rf")
    
    if response.status_code == 200:
        data = response.json()
        if "error" in data:
            assert "not found" in data["error"].lower() or "models untrained" in data["error"].lower()
        else:
            assert "code" in data or "c_code" in data
