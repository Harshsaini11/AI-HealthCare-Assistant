import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

async def analyze_symptoms_with_ai(age: int, gender: str, symptoms: str) -> dict:
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set in backend/.env file")

    client = genai.Client(api_key=GEMINI_API_KEY)

    prompt = f"""
    You are an AI Healthcare Assistant. Analyze the patient and respond in JSON.
    Age: {age}, Gender: {gender}, Symptoms: {symptoms}

    Return strict JSON structure:
    {{
      "possible_conditions": ["Condition 1", "Condition 2"],
      "what_to_do": ["Step 1", "Step 2"],
      "what_to_eat": ["Food 1", "Food 2"],
      "what_to_avoid": ["Avoid 1", "Avoid 2"],
      "otc_medications": ["Home remedy 1", "Home remedy 2"],
      "doctor_urgency": "Low",
      "disclaimer": "This information is for informational purposes only."
    }}
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
        )

        raw_text = response.text.strip()

        if raw_text.startswith("```"):
            lines = raw_text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            raw_text = "\n".join(lines).strip()

        return json.loads(raw_text)

    except Exception as e:
        print(f"\n================ [AI SERVICE ERROR] ================\n{str(e)}\n====================================================\n")
        raise e