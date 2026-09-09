-- AlterTable
ALTER TABLE "quiz_questions" ADD COLUMN     "difficulty" VARCHAR(20) NOT NULL DEFAULT 'medium';

-- CreateIndex
CREATE INDEX "quiz_questions_difficulty_idx" ON "quiz_questions"("difficulty");
