-- AlterTable
ALTER TABLE "document_chunks" ADD COLUMN     "embedding" vector(1536),
ADD COLUMN     "end_seconds" INTEGER,
ADD COLUMN     "start_seconds" INTEGER;

-- CreateIndex
CREATE INDEX "document_chunks_lecture_id_start_seconds_end_seconds_idx" ON "document_chunks"("lecture_id", "start_seconds", "end_seconds");
