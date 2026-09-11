from app.rag.retrieval_service import retrieve_relevant_chunks


LECTURE_ID = "af3fdfa5-2e04-425b-a34c-42047272a47a"
QUERY = "What is Artificial Intelligence?"


print("=" * 60)
print("RAG RETRIEVAL EDGE CASE TESTS")
print("=" * 60)


# --------------------------------------------------
# Test 1: Watched-time safety
# --------------------------------------------------

def test_watched_seconds(watched_seconds: int):

    print("\n" + "=" * 60)
    print(f"WATCHED SECONDS: {watched_seconds}")

    results = retrieve_relevant_chunks(
        query=QUERY,
        lecture_id=LECTURE_ID,
        watched_seconds=watched_seconds,
        top_k=5,
    )

    print(f"RESULTS FOUND: {len(results)}")

    for result in results:

        start = result["start_seconds"]
        end = result["end_seconds"]

        print("\n--- RESULT ---")
        print("Chunk Index:", result["chunk_index"])
        print("Similarity:", round(result["similarity"], 4))
        print("Start:", start)
        print("End:", end)

        if start is not None and end is not None:
            assert end <= watched_seconds, (
                f"FUTURE CONTENT LEAKED! "
                f"Chunk {result['chunk_index']} ends at {end}s "
                f"but watched_seconds is only {watched_seconds}s"
            )

    print("WATCHED-TIME SAFETY: PASS")


# --------------------------------------------------
# Test 2: Empty query
# --------------------------------------------------

print("\n" + "=" * 60)
print("EMPTY QUERY TEST")

try:
    retrieve_relevant_chunks(
        query="",
        lecture_id=LECTURE_ID,
        watched_seconds=120,
        top_k=5,
    )

    raise AssertionError(
        "Empty query should have raised ValueError"
    )

except ValueError as exc:
    print("ERROR:", exc)
    print("EMPTY QUERY VALIDATION: PASS")


# --------------------------------------------------
# Test 3: Whitespace-only query
# --------------------------------------------------

print("\n" + "=" * 60)
print("WHITESPACE QUERY TEST")

try:
    retrieve_relevant_chunks(
        query="   ",
        lecture_id=LECTURE_ID,
        watched_seconds=120,
        top_k=5,
    )

    raise AssertionError(
        "Whitespace query should have raised ValueError"
    )

except ValueError as exc:
    print("ERROR:", exc)
    print("WHITESPACE QUERY VALIDATION: PASS")


# --------------------------------------------------
# Test 4: Invalid top_k
# --------------------------------------------------

print("\n" + "=" * 60)
print("INVALID TOP_K TEST")

try:
    retrieve_relevant_chunks(
        query=QUERY,
        lecture_id=LECTURE_ID,
        watched_seconds=120,
        top_k=0,
    )

    raise AssertionError(
        "top_k=0 should have raised ValueError"
    )

except ValueError as exc:
    print("ERROR:", exc)
    print("TOP_K VALIDATION: PASS")


# --------------------------------------------------
# Test 5: Negative watched_seconds
# --------------------------------------------------

print("\n" + "=" * 60)
print("NEGATIVE WATCHED SECONDS TEST")

try:
    retrieve_relevant_chunks(
        query=QUERY,
        lecture_id=LECTURE_ID,
        watched_seconds=-1,
        top_k=5,
    )

    raise AssertionError(
        "Negative watched_seconds should have raised ValueError"
    )

except ValueError as exc:
    print("ERROR:", exc)
    print("NEGATIVE WATCHED-TIME VALIDATION: PASS")


# --------------------------------------------------
# Test 6: Watched exactly at chunk boundary
# --------------------------------------------------

print("\n" + "=" * 60)
print("EXACT CHUNK BOUNDARY TEST")

results = retrieve_relevant_chunks(
    query=QUERY,
    lecture_id=LECTURE_ID,
    watched_seconds=120,
    top_k=5,
)

for result in results:

    start = result["start_seconds"]
    end = result["end_seconds"]

    if start is not None and end is not None:
        assert end <= 120, (
            f"Chunk {result['chunk_index']} crossed "
            "the exact watched boundary"
        )

print("EXACT BOUNDARY SAFETY: PASS")


# --------------------------------------------------
# Test 7: Student watched nothing
# --------------------------------------------------

print("\n" + "=" * 60)
print("ZERO WATCHED TIME TEST")

results = retrieve_relevant_chunks(
    query=QUERY,
    lecture_id=LECTURE_ID,
    watched_seconds=0,
    top_k=5,
)

for result in results:

    start = result["start_seconds"]
    end = result["end_seconds"]

    if start is not None and end is not None:
        assert end <= 0, (
            f"Future content leaked at 0 seconds: "
            f"chunk {result['chunk_index']}"
        )

print("ZERO WATCHED-TIME SAFETY: PASS")


# --------------------------------------------------
# Original watched-time cases
# --------------------------------------------------

test_watched_seconds(60)
test_watched_seconds(120)
test_watched_seconds(500)


print("\n" + "=" * 60)
print("ALL RAG RETRIEVAL EDGE-CASE TESTS PASSED")
print("=" * 60)