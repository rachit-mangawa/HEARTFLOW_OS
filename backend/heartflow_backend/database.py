import os
import sqlite3
import aiosqlite
from datetime import datetime
import zoneinfo
from typing import List, Dict, Any
from .config import settings
from .paths import get_db_path

DB_PATH = get_db_path()

def _ensure_dir(path: str):
    d = os.path.dirname(os.path.abspath(path))
    if d:
        os.makedirs(d, exist_ok=True)

def init_db_sync(target_path: str | None = None) -> None:
    p = target_path or DB_PATH
    _ensure_dir(p)
    with sqlite3.connect(p, timeout=20.0) as conn:
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

async def init_db() -> None:
    _ensure_dir(DB_PATH)
    async with aiosqlite.connect(DB_PATH, timeout=20.0) as db:
        await db.execute("PRAGMA busy_timeout = 10000;")
        try:
            await db.execute("PRAGMA journal_mode=WAL;")
        except Exception:
            pass
        await db.execute("PRAGMA synchronous=NORMAL;")
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
    if not os.path.exists(DB_PATH):
        await init_db()
    async with aiosqlite.connect(DB_PATH, timeout=20.0) as db:
        await db.execute("PRAGMA busy_timeout = 10000;")
        try:
            ist = zoneinfo.ZoneInfo("Asia/Kolkata")
            ts = datetime.now(ist).strftime("%Y-%m-%d %H:%M:%S")
        except Exception:
            ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
        await db.execute('''
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
        await db.commit()

async def get_history() -> List[Dict[str, Any]]:
    if not os.path.exists(DB_PATH):
        await init_db()
        return []
    
    async with aiosqlite.connect(DB_PATH, timeout=20.0) as db:
        await db.execute("PRAGMA busy_timeout = 10000;")
        db.row_factory = aiosqlite.Row
        async with db.execute('SELECT * FROM predictions ORDER BY timestamp DESC LIMIT 100') as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]
