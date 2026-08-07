from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import analyze

app = FastAPI(
    title="AI Medical Symptom Checker API",
    version="1.0.0"
)

# Enable CORS for Frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production me target domain set karein
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Router
app.include_router(analyze.router, prefix="/api")

@app.get("/")
def read_root():
    return {"status": "Online", "message": "AI Health Assistant API is running"}