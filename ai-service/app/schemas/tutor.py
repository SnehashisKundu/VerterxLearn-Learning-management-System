from typing import Literal

from pydantic import BaseModel, Field


SupportedLanguage = Literal[
    "English",
    "Hindi",
    "Bengali",
    "Tamil",
    "Telugu",
    "Marathi",
]


class TutorAskRequest(BaseModel):
    lecture_id: str = Field(..., min_length=1)
    question: str = Field(..., min_length=1)
    watched_seconds: int = Field(..., ge=0)


class TutorSource(BaseModel):
    chunk_id: str
    start_seconds: int | None
    end_seconds: int | None
    similarity: float


class TutorAskResponse(BaseModel):
    answer: str
    sources: list[TutorSource]


# -------------------------
# Mid-Lecture Quiz
# -------------------------

class TutorQuizRequest(BaseModel):
    lecture_id: str = Field(..., min_length=1)
    watched_seconds: int = Field(..., ge=0)
    question_count: int = Field(default=5, ge=1, le=10)
    language: SupportedLanguage = "English"


class QuizQuestion(BaseModel):
    question: str
    options: list[str] = Field(..., min_length=2)
    correct_answer: str
    explanation: str


class TutorQuizResponse(BaseModel):
    questions: list[QuizQuestion]