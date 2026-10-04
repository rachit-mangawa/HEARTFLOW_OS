import os
import io
import pandas as pd
from typing import Optional

class RetrainResult:
    def __init__(self, success: bool, message: str):
        self.success = success
        self.message = message

class MLOpsEngine:
    """
    Deep Module encapsulating the MLOps Lifecycle:
    - Maintains the active ensemble model.
    - Handles schema validation and data ingestion natively with pandas.
    - Orchestrates model retraining and hot-swapping.
    """
    def __init__(self, dataset_path: str):
        self.dataset_path = dataset_path
        self.active_ensemble = None
        self._load_active_models()

    def _load_active_models(self):
        try:
            from ensemble import EnsembleModel
            self.active_ensemble = EnsembleModel()
        except Exception as e:
            print(f"MLOps: Model loading failed (likely untrained): {e}")

    def get_ensemble(self):
        return self.active_ensemble

    def ingest_batch_sync(self, csv_bytes: bytes) -> RetrainResult:
        try:
            new_df = pd.read_csv(io.BytesIO(csv_bytes))
            new_df.columns = [c.strip() for c in new_df.columns]
            
            if os.path.exists(self.dataset_path):
                existing_df = pd.read_csv(self.dataset_path, encoding='utf-8')
                existing_df.columns = [c.strip() for c in existing_df.columns]
                
                # Check for schema mismatch before concatenation
                missing = set(existing_df.columns) - set(new_df.columns)
                if missing:
                    return RetrainResult(False, f"Schema mismatch. Missing columns: {list(missing)}")
                
                # Ponytail shrink: pandas join="inner" drops mismatched extra columns cleanly
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
            
            return RetrainResult(True, f"Dataset updated (now {len(combined_df)} records) and ensemble hot-swapped!")
        except Exception as e:
            return RetrainResult(False, f"Retraining failed: {str(e)}")
