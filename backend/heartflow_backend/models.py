import os
import logging
from .paths import resolve_dataset_path, get_p1_dir
from .preprocessing import get_train_test_split

logger = logging.getLogger("heartflow")

def train_models(data_path: str | None = None, model_dir: str | None = None):
    import json
    import joblib
    import pandas as pd
    from sklearn.neighbors import KNeighborsClassifier
    from sklearn.svm import SVC
    from sklearn.linear_model import LogisticRegression
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.neural_network import MLPClassifier
    from sklearn.metrics import f1_score

    data_path = data_path or resolve_dataset_path()
    model_dir = model_dir or str(get_p1_dir())
    os.makedirs(model_dir, exist_ok=True)
    registry_path = os.path.join(model_dir, 'registry.json')
    
    if os.path.exists(registry_path):
        with open(registry_path, 'r') as f:
            registry = json.load(f)
    else:
        registry = {"active_version": "v1", "versions": {"v1": {"score": 0.0}}}
        
    df = pd.read_csv(data_path, encoding='utf-8')
    X_train, X_test, y_train, y_test = get_train_test_split(df, model_dir=model_dir)
    
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
        model.fit(X_train, y_train)
        trained_models[name] = model
        
        preds = model.predict(X_test)
        f1 = f1_score(y_test, preds, average='weighted')
        scores.append(f1)
        
    avg_score = sum(scores) / len(scores)
    new_version_num = len(registry["versions"]) + 1
    new_version = f"v{new_version_num}"
    
    registry["versions"][new_version] = {"score": avg_score}
    active_version = registry["active_version"]
    active_score = registry["versions"].get(active_version, {}).get("score", 0.0)
    
    if avg_score >= active_score:
        for name, model in trained_models.items():
            joblib.dump(model, os.path.join(model_dir, f'{name}.pkl'))
        registry["active_version"] = new_version
        
    with open(registry_path, 'w') as f:
        json.dump(registry, f, indent=4)
