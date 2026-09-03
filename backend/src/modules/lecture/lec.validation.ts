import { z } from "zod";

export const createLectureSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must not exceed 200 characters"),

  videoUrl: z
    .url({ error: "Invalid video URL" })
    .optional(),

  transcript: z
    .string()
    .max(50000, "Transcript must not exceed 50000 characters")
    .optional(),

  durationSeconds: z
    .number()
    .int("Duration must be an integer")
    .min(0, "Duration cannot be negative")
    .optional(),

  orderIndex: z
    .number()
    .int("Order index must be an integer")
    .min(0, "Order index cannot be negative"),

  resourceUrls: z
    .array(z.url({ error: "Invalid resource URL" }))
    .optional(),
});

export const updateLectureSchema = createLectureSchema.partial();

export type CreateLectureInput = z.infer<typeof createLectureSchema>;
export type UpdateLectureInput = z.infer<typeof updateLectureSchema>;