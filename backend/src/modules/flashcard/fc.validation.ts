import { z } from "zod";

export const createFlashcardSchema = z.object({
  front: z
    .string()
    .trim()
    .min(1, "Front is required")
    .max(1000, "Front must not exceed 1000 characters"),

  back: z
    .string()
    .trim()
    .min(1, "Back is required")
    .max(3000, "Back must not exceed 3000 characters"),
});

export const updateFlashcardSchema =
  createFlashcardSchema.partial();

export type CreateFlashcardInput =
  z.infer<typeof createFlashcardSchema>;

export type UpdateFlashcardInput =
  z.infer<typeof updateFlashcardSchema>;