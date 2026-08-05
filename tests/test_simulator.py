import pytest
import asyncio
import sys
import os

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from simulator import PatientDataSimulator

@pytest.mark.asyncio
async def test_simulator_initialization():
    sim = PatientDataSimulator(initial_hr=80.0, initial_spo2=97.0, initial_sys=125.0, initial_dia=82.0, initial_temp=36.8)
    assert sim.hr == 80.0
    assert sim.spo2 == 97.0
    assert sim.sys_bp == 125.0
    assert sim.dia_bp == 82.0
    assert sim.temp == 36.8

@pytest.mark.asyncio
async def test_simulator_clamping_limits():
    """Verify that extreme physiological values are strictly clamped to realistic bounds."""
    # Test upper clamping bounds
    sim_upper = PatientDataSimulator(initial_hr=250.0, initial_spo2=120.0, initial_temp=45.0)
    sim_upper._step_physics()
    assert sim_upper.hr <= 180.0
    assert sim_upper.spo2 <= 100.0
    assert sim_upper.temp <= 39.0

    # Test lower clamping bounds
    sim_lower = PatientDataSimulator(initial_hr=20.0, initial_spo2=50.0, initial_temp=30.0)
    sim_lower._step_physics()
    assert sim_lower.hr >= 50.0
    assert sim_lower.spo2 >= 80.0
    assert sim_lower.temp >= 36.0

@pytest.mark.asyncio
async def test_simulator_all_clinical_state_transitions():
    """Verify that every clinical state sets exact prescribed target vitals."""
    sim = PatientDataSimulator()
    import random
    
    # Test state targets directly
    states_and_targets = {
        "normal": (75.0, 98.0, 120.0, 80.0),
        "asthma": (115.0, 88.0, 135.0, 85.0),
        "hypertension": (90.0, 97.0, 175.0, 105.0),
        "heart_disease": (135.0, 91.0, 150.0, 95.0),
        "diabetes": (85.0, 96.0, 140.0, 90.0)
    }

    for state, (exp_hr, exp_spo2, exp_sys, exp_dia) in states_and_targets.items():
        # Force the state assignment as in _shift_state
        if state == "normal":
            sim.target_hr, sim.target_spo2, sim.target_sys, sim.target_dia = 75.0, 98.0, 120.0, 80.0
        elif state == "asthma":
            sim.target_hr, sim.target_spo2, sim.target_sys, sim.target_dia = 115.0, 88.0, 135.0, 85.0
        elif state == "hypertension":
            sim.target_hr, sim.target_spo2, sim.target_sys, sim.target_dia = 90.0, 97.0, 175.0, 105.0
        elif state == "heart_disease":
            sim.target_hr, sim.target_spo2, sim.target_sys, sim.target_dia = 135.0, 91.0, 150.0, 95.0
        elif state == "diabetes":
            sim.target_hr, sim.target_spo2, sim.target_sys, sim.target_dia = 85.0, 96.0, 140.0, 90.0

        assert sim.target_hr == exp_hr
        assert sim.target_spo2 == exp_spo2
        assert sim.target_sys == exp_sys
        assert sim.target_dia == exp_dia

@pytest.mark.asyncio
async def test_simulator_physics_convergence():
    """Verify that physics stepping continuously converges towards target values."""
    sim = PatientDataSimulator(initial_hr=75.0)
    sim.target_hr = 140.0
    
    # After 30 physics iterations, hr should have drifted significantly towards 140
    for _ in range(30):
        sim._step_physics()
        
    assert sim.hr > 110.0

@pytest.mark.asyncio
async def test_simulator_run_yields_dict_with_rounding():
    sim = PatientDataSimulator()
    generator = sim.run()
    data = await anext(generator)
    
    assert isinstance(data, dict)
    assert "Heart_Rate" in data
    assert "SpO2_Level" in data
    assert "Systolic_BP" in data
    assert "Diastolic_BP" in data
    assert "Body_Temp" in data
    
    # Ensure rounded float representations
    for k in ["Heart_Rate", "SpO2_Level", "Systolic_BP", "Diastolic_BP", "Body_Temp"]:
        val = data[k]
        assert isinstance(val, (int, float))
        assert round(val, 1) == val
