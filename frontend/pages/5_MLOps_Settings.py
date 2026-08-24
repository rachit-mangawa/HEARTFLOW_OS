import streamlit as st
import requests
import os

st.set_page_config(page_title="MLOps Settings", page_icon="🔄", layout="wide")
API_URL = os.getenv("API_URL", "http://localhost:8000")
if "hf.space" in os.getenv("SPACE_ID", ""):
    API_URL = "http://localhost:8000"

st.title("🔄 MLOps & Retraining")
st.markdown("Dynamically update the TinyML ensemble models by providing a new dataset. The system uses an **append-only** strategy to maintain data integrity.")

with st.expander("📊 Data Submission Guide (Required Schema)", expanded=True):
    st.markdown("""
    To ensure the retraining pipeline succeeds, your CSV **must** include the following columns (case-sensitive):
    
    1.  **Patient Number**: Unique identifier for the patient.
    2.  **Heart Rate (bpm)**: Numeric value.
    3.  **SpO2 Level (%)**: Numeric value.
    4.  **Systolic Blood Pressure (mmHg)**: Numeric value.
    5.  **Diastolic Blood Pressure (mmHg)**: Numeric value.
    6.  **Body Temperature (°C)**: Numeric value.
    7.  **Fall Detection**: 'Yes' or 'No'.
    8.  **Predicted Disease**: The target label (e.g., Healthy, Heart Disease).
    
    *Note: If you submit a file with a different schema, the system will reject the update to prevent dashboard crashes.*
    """)

st.info("💡 **Safety Logic:** New data will be validated and appended to the existing dataset. The original records are always preserved.")

uploaded_file = st.file_uploader("Upload New Patient Dataset (CSV)", type="csv")

if uploaded_file is not None:
    if st.button("Start Retraining Pipeline"):
        with st.spinner("Uploading and retraining ensemble... This may take a minute."):
            try:
                files = {"file": (uploaded_file.name, uploaded_file.getvalue(), "text/csv")}
                resp = requests.post(f"{API_URL}/retrain", files=files, timeout=120)
                if resp.status_code == 200:
                    data = resp.json()
                    if "error" in data:
                        st.error(f"Retraining failed: {data['error']}")
                    else:
                        st.success(data.get("message", "Success!"))
                else:
                    st.error("API returned an error.")
            except Exception as e:
                st.error(f"Connection failed: {e}")
