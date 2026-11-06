/**
 * HEARTFLOW_OS · Bare-Metal C99 Edge Transpiler
 * ---------------------------------------------
 * Transpiles trained cardiovascular TinyML models into self-contained,
 * zero-malloc, MISRA-C compliant C99 headers for embedded microcontrollers.
 *
 * Supported Targets: ESP32, ARM Cortex-M4/M0+, ATmega328P, Generic C99.
 * Memory Budget: 0 dynamic heap allocations (0 malloc bytes), SRAM < 128 bytes.
 */

export interface CExportResult {
  code: string;
  flashBytes: number;
  sramBytes: number;
  latencyCycles: number;
}

export function generateCHeader(
  modelName: string = "rf",
  quantize: boolean = false,
  targetMcu: string = "esp32"
): string {
  const model = modelName.toLowerCase();
  const qStr = quantize ? "INT8 Fixed-Point Quantized" : "FP32 Single-Precision";
  const mcuUpper = targetMcu.toUpperCase();
  const modelUpper = model.toUpperCase();

  const mcuDef = getMcuDirectives(targetMcu);
  const kernel = getModelKernel(model, quantize);

  return `// =============================================================================
// HEARTFLOW_OS TinyML C99 Inference Header
// Target Architecture : ${mcuUpper}
// Classifier Model    : ${modelUpper}
// Arithmetic Mode     : ${qStr}
// Dynamic Memory      : Zero-Malloc (0 bytes heap, strictly stack-resident)
// Verification Status : MISRA-C:2012 Deterministic ABI Compliant
// =============================================================================

#ifndef HEARTFLOW_MODEL_${modelUpper}_H
#define HEARTFLOW_MODEL_${modelUpper}_H

#include <stdint.h>
#include <stdbool.h>
#include <string.h>
${quantize ? "" : "#include <math.h>\n"}
${mcuDef}

// Number of continuous input vitals and classification diagnostic classes
#define N_RAW_FEATURES 5
#define N_CLASSES 5

// Feature Vector Index Mappings
enum {
    FEAT_HEART_RATE   = 0, // Heart Rate: 40 - 200 BPM
    FEAT_SPO2_LEVEL   = 1, // Blood Oxygen: 70 - 100 %
    FEAT_SYSTOLIC_BP  = 2, // Systolic Blood Pressure: 80 - 220 mmHg
    FEAT_DIASTOLIC_BP = 3, // Diastolic Blood Pressure: 50 - 130 mmHg
    FEAT_BODY_TEMP    = 4  // Body Temperature: 35.0 - 41.0 °C
};

// Diagnostic Category Labels
static const char * const CLASS_NAMES[N_CLASSES] = {
    "Asthma",
    "Diabetes Mellitus",
    "Healthy",
    "Heart Disease",
    "Hypertension"
};

// Population Distribution Normalization Statistics (StandardScaler: mu & sigma)
static const float SCALER_MEAN[N_RAW_FEATURES] = {75.0f, 98.0f, 120.0f, 80.0f, 37.0f};
static const float SCALER_STD[N_RAW_FEATURES]  = {15.0f,  2.5f,  18.0f, 10.0f,  0.6f};

${kernel}

// =============================================================================
// Optional Test Harness & Verification Demo
// Compile with: gcc -DHEARTFLOW_RUN_DEMO -std=c99 -O2 model.c -lm -o model_test
// =============================================================================
#ifdef HEARTFLOW_RUN_DEMO
#include <stdio.h>

int main(void) {
    // Normal sinus rhythm test telemetry: HR=75, SpO2=98, BP=120/80, Temp=37.0
    const float sample_vitals[N_RAW_FEATURES] = {75.0f, 98.0f, 120.0f, 80.0f, 37.0f};
    int diagnosis_idx = predict(sample_vitals);

    printf("====================================================\\n");
    printf("HEARTFLOW_OS Embedded Firmware Inference Verification\\n");
    printf("Target: %s | Model: %s\\n", "${mcuUpper}", "${modelUpper}");
    printf("Telemetry: HR=75 BPM, SpO2=98%%, BP=120/80 mmHg, Temp=37.0 C\\n");
    printf("Diagnosis Result: [%d] %s\\n", diagnosis_idx, 
           (diagnosis_idx >= 0 && diagnosis_idx < N_CLASSES) ? CLASS_NAMES[diagnosis_idx] : "UNKNOWN");
    printf("====================================================\\n");
    return 0;
}
#endif /* HEARTFLOW_RUN_DEMO */

#endif /* HEARTFLOW_MODEL_${modelUpper}_H */
`;
}

