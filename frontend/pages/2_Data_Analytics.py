import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import numpy as np
import os
import requests

st.set_page_config(page_title="Advanced Analytics", page_icon="📊", layout="wide")
st.title("📊 Population Analytics Deep Dive")

API_URL = os.getenv("API_URL", "http://localhost:8000")
if "hf.space" in os.getenv("SPACE_ID", ""):
    API_URL = "http://localhost:8000"

@st.cache_data(ttl=3600)
def load_data():
    try:
        resp = requests.get(f"{API_URL}/dataset", timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list):
                df = pd.DataFrame(data)
                # Normalize column names: strip whitespace and ensure common naming
                df.columns = [c.strip() for c in df.columns]
                # Fix common encoding issues for temperature
                df.columns = [c.replace('Â°C', '°C') for c in df.columns]
                return df
            st.error(f"Backend Error: {data.get('error', 'Unknown')}")
    except Exception as e:
        st.error(f"Failed to connect to backend: {e}")
    return pd.DataFrame()

DISEASE_COLORS = {
    "Healthy": "#00cc96",
    "Asthma": "#ab63fa",
    "Diabetes Mellitus": "#ffa15a",
    "Heart Disease": "#ef553b",
    "Hypertension": "#636efa"
}

full_df = load_data()

if full_df.empty:
    st.warning("Warning: Dataset not found or backend unreachable. Connect to the API to view analytics.")
