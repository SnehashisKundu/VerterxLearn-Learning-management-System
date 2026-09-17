from fastapi import APIRouter, HTTPException

from app.schemas.tutor import (
    TutorAskRequest,
    TutorAskResponse,
    TutorQuizRequest,
    TutorQuizResponse,
    QuizQuestion,
    TutorSummaryRequest,
    TutorSummaryResponse,
)

from app.services.tutor_service import ask_tutor
from app.services.quiz_service import generate_mid_lecture_quiz
from app.services.gemini_service import (
    GeminiRateLimitError,
    GeminiAPIError,
)
from app.services.summary_service import generate_lecture_summary

router = APIRouter(
    prefix="/api/tutor",
    tags=["Tutor"],
)


@router.post(
    "/ask",
    response_model=TutorAskResponse,
    responses={
        400: {"description": "Invalid tutor ask request"},
        429: {"description": "Gemini API rate limit exceeded"},
        503: {"description": "Gemini API unavailable"},
    },
)
def tutor_ask(request: TutorAskRequest):
    try:
        return ask_tutor(
            lecture_id=request.lecture_id,
            question=request.question,
            watched_seconds=request.watched_seconds,
        )

    except GeminiRateLimitError as exc:
        raise HTTPException(
            status_code=429,
            detail=str(exc),
        ) from exc

    except GeminiAPIError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc


@router.post(
    "/quiz",
    response_model=TutorQuizResponse,
    responses={
        400: {"description": "Invalid tutor quiz request"},
        429: {"description": "Gemini API rate limit exceeded"},
        503: {"description": "Gemini API unavailable"},
    },
)
def generate_quiz(request: TutorQuizRequest):
    try:
        result = generate_mid_lecture_quiz(
            lecture_id=request.lecture_id,
            watched_seconds=request.watched_seconds,
            question_count=request.question_count,
            language=request.language,
        )

        return TutorQuizResponse(
            questions=[
                QuizQuestion(**question)
                for question in result.get("questions", [])
            ]
        )

    except GeminiRateLimitError as exc:
        raise HTTPException(
            status_code=429,
            detail=str(exc),
        ) from exc

    except GeminiAPIError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
        
        
@router.post(
    "/summary",
    response_model=TutorSummaryResponse,
    responses={
        400: {"description": "Invalid tutor summary request"},
        429: {"description": "Gemini API rate limit exceeded"},
        503: {"description": "Gemini API unavailable"},
    },
)
def lecture_summary(request: TutorSummaryRequest):
    try:
        result = generate_lecture_summary(
            lecture_id=request.lecture_id,
            watched_seconds=request.watched_seconds,
        )

        return TutorSummaryResponse(**result)

    except GeminiRateLimitError as exc:
        raise HTTPException(
            status_code=429,
            detail=str(exc),
        ) from exc

    except GeminiAPIError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc