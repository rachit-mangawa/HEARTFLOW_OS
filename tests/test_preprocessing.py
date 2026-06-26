import pytest
import pandas as pd
import numpy as np
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))
from preprocessing import preprocess_data, resolve_model_dir

def test_resolve_model_dir():
    md = resolve_model_dir()
    assert md.endswith("model")

def test_preprocess_data_training(tmp_path):
    df = pd.DataFrame({
        'Heart Rate (bpm)': [80, 90, np.nan],
        'SpO2 Level (%)': [98, 97, 95],
        'Systolic Blood Pressure (mmHg)': [120, 125, 130],
        'Diastolic Blood Pressure (mmHg)': [80, 85, 90],
        'Body Temperature (°C)': [37.0, 37.2, 37.5],
        'Predicted Disease': ['Normal', 'Asthma', 'Normal']
    })
    
    # Use tmp_path to isolate test artifacts from production models
    X, y = preprocess_data(df, is_training=True, model_dir=str(tmp_path))
    
    assert not X.isnull().values.any()
    assert len(y) == 3
    assert 'Risk_Severity' in X.columns
    assert os.path.exists(os.path.join(str(tmp_path), 'label_encoder.pkl'))

def test_preprocess_data_inference(tmp_path):
    # First fit on dummy data inside tmp_path
    train_df = pd.DataFrame({
        'Heart Rate (bpm)': [80, 90],
        'SpO2 Level (%)': [98, 97],
        'Systolic Blood Pressure (mmHg)': [120, 125],
        'Diastolic Blood Pressure (mmHg)': [80, 85],
        'Body Temperature (°C)': [37.0, 37.2],
        'Predicted Disease': ['Normal', 'Asthma']
    })
    preprocess_data(train_df, is_training=True, model_dir=str(tmp_path))
    
    df = pd.DataFrame({
        'Heart Rate (bpm)': [100],
        'SpO2 Level (%)': [99],
        'Systolic Blood Pressure (mmHg)': [120],
        'Diastolic Blood Pressure (mmHg)': [80],
        'Body Temperature (°C)': [37.0],
    })
    
    X, y = preprocess_data(df, is_training=False, model_dir=str(tmp_path))
    
    assert y is None
    assert 'Risk_Severity' in X.columns

def test_preprocess_data_alias_normalization(tmp_path):
    """Test that schema field names (e.g. Heart_Rate) are automatically normalized without error."""
    df = pd.DataFrame({
        'Heart_Rate': [115],
        'SpO2_Level': [92],
        'Systolic_BP': [145],
        'Diastolic_BP': [92],
        'Body_Temp': [37.4],
    })
    X, y = preprocess_data(df, is_training=False)
    assert 'Risk_Severity' in X.columns
    assert 'Heart Rate (bpm)' in X.columns
    assert not X.isnull().values.any()
