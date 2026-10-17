import io
import os
import threading
import logging
from dataclasses import dataclass
from typing import Optional
from .paths import get_p1_dir, resolve_dataset_path

logger = logging.getLogger("heartflow")

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
    def __init__(self, dataset_path: str):
        self.dataset_path = dataset_path
        self.active_ensemble = None
        self._lock = threading.Lock()
        self._retrain_lock = threading.Lock()
        self._retrain_status = {
            "status": "idle",
            "progress": 0,
            "stage": "idle",
            "current_step": "Awaiting dataset batch",
            "current_model": None,
            "models_trained": [],
            "total_models": 5,
            "f1_scores": {},
            "active_version": "v1",
            "observations_count": 0,
            "message": "Ensemble ready for retraining",
            "error": None,
            "started_at": None,
            "completed_at": None
        }
        self._load_active_models()

    def _load_active_models(self):
        try:
            from .ensemble import EnsembleModel
            self.active_ensemble = EnsembleModel()
        except Exception as e:
            logger.warning(f"MLOps: Model loading failed: {e}")

    def get_ensemble(self):
        return self.active_ensemble

    def get_retrain_status(self) -> dict:
        import json
        with self._retrain_lock:
            status = dict(self._retrain_status)
            if status["status"] == "idle":
                reg_path = os.path.join(str(get_p1_dir()), "registry.json")
                if os.path.exists(reg_path):
                    try:
                        with open(reg_path, "r") as f:
                            reg = json.load(f)
                            status["active_version"] = reg.get("active_version", "v1")
                    except Exception:
                        pass
            return status

    def normalize_batch(self, df):
        import pandas as pd
        cleaned_cols = {}
        for col in df.columns:
            normalized_key = str(col).strip().lower().replace('\ufffd', '°')
            matched_canonical = COLUMN_ALIASES.get(normalized_key, col)
            cleaned_cols[col] = matched_canonical
        df = df.rename(columns=cleaned_cols)

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

        if 'Predicted Disease' not in df.columns:
            df['Predicted Disease'] = 'Healthy'

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

        for sig in required_signals:
            df[sig] = pd.to_numeric(df[sig], errors='coerce')

        df = df.dropna(subset=required_signals, how='all')

        return df[[c for c in CANONICAL_COLUMNS if c in df.columns]]

    def ingest_batch_sync(self, csv_bytes: bytes) -> RetrainResult:
        import time
        import json
        import pandas as pd
        with self._lock:
            with self._retrain_lock:
                self._retrain_status.update({
                    "status": "training",
                    "progress": 5,
                    "stage": "normalizing",
                    "current_step": "Parsing uploaded telemetry and resolving schema aliases...",
                    "current_model": None,
                    "models_trained": [],
                    "f1_scores": {},
                    "error": None,
                    "started_at": time.time(),
                    "completed_at": None,
                })

            try:
                raw_df = pd.read_csv(io.BytesIO(csv_bytes), encoding_errors='replace')
                new_df = self.normalize_batch(raw_df)

                if len(new_df) == 0:
                    with self._retrain_lock:
                        self._retrain_status.update({
                            "status": "error",
                            "stage": "error",
                            "error": "Uploaded CSV contains no valid telemetry rows.",
                            "current_step": "Validation failed: 0 valid rows",
                            "completed_at": time.time(),
                        })
                    return RetrainResult(False, "Uploaded CSV contains no valid telemetry rows.")

                dest_dataset = str(get_p1_dir() / "patient_dataset.csv")

                src_path = self.dataset_path if os.path.exists(self.dataset_path) else resolve_dataset_path()
                if os.path.exists(src_path):
                    existing_df = pd.read_csv(src_path, encoding='utf-8', encoding_errors='replace')
                    existing_df.columns = [c.replace('\ufffd', '°') for c in existing_df.columns]
                    if 'Patient Number' in existing_df.columns:
                        start_id = int(existing_df['Patient Number'].max() or 0) + 1
                        new_df['Patient Number'] = range(start_id, start_id + len(new_df))

                    combined_df = pd.concat([existing_df, new_df], join="inner", ignore_index=True)
                else:
                    combined_df = new_df

                os.makedirs(os.path.dirname(dest_dataset), exist_ok=True)
                combined_df.to_csv(dest_dataset, index=False, encoding='utf-8')
                self.dataset_path = dest_dataset

                with self._retrain_lock:
                    self._retrain_status.update({
                        "progress": 20,
                        "stage": "merging",
                        "current_step": f"Merged {len(combined_df)} observations. Splitting train/test data...",
                        "observations_count": len(combined_df),
                    })

                def on_progress(pct: int, stage: str, msg: str, model_name: str | None = None, f1_dict: dict | None = None):
                    with self._retrain_lock:
                        self._retrain_status["progress"] = pct
                        self._retrain_status["stage"] = stage
                        self._retrain_status["current_step"] = msg
                        if model_name:
                            self._retrain_status["current_model"] = model_name
                            if model_name not in self._retrain_status["models_trained"]:
                                self._retrain_status["models_trained"].append(model_name)
                        if f1_dict:
                            self._retrain_status["f1_scores"] = dict(f1_dict)

                from .models import train_models
                train_models(data_path=dest_dataset, model_dir=str(get_p1_dir()), progress_callback=on_progress)

                with self._retrain_lock:
                    self._retrain_status.update({
                        "progress": 98,
                        "stage": "hot_swapping",
                        "current_step": "Hot-swapping active ensemble weights into memory...",
                    })

                self._load_active_models()

                reg_path = os.path.join(str(get_p1_dir()), "registry.json")
                active_v = "v1"
                if os.path.exists(reg_path):
                    try:
                        with open(reg_path, "r") as f:
                            active_v = json.load(f).get("active_version", "v1")
                    except Exception:
                        pass

                with self._retrain_lock:
                    self._retrain_status.update({
                        "status": "complete",
                        "progress": 100,
                        "stage": "complete",
                        "active_version": active_v,
                        "current_model": None,
                        "current_step": f"Retraining complete. Active version {active_v} hot-swapped into memory.",
                        "message": f"Dataset updated ({len(combined_df)} observations) and ensemble hot-swapped ({active_v}).",
                        "completed_at": time.time(),
                    })

                return RetrainResult(True, f"Dataset successfully updated ({len(combined_df)} total observations) and ensemble hot-swapped ({active_v}).")
            except Exception as e:
                with self._retrain_lock:
                    self._retrain_status.update({
                        "status": "error",
                        "stage": "error",
                        "error": str(e),
                        "current_step": f"Ingestion error: {str(e)}",
                        "message": f"Ingestion failed: {str(e)}",
                        "completed_at": time.time(),
                    })
                return RetrainResult(False, f"Ingestion failed: {str(e)}")
