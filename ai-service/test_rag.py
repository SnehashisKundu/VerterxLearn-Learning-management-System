from app.rag.context_builder import build_rag_context
from app.rag.retrieval_service import retrieve_relevant_chunks
from app.services.gemini_service import generate_answer


QUESTION = "What is Artificial Intelligence?"

LECTURE_ID = "af3fdfa5-2e04-425b-a34c-42047272a47a"

WATCHED_SECONDS = 120


chunks = retrieve_relevant_chunks(
    query=QUESTION,
    lecture_id=LECTURE_ID,
    watched_seconds=WATCHED_SECONDS,
    top_k=5,
)


print(f"RETRIEVED CHUNKS: {len(chunks)}")


context = build_rag_context(chunks)


print("\n--- RAG CONTEXT ---")
print(context)


answer = generate_answer(
    question=QUESTION,
    context=context,
)


print("\n--- GEMINI ANSWER ---")
print(answer)