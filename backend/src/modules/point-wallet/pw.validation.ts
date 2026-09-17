import { z } from "zod";

export const userIdParamSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});

export const earnPointsSchema = z.object({
  amount: z
    .number()
    .int("Points must be an integer")
    .positive("Points must be greater than 0"),
  reason: z
    .string()
    .trim()
    .min(1, "Reason is required")
    .max(255, "Reason cannot exceed 255 characters"),
  referenceId: z.string().uuid("Invalid reference ID").optional(),
});

export const adjustPointsSchema = z.object({
  amount: z
    .number()
    .int("Points must be an integer")
    .refine((value) => value !== 0, {
      message: "Adjustment amount cannot be zero",
    }),
  reason: z
    .string()
    .trim()
    .min(1, "Reason is required")
    .max(255, "Reason cannot exceed 255 characters"),
  referenceId: z.string().uuid("Invalid reference ID").optional(),
});