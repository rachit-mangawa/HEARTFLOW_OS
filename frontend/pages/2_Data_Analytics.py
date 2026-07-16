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

@st.cache_data(ttl=3600)
def load_data():
    try:
        resp = requests.get(f"{API_URL}/dataset", timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list):
                return pd.DataFrame(data)
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
    
    # ... rest of the file stays same ...
    st.markdown("### 🫀 Vital Signs Distribution by Condition")
    vitals = ["Heart Rate (bpm)", "SpO2 Level (%)", "Systolic Blood Pressure (mmHg)", "Diastolic Blood Pressure (mmHg)", "Body Temperature (°C)"]
    selected_vital = st.selectbox("Select Vital Sign", vitals)
    
    fig_box = px.box(
        df, x="Predicted Disease", y=selected_vital,
        color="Predicted Disease",
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
        fig_scatter = px.scatter(
            df, x="Heart Rate (bpm)", y="SpO2 Level (%)",
            color="Predicted Disease",
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
        
    with c2:
        st.markdown("##### Temperature by Condition (Violin Plot)")
        fig_violin = px.violin(
            df, x="Predicted Disease", y="Body Temperature (°C)",
            color="Predicted Disease",
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
    
    st.markdown("---")
    
    c3, c4 = st.columns(2)
    with c3:
        st.markdown("##### 🏥 Disease Distribution (Population Count)")
        counts = df["Predicted Disease"].value_counts().reset_index()
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
        fig_density = px.density_heatmap(
            df, x="Systolic Blood Pressure (mmHg)", y="Diastolic Blood Pressure (mmHg)",
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
    
    st.markdown("---")
    st.markdown("### 📈 Patient-Specific Real-Time Monitoring")
    p_id = st.selectbox("Select Patient ID to view live telemetry:", df['Patient Number'].unique()[:50])
    if p_id:
        patient_data = df[df['Patient Number'] == p_id].iloc[0]
        disease = patient_data['Predicted Disease']
        d_color = DISEASE_COLORS.get(disease, "#636efa")
        st.markdown(f"**Patient Condition:** <span style='color:{d_color}; font-weight:bold'>{disease}</span>", unsafe_allow_html=True)
        
        periods = 60
        dates = pd.date_range(end=pd.Timestamp.now(), periods=periods, freq='25s')
        base_hr = patient_data['Heart Rate (bpm)']
        base_spo2 = patient_data['SpO2 Level (%)']
        base_temp = patient_data['Body Temperature (°C)']
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
