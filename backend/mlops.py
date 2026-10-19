import os
import io
import threading
from dataclasses import dataclass
import pandas as pd
from typing import Optional

@dataclass
class RetrainResult:
    success: bool
    message: str

CANONICAL_COLUMNS = [
    'Patient Number',
    'Heart Rate (bpm)',
    'SpO2 Level (%)',
    'Systolic Blood Pressure (mmHg)',
    'Diastolic Blood Pressure (mmHg)',
    'Body Temperature (°C)',
    'Fall Detection',
    'Predicted Disease',
    'Data Accuracy (%)',
    'Heart Rate Alert',
    'SpO2 Level Alert',
    'Blood Pressure Alert',
    'Temperature Alert'
]

# Case-insensitive alias map for telemetry and label columns
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
    'o2_saturation': 'SpO2 Level (%)',

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

class MLOpsEngine:
    """
    Encapsulates the MLOps Lifecycle:
    - Normalizes and sanitizes telemetry schemas with alias resolution.
    - Handles data ingestion and schema validation.
    - Orchestrates model retraining and hot-swapping.
    """
    def __init__(self, dataset_path: str):
        self.dataset_path = dataset_path
        self.active_ensemble = None
        self._lock = threading.Lock()
        self._load_active_models()

    def _load_active_models(self):
        try:
            from ensemble import EnsembleModel
            self.active_ensemble = EnsembleModel()
        except Exception as e:
            print(f"MLOps: Model loading failed (likely untrained): {e}")

    def get_ensemble(self):
        return self.active_ensemble

    def normalize_batch(self, df: pd.DataFrame) -> pd.DataFrame:
        """Standardizes column names, patches encoding issues, and fills missing non-essential metadata."""
        # Clean column names
        cleaned_cols = {}
        for col in df.columns:
            normalized_key = str(col).strip().lower().replace('\ufffd', '°')
            matched_canonical = COLUMN_ALIASES.get(normalized_key, col)
            cleaned_cols[col] = matched_canonical
        df = df.rename(columns=cleaned_cols)

        # Check required continuous physiological signals
        required_signals = [
            'Heart Rate (bpm)',
            'SpO2 Level (%)',
            'Systolic Blood Pressure (mmHg)',
            'Diastolic Blood Pressure (mmHg)',
            'Body Temperature (°C)'
        ]
        missing_signals = [s for s in required_signals if s not in df.columns]
        if missing_signals:
            raise ValueError(f"Missing required physiological signals: {', '.join(missing_signals)}")

        # Ensure target label exists; default to 'Healthy' if not specified
        if 'Predicted Disease' not in df.columns:
            df['Predicted Disease'] = 'Healthy'

        # Auto-populate optional canonical fields with consistent values
        if 'Patient Number' not in df.columns:
            df['Patient Number'] = range(1, len(df) + 1)
        if 'Data Accuracy (%)' not in df.columns:
            df['Data Accuracy (%)'] = 100
        if 'Fall Detection' not in df.columns:
            df['Fall Detection'] = 'No'
        if 'Heart Rate Alert' not in df.columns:
            df['Heart Rate Alert'] = 'NORMAL'
        if 'SpO2 Level Alert' not in df.columns:
            df['SpO2 Level Alert'] = 'NORMAL'
        if 'Blood Pressure Alert' not in df.columns:
            df['Blood Pressure Alert'] = 'NORMAL'
        if 'Temperature Alert' not in df.columns:
            df['Temperature Alert'] = 'NORMAL'

        # Ensure numeric types for continuous signals
        for sig in required_signals:
            df[sig] = pd.to_numeric(df[sig], errors='coerce')

        # Drop rows where all signals are NaN
        df = df.dropna(subset=required_signals, how='all')

        # Align columns to canonical ordering
        return df[[c for c in CANONICAL_COLUMNS if c in df.columns]]

    def ingest_batch_sync(self, csv_bytes: bytes) -> RetrainResult:
        with self._lock:
            try:
                raw_df = pd.read_csv(io.BytesIO(csv_bytes), encoding_errors='replace')
                new_df = self.normalize_batch(raw_df)

                if len(new_df) == 0:
                    return RetrainResult(False, "Uploaded CSV contains no valid telemetry rows.")

                if os.path.exists(self.dataset_path):
                    existing_df = pd.read_csv(self.dataset_path, encoding='utf-8', encoding_errors='replace')
                    existing_df.columns = [c.replace('\ufffd', '°') for c in existing_df.columns]
                    # Adjust Patient Number to maintain continuous increment
                    if 'Patient Number' in existing_df.columns:
                        start_id = int(existing_df['Patient Number'].max() or 0) + 1
                        new_df['Patient Number'] = range(start_id, start_id + len(new_df))

                    combined_df = pd.concat([existing_df, new_df], join="inner", ignore_index=True)
                else:
                    combined_df = new_df

                os.makedirs(os.path.dirname(self.dataset_path), exist_ok=True)
                combined_df.to_csv(self.dataset_path, index=False, encoding='utf-8')

                # Re-train models synchronously
                from models import train_models
                train_models()

                # Hot-swap the live models
                self._load_active_models()

                return RetrainResult(True, f"Dataset successfully updated ({len(combined_df)} total observations) and ensemble hot-swapped.")
            except Exception as e:
                return RetrainResult(False, f"Ingestion failed: {str(e)}")
