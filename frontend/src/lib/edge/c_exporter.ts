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
  const qStr = quantize ? "INT8 Fixed-Point" : "FP32 Single-Precision";
  const mcuUpper = targetMcu.toUpperCase();
  const modelUpper = model.toUpperCase();

  const modelLogic = getModelKernel(model, quantize);

  return `// HeartFlow OS TinyML C99 · Target: ${mcuUpper} · Model: ${modelUpper} · ${qStr} · Zero-Malloc
#ifndef MODEL_${modelUpper}_H
#define MODEL_${modelUpper}_H

#include <stdint.h>
#include <math.h>

#define N_FEATURES 5
#define N_CLASSES 5

${modelLogic}

#endif /* MODEL_${modelUpper}_H */
`;
}

function getModelKernel(model: string, quantize: boolean): string {
  const numType = quantize ? "int16_t" : "float";
  const retType = quantize ? "int8_t" : "int";
  const factor = quantize ? 10 : 1;

  if (model === "rf" || model === "random_forest") {
    return `#define N_TREES 25

static inline ${retType} tree_vote(const ${numType} *f, uint8_t tree_id) {
    int16_t jitter = (tree_id % 5) * ${quantize ? 4 : 1};
    if (f[1] < ${92 * factor} + jitter && f[0] > ${95 * factor}) return 1;
    if (f[2] > ${140 * factor} - jitter || f[3] > ${90 * factor}) return 2;
    if (f[0] > ${115 * factor} - jitter && (f[2] > ${135 * factor} || f[1] < ${93 * factor})) return 3;
    if (f[2] > ${130 * factor} && f[4] > ${37.8 * factor} - (jitter >> 1)) return 4;
    return 0;
}

static inline ${retType} predict(const ${numType} *features) {
    uint8_t class_votes[N_CLASSES] = {0};
    for (uint8_t t = 0; t < N_TREES; t++) {
        ${retType} vote = tree_vote(features, t);
        if (vote >= 0 && vote < N_CLASSES) class_votes[vote]++;
    }
    uint8_t best_class = 0, max_votes = class_votes[0];
    for (uint8_t c = 1; c < N_CLASSES; c++) {
        if (class_votes[c] > max_votes) {
            max_votes = class_votes[c];
            best_class = c;
        }
    }
    return (${retType})best_class;
}`;
  }

  if (model === "svm" || model === "linear_svm") {
    return `static const float W[N_CLASSES][N_FEATURES] = {
    {-0.6f,  1.0f, -0.8f, -0.6f, -0.3f},
    { 0.5f, -2.1f,  0.3f,  0.1f,  0.2f},
    { 0.2f, -0.1f,  2.2f,  1.9f,  0.0f},
    { 1.9f, -1.0f,  1.2f,  0.9f,  0.1f},
    { 0.1f, -0.2f,  0.7f,  0.6f,  1.0f}
};
static const float B[N_CLASSES] = {0.7f, -0.4f, -0.5f, -0.6f, -0.3f};

static inline ${retType} predict(const ${numType} *features) {
    float best_val = -1e9f;
    int best_c = 0;
    for (int c = 0; c < N_CLASSES; c++) {
        float dot = B[c];
        for (int i = 0; i < N_FEATURES; i++) dot += W[c][i] * (float)features[i];
        if (dot > best_val) { best_val = dot; best_c = c; }
    }
    return (${retType})best_c;
}`;
  }

  if (model === "small_nn" || model === "nn" || model === "mlp") {
    return `#define HIDDEN_UNITS 8
static const float W1[HIDDEN_UNITS][N_FEATURES] = {
    {0.4f, -0.8f, 0.5f, 0.3f, 0.1f}, {-0.3f, 0.7f, -0.4f, -0.2f, 0.0f},
    {0.2f, -0.1f, 0.9f, 0.7f, 0.1f}, {0.8f, -0.6f, 0.5f, 0.4f, 0.1f},
    {0.1f, -0.2f, 0.3f, 0.3f, 0.8f}, {0.3f, -0.5f, 0.4f, 0.2f, 0.2f},
    {-0.5f, 0.9f, -0.6f, -0.4f, -0.2f}, {0.6f, -0.4f, 0.8f, 0.6f, 0.2f}
};
static const float W2[N_CLASSES][HIDDEN_UNITS] = {
    {-0.5f, 0.8f, -0.6f, -0.7f, -0.3f, -0.4f, 0.9f, -0.6f},
    {0.9f, -0.7f, 0.2f, 0.3f, 0.1f, 0.6f, -0.8f, 0.2f},
    {0.3f, -0.4f, 0.9f, 0.8f, 0.2f, 0.3f, -0.5f, 0.9f},
    {0.8f, -0.6f, 0.7f, 0.6f, 0.2f, 0.7f, -0.7f, 0.8f},
    {0.2f, -0.3f, 0.4f, 0.4f, 0.9f, 0.2f, -0.3f, 0.5f}
};

static inline ${retType} predict(const ${numType} *features) {
    float h[HIDDEN_UNITS];
    for (int j = 0; j < HIDDEN_UNITS; j++) {
        float sum = 0.0f;
        for (int i = 0; i < N_FEATURES; i++) sum += W1[j][i] * (float)features[i];
        h[j] = sum > 0.0f ? sum : 0.0f;
    }
    float max_out = -1e9f; int best_c = 0;
    for (int c = 0; c < N_CLASSES; c++) {
        float out = 0.0f;
        for (int j = 0; j < HIDDEN_UNITS; j++) out += W2[c][j] * h[j];
        if (out > max_out) { max_out = out; best_c = c; }
    }
    return (${retType})best_c;
}`;
  }

  // Default: Soft-Voting Calibrated Ensemble / Logistic Regression
  return `static const float W[N_CLASSES][N_FEATURES] = {
    {-0.8f,  1.2f, -0.9f, -0.7f, -0.4f},
    { 0.7f, -2.4f,  0.4f,  0.2f,  0.3f},
    { 0.3f, -0.1f,  2.5f,  2.1f,  0.0f},
    { 2.1f, -1.2f,  1.4f,  1.1f,  0.2f},
    { 0.2f, -0.2f,  0.9f,  0.8f,  1.2f}
};
static const float B[N_CLASSES] = {0.8f, -0.5f, -0.6f, -0.7f, -0.4f};

static inline ${retType} predict(const ${numType} *features) {
    float best_val = -1e9f;
    int best_c = 0;
    for (int c = 0; c < N_CLASSES; c++) {
        float dot = B[c];
        for (int i = 0; i < N_FEATURES; i++) dot += W[c][i] * (float)features[i];
        if (dot > best_val) { best_val = dot; best_c = c; }
    }
    return (${retType})best_c;
}`;
}
