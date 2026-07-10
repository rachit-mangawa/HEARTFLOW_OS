@echo off
echo ==============================================
echo TinyML Dashboard Launch Sequence
echo ==============================================

echo [1/3] Installing/Verifying Dependencies...
python -m pip install -r backend\requirements.txt
python -m pip install -r frontend\requirements.txt

echo [2/3] Spinning up FastAPI Backend...
echo Clearing previous instances on port 8000 (if any)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
start /B "TinyML Backend" cmd /c "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo [3/3] Launching Streamlit Frontend...
cd frontend
python -m streamlit run HOME.py
