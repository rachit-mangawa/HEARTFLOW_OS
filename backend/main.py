import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import asyncio
import random
import shap
import database as db
import numpy as np
from contextlib import asynccontextmanager
from config import settings
import warnings

# Suppress sklearn version mismatch warnings in stdout
try:
    from sklearn.exceptions import InconsistentVersionWarning
    warnings.filterwarnings("ignore", category=InconsistentVersionWarning)
except ImportError:
    pass
from preprocessing import preprocess_data
from export import generate_c_code
from inference import evaluate

ensemble_system = None

async def background_sync():
    while True:
        await asyncio.sleep(60)
        await db.sync_from_hub()
        await db.sync_to_hub()

@asynccontextmanager
async def lifespan(app: FastAPI):
    global ensemble_system
    await db.init_db()
    
    sync_task = asyncio.create_task(background_sync())
    
    try:
        from ensemble import EnsembleModel
        ensemble_system = EnsembleModel()
        print("Models loaded successfully.")
    except Exception as e:
        print(f"Model loading failed: {e}")
    yield
    sync_task.cancel()
    ensemble_system = None

app = FastAPI(title="TinyML Healthcare API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_ensemble():
    global ensemble_system
    return ensemble_system

class PatientData(BaseModel):
    Heart_Rate: float
    SpO2_Level: float
    Systolic_BP: float
    Diastolic_BP: float
    Body_Temp: float
    
from fastapi.responses import RedirectResponse

@app.get("/")
def read_root():
    return RedirectResponse(url="/docs")

@app.get("/health")
def health_check():
    return {"status": "Healthy" if get_ensemble() else "Warning - Models Offline"}

def log_alert_sync(data: PatientData, conf: float):
    try:
        from datetime import datetime, timezone, timedelta
        ist = timezone(timedelta(hours=5, minutes=30))
        timestamp = datetime.now(ist).strftime("%Y-%m-%d %H:%M:%S")
        with open("alerts.log", "a") as f:
            f.write(f"[{timestamp}] ALERT: Patient at risk! HR: {data.Heart_Rate}, SpO2: {data.SpO2_Level}, Confidence: {conf:.2f}\n")
    except Exception:
        pass

async def log_prediction_background(data, final_pred, conf):
    try:
        await db.log_prediction(data, final_pred, conf)
    except Exception as db_e:
        print(f"DB logging skipped: {db_e}")

@app.post("/predict")
async def predict(data: PatientData, background_tasks: BackgroundTasks):
    try:
        eng = get_ensemble()
        if not eng:
            return {"error": "Models untrained. Ensure python backend/models.py executes."}
                
        from inference import evaluate
        result = await asyncio.to_thread(evaluate, eng, data)
        
        if "error" in result:
            return result
            
        is_at_risk = result["prediction"]
        final_pred = result["prediction_label"]
        conf = result["probability"]
        
        # Critical Alert System — fault-tolerant
        if is_at_risk == 1 and float(conf) > 0.80:
            background_tasks.add_task(log_alert_sync, data, float(conf))
                
        # Log to SQLite History — fault-tolerant
        background_tasks.add_task(log_prediction_background, data, final_pred, float(conf))
        
        return result
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=f"Backend Error: {str(e)}\n\nTraceback:\n{traceback.format_exc()}")

@app.websocket("/ws/feed")
async def websocket_feed(websocket: WebSocket):
    await websocket.accept()
    
    eng = get_ensemble()
    if not eng:
        await websocket.close(code=1011)
        return
        
    from simulator import PatientDataSimulator
    simulator = PatientDataSimulator()
    
    try:
        async for state in simulator.run():
            data = PatientData(**state)
            
            prediction_result = await asyncio.to_thread(evaluate, eng, data)
            
            front_pred = None
            if "error" not in prediction_result:
                front_pred = {
                    "is_at_risk": 1 if prediction_result["prediction"] else 0,
                    "label": prediction_result["prediction_label"],
                    "confidence": prediction_result["probability"],
                    "disease_probs": prediction_result.get("disease_probs", {})
                }
            
            await websocket.send_json({
                "sensor_data": data.model_dump(),
                "prediction": front_pred
            })
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WS error: {e}")

