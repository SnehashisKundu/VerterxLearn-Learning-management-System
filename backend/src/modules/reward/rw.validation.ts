import { z } from "zod";

export const rewardTypeSchema = z.enum([
  "DIGITAL",
  "PHYSICAL",
]);

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

  type: rewardTypeSchema.default("DIGITAL"),

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

  type: rewardTypeSchema.optional(),

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

export const redemptionIdSchema = z.object({
  redemptionId: z.string().uuid("Invalid redemption ID"),
});

export const updateRedemptionStatusSchema = z.object({
  status: z.enum([
    "APPROVED",
    "PROCESSING",
    "SHIPPED",
    "IN_TRANSIT",
    "DELIVERED",
    "CLAIMED",
    "FULFILLED",
    "CANCELLED",
  ]),

  trackingNumber: z
    .string()
    .trim()
    .max(100, "Tracking number cannot exceed 100 characters")
    .optional(),

  carrier: z
    .string()
    .trim()
    .max(100, "Carrier cannot exceed 100 characters")
    .optional(),
});

export const redemptionListQuerySchema = z.object({
  status: z
    .enum([
      "PENDING",
      "APPROVED",
      "PROCESSING",
      "SHIPPED",
      "IN_TRANSIT",
      "DELIVERED",
      "CLAIMED",
      "FULFILLED",
      "CANCELLED",
    ])
    .optional(),

  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),
});

export type CreateRewardInput =
  z.infer<typeof createRewardSchema>;

export type UpdateRewardInput =
  z.infer<typeof updateRewardSchema>;