# TinyML Healthcare Monitoring System

A structurally refactored, containerized Microservices architecture simulating an Edge-AI environment. 
This repository implements a lightweight ensemble (KNN, SVM, LogReg, RF, Small NN) on a simulated patient telemetry dataset to identify disease anomalies in real-time.

---

## 🏃 Requirements

- Docker (recommended for 1-click deployment)
- Python 3.10+ (if running natively)

---

## ▶️ Run Instructions

### 1. 🐳 Docker (MANDATORY & RECOMMENDED)

You can launch the entire stack (FastAPI Backend + Streamlit Frontend) synchronously via Compose:
```bash
docker-compose build
docker-compose up -d
```
The Frontend operates at `http://localhost:8501`.
The Backend API operates at `http://localhost:8000`.

### 2. 💻 Local Native Execution

If you prefer operating without Docker, you will need two separate terminal windows.

#### First Terminal (Backend)
Navigate into the backend and start the uvicorn service:
```bash
cd backend
python -m pip install -r requirements.txt
python models.py  # Compile baseline models if not already built in /model/
uvicorn main:app --host 0.0.0.0 --port 8000
```

#### Second Terminal (Frontend)
Navigate into the frontend and start Streamlit:
```bash
cd frontend
python -m pip install -r requirements.txt
streamlit run app.py
```

### 3. 🚀 Deployment Instructions (Render / Railway)

Because of the architectural separation, deploying to platforms like **Render** or **Railway** is exceptionally robust:

**Railway Approach:**
1. Connect your GitHub repository to Railway.
2. Railway will automatically detect the `docker-compose.yml` file and attempt to provision 2 individual services corresponding to the frontend and backend Dockerfiles.
3. Simply ensure that the environment variable `API_URL` on the frontend service is pointed to the public domain dynamically assigned to your backend service (e.g., `https://backend-production-xyz.up.railway.app`).

**Render Approach:**
1. Create a new "Web Service" for the Backend. 
   - Root Directory: `backend/`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
2. Create a second "Web Service" for the Frontend.
   - Root Directory: `frontend/`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `streamlit run app.py --server.port $PORT`
   - Environment Variable: Set `API_URL` to your backend's Render assigned URL.

---

## ⚙️ CI/CD

A Github Actions Integration is bundled directly mapping to `.github/workflows/ci.yml`. This automatically tests dependency builds on Push actions to `main` branch. 
