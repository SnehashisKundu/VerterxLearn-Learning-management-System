import { z } from "zod";

export const createRewardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Reward name must be at least 2 characters")
    .max(150, "Reward name cannot exceed 150 characters"),

  description: z
    .string()
    .trim()
    .optional(),

  imageUrl: z
    .string()
    .url("Invalid image URL")
    .optional(),

  points: z
    .number()
    .int("Reward points must be an integer")
    .min(1, "Reward points must be greater than 0"),

  isActive: z
    .boolean()
    .optional(),
});

export const updateRewardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Reward name must be at least 2 characters")
    .max(150, "Reward name cannot exceed 150 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .optional(),

  imageUrl: z
    .string()
    .url("Invalid image URL")
    .optional(),

  points: z
    .number()
    .int("Reward points must be an integer")
    .min(1, "Reward points must be greater than 0")
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

export const rewardIdSchema = z.object({
  rewardId: z.string().uuid("Invalid reward ID"),
});

export type CreateRewardInput = z.infer<
  typeof createRewardSchema
>;

export type UpdateRewardInput = z.infer<
  typeof updateRewardSchema
>;