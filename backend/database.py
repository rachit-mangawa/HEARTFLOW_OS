import aiosqlite
import os
import time
import asyncio
from datetime import datetime
from typing import List, Dict, Any
from huggingface_hub import HfApi, hf_hub_download
from config import settings

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), settings.db_name)
api = HfApi()
last_sync = 0
sync_lock = asyncio.Lock()

async def sync_from_hub():
    global last_sync
    if not settings.hf_token:
        print("No HF_TOKEN found. Skipping sync.")
        return
        
    try:
        user_info = api.whoami(token=settings.hf_token)
        username = user_info.get("name")
        if username and "IDKHowToCodeFr" in settings.repo_id:
            settings.repo_id = f"{username}/tinyml-logs"
    except Exception as e:
        print(f"Failed to fetch user info from token: {e}")

    
    async with sync_lock:
        if time.time() - last_sync < 60:
            return
        try:
            try:
                api.create_repo(repo_id=settings.repo_id, repo_type="dataset", exist_ok=True, token=settings.hf_token)
            except Exception as e:
                print(f"Failed to create repo: {e}")
                
            print(f"Downloading {settings.db_name} from Hub...")
            def _download():
                path = hf_hub_download(
                    repo_id=settings.repo_id, 
                    filename=settings.db_name, 
                    repo_type="dataset", 
                    token=settings.hf_token,
                    force_download=True
                )
                import shutil
                shutil.copy(path, DB_PATH)
            
            await asyncio.to_thread(_download)
            last_sync = time.time()
            print("Sync from Hub complete.")
        except Exception as e:
            print(f"Sync from Hub failed: {e}")

async def sync_to_hub():
    if not settings.hf_token:
        return
    try:
        def _upload():
            api.upload_file(
                path_or_fileobj=DB_PATH,
                path_in_repo=settings.db_name,
                repo_id=settings.repo_id,
                repo_type="dataset",
                token=settings.hf_token
            )
        await asyncio.to_thread(_upload)
    except Exception as e:
        print(f"Sync to Hub failed: {e}")

async def init_db() -> None:
    await sync_from_hub()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute('''
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
        await db.commit()

async def log_prediction(data: Any, prediction_label: str, confidence: float) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        from datetime import timezone, timedelta
        ist = timezone(timedelta(hours=5, minutes=30))
        await db.execute('''
            INSERT INTO predictions (timestamp, heart_rate, spo2, sys_bp, dia_bp, temp, fall_detection, prediction_label, confidence)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            datetime.now(ist).strftime("%Y-%m-%d %H:%M:%S"),
            data.Heart_Rate,
            data.SpO2_Level,
            data.Systolic_BP,
            data.Diastolic_BP,
            data.Body_Temp,
            "N/A",
            prediction_label,
            confidence
        ))
        await db.commit()

async def get_history() -> List[Dict[str, Any]]:
    if not os.path.exists(DB_PATH):
        return []
    
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute('SELECT * FROM predictions ORDER BY timestamp DESC LIMIT 100') as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]