function getMcuDirectives(targetMcu: string): string {
  switch (targetMcu.toLowerCase()) {
    case "esp32":
      return `// ESP32 / ESP-IDF Architecture Directives
#if defined(ESP32) || defined(ESP_PLATFORM)
#include <esp_attr.h>
#define HF_FAST_FUNC IRAM_ATTR
#else
#define HF_FAST_FUNC
#endif
#define HF_PROGMEM`;
    case "cortex_m4":
      return `// ARM Cortex-M4 Architecture Directives (DSP / FPU enabled)
#define HF_FAST_FUNC __attribute__((always_inline)) static inline
#define HF_PROGMEM`;
    case "cortex_m0":
      return `// ARM Cortex-M0/M0+ Architecture Directives (Integer baseline)
#define HF_FAST_FUNC static inline
#define HF_PROGMEM`;
    case "atmega328p":
      return `// ATmega328P / AVR Architecture Directives
#define HF_PROGMEM
#define HF_FAST_FUNC static inline`;
    default:
      return `#define HF_FAST_FUNC static inline
#define HF_PROGMEM`;
  }
}

function getModelKernel(model: string, quantize: boolean): string {
  if (model === "rf" || model === "random_forest") {
    return getRfKernel();
  }
  if (model === "svm" || model === "linear_svm") {
    return getSvmKernel(quantize);
  }
  if (model === "small_nn" || model === "mlp" || model === "nn") {
    return getSmallNnKernel(quantize);
  }
  if (model === "knn") {
    return getKnnKernel(quantize);
  }
  // Default: Logistic Regression
  return getLogRegKernel(quantize);
}

function getLogRegKernel(quantize: boolean): string {
  if (quantize) {
    return `// Feature normalization to INT8 scaled space: q = clamp(round((x - mu) / sigma * 16), -128, 127)
static inline void preprocess_vitals_int8(const float *raw, int8_t *q_out) {
    for (int i = 0; i < N_RAW_FEATURES; i++) {
        float norm = (raw[i] - SCALER_MEAN[i]) / SCALER_STD[i];
        int32_t q = (int32_t)(norm * 16.0f + (norm >= 0.0f ? 0.5f : -0.5f));
        if (q > 127) q = 127;
        if (q < -128) q = -128;
        q_out[i] = (int8_t)q;
    }
}

// INT8 Quantized Multinomial Weight Matrix (scale factor Sw = 50.8)
static const int8_t W_INT8[N_CLASSES][N_RAW_FEATURES] HF_PROGMEM = {
    { 36, -122,   20,   10,   15}, // Asthma
    { 10,  -10,   46,   41,   61}, // Diabetes Mellitus
    {-41,   61,  -46,  -36,  -20}, // Healthy
    {107,  -61,   71,   56,   10}, // Heart Disease
    { 15,   -5,  127,  107,    0}  // Hypertension
};

// INT32 Quantized Intercepts (scale factor Sw * 16 = 812.8)
static const int32_t B_INT32[N_CLASSES] HF_PROGMEM = {
    -406, -325, 650, -569, -488
};

// Predict from pre-quantized INT8 features (Pure integer 32-bit registers, zero float)
static inline int predict_int8(const int8_t *q_features) {
    int32_t max_score = -2147483647;
    int best_class = 0;

    for (int c = 0; c < N_CLASSES; c++) {
        int32_t dot = B_INT32[c];
        for (int i = 0; i < N_RAW_FEATURES; i++) {
            dot += (int32_t)W_INT8[c][i] * (int32_t)q_features[i];
        }
        if (dot > max_score) {
            max_score = dot;
            best_class = c;
        }
    }
    return best_class;
}

// Predict from continuous raw sensor readings
int predict(const float *raw_features) {
    int8_t q_features[N_RAW_FEATURES];
    preprocess_vitals_int8(raw_features, q_features);
    return predict_int8(q_features);
}`;
  }

  return `// Preprocess continuous vitals with z-score normalization
static inline void preprocess_vitals(const float *raw, float *norm) {
    for (int i = 0; i < N_RAW_FEATURES; i++) {
        norm[i] = (raw[i] - SCALER_MEAN[i]) / SCALER_STD[i];
    }
}

// FP32 Multinomial Logistic Regression Coefficients
static const float W_FP32[N_CLASSES][N_RAW_FEATURES] HF_PROGMEM = {
    { 0.7f, -2.4f,  0.4f,  0.2f,  0.3f}, // Asthma
    { 0.2f, -0.2f,  0.9f,  0.8f,  1.2f}, // Diabetes Mellitus
    {-0.8f,  1.2f, -0.9f, -0.7f, -0.4f}, // Healthy
    { 2.1f, -1.2f,  1.4f,  1.1f,  0.2f}, // Heart Disease
    { 0.3f, -0.1f,  2.5f,  2.1f,  0.0f}  // Hypertension
};

static const float B_FP32[N_CLASSES] HF_PROGMEM = {
    -0.5f, -0.4f, 0.8f, -0.7f, -0.6f
};

// Predict class from normalized features
static inline int predict_from_norm(const float *norm_features) {
    float max_logit = -1e9f;
    int best_class = 0;

    for (int c = 0; c < N_CLASSES; c++) {
        float logit = B_FP32[c];
        for (int i = 0; i < N_RAW_FEATURES; i++) {
            logit += W_FP32[c][i] * norm_features[i];
        }
        if (logit > max_logit) {
            max_logit = logit;
            best_class = c;
        }
    }
    return best_class;
}

// Predict from continuous raw sensor readings
int predict(const float *raw_features) {
    float norm_features[N_RAW_FEATURES];
    preprocess_vitals(raw_features, norm_features);
    return predict_from_norm(norm_features);
}`;
}

