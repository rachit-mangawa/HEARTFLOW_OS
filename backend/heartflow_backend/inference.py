from typing import Dict, Any
from .preprocessing import preprocess_data

def evaluate(ensemble_model, data) -> Dict[str, Any]:
    import pandas as pd
    raw_df = pd.DataFrame([data.model_dump(by_alias=True)])
    
    raw_df = raw_df.rename(columns={
        "Heart_Rate": "Heart Rate (bpm)",
        "SpO2_Level": "SpO2 Level (%)",
        "Systolic_BP": "Systolic Blood Pressure (mmHg)",
        "Diastolic_BP": "Diastolic Blood Pressure (mmHg)",
        "Body_Temp": "Body Temperature (°C)",
        "Fall_Detection": "Fall Detection"
    })

    unseen = ["Physical Activity Level", "Age", "Gender", "Stress Level", "Cholesterol Level (mg/dL)", 
              "Physical_Activity_Level", "Stress_Level", "Cholesterol_Level", "Fall_Detection"]
    for f in unseen:
        if f in raw_df.columns:
            raw_df = raw_df.drop(columns=[f])

    processed_df, _ = preprocess_data(raw_df, is_training=False)

    if ensemble_model is None:
        return {"error": "Ensemble model not loaded"}

    disease_label, conf, ind_preds, class_probs, weights, ind_conf = ensemble_model.predict(processed_df)
    is_at_risk = (disease_label.lower() not in ["healthy", "normal", "none"])

    return {
        "prediction": is_at_risk,
        "prediction_label": disease_label,
        "probability": float(conf),
        "ensemble_prediction": is_at_risk,
        "model_outputs": ind_preds,
        "model_probs": ind_conf,
        "disease_probs": class_probs,
        "weights": weights
    }
