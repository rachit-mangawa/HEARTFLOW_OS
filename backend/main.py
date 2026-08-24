from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import asyncio
import sys
import os
import m2cgen as m2c
import shap
from database import log_prediction, get_history
import numpy as np

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from preprocessing import preprocess_data

app = FastAPI(title="TinyML Healthcare API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ensemble_system = None
def get_ensemble():
    global ensemble_system
    if ensemble_system is None:
        try:
            from ensemble import EnsembleModel
            ensemble_system = EnsembleModel()
        except Exception:
            return None
    return ensemble_system

class PatientData(BaseModel):
    Heart_Rate: float
    SpO2_Level: float
    Systolic_BP: float
    Diastolic_BP: float
    Body_Temp: float
    Fall_Detection: str
    
@app.get("/health")
def health_check():
    return {"status": "Healthy" if get_ensemble() else "Warning - Models Offline"}

@app.post("/predict")
async def predict(data: PatientData):
    try:
        eng = get_ensemble()
        if not eng:
            return {"error": "Models untrained. Ensure python backend/models.py executes."}
                
        df = pd.DataFrame([{
            'Heart Rate (bpm)': data.Heart_Rate,
            'SpO2 Level (%)': data.SpO2_Level,
            'Systolic Blood Pressure (mmHg)': data.Systolic_BP,
            'Diastolic Blood Pressure (mmHg)': data.Diastolic_BP,
            'Body Temperature (°C)': data.Body_Temp,
            'Fall Detection': data.Fall_Detection
        }])
        
        X_proc, _ = await asyncio.to_thread(preprocess_data, df, False)
        final_pred, conf, ind_preds, ind_probs, weights = await asyncio.to_thread(eng.predict, X_proc)
        
        is_at_risk = 0 if final_pred == "Healthy" else 1
        
        # Critical Alert System — fault-tolerant
        if is_at_risk == 1 and float(conf) > 0.80:
            try:
                with open("alerts.log", "a") as f:
                    f.write(f"ALERT: Patient at risk! HR: {data.Heart_Rate}, SpO2: {data.SpO2_Level}, Confidence: {conf:.2f}\n")
            except Exception:
                pass
                
        # Log to SQLite History — fault-tolerant
        try:
            await asyncio.to_thread(log_prediction, data, final_pred, float(conf))
        except Exception as db_e:
            print(f"DB logging skipped: {db_e}")
        
        return {
            "prediction": is_at_risk,
            "prediction_label": final_pred,
            "probability": float(conf),
            "ensemble_prediction": is_at_risk,
            "model_outputs": ind_preds,
            "model_probs": {k: float(np.max(v)) for k, v in ind_probs.items()},
            "weights": weights
        }
    except Exception as e:
        import traceback
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Backend Error: {str(e)}\n\nTraceback:\n{traceback.format_exc()}")

@app.get("/history")
def history():
    return get_history()

@app.get("/dataset")
async def get_dataset():
    data_path = '/app/data/patient_dataset.csv' if os.path.exists('/app/data') else '../data/patient_dataset.csv' if os.path.exists('../data') else 'data/patient_dataset.csv'
    if os.path.exists(data_path):
        try:
            # Force UTF-8 and strip column whitespace
            df = pd.read_csv(data_path, encoding='utf-8')
            df.columns = [c.strip() for c in df.columns]
            return df.to_dict(orient="records")
        except Exception as e:
            return {"error": f"Failed to read dataset: {str(e)}"}
    return {"error": "Dataset not found"}

@app.get("/sync")
def force_sync():
    from database import sync_from_hub, sync_to_hub
    sync_from_hub()
    return {"status": "Sync attempted"}

@app.post("/explain")
async def explain(data: PatientData):
    eng = get_ensemble()
    if not eng or 'rf' not in eng.models:
        return {"error": "RF Model unavailable for explanation."}
        
    df = pd.DataFrame([{
        'Heart Rate (bpm)': data.Heart_Rate,
        'SpO2 Level (%)': data.SpO2_Level,
        'Systolic Blood Pressure (mmHg)': data.Systolic_BP,
        'Diastolic Blood Pressure (mmHg)': data.Diastolic_BP,
        'Body Temperature (°C)': data.Body_Temp,
        'Fall Detection': data.Fall_Detection
    }])
    
    X_proc, _ = await asyncio.to_thread(preprocess_data, df, False)
    
    def compute_shap():
        import numpy as np
        rf_model = eng.models['rf']
        explainer = shap.TreeExplainer(rf_model)
        shap_values = explainer.shap_values(X_proc)
        pred_idx = int(rf_model.predict(X_proc)[0])
        if isinstance(shap_values, list):
            vals = shap_values[pred_idx][0]
        elif isinstance(shap_values, np.ndarray) and len(shap_values.shape) == 3:
            vals = shap_values[0, :, pred_idx]
        else:
            vals = shap_values[0]
        return vals.tolist(), X_proc.columns.tolist()
        
    try:
        shap_vals, features = await asyncio.to_thread(compute_shap)
        return {"shap_values": shap_vals, "feature_names": features}
    except Exception as e:
        return {"error": str(e)}

@app.get("/export_tinyml")
def export_tinyml(model_name: str = "rf", quantize: bool = False):
    import numpy as np
    eng = get_ensemble()
    if not eng or model_name not in eng.models:
        return {"error": f"Model {model_name} not found"}
        
    model = eng.models[model_name]
    
    # m2cgen handles Random Forest beautifully, but outputs FP32/double rules
    if model_name == "rf":
        try:
            code = m2c.export_to_c(model)
            if quantize:
                code = "/* WARNING: M2CGen generated FP32 output. INT8 Quantization is not supported directly for Random Forest trees. */\n" + code
            return {"code": code}
        except Exception:
            pass
            
    # For LogReg, use m2cgen if FP32, otherwise manual generation for INT8
    if not quantize and model_name == "logreg":
        try:
            code = m2c.export_to_c(model)
            return {"code": code}
        except Exception:
            pass
    
    # Manual C-code generation for all model types
    try:
        L = []
        L.append("/* ====================================================== */")
        L.append(f"/* TinyML C Export: {model_name}                           */")
        q_text = "INT8 Quantized" if quantize else "FP32 Double"
        L.append(f"/* Auto-generated for ARM Cortex-M / ESP32 ({q_text}) */")
        L.append("/* ====================================================== */")
        L.append("")
        L.append("#include <math.h>")
        L.append("#include <stdint.h>")
        L.append("#include <string.h>")
        L.append("")
        
        if model_name == "svm" and hasattr(model, 'coef_'):
            coefs = model.coef_
            intercepts = model.intercept_
            n_classes = len(model.classes_)
            n_features = coefs.shape[1]
            L.append(f"/* Linear SVM with {n_classes} classes, {n_features} features */")
            L.append(f"#define N_FEATURES {n_features}")
            L.append(f"#define N_CLASSES {n_classes}")
            L.append(f"#define N_HYPERPLANES {coefs.shape[0]}")
            L.append("")

            if quantize:
                scale_factor = 127.0 / max(np.max(np.abs(coefs)), np.max(np.abs(intercepts)), 1e-6)
                L.append(f"/* Quantization Scale: {scale_factor:.4f} */")
                L.append("static const int8_t SVM_COEF[N_HYPERPLANES][N_FEATURES] = {")
                for row in coefs:
                    vals = ", ".join([str(int(round(v * scale_factor))) for v in row])
                    L.append(f"    {{{vals}}},")
                L.append("};")
                L.append("")
                vals = ", ".join([str(int(round(v * scale_factor))) for v in intercepts])
                L.append(f"static const int8_t SVM_INTERCEPT[N_HYPERPLANES] = {{{vals}}};")
                L.append("")
                L.append("int predict(int8_t *features) {")
                L.append("    int32_t scores[N_CLASSES] = {0};")
                L.append("    int h = 0;")
                L.append("    for (int i = 0; i < N_CLASSES; i++) {")
                L.append("        for (int j = i + 1; j < N_CLASSES; j++) {")
                L.append("            int32_t decision = SVM_INTERCEPT[h];")
                L.append("            for (int f = 0; f < N_FEATURES; f++) {")
                L.append("                decision += (int32_t)SVM_COEF[h][f] * features[f];")
                L.append("            }")
                L.append("            if (decision > 0) scores[i] += 1;")
                L.append("            else scores[j] += 1;")
                L.append("            h++;")
                L.append("        }")
                L.append("    }")
                L.append("    int best = 0;")
                L.append("    for (int c = 1; c < N_CLASSES; c++) {")
                L.append("        if (scores[c] > scores[best]) best = c;")
                L.append("    }")
                L.append("    return best;")
                L.append("}")
            else:
                L.append("static const double SVM_COEF[N_HYPERPLANES][N_FEATURES] = {")
                for row in coefs:
                    vals = ", ".join([f"{v:.6f}" for v in row])
                    L.append(f"    {{{vals}}},")
                L.append("};")
                L.append("")
                vals = ", ".join([f"{v:.6f}" for v in intercepts])
                L.append(f"static const double SVM_INTERCEPT[N_HYPERPLANES] = {{{vals}}};")
                L.append("")
                L.append("int predict(double *features) {")
                L.append("    double scores[N_CLASSES] = {0};")
                L.append("    int h = 0;")
                L.append("    for (int i = 0; i < N_CLASSES; i++) {")
                L.append("        for (int j = i + 1; j < N_CLASSES; j++) {")
                L.append("            double decision = SVM_INTERCEPT[h];")
                L.append("            for (int f = 0; f < N_FEATURES; f++) {")
                L.append("                decision += SVM_COEF[h][f] * features[f];")
                L.append("            }")
                L.append("            if (decision > 0) scores[i] += 1.0;")
                L.append("            else scores[j] += 1.0;")
                L.append("            h++;")
                L.append("        }")
                L.append("    }")
                L.append("    int best = 0;")
                L.append("    for (int c = 1; c < N_CLASSES; c++) {")
                L.append("        if (scores[c] > scores[best]) best = c;")
                L.append("    }")
                L.append("    return best;")
                L.append("}")

        elif model_name == "logreg" and hasattr(model, 'coef_'):
            coefs = model.coef_
            intercepts = model.intercept_
            n_classes = coefs.shape[0] if len(model.classes_) > 2 else 2
            n_features = coefs.shape[1]
            L.append(f"/* Logistic Regression with {n_classes} classes, {n_features} features */")
            L.append(f"#define N_FEATURES {n_features}")
            L.append(f"#define N_CLASSES {coefs.shape[0]}")
            L.append("")
            
            if quantize:
                scale_factor = 127.0 / max(np.max(np.abs(coefs)), np.max(np.abs(intercepts)), 1e-6)
                L.append(f"/* Quantization Scale: {scale_factor:.4f} */")
                L.append("static const int8_t LOGREG_COEF[N_CLASSES][N_FEATURES] = {")
                for row in coefs:
                    vals = ", ".join([str(int(round(v * scale_factor))) for v in row])
                    L.append(f"    {{{vals}}},")
                L.append("};")
                L.append("")
                vals = ", ".join([str(int(round(v * scale_factor))) for v in intercepts])
                L.append(f"static const int8_t LOGREG_INTERCEPT[N_CLASSES] = {{{vals}}};")
                L.append("")
                L.append("int predict(int8_t *features) {")
                L.append("    int32_t scores[N_CLASSES];")
                L.append("    for (int c = 0; c < N_CLASSES; c++) {")
                L.append(f"        scores[c] = LOGREG_INTERCEPT[c] * {int(scale_factor)};")
                L.append("        for (int f = 0; f < N_FEATURES; f++) {")
                L.append("            scores[c] += (int32_t)LOGREG_COEF[c][f] * features[f];")
                L.append("        }")
                L.append("    }")
                L.append("    int best = 0;")
                L.append("    for (int c = 1; c < N_CLASSES; c++) {")
                L.append("        if (scores[c] > scores[best]) best = c;")
                L.append("    }")
                L.append("    return best;")
                L.append("}")
            else:
                L.append("static const double LOGREG_COEF[N_CLASSES][N_FEATURES] = {")
                for row in coefs:
                    vals = ", ".join([f"{v:.6f}" for v in row])
                    L.append(f"    {{{vals}}},")
                L.append("};")
                L.append("")
                vals = ", ".join([f"{v:.6f}" for v in intercepts])
                L.append(f"static const double LOGREG_INTERCEPT[N_CLASSES] = {{{vals}}};")
                L.append("")
                L.append("int predict(double *features) {")
                L.append("    double scores[N_CLASSES];")
                L.append("    for (int c = 0; c < N_CLASSES; c++) {")
                L.append("        scores[c] = LOGREG_INTERCEPT[c];")
                L.append("        for (int f = 0; f < N_FEATURES; f++) {")
                L.append("            scores[c] += LOGREG_COEF[c][f] * features[f];")
                L.append("        }")
                L.append("    }")
                L.append("    int best = 0;")
                L.append("    for (int c = 1; c < N_CLASSES; c++) {")
                L.append("        if (scores[c] > scores[best]) best = c;")
                L.append("    }")
                L.append("    return best;")
                L.append("}")

        elif model_name == "small_nn" and hasattr(model, 'coefs_'):
            layers = model.coefs_
            biases = model.intercepts_
            arch = " -> ".join([str(l.shape[0]) for l in layers] + [str(layers[-1].shape[1])])
            L.append(f"/* MLP Neural Network: {len(layers)} layers */")
            L.append(f"/* Architecture: {arch} */")
            L.append("")
            
            for idx, (W, b) in enumerate(zip(layers, biases)):
                n_in, n_out = W.shape
                L.append(f"#define L{idx}_IN {n_in}")
                L.append(f"#define L{idx}_OUT {n_out}")
                L.append(f"static const double W{idx}[{n_in}][{n_out}] = {{")
                for row in W:
                    vals = ", ".join([f"{v:.6f}" for v in row])
                    L.append(f"    {{{vals}}},")
                L.append("};")
                bvals = ", ".join([f"{v:.6f}" for v in b])
                L.append(f"static const double B{idx}[{n_out}] = {{{bvals}}};")
                L.append("")
            
            L.append("static inline double relu(double x) { return x > 0 ? x : 0; }")
            L.append("")

            if quantize:
                # Calculate global max for int8 scaling
                max_val = max([np.max(np.abs(w)) for w in layers] + [np.max(np.abs(b)) for b in biases] + [1e-6])
                scale_factor = 127.0 / max_val
                L.append(f"/* INT8 Quantization Scale Factor: {scale_factor:.4f} */")
                for idx, (W, b) in enumerate(zip(layers, biases)):
                    n_in, n_out = W.shape
                    L.append(f"static const int8_t W{idx}[{n_in}][{n_out}] = {{")
                    for row in W:
                        vals = ", ".join([str(int(round(v * scale_factor))) for v in row])
                        L.append(f"    {{{vals}}},")
                    L.append("};")
                    bvals = ", ".join([str(int(round(v * scale_factor))) for v in b])
                    L.append(f"static const int8_t B{idx}[{n_out}] = {{{bvals}}};")
                    L.append("")
                L.append("static inline int32_t relu_int(int32_t x) { return x > 0 ? x : 0; }")
                L.append("")
                L.append("int predict(int8_t *input) {")
                for idx in range(len(layers)):
                    n_in = layers[idx].shape[0]
                    n_out = layers[idx].shape[1]
                    is_last = (idx == len(layers) - 1)
                    src = "input" if idx == 0 else f"a{idx-1}"
                    L.append(f"    int32_t a{idx}[{n_out}];")
                    L.append(f"    for (int j = 0; j < {n_out}; j++) {{")
                    L.append(f"        a{idx}[j] = B{idx}[j] * {int(scale_factor)}; /* scale bias */")
                    L.append(f"        for (int i = 0; i < {n_in}; i++) {{")
                    L.append(f"            a{idx}[j] += (int32_t){src}[i] * W{idx}[i][j];")
                    L.append(f"        }}")
                    if not is_last:
                        L.append(f"        a{idx}[j] = relu_int(a{idx}[j]) / {int(scale_factor)}; /* rescale */")
                    L.append(f"    }}")
                last_idx = len(layers) - 1
                last_out = layers[-1].shape[1]
                L.append(f"    int best = 0;")
                L.append(f"    for (int c = 1; c < {last_out}; c++) {{")
                L.append(f"        if (a{last_idx}[c] > a{last_idx}[best]) best = c;")
                L.append(f"    }}")
                L.append(f"    return best;")
                L.append("}")
            else:
                for idx, (W, b) in enumerate(zip(layers, biases)):
                    n_in, n_out = W.shape
                    L.append(f"#define L{idx}_IN {n_in}")
                    L.append(f"#define L{idx}_OUT {n_out}")
                    L.append(f"static const double W{idx}[{n_in}][{n_out}] = {{")
                    for row in W:
                        vals = ", ".join([f"{v:.6f}" for v in row])
                        L.append(f"    {{{vals}}},")
                    L.append("};")
                    bvals = ", ".join([f"{v:.6f}" for v in b])
                    L.append(f"static const double B{idx}[{n_out}] = {{{bvals}}};")
                    L.append("")

            L.append("static inline double relu(double x) { return x > 0 ? x : 0; }")
            L.append("")
            L.append("int predict(double *input) {")
            for idx in range(len(layers)):
                n_in = layers[idx].shape[0]
                n_out = layers[idx].shape[1]
                is_last = (idx == len(layers) - 1)
                src = "input" if idx == 0 else f"a{idx-1}"
                L.append(f"    double a{idx}[{n_out}];")
                L.append(f"    for (int j = 0; j < {n_out}; j++) {{")
                L.append(f"        a{idx}[j] = B{idx}[j];")
                L.append(f"        for (int i = 0; i < {n_in}; i++) {{")
                L.append(f"            a{idx}[j] += {src}[i] * W{idx}[i][j];")
                L.append(f"        }}")
                if not is_last:
                    L.append(f"        a{idx}[j] = relu(a{idx}[j]);")
                L.append(f"    }}")
            
            last_idx = len(layers) - 1
            last_out = layers[-1].shape[1]
            L.append(f"    int best = 0;")
            L.append(f"    for (int c = 1; c < {last_out}; c++) {{")
            L.append(f"        if (a{last_idx}[c] > a{last_idx}[best]) best = c;")
            L.append(f"    }}")
            L.append(f"    return best;")
            L.append("}")
            
        elif model_name == "knn" and hasattr(model, '_fit_X'):
            n_samples = min(model._fit_X.shape[0], 100)
            n_feats = model._fit_X.shape[1]
            L.append(f"/* KNN Lookup Table: {n_samples} reference samples */")
            L.append(f"#define N_NEIGHBORS {model.n_neighbors}")
            L.append(f"#define N_SAMPLES {n_samples}")
            L.append(f"#define N_FEATURES {n_feats}")
            L.append("")
            L.append("static const double REF[N_SAMPLES][N_FEATURES] = {")
            for row in model._fit_X[:n_samples]:
                vals = ", ".join([f"{v:.4f}" for v in row])
                L.append(f"    {{{vals}}},")
            L.append("};")
            L.append("")
            labels_str = ", ".join([str(int(l)) for l in model._y[:n_samples]])
            L.append(f"static const int LABELS[N_SAMPLES] = {{{labels_str}}};")
            L.append("")
            L.append("int predict(double *features) {")
            L.append("    double dists[N_SAMPLES];")
            L.append("    for (int i = 0; i < N_SAMPLES; i++) {")
            L.append("        dists[i] = 0.0;")
            L.append("        for (int f = 0; f < N_FEATURES; f++) {")
            L.append("            double d = features[f] - REF[i][f];")
            L.append("            dists[i] += d * d;")
            L.append("        }")
            L.append("    }")
            L.append("    int votes[10] = {0};")
            L.append("    for (int k = 0; k < N_NEIGHBORS; k++) {")
            L.append("        int mi = 0;")
            L.append("        for (int i = 1; i < N_SAMPLES; i++) {")
            L.append("            if (dists[i] < dists[mi]) mi = i;")
            L.append("        }")
            L.append("        votes[LABELS[mi]]++;")
            L.append("        dists[mi] = 1e18;")
            L.append("    }")
            L.append("    int best = 0;")
            L.append("    for (int i = 1; i < 10; i++) {")
            L.append("        if (votes[i] > votes[best]) best = i;")
            L.append("    }")
            L.append("    return best;")
            L.append("}")
        else:
            return {"error": f"Model {model_name} cannot be exported to C."}
        
        return {"code": "\n".join(L)}
    except Exception as e:
        return {"error": f"Export failed: {str(e)}"}

@app.post("/retrain")
async def retrain(file: UploadFile = File(...)):
    data_path = '/app/data/patient_dataset.csv' if os.path.exists('/app/data') else '../data/patient_dataset.csv' if os.path.exists('../data') else 'data/patient_dataset.csv'
    os.makedirs(os.path.dirname(data_path), exist_ok=True)
    
    try:
        content = await file.read()
        import io
        new_df = pd.read_csv(io.BytesIO(content))
        new_df.columns = [c.strip() for c in new_df.columns]
        
        if os.path.exists(data_path):
            existing_df = pd.read_csv(data_path)
            existing_df.columns = [c.strip() for c in existing_df.columns]
            
            # Validate schema
            required_cols = set(existing_df.columns)
            provided_cols = set(new_df.columns)
            
            if not required_cols.issubset(provided_cols):
                missing = required_cols - provided_cols
                return {"error": f"Schema mismatch. Missing columns: {list(missing)}"}
            
            # Ensure columns are in the same order and select only necessary ones
            new_df = new_df[existing_df.columns]
            
            # Append data
            combined_df = pd.concat([existing_df, new_df], ignore_index=True)
        else:
            combined_df = new_df
            
        # Save validated and combined dataset
        combined_df.to_csv(data_path, index=False, encoding='utf-8')
        
        from models import train_models
        await asyncio.to_thread(train_models)
        
        global ensemble_system
        ensemble_system = None
        
        return {"status": "success", "message": f"Dataset updated (now {len(combined_df)} records) and ensemble retrained successfully!"}
    except Exception as e:
        return {"error": f"Retraining failed: {str(e)}"}
