import os
import joblib
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
import pandas as pd
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from preprocessing import get_train_test_split, resolve_model_dir

def train_models():
    data_path = '/app/data/Synthetic_patient-HealthCare-Monitoring_dataset.csv' if os.path.exists('/app/data') else '../data/Synthetic_patient-HealthCare-Monitoring_dataset.csv' if os.path.exists('../data') else 'data/Synthetic_patient-HealthCare-Monitoring_dataset.csv'
    model_dir = resolve_model_dir()
    os.makedirs(model_dir, exist_ok=True)
    
    print("Loading data...")
    df = pd.read_csv(data_path)
    X_train, X_test, y_train, y_test = get_train_test_split(df)
    
    models = {
        'knn': KNeighborsClassifier(n_neighbors=5),
        'svm': SVC(kernel='linear', probability=True, max_iter=2000), 
        'logreg': LogisticRegression(max_iter=1000),
        'rf': RandomForestClassifier(n_estimators=30, max_depth=5, random_state=42),
        'small_nn': MLPClassifier(hidden_layer_sizes=(16, 8), max_iter=500, random_state=42)
    }
    
    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train, y_train)
        joblib.dump(model, f'{model_dir}/{name}.pkl')
        
    print("Training Complete.")

if __name__ == '__main__':
    train_models()
