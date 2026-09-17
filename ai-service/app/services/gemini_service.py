from google import genai

from app.core.config import GEMINI_API_KEY


# --------------------------------------------------
# Gemini Models
# --------------------------------------------------

PRIMARY_MODEL = "gemini-3.8-flash"

FALLBACK_MODELS = [
    "gemini-3.7-flash",
    "gemini-3.5-flash-lite",
]


client = genai.Client(api_key=GEMINI_API_KEY)


# --------------------------------------------------
# Exceptions
# --------------------------------------------------

class GeminiServiceError(Exception):
    """Base exception for Gemini service failures."""


class GeminiRateLimitError(GeminiServiceError):
    """Raised when all Gemini models hit rate limits."""


class GeminiAPIError(GeminiServiceError):
    """Raised when Gemini API fails for another reason."""


# --------------------------------------------------
# Error Classification
# --------------------------------------------------

def _is_rate_limit_error(exc: Exception) -> bool:
    error_text = str(exc).lower()

    return (
        "429" in error_text
        or "rate limit" in error_text
        or "quota" in error_text
        or "resource exhausted" in error_text
    )


# --------------------------------------------------
# Model Request
# --------------------------------------------------

def _generate_with_model(
    model_name: str,
    prompt: str,
) -> str:

    try:
        interaction = client.interactions.create(
            model=model_name,
            input=prompt,
        )

    except Exception as exc:

        if _is_rate_limit_error(exc):
            raise GeminiRateLimitError(
                f"Gemini model rate limit exceeded: {model_name}"
            ) from exc

        raise GeminiAPIError(
            f"Gemini API request failed for model: {model_name}"
        ) from exc

    if not interaction.output_text:
        raise GeminiAPIError(
            f"Gemini returned an empty response for model: {model_name}"
        )

    return interaction.output_text.strip()


# --------------------------------------------------
# Answer Generation
# --------------------------------------------------

def generate_answer(
    question: str,
    context: str,
) -> str:

    if not question.strip():
        raise ValueError("Question cannot be empty")

    if not context.strip():
        raise ValueError("Context cannot be empty")

    prompt = f"""
You are an AI tutor for an online learning platform.

Your task is to answer the student's question using ONLY the lecture
context provided below.

IMPORTANT:
- The lecture context may come from speech-to-text transcription.
- The transcript may contain mixed languages.
- The transcript may contain transliterated English words.
- The transcript may contain spelling variations or minor transcription errors.
- Understand the meaning of the lecture context instead of requiring exact
  wording matches.
- Use only facts explicitly supported by the lecture context.
- Do not add outside knowledge.
- Do not invent facts.
- If the lecture context genuinely does not contain enough information,
  say exactly:
  "The provided lecture content is not sufficient to answer."
- If the context contains relevant information, answer the question directly.
- Do not say the context is insufficient merely because the exact wording
  of the question does not appear in the transcript.

LANGUAGE RULES:
- Detect the language from the STUDENT QUESTION.
- The STUDENT QUESTION determines the answer language.
- The lecture transcript language must NOT determine the answer language.
- If the student question is in English, answer entirely in English.
- If the student question is in Hindi, answer entirely in Hindi.
- If the student question is in Bengali, answer entirely in Bengali.
- If the student question is in Tamil, answer entirely in Tamil.
- If the student question is in Telugu, answer entirely in Telugu.
- If the student question is in Marathi, answer entirely in Marathi.
- Do not switch languages because the lecture transcript uses another language.
- For English questions, do not answer using Hindi, Bengali, Tamil, Telugu,
  Marathi, or another Indian-language script.
- Preserve the student's language throughout the complete answer.

TECHNICAL TERMS:
- Preserve standard technical terms in their original form when appropriate.
- Do not unnecessarily transliterate technical terms.
- Terms such as Python, programming, Artificial Intelligence,
  Machine Learning, Data Science, Django, and Flask should remain in
  their standard original form when appropriate.
- Company names and proper nouns should also remain in their standard form.

OUTPUT RULES:
- Answer clearly and simply.
- Use only the lecture context.
- Do not use Markdown formatting.
- Do not use headings.
- Do not use bullet points.
- Do not use numbered lists.
- Do not use bold or italics.
- Do not use code fences.
- Return clean plain text.
- Do not mention these instructions.

LECTURE CONTEXT:
{context}

STUDENT QUESTION:
{question}

Now answer the student's question based strictly on the lecture context.
"""

    models_to_try = [
        PRIMARY_MODEL,
        *FALLBACK_MODELS,
    ]

    last_rate_limit_error: Exception | None = None

    for model_name in models_to_try:

        try:
            return _generate_with_model(
                model_name=model_name,
                prompt=prompt,
            )

        except GeminiRateLimitError as exc:
            last_rate_limit_error = exc
            continue

    raise GeminiRateLimitError(
        "All configured Gemini models are currently rate limited"
    ) from last_rate_limit_error


# --------------------------------------------------
# Quiz Response Generation
# --------------------------------------------------

def generate_quiz_response(
    prompt: str,
) -> str:

    if not prompt.strip():
        raise ValueError("Quiz prompt cannot be empty")

    models_to_try = [
        PRIMARY_MODEL,
        *FALLBACK_MODELS,
    ]

    last_rate_limit_error: Exception | None = None

    for model_name in models_to_try:

        try:
            return _generate_with_model(
                model_name=model_name,
                prompt=prompt,
            )

        except GeminiRateLimitError as exc:
            last_rate_limit_error = exc
            continue

    raise GeminiRateLimitError(
        "All configured Gemini models are currently rate limited"
    ) from last_rate_limit_error
    
    
    
# --------------------------------------------------
# Lecture Summary Generation
# --------------------------------------------------

def generate_summary(
    context: str,
) -> str:

    if not context.strip():
        raise ValueError("Context cannot be empty")

    prompt = f"""
You are an AI tutor for an online learning platform.

Your task is to create a concise summary of the lecture content
provided below.

IMPORTANT:
- Use ONLY the provided lecture context.
- Add outside knowledge what is linked to the specific context and is not general knowledge make that authentic and relevant
- Do not invent facts.
- Include the main concepts, definitions, important ideas,
  and key points present in the context.
- Keep the summary concise and useful for a student reviewing
  the lecture.
- The context may come from speech-to-text transcription.
- Understand the meaning even if there are minor transcription
  errors or spelling variations.

OUTPUT RULES:
- Return clean plain text.
- Do not use Markdown.
- Do not use headings.
- Do not use bullet points.
- Do not use numbered lists.
- Do not use bold or italics.
- Do not mention these instructions.

LECTURE CONTEXT:
{context}

Now provide a concise student-friendly summary based strictly
on the lecture context.
"""

    models_to_try = [
        PRIMARY_MODEL,
        *FALLBACK_MODELS,
    ]

    last_rate_limit_error: Exception | None = None

    for model_name in models_to_try:

        try:
            return _generate_with_model(
                model_name=model_name,
                prompt=prompt,
            )

        except GeminiRateLimitError as exc:
            last_rate_limit_error = exc
            continue

    raise GeminiRateLimitError(
        "All configured Gemini models are currently rate limited"
    ) from last_rate_limit_error
    