from app.services.youtube_service import fetch_transcript
from app.rag.youtube_chunker import chunk_transcript


URL = "https://youtu.be/q3AuP01daL4?si=5wKJfjx8jxiAoacN"

transcript = fetch_transcript(URL)

chunks = chunk_transcript(
    transcript,
    chunk_duration=120,
)

print("TRANSCRIPT SEGMENTS:", len(transcript))
print("CHUNKS CREATED:", len(chunks))

for chunk in chunks[:5]:
    print("\n" + "=" * 60)
    print("CHUNK:", chunk["chunk_index"])
    print(
        "TIME:",
        chunk["start_seconds"],
        "→",
        chunk["end_seconds"],
    )
    print("TEXT:")
    print(chunk["content"][:500])