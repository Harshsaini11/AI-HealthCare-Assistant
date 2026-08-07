from pydantic import BaseModel, Field
from typing import List

class SymptomRequest(BaseModel):
    age: int = Field(..., ge=1, le=120, description="Patient age in years")
    gender: str = Field(..., description="Patient gender (Male, Female, Other)")
    symptoms: str = Field(..., min_length=3, description="Detailed description of symptoms")

class SymptomResponse(BaseModel):
    possible_conditions: List[str]
    what_to_do: List[str]
    what_to_eat: List[str]
    what_to_avoid: List[str]
    otc_medications: List[str]
    doctor_urgency: str  # "Low", "Medium", or "High"
    disclaimer: str