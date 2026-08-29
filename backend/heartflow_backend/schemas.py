from pydantic import BaseModel, Field

class PatientData(BaseModel):
    Heart_Rate: float = Field(..., ge=0, le=300)
    SpO2_Level: float = Field(..., ge=0, le=100)
    Systolic_BP: float = Field(..., ge=0, le=300)
    Diastolic_BP: float = Field(..., ge=0, le=250)
    Body_Temp: float = Field(..., ge=20, le=50)
