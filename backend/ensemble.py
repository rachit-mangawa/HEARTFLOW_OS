import joblib
import numpy as np
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from preprocessing import resolve_model_dir

class EnsembleModel:
    def __init__(self):
        self.model_dir = resolve_model_dir()
        self.model_names = ['knn', 'svm', 'logreg', 'rf', 'small_nn']
        self.models = {}
        self.load_models()
        self.label_encoder = joblib.load(f'{self.model_dir}/label_encoder.pkl')
        self.weights = {'knn': 0.15, 'svm': 0.15, 'logreg': 0.20, 'rf': 0.25, 'small_nn': 0.25}
        
    def load_models(self):
        for name in self.model_names:
            path = f'{self.model_dir}/{name}.pkl'
            if os.path.exists(path):
                self.models[name] = joblib.load(path)
                
    def predict(self, X):
        individual_preds = {}
        individual_probs = {}
        
        for name, model in self.models.items():
            probs = model.predict_proba(X)
            individual_probs[name] = probs[0]
            pred_indices = np.argmax(probs, axis=1)
            individual_preds[name] = self.label_encoder.inverse_transform(pred_indices)[0]
            
        num_classes = list(individual_probs.values())[0].shape[0]
        weighted_probs = np.zeros(num_classes)
        
        total_weight = 0
        for name in self.models.keys():
            w = self.weights.get(name, 1.0)
            weighted_probs += individual_probs[name] * w
            total_weight += w
            
        weighted_probs /= total_weight
        final_pred_idx = np.argmax(weighted_probs)
        final_pred = self.label_encoder.inverse_transform([final_pred_idx])[0]
        confidence = np.max(weighted_probs)
        
        return final_pred, confidence, individual_preds, individual_probs, self.weights