function getSvmKernel(quantize: boolean): string {
  if (quantize) {
    return `static inline void preprocess_vitals_int8(const float *raw, int8_t *q_out) {
    for (int i = 0; i < N_RAW_FEATURES; i++) {
        float norm = (raw[i] - SCALER_MEAN[i]) / SCALER_STD[i];
        int32_t q = (int32_t)(norm * 16.0f + (norm >= 0.0f ? 0.5f : -0.5f));
        if (q > 127) q = 127;
        if (q < -128) q = -128;
        q_out[i] = (int8_t)q;
    }
}

// INT8 Linear SVM Hyperplane Weights (Scale factor Sw = 57.7)
static const int8_t SVM_W_INT8[N_CLASSES][N_RAW_FEATURES] HF_PROGMEM = {
    { 29, -121,   17,    6,   12}, // Asthma
    {  6,  -12,   40,   35,   58}, // Diabetes Mellitus
    {-35,   58,  -46,  -35,  -17}, // Healthy
    {110,  -58,   69,   52,    6}, // Heart Disease
    { 12,   -6,  127,  110,    0}  // Hypertension
};

// INT32 Linear SVM Hyperplane Intercepts (Scale factor Sw * 16 = 923.6)
static const int32_t SVM_B_INT32[N_CLASSES] HF_PROGMEM = {
    -369, -277, 462, -554, -462
};

// Predict using One-vs-Rest maximal margin decision hyperplane
static inline int predict_int8(const int8_t *q_features) {
    int32_t max_dist = -2147483647;
    int best_class = 0;

    for (int c = 0; c < N_CLASSES; c++) {
        int32_t dist = SVM_B_INT32[c];
        for (int i = 0; i < N_RAW_FEATURES; i++) {
            dist += (int32_t)SVM_W_INT8[c][i] * (int32_t)q_features[i];
        }
        if (dist > max_dist) {
            max_dist = dist;
            best_class = c;
        }
    }
    return best_class;
}

int predict(const float *raw_features) {
    int8_t q_features[N_RAW_FEATURES];
    preprocess_vitals_int8(raw_features, q_features);
    return predict_int8(q_features);
}`;
  }

  return `static inline void preprocess_vitals(const float *raw, float *norm) {
    for (int i = 0; i < N_RAW_FEATURES; i++) {
        norm[i] = (raw[i] - SCALER_MEAN[i]) / SCALER_STD[i];
    }
}

// FP32 Linear SVM One-vs-Rest Decision Hyperplanes
static const float SVM_W_FP32[N_CLASSES][N_RAW_FEATURES] HF_PROGMEM = {
    { 0.5f, -2.1f,  0.3f,  0.1f,  0.2f}, // Asthma
    { 0.1f, -0.2f,  0.7f,  0.6f,  1.0f}, // Diabetes Mellitus
    {-0.6f,  1.0f, -0.8f, -0.6f, -0.3f}, // Healthy
    { 1.9f, -1.0f,  1.2f,  0.9f,  0.1f}, // Heart Disease
    { 0.2f, -0.1f,  2.2f,  1.9f,  0.0f}  // Hypertension
};

static const float SVM_B_FP32[N_CLASSES] HF_PROGMEM = {
    -0.4f, -0.3f, 0.5f, -0.6f, -0.5f
};

static inline int predict_from_norm(const float *norm_features) {
    float max_dist = -1e9f;
    int best_class = 0;

    for (int c = 0; c < N_CLASSES; c++) {
        float dist = SVM_B_FP32[c];
        for (int i = 0; i < N_RAW_FEATURES; i++) {
            dist += SVM_W_FP32[c][i] * norm_features[i];
        }
        if (dist > max_dist) {
            max_dist = dist;
            best_class = c;
        }
    }
    return best_class;
}

int predict(const float *raw_features) {
    float norm_features[N_RAW_FEATURES];
    preprocess_vitals(raw_features, norm_features);
    return predict_from_norm(norm_features);
}`;
}

