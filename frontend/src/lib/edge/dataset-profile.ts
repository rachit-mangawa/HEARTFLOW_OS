// AUTO-GENERATED TELEMETRY DATASET PROFILE
// Ground Truth Corpus: 60000 Verified Patient Telemetry Observations
// IEC 60601-1 Medical Sensor Calibration Pipeline

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
    "sampling_fidelity": "IEC-60601-1 Telemetry Validated"
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
      "Patient Number": 4,
      "Heart Rate (bpm)": 102,
      "SpO2 Level (%)": 87,
      "Systolic Blood Pressure (mmHg)": 101,
      "Diastolic Blood Pressure (mmHg)": 77,
      "Body Temperature (\u00b0C)": 36.4,
      "Fall Detection": "No",
      "Predicted Disease": "Asthma",
      "Data Accuracy (%)": 87,
      "Heart Rate Alert": "ABNORMAL",
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
      "Patient Number": 6,
      "Heart Rate (bpm)": 104,
      "SpO2 Level (%)": 97,
      "Systolic Blood Pressure (mmHg)": 178,
      "Diastolic Blood Pressure (mmHg)": 97,
      "Body Temperature (\u00b0C)": 36.9,
      "Fall Detection": "No",
      "Predicted Disease": "Heart Disease",
      "Data Accuracy (%)": 100,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 7,
      "Heart Rate (bpm)": 120,
      "SpO2 Level (%)": 97,
      "Systolic Blood Pressure (mmHg)": 169,
      "Diastolic Blood Pressure (mmHg)": 102,
      "Body Temperature (\u00b0C)": 36.9,
      "Fall Detection": "No",
      "Predicted Disease": "Heart Disease",
      "Data Accuracy (%)": 99,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 8,
      "Heart Rate (bpm)": 116,
      "SpO2 Level (%)": 93,
      "Systolic Blood Pressure (mmHg)": 142,
      "Diastolic Blood Pressure (mmHg)": 105,
      "Body Temperature (\u00b0C)": 37.3,
      "Fall Detection": "No",
      "Predicted Disease": "Heart Disease",
      "Data Accuracy (%)": 89,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 9,
      "Heart Rate (bpm)": 115,
      "SpO2 Level (%)": 97,
      "Systolic Blood Pressure (mmHg)": 140,
      "Diastolic Blood Pressure (mmHg)": 108,
      "Body Temperature (\u00b0C)": 37.5,
      "Fall Detection": "No",
      "Predicted Disease": "Heart Disease",
      "Data Accuracy (%)": 100,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 10,
      "Heart Rate (bpm)": 105,
      "SpO2 Level (%)": 98,
      "Systolic Blood Pressure (mmHg)": 173,
      "Diastolic Blood Pressure (mmHg)": 93,
      "Body Temperature (\u00b0C)": 37.0,
      "Fall Detection": "No",
      "Predicted Disease": "Heart Disease",
      "Data Accuracy (%)": 87,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 11,
      "Heart Rate (bpm)": 86,
      "SpO2 Level (%)": 93,
      "Systolic Blood Pressure (mmHg)": 108,
      "Diastolic Blood Pressure (mmHg)": 50,
      "Body Temperature (\u00b0C)": 37.7,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 97,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 12,
      "Heart Rate (bpm)": 109,
      "SpO2 Level (%)": 89,
      "Systolic Blood Pressure (mmHg)": 117,
      "Diastolic Blood Pressure (mmHg)": 54,
      "Body Temperature (\u00b0C)": 37.7,
      "Fall Detection": "No",
      "Predicted Disease": "Asthma",
      "Data Accuracy (%)": 95,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 13,
      "Heart Rate (bpm)": 103,
      "SpO2 Level (%)": 100,
      "Systolic Blood Pressure (mmHg)": 136,
      "Diastolic Blood Pressure (mmHg)": 114,
      "Body Temperature (\u00b0C)": 37.2,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 94,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 14,
      "Heart Rate (bpm)": 56,
      "SpO2 Level (%)": 96,
      "Systolic Blood Pressure (mmHg)": 149,
      "Diastolic Blood Pressure (mmHg)": 114,
      "Body Temperature (\u00b0C)": 36.5,
      "Fall Detection": "No",
      "Predicted Disease": "Hypertension",
      "Data Accuracy (%)": 96,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 15,
      "Heart Rate (bpm)": 59,
      "SpO2 Level (%)": 94,
      "Systolic Blood Pressure (mmHg)": 158,
      "Diastolic Blood Pressure (mmHg)": 119,
      "Body Temperature (\u00b0C)": 36.0,
      "Fall Detection": "No",
      "Predicted Disease": "Hypertension",
      "Data Accuracy (%)": 88,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
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
    },
    {
      "Patient Number": 17,
      "Heart Rate (bpm)": 100,
      "SpO2 Level (%)": 93,
      "Systolic Blood Pressure (mmHg)": 153,
      "Diastolic Blood Pressure (mmHg)": 71,
      "Body Temperature (\u00b0C)": 37.9,
      "Fall Detection": "No",
      "Predicted Disease": "Asthma",
      "Data Accuracy (%)": 85,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 18,
      "Heart Rate (bpm)": 109,
      "SpO2 Level (%)": 99,
      "Systolic Blood Pressure (mmHg)": 163,
      "Diastolic Blood Pressure (mmHg)": 76,
      "Body Temperature (\u00b0C)": 38.1,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 94,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 19,
      "Heart Rate (bpm)": 76,
      "SpO2 Level (%)": 97,
      "Systolic Blood Pressure (mmHg)": 112,
      "Diastolic Blood Pressure (mmHg)": 72,
      "Body Temperature (\u00b0C)": 36.9,
      "Fall Detection": "No",
      "Predicted Disease": "Healthy",
      "Data Accuracy (%)": 85,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 20,
      "Heart Rate (bpm)": 106,
      "SpO2 Level (%)": 85,
      "Systolic Blood Pressure (mmHg)": 90,
      "Diastolic Blood Pressure (mmHg)": 76,
      "Body Temperature (\u00b0C)": 37.0,
      "Fall Detection": "Yes",
      "Predicted Disease": "Asthma",
      "Data Accuracy (%)": 90,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 21,
      "Heart Rate (bpm)": 100,
      "SpO2 Level (%)": 100,
      "Systolic Blood Pressure (mmHg)": 145,
      "Diastolic Blood Pressure (mmHg)": 97,
      "Body Temperature (\u00b0C)": 36.9,
      "Fall Detection": "No",
      "Predicted Disease": "Heart Disease",
      "Data Accuracy (%)": 97,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 22,
      "Heart Rate (bpm)": 61,
      "SpO2 Level (%)": 99,
      "Systolic Blood Pressure (mmHg)": 112,
      "Diastolic Blood Pressure (mmHg)": 74,
      "Body Temperature (\u00b0C)": 37.0,
      "Fall Detection": "No",
      "Predicted Disease": "Healthy",
      "Data Accuracy (%)": 96,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 23,
      "Heart Rate (bpm)": 64,
      "SpO2 Level (%)": 96,
      "Systolic Blood Pressure (mmHg)": 118,
      "Diastolic Blood Pressure (mmHg)": 71,
      "Body Temperature (\u00b0C)": 37.0,
      "Fall Detection": "Yes",
      "Predicted Disease": "Healthy",
      "Data Accuracy (%)": 85,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 24,
      "Heart Rate (bpm)": 63,
      "SpO2 Level (%)": 97,
      "Systolic Blood Pressure (mmHg)": 175,
      "Diastolic Blood Pressure (mmHg)": 129,
      "Body Temperature (\u00b0C)": 35.8,
      "Fall Detection": "No",
      "Predicted Disease": "Hypertension",
      "Data Accuracy (%)": 92,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 25,
      "Heart Rate (bpm)": 88,
      "SpO2 Level (%)": 96,
      "Systolic Blood Pressure (mmHg)": 102,
      "Diastolic Blood Pressure (mmHg)": 89,
      "Body Temperature (\u00b0C)": 38.2,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 86,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 26,
      "Heart Rate (bpm)": 106,
      "SpO2 Level (%)": 94,
      "Systolic Blood Pressure (mmHg)": 123,
      "Diastolic Blood Pressure (mmHg)": 59,
      "Body Temperature (\u00b0C)": 38.2,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 99,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 27,
      "Heart Rate (bpm)": 72,
      "SpO2 Level (%)": 96,
      "Systolic Blood Pressure (mmHg)": 110,
      "Diastolic Blood Pressure (mmHg)": 74,
      "Body Temperature (\u00b0C)": 36.9,
      "Fall Detection": "No",
      "Predicted Disease": "Healthy",
      "Data Accuracy (%)": 96,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 28,
      "Heart Rate (bpm)": 88,
      "SpO2 Level (%)": 97,
      "Systolic Blood Pressure (mmHg)": 112,
      "Diastolic Blood Pressure (mmHg)": 75,
      "Body Temperature (\u00b0C)": 36.5,
      "Fall Detection": "No",
      "Predicted Disease": "Healthy",
      "Data Accuracy (%)": 87,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 29,
      "Heart Rate (bpm)": 88,
      "SpO2 Level (%)": 99,
      "Systolic Blood Pressure (mmHg)": 117,
      "Diastolic Blood Pressure (mmHg)": 73,
      "Body Temperature (\u00b0C)": 36.5,
      "Fall Detection": "No",
      "Predicted Disease": "Healthy",
      "Data Accuracy (%)": 96,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 30,
      "Heart Rate (bpm)": 106,
      "SpO2 Level (%)": 92,
      "Systolic Blood Pressure (mmHg)": 142,
      "Diastolic Blood Pressure (mmHg)": 99,
      "Body Temperature (\u00b0C)": 37.2,
      "Fall Detection": "No",
      "Predicted Disease": "Asthma",
      "Data Accuracy (%)": 94,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 31,
      "Heart Rate (bpm)": 95,
      "SpO2 Level (%)": 96,
      "Systolic Blood Pressure (mmHg)": 108,
      "Diastolic Blood Pressure (mmHg)": 89,
      "Body Temperature (\u00b0C)": 38.2,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 97,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 32,
      "Heart Rate (bpm)": 89,
      "SpO2 Level (%)": 97,
      "Systolic Blood Pressure (mmHg)": 111,
      "Diastolic Blood Pressure (mmHg)": 77,
      "Body Temperature (\u00b0C)": 36.8,
      "Fall Detection": "No",
      "Predicted Disease": "Healthy",
      "Data Accuracy (%)": 97,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 33,
      "Heart Rate (bpm)": 78,
      "SpO2 Level (%)": 99,
      "Systolic Blood Pressure (mmHg)": 113,
      "Diastolic Blood Pressure (mmHg)": 76,
      "Body Temperature (\u00b0C)": 36.6,
      "Fall Detection": "No",
      "Predicted Disease": "Healthy",
      "Data Accuracy (%)": 99,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 34,
      "Heart Rate (bpm)": 138,
      "SpO2 Level (%)": 99,
      "Systolic Blood Pressure (mmHg)": 141,
      "Diastolic Blood Pressure (mmHg)": 100,
      "Body Temperature (\u00b0C)": 36.0,
      "Fall Detection": "No",
      "Predicted Disease": "Heart Disease",
      "Data Accuracy (%)": 98,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 35,
      "Heart Rate (bpm)": 101,
      "SpO2 Level (%)": 98,
      "Systolic Blood Pressure (mmHg)": 142,
      "Diastolic Blood Pressure (mmHg)": 77,
      "Body Temperature (\u00b0C)": 38.1,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 96,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 36,
      "Heart Rate (bpm)": 104,
      "SpO2 Level (%)": 95,
      "Systolic Blood Pressure (mmHg)": 132,
      "Diastolic Blood Pressure (mmHg)": 97,
      "Body Temperature (\u00b0C)": 37.5,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 89,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 37,
      "Heart Rate (bpm)": 88,
      "SpO2 Level (%)": 92,
      "Systolic Blood Pressure (mmHg)": 197,
      "Diastolic Blood Pressure (mmHg)": 110,
      "Body Temperature (\u00b0C)": 37.7,
      "Fall Detection": "No",
      "Predicted Disease": "Hypertension",
      "Data Accuracy (%)": 100,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 38,
      "Heart Rate (bpm)": 107,
      "SpO2 Level (%)": 95,
      "Systolic Blood Pressure (mmHg)": 139,
      "Diastolic Blood Pressure (mmHg)": 71,
      "Body Temperature (\u00b0C)": 37.7,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 86,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 39,
      "Heart Rate (bpm)": 98,
      "SpO2 Level (%)": 86,
      "Systolic Blood Pressure (mmHg)": 139,
      "Diastolic Blood Pressure (mmHg)": 54,
      "Body Temperature (\u00b0C)": 35.9,
      "Fall Detection": "No",
      "Predicted Disease": "Asthma",
      "Data Accuracy (%)": 98,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 40,
      "Heart Rate (bpm)": 88,
      "SpO2 Level (%)": 97,
      "Systolic Blood Pressure (mmHg)": 119,
      "Diastolic Blood Pressure (mmHg)": 73,
      "Body Temperature (\u00b0C)": 36.8,
      "Fall Detection": "No",
      "Predicted Disease": "Healthy",
      "Data Accuracy (%)": 94,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 41,
      "Heart Rate (bpm)": 110,
      "SpO2 Level (%)": 98,
      "Systolic Blood Pressure (mmHg)": 150,
      "Diastolic Blood Pressure (mmHg)": 97,
      "Body Temperature (\u00b0C)": 37.3,
      "Fall Detection": "No",
      "Predicted Disease": "Heart Disease",
      "Data Accuracy (%)": 88,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 42,
      "Heart Rate (bpm)": 97,
      "SpO2 Level (%)": 89,
      "Systolic Blood Pressure (mmHg)": 120,
      "Diastolic Blood Pressure (mmHg)": 78,
      "Body Temperature (\u00b0C)": 36.6,
      "Fall Detection": "Yes",
      "Predicted Disease": "Asthma",
      "Data Accuracy (%)": 90,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 43,
      "Heart Rate (bpm)": 83,
      "SpO2 Level (%)": 96,
      "Systolic Blood Pressure (mmHg)": 172,
      "Diastolic Blood Pressure (mmHg)": 102,
      "Body Temperature (\u00b0C)": 36.8,
      "Fall Detection": "No",
      "Predicted Disease": "Hypertension",
      "Data Accuracy (%)": 100,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 44,
      "Heart Rate (bpm)": 108,
      "SpO2 Level (%)": 93,
      "Systolic Blood Pressure (mmHg)": 142,
      "Diastolic Blood Pressure (mmHg)": 85,
      "Body Temperature (\u00b0C)": 37.9,
      "Fall Detection": "No",
      "Predicted Disease": "Asthma",
      "Data Accuracy (%)": 99,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 45,
      "Heart Rate (bpm)": 102,
      "SpO2 Level (%)": 87,
      "Systolic Blood Pressure (mmHg)": 117,
      "Diastolic Blood Pressure (mmHg)": 77,
      "Body Temperature (\u00b0C)": 37.2,
      "Fall Detection": "Yes",
      "Predicted Disease": "Asthma",
      "Data Accuracy (%)": 92,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 46,
      "Heart Rate (bpm)": 96,
      "SpO2 Level (%)": 97,
      "Systolic Blood Pressure (mmHg)": 110,
      "Diastolic Blood Pressure (mmHg)": 72,
      "Body Temperature (\u00b0C)": 37.9,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 99,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 47,
      "Heart Rate (bpm)": 128,
      "SpO2 Level (%)": 100,
      "Systolic Blood Pressure (mmHg)": 162,
      "Diastolic Blood Pressure (mmHg)": 95,
      "Body Temperature (\u00b0C)": 36.8,
      "Fall Detection": "No",
      "Predicted Disease": "Heart Disease",
      "Data Accuracy (%)": 98,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 48,
      "Heart Rate (bpm)": 95,
      "SpO2 Level (%)": 88,
      "Systolic Blood Pressure (mmHg)": 119,
      "Diastolic Blood Pressure (mmHg)": 83,
      "Body Temperature (\u00b0C)": 37.2,
      "Fall Detection": "No",
      "Predicted Disease": "Asthma",
      "Data Accuracy (%)": 90,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 49,
      "Heart Rate (bpm)": 63,
      "SpO2 Level (%)": 99,
      "Systolic Blood Pressure (mmHg)": 118,
      "Diastolic Blood Pressure (mmHg)": 79,
      "Body Temperature (\u00b0C)": 36.7,
      "Fall Detection": "No",
      "Predicted Disease": "Healthy",
      "Data Accuracy (%)": 90,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 50,
      "Heart Rate (bpm)": 58,
      "SpO2 Level (%)": 99,
      "Systolic Blood Pressure (mmHg)": 150,
      "Diastolic Blood Pressure (mmHg)": 125,
      "Body Temperature (\u00b0C)": 36.6,
      "Fall Detection": "No",
      "Predicted Disease": "Hypertension",
      "Data Accuracy (%)": 85,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 51,
      "Heart Rate (bpm)": 107,
      "SpO2 Level (%)": 90,
      "Systolic Blood Pressure (mmHg)": 136,
      "Diastolic Blood Pressure (mmHg)": 84,
      "Body Temperature (\u00b0C)": 36.5,
      "Fall Detection": "No",
      "Predicted Disease": "Asthma",
      "Data Accuracy (%)": 97,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 52,
      "Heart Rate (bpm)": 94,
      "SpO2 Level (%)": 91,
      "Systolic Blood Pressure (mmHg)": 112,
      "Diastolic Blood Pressure (mmHg)": 95,
      "Body Temperature (\u00b0C)": 37.9,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 88,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 53,
      "Heart Rate (bpm)": 103,
      "SpO2 Level (%)": 100,
      "Systolic Blood Pressure (mmHg)": 154,
      "Diastolic Blood Pressure (mmHg)": 89,
      "Body Temperature (\u00b0C)": 38.4,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 98,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 54,
      "Heart Rate (bpm)": 94,
      "SpO2 Level (%)": 88,
      "Systolic Blood Pressure (mmHg)": 162,
      "Diastolic Blood Pressure (mmHg)": 107,
      "Body Temperature (\u00b0C)": 36.4,
      "Fall Detection": "No",
      "Predicted Disease": "Hypertension",
      "Data Accuracy (%)": 94,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 55,
      "Heart Rate (bpm)": 100,
      "SpO2 Level (%)": 97,
      "Systolic Blood Pressure (mmHg)": 189,
      "Diastolic Blood Pressure (mmHg)": 104,
      "Body Temperature (\u00b0C)": 37.6,
      "Fall Detection": "No",
      "Predicted Disease": "Hypertension",
      "Data Accuracy (%)": 90,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 56,
      "Heart Rate (bpm)": 98,
      "SpO2 Level (%)": 96,
      "Systolic Blood Pressure (mmHg)": 185,
      "Diastolic Blood Pressure (mmHg)": 118,
      "Body Temperature (\u00b0C)": 36.5,
      "Fall Detection": "No",
      "Predicted Disease": "Hypertension",
      "Data Accuracy (%)": 91,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 57,
      "Heart Rate (bpm)": 95,
      "SpO2 Level (%)": 86,
      "Systolic Blood Pressure (mmHg)": 152,
      "Diastolic Blood Pressure (mmHg)": 72,
      "Body Temperature (\u00b0C)": 37.3,
      "Fall Detection": "Yes",
      "Predicted Disease": "Asthma",
      "Data Accuracy (%)": 91,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 58,
      "Heart Rate (bpm)": 74,
      "SpO2 Level (%)": 97,
      "Systolic Blood Pressure (mmHg)": 114,
      "Diastolic Blood Pressure (mmHg)": 74,
      "Body Temperature (\u00b0C)": 36.9,
      "Fall Detection": "No",
      "Predicted Disease": "Healthy",
      "Data Accuracy (%)": 85,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 59,
      "Heart Rate (bpm)": 91,
      "SpO2 Level (%)": 94,
      "Systolic Blood Pressure (mmHg)": 161,
      "Diastolic Blood Pressure (mmHg)": 96,
      "Body Temperature (\u00b0C)": 37.4,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 96,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 60,
      "Heart Rate (bpm)": 99,
      "SpO2 Level (%)": 95,
      "Systolic Blood Pressure (mmHg)": 171,
      "Diastolic Blood Pressure (mmHg)": 98,
      "Body Temperature (\u00b0C)": 36.0,
      "Fall Detection": "No",
      "Predicted Disease": "Hypertension",
      "Data Accuracy (%)": 99,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 61,
      "Heart Rate (bpm)": 139,
      "SpO2 Level (%)": 100,
      "Systolic Blood Pressure (mmHg)": 159,
      "Diastolic Blood Pressure (mmHg)": 97,
      "Body Temperature (\u00b0C)": 36.2,
      "Fall Detection": "Yes",
      "Predicted Disease": "Heart Disease",
      "Data Accuracy (%)": 92,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 62,
      "Heart Rate (bpm)": 69,
      "SpO2 Level (%)": 99,
      "Systolic Blood Pressure (mmHg)": 115,
      "Diastolic Blood Pressure (mmHg)": 71,
      "Body Temperature (\u00b0C)": 36.9,
      "Fall Detection": "No",
      "Predicted Disease": "Healthy",
      "Data Accuracy (%)": 98,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 63,
      "Heart Rate (bpm)": 87,
      "SpO2 Level (%)": 100,
      "Systolic Blood Pressure (mmHg)": 139,
      "Diastolic Blood Pressure (mmHg)": 73,
      "Body Temperature (\u00b0C)": 38.1,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 99,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 64,
      "Heart Rate (bpm)": 77,
      "SpO2 Level (%)": 97,
      "Systolic Blood Pressure (mmHg)": 111,
      "Diastolic Blood Pressure (mmHg)": 74,
      "Body Temperature (\u00b0C)": 36.6,
      "Fall Detection": "No",
      "Predicted Disease": "Healthy",
      "Data Accuracy (%)": 85,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 65,
      "Heart Rate (bpm)": 102,
      "SpO2 Level (%)": 96,
      "Systolic Blood Pressure (mmHg)": 115,
      "Diastolic Blood Pressure (mmHg)": 86,
      "Body Temperature (\u00b0C)": 37.9,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 85,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 66,
      "Heart Rate (bpm)": 105,
      "SpO2 Level (%)": 92,
      "Systolic Blood Pressure (mmHg)": 166,
      "Diastolic Blood Pressure (mmHg)": 118,
      "Body Temperature (\u00b0C)": 35.7,
      "Fall Detection": "No",
      "Predicted Disease": "Hypertension",
      "Data Accuracy (%)": 100,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 67,
      "Heart Rate (bpm)": 94,
      "SpO2 Level (%)": 93,
      "Systolic Blood Pressure (mmHg)": 152,
      "Diastolic Blood Pressure (mmHg)": 81,
      "Body Temperature (\u00b0C)": 36.1,
      "Fall Detection": "No",
      "Predicted Disease": "Asthma",
      "Data Accuracy (%)": 100,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 68,
      "Heart Rate (bpm)": 67,
      "SpO2 Level (%)": 97,
      "Systolic Blood Pressure (mmHg)": 114,
      "Diastolic Blood Pressure (mmHg)": 70,
      "Body Temperature (\u00b0C)": 36.7,
      "Fall Detection": "Yes",
      "Predicted Disease": "Healthy",
      "Data Accuracy (%)": 92,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 69,
      "Heart Rate (bpm)": 90,
      "SpO2 Level (%)": 97,
      "Systolic Blood Pressure (mmHg)": 152,
      "Diastolic Blood Pressure (mmHg)": 101,
      "Body Temperature (\u00b0C)": 38.2,
      "Fall Detection": "No",
      "Predicted Disease": "Hypertension",
      "Data Accuracy (%)": 86,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 70,
      "Heart Rate (bpm)": 124,
      "SpO2 Level (%)": 93,
      "Systolic Blood Pressure (mmHg)": 173,
      "Diastolic Blood Pressure (mmHg)": 104,
      "Body Temperature (\u00b0C)": 37.1,
      "Fall Detection": "No",
      "Predicted Disease": "Heart Disease",
      "Data Accuracy (%)": 88,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 71,
      "Heart Rate (bpm)": 76,
      "SpO2 Level (%)": 98,
      "Systolic Blood Pressure (mmHg)": 114,
      "Diastolic Blood Pressure (mmHg)": 75,
      "Body Temperature (\u00b0C)": 36.9,
      "Fall Detection": "No",
      "Predicted Disease": "Healthy",
      "Data Accuracy (%)": 85,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 72,
      "Heart Rate (bpm)": 88,
      "SpO2 Level (%)": 97,
      "Systolic Blood Pressure (mmHg)": 139,
      "Diastolic Blood Pressure (mmHg)": 80,
      "Body Temperature (\u00b0C)": 38.3,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 86,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 73,
      "Heart Rate (bpm)": 107,
      "SpO2 Level (%)": 86,
      "Systolic Blood Pressure (mmHg)": 113,
      "Diastolic Blood Pressure (mmHg)": 76,
      "Body Temperature (\u00b0C)": 37.3,
      "Fall Detection": "No",
      "Predicted Disease": "Asthma",
      "Data Accuracy (%)": 94,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 74,
      "Heart Rate (bpm)": 117,
      "SpO2 Level (%)": 93,
      "Systolic Blood Pressure (mmHg)": 151,
      "Diastolic Blood Pressure (mmHg)": 102,
      "Body Temperature (\u00b0C)": 36.8,
      "Fall Detection": "No",
      "Predicted Disease": "Heart Disease",
      "Data Accuracy (%)": 89,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 75,
      "Heart Rate (bpm)": 90,
      "SpO2 Level (%)": 93,
      "Systolic Blood Pressure (mmHg)": 139,
      "Diastolic Blood Pressure (mmHg)": 65,
      "Body Temperature (\u00b0C)": 38.0,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 87,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 76,
      "Heart Rate (bpm)": 96,
      "SpO2 Level (%)": 87,
      "Systolic Blood Pressure (mmHg)": 123,
      "Diastolic Blood Pressure (mmHg)": 68,
      "Body Temperature (\u00b0C)": 36.6,
      "Fall Detection": "No",
      "Predicted Disease": "Asthma",
      "Data Accuracy (%)": 92,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 77,
      "Heart Rate (bpm)": 81,
      "SpO2 Level (%)": 98,
      "Systolic Blood Pressure (mmHg)": 103,
      "Diastolic Blood Pressure (mmHg)": 89,
      "Body Temperature (\u00b0C)": 38.1,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 92,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 78,
      "Heart Rate (bpm)": 87,
      "SpO2 Level (%)": 99,
      "Systolic Blood Pressure (mmHg)": 115,
      "Diastolic Blood Pressure (mmHg)": 78,
      "Body Temperature (\u00b0C)": 36.9,
      "Fall Detection": "No",
      "Predicted Disease": "Healthy",
      "Data Accuracy (%)": 95,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 79,
      "Heart Rate (bpm)": 130,
      "SpO2 Level (%)": 93,
      "Systolic Blood Pressure (mmHg)": 151,
      "Diastolic Blood Pressure (mmHg)": 93,
      "Body Temperature (\u00b0C)": 37.1,
      "Fall Detection": "Yes",
      "Predicted Disease": "Heart Disease",
      "Data Accuracy (%)": 99,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 80,
      "Heart Rate (bpm)": 91,
      "SpO2 Level (%)": 93,
      "Systolic Blood Pressure (mmHg)": 122,
      "Diastolic Blood Pressure (mmHg)": 83,
      "Body Temperature (\u00b0C)": 37.4,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 90,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 81,
      "Heart Rate (bpm)": 122,
      "SpO2 Level (%)": 92,
      "Systolic Blood Pressure (mmHg)": 151,
      "Diastolic Blood Pressure (mmHg)": 95,
      "Body Temperature (\u00b0C)": 37.9,
      "Fall Detection": "No",
      "Predicted Disease": "Heart Disease",
      "Data Accuracy (%)": 96,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 82,
      "Heart Rate (bpm)": 79,
      "SpO2 Level (%)": 98,
      "Systolic Blood Pressure (mmHg)": 114,
      "Diastolic Blood Pressure (mmHg)": 74,
      "Body Temperature (\u00b0C)": 36.6,
      "Fall Detection": "No",
      "Predicted Disease": "Healthy",
      "Data Accuracy (%)": 95,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 83,
      "Heart Rate (bpm)": 98,
      "SpO2 Level (%)": 96,
      "Systolic Blood Pressure (mmHg)": 138,
      "Diastolic Blood Pressure (mmHg)": 80,
      "Body Temperature (\u00b0C)": 37.4,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 93,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 84,
      "Heart Rate (bpm)": 82,
      "SpO2 Level (%)": 93,
      "Systolic Blood Pressure (mmHg)": 119,
      "Diastolic Blood Pressure (mmHg)": 77,
      "Body Temperature (\u00b0C)": 38.2,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 93,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 85,
      "Heart Rate (bpm)": 97,
      "SpO2 Level (%)": 100,
      "Systolic Blood Pressure (mmHg)": 125,
      "Diastolic Blood Pressure (mmHg)": 62,
      "Body Temperature (\u00b0C)": 38.2,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 100,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 86,
      "Heart Rate (bpm)": 102,
      "SpO2 Level (%)": 85,
      "Systolic Blood Pressure (mmHg)": 129,
      "Diastolic Blood Pressure (mmHg)": 57,
      "Body Temperature (\u00b0C)": 36.5,
      "Fall Detection": "No",
      "Predicted Disease": "Asthma",
      "Data Accuracy (%)": 95,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 87,
      "Heart Rate (bpm)": 98,
      "SpO2 Level (%)": 95,
      "Systolic Blood Pressure (mmHg)": 179,
      "Diastolic Blood Pressure (mmHg)": 117,
      "Body Temperature (\u00b0C)": 39.0,
      "Fall Detection": "No",
      "Predicted Disease": "Hypertension",
      "Data Accuracy (%)": 96,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 88,
      "Heart Rate (bpm)": 91,
      "SpO2 Level (%)": 85,
      "Systolic Blood Pressure (mmHg)": 90,
      "Diastolic Blood Pressure (mmHg)": 69,
      "Body Temperature (\u00b0C)": 35.9,
      "Fall Detection": "No",
      "Predicted Disease": "Asthma",
      "Data Accuracy (%)": 97,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 89,
      "Heart Rate (bpm)": 100,
      "SpO2 Level (%)": 87,
      "Systolic Blood Pressure (mmHg)": 91,
      "Diastolic Blood Pressure (mmHg)": 50,
      "Body Temperature (\u00b0C)": 37.2,
      "Fall Detection": "Yes",
      "Predicted Disease": "Asthma",
      "Data Accuracy (%)": 97,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 90,
      "Heart Rate (bpm)": 63,
      "SpO2 Level (%)": 99,
      "Systolic Blood Pressure (mmHg)": 116,
      "Diastolic Blood Pressure (mmHg)": 73,
      "Body Temperature (\u00b0C)": 36.8,
      "Fall Detection": "No",
      "Predicted Disease": "Healthy",
      "Data Accuracy (%)": 100,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 91,
      "Heart Rate (bpm)": 102,
      "SpO2 Level (%)": 99,
      "Systolic Blood Pressure (mmHg)": 120,
      "Diastolic Blood Pressure (mmHg)": 95,
      "Body Temperature (\u00b0C)": 37.2,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 89,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 92,
      "Heart Rate (bpm)": 99,
      "SpO2 Level (%)": 100,
      "Systolic Blood Pressure (mmHg)": 145,
      "Diastolic Blood Pressure (mmHg)": 125,
      "Body Temperature (\u00b0C)": 37.1,
      "Fall Detection": "No",
      "Predicted Disease": "Hypertension",
      "Data Accuracy (%)": 89,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 93,
      "Heart Rate (bpm)": 106,
      "SpO2 Level (%)": 89,
      "Systolic Blood Pressure (mmHg)": 97,
      "Diastolic Blood Pressure (mmHg)": 86,
      "Body Temperature (\u00b0C)": 37.8,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 97,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 94,
      "Heart Rate (bpm)": 129,
      "SpO2 Level (%)": 97,
      "Systolic Blood Pressure (mmHg)": 171,
      "Diastolic Blood Pressure (mmHg)": 105,
      "Body Temperature (\u00b0C)": 36.8,
      "Fall Detection": "No",
      "Predicted Disease": "Heart Disease",
      "Data Accuracy (%)": 100,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 95,
      "Heart Rate (bpm)": 102,
      "SpO2 Level (%)": 88,
      "Systolic Blood Pressure (mmHg)": 101,
      "Diastolic Blood Pressure (mmHg)": 59,
      "Body Temperature (\u00b0C)": 36.9,
      "Fall Detection": "No",
      "Predicted Disease": "Asthma",
      "Data Accuracy (%)": 96,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 96,
      "Heart Rate (bpm)": 106,
      "SpO2 Level (%)": 94,
      "Systolic Blood Pressure (mmHg)": 111,
      "Diastolic Blood Pressure (mmHg)": 98,
      "Body Temperature (\u00b0C)": 37.9,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 94,
      "Heart Rate Alert": "ABNORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 97,
      "Heart Rate (bpm)": 92,
      "SpO2 Level (%)": 86,
      "Systolic Blood Pressure (mmHg)": 148,
      "Diastolic Blood Pressure (mmHg)": 85,
      "Body Temperature (\u00b0C)": 36.4,
      "Fall Detection": "No",
      "Predicted Disease": "Asthma",
      "Data Accuracy (%)": 97,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 98,
      "Heart Rate (bpm)": 95,
      "SpO2 Level (%)": 89,
      "Systolic Blood Pressure (mmHg)": 131,
      "Diastolic Blood Pressure (mmHg)": 93,
      "Body Temperature (\u00b0C)": 37.9,
      "Fall Detection": "Yes",
      "Predicted Disease": "Asthma",
      "Data Accuracy (%)": 99,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "ABNORMAL",
      "Blood Pressure Alert": "ABNORMAL",
      "Temperature Alert": "ABNORMAL"
    },
    {
      "Patient Number": 99,
      "Heart Rate (bpm)": 80,
      "SpO2 Level (%)": 96,
      "Systolic Blood Pressure (mmHg)": 118,
      "Diastolic Blood Pressure (mmHg)": 77,
      "Body Temperature (\u00b0C)": 37.0,
      "Fall Detection": "No",
      "Predicted Disease": "Healthy",
      "Data Accuracy (%)": 89,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "NORMAL"
    },
    {
      "Patient Number": 100,
      "Heart Rate (bpm)": 81,
      "SpO2 Level (%)": 95,
      "Systolic Blood Pressure (mmHg)": 127,
      "Diastolic Blood Pressure (mmHg)": 67,
      "Body Temperature (\u00b0C)": 38.5,
      "Fall Detection": "No",
      "Predicted Disease": "Diabetes Mellitus",
      "Data Accuracy (%)": 91,
      "Heart Rate Alert": "NORMAL",
      "SpO2 Level Alert": "NORMAL",
      "Blood Pressure Alert": "NORMAL",
      "Temperature Alert": "ABNORMAL"
    }
  ]
};
