from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)

LECTURE_ID = "af3fdfa5-2e04-425b-a34c-42047272a47a"
WATCHED_SECONDS = 120

TESTS = [
    ("English", "What is Python?", ["Python", "programming"]),
    ("Hindi", "पायथन क्या है?", ["पायथन", "प्रोग्रामिंग"]),
    ("Bengali", "পাইথন কী?", ["পাইথন", "প্রোগ্রামিং"]),
    ("Tamil", "பைத்தான் என்றால் என்ன?", ["பைத்தான்"]),
    ("Telugu", "పైథాన్ అంటే ఏమిటి?", ["పైథాన్"]),
    ("Marathi", "पायथन म्हणजे काय?", ["पायथन"]),
]


print("=" * 60)
print("AI TUTOR MULTILINGUAL E2E TEST")
print("=" * 60)

passed = 0
skipped_rate_limit = 0


for language, question, expected_terms in TESTS:

    print(f"\n--- {language} ---")
    print("Question:", question)

    response = client.post(
        "/api/tutor/ask",
        json={
            "lecture_id": LECTURE_ID,
            "question": question,
            "watched_seconds": WATCHED_SECONDS,
        },
    )

    print("Status:", response.status_code)

    # ---------------------------------------------------------
    # Rate limit
    # ---------------------------------------------------------

    if response.status_code == 429:
        print("RATE LIMITED: Gemini quota currently exhausted")
        skipped_rate_limit += 1
        continue

    # ---------------------------------------------------------
    # Gemini unavailable
    # ---------------------------------------------------------

    if response.status_code == 503:
        print("GEMINI UNAVAILABLE")
        print("Response:", response.json())
        continue

    # ---------------------------------------------------------
    # Normal success
    # ---------------------------------------------------------

    assert response.status_code == 200, (
        f"{language}: expected 200, got {response.status_code}"
    )

    data = response.json()

    answer = data.get("answer", "")
    sources = data.get("sources", [])

    print("Answer:", answer)
    print("Sources:", len(sources))

    # Basic response validation
    assert answer.strip(), (
        f"{language}: answer is empty"
    )

    assert sources, (
        f"{language}: no sources returned"
    )

    # ---------------------------------------------------------
    # Watched-time safety
    # ---------------------------------------------------------

    for source in sources:

        assert source["end_seconds"] <= WATCHED_SECONDS, (
            f"{language}: source exceeds watched time: "
            f"{source['end_seconds']} > {WATCHED_SECONDS}"
        )

    # ---------------------------------------------------------
    # Language validation
    # ---------------------------------------------------------

    answer_lower = answer.lower()

    if language == "English":
        assert any(
            term.lower() in answer_lower
            for term in expected_terms
        ), f"{language}: expected English terminology not found"

    else:
        assert any(
            term in answer
            for term in expected_terms
        ), f"{language}: expected native-language text not found"

    print(f"{language}: PASS")
    passed += 1


print("\n" + "=" * 60)
print("MULTILINGUAL TEST SUMMARY")
print("=" * 60)

print("Languages passed:", passed)
print("Rate-limited:", skipped_rate_limit)

if passed == len(TESTS):
    print("\nALL MULTILINGUAL E2E TESTS PASSED")
elif passed > 0:
    print(
        "\nMULTILINGUAL E2E PARTIALLY PASSED "
        "(some requests were rate limited)"
    )
else:
    print(
        "\nNO MULTILINGUAL REQUEST COMPLETED "
        "SUCCESSFULLY"
    )

print("=" * 60)