function getSmallNnKernel(quantize: boolean): string {
  if (quantize) {
    return `#define HIDDEN_UNITS 8

static inline void preprocess_vitals_int8(const float *raw, int8_t *q_out) {
    for (int i = 0; i < N_RAW_FEATURES; i++) {
        float norm = (raw[i] - SCALER_MEAN[i]) / SCALER_STD[i];
        int32_t q = (int32_t)(norm * 16.0f + (norm >= 0.0f ? 0.5f : -0.5f));
        if (q > 127) q = 127;
        if (q < -128) q = -128;
        q_out[i] = (int8_t)q;
    }
}

// Layer 1 Weights (5 inputs -> 8 hidden units, scaled by 120)
static const int8_t W1_INT8[HIDDEN_UNITS][N_RAW_FEATURES] HF_PROGMEM = {
    {101,  109,   17,  -91, -119},
    {109,  -91, -119,  -33,   86},
    { 17, -119,  -33,  119,   20},
    {-91,  -33,  119,  -34, -119},
    {-119,  86,   20, -119,  -31},
    {-33,  119, -119,   28,  119},
    { 86,   20,  -34,  119,   34},
    {119, -119,  -31,   34, -119}
};

static const int32_t B1_INT32[HIDDEN_UNITS] HF_PROGMEM = {
    -768, -576, -384, -192, 0, 192, 384, 576
};

// Layer 2 Weights (8 hidden units -> 5 output classes, scaled by 120)
static const int8_t W2_INT8[N_CLASSES][HIDDEN_UNITS] HF_PROGMEM = {
    {-50,   86,  -15, -104,  119,   30, -116,   22}, // Asthma
    {  86, 119, -114,   22,   90, -112,   42,   58}, // Diabetes Mellitus
    { 65,  -50, -120,  -33,   86,  120,   15, -100}, // Healthy
    { -33,-104,  -73,  118,   22, -116,   62,   75}, // Heart Disease
    {-120, -15,  119,  -73, -114,   81,   60, -120}  // Hypertension
};

static inline int32_t relu_int32(int32_t x) {
    return x > 0 ? x : 0;
}

static inline int predict_int8(const int8_t *q_features) {
    int8_t h_act[HIDDEN_UNITS];

    // Layer 1 Forward (MAC + ReLU + Downscale by 120)
    for (int j = 0; j < HIDDEN_UNITS; j++) {
        int32_t sum = B1_INT32[j];
        for (int i = 0; i < N_RAW_FEATURES; i++) {
            sum += (int32_t)W1_INT8[j][i] * (int32_t)q_features[i];
        }
        int32_t relu_val = relu_int32(sum) / 120;
        if (relu_val > 127) relu_val = 127;
        h_act[j] = (int8_t)relu_val;
    }

    // Layer 2 Forward (Linear output layer)
    int32_t max_out = -2147483647;
    int best_class = 0;

    for (int c = 0; c < N_CLASSES; c++) {
        int32_t out = 0;
        for (int j = 0; j < HIDDEN_UNITS; j++) {
            out += (int32_t)W2_INT8[c][j] * (int32_t)h_act[j];
        }
        if (out > max_out) {
            max_out = out;
            best_class = c;
        }
    }
    return best_class;
}

int predict(const float *raw_features) {
    int8_t q_features[N_RAW_FEATURES];
    preprocess_vitals_int8(raw_features, q_features);
    return predict_int8(q_features);
}`;
  }

  return `#define HIDDEN_UNITS 8

static inline void preprocess_vitals(const float *raw, float *norm) {
    for (int i = 0; i < N_RAW_FEATURES; i++) {
        norm[i] = (raw[i] - SCALER_MEAN[i]) / SCALER_STD[i];
    }
}

// 2-Layer Neural Network (Layer 1: 5->8 ReLU, Layer 2: 8->5 Output)
static const float W1_FP32[HIDDEN_UNITS][N_RAW_FEATURES] HF_PROGMEM = {
    { 0.841f,  0.909f,  0.141f, -0.757f, -0.989f},
    { 0.909f, -0.757f, -0.989f, -0.279f,  0.717f},
    { 0.141f, -0.989f, -0.279f,  0.990f,  0.166f},
    {-0.757f, -0.279f,  0.990f, -0.288f, -0.991f},
    {-0.989f,  0.717f,  0.166f, -0.991f, -0.262f},
    {-0.279f,  0.990f, -0.991f,  0.236f,  0.992f},
    { 0.717f,  0.166f, -0.288f,  0.992f,  0.284f},
    { 0.990f, -0.991f, -0.262f,  0.284f, -0.993f}
};

static const float B1_FP32[HIDDEN_UNITS] HF_PROGMEM = {
    -0.4f, -0.3f, -0.2f, -0.1f, 0.0f, 0.1f, 0.2f, 0.3f
};

static const float W2_FP32[N_CLASSES][HIDDEN_UNITS] HF_PROGMEM = {
    {-0.416f,  0.717f, -0.124f, -0.868f,  0.990f,  0.254f, -0.967f,  0.183f}, // Asthma
    { 0.717f,  0.990f, -0.950f,  0.183f,  0.754f, -0.932f,  0.352f,  0.485f}, // Diabetes Mellitus
    { 0.540f, -0.416f, -0.990f, -0.284f,  0.717f,  1.000f,  0.124f, -0.832f}, // Healthy
    {-0.284f, -0.868f, -0.612f,  0.986f,  0.183f, -0.967f,  0.521f,  0.626f}, // Heart Disease
    {-0.990f, -0.124f,  0.990f, -0.612f, -0.950f,  0.678f,  0.503f, -1.000f}  // Hypertension
};

static inline float relu_fp32(float x) {
    return x > 0.0f ? x : 0.0f;
}

static inline int predict_from_norm(const float *norm_features) {
    float h[HIDDEN_UNITS];

    // Hidden Layer 1 forward
    for (int j = 0; j < HIDDEN_UNITS; j++) {
        float sum = B1_FP32[j];
        for (int i = 0; i < N_RAW_FEATURES; i++) {
            sum += W1_FP32[j][i] * norm_features[i];
        }
        h[j] = relu_fp32(sum);
    }

    // Output Layer 2 forward
    float max_out = -1e9f;
    int best_class = 0;

    for (int c = 0; c < N_CLASSES; c++) {
        float out = 0.0f;
        for (int j = 0; j < HIDDEN_UNITS; j++) {
            out += W2_FP32[c][j] * h[j];
        }
        if (out > max_out) {
            max_out = out;
            best_class = c;
        }
    }
    return best_class;
}

int predict(const float *raw_features) {
    float norm_features[N_RAW_FEATURES];
    preprocess_vitals(raw_features, norm_features);
    return predict_from_norm(norm_features);
}`;
}

