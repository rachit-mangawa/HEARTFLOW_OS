import streamlit as st
import requests
import os
import plotly.graph_objects as go

st.set_page_config(page_title="Predict Patient Health", page_icon="🩺", layout="wide")
API_URL = os.getenv("API_URL", "http://localhost:8000")

st.title("🩺 Patient Edge Prediction Simulation")

st.markdown("""
<style>
div[data-testid="stMetricValue"] {
    font-size: 1.5rem;
}
.red-card {
    background: rgba(255, 50, 50, 0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 20px;
    border-radius: 15px;
    border: 1px solid rgba(255, 50, 50, 0.3);
    box-shadow: 0 8px 32px 0 rgba(255, 50, 50, 0.2);
}
.green-card {
    background: rgba(50, 255, 100, 0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 20px;
    border-radius: 15px;
    border: 1px solid rgba(50, 255, 100, 0.3);
    box-shadow: 0 8px 32px 0 rgba(50, 255, 100, 0.2);
}
.amber-card {
    background: rgba(255, 180, 50, 0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 20px;
    border-radius: 15px;
    border: 1px solid rgba(255, 180, 50, 0.3);
    box-shadow: 0 8px 32px 0 rgba(255, 180, 50, 0.2);
}
.node-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    margin: 4px 0;
    border-radius: 8px;
    background: rgba(255,255,255,0.04);
    border-left: 3px solid;
}
</style>
""", unsafe_allow_html=True)

# Persist random defaults using session_state keys
import random
if "sl_hr" not in st.session_state:
    st.session_state.sl_hr = float(random.randint(60, 110))
    st.session_state.sl_spo2 = float(random.randint(85, 99))
    st.session_state.sl_sys = float(random.randint(110, 140))
    st.session_state.sl_dia = float(random.randint(70, 90))
    st.session_state.sl_tmp = round(random.uniform(36.0, 38.0), 1)

col1, col2 = st.columns(2)
with col1:
    hr = st.slider("Heart Rate (bpm)", 40.0, 200.0, key="sl_hr")
    spo2 = st.slider("SpO2 Level (%)", 70.0, 100.0, key="sl_spo2")
    sys_bp = st.slider("Systolic BP (mmHg)", 70.0, 200.0, key="sl_sys")

with col2:
    dia_bp = st.slider("Diastolic BP (mmHg)", 40.0, 130.0, key="sl_dia")
    tmp = st.slider("Body Temp (°C)", 34.0, 42.0, key="sl_tmp")
    fall = st.selectbox("Fall Detection", ["No", "Yes"])

MODEL_DISPLAY = {
    "knn": "K-Nearest Neighbors",
    "svm": "Support Vector Machine",
    "logreg": "Logistic Regression",
    "rf": "Random Forest",
    "small_nn": "Neural Network (MLP)"
}

DISEASE_COLORS = {
    "Healthy": "#00cc96",
    "Asthma": "#ab63fa",
    "Diabetes Mellitus": "#ffa15a",
    "Heart Disease": "#ef553b",
    "Hypertension": "#636efa"
}

