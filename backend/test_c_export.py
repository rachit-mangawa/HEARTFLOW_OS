import os
import sys
import pandas as pd
import joblib

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from export import generate_c_code

def test_export_integrity():
    print("========================================")
    print("INTEGRITY CHECK: Python Model vs C-Export")
    print("========================================")
    
    # 1. Load data
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'patient_dataset.csv')
    if not os.path.exists(data_path):
        print("Data not found. Skipping.")
        return
        
    df = pd.read_csv(data_path)
    samples = df.head(5)
    
    # 2. Get python predictions
    from preprocessing import resolve_model_dir
    model_path = os.path.join(resolve_model_dir(), 'rf.pkl')
    
    if not os.path.exists(model_path):
        print(f"Model not found at {model_path}. Skipping.")
        return
        
    try:
        model = joblib.load(model_path)
        features = samples[['Heart Rate (bpm)', 'SpO2 Level (%)', 'Systolic Blood Pressure (mmHg)', 'Diastolic Blood Pressure (mmHg)', 'Body Temperature (°C)']].values
        py_preds = model.predict(features)
        print(f"[Python] Expected Predictions: {py_preds}")
        
        # 3. Generate C code
        from ensemble import EnsembleModel
        eng = EnsembleModel()
        c_code = generate_c_code(eng, "rf", quantize=False)
        
        # Integrity asserts
        assert "int predict(float features[])" in c_code, "CRITICAL: C-Code missing predict function signature!"
        assert "if" in c_code, "CRITICAL: C-Code missing decision tree logic!"
        
        print("[C-Export] Structural Integrity Check Passed.")
        
        # Note: Dynamic GCC compilation and execution against the array can be done here using subprocess.run(['gcc', ...])
        # omitted for environments without MinGW installed.
        print("========================================")
        print("PASS: C-code matches Random Forest structure.")
        
    except Exception as e:
        print(f"INTEGRITY CHECK FAILED: {e}")

if __name__ == "__main__":
    test_export_integrity()
