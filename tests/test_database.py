import pytest
import pytest_asyncio
import os
import aiosqlite
from collections import namedtuple
import heartflow_backend.database as database

database.settings.hf_token = None
ORIGINAL_DB_PATH = database.DB_PATH

@pytest_asyncio.fixture(autouse=True)
async def setup_teardown(tmp_path):
    test_db = str(tmp_path / "test_patient_history.db")
    database.DB_PATH = test_db
    if os.path.exists(test_db):
        os.remove(test_db)
    await database.init_db()
    yield
    if os.path.exists(test_db):
        try:
            os.remove(test_db)
        except PermissionError:
            pass
    database.DB_PATH = ORIGINAL_DB_PATH

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