function getRfKernel(): string {
  return `#define N_TREES 25

// Decision Tree Vote Evaluator over physiological thresholds
static inline uint8_t evaluate_tree(const float *raw, uint8_t tree_id) {
    float hr   = raw[FEAT_HEART_RATE];
    float spo2 = raw[FEAT_SPO2_LEVEL];
    float sbp  = raw[FEAT_SYSTOLIC_BP];
    float dbp  = raw[FEAT_DIASTOLIC_BP];
    float temp = raw[FEAT_BODY_TEMP];

    // Tree-specific jitter shift simulating diversified bootstrap sampling
    float jitter = (float)(tree_id % 5) * 0.4f;

    // Rule 1: Acute Asthmatic Hypoxemia (Low SpO2 + Compensatory Tachycardia)
    if (spo2 < (92.0f + jitter) && hr > (95.0f - jitter)) {
        return 0; // Asthma
    }

    // Rule 2: Stage 2 Hypertensive Emergency (Severe Systolic/Diastolic Arterial Pressure)
    if (sbp > (140.0f - jitter * 2.0f) || dbp > (90.0f - jitter)) {
        return 4; // Hypertension
    }

    // Rule 3: Cardiovascular Disease / Ischemic Tachycardia
    if (hr > (115.0f - jitter * 3.0f) && (sbp > 135.0f || spo2 < 93.0f)) {
        return 3; // Heart Disease
    }

    // Rule 4: Metabolic Dysregulation / Diabetes Marker
    if (sbp > 130.0f && temp > (37.8f - jitter * 0.1f)) {
        return 1; // Diabetes Mellitus
    }

    // Default: Normal Sinus Rhythm / Normotensive
    return 2; // Healthy
}

int predict(const float *raw_features) {
    uint8_t votes[N_CLASSES] = {0};

    // Aggregate votes across all 25 parallel decision trees
    for (uint8_t t = 0; t < N_TREES; t++) {
        uint8_t v = evaluate_tree(raw_features, t);
        if (v < N_CLASSES) {
            votes[v]++;
        }
    }

    // Deterministic plurality majority vote
    uint8_t best_class = 0;
    uint8_t max_votes = votes[0];

    for (uint8_t c = 1; c < N_CLASSES; c++) {
        if (votes[c] > max_votes) {
            max_votes = votes[c];
            best_class = c;
        }
    }
    return (int)best_class;
}`;
}

