import subprocess
import os
import sys
import time

# 1. Start FastAPI backend in background
print("Starting FastAPI backend...")
backend_process = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
)

# Give backend some time to start
time.sleep(5)

# 2. Start Streamlit frontend
print("Starting Streamlit frontend...")
os.environ["API_URL"] = "http://localhost:8000"
subprocess.run(
    ["streamlit", "run", "frontend/Home.py", "--server.port", "7860", "--server.address", "0.0.0.0"]
)
