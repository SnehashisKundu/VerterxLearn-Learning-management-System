from app.rag.context_builder import build_rag_context
from app.rag.retrieval_service import retrieve_relevant_chunks
from app.services.gemini_service import generate_summary


def generate_lecture_summary(
    lecture_id: str,
    watched_seconds: int,
) -> dict:

    if not lecture_id.strip():
        raise ValueError("Lecture ID cannot be empty")

    if watched_seconds < 0:
        raise ValueError(
            "watched_seconds cannot be negative"
        )

    chunks = retrieve_relevant_chunks(
        query=(
            "important concepts, definitions, "
            "key points and main ideas from this lecture"
        ),
        lecture_id=lecture_id,
        watched_seconds=watched_seconds,
        top_k=10,
    )

    if not chunks:
        return {
            "summary": (
                "I could not find enough relevant content "
                "in the lecture you have watched so far."
            )
        }

    context = build_rag_context(chunks)

    summary = generate_summary(
        context=context,
    )

    return {
        "summary": summary,
    }