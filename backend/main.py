import os
import sys
import time
import threading
from collections import defaultdict

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
from heartflow_backend.router import router

app = FastAPI(
    title="HEARTFLOW_OS API",
    description="HeartFlow OS Clinical Telemetry and Edge Inference Gateway",
    version="1.2.0",
    docs_url="https://rachit-mangawa.github.io/HEARTFLOW_OS/docs",
    redoc_url=None,
    openapi_url=None,
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
        "https://idkhowtocodefr-hf-backend.hf.space",
        "https://rachit-mangawa.github.io",
        "http://testserver",
    ]
    is_wildcard = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if is_wildcard else configured_origins,
    allow_credentials=not is_wildcard,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
        response.headers["Permissions-Policy"] = (
            "accelerometer=(), autoplay=(), camera=(), encrypted-media=(), "
            "fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), "
            "microphone=(), midi=(), payment=(), sync-xhr=(), usb=()"
        )
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

app.add_middleware(SecurityHeadersMiddleware)

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 300):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.clients = defaultdict(list)
        self.lock = threading.Lock()

    async def dispatch(self, request: Request, call_next):
        if os.environ.get("P1_RATE_LIMIT_ENABLED", "1") == "0":
            return await call_next(request)

        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        window_start = now - 60.0

        path = request.url.path
        limit = self.requests_per_minute
        if path.endswith("/retrain"):
            limit = 10
        elif path.endswith("/explain"):
            limit = 60

        with self.lock:
            valid_timestamps = [t for t in self.clients[client_ip] if t > window_start]
            if len(valid_timestamps) >= limit:
                return JSONResponse(
                    status_code=429,
                    headers={"Retry-After": "60"},
                    content={"detail": "Rate limit exceeded. Please wait before retrying."}
                )
            valid_timestamps.append(now)
            self.clients[client_ip] = valid_timestamps

        return await call_next(request)

app.add_middleware(RateLimitMiddleware)

@app.get("/")
def read_root():
    return {
        "service": "HeartFlow OS Clinical Telemetry Gateway",
        "status": "Online",
        "version": "1.2.0",
        "docs": "https://rachit-mangawa.github.io/HEARTFLOW_OS/docs",
    }

# Mount all API routes strictly under the /heartflow namespace
app.include_router(router, prefix="/heartflow")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    reload_env = os.environ.get("RELOAD", "true").lower() in ("true", "1", "yes")
    if reload_env:
        uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True, reload_dirs=[backend_dir])
    else:
        uvicorn.run(app, host="0.0.0.0", port=port)
