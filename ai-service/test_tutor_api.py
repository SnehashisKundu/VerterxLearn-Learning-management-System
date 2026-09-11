from fastapi.testclient import TestClient

from app.main import app


LECTURE_ID = "af3fdfa5-2e04-425b-a34c-42047272a47a"


client = TestClient(app)


print("=" * 60)
print("AI TUTOR /ASK END-TO-END TEST")
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
print("\nRESPONSE:")
print(response.json())


assert response.status_code == 200, (
    f"Expected 200, got {response.status_code}: "
    f"{response.text}"
)


data = response.json()


# -------------------------
# Response structure
# -------------------------

assert "answer" in data
assert "sources" in data

assert isinstance(data["answer"], str)
assert data["answer"].strip()

assert isinstance(data["sources"], list)


# -------------------------
# Watched-time safety
# -------------------------

for source in data["sources"]:
    start = source["start_seconds"]
    end = source["end_seconds"]

    if start is not None and end is not None:
        assert end <= 120, (
            f"Future content leaked: "
            f"chunk ends at {end}s while "
            f"student watched only 120s"
        )


print("\n--- VALIDATION ---")
print("HTTP 200: PASS")
print("Answer returned: PASS")
print("Answer is non-empty: PASS")
print("Sources returned: PASS")
print("Watched-time protection: PASS")

print("\n" + "=" * 60)
print("AI TUTOR /ASK E2E TEST PASSED")
print("=" * 60)