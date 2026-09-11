from app.rag.retrieval_service import retrieve_relevant_chunks


queries = [
    "What is Artificial Intelligence?",
    "आर्टिफिशियल इंटेलिजेंस क्या है?",
    "AI kya hota hai?",
]


for query in queries:
    print("\n" + "=" * 60)
    print("QUERY:", query)

    results = retrieve_relevant_chunks(
        query=query,
        lecture_id="af3fdfa5-2e04-425b-a34c-42047272a47a",
        top_k=3,
    )

    print("RESULTS:", len(results))

    for result in results:
        print(
            f"\nSimilarity: {result['similarity']:.4f}"
        )
        print(f"Content: {result['content']}")
        print(
            f"Time: {result['start_seconds']}s - "
            f"{result['end_seconds']}s"
        )