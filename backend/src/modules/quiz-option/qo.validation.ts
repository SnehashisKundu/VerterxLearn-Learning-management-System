import { z } from "zod";

export const createOptionSchema = z.object({
  optionText: z
    .string()
    .trim()
    .min(1, "Option text cannot be empty"),

  isCorrect: z.boolean().optional().default(false),
});

export const updateOptionSchema = createOptionSchema.partial();

export type CreateOptionInput = z.infer<typeof createOptionSchema>;
export type UpdateOptionInput = z.infer<typeof updateOptionSchema>;