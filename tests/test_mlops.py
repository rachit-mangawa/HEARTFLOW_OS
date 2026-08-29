import pytest
import pandas as pd
from heartflow_backend.mlops import MLOpsEngine, RetrainResult, COLUMN_ALIASES, CANONICAL_COLUMNS

@pytest.fixture
def mlops_engine(tmp_path):
    dataset_file = str(tmp_path / "test_dataset.csv")
    engine = MLOpsEngine(dataset_file)
    return engine

def test_normalize_batch_alias_resolution(mlops_engine):
    raw_df = pd.DataFrame({
        'HR': [78, 85],
        'OXYGEN': [99, 96],
        'sys_bp': [122, 130],
        'dia_bp': [82, 85],
        'temp': [37.1, 37.3],
        'DIAGNOSIS': ['Healthy', 'Hypertension']
    })
    
    normalized = mlops_engine.normalize_batch(raw_df)
    
    assert 'Heart Rate (bpm)' in normalized.columns
    assert 'SpO2 Level (%)' in normalized.columns
    assert 'Systolic Blood Pressure (mmHg)' in normalized.columns
    assert 'Diastolic Blood Pressure (mmHg)' in normalized.columns
    assert 'Body Temperature (°C)' in normalized.columns
    assert 'Predicted Disease' in normalized.columns
    assert normalized['Predicted Disease'].iloc[0] == 'Healthy'

def test_normalize_batch_degree_encoding_repair(mlops_engine):
    raw_df = pd.DataFrame({
        'Heart Rate': [80],
        'SpO2 Level': [98],
        'Systolic BP': [120],
        'Diastolic BP': [80],
        'Body Temperature (\ufffdC)': [36.8],
        'Condition': ['Healthy']
    })
    
    normalized = mlops_engine.normalize_batch(raw_df)
    assert 'Body Temperature (°C)' in normalized.columns
    assert normalized['Body Temperature (°C)'].iloc[0] == 36.8

def test_normalize_batch_auto_populates_canonical_columns(mlops_engine):
    raw_df = pd.DataFrame({
        'heart_rate': [90],
        'spo2_level': [97],
        'systolic_bp': [135],
        'diastolic_bp': [88],
        'body_temp': [37.0]
    })
    
    normalized = mlops_engine.normalize_batch(raw_df)
    assert 'Patient Number' in normalized.columns
    assert 'Data Accuracy (%)' in normalized.columns
    assert 'Fall Detection' in normalized.columns
    assert 'Heart Rate Alert' in normalized.columns
    assert 'Predicted Disease' in normalized.columns
    assert normalized['Predicted Disease'].iloc[0] == 'Healthy'

def test_normalize_batch_missing_required_signals_raises_error(mlops_engine):
    raw_df = pd.DataFrame({
        'Heart Rate (bpm)': [80],
        'SpO2 Level (%)': [98]
    })
    
    with pytest.raises(ValueError) as excinfo:
        mlops_engine.normalize_batch(raw_df)
    assert "Missing required physiological signals" in str(excinfo.value)

def test_normalize_batch_drops_all_nan_rows(mlops_engine):
    raw_df = pd.DataFrame({
        'Heart Rate (bpm)': [80, None],
        'SpO2 Level (%)': [98, None],
        'Systolic Blood Pressure (mmHg)': [120, None],
        'Diastolic Blood Pressure (mmHg)': [80, None],
        'Body Temperature (°C)': [37.0, None],
        'Predicted Disease': ['Normal', 'Normal']
    })
    
    normalized = mlops_engine.normalize_batch(raw_df)
    assert len(normalized) == 1

def test_ingest_batch_sync_empty_csv(mlops_engine):
    empty_csv = b""
    result = mlops_engine.ingest_batch_sync(empty_csv)
    assert isinstance(result, RetrainResult)
    assert not result.success
    assert "failed" in result.message.lower() or "no valid" in result.message.lower()
