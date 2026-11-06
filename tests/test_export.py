import pytest
from heartflow_backend.export import generate_c_code, _emit_tree_ast_c
from heartflow_backend.ensemble import EnsembleModel

@pytest.fixture(scope="module")
def ensemble_eng():
    eng = EnsembleModel()
    return eng

def test_export_c_code_rf_fp32(ensemble_eng):
    res = generate_c_code(ensemble_eng, "rf", quantize=False)
    assert "code" in res
    code = res["code"]
    
    assert "#ifndef HEARTFLOW_MODEL_H" in code
    assert "#define HEARTFLOW_MODEL_H" in code
    assert "#endif /* HEARTFLOW_MODEL_H */" in code
    assert "#include <stdint.h>" in code
    assert "#include <math.h>" in code
    assert "int predict(const float *features)" in code
    assert "preprocess_vitals(" in code
    
    assert code.count("{") == code.count("}")
    
    assert "malloc(" not in code
    assert "calloc(" not in code
    assert "realloc(" not in code
    assert "free(" not in code

def test_export_c_code_rf_int8_quantized(ensemble_eng):
    res = generate_c_code(ensemble_eng, "rf", quantize=True)
    assert "code" in res
    code = res["code"]
    
    assert "INT8 Quantized" in code
    assert "preprocess_vitals_int8" in code
    assert "int8_t q_features[6]" in code
    assert "predict_from_int8" in code
    assert code.count("{") == code.count("}")
    assert "malloc(" not in code
    assert "calloc(" not in code
    assert "realloc(" not in code
    assert "free(" not in code

def test_export_c_code_svm_fp32_and_int8(ensemble_eng):
    res_fp32 = generate_c_code(ensemble_eng, "svm", quantize=False)
    assert "code" in res_fp32
    code_fp32 = res_fp32["code"]
    assert "SVM_COEF" in code_fp32
    assert "SVM_INTERCEPT" in code_fp32
    assert "int predict(const float *features)" in code_fp32
    assert code_fp32.count("{") == code_fp32.count("}")
    assert "malloc(" not in code_fp32
    assert "free(" not in code_fp32

    res_int8 = generate_c_code(ensemble_eng, "svm", quantize=True)
    assert "code" in res_int8
    code_int8 = res_int8["code"]
    assert "int8_t SVM_COEF" in code_int8
    assert "int32_t SVM_INTERCEPT" in code_int8
    assert code_int8.count("{") == code_int8.count("}")
    assert "malloc(" not in code_int8
    assert "free(" not in code_int8

def test_export_c_code_logreg_fp32_and_int8(ensemble_eng):
    res_fp32 = generate_c_code(ensemble_eng, "logreg", quantize=False)
    assert "code" in res_fp32
    code_fp32 = res_fp32["code"]
    assert "LOGREG_COEF" in code_fp32
    assert "LOGREG_INTERCEPT" in code_fp32
    assert "int predict(const float *features)" in code_fp32
    assert code_fp32.count("{") == code_fp32.count("}")
    assert "malloc(" not in code_fp32
    assert "free(" not in code_fp32

    res_int8 = generate_c_code(ensemble_eng, "logreg", quantize=True)
    assert "code" in res_int8
    code_int8 = res_int8["code"]
    assert "int8_t LOGREG_COEF" in code_int8
    assert "int32_t LOGREG_INTERCEPT" in code_int8
    assert code_int8.count("{") == code_int8.count("}")
    assert "malloc(" not in code_int8
    assert "free(" not in code_int8