def render_results(data):
    st.markdown("---")
    label = data['prediction_label']
    conf = data['probability'] * 100
    

    res_col1, res_col2 = st.columns([1, 1])
    
    with res_col1:
        st.markdown("#### 🏥 Diagnosis Status")
        card_color = DISEASE_COLORS.get(label, "#636efa")
        is_healthy = label == "Healthy"
        card_class = "green-card" if is_healthy else "red-card" if label == "Heart Disease" else "amber-card"
        status_text = f"Status: {label}" if is_healthy else f"Status: {label} (At Risk)"
        st.markdown(f'<div class="{card_class}"><h3>{status_text}</h3></div>', unsafe_allow_html=True)
        st.progress(int(conf))
        st.write(f"**Ensemble Confidence:** {conf:.1f}%")
    
    with res_col2:
        st.markdown("#### 🧠 Individual Node Consensus & Weights")
        for model_key, pred in data['model_outputs'].items():
            display_name = MODEL_DISPLAY.get(model_key, model_key.upper())
            wgt = data.get('weights', {}).get(model_key, 0)
            prob = data.get('model_probs', {}).get(model_key, 0) * 100
            pred_color = DISEASE_COLORS.get(pred, "#636efa")
            border_color = "#00cc96" if pred == "Healthy" else "#ef553b"
            st.markdown(
                f'<div class="node-row" style="border-left-color: {border_color};">'
                f'<span><strong>{display_name}</strong> (w={wgt:.2f})</span>'
                f'<span style="color: {pred_color}; font-weight: bold;">{pred} ({prob:.0f}%)</span>'
                f'</div>',
                unsafe_allow_html=True
            )
    
    # SHAP Explainability Section
    with st.expander("🔍 Explain AI Prediction (SHAP Explainability)", expanded=False):
        st.markdown("##### How each vital sign influenced the AI's decision:")
        try:
            exp_resp = requests.post(f"{API_URL}/explain", json=payload, timeout=10)
            if exp_resp.status_code == 200:
                exp_data = exp_resp.json()
                if "error" in exp_data:
                    st.warning(exp_data["error"])
                else:
                    shap_vals = exp_data["shap_values"]
                    feat_names = exp_data["feature_names"]
                    
                    # Clean up feature names for display
                    clean_names = []
                    for f in feat_names:
                        f = f.replace(" (bpm)", "").replace(" (%)", "").replace(" (mmHg)", "").replace(" (°C)", "")
                        clean_names.append(f)
                    
                    # Sort by absolute value for visual impact
                    sorted_pairs = sorted(zip(clean_names, shap_vals), key=lambda x: abs(x[1]))
                    s_names, s_vals = zip(*sorted_pairs)
                    
                    colors = ['#ef553b' if v > 0 else '#00cc96' for v in s_vals]
                    
                    fig = go.Figure(go.Bar(
                        x=list(s_vals),
                        y=list(s_names),
                        orientation='h',
                        marker=dict(
                            color=colors,
                            line=dict(width=1, color='rgba(255,255,255,0.2)')
                        ),
                        text=[f"{v:+.4f}" for v in s_vals],
                        textposition='outside',
                        textfont=dict(color='white', size=11)
                    ))
                    fig.update_layout(
                        title=dict(text=f"Feature Impact on '{label}' Prediction", font=dict(color='white', size=16)),
                        xaxis_title="SHAP Value (←Reduces Risk | Increases Risk→)",
                        yaxis_title="",
                        template="plotly_dark",
                        height=350,
                        margin=dict(l=10, r=80, t=50, b=50),
                        paper_bgcolor='rgba(0,0,0,0)',
                        plot_bgcolor='rgba(0,0,0,0)',
                        xaxis=dict(zeroline=True, zerolinecolor='rgba(255,255,255,0.3)', zerolinewidth=2, gridcolor='rgba(255,255,255,0.07)'),
                        yaxis=dict(gridcolor='rgba(255,255,255,0.07)')
                    )
                    
                    st.plotly_chart(fig, use_container_width=True)
                    
                    # ──── Detailed Key Insights Panel ────
                    st.markdown("---")
                    st.markdown("##### 📊 Key Insights — Clinical Explainability Report")

                    # Sort features by absolute SHAP impact
                    paired = list(zip(feat_names, shap_vals))
                    paired_sorted = sorted(paired, key=lambda x: abs(x[1]), reverse=True)
                    risk_factors = [(n, v) for n, v in paired_sorted if v > 0.001]
                    protective = [(n, v) for n, v in paired_sorted if v < -0.001]
                    total_push = sum(v for _, v in paired)
                    risk_direction = "toward a clinical condition" if total_push > 0 else "toward a healthy classification"

                    ins_c1, ins_c2 = st.columns(2)

                    with ins_c1:
                        st.markdown("**🔴 Risk-Increasing Factors**")
                        if risk_factors:
                            for name, val in risk_factors:
                                pct = abs(val) / max(sum(abs(v) for _, v in paired), 1e-9) * 100
                                st.markdown(
                                    f'<div style="background:rgba(239,85,59,0.08);border-left:3px solid #ef553b;'
                                    f'padding:8px 12px;border-radius:6px;margin:4px 0;">'
                                    f'<strong>{name}</strong><br>'
                                    f'<span style="color:#ef553b;">SHAP +{val:.4f}</span> '
                                    f'<span style="color:rgba(255,255,255,0.4);">({pct:.0f}% of total impact)</span>'
                                    f'</div>',
                                    unsafe_allow_html=True
                                )
                        else:
                            st.caption("No features significantly increasing risk.")

                    with ins_c2:
                        st.markdown("**🟢 Protective Factors**")
                        if protective:
                            for name, val in protective:
                                pct = abs(val) / max(sum(abs(v) for _, v in paired), 1e-9) * 100
                                st.markdown(
                                    f'<div style="background:rgba(0,204,150,0.08);border-left:3px solid #00cc96;'
                                    f'padding:8px 12px;border-radius:6px;margin:4px 0;">'
                                    f'<strong>{name}</strong><br>'
                                    f'<span style="color:#00cc96;">SHAP {val:.4f}</span> '
                                    f'<span style="color:rgba(255,255,255,0.4);">({pct:.0f}% of total impact)</span>'
                                    f'</div>',
                                    unsafe_allow_html=True
                                )
                        else:
                            st.caption("No features significantly reducing risk.")

                    # Overall clinical summary
                    top_feat, top_val = paired_sorted[0]
                    second_feat = paired_sorted[1][0] if len(paired_sorted) > 1 else None
                    top_dir = "increasing" if top_val > 0 else "decreasing"

                    summary_parts = [
                        f"The ensemble model's decision was primarily driven by **{top_feat}** "
                        f"(SHAP {top_val:+.4f}), which had the strongest influence in {top_dir} the risk score.",
                    ]
                    if second_feat:
                        s_val = paired_sorted[1][1]
                        s_dir = "increasing" if s_val > 0 else "decreasing"
                        summary_parts.append(
                            f"The second most influential factor was **{second_feat}** "
                            f"(SHAP {s_val:+.4f}), {s_dir} risk."
                        )
                    summary_parts.append(
                        f"Overall, the net SHAP push ({total_push:+.4f}) points **{risk_direction}** "
                        f"for the given vitals."
                    )
                    if risk_factors and protective:
                        summary_parts.append(
                            f"The model identified {len(risk_factors)} risk-increasing and "
                            f"{len(protective)} protective factor(s), indicating a mixed clinical profile "
                            f"that warrants attention to the dominant contributors."
                        )

                    st.info("💡 **Clinical Interpretation:**\n\n" + " ".join(summary_parts))
        except Exception as e:
            st.error(f"Failed to fetch explanation: {e}")


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
                    render_results(data)
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
                eng = EnsembleModel()
                final_pred, conf, ind_preds, ind_probs, weights = eng.predict(X_proc)
                
                data = {
                    "prediction": 0 if final_pred == "Healthy" else 1,
                    "prediction_label": final_pred,
                    "probability": float(conf),
                    "model_outputs": ind_preds,
                    "model_probs": {k: float(max(v)) for k, v in ind_probs.items()},
                    "weights": weights
                }
                
                st.markdown("---")
                st.info("☁️ **Cloud Mode (Fallback)**: Processed via Monolithic Native Architecture.")
                render_results(data)
                        
            except Exception as inner_e:
                st.error(f"Monolithic execution failed: {inner_e}")
                
        except Exception as e:
            st.error(f"Failed to process Request context: {e}")
