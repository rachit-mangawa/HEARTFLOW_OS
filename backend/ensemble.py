import joblib
import numpy as np
import os
import sys

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from preprocessing import resolve_model_dir

CANONICAL_CLASSES = ['Asthma', 'Diabetes Mellitus', 'Healthy', 'Heart Disease', 'Hypertension']

class EnsembleModel:
    def __init__(self):
        self.model_dir = resolve_model_dir()
        self.model_names = ['knn', 'svm', 'logreg', 'rf', 'small_nn']
        self.models = {}
        self.load_models()
        self.label_encoder = None
        le_path = os.path.join(self.model_dir, 'label_encoder.pkl')
        if os.path.exists(le_path):
            try:
                self.label_encoder = joblib.load(le_path)
            except Exception as e:
                print(f"Warning: Failed to load label encoder: {e}")
        self.weights = {'knn': 0.15, 'svm': 0.15, 'logreg': 0.20, 'rf': 0.25, 'small_nn': 0.25}
        
    def load_models(self):
        for name in self.model_names:
            path = os.path.join(self.model_dir, f'{name}.pkl')
            if os.path.exists(path):
                try:
                    self.models[name] = joblib.load(path)
                except Exception as e:
                    print(f"Warning: Failed to load model {name}: {e}")

    def decode_label(self, idx: int) -> str:
        """Safely maps class index to clinical label without throwing on unseen labels."""
        if self.label_encoder is not None:
            if hasattr(self.label_encoder, 'classes_'):
                classes = self.label_encoder.classes_
                if 0 <= idx < len(classes):
                    return str(classes[idx])
            if hasattr(self.label_encoder, 'inverse_transform'):
                try:
                    return str(self.label_encoder.inverse_transform([idx])[0])
                except Exception:
                    pass
        if 0 <= idx < len(CANONICAL_CLASSES):
            return CANONICAL_CLASSES[idx]
        return f"Condition_{idx}"
                
    def predict(self, X):
        individual_preds = {}
        individual_probs = {}
        
        for name, model in self.models.items():
            probs = model.predict_proba(X)
            individual_probs[name] = probs[0]
            pred_indices = int(np.argmax(probs, axis=1)[0])
            individual_preds[name] = self.decode_label(pred_indices)
            
        num_classes = list(individual_probs.values())[0].shape[0]
        weighted_probs = np.zeros(num_classes)
        
        total_weight = 0
        for name in self.models.keys():
            w = self.weights.get(name, 1.0)
            weighted_probs += individual_probs[name] * w
            total_weight += w
            
        weighted_probs /= total_weight
        final_pred_idx = int(np.argmax(weighted_probs))
        final_pred = self.decode_label(final_pred_idx)
        confidence = float(np.max(weighted_probs))
        
        class_probs = {
            self.decode_label(i): float(prob)
            for i, prob in enumerate(weighted_probs)
        }
        
        individual_conf = {
            name: float(np.max(probs)) for name, probs in individual_probs.items()
        }
        
        return final_pred, confidence, individual_preds, class_probs, self.weights, individual_conf
