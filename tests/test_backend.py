import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from heartflow_backend.router import router

app = FastAPI()
app.include_router(router, prefix="/heartflow")

client = TestClient(app)

def test_health_check():
    response = client.get("/heartflow/health")
    assert response.status_code == 200

def test_predict_endpoint_validation():
    payload = {
        "Heart_Rate": "invalid_string",
        "SpO2_Level": 98
    }
    response = client.post("/heartflow/predict", json=payload)
    assert response.status_code == 422
