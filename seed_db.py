import sqlite3
import os
import random
from datetime import datetime, timedelta

DB_NAME = 'patient_history.db'
DB_PATH = os.path.join('backend', DB_NAME)

def seed_data():
    if not os.path.exists('backend'):
        os.makedirs('backend')

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Ensure table exists
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

    # Sample data generation
    labels = ["Healthy", "At Risk"]
    fall_options = ["No Fall", "Fall Detected"]
    
    now = datetime.now()
    
    print("Seeding 30 sample predictions...")
    for i in range(30):
        timestamp = (now - timedelta(minutes=i*15)).strftime("%Y-%m-%d %H:%M:%S")
        hr = round(random.uniform(60, 110), 1)
        spo2 = round(random.uniform(92, 99), 1)
        sys = round(random.uniform(110, 150), 1)
        dia = round(random.uniform(70, 95), 1)
        temp = round(random.uniform(36.1, 37.8), 1)
        fall = random.choice(fall_options) if hr > 100 else "No Fall"
        
        # Simple logic for label
        if hr > 100 or spo2 < 94 or sys > 140:
            label = "At Risk"
            conf = random.uniform(0.7, 0.95)
        else:
            label = "Healthy"
            conf = random.uniform(0.85, 0.99)

        cursor.execute('''
            INSERT INTO predictions (timestamp, heart_rate, spo2, sys_bp, dia_bp, temp, fall_detection, prediction_label, confidence)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (timestamp, hr, spo2, sys, dia, temp, fall, label, conf))

    conn.commit()
    conn.close()
    print("Done seeding.")

if __name__ == "__main__":
    seed_data()
