from fastapi import FastAPI
from app.api.tutor import router as tutor_router


app = FastAPI(
    title="Internmo AI Tutor Service",
    version="1.0.0",
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "ai-tutor",
    }


app.include_router(tutor_router)