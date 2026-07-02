import streamlit as st
import pandas as pd
import plotly.express as px
import numpy as np
import os

st.set_page_config(page_title="Advanced Analytics", page_icon="📊", layout="wide")
st.title("📊 Population Analytics Deep Dive")

@st.cache_data
def load_data():
    path = '/app/data/Synthetic_patient-HealthCare-Monitoring_dataset.csv' if os.path.exists('/app/data') else '../data/Synthetic_patient-HealthCare-Monitoring_dataset.csv' if os.path.exists('../data') else 'data/Synthetic_patient-HealthCare-Monitoring_dataset.csv'
    if not os.path.exists(path):
        return pd.DataFrame()
    return pd.read_csv(path)

full_df = load_data()

if full_df.empty:
    st.warning("Warning: Dataset not found in `/data`. Connect the volume to view analytics.")
else:
    df = full_df.head(500)
    st.success(f"Displaying analytics for first {len(df)} records of all {len(full_df)} available records.")
    
    # Feature Correlation Heatmap
    st.markdown("### Feature Matrix Correlation Heatmap")
    numeric_df = df.select_dtypes(include=['float64', 'int64'])
    corr = numeric_df.corr()
    fig_heat = px.imshow(corr, text_auto=".2f", aspect="auto", template="plotly_dark", color_continuous_scale="RdBu_r")
    st.plotly_chart(fig_heat, use_container_width=True)
    
    st.markdown("---")
    
    c1, c2 = st.columns(2)
    with c1:
        fig = px.scatter(df, x="Heart Rate (bpm)", y="SpO2 Level (%)", color="Predicted Disease", title="HR vs SpO2 Distribution")
        st.plotly_chart(fig, use_container_width=True)
        
    with c2:
        fig2 = px.histogram(df, x="Body Temperature (°C)", color="Predicted Disease", title="Temperature Distributions")
        st.plotly_chart(fig2, use_container_width=True)
        
    st.markdown("### Patient Specific Time-Series Simulation")
    p_id = st.selectbox("Select Patient to view pseudo time-series profile:", df['Patient Number'].unique()[:50])
    if p_id:
        patient_data = df[df['Patient Number'] == p_id].iloc[0]
        st.write(f"**Patient Disease State**: {patient_data['Predicted Disease']}")
        
        # Simulate pseudo time series data for this patient (Unique randomness per patient)
        np.random.seed(abs(hash(str(p_id))) % (10**8))
        dates = pd.date_range(end=pd.Timestamp.now(), periods=50, freq='1s')
        base_hr = patient_data['Heart Rate (bpm)']
        
        sim_hr = base_hr + np.random.normal(0, 1.5, 50).cumsum()
        
        fig3 = px.line(x=dates, y=sim_hr, title=f"Real-time Simulated Heart Rate Feed for Patient {p_id}")
        fig3.update_traces(line_color='cyan')
        st.plotly_chart(fig3, use_container_width=True)
        
    st.markdown("### Raw Population Data Sample")
    st.dataframe(df)
