from app.services import gemini_service


print("=" * 60)
print("GEMINI ALL-MODELS RATE LIMIT TEST")
print("=" * 60)


original_generate_with_model = gemini_service._generate_with_model

calls = []


def fake_generate_with_model(model_name: str, prompt: str) -> str:
    calls.append(model_name)

    raise gemini_service.GeminiRateLimitError(
        f"{model_name} rate limited"
    )


gemini_service._generate_with_model = fake_generate_with_model


try:
    try:
        gemini_service.generate_answer(
            question="What is Artificial Intelligence?",
            context=(
                "Artificial Intelligence systems learn patterns from data "
                "and use those patterns to make predictions."
            ),
        )

        raise AssertionError(
            "Expected GeminiRateLimitError, but answer was returned"
        )

    except gemini_service.GeminiRateLimitError as exc:
        print("\nERROR CAUGHT:")
        print(exc)

    print("\nMODELS CALLED:")
    for model in calls:
        print("-", model)

    expected_models = [
        gemini_service.PRIMARY_MODEL,
        *gemini_service.FALLBACK_MODELS,
    ]

    assert calls == expected_models

    print("\nPRIMARY MODEL ATTEMPT: PASS")
    print("FALLBACK MODELS ATTEMPTED: PASS")
    print("FINAL RATE LIMIT ERROR: PASS")

finally:
    gemini_service._generate_with_model = original_generate_with_model


print("\n" + "=" * 60)
print("ALL-MODELS RATE LIMIT TEST PASSED")
print("=" * 60)