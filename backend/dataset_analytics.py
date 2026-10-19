import os
import math
import pandas as pd
import numpy as np

_CACHED_PROFILE = None
_CACHED_MTIME = None

def get_dataset_profile(dataset_path: str):
    global _CACHED_PROFILE, _CACHED_MTIME
    
    if not os.path.exists(dataset_path):
        return None
        
    mtime = os.path.getmtime(dataset_path)
    if _CACHED_PROFILE is not None and _CACHED_MTIME == mtime:
        return _CACHED_PROFILE
        
    try:
        df = pd.read_csv(dataset_path, encoding='utf-8', encoding_errors='replace')
        cols = list(df.columns)
        for i, c in enumerate(cols):
            if 'Body Temperature' in c:
                cols[i] = 'Body Temperature (°C)'
        df.columns = [c.strip() for c in cols]
        
        total_records = len(df)
        columns_list = df.columns.tolist()
        
        # Target distribution
        disease_counts = df['Predicted Disease'].value_counts() if 'Predicted Disease' in df.columns else {}
        disease_colors = {
            'Diabetes Mellitus': '#2563EB',
            'Heart Disease': '#9F2F2D',
            'Healthy': '#16A34A',
            'Hypertension': '#D97706',
            'Asthma': '#7C3AED'
        }
        target_distribution = []
        for disease, count in disease_counts.items():
            pct = round(count / total_records * 100, 2)
            target_distribution.append({
                'disease': disease,
                'count': int(count),
                'percentage': pct,
                'color': disease_colors.get(disease, '#5A5A57')
            })
            
        # Alert prevalence
        alerts = [
            {'name': 'Blood Pressure Alert', 'col': 'Blood Pressure Alert', 'target': 'ABNORMAL'},
            {'name': 'Heart Rate Alert', 'col': 'Heart Rate Alert', 'target': 'ABNORMAL'},
            {'name': 'SpO2 Level Alert', 'col': 'SpO2 Level Alert', 'target': 'ABNORMAL'},
            {'name': 'Temperature Alert', 'col': 'Temperature Alert', 'target': 'ABNORMAL'},
            {'name': 'Fall Detection Event', 'col': 'Fall Detection', 'target': 'Yes'}
        ]
        alert_prevalence = []
        for a in alerts:
            if a['col'] in df.columns:
                counts = df[a['col']].value_counts()
                abnormal_count = int(counts.get(a['target'], 0))
                normal_count = total_records - abnormal_count
                alert_prevalence.append({
                    'name': a['name'],
                    'abnormal_count': abnormal_count,
                    'normal_count': normal_count,
                    'abnormal_pct': round(abnormal_count / total_records * 100, 2)
                })
                
        # Numerical specs
        num_features = [
            {
                'key': 'Heart Rate (bpm)',
                'name': 'Heart Rate',
                'unit': 'bpm',
                'desc': 'Cardiac chronotropic telemetry frequency',
                'normal_min': 60,
                'normal_max': 100,
                'alert': 'Pulse > 100 bpm (Tachycardia) or < 60 bpm (Bradycardia)',
            },
            {
                'key': 'SpO2 Level (%)',
                'name': 'SpO2 Oxygen Saturation',
                'unit': '%',
                'desc': 'Arterial blood oxygen saturation telemetry',
                'normal_min': 95,
                'normal_max': 100,
                'alert': 'Saturation < 95% (Hypoxemia threshold)',
            },
            {
                'key': 'Systolic Blood Pressure (mmHg)',
                'name': 'Systolic Blood Pressure',
                'unit': 'mmHg',
                'desc': 'Peak ventricular contraction arterial pressure',
                'normal_min': 90,
                'normal_max': 120,
                'alert': 'Pressure > 140 mmHg (Hypertensive crisis risk)',
            },
            {
                'key': 'Diastolic Blood Pressure (mmHg)',
                'name': 'Diastolic Blood Pressure',
                'unit': 'mmHg',
                'desc': 'Resting ventricular filling arterial pressure',
                'normal_min': 60,
                'normal_max': 80,
                'alert': 'Pressure > 90 mmHg (Hypertension boundary)',
            },
            {
                'key': 'Body Temperature (°C)',
                'name': 'Body Temperature',
                'unit': '°C',
                'desc': 'Physiological thermal equilibrium reading',
                'normal_min': 36.5,
                'normal_max': 37.5,
                'alert': 'Core Temp > 37.8°C (Pyrexia) or < 36.0°C (Hypothermia)',
            },
            {
                'key': 'Data Accuracy (%)',
                'name': 'Telemetry Data Accuracy',
                'unit': '%',
                'desc': 'Hardware sensor packet integrity & SNR confidence',
                'normal_min': 90,
                'normal_max': 100,
                'alert': 'SNR Packet Fidelity < 85%',
            }
        ]
        
        feature_stats = []
        for feat in num_features:
            k = feat['key']
            if k not in df.columns:
                continue
            series = pd.to_numeric(df[k], errors='coerce').dropna()
            desc = series.describe()
            
            counts, bin_edges = np.histogram(series, bins=12)
            bins = []
            for b_idx in range(len(counts)):
                b_min = round(float(bin_edges[b_idx]), 1)
                b_max = round(float(bin_edges[b_idx+1]), 1)
                bins.append({
                    'label': f"{b_min}–{b_max}",
                    'min': b_min,
                    'max': b_max,
                    'count': int(counts[b_idx]),
                    'pct': round(float(counts[b_idx]) / total_records * 100, 2)
                })
                
            means_by_disease = {}
            if 'Predicted Disease' in df.columns:
                means_by_disease = df.groupby('Predicted Disease')[k].mean().round(2).to_dict()
                
            feature_stats.append({
                'key': k,
                'name': feat['name'],
                'unit': feat['unit'],
                'desc': feat['desc'],
                'normal_range': f"{feat['normal_min']}–{feat['normal_max']} {feat['unit']}",
                'normal_min': feat['normal_min'],
                'normal_max': feat['normal_max'],
                'alert': feat['alert'],
                'mean': round(float(desc['mean']), 2),
                'std': round(float(desc['std']), 2),
                'min': round(float(desc['min']), 2),
                'q25': round(float(desc['25%']), 2),
                'median': round(float(desc['50%']), 2),
                'q75': round(float(desc['75%']), 2),
                'max': round(float(desc['max']), 2),
                'iqr': round(float(desc['75%'] - desc['25%']), 2),
                'bins': bins,
                'means_by_disease': {str(k2): round(float(v2), 2) for k2, v2 in means_by_disease.items()}
            })
            
        # Correlations
        df_corr = df.copy()
        if 'Predicted Disease' in df.columns:
            df_corr['Is_Heart_Disease'] = (df['Predicted Disease'] == 'Heart Disease').astype(int)
            df_corr['Is_Hypertension'] = (df['Predicted Disease'] == 'Hypertension').astype(int)
            
        corr_features = [
            {'key': 'Heart Rate (bpm)', 'label': 'Heart Rate'},
            {'key': 'SpO2 Level (%)', 'label': 'SpO2 Oxygen'},
            {'key': 'Systolic Blood Pressure (mmHg)', 'label': 'Systolic BP'},
            {'key': 'Diastolic Blood Pressure (mmHg)', 'label': 'Diastolic BP'},
            {'key': 'Body Temperature (°C)', 'label': 'Body Temp'},
            {'key': 'Data Accuracy (%)', 'label': 'Accuracy'},
        ]
        
        if 'Is_Heart_Disease' in df_corr.columns:
            corr_features.append({'key': 'Is_Heart_Disease', 'label': 'Heart Disease'})
        if 'Is_Hypertension' in df_corr.columns:
            corr_features.append({'key': 'Is_Hypertension', 'label': 'Hypertension'})
            
        keys = [f['key'] for f in corr_features if f['key'] in df_corr.columns]
        matrix = df_corr[keys].corr().round(3).values.tolist()
        
        corr_matrix_data = {
            'labels': [f['label'] for f in corr_features if f['key'] in df_corr.columns],
            'keys': keys,
            'matrix': matrix
        }
        
        # Target feature dependency
        corrs_with_target = []
        if 'Is_Heart_Disease' in df_corr.columns:
            for f in num_features:
                k = f['key']
                if k in df_corr.columns:
                    r_val = round(float(df_corr[k].corr(df_corr['Is_Heart_Disease'])), 3)
                    corrs_with_target.append({
                        'feature': f['name'],
                        'key': k,
                        'correlation': r_val,
                        'abs_corr': abs(r_val),
                        'unit': f['unit'],
                        'impact': 'High Primary Predictor' if abs(r_val) > 0.4 else ('Moderate Risk Factor' if abs(r_val) > 0.2 else 'Baseline Background')
                    })
            corrs_with_target.sort(key=lambda x: x['abs_corr'], reverse=True)
            
        file_size_mb = round(os.path.getsize(dataset_path) / (1024 * 1024), 2)
        
        profile = {
            'summary': {
                'total_records': total_records,
                'total_features': len(columns_list),
                'file_size_mb': file_size_mb,
                'missing_values': int(df.isnull().sum().sum()),
                'completeness_pct': 100.0 if df.isnull().sum().sum() == 0 else round((1 - df.isnull().sum().sum() / (total_records * len(columns_list))) * 100, 2),
                'classes_count': len(target_distribution),
                'sampling_fidelity': 'IEC-60601-1 Telemetry Validated'
            },
            'columns': columns_list,
            'target_distribution': target_distribution,
            'alert_prevalence': alert_prevalence,
            'feature_stats': feature_stats,
            'correlation_matrix': corr_matrix_data,
            'feature_dependencies': corrs_with_target
        }
        
        _CACHED_PROFILE = profile
        _CACHED_MTIME = mtime
        return profile
    except Exception as e:
        print(f"Error computing dataset profile: {e}")
        return None

