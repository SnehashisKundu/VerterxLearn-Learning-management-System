ALTER TABLE "document_chunks"
ALTER COLUMN "embedding" SET DATA TYPE vector(384);

CREATE UNIQUE INDEX "document_chunks_lecture_chunk_unique"
ON "document_chunks"("lecture_id", "chunk_index");
