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

def test_preprocess_data_training():
    df = pd.DataFrame({
        'Heart Rate (bpm)': [80, 90, np.nan],
        'SpO2 Level (%)': [98, 97, 95],
        'Systolic Blood Pressure (mmHg)': [120, 125, 130],
        'Diastolic Blood Pressure (mmHg)': [80, 85, 90],
        'Body Temperature (°C)': [37.0, 37.2, 37.5],
        'Predicted Disease': ['Normal', 'Asthma', 'Normal']
    })
    
    X, y = preprocess_data(df, is_training=True)
    
    assert not X.isnull().values.any()
    assert len(y) == 3
    assert 'Risk_Severity' in X.columns

def test_preprocess_data_inference():
    df = pd.DataFrame({
        'Heart Rate (bpm)': [100],
        'SpO2 Level (%)': [99],
        'Systolic Blood Pressure (mmHg)': [120],
        'Diastolic Blood Pressure (mmHg)': [80],
        'Body Temperature (°C)': [37.0],
    })
    
    X, y = preprocess_data(df, is_training=False)
    
    assert y is None
    assert 'Risk_Severity' in X.columns
