// AUTO-GENERATED TELEMETRY DATASET PROFILE
// Ground Truth Corpus: 60000 Verified Patient Telemetry Observations
// Physiological Telemetry Sensor Calibration Pipeline

export interface BinData {
  label: string;
  min: number;
  max: number;
  count: number;
  pct: number;
}

export interface FeatureStat {
  key: string;
  name: string;
  unit: string;
  desc: string;
  normal_range: string;
  normal_min: number;
  normal_max: number;
  alert: string;
  mean: number;
  std: number;
  min: number;
  q25: number;
  median: number;
  q75: number;
  max: number;
  iqr: number;
  bins: BinData[];
  means_by_disease: Record<string, number>;
}

export interface TargetClass {
  disease: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AlertPrevalence {
  name: string;
  abnormal_count: number;
  normal_count: number;
  abnormal_pct: number;
}

export interface CorrelationMatrix {
  labels: string[];
  keys: string[];
  matrix: number[][];
}

export interface FeatureDependency {
  feature: string;
  key: string;
  correlation: number;
  abs_corr: number;
  unit: string;
  impact: string;
}

export interface DatasetSummary {
  total_records: number;
  total_features: number;
  file_size_mb: number;
  missing_values: number;
  completeness_pct: number;
  classes_count: number;
  sampling_fidelity: string;
}

export interface DatasetProfile {
  summary: DatasetSummary;
  columns: string[];
  target_distribution: TargetClass[];
  alert_prevalence: AlertPrevalence[];
  feature_stats: FeatureStat[];
  correlation_matrix: CorrelationMatrix;
  feature_dependencies: FeatureDependency[];
  sample_rows: Record<string, unknown>[];
}

export const DATASET_PROFILE: DatasetProfile = {
  "summary": {
    "total_records": 60000,
    "total_features": 13,
    "file_size_mb": 4.49,
    "missing_values": 0,
    "completeness_pct": 100.0,
    "classes_count": 5,
    "sampling_fidelity": "High-Integrity Telemetry Validated"
  },
  "columns": [
    "Patient Number",
    "Heart Rate (bpm)",
    "SpO2 Level (%)",
    "Systolic Blood Pressure (mmHg)",
    "Diastolic Blood Pressure (mmHg)",
    "Body Temperature (\u00b0C)",
    "Fall Detection",
    "Predicted Disease",
    "Data Accuracy (%)",
    "Heart Rate Alert",
    "SpO2 Level Alert",
    "Blood Pressure Alert",
    "Temperature Alert"
  ],
  "target_distribution": [
    {
      "disease": "Diabetes Mellitus",
      "count": 12167,
      "percentage": 20.28,
      "color": "#2563EB"
    },
    {
      "disease": "Heart Disease",
      "count": 12044,
      "percentage": 20.07,
      "color": "#9F2F2D"
    },
    {
      "disease": "Healthy",
      "count": 11973,
      "percentage": 19.96,
      "color": "#16A34A"
    },
    {
      "disease": "Hypertension",
      "count": 11928,
      "percentage": 19.88,
      "color": "#D97706"
    },
    {
      "disease": "Asthma",
      "count": 11888,
      "percentage": 19.81,
      "color": "#7C3AED"
    }
  ],
  "alert_prevalence": [
    {
      "name": "Blood Pressure Alert",
      "abnormal_count": 33470,
      "normal_count": 26530,
      "abnormal_pct": 55.78
    },
    {
      "name": "Heart Rate Alert",
      "abnormal_count": 23008,
      "normal_count": 36992,
      "abnormal_pct": 38.35
    },
    {
      "name": "SpO2 Level Alert",
      "abnormal_count": 25230,
      "normal_count": 34770,
      "abnormal_pct": 42.05
    },
    {
      "name": "Temperature Alert",
      "abnormal_count": 15344,
      "normal_count": 44656,
      "abnormal_pct": 25.57
    },
    {
      "name": "Fall Detection Event",
      "abnormal_count": 3074,
      "normal_count": 56926,
      "abnormal_pct": 5.12
    }
  ],
  "feature_stats": [
    {
      "key": "Heart Rate (bpm)",
      "name": "Heart Rate",
      "unit": "bpm",
      "desc": "Cardiac chronotropic telemetry frequency",
      "normal_range": "60\u2013100 bpm",
      "normal_min": 60,
      "normal_max": 100,
      "alert": "Pulse > 100 bpm (Tachycardia) or < 60 bpm (Bradycardia)",
      "mean": 94.57,
      "std": 18.38,
      "min": 50.0,
      "q25": 82.0,
      "median": 95.0,
      "q75": 106.0,
      "max": 139.0,
      "iqr": 24.0,
      "bins": [
        {
          "label": "50.0\u201357.4",
          "min": 50.0,
          "max": 57.4,
          "count": 396,
          "pct": 0.66
        },
        {
          "label": "57.4\u201364.8",
          "min": 57.4,
          "max": 64.8,
          "count": 2703,
          "pct": 4.5
        },
        {
          "label": "64.8\u201372.2",
          "min": 64.8,
          "max": 72.2,
          "count": 4578,
          "pct": 7.63
        },
        {
          "label": "72.2\u201379.7",
          "min": 72.2,
          "max": 79.7,
          "count": 4645,
          "pct": 7.74
        },
        {
          "label": "79.7\u201387.1",
          "min": 79.7,
          "max": 87.1,
          "count": 8995,
          "pct": 14.99
        },
        {
          "label": "87.1\u201394.5",
          "min": 87.1,
          "max": 94.5,
          "count": 8629,
          "pct": 14.38
        },
        {
          "label": "94.5\u2013101.9",
          "min": 94.5,
          "max": 101.9,
          "count": 9069,
          "pct": 15.12
        },
        {
          "label": "101.9\u2013109.3",
          "min": 101.9,
          "max": 109.3,
          "count": 11366,
          "pct": 18.94
        },
        {
          "label": "109.3\u2013116.8",
          "min": 109.3,
          "max": 116.8,
          "count": 2492,
          "pct": 4.15
        },
        {
          "label": "116.8\u2013124.2",
          "min": 116.8,
          "max": 124.2,
          "count": 2527,
          "pct": 4.21
        },
        {
          "label": "124.2\u2013131.6",
          "min": 124.2,
          "max": 131.6,
          "count": 2165,
          "pct": 3.61
        },
        {
          "label": "131.6\u2013139.0",
          "min": 131.6,
          "max": 139.0,
          "count": 2435,
          "pct": 4.06
        }
      ],
      "means_by_disease": {
        "Asthma": 99.57,
        "Diabetes Mellitus": 94.44,
        "Healthy": 74.44,
        "Heart Disease": 119.59,
        "Hypertension": 84.67
      }
    },
    {
      "key": "SpO2 Level (%)",
      "name": "SpO2 Oxygen Saturation",
      "unit": "%",
      "desc": "Arterial blood oxygen saturation telemetry",
      "normal_range": "95\u2013100 %",
      "normal_min": 95,
      "normal_max": 100,
      "alert": "Saturation < 95% (Hypoxemia threshold)",
      "mean": 94.55,
      "std": 3.84,
      "min": 84.0,
      "q25": 92.0,
      "median": 96.0,
      "q75": 98.0,
      "max": 100.0,
      "iqr": 6.0,
      "bins": [
        {
          "label": "84.0\u201385.3",
          "min": 84.0,
          "max": 85.3,
          "count": 1412,
          "pct": 2.35
        },
        {
          "label": "85.3\u201386.7",
          "min": 85.3,
          "max": 86.7,
          "count": 1311,
          "pct": 2.19
        },
        {
          "label": "86.7\u201388.0",
          "min": 86.7,
          "max": 88.0,
          "count": 1407,
          "pct": 2.34
        },
        {
          "label": "88.0\u201389.3",
          "min": 88.0,
          "max": 89.3,
          "count": 3321,
          "pct": 5.54
        },
        {
          "label": "89.3\u201390.7",
          "min": 89.3,
          "max": 90.7,
          "count": 2241,
          "pct": 3.74
        },
        {
          "label": "90.7\u201392.0",
          "min": 90.7,
          "max": 92.0,
          "count": 2855,
          "pct": 4.76
        },
        {
          "label": "92.0\u201393.3",
          "min": 92.0,
          "max": 93.3,
          "count": 8443,
          "pct": 14.07
        },
        {
          "label": "93.3\u201394.7",
          "min": 93.3,
          "max": 94.7,
          "count": 4240,
          "pct": 7.07
        },
        {
          "label": "94.7\u201396.0",
          "min": 94.7,
          "max": 96.0,
          "count": 4743,
          "pct": 7.9
        },
        {
          "label": "96.0\u201397.3",
          "min": 96.0,
          "max": 97.3,
          "count": 15001,
          "pct": 25.0
        },
        {
          "label": "97.3\u201398.7",
          "min": 97.3,
          "max": 98.7,
          "count": 6289,
          "pct": 10.48
        },
        {
          "label": "98.7\u2013100.0",
          "min": 98.7,
          "max": 100.0,
          "count": 8737,
          "pct": 14.56
        }
      ],
      "means_by_disease": {
        "Asthma": 88.98,
        "Diabetes Mellitus": 95.43,
        "Healthy": 97.49,
        "Heart Disease": 95.43,
        "Hypertension": 95.39
      }
    },
    {
      "key": "Systolic Blood Pressure (mmHg)",
      "name": "Systolic Blood Pressure",
      "unit": "mmHg",
      "desc": "Peak ventricular contraction arterial pressure",
      "normal_range": "90\u2013120 mmHg",
      "normal_min": 90,
      "normal_max": 120,
      "alert": "Pressure > 140 mmHg (Hypertensive crisis risk)",
      "mean": 139.15,
      "std": 26.93,
      "min": 90.0,
      "q25": 116.0,
      "median": 138.0,
      "q75": 161.0,
      "max": 199.0,
      "iqr": 45.0,
      "bins": [
        {
          "label": "90.0\u201399.1",
          "min": 90.0,
          "max": 99.1,
          "count": 2499,
          "pct": 4.17
        },
        {
          "label": "99.1\u2013108.2",
          "min": 99.1,
          "max": 108.2,
          "count": 2536,
          "pct": 4.23
        },
        {
          "label": "108.2\u2013117.2",
          "min": 108.2,
          "max": 117.2,
          "count": 13155,
          "pct": 21.93
        },
        {
          "label": "117.2\u2013126.3",
          "min": 117.2,
          "max": 126.3,
          "count": 6748,
          "pct": 11.25
        },
        {
          "label": "126.3\u2013135.4",
          "min": 126.3,
          "max": 135.4,
          "count": 4001,
          "pct": 6.67
        },
        {
          "label": "135.4\u2013144.5",
          "min": 135.4,
          "max": 144.5,
          "count": 4759,
          "pct": 7.93
        },
        {
          "label": "144.5\u2013153.6",
          "min": 144.5,
          "max": 153.6,
          "count": 6807,
          "pct": 11.34
        },
        {
          "label": "153.6\u2013162.7",
          "min": 153.6,
          "max": 162.7,
          "count": 5700,
          "pct": 9.5
        },
        {
          "label": "162.7\u2013171.8",
          "min": 162.7,
          "max": 171.8,
          "count": 5110,
          "pct": 8.52
        },
        {
          "label": "171.8\u2013180.8",
          "min": 171.8,
          "max": 180.8,
          "count": 4472,
          "pct": 7.45
        },
        {
          "label": "180.8\u2013189.9",
          "min": 180.8,
          "max": 189.9,
          "count": 2059,
          "pct": 3.43
        },
        {
          "label": "189.9\u2013199.0",
          "min": 189.9,
          "max": 199.0,
          "count": 2154,
          "pct": 3.59
        }
      ],
      "means_by_disease": {
        "Asthma": 124.87,
        "Diabetes Mellitus": 125.13,
        "Healthy": 114.51,
        "Heart Disease": 159.34,
        "Hypertension": 172.03
      }
    },
    {
      "key": "Diastolic Blood Pressure (mmHg)",
      "name": "Diastolic Blood Pressure",
      "unit": "mmHg",
      "desc": "Resting ventricular filling arterial pressure",
      "normal_range": "60\u201380 mmHg",
      "normal_min": 60,
      "normal_max": 80,
      "alert": "Pressure > 90 mmHg (Hypertension boundary)",
      "mean": 88.95,
      "std": 17.86,
      "min": 50.0,
      "q25": 75.0,
      "median": 89.0,
      "q75": 102.0,
      "max": 130.0,
      "iqr": 27.0,
      "bins": [
        {
          "label": "50.0\u201356.7",
          "min": 50.0,
          "max": 56.7,
          "count": 1545,
          "pct": 2.57
        },
        {
          "label": "56.7\u201363.3",
          "min": 56.7,
          "max": 63.3,
          "count": 1937,
          "pct": 3.23
        },
        {
          "label": "63.3\u201370.0",
          "min": 63.3,
          "max": 70.0,
          "count": 2673,
          "pct": 4.46
        },
        {
          "label": "70.0\u201376.7",
          "min": 70.0,
          "max": 76.7,
          "count": 12415,
          "pct": 20.69
        },
        {
          "label": "76.7\u201383.3",
          "min": 76.7,
          "max": 83.3,
          "count": 8081,
          "pct": 13.47
        },
        {
          "label": "83.3\u201390.0",
          "min": 83.3,
          "max": 90.0,
          "count": 3362,
          "pct": 5.6
        },
        {
          "label": "90.0\u201396.7",
          "min": 90.0,
          "max": 96.7,
          "count": 7818,
          "pct": 13.03
        },
        {
          "label": "96.7\u2013103.3",
          "min": 96.7,
          "max": 103.3,
          "count": 8373,
          "pct": 13.96
        },
        {
          "label": "103.3\u2013110.0",
          "min": 103.3,
          "max": 110.0,
          "count": 6590,
          "pct": 10.98
        },
        {
          "label": "110.0\u2013116.7",
          "min": 110.0,
          "max": 116.7,
          "count": 2691,
          "pct": 4.49
        },
        {
          "label": "116.7\u2013123.3",
          "min": 116.7,
          "max": 123.3,
          "count": 2475,
          "pct": 4.12
        },
        {
          "label": "123.3\u2013130.0",
          "min": 123.3,
          "max": 130.0,
          "count": 2040,
          "pct": 3.4
        }
      ],
      "means_by_disease": {
        "Asthma": 79.45,
        "Diabetes Mellitus": 79.51,
        "Healthy": 74.53,
        "Heart Disease": 99.57,
        "Hypertension": 111.81
      }
    },
    {
      "key": "Body Temperature (\u00b0C)",
      "name": "Body Temperature",
      "unit": "\u00b0C",
      "desc": "Physiological thermal equilibrium reading",
      "normal_range": "36.5\u201337.5 \u00b0C",
      "normal_min": 36.5,
      "normal_max": 37.5,
      "alert": "Core Temp > 37.8\u00b0C (Pyrexia) or < 36.0\u00b0C (Hypothermia)",
      "mean": 37.12,
      "std": 0.63,
      "min": 35.0,
      "q25": 36.7,
      "median": 37.0,
      "q75": 37.6,
      "max": 39.3,
      "iqr": 0.9,
      "bins": [
        {
          "label": "35.0\u201335.4",
          "min": 35.0,
          "max": 35.4,
          "count": 118,
          "pct": 0.2
        },
        {
          "label": "35.4\u201335.7",
          "min": 35.4,
          "max": 35.7,
          "count": 590,
          "pct": 0.98
        },
        {
          "label": "35.7\u201336.1",
          "min": 35.7,
          "max": 36.1,
          "count": 1294,
          "pct": 2.16
        },
        {
          "label": "36.1\u201336.4",
          "min": 36.1,
          "max": 36.4,
          "count": 4409,
          "pct": 7.35
        },
        {
          "label": "36.4\u201336.8",
          "min": 36.4,
          "max": 36.8,
          "count": 11752,
          "pct": 19.59
        },
        {
          "label": "36.8\u201337.1",
          "min": 36.8,
          "max": 37.1,
          "count": 15335,
          "pct": 25.56
        },
        {
          "label": "37.1\u201337.5",
          "min": 37.1,
          "max": 37.5,
          "count": 11158,
          "pct": 18.6
        },
        {
          "label": "37.5\u201337.9",
          "min": 37.5,
          "max": 37.9,
          "count": 6405,
          "pct": 10.67
        },
        {
          "label": "37.9\u201338.2",
          "min": 37.9,
          "max": 38.2,
          "count": 6017,
          "pct": 10.03
        },
        {
          "label": "38.2\u201338.6",
          "min": 38.2,
          "max": 38.6,
          "count": 2749,
          "pct": 4.58
        },
        {
          "label": "38.6\u201338.9",
          "min": 38.6,
          "max": 38.9,
          "count": 156,
          "pct": 0.26
        },
        {
          "label": "38.9\u201339.3",
          "min": 38.9,
          "max": 39.3,
          "count": 17,
          "pct": 0.03
        }
      ],
      "means_by_disease": {
        "Asthma": 37.0,
        "Diabetes Mellitus": 37.85,
        "Healthy": 36.75,
        "Heart Disease": 37.0,
        "Hypertension": 36.99
      }
    },
    {
      "key": "Data Accuracy (%)",
      "name": "Telemetry Data Accuracy",
      "unit": "%",
      "desc": "Hardware sensor packet integrity & SNR confidence",
      "normal_range": "90\u2013100 %",
      "normal_min": 90,
      "normal_max": 100,
      "alert": "SNR Packet Fidelity < 85%",
      "mean": 92.51,
      "std": 4.61,
      "min": 85.0,
      "q25": 89.0,
      "median": 93.0,
      "q75": 97.0,
      "max": 100.0,
      "iqr": 8.0,
      "bins": [
        {
          "label": "85.0\u201386.2",
          "min": 85.0,
          "max": 86.2,
          "count": 7472,
          "pct": 12.45
        },
        {
          "label": "86.2\u201387.5",
          "min": 86.2,
          "max": 87.5,
          "count": 3682,
          "pct": 6.14
        },
        {
          "label": "87.5\u201388.8",
          "min": 87.5,
          "max": 88.8,
          "count": 3799,
          "pct": 6.33
        },
        {
          "label": "88.8\u201390.0",
          "min": 88.8,
          "max": 90.0,
          "count": 3787,
          "pct": 6.31
        },
        {
          "label": "90.0\u201391.2",
          "min": 90.0,
          "max": 91.2,
          "count": 7478,
          "pct": 12.46
        },
        {
          "label": "91.2\u201392.5",
          "min": 91.2,
          "max": 92.5,
          "count": 3690,
          "pct": 6.15
        },
        {
          "label": "92.5\u201393.8",
          "min": 92.5,
          "max": 93.8,
          "count": 3866,
          "pct": 6.44
        },
        {
          "label": "93.8\u201395.0",
          "min": 93.8,
          "max": 95.0,
          "count": 3680,
          "pct": 6.13
        },
        {
          "label": "95.0\u201396.2",
          "min": 95.0,
          "max": 96.2,
          "count": 7495,
          "pct": 12.49
        },
        {
          "label": "96.2\u201397.5",
          "min": 96.2,
          "max": 97.5,
          "count": 3670,
          "pct": 6.12
        },
        {
          "label": "97.5\u201398.8",
          "min": 97.5,
          "max": 98.8,
          "count": 3842,
          "pct": 6.4
        },
        {
          "label": "98.8\u2013100.0",
          "min": 98.8,
          "max": 100.0,
          "count": 7539,
          "pct": 12.57
        }
      ],
      "means_by_disease": {
        "Asthma": 92.5,
        "Diabetes Mellitus": 92.43,
        "Healthy": 92.49,
        "Heart Disease": 92.63,
        "Hypertension": 92.51
      }
    }
  ],
  "correlation_matrix": {
    "labels": [
      "Heart Rate",
      "SpO2 Oxygen",
      "Systolic BP",
      "Diastolic BP",
      "Body Temp",
      "Accuracy",
      "Risk Severity",
      "Heart Disease",
      "Hypertension"
    ],
    "keys": [
      "Heart Rate (bpm)",
      "SpO2 Level (%)",
      "Systolic Blood Pressure (mmHg)",
      "Diastolic Blood Pressure (mmHg)",
      "Body Temperature (\u00b0C)",
      "Data Accuracy (%)",
      "Risk_Severity",
      "Is_Heart_Disease",
      "Is_Hypertension"
    ],
    "matrix": [
      [
        1.0,
        -0.21,
        0.248,
        0.172,
        0.083,
        0.01,
        0.682,
        0.682,
        -0.269
      ],
      [
        -0.21,
        1.0,
        0.078,
        0.086,
        0.002,
        -0.001,
        -0.453,
        0.114,
        0.109
      ],
      [
        0.248,
        0.078,
        1.0,
        0.655,
        -0.073,
        0.007,
        0.552,
        0.376,
        0.608
      ],
      [
        0.172,
        0.086,
        0.655,
        1.0,
        -0.081,
        0.01,
        0.401,
        0.298,
        0.638
      ],
      [
        0.083,
        0.002,
        -0.073,
        -0.081,
        1.0,
        -0.01,
        -0.011,
        -0.097,
        -0.101
      ],
      [
        0.01,
        -0.001,
        0.007,
        0.01,
        -0.01,
        1.0,
        0.011,
        0.013,
        0.0
      ],
      [
        0.682,
        -0.453,
        0.552,
        0.401,
        -0.011,
        0.011,
        1.0,
        0.537,
        0.123
      ],
      [
        0.682,
        0.114,
        0.376,
        0.298,
        -0.097,
        0.013,
        0.537,
        1.0,
        -0.25
      ],
      [
        -0.269,
        0.109,
        0.608,
        0.638,
        -0.101,
        0.0,
        0.123,
        -0.25,
        1.0
      ]
    ]
  },
  "feature_dependencies": [
    {
      "feature": "Heart Rate",
      "key": "Heart Rate (bpm)",
      "correlation": 0.682,
      "abs_corr": 0.682,
      "unit": "bpm",
      "impact": "High Primary Predictor"
    },
    {
      "feature": "Systolic Blood Pressure",
      "key": "Systolic Blood Pressure (mmHg)",
      "correlation": 0.376,
      "abs_corr": 0.376,
      "unit": "mmHg",
      "impact": "Moderate Risk Factor"
    },
    {
      "feature": "Diastolic Blood Pressure",
      "key": "Diastolic Blood Pressure (mmHg)",
      "correlation": 0.298,
      "abs_corr": 0.298,
      "unit": "mmHg",
      "impact": "Moderate Risk Factor"
    },
    {
      "feature": "SpO2 Oxygen Saturation",
      "key": "SpO2 Level (%)",
      "correlation": 0.114,
      "abs_corr": 0.114,
      "unit": "%",
      "impact": "Baseline Background"
    },
    {
      "feature": "Body Temperature",
      "key": "Body Temperature (\u00b0C)",
      "correlation": -0.097,
      "abs_corr": 0.097,
      "unit": "\u00b0C",
      "impact": "Baseline Background"
    },
    {
      "feature": "Telemetry Data Accuracy",
      "key": "Data Accuracy (%)",
      "correlation": 0.013,
      "abs_corr": 0.013,
      "unit": "%",
      "impact": "Baseline Background"
    }
  ],
  "sample_rows": [
    {
      "Patient Number": 1,
      "Heart Rate (bpm)": 98,
      "SpO2 Level (%)": 96,
      "Systolic Blood Pressure (mmHg)": 120,
      "Diastolic Blood Pressure (mmHg)": 86,
      "Body Temperature (\u00b0C)": 38.1,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 95,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 2,
      "Heart Rate (bpm)": 105,
      "SpO2 Level (%)": 97,
      "Systolic Blood Pressure (mmHg)": 177,
      "Diastolic Blood Pressure (mmHg)": 104,
      "Body Temperature (\u00b0C)": 37.6,
      "Fall Detection": "No",
      "Predicted Disease": "Heart Disease",
      "Data Accuracy (%)": 91,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 3,
      "Heart Rate (bpm)": 90,
      "SpO2 Level (%)": 85,
      "Systolic Blood Pressure (mmHg)": 139,
      "Diastolic Blood Pressure (mmHg)": 57,
      "Body Temperature (\u00b0C)": 37.0,
      "Fall Detection": "No",
      "Predicted Disease": "Asthma",
      "Data Accuracy (%)": 98,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 5,
      "Heart Rate (bpm)": 81,
      "SpO2 Level (%)": 95,
      "Systolic Blood Pressure (mmHg)": 172,
      "Diastolic Blood Pressure (mmHg)": 119,
      "Body Temperature (\u00b0C)": 37.7,
      "Fall Detection": "No",
      "Predicted Disease": "Hypertension",
      "Data Accuracy (%)": 88,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 16,
      "Heart Rate (bpm)": 68,
      "SpO2 Level (%)": 97,
      "Systolic Blood Pressure (mmHg)": 114,
      "Diastolic Blood Pressure (mmHg)": 71,
      "Body Temperature (\u00b0C)": 36.5,
      "Fall Detection": "No",
      "Predicted Disease": "Healthy",
      "Data Accuracy (%)": 93,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    }
  ]
};
