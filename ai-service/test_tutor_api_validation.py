from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


print("=" * 60)
print("AI TUTOR API VALIDATION TEST")
print("=" * 60)


# --------------------------------------------------
# Test 1: Empty question
# --------------------------------------------------

response = client.post(
    "/api/tutor/ask",
    json={
        "lecture_id": "af3fdfa5-2e04-425b-a34c-42047272a47a",
        "question": "",
        "watched_seconds": 120,
    },
)

print("\nEMPTY QUESTION")
print("Status:", response.status_code)
print("Response:", response.json())

assert response.status_code == 422
print("PASS")


# --------------------------------------------------
# Test 2: Negative watched_seconds
# --------------------------------------------------

response = client.post(
    "/api/tutor/ask",
    json={
        "lecture_id": "af3fdfa5-2e04-425b-a34c-42047272a47a",
        "question": "What is Python?",
        "watched_seconds": -1,
    },
)

print("\nNEGATIVE WATCHED SECONDS")
print("Status:", response.status_code)
print("Response:", response.json())

assert response.status_code == 422
print("PASS")


# --------------------------------------------------
# Test 3: Empty lecture_id
# --------------------------------------------------

response = client.post(
    "/api/tutor/ask",
    json={
        "lecture_id": "",
        "question": "What is Python?",
        "watched_seconds": 120,
    },
)

print("\nEMPTY LECTURE ID")
print("Status:", response.status_code)
print("Response:", response.json())

assert response.status_code == 422
print("PASS")


# --------------------------------------------------
# Test 4: Invalid question_count
# --------------------------------------------------

response = client.post(
    "/api/tutor/quiz",
    json={
        "lecture_id": "af3fdfa5-2e04-425b-a34c-42047272a47a",
        "watched_seconds": 120,
        "question_count": 0,
    },
)

print("\nINVALID QUIZ QUESTION COUNT")
print("Status:", response.status_code)
print("Response:", response.json())

assert response.status_code == 422
print("PASS")


# --------------------------------------------------
# Test 5: Question count above maximum
# --------------------------------------------------

response = client.post(
    "/api/tutor/quiz",
    json={
        "lecture_id": "af3fdfa5-2e04-425b-a34c-42047272a47a",
        "watched_seconds": 120,
        "question_count": 11,
    },
)

print("\nQUESTION COUNT ABOVE MAXIMUM")
print("Status:", response.status_code)
print("Response:", response.json())

assert response.status_code == 422
print("PASS")


print("\n" + "=" * 60)
print("ALL API VALIDATION TESTS PASSED")
print("=" * 60)