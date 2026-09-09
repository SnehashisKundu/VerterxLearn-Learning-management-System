import { z } from "zod";

export const createAnswerSchema = z.object({
  questionId: z.uuid(),

  selectedOptionIds: z
    .array(z.uuid())
    .default([]),

  textAnswer: z
    .string()
    .trim()
    .nullable()
    .optional(),
});

export type CreateAnswerInput = z.infer<typeof createAnswerSchema>;