from fastapi.testclient import TestClient

from app.main import app
from app.services.gemini_service import GeminiRateLimitError

import app.services.tutor_service as tutor_service


client = TestClient(app)

LECTURE_ID = "af3fdfa5-2e04-425b-a34c-42047272a47a"


def fake_generate_answer(*args, **kwargs):
    raise GeminiRateLimitError("Gemini API rate limit exceeded")


original_generate_answer = tutor_service.generate_answer
tutor_service.generate_answer = fake_generate_answer


try:
    print("=" * 60)
    print("AI TUTOR GEMINI 429 RATE LIMIT TEST")
    print("=" * 60)

    response = client.post(
        "/api/tutor/ask",
        json={
            "lecture_id": LECTURE_ID,
            "question": "What is Python?",
            "watched_seconds": 120,
        },
    )

    print("\nSTATUS CODE:", response.status_code)
    print("RESPONSE:", response.json())

    assert response.status_code == 429
    assert response.json()["detail"] == "Gemini API rate limit exceeded"

    print("\n429 ERROR HANDLING: PASS")

finally:
    tutor_service.generate_answer = original_generate_answer


print("\n" + "=" * 60)
print("GEMINI 429 ERROR TEST PASSED")
print("=" * 60)