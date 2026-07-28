import streamlit as st
import requests
import os

st.set_page_config(page_title="MLOps Settings", page_icon="🔄", layout="wide")
API_URL = os.getenv("API_URL", "http://localhost:8000")
if "hf.space" in os.getenv("SPACE_ID", ""):
    API_URL = "http://localhost:8000"

st.title("🔄 MLOps & Retraining")
st.markdown("Dynamically update the TinyML ensemble models by providing a new dataset.")

st.info("Upload a CSV file with the standard clinical schema to retrain all models on the fly.")

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
