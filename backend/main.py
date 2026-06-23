from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from preprocessing import preprocess_data

app = FastAPI(title="TinyML Healthcare API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ensemble_system = None
def get_ensemble():
    global ensemble_system
    if ensemble_system is None:
        try:
            from ensemble import EnsembleModel
            ensemble_system = EnsembleModel()
        except Exception:
            return None
    return ensemble_system

class PatientData(BaseModel):
    Heart_Rate: float
    SpO2_Level: float
    Systolic_BP: float
    Diastolic_BP: float
    Body_Temp: float
    Fall_Detection: str
    
@app.get("/health")
def health_check():
    return {"status": "Healthy" if get_ensemble() else "Warning - Models Offline"}

@app.post("/predict")
def predict(data: PatientData):
    eng = get_ensemble()
    if not eng:
        return {"error": "Models untrained. Ensure python backend/models.py executes."}
            
    df = pd.DataFrame([{
        'Heart Rate (bpm)': data.Heart_Rate,
        'SpO2 Level (%)': data.SpO2_Level,
        'Systolic Blood Pressure (mmHg)': data.Systolic_BP,
        'Diastolic Blood Pressure (mmHg)': data.Diastolic_BP,
        'Body Temperature (°C)': data.Body_Temp,
        'Fall Detection': data.Fall_Detection
    }])
    
    X_proc, _ = preprocess_data(df, is_training=False)
    final_pred, conf, ind_preds, ind_probs, weights = eng.predict(X_proc)
    
    is_at_risk = 0 if final_pred == "Healthy" else 1
    return {
        "prediction": is_at_risk,
        "prediction_label": final_pred,
        "probability": float(conf),
        "ensemble_prediction": is_at_risk,
        "model_outputs": ind_preds,
        "model_probs": {k: float(max(v)) for k, v in ind_probs.items()},
        "weights": weights
    }
