import os
import sqlite3
import asyncio
from datetime import datetime
import zoneinfo
from typing import List, Dict, Any
from .paths import get_db_path

DB_PATH = get_db_path()

def _ensure_dir(path: str):
    d = os.path.dirname(os.path.abspath(path))
    if d:
        os.makedirs(d, exist_ok=True)

def init_db_sync(target_path: str | None = None) -> None:
    p = target_path or DB_PATH
    _ensure_dir(p)
    conn = sqlite3.connect(p, timeout=20.0)
    try:
        conn.execute("PRAGMA busy_timeout = 10000;")
        try:
            conn.execute("PRAGMA journal_mode=WAL;")
        except Exception:
            pass
        conn.execute("PRAGMA synchronous=NORMAL;")
        conn.execute('''
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
        conn.commit()
    finally:
        conn.close()

async def init_db() -> None:
    await asyncio.to_thread(init_db_sync, DB_PATH)

def log_prediction_sync(data: Any, prediction_label: str, confidence: float, target_path: str | None = None) -> None:
    p = target_path or DB_PATH
    if not os.path.exists(p):
        init_db_sync(p)
    try:
        ist = zoneinfo.ZoneInfo("Asia/Kolkata")
        ts = datetime.now(ist).strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    conn = sqlite3.connect(p, timeout=20.0)
    try:
        conn.execute("PRAGMA busy_timeout = 10000;")
        conn.execute('''
            INSERT INTO predictions (timestamp, heart_rate, spo2, sys_bp, dia_bp, temp, prediction_label, confidence)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            ts,
            getattr(data, "Heart_Rate", 0.0),
            getattr(data, "SpO2_Level", 0.0),
            getattr(data, "Systolic_BP", 0.0),
            getattr(data, "Diastolic_BP", 0.0),
            getattr(data, "Body_Temp", 0.0),
            prediction_label,
            confidence
        ))
        conn.commit()
    finally:
        conn.close()

async def log_prediction(data: Any, prediction_label: str, confidence: float) -> None:
    await asyncio.to_thread(log_prediction_sync, data, prediction_label, confidence, DB_PATH)

def get_history_sync(target_path: str | None = None) -> List[Dict[str, Any]]:
    p = target_path or DB_PATH
    if not os.path.exists(p):
        init_db_sync(p)
        return []
    conn = sqlite3.connect(p, timeout=20.0)
    try:
        conn.execute("PRAGMA busy_timeout = 10000;")
        conn.row_factory = sqlite3.Row
        cursor = conn.execute('SELECT * FROM predictions ORDER BY timestamp DESC LIMIT 100')
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

async def get_history() -> List[Dict[str, Any]]:
    return await asyncio.to_thread(get_history_sync, DB_PATH)
