import { z } from "zod";

export const createLectureProgressSchema = z.object({
  watchedSeconds: z
    .number()
    .int("Watched seconds must be an integer")
    .min(0, "Watched seconds cannot be negative")
    .default(0),

  completed: z
    .boolean()
    .default(false),
});

export const updateLectureProgressSchema = z.object({
  watchedSeconds: z
    .number()
    .int("Watched seconds must be an integer")
    .min(0, "Watched seconds cannot be negative")
    .optional(),

  completed: z
    .boolean()
    .optional(),
});

export type CreateLectureProgressInput = z.infer<
  typeof createLectureProgressSchema
>;

export type UpdateLectureProgressInput = z.infer<
  typeof updateLectureProgressSchema
>;