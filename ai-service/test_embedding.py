from app.services.embedding_service import generate_embedding


text = """
Artificial Intelligence systems learn patterns from data
and use them to make predictions.
"""


embedding = generate_embedding(text)

print("Embedding generated successfully")
print("Dimensions:", len(embedding))
print("First 5 values:", embedding[:5])