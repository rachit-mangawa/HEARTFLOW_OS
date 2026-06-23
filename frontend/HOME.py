import streamlit as st
import requests
import json
import os
import time
import pandas as pd
import plotly.graph_objects as go
import numpy as np

API_URL = os.getenv("API_URL", "http://localhost:8000")

st.set_page_config(page_title="TinyML Heart Health Monitoring", page_icon="🫀", layout="wide")

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
html, body, [class*="css"] {
    font-family: 'Inter', sans-serif;
}
div[data-testid="metric-container"] {
    background: rgba(30, 40, 50, 0.4);
    border-radius: 10px;
    padding: 10px 20px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
</style>
""", unsafe_allow_html=True)

st.title("🫀 TinyML Heart Health Monitoring Dashboard")
st.subheader("Edge Intelligence for Real-Time Patient Monitoring")

# Health Check
try:
    resp = requests.get(f"{API_URL}/health", timeout=2)
    status = resp.json().get("status", "Unknown")
    color = "green" if "Healthy" in status else "orange" if "Warning" in status else "red"
except:
    status = "Critical (Offline)"
    color = "red"
    
st.markdown(f"**System Status**: :{color}[{status}]")

st.markdown("---")
st.markdown("### Global System Metrics")

# Simulate live metric drift
np.random.seed(int(time.time() * 10) % 100)
pop_hr = round(85 + np.random.normal(0, 0.5), 1)
pop_o2 = round(97.5 + np.random.normal(0, 0.2), 1)
alerts = 23 + np.random.randint(-2, 3)

col1, col2, col3, col4 = st.columns(4)
col1.metric("Total Patients Active", "60,000", delta="Live Stream Active", delta_color="normal")
col2.metric("Active Alerts", f"{alerts}", delta=f"{alerts-23} from avg", delta_color="inverse")
col3.metric("Avg Pop Heart Rate", f"{pop_hr} bpm", delta=f"{pop_hr-85:.1f} bpm", delta_color="off")
col4.metric("Avg Pop Oxygen Level", f"{pop_o2} %", delta=f"{pop_o2-97.5:.1f} %")

st.markdown("### Live Network Traffic (Nodes Inference Load)")
# Cool plotly graph that looks alive
timestamps = pd.date_range(end=pd.Timestamp.now(), periods=60, freq='1s')
traffic = np.random.poisson(lam=15, size=60) + np.sin(np.linspace(0, 10, 60)) * 5

fig = go.Figure()
fig.add_trace(go.Scatter(
    x=timestamps, 
    y=traffic, 
    fill='tozeroy', 
    mode='lines', 
    line=dict(color='cyan', width=2),
    name="Req/s"
))
fig.update_layout(
    template="plotly_dark", 
    height=250, 
    margin=dict(l=0, r=0, t=30, b=0),
    title="Inference Requests per Second (Emulated)"
)
st.plotly_chart(fig, use_container_width=True)

st.markdown("---")
st.info("Use the sidebar to navigate between PREDICT Interface, Deep ANALYTICS, and ABOUT Architecture.")

time.sleep(1.5)
st.rerun() # Forces page to refresh loop causing metrics to bounce simulating real-time dashboard updates!