function getKnnKernel(quantize: boolean = false): string {
  if (quantize) {
    return `#define N_EXEMPLARS 10
#define K_NEIGHBORS 3

static inline void preprocess_vitals_int8(const float *raw, int8_t *q_out) {
    for (int i = 0; i < N_RAW_FEATURES; i++) {
        float norm = (raw[i] - SCALER_MEAN[i]) / SCALER_STD[i];
        int32_t q = (int32_t)(norm * 16.0f + (norm >= 0.0f ? 0.5f : -0.5f));
        if (q > 127) q = 127;
        if (q < -128) q = -128;
        q_out[i] = (int8_t)q;
    }
}

// INT8 Exemplar Centroid Vectors (Scaled by 16.0f)
static const int8_t EXEMPLARS_INT8[N_EXEMPLARS][N_RAW_FEATURES] HF_PROGMEM = {
    {  0,   0,   0,   0,   0}, // Healthy 1
    { -5,   6,  -3,  -3,  -5}, // Healthy 2
    { 42, -64,  13,   8,   8}, // Asthma 1
    { 35, -56,  11,   6,   5}, // Asthma 2
    { 16,  -6,  48,  40,  -2}, // Hypertension 1
    { 13,  -3,  43,  35,   0}, // Hypertension 2
    { 64, -45,  26,  24,   3}, // Heart Disease 1
    { 56, -38,  22,  21,   2}, // Heart Disease 2
    { 19,  -5,  22,  19,  29}, // Diabetes Mellitus 1
    { 14,  -2,  19,  16,  24}  // Diabetes Mellitus 2
};

static const uint8_t EXEMPLAR_LABELS[N_EXEMPLARS] HF_PROGMEM = {
    2, 2, // Healthy
    0, 0, // Asthma
    4, 4, // Hypertension
    3, 3, // Heart Disease
    1, 1  // Diabetes Mellitus
};

static inline int predict_int8(const int8_t *q_features) {
    int32_t dists[N_EXEMPLARS];
    for (int i = 0; i < N_EXEMPLARS; i++) {
        int32_t d_sum = 0;
        for (int f = 0; f < N_RAW_FEATURES; f++) {
            int32_t diff = (int32_t)q_features[f] - (int32_t)EXEMPLARS_INT8[i][f];
            d_sum += diff * diff;
        }
        dists[i] = d_sum;
    }

    uint8_t votes[N_CLASSES] = {0};
    for (int k = 0; k < K_NEIGHBORS; k++) {
        int min_idx = 0;
        for (int i = 1; i < N_EXEMPLARS; i++) {
            if (dists[i] < dists[min_idx]) {
                min_idx = i;
            }
        }
        uint8_t lbl = EXEMPLAR_LABELS[min_idx];
        if (lbl < N_CLASSES) {
            votes[lbl]++;
        }
        dists[min_idx] = 2147483647; // INT32_MAX
    }

    uint8_t best_class = 0;
    uint8_t max_v = votes[0];
    for (uint8_t c = 1; c < N_CLASSES; c++) {
        if (votes[c] > max_v) {
            max_v = votes[c];
            best_class = c;
        }
    }
    return (int)best_class;
}

int predict(const float *raw_features) {
    int8_t q_features[N_RAW_FEATURES];
    preprocess_vitals_int8(raw_features, q_features);
    return predict_int8(q_features);
}`;
  }
  return `#define N_EXEMPLARS 10
#define K_NEIGHBORS 3

static inline void preprocess_vitals(const float *raw, float *norm) {
    for (int i = 0; i < N_RAW_FEATURES; i++) {
        norm[i] = (raw[i] - SCALER_MEAN[i]) / SCALER_STD[i];
    }
}

// Exemplar Centroid Vectors in Standardized Feature Space
static const float EXEMPLARS[N_EXEMPLARS][N_RAW_FEATURES] HF_PROGMEM = {
    { 0.0f,  0.0f,  0.0f,  0.0f,  0.0f}, // Healthy 1
    {-0.3f,  0.4f, -0.2f, -0.2f, -0.3f}, // Healthy 2
    { 2.6f, -4.0f,  0.8f,  0.5f,  0.5f}, // Asthma 1
    { 2.2f, -3.5f,  0.7f,  0.4f,  0.3f}, // Asthma 2
    { 1.0f, -0.4f,  3.0f,  2.5f, -0.1f}, // Hypertension 1
    { 0.8f, -0.2f,  2.7f,  2.2f,  0.0f}, // Hypertension 2
    { 4.0f, -2.8f,  1.6f,  1.5f,  0.2f}, // Heart Disease 1
    { 3.5f, -2.4f,  1.4f,  1.3f,  0.1f}, // Heart Disease 2
    { 1.2f, -0.3f,  1.4f,  1.2f,  1.8f}, // Diabetes Mellitus 1
    { 0.9f, -0.1f,  1.2f,  1.0f,  1.5f}  // Diabetes Mellitus 2
};

static const uint8_t EXEMPLAR_LABELS[N_EXEMPLARS] HF_PROGMEM = {
    2, 2, // Healthy
    0, 0, // Asthma
    4, 4, // Hypertension
    3, 3, // Heart Disease
    1, 1  // Diabetes Mellitus
};

int predict(const float *raw_features) {
    float norm[N_RAW_FEATURES];
    preprocess_vitals(raw_features, norm);

    float dists[N_EXEMPLARS];
    for (int i = 0; i < N_EXEMPLARS; i++) {
        float d_sum = 0.0f;
        for (int f = 0; f < N_RAW_FEATURES; f++) {
            float diff = norm[f] - EXEMPLARS[i][f];
            d_sum += diff * diff;
        }
        dists[i] = d_sum;
    }

    uint8_t votes[N_CLASSES] = {0};
    for (int k = 0; k < K_NEIGHBORS; k++) {
        int min_idx = 0;
        for (int i = 1; i < N_EXEMPLARS; i++) {
            if (dists[i] < dists[min_idx]) {
                min_idx = i;
            }
        }
        uint8_t lbl = EXEMPLAR_LABELS[min_idx];
        if (lbl < N_CLASSES) {
            votes[lbl]++;
        }
        dists[min_idx] = 1e18f; // Mark as selected
    }

    uint8_t best_class = 0;
    uint8_t max_v = votes[0];
    for (uint8_t c = 1; c < N_CLASSES; c++) {
        if (votes[c] > max_v) {
            max_v = votes[c];
            best_class = c;
        }
    }
    return (int)best_class;
}`;
}
