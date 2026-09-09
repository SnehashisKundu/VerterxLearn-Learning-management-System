import { z } from "zod";

export const createLectureResourceSchema = z.object({
  type: z
    .string()
    .trim()
    .min(1, "Resource type cannot be empty")
    .max(30, "Resource type must not exceed 30 characters"),

  fileUrl: z
    .string()
    .trim()
    .url({ error: "File URL must be a valid URL" }),

  title: z
    .string()
    .trim()
    .min(1, "Resource title cannot be empty")
    .max(200, "Resource title must not exceed 200 characters")
    .optional(),
});

export type CreateLectureResourceInput = z.infer<
  typeof createLectureResourceSchema
>;