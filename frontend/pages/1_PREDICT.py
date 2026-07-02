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
        except requests.exceptions.ConnectionError:
            try:
                import sys
                import os
                import pandas as pd
                
                backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend'))
                if backend_path not in sys.path:
                    sys.path.append(backend_path)
                    
                from ensemble import EnsembleModel
                from preprocessing import preprocess_data
                
                df_simulate = pd.DataFrame([{
                    "Heart Rate (bpm)": payload["Heart_Rate"],
                    "SpO2 Level (%)": payload["SpO2_Level"],
                    "Systolic Blood Pressure (mmHg)": payload["Systolic_BP"],
                    "Diastolic Blood Pressure (mmHg)": payload["Diastolic_BP"],
                    "Body Temperature (°C)": payload["Body_Temp"],
                    "Fall Detection": payload["Fall_Detection"]
                }])
                
                X_proc, _ = preprocess_data(df_simulate, is_training=False)
                model_dir = os.path.join(backend_path, '../model')
                eng = EnsembleModel(models_dir=model_dir)
                final_pred, conf, ind_preds, ind_probs, weights = eng.predict(X_proc)
                
                # Mock the FastAPI return schema 
                data = {
                    "prediction": 0 if final_pred == "Healthy" else 1,
                    "prediction_label": final_pred,
                    "probability": float(conf),
                    "model_outputs": ind_preds,
                    "model_probs": {k: float(max(v)) for k, v in ind_probs.items()},
                    "weights": weights
                }
                
                st.markdown("---")
                st.info("☁️ **Streamlit Cloud Mode (Fallback Detected)**: Processed via Monolithic Native Architecture seamlessly!")
                res_col1, res_col2 = st.columns(2)
                label = data['prediction_label']
                conf_val = data['probability'] * 100
                
                with res_col1:
                    if data['prediction'] == 0:
                        st.markdown(f'<div class="green-card"><h3>Status: {label}</h3></div>', unsafe_allow_html=True)
                    else:
                        st.markdown(f'<div class="red-card"><h3>Status: {label} (At Risk)</h3></div>', unsafe_allow_html=True)
                    st.progress(int(conf_val))
                    st.write(f"**Ensemble Confidence:** {conf_val:.1f}%")
                    
                with res_col2:
                    st.markdown("#### Individual Node Consensus & Weights")
                    for model_name, pred_val in data['model_outputs'].items():
                        wgt = data.get('weights', {}).get(model_name, 0)
                        prob_val = data.get('model_probs', {}).get(model_name, 0) * 100
                        cstat = "green" if pred_val == "Healthy" else "red"
                        st.markdown(f"**[{model_name.upper()}] Weight: {wgt:.2f}** ➔ :{cstat}[{pred_val}]")
                        st.progress(int(prob_val))
                        st.caption(f"Node Confidence: {prob_val:.1f}%")
                        
            except Exception as inner_e:
                st.error(f"Monolithic execution failed: {inner_e}")
                
        except Exception as e:
            st.error(f"Failed to process Request context: {e}")
