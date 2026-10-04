from pydantic import BaseModel

class PatientData(BaseModel):
    Heart_Rate: float
    SpO2_Level: float
    Systolic_BP: float
    Diastolic_BP: float
    Body_Temp: float