def test_export_c_code_small_nn_fp32_and_int8(ensemble_eng):
    res_fp32 = generate_c_code(ensemble_eng, "small_nn", quantize=False)
    assert "code" in res_fp32
    code_fp32 = res_fp32["code"]
    assert "relu_fp" in code_fp32
    assert "W0" in code_fp32
    assert "B0" in code_fp32
    assert "int predict(const float *features)" in code_fp32
    assert code_fp32.count("{") == code_fp32.count("}")
    assert "malloc(" not in code_fp32
    assert "free(" not in code_fp32

    res_int8 = generate_c_code(ensemble_eng, "small_nn", quantize=True)
    assert "code" in res_int8
    code_int8 = res_int8["code"]
    assert "relu_int" in code_int8
    assert "int8_t W0" in code_int8
    assert "int32_t B0" in code_int8
    assert code_int8.count("{") == code_int8.count("}")
    assert "malloc(" not in code_int8
    assert "free(" not in code_int8

def test_export_c_code_knn(ensemble_eng):
    res = generate_c_code(ensemble_eng, "knn", quantize=False)
    assert "code" in res
    code = res["code"]
    assert "N_NEIGHBORS" in code
    assert "REF[N_SAMPLES][N_FEATURES]" in code
    assert "LABELS[N_SAMPLES]" in code
    assert "int predict(const float *features)" in code
    assert code.count("{") == code.count("}")
    assert "malloc(" not in code
    assert "free(" not in code

    res_int8 = generate_c_code(ensemble_eng, "knn", quantize=True)
    assert "code" in res_int8
    code_int8 = res_int8["code"]
    assert "REF_INT8[N_SAMPLES][N_FEATURES]" in code_int8
    assert "predict_from_int8" in code_int8
    assert "int8_t q_features[6]" in code_int8
    assert code_int8.count("{") == code_int8.count("}")
    assert "malloc(" not in code_int8
    assert "free(" not in code_int8

def test_export_c_code_error_handling(ensemble_eng):
    res_none = generate_c_code(None, "rf", False)
    assert "error" in res_none

    res_unknown = generate_c_code(ensemble_eng, "non_existent_model", False)
    assert "error" in res_unknown
    assert "not found" in res_unknown["error"].lower()

    class DummyMockModel:
        pass
    ensemble_eng.models["mock_unsupported"] = DummyMockModel()
    res_unsupported = generate_c_code(ensemble_eng, "mock_unsupported", False)
    assert "error" in res_unsupported
    del ensemble_eng.models["mock_unsupported"]

def test_export_c_code_compilation(ensemble_eng):
    import shutil
    import subprocess
    import tempfile
    import os

    if not shutil.which("gcc"):
        pytest.skip("gcc compiler not available in test environment")

    with tempfile.TemporaryDirectory() as tmp_dir:
        for model_name in ["rf", "svm", "logreg", "small_nn", "knn"]:
            for quantize in [False, True]:
                res = generate_c_code(ensemble_eng, model_name, quantize)
                assert "code" in res
                code = res["code"] + "\nint main(void) { return 0; }\n"
                tmp_c = os.path.join(tmp_dir, f"{model_name}_{quantize}.c")
                tmp_o = os.path.join(tmp_dir, f"{model_name}_{quantize}.o")
                with open(tmp_c, "w") as f:
                    f.write(code)
                ret = subprocess.run(["gcc", "-std=c99", "-c", tmp_c, "-o", tmp_o], capture_output=True, text=True)
                assert ret.returncode == 0, f"gcc failed for {model_name} quantize={quantize}: {ret.stderr}"

