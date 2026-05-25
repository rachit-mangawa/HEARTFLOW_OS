@echo off
echo ==============================================
echo TinyML Dashboard Launch Sequence
echo ==============================================

echo [1/3] Installing/Verifying Dependencies...
echo Backend (uv)...
if not exist "backend\.venv" (
    uv venv --python 3.11 backend\.venv
)
call backend\.venv\Scripts\activate.bat
uv pip install -r backend\requirements.txt

echo Frontend (npm)...
cd frontend
call npm install
cd ..

echo [2/3] Spinning up FastAPI Backend...
echo Clearing previous instances on port 8000 (if any)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
start /B "TinyML Backend" cmd /c "cd backend && call .venv\Scripts\activate.bat && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo [3/3] Launching Next.js Frontend...
echo Clearing previous instances on port 3000 (if any)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
cd frontend
npm run dev
