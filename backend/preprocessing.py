import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder

def resolve_model_dir():
    # Resolve relative paths universally whether Docker or local execution
    return '/app/model' if os.path.exists('/app/model') else '../model' if os.path.exists('../model') else 'model'

def preprocess_data(df, is_training=True):
    model_dir = resolve_model_dir()
    scaler_path = f'{model_dir}/scaler.pkl'
    label_encoder_path = f'{model_dir}/label_encoder.pkl'
        
    columns_to_drop = ['Patient Number', 'Data Accuracy (%)', 'Heart Rate Alert', 'SpO2 Level Alert', 'Blood Pressure Alert', 'Temperature Alert']
    cols_drop = [c for c in columns_to_drop if c in df.columns]
    X_raw = df.drop(columns=cols_drop)
    
    y = None
    if 'Predicted Disease' in X_raw.columns:
        y_raw = X_raw['Predicted Disease']
        X_raw = X_raw.drop(columns=['Predicted Disease'])
    
        if is_training:
            label_encoder = LabelEncoder()
            y = label_encoder.fit_transform(y_raw)
            os.makedirs(os.path.dirname(label_encoder_path), exist_ok=True)
            joblib.dump(label_encoder, label_encoder_path)
            joblib.dump(label_encoder.classes_, f'{model_dir}/classes.pkl')
        else:
            if os.path.exists(label_encoder_path):
                label_encoder = joblib.load(label_encoder_path)
                y = label_encoder.transform(y_raw)
            else:
                y = y_raw 
    
    if 'Fall Detection' in X_raw.columns:
        X_raw['Fall Detection'] = X_raw['Fall Detection'].map({'Yes': 1, 'No': 0}).fillna(0)
        
    X_raw.fillna(X_raw.mean(), inplace=True)
    
    # Engineered Feature
    X_raw['Risk_Severity'] = (X_raw['Heart Rate (bpm)'] > 105).astype(int) + (X_raw['SpO2 Level (%)'] < 94).astype(int)
    
    continuous_features = ['Heart Rate (bpm)', 'SpO2 Level (%)', 'Systolic Blood Pressure (mmHg)', 'Diastolic Blood Pressure (mmHg)', 'Body Temperature (°C)', 'Risk_Severity']
    
    if is_training:
        scaler = StandardScaler()
        X_raw[continuous_features] = scaler.fit_transform(X_raw[continuous_features])
        joblib.dump(scaler, scaler_path)
    else:
        if os.path.exists(scaler_path):
            scaler = joblib.load(scaler_path)
            X_raw[continuous_features] = scaler.transform(X_raw[continuous_features])
            
    return X_raw, y

def get_train_test_split(df):
    X, y = preprocess_data(df, is_training=True)
    return train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
