import pytest
import asyncio
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))
from simulator import PatientDataSimulator

@pytest.mark.asyncio
async def test_simulator_initialization():
    sim = PatientDataSimulator(initial_hr=80.0)
    assert sim.hr == 80.0
    assert sim.spo2 == 98.0
    assert sim.sys_bp == 120.0
    assert sim.dia_bp == 80.0
    assert sim.temp == 37.0

@pytest.mark.asyncio
async def test_simulator_shift_state():
    sim = PatientDataSimulator()
    import random
    random.seed(42)
    sim.target_hr = 150.0
    sim._step_physics()
    assert sim.hr > 75.0 

@pytest.mark.asyncio
async def test_simulator_run_yields_dict():
    sim = PatientDataSimulator()
    generator = sim.run()
    data = await anext(generator)
    assert isinstance(data, dict)
    assert "Heart_Rate" in data
    assert "SpO2_Level" in data
    assert "Systolic_BP" in data
    assert "Diastolic_BP" in data
    assert "Body_Temp" in data
