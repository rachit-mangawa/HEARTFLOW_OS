import m2cgen as m2c
import numpy as np

def generate_c_code(eng, model_name: str, quantize: bool):
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
