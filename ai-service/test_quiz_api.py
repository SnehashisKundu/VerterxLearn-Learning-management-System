from fastapi.testclient import TestClient

from app.main import app


LECTURE_ID = "af3fdfa5-2e04-425b-a34c-42047272a47a"

client = TestClient(app)


TESTS = [
    ("English", "What is Python?"),
    ("Hindi", "पायथन क्या है?"),
    ("Bengali", "পাইথন কী?"),
    ("Tamil", "பைதான் என்றால் என்ன?"),
    ("Telugu", "పైథాన్ అంటే ఏమిటి?"),
    ("Marathi", "पायथन म्हणजे काय?"),
]


print("=" * 60)
print("AI TUTOR /QUIZ MULTILINGUAL E2E TEST")
print("=" * 60)


passed = 0
rate_limited = 0


for language, question in TESTS:

    print("\n" + "-" * 60)
    print(f"LANGUAGE: {language}")
    print("Question:", question)

    response = client.post(
        "/api/tutor/quiz",
        json={
            "lecture_id": LECTURE_ID,
            "watched_seconds": 120,
            "question_count": 2,
            "language": language,
        },
    )

    print("STATUS CODE:", response.status_code)

    if response.status_code == 429:
        print("RATE LIMITED: Gemini quota/rate limit reached")
        rate_limited += 1
        continue

    assert response.status_code == 200, (
        f"{language}: expected 200, "
        f"got {response.status_code}: {response.text}"
    )

    data = response.json()

    print("\nRESPONSE:")
    print(data)

    # --------------------------------------------------
    # Response structure
    # --------------------------------------------------

    assert "questions" in data, (
        f"{language}: missing questions field"
    )

    assert isinstance(data["questions"], list), (
        f"{language}: questions must be a list"
    )

    assert len(data["questions"]) == 2, (
        f"{language}: expected 2 questions, "
        f"got {len(data['questions'])}"
    )

    # --------------------------------------------------
    # Validate every question
    # --------------------------------------------------

    for index, question_data in enumerate(
        data["questions"],
        start=1,
    ):

        print(f"\n--- {language} QUESTION {index} ---")

        question_text = question_data["question"]
        options = question_data["options"]
        correct_answer = question_data["correct_answer"]
        explanation = question_data["explanation"]

        print("Question:", question_text)
        print("Options:", options)
        print("Correct:", correct_answer)
        print("Explanation:", explanation)

        # Question
        assert isinstance(question_text, str), (
            f"{language} Q{index}: question must be a string"
        )

        assert question_text.strip(), (
            f"{language} Q{index}: question is empty"
        )

        # Options
        assert isinstance(options, list), (
            f"{language} Q{index}: options must be a list"
        )

        assert len(options) == 4, (
            f"{language} Q{index}: expected exactly 4 options"
        )

        assert all(
            isinstance(option, str) and option.strip()
            for option in options
        ), (
            f"{language} Q{index}: invalid option"
        )

        assert len(set(options)) == 4, (
            f"{language} Q{index}: duplicate options"
        )

        # Correct answer
        assert isinstance(correct_answer, str), (
            f"{language} Q{index}: "
            "correct_answer must be a string"
        )

        assert correct_answer in options, (
            f"{language} Q{index}: "
            "correct_answer does not match an option"
        )

        # Explanation
        assert isinstance(explanation, str), (
            f"{language} Q{index}: "
            "explanation must be a string"
        )

        assert explanation.strip(), (
            f"{language} Q{index}: explanation is empty"
        )

        # --------------------------------------------------
        # Watched-time safety
        # --------------------------------------------------

        # Quiz response itself does not expose sources,
        # so safety is enforced by the retrieval layer.
        # The request is intentionally limited to 120 seconds.

    print(f"{language}: PASS")
    passed += 1


# --------------------------------------------------
# Summary
# --------------------------------------------------

print("\n" + "=" * 60)
print("MULTILINGUAL QUIZ TEST SUMMARY")
print("=" * 60)

print(f"Languages passed: {passed}")
print(f"Rate-limited: {rate_limited}")

if rate_limited:
    print(
        "\nWARNING: Some languages were skipped because "
        "Gemini rate limit was reached."
    )

assert passed + rate_limited == len(TESTS)

assert passed > 0, (
    "No language completed successfully"
)

print("\nMULTILINGUAL QUIZ E2E TEST COMPLETED")
print("=" * 60)