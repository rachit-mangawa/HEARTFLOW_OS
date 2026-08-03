import sqlite3
import os
import time
from datetime import datetime
from huggingface_hub import HfApi, hf_hub_download

REPO_ID = "IDKHowToCodeFr/tinyml-logs"
DB_NAME = 'patient_history.db'
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), DB_NAME)
HF_TOKEN = os.getenv("HF_TOKEN")

api = HfApi()

def sync_from_hub():
    if not HF_TOKEN:
        print("No HF_TOKEN found. Skipping sync.")
        return
    try:
        # Download with cache-busting logic if possible or just fresh download
        print(f"Downloading {DB_NAME} from Hub...")
        path = hf_hub_download(
            repo_id=REPO_ID, 
            filename=DB_NAME, 
            repo_type="dataset", 
            token=HF_TOKEN,
            force_download=True
        )
        import shutil
        shutil.copy(path, DB_PATH)
        print("Sync from Hub complete.")
    except Exception as e:
        print(f"Sync from Hub failed: {e}")

def sync_to_hub():
    if not HF_TOKEN:
        return
    try:
        # Uploading back to Hub centralizes it for other instances
        api.upload_file(
            path_or_fileobj=DB_PATH,
            path_in_repo=DB_NAME,
            repo_id=REPO_ID,
            repo_type="dataset",
            token=HF_TOKEN
        )
    except Exception as e:
        print(f"Sync to Hub failed: {e}")

def init_db():
    sync_from_hub()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME,
            heart_rate REAL,
            spo2 REAL,
            sys_bp REAL,
            dia_bp REAL,
            temp REAL,
            fall_detection TEXT,
            prediction_label TEXT,
            confidence REAL
        )
    ''')
    conn.commit()
    conn.close()

def log_prediction(data, prediction_label, confidence):
    # Pull latest before writing to avoid overwriting others' work
    sync_from_hub()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO predictions (timestamp, heart_rate, spo2, sys_bp, dia_bp, temp, fall_detection, prediction_label, confidence)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        data.Heart_Rate,
        data.SpO2_Level,
        data.Systolic_BP,
        data.Diastolic_BP,
        data.Body_Temp,
        data.Fall_Detection,
        prediction_label,
        confidence
    ))
    conn.commit()
    conn.close()
    
    # Push immediately
    sync_to_hub()

def get_history():
    # Fresh pull for history view
    sync_from_hub()
    
    if not os.path.exists(DB_PATH):
        return []
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM predictions ORDER BY timestamp DESC LIMIT 100')
    rows = cursor.fetchall()
    col_names = [description[0] for description in cursor.description]
    conn.close()
    
    history = []
    for row in rows:
        history.append(dict(zip(col_names, row)))
    return history

# Initialize db when this module is loaded
init_db()
