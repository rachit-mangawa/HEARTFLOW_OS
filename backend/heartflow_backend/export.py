import os

def _get_scaler_and_classes(eng):
    import joblib
    from .paths import resolve_model_dir, resolve_model_path
    model_dir = getattr(eng, 'model_dir', None)
    if not model_dir:
        model_dir = resolve_model_dir()
    
    means = [85.0, 96.67, 125.0, 85.0, 37.2, 0.0]
    scales = [4.08, 1.25, 4.08, 4.08, 0.21, 1.0]
    class_names = ["Class_0", "Class_1"]

    scaler_path = os.path.join(model_dir, 'scaler.pkl') if os.path.exists(os.path.join(model_dir, 'scaler.pkl')) else resolve_model_path('scaler.pkl')
    if os.path.exists(scaler_path):
        try:
            scaler = joblib.load(scaler_path)
            means = [float(v) for v in scaler.mean_]
            scales = [float(v) for v in scaler.scale_]
        except Exception:
            pass

    classes_path = os.path.join(model_dir, 'classes.pkl') if os.path.exists(os.path.join(model_dir, 'classes.pkl')) else resolve_model_path('classes.pkl')
    if os.path.exists(classes_path):
        try:
            classes = joblib.load(classes_path)
            class_names = [str(c) for c in classes]
        except Exception:
            pass
    elif hasattr(eng, 'label_encoder') and eng.label_encoder is not None:
        try:
            class_names = [str(c) for c in eng.label_encoder.classes_]
        except Exception:
            pass

    return means, scales, class_names

def _emit_tree_ast_c(tree, node_id, indent="    ", quantize=False, scale_factor=16.0):
    import numpy as np
    lines = []
    if tree.children_left[node_id] == -1:
        class_idx = int(np.argmax(tree.value[node_id][0]))
        lines.append(f"{indent}return {class_idx};")
        return lines

    feat = int(tree.feature[node_id])
    thresh = float(tree.threshold[node_id])

    if quantize:
        thresh_q = int(round(thresh * scale_factor))
        lines.append(f"{indent}if (f[{feat}] <= {thresh_q}) {{")
    else:
        lines.append(f"{indent}if (f[{feat}] <= {thresh:.6f}f) {{")

    lines.extend(_emit_tree_ast_c(tree, tree.children_left[node_id], indent + "    ", quantize, scale_factor))
    lines.append(f"{indent}}} else {{")
    lines.extend(_emit_tree_ast_c(tree, tree.children_right[node_id], indent + "    ", quantize, scale_factor))
    lines.append(f"{indent}}}")
    return lines

