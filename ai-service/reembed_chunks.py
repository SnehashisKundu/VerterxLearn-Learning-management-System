from app.core.database import get_connection
from app.services.embedding_service import generate_embedding


def main():
    conn = get_connection()

    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, content
                FROM document_chunks
                WHERE content IS NOT NULL
                """
            )

            chunks = cur.fetchall()

        print(f"CHUNKS FOUND: {len(chunks)}")

        updated = 0

        with conn.cursor() as cur:
            for chunk_id, content in chunks:
                embedding = generate_embedding(content)

                cur.execute(
                    """
                    UPDATE document_chunks
                    SET embedding = %s::vector
                    WHERE id = %s
                    """,
                    (str(embedding), chunk_id),
                )

                updated += 1
                print(f"UPDATED: {updated}/{len(chunks)}")

            conn.commit()

        print(f"\nRE-EMBEDDING COMPLETE: {updated} chunks")

    finally:
        conn.close()


if __name__ == "__main__":
    main()