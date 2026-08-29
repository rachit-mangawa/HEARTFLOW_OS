import os

class Settings:
    app_name: str = "TinyML Core API"
    host: str = "0.0.0.0"
    port: int = int(os.getenv("PORT", "8000"))
    db_name: str = os.getenv("DB_NAME", "patient_history.db")
    hf_token: str | None = None

settings = Settings()
