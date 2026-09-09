from openai import OpenAI

from app.core.config import OPENAI_API_KEY


client = OpenAI(api_key=OPENAI_API_KEY)


EMBEDDING_MODEL = "text-embedding-3-small"


def generate_embedding(text: str) -> list[float]:
    if not text.strip():
        raise ValueError("Cannot generate embedding for empty text")

    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=text,
    )

    embedding = response.data[0].embedding

    if len(embedding) != 1536:
        raise RuntimeError(
            f"Unexpected embedding dimension: {len(embedding)}"
        )

    return embedding