def generate_c_code(eng, model_name: str, quantize: bool):
    import numpy as np
    if not eng or model_name not in eng.models:
        return {"error": f"Model {model_name} not found"}

    model = eng.models[model_name]
    means, scales, class_names = _get_scaler_and_classes(eng)
    n_classes = len(class_names)
    q_text = "INT8 Quantized" if quantize else "FP32 Single-Precision"

    L = []
    L.append(f"// HeartFlow OS TinyML C99 · Model: {model_name.upper()} ({q_text}) · Zero-Malloc · Static RAM: <64B")
    L.append("#ifndef HEARTFLOW_MODEL_H")
    L.append("#define HEARTFLOW_MODEL_H")
    L.append("")
    L.append("#include <stdint.h>")
    L.append("#include <math.h>")
    L.append("#include <string.h>")
    L.append("")
    L.append(f"#define N_CLASSES {n_classes}")
    L.append("#define N_RAW_FEATURES 5")
    L.append("#define N_SCALED_FEATURES 6")
    L.append("")

    c_names_str = ", ".join([f'"{name}"' for name in class_names])
    L.append(f"static const char * const CLASS_NAMES[N_CLASSES] = {{{c_names_str}}};")
    L.append("")

    means_str = ", ".join([f"{m:.6f}f" for m in means])
    scales_str = ", ".join([f"{s:.6f}f" for s in scales])
    L.append(f"static const float SCALER_MEAN[N_SCALED_FEATURES] = {{{means_str}}};")
    L.append(f"static const float SCALER_SCALE[N_SCALED_FEATURES] = {{{scales_str}}};")
    L.append("")

    L.append("static inline void preprocess_vitals(const float *raw, float *out) {")
    L.append("    for (int i = 0; i < 5; i++) {")
    L.append("        out[i] = (raw[i] - SCALER_MEAN[i]) / SCALER_SCALE[i];")
    L.append("    }")
    L.append("    float risk_sev = (raw[0] > 105.0f ? 1.0f : 0.0f) + (raw[1] < 94.0f ? 1.0f : 0.0f);")
    L.append("    out[5] = (risk_sev - SCALER_MEAN[5]) / SCALER_SCALE[5];")
    L.append("}")
    L.append("")

    if quantize:
        L.append("static inline void preprocess_vitals_int8(const float *raw, int8_t *out) {")
        L.append("    float norm[6];")
        L.append("    preprocess_vitals(raw, norm);")
        L.append("    for (int i = 0; i < 6; i++) {")
        L.append("        int32_t q = (int32_t)roundf(norm[i] * 16.0f);")
        L.append("        if (q > 127) q = 127;")
        L.append("        if (q < -128) q = -128;")
        L.append("        out[i] = (int8_t)q;")
        L.append("    }")
        L.append("}")
        L.append("")

    if model_name == "rf":
        n_trees = len(model.estimators_)
        L.append(f"#define N_TREES {n_trees}")
        L.append("")

        if quantize:
            for i, est in enumerate(model.estimators_):
                L.append(f"static inline int tree_vote_{i}(const int8_t *f) {{")
                L.extend(_emit_tree_ast_c(est.tree_, 0, indent="    ", quantize=True, scale_factor=16.0))
                L.append("}")
                L.append("")

            L.append("static inline int predict_from_int8(const int8_t *features) {")
            L.append("    uint16_t votes[N_CLASSES] = {0};")
            for i in range(n_trees):
                L.append(f"    votes[tree_vote_{i}(features)]++;")
            L.append("    int best = 0;")
            L.append("    for (int c = 1; c < N_CLASSES; c++) {")
            L.append("        if (votes[c] > votes[best]) best = c;")
            L.append("    }")
            L.append("    return best;")
            L.append("}")
            L.append("")

            L.append("int predict(const float *features) {")
            L.append("    int8_t q_features[6];")
            L.append("    preprocess_vitals_int8(features, q_features);")
            L.append("    return predict_from_int8(q_features);")
            L.append("}")
        else:
            for i, est in enumerate(model.estimators_):
                L.append(f"static inline int tree_vote_{i}(const float *f) {{")
                L.extend(_emit_tree_ast_c(est.tree_, 0, indent="    ", quantize=False))
                L.append("}")
                L.append("")

            L.append("static inline int predict_from_norm(const float *norm_features) {")
            L.append("    uint16_t votes[N_CLASSES] = {0};")
            for i in range(n_trees):
                L.append(f"    votes[tree_vote_{i}(norm_features)]++;")
            L.append("    int best = 0;")
            L.append("    for (int c = 1; c < N_CLASSES; c++) {")
            L.append("        if (votes[c] > votes[best]) best = c;")
            L.append("    }")
            L.append("    return best;")
            L.append("}")
            L.append("")

            L.append("int predict(const float *features) {")
            L.append("    float norm[6];")
            L.append("    preprocess_vitals(features, norm);")
            L.append("    return predict_from_norm(norm);")
            L.append("}")

    elif model_name == "svm" and hasattr(model, 'coef_'):
        coefs = model.coef_
        intercepts = model.intercept_
        n_features = coefs.shape[1]
        n_hyperplanes = coefs.shape[0]

        L.append(f"#define N_FEATURES {n_features}")
        L.append(f"#define N_HYPERPLANES {n_hyperplanes}")
        L.append("")

        if quantize:
            scale_factor = 127.0 / max(float(np.max(np.abs(coefs))), float(np.max(np.abs(intercepts))), 1e-6)
            L.append(f"static const int8_t SVM_COEF[N_HYPERPLANES][N_FEATURES] = {{")
            for row in coefs:
                vals = ", ".join([str(int(round(v * scale_factor))) for v in row])
                L.append(f"    {{{vals}}},")
            L.append("};")
            L.append("")
            vals = ", ".join([str(int(round(v * scale_factor * 16.0))) for v in intercepts])
            L.append(f"static const int32_t SVM_INTERCEPT[N_HYPERPLANES] = {{{vals}}};")
            L.append("")

            L.append("int predict(const float *features) {")
            L.append("    int8_t q_features[6];")
            L.append("    preprocess_vitals_int8(features, q_features);")
            L.append("    int32_t scores[N_CLASSES] = {0};")
            L.append("    int h = 0;")
            L.append("    for (int i = 0; i < N_CLASSES; i++) {")
            L.append("        for (int j = i + 1; j < N_CLASSES; j++) {")
            L.append("            int32_t decision = SVM_INTERCEPT[h];")
            L.append("            for (int f = 0; f < N_FEATURES; f++) {")
            L.append("                decision += (int32_t)SVM_COEF[h][f] * q_features[f];")
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
            L.append(f"static const float SVM_COEF[N_HYPERPLANES][N_FEATURES] = {{")
            for row in coefs:
                vals = ", ".join([f"{v:.6f}f" for v in row])
                L.append(f"    {{{vals}}},")
            L.append("};")
            L.append("")
            vals = ", ".join([f"{v:.6f}f" for v in intercepts])
            L.append(f"static const float SVM_INTERCEPT[N_HYPERPLANES] = {{{vals}}};")
            L.append("")

            L.append("int predict(const float *features) {")
            L.append("    float norm[6];")
            L.append("    preprocess_vitals(features, norm);")
            L.append("    float scores[N_CLASSES] = {0};")
            L.append("    int h = 0;")
            L.append("    for (int i = 0; i < N_CLASSES; i++) {")
            L.append("        for (int j = i + 1; j < N_CLASSES; j++) {")
            L.append("            float decision = SVM_INTERCEPT[h];")
            L.append("            for (int f = 0; f < N_FEATURES; f++) {")
            L.append("                decision += SVM_COEF[h][f] * norm[f];")
            L.append("            }")
            L.append("            if (decision > 0.0f) scores[i] += 1.0f;")
            L.append("            else scores[j] += 1.0f;")
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
        n_features = coefs.shape[1]
        n_coef_classes = coefs.shape[0]

        L.append(f"#define N_FEATURES {n_features}")
        L.append(f"#define N_COEF_CLASSES {n_coef_classes}")
        L.append("")

        if quantize:
            scale_factor = 127.0 / max(float(np.max(np.abs(coefs))), float(np.max(np.abs(intercepts))), 1e-6)
            L.append(f"static const int8_t LOGREG_COEF[N_COEF_CLASSES][N_FEATURES] = {{")
            for row in coefs:
                vals = ", ".join([str(int(round(v * scale_factor))) for v in row])
                L.append(f"    {{{vals}}},")
            L.append("};")
            L.append("")
            vals = ", ".join([str(int(round(v * scale_factor * 16.0))) for v in intercepts])
            L.append(f"static const int32_t LOGREG_INTERCEPT[N_COEF_CLASSES] = {{{vals}}};")
            L.append("")

            L.append("int predict(const float *features) {")
            L.append("    int8_t q_features[6];")
            L.append("    preprocess_vitals_int8(features, q_features);")
            L.append("    int32_t scores[N_COEF_CLASSES];")
            L.append("    for (int c = 0; c < N_COEF_CLASSES; c++) {")
            L.append("        scores[c] = LOGREG_INTERCEPT[c];")
            L.append("        for (int f = 0; f < N_FEATURES; f++) {")
            L.append("            scores[c] += (int32_t)LOGREG_COEF[c][f] * q_features[f];")
            L.append("        }")
            L.append("    }")
            if n_coef_classes == 1:
                L.append("    return (scores[0] > 0) ? 1 : 0;")
            else:
                L.append("    int best = 0;")
                L.append("    for (int c = 1; c < N_COEF_CLASSES; c++) {")
                L.append("        if (scores[c] > scores[best]) best = c;")
                L.append("    }")
                L.append("    return best;")
            L.append("}")
        else:
            L.append(f"static const float LOGREG_COEF[N_COEF_CLASSES][N_FEATURES] = {{")
            for row in coefs:
                vals = ", ".join([f"{v:.6f}f" for v in row])
                L.append(f"    {{{vals}}},")
            L.append("};")
            L.append("")
            vals = ", ".join([f"{v:.6f}f" for v in intercepts])
            L.append(f"static const float LOGREG_INTERCEPT[N_COEF_CLASSES] = {{{vals}}};")
            L.append("")

            L.append("int predict(const float *features) {")
            L.append("    float norm[6];")
            L.append("    preprocess_vitals(features, norm);")
            L.append("    float scores[N_COEF_CLASSES];")
            L.append("    for (int c = 0; c < N_COEF_CLASSES; c++) {")
            L.append("        scores[c] = LOGREG_INTERCEPT[c];")
            L.append("        for (int f = 0; f < N_FEATURES; f++) {")
            L.append("            scores[c] += LOGREG_COEF[c][f] * norm[f];")
            L.append("        }")
            L.append("    }")
            if n_coef_classes == 1:
                L.append("    return (scores[0] > 0.0f) ? 1 : 0;")
            else:
                L.append("    int best = 0;")
                L.append("    for (int c = 1; c < N_COEF_CLASSES; c++) {")
                L.append("        if (scores[c] > scores[best]) best = c;")
                L.append("    }")
                L.append("    return best;")
            L.append("}")

    elif model_name == "small_nn" and hasattr(model, 'coefs_'):
        layers = model.coefs_
        biases = model.intercepts_

        if quantize:
            max_val = max([float(np.max(np.abs(w))) for w in layers] + [float(np.max(np.abs(b))) for b in biases] + [1e-6])
            scale_factor = 127.0 / max_val
            for idx, (W, b) in enumerate(zip(layers, biases)):
                n_in, n_out = W.shape
                L.append(f"static const int8_t W{idx}[{n_in}][{n_out}] = {{")
                for row in W:
                    vals = ", ".join([str(int(round(v * scale_factor))) for v in row])
                    L.append(f"    {{{vals}}},")
                L.append("};")
                bvals = ", ".join([str(int(round(v * scale_factor * 16.0))) for v in b])
                L.append(f"static const int32_t B{idx}[{n_out}] = {{{bvals}}};")
                L.append("")

            L.append("static inline int32_t relu_int(int32_t x) { return x > 0 ? x : 0; }")
            L.append("")
            L.append("int predict(const float *features) {")
            L.append("    int8_t input[6];")
            L.append("    preprocess_vitals_int8(features, input);")
            for idx in range(len(layers)):
                n_in = layers[idx].shape[0]
                n_out = layers[idx].shape[1]
                is_last = (idx == len(layers) - 1)
                src = "input" if idx == 0 else f"a{idx-1}"
                L.append(f"    int32_t a{idx}[{n_out}];")
                L.append(f"    for (int j = 0; j < {n_out}; j++) {{")
                L.append(f"        a{idx}[j] = B{idx}[j];")
                L.append(f"        for (int i = 0; i < {n_in}; i++) {{")
                L.append(f"            a{idx}[j] += (int32_t){src}[i] * W{idx}[i][j];")
                L.append("        }")
                if not is_last:
                    L.append(f"        int32_t act_{idx} = relu_int(a{idx}[j]) / {max(1, int(scale_factor))};")
                    L.append(f"        a{idx}[j] = (act_{idx} > 127) ? 127 : act_{idx};")
                L.append("    }")
            last_idx = len(layers) - 1
            last_out = layers[-1].shape[1]
            L.append("    int best = 0;")
            L.append(f"    for (int c = 1; c < {last_out}; c++) {{")
            L.append(f"        if (a{last_idx}[c] > a{last_idx}[best]) best = c;")
            L.append("    }")
            L.append("    return best;")
            L.append("}")
        else:
            for idx, (W, b) in enumerate(zip(layers, biases)):
                n_in, n_out = W.shape
                L.append(f"#define L{idx}_IN {n_in}")
                L.append(f"#define L{idx}_OUT {n_out}")
                L.append(f"static const float W{idx}[{n_in}][{n_out}] = {{")
                for row in W:
                    vals = ", ".join([f"{v:.6f}f" for v in row])
                    L.append(f"    {{{vals}}},")
                L.append("};")
                bvals = ", ".join([f"{v:.6f}f" for v in b])
                L.append(f"static const float B{idx}[{n_out}] = {{{bvals}}};")
                L.append("")

            L.append("static inline float relu_fp(float x) { return x > 0.0f ? x : 0.0f; }")
            L.append("")
            L.append("int predict(const float *features) {")
            L.append("    float input[6];")
            L.append("    preprocess_vitals(features, input);")
            for idx in range(len(layers)):
                n_in = layers[idx].shape[0]
                n_out = layers[idx].shape[1]
                is_last = (idx == len(layers) - 1)
                src = "input" if idx == 0 else f"a{idx-1}"
                L.append(f"    float a{idx}[{n_out}];")
                L.append(f"    for (int j = 0; j < {n_out}; j++) {{")
                L.append(f"        a{idx}[j] = B{idx}[j];")
                L.append(f"        for (int i = 0; i < {n_in}; i++) {{")
                L.append(f"            a{idx}[j] += {src}[i] * W{idx}[i][j];")
                L.append("        }")
                if not is_last:
                    L.append(f"        a{idx}[j] = relu_fp(a{idx}[j]);")
                L.append("    }")
            last_idx = len(layers) - 1
            last_out = layers[-1].shape[1]
            L.append("    int best = 0;")
            L.append(f"    for (int c = 1; c < {last_out}; c++) {{")
            L.append(f"        if (a{last_idx}[c] > a{last_idx}[best]) best = c;")
            L.append("    }")
            L.append("    return best;")
            L.append("}")

    elif model_name == "knn" and hasattr(model, '_fit_X'):
        n_samples = min(model._fit_X.shape[0], 80)
        n_feats = model._fit_X.shape[1]
        L.append(f"#define N_NEIGHBORS {model.n_neighbors}")
        L.append(f"#define N_SAMPLES {n_samples}")
        L.append(f"#define N_FEATURES {n_feats}")
        L.append("")
        L.append("static const float REF[N_SAMPLES][N_FEATURES] = {")
        for row in model._fit_X[:n_samples]:
            vals = ", ".join([f"{v:.4f}f" for v in row])
            L.append(f"    {{{vals}}},")
        L.append("};")
        L.append("")
        labels_str = ", ".join([str(int(l)) for l in model._y[:n_samples]])
        L.append(f"static const int LABELS[N_SAMPLES] = {{{labels_str}}};")
        L.append("")
        L.append("int predict(const float *features) {")
        L.append("    float norm[6];")
        L.append("    preprocess_vitals(features, norm);")
        L.append("    float dists[N_SAMPLES];")
        L.append("    for (int i = 0; i < N_SAMPLES; i++) {")
        L.append("        dists[i] = 0.0f;")
        L.append("        for (int f = 0; f < N_FEATURES; f++) {")
        L.append("            float d = norm[f] - REF[i][f];")
        L.append("            dists[i] += d * d;")
        L.append("        }")
        L.append("    }")
        L.append("    int votes[N_CLASSES] = {0};")
        L.append("    for (int k = 0; k < N_NEIGHBORS; k++) {")
        L.append("        int mi = 0;")
        L.append("        for (int i = 1; i < N_SAMPLES; i++) {")
        L.append("            if (dists[i] < dists[mi]) mi = i;")
        L.append("        }")
        L.append("        if (LABELS[mi] < N_CLASSES) votes[LABELS[mi]]++;")
        L.append("        dists[mi] = 1e18f;")
        L.append("    }")
        L.append("    int best = 0;")
        L.append("    for (int i = 1; i < N_CLASSES; i++) {")
        L.append("        if (votes[i] > votes[best]) best = i;")
        L.append("    }")
        L.append("    return best;")
        L.append("}")
    else:
        return {"error": f"Model {model_name} cannot be exported to C."}

    L.append("")
    L.append("#endif /* HEARTFLOW_MODEL_H */")
    L.append("")

    return {"code": "\n".join(L)}
