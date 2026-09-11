from fastapi.testclient import TestClient

from app.main import app


LECTURE_ID = "af3fdfa5-2e04-425b-a34c-42047272a47a"

client = TestClient(app)


print("=" * 60)
print("AI TUTOR NO-CONTENT TEST")
print("=" * 60)


response = client.post(
    "/api/tutor/ask",
    json={
        "lecture_id": LECTURE_ID,
        "question": "What is Python?",
        "watched_seconds": 0,
    },
)


print("\nSTATUS CODE:", response.status_code)
print("\nRESPONSE:")
print(response.json())


assert response.status_code == 200, (
    f"Expected 200, got {response.status_code}: "
    f"{response.text}"
)


data = response.json()


assert "answer" in data
assert "sources" in data

assert isinstance(data["answer"], str)
assert data["answer"].strip()

assert isinstance(data["sources"], list)


# At 0 seconds, our timestamped chunks start after 0
# and therefore no lecture content should be available.
assert len(data["sources"]) == 0, (
    f"Expected no sources, got {len(data['sources'])}"
)


expected_message = (
    "I could not find enough relevant content "
    "in the lecture you have watched so far."
)

assert data["answer"] == expected_message, (
    f"Unexpected fallback answer: {data['answer']}"
)


print("\n--- VALIDATION ---")
print("HTTP 200: PASS")
print("Fallback answer returned: PASS")
print("No sources returned: PASS")
print("No watched lecture content exposed: PASS")

print("\n" + "=" * 60)
print("NO-CONTENT TEST PASSED")
print("=" * 60)