def test_quantized_inference_parity(ensemble_eng):
    import numpy as np
    import pandas as pd
    from heartflow_backend.export import _get_scaler_and_classes
    from heartflow_backend.paths import resolve_dataset_path

    means, scales, _ = _get_scaler_and_classes(ensemble_eng)
    means = np.array(means)
    scales = np.array(scales)

    df = pd.read_csv(resolve_dataset_path()).head(50)
    cols = [
        "Heart Rate (bpm)",
        "SpO2 Level (%)",
        "Systolic Blood Pressure (mmHg)",
        "Diastolic Blood Pressure (mmHg)",
        "Body Temperature (°C)"
    ]
    raw = df[cols].values.astype(float)
    risk_sev = ((raw[:, 0] > 105).astype(float) + (raw[:, 1] < 94).astype(float))[:, None]
    X = np.hstack([raw, risk_sev])
    norm = (X - means) / scales
    q_in = np.clip(np.round(norm * 16.0), -128, 127).astype(np.int32)

    # 1. Test small_nn parity with clamped activations
    nn = ensemble_eng.models["small_nn"]
    layers = nn.coefs_
    biases = nn.intercepts_
    max_val = max([float(np.max(np.abs(w))) for w in layers] + [float(np.max(np.abs(b))) for b in biases] + [1e-6])
    scale_factor = 127.0 / max_val

    W0 = np.round(layers[0] * scale_factor).astype(np.int32)
    B0 = np.round(biases[0] * scale_factor * 16.0).astype(np.int32)
    a0 = B0 + q_in @ W0
    a0_relu = np.maximum(a0, 0) // int(scale_factor)
    a0_c = np.clip(a0_relu, 0, 127)

    W1 = np.round(layers[1] * scale_factor).astype(np.int32)
    B1 = np.round(biases[1] * scale_factor * 16.0).astype(np.int32)
    a1 = B1 + a0_c @ W1
    a1_relu = np.maximum(a1, 0) // int(scale_factor)
    a1_c = np.clip(a1_relu, 0, 127)

    W2 = np.round(layers[2] * scale_factor).astype(np.int32)
    B2 = np.round(biases[2] * scale_factor * 16.0).astype(np.int32)
    a2 = B2 + a1_c @ W2
    c_preds = np.argmax(a2, axis=1)

    py_preds = nn.predict(norm)
    parity_nn = np.mean(c_preds == py_preds)
    assert parity_nn > 0.90, f"small_nn INT8 parity below threshold: {parity_nn:.2%}"

    # 2. Test SVM parity
    svm = ensemble_eng.models["svm"]
    s_scale = 127.0 / max(float(np.max(np.abs(svm.coef_))), float(np.max(np.abs(svm.intercept_))), 1e-6)
    svm_coef = np.round(svm.coef_ * s_scale).astype(np.int32)
    svm_intc = np.round(svm.intercept_ * s_scale * 16.0).astype(np.int32)
    svm_c_preds = []
    for sample in q_in:
        scores = [0] * len(svm.classes_)
        h = 0
        for i in range(len(svm.classes_)):
            for j in range(i + 1, len(svm.classes_)):
                dec = svm_intc[h] + np.dot(svm_coef[h], sample)
                if dec > 0:
                    scores[i] += 1
                else:
                    scores[j] += 1
                h += 1
        svm_c_preds.append(np.argmax(scores))
    svm_py_preds = svm.predict(norm)
    parity_svm = np.mean(np.array(svm_c_preds) == svm_py_preds)
    assert parity_svm > 0.90, f"SVM INT8 parity below threshold: {parity_svm:.2%}"

    # 3. Test KNN parity
    from sklearn.neighbors import KNeighborsClassifier
    knn = ensemble_eng.models["knn"]
    n_samples = min(knn._fit_X.shape[0], 80)
    ref_int8 = np.clip(np.round(knn._fit_X[:n_samples] * 16.0), -128, 127).astype(np.int32)
    knn_labels = np.array(knn._y[:n_samples])
    knn_c_preds = []
    for sample in q_in:
        dists = np.sum((sample - ref_int8) ** 2, axis=1)
        nearest_indices = np.argsort(dists)[:knn.n_neighbors]
        nearest_labels = knn_labels[nearest_indices]
        counts = np.bincount(nearest_labels, minlength=len(knn.classes_))
        knn_c_preds.append(np.argmax(counts))
    sub_knn = KNeighborsClassifier(n_neighbors=knn.n_neighbors).fit(knn._fit_X[:n_samples], knn._y[:n_samples])
    parity_knn = np.mean(np.array(knn_c_preds) == sub_knn.predict(norm))
    assert parity_knn > 0.90, f"KNN INT8 parity below threshold: {parity_knn:.2%}"

