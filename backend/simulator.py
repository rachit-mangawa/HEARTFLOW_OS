import asyncio
import random
from typing import AsyncGenerator

class PatientDataSimulator:
    def __init__(self, initial_hr=75.0, initial_spo2=98.0, initial_sys=120.0, initial_dia=80.0, initial_temp=37.0):
        self.hr = initial_hr
        self.spo2 = initial_spo2
        self.sys_bp = initial_sys
        self.dia_bp = initial_dia
        self.temp = initial_temp
        
        self.target_hr = self.hr
        self.target_spo2 = self.spo2
        self.target_sys = self.sys_bp
        self.target_dia = self.dia_bp

    def _shift_state(self):
        # 5% chance every second to shift patient state
        if random.random() < 0.05:
            state = random.choice(["normal", "normal", "normal", "asthma", "hypertension", "heart_disease", "diabetes"])
            if state == "normal":
                self.target_hr, self.target_spo2, self.target_sys, self.target_dia = 75.0, 98.0, 120.0, 80.0
            elif state == "asthma":
                self.target_hr, self.target_spo2, self.target_sys, self.target_dia = 115.0, 88.0, 135.0, 85.0
            elif state == "hypertension":
                self.target_hr, self.target_spo2, self.target_sys, self.target_dia = 90.0, 97.0, 175.0, 105.0
            elif state == "heart_disease":
                self.target_hr, self.target_spo2, self.target_sys, self.target_dia = 135.0, 91.0, 150.0, 95.0
            elif state == "diabetes":
                self.target_hr, self.target_spo2, self.target_sys, self.target_dia = 85.0, 96.0, 140.0, 90.0

    def _step_physics(self):
        # Interpolate towards target with noise
        self.hr += (self.target_hr - self.hr) * 0.1 + random.uniform(-2, 2)
        self.spo2 += (self.target_spo2 - self.spo2) * 0.1 + random.uniform(-0.5, 0.5)
        self.sys_bp += (self.target_sys - self.sys_bp) * 0.1 + random.uniform(-1, 1)
        self.dia_bp += (self.target_dia - self.dia_bp) * 0.1 + random.uniform(-1, 1)
        self.temp = max(36.0, min(39.0, self.temp + random.uniform(-0.1, 0.1)))
        
        # Clamp values
        self.hr = max(50.0, min(180.0, self.hr))
        self.spo2 = max(80.0, min(100.0, self.spo2))

    async def run(self) -> AsyncGenerator[dict, None]:
        while True:
            self._shift_state()
            self._step_physics()
            
            yield {
                "Heart_Rate": round(self.hr, 1),
                "SpO2_Level": round(self.spo2, 1),
                "Systolic_BP": round(self.sys_bp, 1),
                "Diastolic_BP": round(self.dia_bp, 1),
                "Body_Temp": round(self.temp, 1)
            }
            await asyncio.sleep(1.0)
