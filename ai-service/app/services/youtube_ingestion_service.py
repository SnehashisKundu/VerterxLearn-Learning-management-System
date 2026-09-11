from uuid import uuid4, UUID

from app.core.database import get_connection
from app.services.embedding_service import generate_embedding
from app.services.youtube_service import fetch_transcript
from app.rag.youtube_chunker import chunk_transcript


def ingest_youtube_lecture(
    url: str,
    course_id: UUID | str,
    lecture_id: UUID | str,
) -> dict:
    if not url.strip():
        raise ValueError("YouTube URL cannot be empty")

    transcript = fetch_transcript(url)

    if not transcript:
        raise RuntimeError("No transcript found")

    chunks = chunk_transcript(
        transcript,
        chunk_duration=120,
    )

    if not chunks:
        raise RuntimeError("No chunks created from transcript")

    # Generate embeddings before modifying the database.
    prepared_chunks = []

    for chunk in chunks:
        embedding = generate_embedding(chunk["content"])

        prepared_chunks.append(
            {
                "id": str(uuid4()),
                "course_id": str(course_id),
                "lecture_id": str(lecture_id),
                "content": chunk["content"],
                "chunk_index": chunk["chunk_index"],
                "embedding": str(embedding),
                "start_seconds": chunk["start_seconds"],
                "end_seconds": chunk["end_seconds"],
            }
        )

    conn = get_connection()

    try:
        with conn.cursor() as cur:
            # Remove previously ingested chunks for this lecture.
            # This makes ingestion idempotent.
            cur.execute(
                """
                DELETE FROM document_chunks
                WHERE lecture_id = %s
                """,
                (str(lecture_id),),
            )

            for chunk in prepared_chunks:
                cur.execute(
                    """
                    INSERT INTO document_chunks (
                        id,
                        course_id,
                        lecture_id,
                        content,
                        chunk_index,
                        embedding,
                        start_seconds,
                        end_seconds
                    )
                    VALUES (
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s::vector,
                        %s,
                        %s
                    )
                    ON CONFLICT (lecture_id, chunk_index)
                    DO UPDATE SET
                        content = EXCLUDED.content,
                        embedding = EXCLUDED.embedding,
                        start_seconds = EXCLUDED.start_seconds,
                        end_seconds = EXCLUDED.end_seconds
                    """,
                    (
                        chunk["id"],
                        chunk["course_id"],
                        chunk["lecture_id"],
                        chunk["content"],
                        chunk["chunk_index"],
                        chunk["embedding"],
                        chunk["start_seconds"],
                        chunk["end_seconds"],
                    ),
                )

        conn.commit()

        return {
            "course_id": str(course_id),
            "lecture_id": str(lecture_id),
            "transcript_segments": len(transcript),
            "chunks_created": len(prepared_chunks),
        }

    except Exception:
        conn.rollback()
        raise

    finally:
        conn.close()