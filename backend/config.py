import os

class Settings:
    app_name: str = "TinyML Core API"
    host: str = "0.0.0.0"
    port: int = int(os.getenv("PORT", "8000"))
    hf_token: str | None = os.getenv("HF_TOKEN")
    db_name: str = os.getenv("DB_NAME", "patient_history.db")
    repo_id: str = os.getenv("REPO_ID", "IDKHowToCodeFr/tinyml-logs")

settings = Settings()
