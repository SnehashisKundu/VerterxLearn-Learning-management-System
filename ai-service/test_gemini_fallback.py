from app.services import gemini_service


print("=" * 60)
print("GEMINI MODEL FALLBACK TEST")
print("=" * 60)


original_generate_with_model = gemini_service._generate_with_model

calls = []


def fake_generate_with_model(model_name: str, prompt: str) -> str:
    calls.append(model_name)

    if model_name == gemini_service.PRIMARY_MODEL:
        raise gemini_service.GeminiRateLimitError(
            "Primary model rate limited"
        )

    return "Fallback model generated this answer successfully."


gemini_service._generate_with_model = fake_generate_with_model


try:
    answer = gemini_service.generate_answer(
        question="What is Artificial Intelligence?",
        context=(
            "Artificial Intelligence systems learn patterns from data "
            "and use those patterns to make predictions."
        ),
    )

    print("\nANSWER:")
    print(answer)

    print("\nMODELS CALLED:")
    for model in calls:
        print("-", model)

    assert calls[0] == gemini_service.PRIMARY_MODEL
    assert len(calls) >= 2
    assert answer == "Fallback model generated this answer successfully."

    print("\nPRIMARY MODEL RATE LIMIT: PASS")
    print("FALLBACK MODEL USED: PASS")
    print("ANSWER RETURNED: PASS")

finally:
    gemini_service._generate_with_model = original_generate_with_model


print("\n" + "=" * 60)
print("GEMINI FALLBACK TEST PASSED")
print("=" * 60)