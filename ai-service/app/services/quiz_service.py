import json

from app.rag.context_builder import build_rag_context
from app.rag.retrieval_service import retrieve_relevant_chunks
from app.services.gemini_service import (
    generate_quiz_response,
    GeminiAPIError,
)


SUPPORTED_LANGUAGES = {
    "English",
    "Hindi",
    "Bengali",
    "Tamil",
    "Telugu",
    "Marathi",
}


def _validate_quiz_result(
    result: dict,
    question_count: int,
) -> dict:

    if not isinstance(result, dict):
        raise ValueError(
            "Gemini quiz response must be a JSON object"
        )

    questions = result.get("questions")

    if not isinstance(questions, list):
        raise ValueError(
            "Gemini quiz response must contain a questions list"
        )

    if len(questions) != question_count:
        raise ValueError(
            f"Expected {question_count} questions, "
            f"but Gemini returned {len(questions)}"
        )

    for index, question in enumerate(questions, start=1):

        if not isinstance(question, dict):
            raise ValueError(
                f"Question {index} must be an object"
            )

        question_text = question.get("question")
        options = question.get("options")
        correct_answer = question.get("correct_answer")
        explanation = question.get("explanation")

        if not isinstance(question_text, str) or not question_text.strip():
            raise ValueError(
                f"Question {index} has empty question text"
            )

        if not isinstance(options, list):
            raise ValueError(
                f"Question {index} options must be a list"
            )

        if len(options) != 4:
            raise ValueError(
                f"Question {index} must have exactly 4 options"
            )

        if any(
            not isinstance(option, str) or not option.strip()
            for option in options
        ):
            raise ValueError(
                f"Question {index} contains an empty option"
            )

        if len(set(options)) != 4:
            raise ValueError(
                f"Question {index} contains duplicate options"
            )

        if (
            not isinstance(correct_answer, str)
            or not correct_answer.strip()
        ):
            raise ValueError(
                f"Question {index} has an empty correct answer"
            )

        if correct_answer not in options:
            raise ValueError(
                f"Question {index} correct_answer "
                f"must match one of the options"
            )

        if (
            not isinstance(explanation, str)
            or not explanation.strip()
        ):
            raise ValueError(
                f"Question {index} has an empty explanation"
            )

    return result


def generate_mid_lecture_quiz(
    lecture_id: str,
    watched_seconds: int,
    question_count: int = 5,
    language: str = "English",
) -> dict:

    if not lecture_id.strip():
        raise ValueError(
            "Lecture ID cannot be empty"
        )

    if watched_seconds < 0:
        raise ValueError(
            "watched_seconds cannot be negative"
        )

    if question_count < 1:
        raise ValueError(
            "question_count must be at least 1"
        )

    if question_count > 10:
        raise ValueError(
            "question_count cannot exceed 10"
        )

    if not language.strip():
        raise ValueError(
            "language cannot be empty"
        )

    if language not in SUPPORTED_LANGUAGES:
        raise ValueError(
            f"Unsupported language: {language}. "
            f"Supported languages are: "
            f"{', '.join(sorted(SUPPORTED_LANGUAGES))}"
        )

    chunks = retrieve_relevant_chunks(
        query=(
            "important concepts, definitions and "
            "key points from this lecture"
        ),
        lecture_id=lecture_id,
        watched_seconds=watched_seconds,
        top_k=10,
    )

    if not chunks:
        return {
            "questions": []
        }

    context = build_rag_context(chunks)

    prompt = f"""
You are an AI tutor generating a quiz for an online learning platform.

Generate exactly {question_count} multiple-choice questions.

IMPORTANT RULES:

- Use ONLY the provided lecture context.
- The student has watched the lecture only up to {watched_seconds} seconds.
- Do NOT use information outside the provided context.
- Do NOT reveal or assume content from later parts of the lecture.
- Each question must have exactly 4 options.
- There must be exactly one correct answer.
- The correct answer MUST exactly match one of the four options.
- All four options must be unique.
- Questions should test understanding, not just memorization.
- Keep the questions clear and suitable for a student.

LANGUAGE RULES:

- Generate the entire quiz in {language}.
- The question must be written in {language}.
- All four options must be written in {language}.
- The explanation must be written in {language}.
- Keep the requested language consistent throughout the quiz.
- Do not switch to another language unless a technical term
  naturally requires it.

CRITICAL CORRECT ANSWER RULE:

- First create the four options.
- Then select exactly ONE of those four options as the correct answer.
- The "correct_answer" value MUST be copied character-for-character
  from the selected option.
- Do NOT rewrite, translate, transliterate, shorten, expand, or modify
  the correct answer.
- Whitespace and punctuation must also match exactly.
- The following must always be true:

  correct_answer == options[0]
  OR
  correct_answer == options[1]
  OR
  correct_answer == options[2]
  OR
  correct_answer == options[3]

- Never generate a correct_answer that is merely equivalent in meaning.
- Never generate a correct_answer that differs from an option.

OUTPUT RULES:

- Return ONLY valid JSON.
- Do not use Markdown.
- Do not add any text before or after the JSON.

Required JSON format:

{{
  "questions": [
    {{
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correct_answer": "Exactly one option from the options list",
      "explanation": "Short explanation"
    }}
  ]
}}

LECTURE CONTEXT:
{context}
"""

    response_text = generate_quiz_response(
        prompt=prompt,
    )

    if not response_text.strip():
        raise GeminiAPIError(
            "Gemini returned an empty quiz response"
        )

    try:
        result = json.loads(response_text)
    except json.JSONDecodeError as exc:
        raise GeminiAPIError(
            "Gemini returned invalid JSON for quiz generation"
        ) from exc

    return _validate_quiz_result(
        result=result,
        question_count=question_count,
    )