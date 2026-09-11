from app.services.gemini_service import generate_answer


CONTEXT = (
    "Artificial Intelligence systems learn patterns from data "
    "and use those patterns to make predictions."
)


TESTS = [
    ("English", "What is Artificial Intelligence?"),
    ("Hindi", "कृत्रिम बुद्धिमत्ता क्या है?"),
    ("Bengali", "কৃত্রিম বুদ্ধিমত্তা কী?"),
    ("Tamil", "செயற்கை நுண்ணறிவு என்றால் என்ன?"),
    ("Telugu", "కృత్రిమ మేధస్సు అంటే ఏమిటి?"),
    ("Marathi", "कृत्रिम बुद्धिमत्ता म्हणजे काय?"),
]


print("=" * 60)
print("GEMINI MULTILINGUAL ANSWER TEST")
print("=" * 60)


for language, question in TESTS:
    print(f"\n--- {language} ---")
    print("Question:", question)

    answer = generate_answer(
        question=question,
        context=CONTEXT,
    )

    print("Answer:", answer)

    assert answer.strip(), f"{language}: empty answer"

    print(f"{language}: PASS")


print("\n" + "=" * 60)
print("MULTILINGUAL GEMINI TEST PASSED")
print("=" * 60)