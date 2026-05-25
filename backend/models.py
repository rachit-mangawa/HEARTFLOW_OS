import os
import joblib
import json
import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import f1_score
import pandas as pd
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from preprocessing import get_train_test_split, resolve_model_dir

def train_models():
    data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'patient_dataset.csv')
    model_dir = resolve_model_dir()
    os.makedirs(model_dir, exist_ok=True)
    registry_path = os.path.join(model_dir, 'registry.json')
    
    if os.path.exists(registry_path):
        with open(registry_path, 'r') as f:
            registry = json.load(f)
    else:
        registry = {"active_version": "v1", "versions": {"v1": {"score": 0.0}}}
        
    print("Loading data...")
    df = pd.read_csv(data_path, encoding='utf-8')
    X_train, X_test, y_train, y_test = get_train_test_split(df)
    
    models = {
        'knn': KNeighborsClassifier(n_neighbors=5),
        'svm': SVC(kernel='linear', probability=True, max_iter=2000), 
        'logreg': LogisticRegression(max_iter=1000),
        'rf': RandomForestClassifier(n_estimators=30, max_depth=5, random_state=42),
        'small_nn': MLPClassifier(hidden_layer_sizes=(16, 8), max_iter=500, random_state=42)
    }
    
    trained_models = {}
    scores = []
    
    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train, y_train)
        trained_models[name] = model
        
        preds = model.predict(X_test)
        f1 = f1_score(y_test, preds, average='weighted')
        scores.append(f1)
        
    avg_score = sum(scores) / len(scores)
    new_version_num = len(registry["versions"]) + 1
    new_version = f"v{new_version_num}"
    print(f"New Version {new_version} Average F1 Score: {avg_score:.4f}")
    
    registry["versions"][new_version] = {"score": avg_score}
    active_version = registry["active_version"]
    active_score = registry["versions"].get(active_version, {}).get("score", 0.0)
    
    if avg_score >= active_score:
        print(f"Score improved ({avg_score:.4f} >= {active_score:.4f}). Overwriting active models.")
        for name, model in trained_models.items():
            joblib.dump(model, os.path.join(model_dir, f'{name}.pkl'))
        registry["active_version"] = new_version
    else:
        print(f"Score degraded ({avg_score:.4f} < {active_score:.4f}). Rollback initiated: keeping existing models.")
        
    with open(registry_path, 'w') as f:
        json.dump(registry, f, indent=4)
        
    print("Training Complete.")

if __name__ == '__main__':
    train_models()
