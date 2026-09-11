import { z } from "zod";

export const tutorAskSchema = z.object({
  lecture_id: z.string().trim().min(1, "Lecture ID is required"),
  question: z.string().trim().min(1, "Question is required"),
  watched_seconds: z
    .number()
    .int()
    .min(0, "watched_seconds cannot be negative"),
});

export const tutorQuizSchema = z.object({
  lecture_id: z.string().trim().min(1, "Lecture ID is required"),
  watched_seconds: z
    .number()
    .int()
    .min(0, "watched_seconds cannot be negative"),
  question_count: z
    .number()
    .int()
    .min(1)
    .max(10)
    .default(5),
  language: z.enum([
    "English",
    "Hindi",
    "Bengali",
    "Tamil",
    "Telugu",
    "Marathi",
  ]).default("English"),
});

export type TutorAskInput = z.infer<typeof tutorAskSchema>;
export type TutorQuizInput = z.infer<typeof tutorQuizSchema>;