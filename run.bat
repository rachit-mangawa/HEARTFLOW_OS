@echo off
echo ==============================================
echo HeartFlow OS Dev Launch Sequence
echo ==============================================

echo [1/3] Verifying Backend Environment...
if not exist "backend\.venv" (
    uv venv --python 3.11 backend\.venv
)
call backend\.venv\Scripts\activate.bat
uv pip install -e backend

echo [2/3] Checking Port 8000 and Launching Backend...
netstat -ano | findstr ":8000.*LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Port 8000 is already in use. Assuming backend is running.
) else (
    echo Starting backend/dev.py on 127.0.0.1:8000...
    start "HeartFlow Backend" cmd /c "call backend\.venv\Scripts\activate.bat && python backend\dev.py"
)

echo [3/3] Checking Frontend Dependencies and Launching...
cd frontend
if not exist "node_modules" (
    echo Installing node_modules...
    call npm install
)

echo Opening browser at http://localhost:3000...
start http://localhost:3000

echo Starting Next.js Dev Server...
npm run dev
