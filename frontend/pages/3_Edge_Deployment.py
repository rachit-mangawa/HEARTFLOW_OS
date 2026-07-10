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

model_display_name = st.selectbox("Select Model to Export", list(model_mapping.keys()))
model_choice = model_mapping[model_display_name]

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
                    s1, s2, s3 = st.columns(3)
                    s1.metric("Code Size", f"{len(c_code):,} chars")
                    # If quantized using int8_t instead of double, flash is ~4x smaller.
                    s2.metric("Est. Flash", f"{len(c_code) // (4 if apply_quantization else 1):,} bytes")
                    s3.metric("Quantization", "INT8" if apply_quantization else "FP32")
                    
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
