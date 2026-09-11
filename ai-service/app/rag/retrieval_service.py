from uuid import UUID

from app.core.database import get_connection
from app.services.embedding_service import generate_embedding


def retrieve_relevant_chunks(
    query: str,
    course_id: UUID | str | None = None,
    lecture_id: UUID | str | None = None,
    watched_seconds: int | None = None,
    top_k: int = 5,
) -> list[dict]:
    if not query.strip():
        raise ValueError("Query cannot be empty")

    if top_k < 1:
        raise ValueError("top_k must be at least 1")

    if watched_seconds is not None and watched_seconds < 0:
        raise ValueError("watched_seconds cannot be negative")

    # Generate embedding for the student's query.
    query_embedding = generate_embedding(query)
    vector_value = str(query_embedding)

    conditions = [
        "embedding IS NOT NULL",
    ]

    filter_params: list = []

    # Optional course filter.
    if course_id is not None:
        conditions.append("course_id = %s")
        filter_params.append(str(course_id))

    # Optional lecture filter.
    if lecture_id is not None:
        conditions.append("lecture_id = %s")
        filter_params.append(str(lecture_id))

    # IMPORTANT:
    # Only retrieve chunks that the student has completely watched.
    #
    # Example:
    # watched_seconds = 200
    #
    # Chunk 0: 0-120     -> allowed
    # Chunk 1: 119-241   -> NOT allowed
    # Chunk 2: 238-360   -> NOT allowed
    #
    # This prevents future/partially watched lecture content
    # from being sent to the AI tutor.
    if watched_seconds is not None:
        conditions.append(
            """
            (
                (
                    start_seconds IS NULL
                    AND end_seconds IS NULL
                )
                OR
                (
                    start_seconds IS NOT NULL
                    AND end_seconds IS NOT NULL
                    AND end_seconds <= %s
                )
            )
            """
        )

        filter_params.append(watched_seconds)

    where_clause = " AND ".join(conditions)

    sql = f"""
        SELECT
            id,
            course_id,
            lecture_id,
            content,
            chunk_index,
            start_seconds,
            end_seconds,
            1 - (embedding <=> %s::vector) AS similarity
        FROM document_chunks
        WHERE {where_clause}
        ORDER BY embedding <=> %s::vector
        LIMIT %s
    """

    params = [
        vector_value,
        *filter_params,
        vector_value,
        top_k,
    ]

    conn = get_connection()

    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()

        return [
            {
                "id": row[0],
                "course_id": row[1],
                "lecture_id": row[2],
                "content": row[3],
                "chunk_index": row[4],
                "start_seconds": row[5],
                "end_seconds": row[6],
                "similarity": float(row[7]),
            }
            for row in rows
        ]

    finally:
        conn.close()