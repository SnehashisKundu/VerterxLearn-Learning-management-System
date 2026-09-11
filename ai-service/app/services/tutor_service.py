from app.rag.context_builder import build_rag_context
from app.rag.retrieval_service import retrieve_relevant_chunks
from app.services.gemini_service import generate_answer


def ask_tutor(
    lecture_id: str,
    question: str,
    watched_seconds: int,
) -> dict:
    chunks = retrieve_relevant_chunks(
        query=question,
        lecture_id=lecture_id,
        watched_seconds=watched_seconds,
        top_k=5,
    )

    if not chunks:
        return {
            "answer": (
                "I could not find enough relevant content "
                "in the lecture you have watched so far."
            ),
            "sources": [],
        }

    context = build_rag_context(chunks)

    answer = generate_answer(
        question=question,
        context=context,
    )

    sources = [
        {
            "chunk_id": str(chunk["id"]),
            "start_seconds": chunk["start_seconds"],
            "end_seconds": chunk["end_seconds"],
            "similarity": chunk["similarity"],
        }
        for chunk in chunks
    ]

    return {
        "answer": answer,
        "sources": sources,
    }