import streamlit as st
import requests
import pandas as pd
import os
from datetime import datetime, timedelta

st.set_page_config(page_title="Patient History", page_icon="🗄️", layout="wide")
API_URL = os.getenv("API_URL", "http://localhost:8000")
if "hf.space" in os.getenv("SPACE_ID", ""):
    API_URL = "http://localhost:8000"

st.title("🗄️ Patient Prediction History")
st.markdown("Live database of all patient predictions and vitals logged by the system. Times shown in **IST (UTC+5:30)**.")

def convert_to_ist(utc_time_str):
    try:
        utc_dt = datetime.strptime(utc_time_str, "%Y-%m-%d %H:%M:%S")
        ist_dt = utc_dt + timedelta(hours=5, minutes=30)
        return ist_dt.strftime("%Y-%m-%d %H:%M:%S")
    except:
        return utc_time_str

DISEASE_COLORS = {
    "Healthy":           "background-color: rgba(0, 204, 150, 0.15); color: #00cc96;",
    "Asthma":            "background-color: rgba(171, 99, 250, 0.15); color: #ab63fa;",
    "Diabetes Mellitus": "background-color: rgba(255, 161, 90, 0.15); color: #ffa15a;",
    "Heart Disease":     "background-color: rgba(239, 85, 59, 0.15); color: #ef553b;",
    "Hypertension":      "background-color: rgba(99, 110, 250, 0.15); color: #636efa;",
}

COLUMN_RENAME = {
    "id": "ID",
    "timestamp": "Timestamp",
    "prediction_label": "Diagnosis",
    "confidence": "Confidence",
    "heart_rate": "Heart Rate",
    "spo2": "SpO2 %",
    "sys_bp": "Sys BP",
    "dia_bp": "Dia BP",
    "temp": "Temp °C",
    "fall_detection": "Fall"
}

@st.fragment(run_every="5s")
def live_history_table():
    try:
        resp = requests.get(f"{API_URL}/history", timeout=5)
        if resp.status_code == 200:
            history_data = resp.json()
            if not history_data:
                st.info("No prediction history found. Go make some predictions first!")
                return
            
            df = pd.DataFrame(history_data)
            if "timestamp" in df.columns:
                df["timestamp"] = df["timestamp"].apply(convert_to_ist)
            
            cols = ['id', 'timestamp', 'prediction_label', 'confidence', 'heart_rate', 'spo2', 'sys_bp', 'dia_bp', 'temp', 'fall_detection']
            df = df[[c for c in cols if c in df.columns]]
            df.rename(columns=COLUMN_RENAME, inplace=True)
            
            if "Confidence" in df.columns:
                df["Confidence"] = df["Confidence"].apply(lambda x: f"{x*100:.1f}%" if x <= 1 else f"{x:.1f}%")
            
            def color_by_diagnosis(row):
                diagnosis = row.get("Diagnosis", "")
                style_str = DISEASE_COLORS.get(diagnosis, "")
                return [style_str] * len(row)
            
            styled = df.style.apply(color_by_diagnosis, axis=1)
            
            st.dataframe(styled, width="stretch", height=600)
            st.caption(f"Showing {len(df)} records. Auto-refreshing every 5s.")
        else:
            st.error("API Error")
    except Exception as e:
        st.error(f"Failed to fetch history: {e}")

live_history_table()
