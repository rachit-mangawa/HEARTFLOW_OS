import pytest
import numpy as np
import os
import sys
from unittest.mock import patch, MagicMock

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))
from ensemble import EnsembleModel

@patch('joblib.load')
@patch('os.path.exists')
def test_ensemble_initialization(mock_exists, mock_load):
    mock_exists.return_value = True
    
    mock_model = MagicMock()
    mock_load.return_value = mock_model
    
    ensemble = EnsembleModel()
    
    assert len(ensemble.models) == len(ensemble.model_names)
    assert 'rf' in ensemble.models
    assert 'logreg' in ensemble.models

@patch('joblib.load')
@patch('os.path.exists')
def test_ensemble_prediction(mock_exists, mock_load):
    mock_exists.return_value = True
    
    mock_model = MagicMock()
    mock_model.predict_proba.return_value = np.array([[0.2, 0.8]])
    
    mock_label_encoder = MagicMock()
    mock_label_encoder.inverse_transform.side_effect = lambda x: [f"Class_{i}" for i in x]
    
    def side_effect(path):
        if 'label_encoder' in path:
            return mock_label_encoder
        return mock_model
        
    mock_load.side_effect = side_effect
    
    ensemble = EnsembleModel()
    X_dummy = np.array([[1.0, 2.0, 3.0, 4.0, 5.0, 1.0]])
    final_pred, confidence, individual_preds, class_probs, weights, individual_conf = ensemble.predict(X_dummy)
    
    assert confidence == 0.8
    assert final_pred == "Class_1"
    assert "Class_0" in class_probs
    assert class_probs["Class_1"] == 0.8
