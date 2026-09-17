import pytest
import pytest_asyncio
import os
import sys
import aiosqlite
from collections import namedtuple

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))
import database

# Mock settings to avoid real huggingface calls
database.settings.hf_token = None
database.DB_PATH = "test_patient_history.db"

@pytest_asyncio.fixture(autouse=True)
async def setup_teardown():
    if os.path.exists(database.DB_PATH):
        os.remove(database.DB_PATH)
    await database.init_db()
    yield
    if os.path.exists(database.DB_PATH):
        try:
            os.remove(database.DB_PATH)
        except PermissionError:
            pass # Windows file lock fallback

@pytest.mark.asyncio
async def test_init_db():
    assert os.path.exists(database.DB_PATH)
    async with aiosqlite.connect(database.DB_PATH) as db:
        cursor = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='predictions'")
        table = await cursor.fetchone()
        assert table is not None

@pytest.mark.asyncio
async def test_log_and_get_history():
    Data = namedtuple('Data', ['Heart_Rate', 'SpO2_Level', 'Systolic_BP', 'Diastolic_BP', 'Body_Temp'])
    data = Data(80.0, 98.0, 120.0, 80.0, 37.0)
    
    await database.log_prediction(data, "Normal", 0.95)
    
    history = await database.get_history()
    assert len(history) == 1
    assert history[0]['heart_rate'] == 80.0
    assert history[0]['prediction_label'] == "Normal"
    assert history[0]['confidence'] == 0.95

@pytest.mark.asyncio
async def test_empty_history():
    if os.path.exists(database.DB_PATH):
        os.remove(database.DB_PATH)
    history = await database.get_history()
    assert history == []
