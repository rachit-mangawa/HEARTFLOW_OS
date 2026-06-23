import streamlit as st
import requests
import os

st.set_page_config(page_title="Predict Patient Health", page_icon="🩺", layout="wide")
API_URL = os.getenv("API_URL", "http://localhost:8000")

st.title("🩺 Patient Edge Prediction Simulation")

st.markdown("""
<style>
div[data-testid="stMetricValue"] {
    font-size: 1.5rem;
}
.red-card {
    background-color: rgba(255, 0, 0, 0.2);
    padding: 15px;
    border-radius: 10px;
    border: 1px solid red;
}
.green-card {
    background-color: rgba(0, 255, 0, 0.2);
    padding: 15px;
    border-radius: 10px;
    border: 1px solid green;
}
</style>
""", unsafe_allow_html=True)

col1, col2 = st.columns(2)
with col1:
    hr = st.slider("Heart Rate (bpm)", 40.0, 200.0, 75.0)
    spo2 = st.slider("SpO2 Level (%)", 70.0, 100.0, 98.0)
    sys_bp = st.slider("Systolic BP (mmHg)", 70.0, 200.0, 120.0)

with col2:
    dia_bp = st.slider("Diastolic BP (mmHg)", 40.0, 130.0, 80.0)
    tmp = st.slider("Body Temp (°C)", 34.0, 42.0, 37.0)
    fall = st.selectbox("Fall Detection", ["No", "Yes"])

if st.button("Query Edge AI Ensemble", type="primary"):
    payload = {
        "Heart_Rate": hr,
        "SpO2_Level": spo2,
        "Systolic_BP": sys_bp,
        "Diastolic_BP": dia_bp,
        "Body_Temp": tmp,
        "Fall_Detection": fall
    }
    
    with st.spinner("Processing through TinyML Nodes..."):
        try:
            resp = requests.post(f"{API_URL}/predict", json=payload, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                if "error" in data:
                    st.error(data["error"])
                else:
                    st.markdown("---")
                    res_col1, res_col2 = st.columns(2)
                    label = data['prediction_label']
                    conf = data['probability'] * 100
                    
                    with res_col1:
                        if data['prediction'] == 0:
                            st.markdown(f'<div class="green-card"><h3>Status: {label}</h3></div>', unsafe_allow_html=True)
                        else:
                            st.markdown(f'<div class="red-card"><h3>Status: {label} (At Risk)</h3></div>', unsafe_allow_html=True)
                        st.progress(int(conf))
                        st.write(f"**Ensemble Confidence:** {conf:.1f}%")
                        
                    with res_col2:
                        st.markdown("#### Individual Node Consensus & Weights")
                        for model, pred in data['model_outputs'].items():
                            wgt = data.get('weights', {}).get(model, 0)
                            prob = data.get('model_probs', {}).get(model, 0) * 100
                            cstat = "green" if pred == "Healthy" else "red"
                            st.markdown(f"**[{model.upper()}] Weight: {wgt:.2f}** ➔ :{cstat}[{pred}]")
                            st.progress(int(prob))
                            st.caption(f"Node Confidence: {prob:.1f}%")
            else:
                st.error("API returned an error code.")
        except Exception as e:
            st.error(f"Failed to connect to backend: {e}")
