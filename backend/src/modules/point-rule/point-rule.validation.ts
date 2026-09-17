import { z } from "zod";

export const createPointRuleSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "Key is required")
    .max(100, "Key must not exceed 100 characters")
    .regex(
      /^[A-Z0-9_]+$/,
      "Key must contain only uppercase letters, numbers and underscores",
    ),

  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(150, "Name must not exceed 150 characters"),

  points: z
    .number()
    .int("Points must be an integer")
    .min(1, "Points cannot be negative"),

  description: z
    .string()
    .trim()
    .optional(),
});

export const updatePointRuleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name cannot be empty")
    .max(150, "Name must not exceed 150 characters")
    .optional(),

  points: z
    .number()
    .int("Points must be an integer")
    .min(1, "Points cannot be negative")
    .optional(),

  description: z
    .string()
    .trim()
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

export const pointRuleKeyParamSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "Point rule key is required")
    .max(100, "Invalid point rule key"),
});