import streamlit as st
import requests
import os

st.set_page_config(page_title="TinyML Edge Deploy", page_icon="⚙️", layout="wide")
API_URL = os.getenv("API_URL", "http://localhost:8000")

st.title("⚙️ TinyML C-Code Exporter")
st.markdown("Export trained models directly to raw C code for compilation on embedded devices (Arduino, ESP32).")

model_mapping = {
    "Random Forest": "rf",
    "Logistic Regression": "logreg",
    "K-Nearest Neighbors": "knn",
    "Support Vector Machine": "svm",
    "Neural Network (MLP)": "small_nn"
}

hw_mapping = {
    "ESP32 (240 MHz, 520KB SRAM)": {"clock": 240, "ram": 520, "arch": "Xtensa LX6"},
    "Arduino Nano 33 BLE Sense (64 MHz, 256KB SRAM)": {"clock": 64, "ram": 256, "arch": "Cortex-M4F"},
    "STM32 Nucleo (84 MHz, 96KB SRAM)": {"clock": 84, "ram": 96, "arch": "Cortex-M4"},
    "Raspberry Pi Pico (133 MHz, 264KB SRAM)": {"clock": 133, "ram": 264, "arch": "Cortex-M0+"}
}

col_m, col_h = st.columns(2)
with col_m:
    model_display_name = st.selectbox("Select Model to Export", list(model_mapping.keys()))
    model_choice = model_mapping[model_display_name]
with col_h:
    hw_display_name = st.selectbox("Select Target Hardware Profile", list(hw_mapping.keys()))
    hw_choice = hw_mapping[hw_display_name]

st.markdown("---")
st.markdown("##### ⚡ TinyML Optimization Settings")
opt_c1, opt_c2 = st.columns(2)
with opt_c1:
    apply_quantization = st.checkbox("Apply INT8 Weight Quantization", value=True)
with opt_c2:
    strip_comments = st.checkbox("Strip Comments for Minimal Flash Size", value=False)

if st.button("Generate C Code", type="primary"):
    with st.spinner("Transpiling model to C..."):
        try:
            resp = requests.get(f"{API_URL}/export_tinyml", params={"model_name": model_choice, "quantize": apply_quantization}, timeout=15)
            if resp.status_code == 200:
                data = resp.json()
                if "error" in data:
                    st.error(data["error"])
                else:
                    c_code = data["code"]
                    
                    if strip_comments:
                        import re
                        c_code = re.sub(r'/\*.*?\*/', '', c_code, flags=re.DOTALL)
                        c_code = re.sub(r'//.*', '', c_code)
                        c_code = re.sub(r'\n\s*\n', '\n', c_code)
                    
                    st.success(f"✅ Transpilation successful for **{model_display_name}**!")
                    
                    # Show stats
                    s1, s2, s3, s4 = st.columns(4)
                    code_len = len(c_code)
                    est_flash = code_len // (4 if apply_quantization else 1)

                    # Simple heuristic for estimated inference time
                    base_ops = {"rf": 500, "logreg": 20, "knn": 2000, "svm": 100, "small_nn": 800}[model_choice]
                    ops_multiplier = 0.5 if apply_quantization else 1.0
                    est_latency_us = int((base_ops * ops_multiplier) / (hw_choice["clock"] / 10.0))

                    s1.metric("Target Architecture", hw_choice["arch"])
                    s2.metric("Est. Code Flash", f"{est_flash:,} Bytes")
                    s3.metric("Precision", "INT8 (8-bit)" if apply_quantization else "FP32 (64-bit)")
                    s4.metric("Est. Inference Latency", f"~{max(1, est_latency_us)} µs")

                    st.download_button(
                        label="⬇️ Download tinyml_model.h",
                        data=c_code,
                        file_name=f"tinyml_{model_choice}.h",
                        mime="text/plain"
                    )
                    with st.expander("Preview C Code", expanded=True):
                        st.code(c_code, language="c")
            else:
                st.error("API returned an error code.")
        except Exception as e:
            st.error(f"Connection failed: {e}")
