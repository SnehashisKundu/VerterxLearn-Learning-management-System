from pydantic import BaseModel, Field


class TutorAskRequest(BaseModel):
    user_id: str
    lecture_id: str

    question: str = Field(
        min_length=1,
        max_length=2000,
    )

    watched_seconds: int = Field(
        ge=0,
    )


class TutorAskResponse(BaseModel):
    answer: str
    lecture_id: str
    watched_seconds: int
    grounded: bool