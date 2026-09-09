import { z } from "zod";

export const createQuizSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Quiz title cannot be empty")
    .max(200, "Quiz title must not exceed 200 characters")
    .optional(),

  isAiGenerated: z.boolean().optional().default(false),
});

export const updateQuizSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Quiz title cannot be empty")
    .max(200, "Quiz title must not exceed 200 characters")
    .optional(),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;