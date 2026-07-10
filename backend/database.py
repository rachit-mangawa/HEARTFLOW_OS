import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'patient_history.db')

def init_db():
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
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO predictions (timestamp, heart_rate, spo2, sys_bp, dia_bp, temp, fall_detection, prediction_label, confidence)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
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

def get_history():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM predictions ORDER BY timestamp DESC LIMIT 100')
    rows = cursor.fetchall()
    
    # Get column names
    col_names = [description[0] for description in cursor.description]
    
    conn.close()
    
    # Format as list of dicts
    history = []
    for row in rows:
        history.append(dict(zip(col_names, row)))
        
    return history

# Initialize db when this module is loaded
init_db()
