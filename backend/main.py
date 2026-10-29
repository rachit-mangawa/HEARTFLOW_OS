import os
import sys

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from heartflow_backend.router import router

app = FastAPI(
    title="TinyML Healthcare API",
    description="HeartFlow OS Clinical Telemetry and Edge Inference Gateway",
    version="2.0.0",
)

cors_origins_raw = os.environ.get("ALLOWED_ORIGINS", "").strip()
if cors_origins_raw:
    configured_origins = [orig.strip() for orig in cors_origins_raw.split(",") if orig.strip()]
    is_wildcard = "*" in configured_origins
else:
    configured_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://heartflow.vercel.app",
        "https://idkhowtocodefr-hf-backend.hf.space",
    ]
    is_wildcard = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if is_wildcard else configured_origins,
    allow_credentials=not is_wildcard,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

app.add_middleware(SecurityHeadersMiddleware)

@app.get("/")
def read_root():
    return RedirectResponse(url="/docs")

# Mount routes at both root and /heartflow prefix so all legacy and new clients work
app.include_router(router)
app.include_router(router, prefix="/heartflow")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
