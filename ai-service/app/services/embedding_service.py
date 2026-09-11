from sentence_transformers import SentenceTransformer


MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

model = SentenceTransformer(MODEL_NAME)


def generate_embedding(text: str) -> list[float]:
    if not text.strip():
        raise ValueError("Cannot generate embedding for empty text")

    embedding = model.encode(
        text,
        normalize_embeddings=True,
    )

    result = embedding.tolist()

    if len(result) != 384:
        raise RuntimeError(
            f"Unexpected embedding dimension: {len(result)}"
        )

    return result