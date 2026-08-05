import pytest
import os
import sys

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from export import generate_c_code, _emit_tree_ast_c
from ensemble import EnsembleModel

@pytest.fixture(scope="module")
def ensemble_eng():
    eng = EnsembleModel()
    return eng

def test_export_c_code_rf_fp32(ensemble_eng):
    res = generate_c_code(ensemble_eng, "rf", quantize=False)
    assert "code" in res
    code = res["code"]
    
    # Structural C checks
    assert "#ifndef HEARTFLOW_MODEL_H" in code
    assert "#define HEARTFLOW_MODEL_H" in code
    assert "#endif /* HEARTFLOW_MODEL_H */" in code
    assert "#include <stdint.h>" in code
    assert "#include <math.h>" in code
    assert "int predict(const float *features)" in code
    assert "preprocess_vitals(" in code
    
    # Balanced braces
    assert code.count("{") == code.count("}")
    
    # Zero-malloc ABI guarantee
    assert "malloc(" not in code
    assert "calloc(" not in code
    assert "realloc(" not in code
    assert "free(" not in code

def test_export_c_code_rf_int8_quantized(ensemble_eng):
    res = generate_c_code(ensemble_eng, "rf", quantize=True)
    assert "code" in res
    code = res["code"]
    
    # INT8 specific checks
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
    # FP32
    res_fp32 = generate_c_code(ensemble_eng, "svm", quantize=False)
    assert "code" in res_fp32
    code_fp32 = res_fp32["code"]
    assert "SVM_COEF" in code_fp32
    assert "SVM_INTERCEPT" in code_fp32
    assert "int predict(const float *features)" in code_fp32
    assert code_fp32.count("{") == code_fp32.count("}")
    assert "malloc(" not in code_fp32
    assert "free(" not in code_fp32

    # INT8
    res_int8 = generate_c_code(ensemble_eng, "svm", quantize=True)
    assert "code" in res_int8
    code_int8 = res_int8["code"]
    assert "int8_t SVM_COEF" in code_int8
    assert "int8_t SVM_INTERCEPT" in code_int8
    assert code_int8.count("{") == code_int8.count("}")
    assert "malloc(" not in code_int8
    assert "free(" not in code_int8

def test_export_c_code_logreg_fp32_and_int8(ensemble_eng):
    # FP32
    res_fp32 = generate_c_code(ensemble_eng, "logreg", quantize=False)
    assert "code" in res_fp32
    code_fp32 = res_fp32["code"]
    assert "LOGREG_COEF" in code_fp32
    assert "LOGREG_INTERCEPT" in code_fp32
    assert "int predict(const float *features)" in code_fp32
    assert code_fp32.count("{") == code_fp32.count("}")
    assert "malloc(" not in code_fp32
    assert "free(" not in code_fp32

    # INT8
    res_int8 = generate_c_code(ensemble_eng, "logreg", quantize=True)
    assert "code" in res_int8
    code_int8 = res_int8["code"]
    assert "int8_t LOGREG_COEF" in code_int8
    assert "int8_t LOGREG_INTERCEPT" in code_int8
    assert code_int8.count("{") == code_int8.count("}")
    assert "malloc(" not in code_int8
    assert "free(" not in code_int8

def test_export_c_code_small_nn_fp32_and_int8(ensemble_eng):
    # FP32
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

    # INT8
    res_int8 = generate_c_code(ensemble_eng, "small_nn", quantize=True)
    assert "code" in res_int8
    code_int8 = res_int8["code"]
    assert "relu_int" in code_int8
    assert "int8_t W0" in code_int8
    assert "int8_t B0" in code_int8
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

def test_export_c_code_error_handling(ensemble_eng):
    # None engine
    res_none = generate_c_code(None, "rf", False)
    assert "error" in res_none

    # Unknown model name
    res_unknown = generate_c_code(ensemble_eng, "non_existent_model", False)
    assert "error" in res_unknown
    assert "not found" in res_unknown["error"].lower()

    # Model architecture without export support
    class DummyMockModel:
        pass
    ensemble_eng.models["mock_unsupported"] = DummyMockModel()
    res_unsupported = generate_c_code(ensemble_eng, "mock_unsupported", False)
    assert "error" in res_unsupported
    del ensemble_eng.models["mock_unsupported"]