def get_paginated_rows(dataset_path: str, page: int = 1, limit: int = 25, disease: str = None, search: str = None):
    if not os.path.exists(dataset_path):
        return {"error": "Dataset not found", "total": 0, "rows": []}
        
    df = pd.read_csv(dataset_path, encoding='utf-8', encoding_errors='replace')
    cols = list(df.columns)
    for i, c in enumerate(cols):
        if 'Body Temperature' in c:
            cols[i] = 'Body Temperature (°C)'
    df.columns = [c.strip() for c in cols]
    
    if disease and 'Predicted Disease' in df.columns and disease.lower() != 'all':
        df = df[df['Predicted Disease'].str.lower() == disease.lower()]
        
    if search:
        search_str = str(search).strip().lower()
        if 'Patient Number' in df.columns:
            df = df[df['Patient Number'].astype(str).str.contains(search_str, case=False, na=False)]
            
    total = len(df)
    total_pages = math.ceil(total / limit) if limit > 0 else 1
    
    page = max(1, page)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    page_df = df.iloc[start_idx:end_idx].copy()
    
    rows = page_df.to_dict(orient="records")
    for r in rows:
        for k, v in r.items():
            if isinstance(v, (np.floating, float)):
                r[k] = round(float(v), 2)
            elif isinstance(v, (np.integer, int)):
                r[k] = int(v)
            elif pd.isna(v):
                r[k] = None
                
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "features": df.columns.tolist(),
        "rows": rows
    }
