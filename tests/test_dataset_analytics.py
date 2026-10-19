import pytest
import os
import sys
import pandas as pd

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from dataset_analytics import get_dataset_profile, get_paginated_rows

@pytest.fixture(scope="module")
def sample_dataset(tmp_path_factory):
    fn = tmp_path_factory.mktemp("data") / "test_corpus.csv"
    df = pd.DataFrame({
        'Patient Number': list(range(1, 101)),
        'Heart Rate (bpm)': [70 + (i % 50) for i in range(100)],
        'SpO2 Level (%)': [95 + (i % 5) for i in range(100)],
        'Systolic Blood Pressure (mmHg)': [110 + (i % 60) for i in range(100)],
        'Diastolic Blood Pressure (mmHg)': [70 + (i % 30) for i in range(100)],
        'Body Temperature (°C)': [36.5 + ((i % 15) * 0.1) for i in range(100)],
        'Fall Detection': ['No' if i % 10 != 0 else 'Yes' for i in range(100)],
        'Predicted Disease': [
            'Healthy' if i % 4 == 0 else ('Heart Disease' if i % 4 == 1 else ('Hypertension' if i % 4 == 2 else 'Asthma'))
            for i in range(100)
        ],
        'Data Accuracy (%)': [98 for _ in range(100)],
        'Heart Rate Alert': ['NORMAL' for _ in range(100)],
        'SpO2 Level Alert': ['NORMAL' for _ in range(100)],
        'Blood Pressure Alert': ['NORMAL' for _ in range(100)],
        'Temperature Alert': ['NORMAL' for _ in range(100)]
    })
    df.to_csv(fn, index=False)
    return str(fn)

def test_get_dataset_profile_valid(sample_dataset):
    profile = get_dataset_profile(sample_dataset)
    assert profile is not None
    assert isinstance(profile, dict)
    
    # Required keys
    assert "summary" in profile
    assert profile["summary"]["total_records"] == 100
    assert "target_distribution" in profile
    assert len(profile["target_distribution"]) == 4
    assert "correlation_matrix" in profile
    assert "labels" in profile["correlation_matrix"]
    assert "matrix" in profile["correlation_matrix"]
    assert "feature_stats" in profile

def test_get_dataset_profile_caching(sample_dataset):
    # Verify in-memory caching returns identical object reference
    p1 = get_dataset_profile(sample_dataset)
    p2 = get_dataset_profile(sample_dataset)
    assert p1 is p2

def test_get_dataset_profile_nonexistent():
    prof = get_dataset_profile("non_existent_path_xyz.csv")
    assert prof is None

def test_get_paginated_rows_default(sample_dataset):
    res = get_paginated_rows(sample_dataset, page=1, limit=25)
    assert res["total"] == 100
    assert res["page"] == 1
    assert res["limit"] == 25
    assert res["total_pages"] == 4
    assert len(res["rows"]) == 25

def test_get_paginated_rows_boundary_clamps(sample_dataset):
    # Page <= 0 should clamp to 1
    res_zero = get_paginated_rows(sample_dataset, page=0, limit=10)
    assert res_zero["page"] == 1
    assert len(res_zero["rows"]) == 10

    res_neg = get_paginated_rows(sample_dataset, page=-5, limit=10)
    assert res_neg["page"] == 1
    assert len(res_neg["rows"]) == 10

def test_get_paginated_rows_out_of_bounds_page(sample_dataset):
    res = get_paginated_rows(sample_dataset, page=9999, limit=25)
    assert res["total"] == 100
    assert res["rows"] == []

def test_get_paginated_rows_disease_filtering(sample_dataset):
    # Case insensitive exact match
    res_hd = get_paginated_rows(sample_dataset, page=1, limit=50, disease="heart disease")
    assert res_hd["total"] == 25
    for r in res_hd["rows"]:
        assert r["Predicted Disease"].lower() == "heart disease"

    # Non-matching disease
    res_unknown = get_paginated_rows(sample_dataset, page=1, limit=50, disease="alien syndrome")
    assert res_unknown["total"] == 0
    assert res_unknown["rows"] == []

def test_get_paginated_rows_search_filtering(sample_dataset):
    # Search by patient ID substring
    res_search = get_paginated_rows(sample_dataset, page=1, limit=50, search="42")
    assert res_search["total"] >= 1
    assert any(r["Patient Number"] == 42 for r in res_search["rows"])
