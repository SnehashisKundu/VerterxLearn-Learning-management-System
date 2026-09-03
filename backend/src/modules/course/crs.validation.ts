import { z } from "zod";

export const createCourseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must not exceed 200 characters"),

  description: z
    .string()
    .trim()
    .max(5000, "Description must not exceed 5000 characters")
    .optional(),

  category: z
    .string()
    .trim()
    .max(80, "Category must not exceed 80 characters")
    .optional(),

  difficulty: z
    .string()
    .trim()
    .max(20, "Difficulty must not exceed 20 characters")
    .optional(),

  thumbnailUrl: z
    .string()
    .url("Invalid thumbnail URL")
    .optional(),

  price: z
    .number()
    .min(0, "Price cannot be negative")
    .max(99999999.99, "Price is too high")
    .optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;