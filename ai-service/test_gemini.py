from app.services.gemini_service import generate_answer


print("=" * 60)
print("GEMINI ANSWER GENERATION TEST")
print("=" * 60)

answer = generate_answer(
    question="What is Artificial Intelligence?",
    context=(
        "Artificial Intelligence systems learn patterns from data "
        "and use them to make predictions."
    ),
)

print("\n--- GEMINI ANSWER ---")
print(answer)

# Basic validation
assert answer
assert isinstance(answer, str)
assert len(answer.strip()) > 0

print("\n--- VALIDATION ---")
print("Answer returned: PASS")
print("Answer is non-empty: PASS")
print("Gemini generation: PASS")

print("\n" + "=" * 60)
print("GEMINI TEST PASSED")
print("=" * 60)