else:
    df = full_df
    st.success(f"Loaded **{len(full_df):,}** patient records from backend.")
    
    # ── Safety Check for Column Names ──
    available_cols = df.columns.tolist()
    target_x = "Predicted Disease"
    
    if target_x not in available_cols:
        # Fallback to similar name if exact match fails
        matches = [c for c in available_cols if "Disease" in c or "Condition" in c]
        if matches:
            target_x = matches[0]
        else:
            st.error(f"Required column '{target_x}' missing from dataset. Found: {available_cols}")
            st.stop()

    st.markdown("### 🫀 Vital Signs Distribution by Condition")
    
    # Define possible vitals and filter by what's actually in the DF
    vitals_all = ["Heart Rate (bpm)", "SpO2 Level (%)", "Systolic Blood Pressure (mmHg)", "Diastolic Blood Pressure (mmHg)", "Body Temperature (°C)"]
    vitals = [v for v in vitals_all if v in available_cols]
    
    if not vitals:
        st.error(f"No clinical vital sign columns found in dataset. Found: {available_cols}")
        st.stop()
        
    selected_vital = st.selectbox("Select Vital Sign", vitals)
    
    fig_box = px.box(
        df, x=target_x, y=selected_vital,
        color=target_x,
        color_discrete_map=DISEASE_COLORS,
        title=f"{selected_vital} Distribution Across Conditions",
        template="plotly_dark",
        points="outliers"
    )
    fig_box.update_layout(
        paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
        xaxis_title="Condition", yaxis_title=selected_vital,
        showlegend=False, height=420
    )
    st.plotly_chart(fig_box, use_container_width=True)
    
    st.markdown("---")
    
    c1, c2 = st.columns(2)
    with c1:
        st.markdown("##### Heart Rate vs SpO2 (Scatter Matrix)")
        # Safety check for scatter columns
        x_scatter = "Heart Rate (bpm)" if "Heart Rate (bpm)" in available_cols else None
        y_scatter = "SpO2 Level (%)" if "SpO2 Level (%)" in available_cols else None
        
        if x_scatter and y_scatter:
            fig_scatter = px.scatter(
                df, x=x_scatter, y=y_scatter,
                color=target_x,
                color_discrete_map=DISEASE_COLORS,
                opacity=0.4, size_max=6,
                title="Heart Rate vs SpO2 Levels",
                template="plotly_dark",
                marginal_x="histogram",
                marginal_y="histogram"
            )
            fig_scatter.update_layout(
                paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                height=450, legend=dict(orientation="h", yanchor="bottom", y=-0.35)
            )
            st.plotly_chart(fig_scatter, use_container_width=True)
        else:
            st.warning("Scatter plot unavailable: Required columns missing.")
        
    with c2:
        st.markdown("##### Temperature by Condition (Violin Plot)")
        y_violin = "Body Temperature (°C)" if "Body Temperature (°C)" in available_cols else None
        
        if y_violin:
            fig_violin = px.violin(
                df, x=target_x, y=y_violin,
                color=target_x,
                color_discrete_map=DISEASE_COLORS,
                box=True, points=False,
                title="Body Temperature Distribution",
                template="plotly_dark"
            )
            fig_violin.update_layout(
                paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                height=450, showlegend=False, xaxis_title="Condition", yaxis_title="Temperature (°C)"
            )
            st.plotly_chart(fig_violin, use_container_width=True)
        else:
            st.warning("Violin plot unavailable: Temperature column missing.")
    
    st.markdown("---")
    
    c3, c4 = st.columns(2)
    with c3:
        st.markdown("##### 🏥 Disease Distribution (Population Count)")
        counts = df[target_x].value_counts().reset_index()
        counts.columns = ["Condition", "Patient Count"]
        fig_bar = px.bar(
            counts, x="Condition", y="Patient Count",
            color="Condition",
            color_discrete_map=DISEASE_COLORS,
            title="Patient Count per Condition",
            template="plotly_dark",
            text="Patient Count"
        )
        fig_bar.update_traces(textposition='outside')
        fig_bar.update_layout(
            paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
            height=420, showlegend=False
        )
        st.plotly_chart(fig_bar, use_container_width=True)
    
    with c4:
        st.markdown("##### 🩸 Blood Pressure Density (Systolic vs Diastolic)")
        x_heat = "Systolic Blood Pressure (mmHg)" if "Systolic Blood Pressure (mmHg)" in available_cols else None
        y_heat = "Diastolic Blood Pressure (mmHg)" if "Diastolic Blood Pressure (mmHg)" in available_cols else None
        
        if x_heat and y_heat:
            fig_density = px.density_heatmap(
                df, x=x_heat, y=y_heat,
                color_continuous_scale="Turbo",
                title="Blood Pressure Population Heatmap",
                template="plotly_dark",
                nbinsx=30, nbinsy=30
            )
            fig_density.update_layout(
                paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                height=420
            )
            st.plotly_chart(fig_density, use_container_width=True)
        else:
            st.warning("Density heatmap unavailable: Blood Pressure columns missing.")
    
    st.markdown("---")
    st.markdown("### 📈 Patient-Specific Real-Time Monitoring")
    # Use Patient Number if available
    id_col = "Patient Number" if "Patient Number" in available_cols else available_cols[0]
    p_id = st.selectbox("Select Patient ID to view live telemetry:", df[id_col].unique()[:50])
    
    if p_id:
        patient_data = df[df[id_col] == p_id].iloc[0]
        disease = patient_data[target_x]
        d_color = DISEASE_COLORS.get(disease, "#636efa")
        st.markdown(f"**Patient Condition:** <span style='color:{d_color}; font-weight:bold'>{disease}</span>", unsafe_allow_html=True)
        
        periods = 60
        dates = pd.date_range(end=pd.Timestamp.now(), periods=periods, freq='25s')
        
        # Safe access for real-time emulation
        base_hr = patient_data.get('Heart Rate (bpm)', 75)
        base_spo2 = patient_data.get('SpO2 Level (%)', 98)
        base_temp = patient_data.get('Body Temperature (°C)', 37.0)
        sim_hr = base_hr + np.random.normal(0, 1.2, periods).cumsum()
        sim_spo2 = np.clip(base_spo2 + np.random.normal(0, 0.3, periods).cumsum(), 85, 100)
        sim_temp = base_temp + np.random.normal(0, 0.05, periods).cumsum()
        
        tc1, tc2, tc3 = st.columns(3)
        with tc1:
            fig_hr = go.Figure(go.Scatter(x=dates, y=sim_hr, mode='lines+markers', line=dict(color='#00f2fe', width=2), marker=dict(size=3), name="Heart Rate"))
            fig_hr.update_layout(title="Heart Rate (bpm)", template="plotly_dark", paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', height=280, margin=dict(l=10, r=10, t=40, b=40))
            st.plotly_chart(fig_hr, use_container_width=True)
        with tc2:
            fig_sp = go.Figure(go.Scatter(x=dates, y=sim_spo2, mode='lines+markers', line=dict(color='#00cc96', width=2), marker=dict(size=3), name="SpO2"))
            fig_sp.update_layout(title="SpO2 Level (%)", template="plotly_dark", paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', height=280, margin=dict(l=10, r=10, t=40, b=40))
            st.plotly_chart(fig_sp, use_container_width=True)
        with tc3:
            fig_tp = go.Figure(go.Scatter(x=dates, y=sim_temp, mode='lines+markers', line=dict(color='#ffa15a', width=2), marker=dict(size=3), name="Temperature"))
            fig_tp.update_layout(title="Body Temperature (°C)", template="plotly_dark", paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', height=280, margin=dict(l=10, r=10, t=40, b=40))
            st.plotly_chart(fig_tp, use_container_width=True)
        
    st.markdown("---")
    st.markdown("### 📋 Raw Patient Data")
    st.dataframe(df, use_container_width=True, height=350)
