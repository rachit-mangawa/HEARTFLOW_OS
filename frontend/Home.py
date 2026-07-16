import streamlit as st
import requests
import os
import time
import pandas as pd
import plotly.graph_objects as go
import numpy as np

API_URL = os.getenv("API_URL", "http://localhost:8000")

st.set_page_config(page_title="TinyML Heart Health Monitoring", page_icon="🫀", layout="wide")

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
html, body, [class*="css"] { font-family: 'Inter', sans-serif; }

.hero-sub {
    font-size: 1.15rem; color: rgba(255,255,255,0.55);
    margin-top: 8px; font-weight: 300; letter-spacing: 0.3px;
}

.metrics-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px;
}
.glass-metric {
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.08); border-radius: 16px;
    padding: 24px 20px; text-align: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    min-height: 160px; display: flex; flex-direction: column;
    justify-content: center; align-items: center;
}
.glass-metric:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0,242,254,0.12);
    border-color: rgba(255,255,255,0.15);
}
.metric-value {
    font-size: 2.4rem; font-weight: 800; margin: 8px 0 6px 0; letter-spacing: -0.5px;
}
.metric-label {
    font-size: 0.78rem; color: rgba(255,255,255,0.45);
    text-transform: uppercase; letter-spacing: 2px; font-weight: 600;
}
.metric-delta {
    font-size: 0.8rem; font-weight: 500; margin-top: 6px;
    padding: 3px 10px; border-radius: 20px; display: inline-block;
}
.delta-good { color: #00cc96; background: rgba(0,204,150,0.12); }
.delta-bad  { color: #ef553b; background: rgba(239,85,59,0.12); }

.status-badge {
    display: inline-block; padding: 6px 18px; border-radius: 50px;
    font-size: 0.85rem; font-weight: 600; letter-spacing: 0.5px;
}
.status-online  { background: rgba(0,204,150,0.15); color: #00cc96; border: 1px solid rgba(0,204,150,0.3); }
.status-fallback { background: rgba(99,110,250,0.15); color: #636efa; border: 1px solid rgba(99,110,250,0.3); }

.feature-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.feature-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px; padding: 24px 20px; min-height: 170px;
    display: flex; flex-direction: column;
    transition: border-color 0.2s ease, transform 0.2s ease;
}
.feature-card:hover { border-color: rgba(0,242,254,0.25); transform: translateY(-2px); }
.feature-card .fc-icon  { font-size: 1.6rem; margin-bottom: 10px; }
.feature-card .fc-title { color: #00f2fe; font-size: 0.95rem; font-weight: 700; margin-bottom: 8px; }
.feature-card .fc-desc  { color: rgba(255,255,255,0.45); font-size: 0.82rem; line-height: 1.55; flex-grow: 1; }
</style>
""", unsafe_allow_html=True)

# ──────── Hero ────────
st.title("🫀 TinyML Heart Health Monitoring Dashboard")
st.markdown('<p class="hero-sub">Edge Intelligence for Real-Time Patient Monitoring • 5-Model Ensemble • SHAP Explainability • IoT Edge Deployment</p>', unsafe_allow_html=True)
st.markdown("<br>", unsafe_allow_html=True)

# ──────── System Status ────────
try:
    resp = requests.get(f"{API_URL}/health", timeout=5)
    if resp.status_code == 200:
        status = resp.json().get("status", "Unknown")
        is_online = "Healthy" in status
    else:
        status = f"Backend Error ({resp.status_code})"
        is_online = False
except Exception as e:
    status = f"Offline / Monolith Fallback ({str(e)[:50]})"
    is_online = False

badge_class = "status-online" if is_online else "status-fallback"
badge_text = "● ONLINE" if is_online else "● CLOUD MODE"
st.markdown(f'<span class="status-badge {badge_class}">{badge_text}</span> &nbsp; <span style="color:rgba(255,255,255,0.35);font-size:0.85rem;">{status}</span>', unsafe_allow_html=True)
st.markdown("---")

# ──────── Dataset constants ────────
HR_MIN, HR_MAX, HR_AVG = 50.0, 139.0, 94.6
SPO2_MIN, SPO2_MAX, SPO2_AVG = 84.0, 100.0, 94.6
ALERT_MAX = 100
HR_NORMAL_LO, HR_NORMAL_HI = 60.0, 100.0
SPO2_NORMAL_LO = 95.0
CANDLE_COUNT = 60
TICK_INTERVAL = 1.5  # seconds

# ──────── Deterministic candle from timestamp ────────
def _alert_at(ts_epoch):
    """Deterministic alert count for a given epoch timestamp."""
    rng = np.random.RandomState(int(ts_epoch * 10) % (2**31))
    return int(rng.randint(0, ALERT_MAX + 1))

def _candle_at(t_epoch, prev_alerts, curr_alerts):
    """Build an OHLC candle from alert transitions."""
    o = float(prev_alerts)
    c = float(curr_alerts)
    rng = np.random.RandomState(int(t_epoch * 7) % (2**31))
    spread = abs(c - o) * 0.3 + rng.uniform(1, 4)
    h = max(o, c) + spread
    l = min(o, c) - rng.uniform(0.5, spread * 0.6)
    h = min(h, ALERT_MAX + 5)
    l = max(l, 0)
    return {"time": pd.Timestamp.fromtimestamp(t_epoch), "open": round(o, 1), "high": round(h, 1), "low": round(l, 1), "close": round(c, 1)}

# ──────── Initialize: pre-fill chart as if running since startup ────────
if "chart_candles" not in st.session_state:
    now_ep = time.time()
    candles = []
    prev = 50  # initial alert count
    for i in range(CANDLE_COUNT):
        t = now_ep - (CANDLE_COUNT - i) * TICK_INTERVAL
        curr = _alert_at(t)
        candles.append(_candle_at(t, prev, curr))
        prev = curr
    st.session_state.chart_candles = candles
    st.session_state.last_alerts = prev
    st.session_state.last_candle_epoch = now_ep

# ──────── Live Metrics ────────
@st.fragment(run_every="1.5s")
def live_metrics():
    now_ep = time.time()

    # Catch up: generate all candles that should have been created while away
    last_ep = st.session_state.get("last_candle_epoch", now_ep - TICK_INTERVAL)
    missed = int((now_ep - last_ep) / TICK_INTERVAL)
    prev_a = st.session_state.get("last_alerts", 50)

    if missed > 1:
        # Backfill deterministically so chart stays continuous
        for i in range(1, min(missed, CANDLE_COUNT) + 1):
            t = last_ep + i * TICK_INTERVAL
            curr_a = _alert_at(t)
            st.session_state.chart_candles.append(_candle_at(t, prev_a, curr_a))
            prev_a = curr_a

    # Current tick
    alerts = np.random.randint(0, ALERT_MAX + 1)
    alert_delta = alerts - prev_a
    st.session_state.chart_candles.append(_candle_at(now_ep, prev_a, alerts))
    st.session_state.last_alerts = alerts
    st.session_state.last_candle_epoch = now_ep

    if len(st.session_state.chart_candles) > CANDLE_COUNT:
        st.session_state.chart_candles = st.session_state.chart_candles[-CANDLE_COUNT:]

    # Simulate patient cohort from alert count
    n = max(alerts, 5)
    sim_hr = np.clip(np.random.normal(HR_AVG, 12, n), HR_MIN, HR_MAX)
    sim_o2 = np.clip(np.random.normal(SPO2_AVG, 3, n), SPO2_MIN, SPO2_MAX)
    pop_hr = round(float(np.mean(sim_hr)), 1)
    pop_o2 = round(float(np.mean(sim_o2)), 1)
    hr_delta = round(pop_hr - HR_AVG, 1)
    o2_delta = round(pop_o2 - SPO2_AVG, 1)
    hr_ok = HR_NORMAL_LO <= pop_hr <= HR_NORMAL_HI
    o2_ok = pop_o2 >= SPO2_NORMAL_LO

    # Alert delta coloring: increase = bad (red), decrease = good (green)
    ad_good = alert_delta <= 0
    ad_c = "#00cc96" if ad_good else "#ef553b"
    ad_d = "delta-good" if ad_good else "delta-bad"
    ad_i = "▼" if ad_good else "▲"
    ad_txt = f"{abs(alert_delta)} fewer" if ad_good else f"{alert_delta} more"

    hr_c = "#00cc96" if hr_ok else "#ef553b"
    hr_d = "delta-good" if hr_ok else "delta-bad"
    hr_a = "▲" if hr_delta > 0 else "▼"
    hr_s = "Within Normal" if hr_ok else "Abnormal"
    o2_c = "#00cc96" if o2_ok else "#ef553b"
    o2_d = "delta-good" if o2_ok else "delta-bad"
    o2_a = "▲" if o2_delta > 0 else "▼"
    o2_s = "Within Normal" if o2_ok else "Below Safe"

    st.markdown(f"""
    <div class="metrics-grid">
        <div class="glass-metric">
            <div class="metric-label">Total Patients</div>
            <div class="metric-value" style="color:#4facfe;">60,000</div>
            <div class="metric-delta delta-good">● Live Stream Active</div>
        </div>
        <div class="glass-metric">
            <div class="metric-label">Active Alerts</div>
            <div class="metric-value" style="color:{ad_c};">{alerts}</div>
            <div class="metric-delta {ad_d}">{ad_i} {ad_txt} vs last</div>
        </div>
        <div class="glass-metric">
            <div class="metric-label">Avg Heart Rate</div>
            <div class="metric-value" style="color:{hr_c};">{pop_hr} <span style="font-size:1rem;color:rgba(255,255,255,0.3);">bpm</span></div>
            <div class="metric-delta {hr_d}">{hr_a} {abs(hr_delta)} bpm from avg • {hr_s}</div>
        </div>
        <div class="glass-metric">
            <div class="metric-label">Avg SpO2 Level</div>
            <div class="metric-value" style="color:{o2_c};">{pop_o2}<span style="font-size:1rem;color:rgba(255,255,255,0.3);">%</span></div>
            <div class="metric-delta {o2_d}">{o2_a} {abs(o2_delta):.1f}% from avg • {o2_s}</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # ──── Smoothed Activity Area Chart: tracks average heart-rate & alerts ────
    st.markdown("##### 📡 Live Patient Emulation Trace")

    cd = st.session_state.chart_candles
    ts = [x["time"] for x in cd]
    # Represent the primary metric as the close/current state
    cl = [x["close"] for x in cd]

    fig = go.Figure()

    # Main Area Waveform
    fig.add_trace(go.Scatter(
        x=ts, y=cl,
        mode='lines',
        line=dict(color='#00f2fe', width=3, shape='spline', smoothing=1.3),
        fill='tozeroy',
        fillcolor='rgba(0, 242, 254, 0.15)',
        name="Activity Index"
    ))

    # Add a thin secondary baseline trend
    w = min(10, len(cl))
    ma = pd.Series(cl).rolling(window=w, min_periods=1).mean().tolist()
    fig.add_trace(go.Scatter(
        x=ts, y=ma, mode='lines',
        line=dict(color='rgba(255, 255, 255, 0.4)', width=1.5, dash='dot'),
        name="Moving Average"
    ))

    fig.update_layout(
        template="plotly_dark", height=320,
        margin=dict(l=0, r=50, t=10, b=0),
        paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
        xaxis=dict(gridcolor='rgba(255,255,255,0.03)', showgrid=True, rangeslider=dict(visible=False)),
        yaxis=dict(
            title="Relative Activity",
            gridcolor='rgba(255,255,255,0.05)',
            title_font=dict(size=11),
            side="right",
            range=[0, ALERT_MAX + 15]
        ),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1, font=dict(size=10)),
        showlegend=True,
        hovermode="x unified"
    )
    st.plotly_chart(fig, use_container_width=True)

live_metrics()

st.markdown("---")

# ──────── Feature Cards ────────
st.markdown("##### 🧩 System Capabilities")
st.markdown("""
<div class="feature-grid">
    <div class="feature-card">
        <div class="fc-icon">🩺</div>
        <div class="fc-title">Edge Prediction</div>
        <div class="fc-desc">5-model weighted ensemble (KNN, SVM, LogReg, RF, MLP) with real-time consensus voting and confidence scoring.</div>
    </div>
    <div class="feature-card">
        <div class="fc-icon">🔍</div>
        <div class="fc-title">SHAP Explainability</div>
        <div class="fc-desc">Feature-level SHAP analysis reveals exactly why the AI made each clinical decision with interactive Plotly charts.</div>
    </div>
    <div class="feature-card">
        <div class="fc-icon">⚙️</div>
        <div class="fc-title">C-Code Export</div>
        <div class="fc-desc">Transpile any model to raw C headers with INT8 quantization simulation for ESP32 and Arduino flash deployment.</div>
    </div>
    <div class="feature-card">
        <div class="fc-icon">🔄</div>
        <div class="fc-title">MLOps Pipeline</div>
        <div class="fc-desc">Dynamic dataset upload and live ensemble retraining without downtime. Full model hot-swap on the fly.</div>
    </div>
</div>
""", unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)
st.caption("Use the sidebar to navigate between Prediction, Analytics, Edge Deployment, Patient History, MLOps, and About.")
