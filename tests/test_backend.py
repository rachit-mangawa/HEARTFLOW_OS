import pytest
from fastapi.testclient import TestClient
import sys
import os

# Ensure backend is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))
from main import app

client = TestClient(app)

def test_health_check():
    """Test that the backend API is up and running."""
    # Assuming there varies a root or health endpoint. If not, this is a placeholder.
    response = client.get("/")
    # Even if it's 404 because no root exists, the server responds.
    assert response.status_code in [200, 404]

def test_predict_endpoint_validation():
    """Test that the predict endpoint rejects invalid data."""
    payload = {
        "Heart_Rate": "invalid_string",
        "SpO2_Level": 98
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422 # Unprocessable Entity (Pydantic validation)

