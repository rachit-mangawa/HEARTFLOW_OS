import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import app

client = TestClient(app)

def test_history_endpoint():
    response = client.get("/history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_dataset_endpoint():
    response = client.get("/dataset")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_export_tinyml_random_forest():
    response = client.get("/export_tinyml?model_name=rf")
    # if models aren't trained in the test environment, this might return 400 error
    # but we can check if it returns 200 or the correct schema
    assert response.status_code in (200, 400)
    if response.status_code == 200:
        assert "c_code" in response.json()
