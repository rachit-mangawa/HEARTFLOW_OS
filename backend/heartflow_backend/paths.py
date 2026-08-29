import os
import tempfile
from pathlib import Path

ASSETS_DIR = Path(__file__).parent / "assets"

def get_p1_dir() -> Path:
    p = Path(tempfile.gettempdir()) / "p1"
    os.makedirs(p, exist_ok=True)
    return p

def get_db_path() -> str:
    return str(get_p1_dir() / "patient_history.db")

def resolve_model_path(filename: str) -> str:
    p1_file = get_p1_dir() / filename
    if p1_file.exists():
        return str(p1_file)
    return str(ASSETS_DIR / filename)

def resolve_model_dir() -> str:
    p1_dir = get_p1_dir()
    if any(p1_dir.glob("*.pkl")):
        return str(p1_dir)
    return str(ASSETS_DIR)

def resolve_dataset_path() -> str:
    p1_file = get_p1_dir() / "patient_dataset.csv"
    if p1_file.exists():
        return str(p1_file)
    return str(ASSETS_DIR / "patient_dataset.csv")
