from app.services.quiz_service import _validate_quiz_result


valid_quiz = {
    "questions": [
        {
            "question": "What is Python?",
            "options": [
                "A programming language",
                "A database",
                "An operating system",
                "A web browser",
            ],
            "correct_answer": "A programming language",
            "explanation": "Python is a programming language.",
        }
    ]
}


result = _validate_quiz_result(
    result=valid_quiz,
    question_count=1,
)

print("VALID QUIZ:", result)


invalid_quiz = {
    "questions": [
        {
            "question": "What is Python?",
            "options": [
                "A programming language",
                "A database",
                "An operating system",
                "A web browser",
            ],
            "correct_answer": "Something else",
            "explanation": "Python is a programming language.",
        }
    ]
}


try:
    _validate_quiz_result(
        result=invalid_quiz,
        question_count=1,
    )
except ValueError as exc:
    print("INVALID QUIZ CAUGHT:", exc)
    
    
print("\nTESTING QUESTION COUNT...")

wrong_count_quiz = {
    "questions": [
        {
            "question": "What is Python?",
            "options": [
                "A programming language",
                "A database",
                "An operating system",
                "A web browser",
            ],
            "correct_answer": "A programming language",
            "explanation": "Python is a programming language.",
        }
    ]
}

try:
    _validate_quiz_result(
        result=wrong_count_quiz,
        question_count=5,
    )
except ValueError as exc:
    print("QUESTION COUNT CAUGHT:", exc)