import { z } from "zod";

export const createQuestionSchema = z.object({
  questionText: z
    .string()
    .trim()
    .min(1, "Question text cannot be empty"),

  questionType: z.enum(
    ["single_choice", "multiple_choice", "true_false", "text"],
    {
      message:
        "Question type must be single_choice, multiple_choice, true_false, or text",
    }
  ),

  difficulty: z
    .enum(["easy", "medium", "hard"], {
      message: "Difficulty must be easy, medium, or hard",
    })
    .optional()
    .default("medium"),

  orderIndex: z
    .number()
    .int("Order index must be an integer")
    .min(0, "Order index cannot be negative"),
});

export const updateQuestionSchema = createQuestionSchema.partial();

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;