@app.get("/history")
async def history():
    return await db.get_history()

@app.get("/dataset")
def get_dataset():
    data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'patient_dataset.csv')
    if os.path.exists(data_path):
        try:
            # Force UTF-8 and strip column whitespace
            df = pd.read_csv(data_path, encoding='utf-8')
            df.columns = [c.strip() for c in df.columns]
            return df.to_dict(orient="records")
        except Exception as e:
            return {"error": f"Failed to read dataset: {str(e)}"}
    return {"error": "Dataset not found"}

@app.get("/sync")
def force_sync():
    from database import sync_from_hub, sync_to_hub
    sync_from_hub()
    return {"status": "Sync attempted"}

@app.post("/explain")
async def explain(data: PatientData):
    eng = get_ensemble()
    if not eng or 'rf' not in eng.models:
        return {"error": "RF Model unavailable for explanation."}
        
    df = pd.DataFrame([{
        'Heart Rate (bpm)': data.Heart_Rate,
        'SpO2 Level (%)': data.SpO2_Level,
        'Systolic Blood Pressure (mmHg)': data.Systolic_BP,
        'Diastolic Blood Pressure (mmHg)': data.Diastolic_BP,
        'Body Temperature (°C)': data.Body_Temp
    }])
    
    X_proc, _ = await asyncio.to_thread(preprocess_data, df, False)
    
    def compute_shap():
        import numpy as np
        rf_model = eng.models['rf']
        explainer = shap.TreeExplainer(rf_model)
        shap_values = explainer.shap_values(X_proc)
        pred_idx = int(rf_model.predict(X_proc)[0])
        if isinstance(shap_values, list):
            vals = shap_values[pred_idx][0]
        elif isinstance(shap_values, np.ndarray) and len(shap_values.shape) == 3:
            vals = shap_values[0, :, pred_idx]
        else:
            vals = shap_values[0]
        return vals.tolist(), X_proc.columns.tolist()
        
    try:
        shap_vals, features = await asyncio.to_thread(compute_shap)
        return {"shap_values": shap_vals, "feature_names": features}
    except Exception as e:
        return {"error": str(e)}

@app.get("/export_tinyml")
def export_tinyml(model_name: str = "rf", quantize: bool = False):
    eng = get_ensemble()
    return generate_c_code(eng, model_name, quantize)

def run_training_background():
    try:
        from models import train_models
        train_models()
        # Force reload in lifespan is tricky, but we can do it via global
        global ensemble_system
        from ensemble import EnsembleModel
        ensemble_system = EnsembleModel()
    except Exception as e:
        print(f"Background training failed: {e}")

@app.post("/retrain")
async def retrain(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'patient_dataset.csv')
    os.makedirs(os.path.dirname(data_path), exist_ok=True)
    
    try:
        content = await file.read()
        import io
        new_df = pd.read_csv(io.BytesIO(content))
        new_df.columns = [c.strip() for c in new_df.columns]
        
        if os.path.exists(data_path):
            existing_df = pd.read_csv(data_path, encoding='utf-8')
            existing_df.columns = [c.strip() for c in existing_df.columns]
            
            # Validate schema
            required_cols = set(existing_df.columns)
            provided_cols = set(new_df.columns)
            
            if not required_cols.issubset(provided_cols):
                missing = required_cols - provided_cols
                return {"error": f"Schema mismatch. Missing columns: {list(missing)}"}
            
            # Ensure columns are in the same order and select only necessary ones
            new_df = new_df[existing_df.columns]
            
            # Append data
            combined_df = pd.concat([existing_df, new_df], ignore_index=True)
        else:
            combined_df = new_df
            
        # Save validated and combined dataset
        combined_df.to_csv(data_path, index=False, encoding='utf-8')
        
        background_tasks.add_task(run_training_background)
        
        return {"status": "success", "message": f"Dataset updated (now {len(combined_df)} records) and ensemble retrain started in background!"}
    except Exception as e:
        return {"error": f"Retraining failed: {str(e)}"}
