import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import asyncio
import shap
import database as db
import logging
from contextlib import asynccontextmanager
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
from schemas import PatientData
from mlops import MLOpsEngine
from streamer import TelemetryStreamer
from fastapi.responses import RedirectResponse

# Setup standard logging for critical fault alerts
logging.basicConfig(filename="alerts.log", level=logging.WARNING, 
                    format='%(asctime)s %(levelname)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S')

ml_engine = None

async def background_sync():
    while True:
        await asyncio.sleep(60)
        await db.sync_from_hub()
        await db.sync_to_hub()

@asynccontextmanager
async def lifespan(app: FastAPI):
    global ml_engine
    await db.init_db()
    sync_task = asyncio.create_task(background_sync())
    
    data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'patient_dataset.csv')
    ml_engine = MLOpsEngine(data_path)
    
    yield
    sync_task.cancel()
    ml_engine = None

app = FastAPI(title="TinyML Healthcare API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return RedirectResponse(url="/docs")

@app.get("/health")
def health_check():
    return {"status": "Healthy" if ml_engine and ml_engine.get_ensemble() else "Warning - Models Offline"}

async def log_prediction_background(data, final_pred, conf):
    try:
        await db.log_prediction(data, final_pred, conf)
    except Exception as db_e:
        print(f"DB logging skipped: {db_e}")

@app.post("/predict")
async def predict(data: PatientData, background_tasks: BackgroundTasks):
    try:
        eng = ml_engine.get_ensemble()
        if not eng:
            return {"error": "Models untrained. Ensure python backend/models.py executes."}
                
        result = await asyncio.to_thread(evaluate, eng, data)
        if "error" in result:
            return result
            
        is_at_risk = result["prediction"]
        final_pred = result["prediction_label"]
        conf = result["probability"]
        
        # Critical Alert System — standard library logging
        if is_at_risk == 1 and float(conf) > 0.80:
            logging.warning(f"Patient at risk! HR: {data.Heart_Rate}, SpO2: {data.SpO2_Level}, Confidence: {conf:.2f}")
                
        # Log to SQLite History
        background_tasks.add_task(log_prediction_background, data, final_pred, float(conf))
        
        return result
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=f"Backend Error: {str(e)}\n\nTraceback:\n{traceback.format_exc()}")

@app.websocket("/ws/feed")
async def websocket_feed(websocket: WebSocket):
    await websocket.accept()
    eng = ml_engine.get_ensemble()
    if not eng:
        await websocket.close(code=1011)
        return
        
    streamer = TelemetryStreamer(eng)
    try:
        async for payload in streamer.stream():
            await websocket.send_json(payload)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WS error: {e}")

@app.get("/history")
async def history():
    return await db.get_history()

@app.get("/dataset")
def get_dataset():
    if ml_engine and os.path.exists(ml_engine.dataset_path):
        try:
            df = pd.read_csv(ml_engine.dataset_path, encoding='utf-8')
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
    eng = ml_engine.get_ensemble()
    if not eng or 'rf' not in eng.models:
        return {"error": "RF Model unavailable for explanation."}
        
    df = pd.DataFrame([data.model_dump()])
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
    eng = ml_engine.get_ensemble()
    return generate_c_code(eng, model_name, quantize)

def _run_mlops_ingest(csv_bytes: bytes):
    return ml_engine.ingest_batch_sync(csv_bytes)

@app.post("/retrain")
async def retrain(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    content = await file.read()
    
    # We add this to background tasks so the HTTP response returns immediately
    # while the engine merges CSVs and retrains the models.
    def bg_task():
        res = ml_engine.ingest_batch_sync(content)
        if not res.success:
            print(f"MLOps Background Task Failed: {res.message}")
            
    background_tasks.add_task(bg_task)
    return {"status": "success", "message": "Dataset uploaded and ensemble retrain started in background!"}
