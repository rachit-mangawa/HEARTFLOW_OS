import aiosqlite
import os
from datetime import datetime
import zoneinfo
from typing import List, Dict, Any
from config import settings

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), settings.db_name)

async def init_db() -> None:
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
                prediction_label TEXT,
                confidence REAL
            )
        ''')
        await db.commit()

async def log_prediction(data: Any, prediction_label: str, confidence: float) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        ist = zoneinfo.ZoneInfo("Asia/Kolkata")
        await db.execute('''
            INSERT INTO predictions (timestamp, heart_rate, spo2, sys_bp, dia_bp, temp, prediction_label, confidence)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            datetime.now(ist).strftime("%Y-%m-%d %H:%M:%S"),
            data.Heart_Rate,
            data.SpO2_Level,
            data.Systolic_BP,
            data.Diastolic_BP,
            data.Body_Temp,
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
