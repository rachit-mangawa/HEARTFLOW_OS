import os
import logging
from .paths import resolve_dataset_path, get_p1_dir
from .preprocessing import get_train_test_split

from typing import Callable, Any

logger = logging.getLogger("heartflow")

def train_models(data_path: str | None = None, model_dir: str | None = None, progress_callback: Callable[..., Any] | None = None):
    import json
    import joblib
    import pandas as pd
    from sklearn.neighbors import KNeighborsClassifier
    from sklearn.svm import SVC
    from sklearn.linear_model import LogisticRegression
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.neural_network import MLPClassifier
    from sklearn.metrics import f1_score

    def notify(pct: int, stage: str, msg: str, model_name: str | None = None, f1_dict: dict | None = None):
        if callable(progress_callback):
            try:
                progress_callback(pct, stage, msg, model_name, f1_dict)
            except Exception as cb_err:
                logger.warning(f"train_models progress_callback error: {cb_err}")

    data_path = data_path or resolve_dataset_path()
    model_dir = model_dir or str(get_p1_dir())
    os.makedirs(model_dir, exist_ok=True)
    registry_path = os.path.join(model_dir, 'registry.json')
    
    if os.path.exists(registry_path):
        with open(registry_path, 'r') as f:
            registry = json.load(f)
    else:
        registry = {"active_version": "v1", "versions": {"v1": {"score": 0.0}}}
        
    notify(25, "splitting", "Loading dataset observations & fitting preprocessors...")
    df = pd.read_csv(data_path, encoding='utf-8')
    X_train, X_test, y_train, y_test = get_train_test_split(df, model_dir=model_dir)
    
    # 5 Ensemble Classifiers with descriptions
    model_specs = [
        ('rf', RandomForestClassifier(n_estimators=30, max_depth=5, random_state=42), "Random Forest (30 trees, max_depth=5)", 30, 44),
        ('svm', SVC(kernel='linear', probability=True, max_iter=2000), "Support Vector Machine (Linear SVM)", 46, 58),
        ('logreg', LogisticRegression(max_iter=1000), "Logistic Regression (L-BFGS solver)", 60, 72),
        ('small_nn', MLPClassifier(hidden_layer_sizes=(16, 8), max_iter=500, random_state=42), "Multi-Layer Perceptron (16-8 Architecture)", 74, 85),
        ('knn', KNeighborsClassifier(n_neighbors=5), "K-Nearest Neighbors (k=5)", 87, 93),
    ]
    
    trained_models = {}
    model_f1s = {}
    scores = []
    
    for name, model, desc, start_pct, end_pct in model_specs:
        notify(start_pct, f"training_{name}", f"Fitting {desc}...", name, model_f1s)
        model.fit(X_train, y_train)
        trained_models[name] = model
        
        preds = model.predict(X_test)
        f1 = float(f1_score(y_test, preds, average='weighted'))
        scores.append(f1)
        model_f1s[name] = round(f1, 4)
        notify(end_pct, f"trained_{name}", f"{desc} trained successfully (F1: {f1*100:.1f}%).", name, model_f1s)
        
    avg_score = sum(scores) / len(scores)
    new_version_num = len(registry.get("versions", {})) + 1
    new_version = f"v{new_version_num}"
    
    notify(95, "evaluating", f"Ensemble aggregate F1: {avg_score*100:.1f}%. Comparing against registry baseline...", None, model_f1s)
    
    registry.setdefault("versions", {})[new_version] = {
        "score": round(avg_score, 4),
        "f1_scores": model_f1s
    }
    active_version = registry.get("active_version", "v1")
    active_score = registry["versions"].get(active_version, {}).get("score", 0.0)
    
    if avg_score >= active_score:
        notify(97, "serializing", f"New weights accepted ({new_version}). Serializing model artifacts to disk...", None, model_f1s)
        for name, model in trained_models.items():
            joblib.dump(model, os.path.join(model_dir, f'{name}.pkl'))
        registry["active_version"] = new_version
    else:
        notify(97, "retained_baseline", f"New model score ({avg_score*100:.1f}%) < baseline ({active_score*100:.1f}%). Retained active {active_version}.", None, model_f1s)
        
    with open(registry_path, 'w') as f:
        json.dump(registry, f, indent=4)
        
    notify(99, "registry_updated", f"Registry updated with version {new_version}. Ready for memory hot-swap.", None, model_f1s)
