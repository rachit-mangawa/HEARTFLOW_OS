import os
from .paths import resolve_model_dir as _default_model_dir, resolve_dataset_path as _default_data_path

COLUMN_ALIASES = {
    'heart rate (bpm)': 'Heart Rate (bpm)',
    'heart rate': 'Heart Rate (bpm)',
    'heart_rate': 'Heart Rate (bpm)',
    'heartrate': 'Heart Rate (bpm)',
    'hr': 'Heart Rate (bpm)',

    'spo2 level (%)': 'SpO2 Level (%)',
    'spo2 level': 'SpO2 Level (%)',
    'spo2_level': 'SpO2 Level (%)',
    'spo2': 'SpO2 Level (%)',
    'oxygen': 'SpO2 Level (%)',

    'systolic blood pressure (mmhg)': 'Systolic Blood Pressure (mmHg)',
    'systolic blood pressure': 'Systolic Blood Pressure (mmHg)',
    'systolic_bp': 'Systolic Blood Pressure (mmHg)',
    'systolic bp': 'Systolic Blood Pressure (mmHg)',
    'sys_bp': 'Systolic Blood Pressure (mmHg)',
    'systolic': 'Systolic Blood Pressure (mmHg)',

    'diastolic blood pressure (mmhg)': 'Diastolic Blood Pressure (mmHg)',
    'diastolic blood pressure': 'Diastolic Blood Pressure (mmHg)',
    'diastolic_bp': 'Diastolic Blood Pressure (mmHg)',
    'diastolic bp': 'Diastolic Blood Pressure (mmHg)',
    'dia_bp': 'Diastolic Blood Pressure (mmHg)',
    'diastolic': 'Diastolic Blood Pressure (mmHg)',

    'body temperature (°c)': 'Body Temperature (°C)',
    'body temperature': 'Body Temperature (°C)',
    'body_temp': 'Body Temperature (°C)',
    'temperature': 'Body Temperature (°C)',
    'temp': 'Body Temperature (°C)',

    'predicted disease': 'Predicted Disease',
    'predicted_disease': 'Predicted Disease',
    'disease': 'Predicted Disease',
    'condition': 'Predicted Disease',
    'diagnosis': 'Predicted Disease',
    'label': 'Predicted Disease',
}

def resolve_model_dir():
    return _default_model_dir()

def resolve_data_path():
    return _default_data_path()

def preprocess_data(df, is_training=False, model_dir=None):
    import joblib
    import numpy as np
    from sklearn.preprocessing import StandardScaler, LabelEncoder
    from sklearn.impute import SimpleImputer

    if model_dir is None:
        model_dir = resolve_model_dir()
    os.makedirs(model_dir, exist_ok=True)
    
    scaler_path = os.path.join(model_dir, 'scaler.pkl')
    label_encoder_path = os.path.join(model_dir, 'label_encoder.pkl')
    imputer_path = os.path.join(model_dir, 'imputer.pkl')
    
    col_map = {}
    for col in df.columns:
        norm_key = str(col).strip().lower().replace('\ufffd', '°')
        if norm_key in COLUMN_ALIASES:
            col_map[col] = COLUMN_ALIASES[norm_key]
        elif isinstance(col, str) and '\ufffd' in col:
            col_map[col] = col.replace('\ufffd', '°')
    if col_map:
        df = df.rename(columns=col_map)
        
    columns_to_drop = ['Patient Number', 'Data Accuracy (%)', 'Heart Rate Alert', 'SpO2 Level Alert', 'Blood Pressure Alert', 'Temperature Alert', 'Fall Detection']
    cols_drop = [c for c in columns_to_drop if c in df.columns]
    X_raw = df.drop(columns=cols_drop).copy()
    
    y = None
    if 'Predicted Disease' in X_raw.columns:
        y_raw = X_raw['Predicted Disease']
        X_raw = X_raw.drop(columns=['Predicted Disease'])
    
        if is_training:
            label_encoder = LabelEncoder()
            y = label_encoder.fit_transform(y_raw)
            joblib.dump(label_encoder, label_encoder_path)
            joblib.dump(label_encoder.classes_, os.path.join(model_dir, 'classes.pkl'))
        else:
            if os.path.exists(label_encoder_path):
                try:
                    label_encoder = joblib.load(label_encoder_path)
                    y = label_encoder.transform(y_raw)
                except Exception:
                    y = None
            else:
                y = y_raw 
    
    defaults = {
        'Heart Rate (bpm)': 75.0,
        'SpO2 Level (%)': 98.0,
        'Systolic Blood Pressure (mmHg)': 120.0,
        'Diastolic Blood Pressure (mmHg)': 80.0,
        'Body Temperature (°C)': 37.0,
    }
    for col, default_val in defaults.items():
        if col not in X_raw.columns:
            X_raw[col] = default_val
            
    X_raw['Risk_Severity'] = (X_raw['Heart Rate (bpm)'] > 105).astype(int) + (X_raw['SpO2 Level (%)'] < 94).astype(int)
    
    continuous_features = ['Heart Rate (bpm)', 'SpO2 Level (%)', 'Systolic Blood Pressure (mmHg)', 'Diastolic Blood Pressure (mmHg)', 'Body Temperature (°C)', 'Risk_Severity']
    
    if is_training:
        imputer = SimpleImputer(strategy='mean')
        X_raw[continuous_features] = imputer.fit_transform(X_raw[continuous_features])
        joblib.dump(imputer, imputer_path)
        
        scaler = StandardScaler()
        X_raw[continuous_features] = scaler.fit_transform(X_raw[continuous_features])
        joblib.dump(scaler, scaler_path)
    else:
        if os.path.exists(imputer_path):
            try:
                imputer = joblib.load(imputer_path)
                X_raw[continuous_features] = imputer.transform(X_raw[continuous_features])
            except Exception:
                pass
            
        if os.path.exists(scaler_path):
            try:
                scaler = joblib.load(scaler_path)
                X_raw[continuous_features] = scaler.transform(X_raw[continuous_features])
            except Exception:
                pass
            
    return X_raw, y

def get_train_test_split(df, model_dir=None):
    from sklearn.model_selection import train_test_split
    X, y = preprocess_data(df, is_training=True, model_dir=model_dir)
    return train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
