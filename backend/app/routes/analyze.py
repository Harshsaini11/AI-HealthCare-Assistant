from fastapi import APIRouter, HTTPException
from app.schemas.symptom_schema import SymptomRequest, SymptomResponse
from app.services.ai_service import analyze_symptoms_with_ai

router = APIRouter()

@router.post("/analyze", response_model=SymptomResponse)
async def analyze_symptoms(request: SymptomRequest):
    try:
        result = await analyze_symptoms_with_ai(
            age=request.age,
            gender=request.gender,
            symptoms=request.symptoms
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")