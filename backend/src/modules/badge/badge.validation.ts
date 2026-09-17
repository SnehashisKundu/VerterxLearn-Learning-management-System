import { z } from "zod";

export const createBadgeSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
});

export const updateBadgeSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
});

export const awardBadgeSchema = z.object({
  moduleId: z.string().uuid(),
});

export type CreateBadgeInput = z.infer<
  typeof createBadgeSchema
>;

export type UpdateBadgeInput = z.infer<
  typeof updateBadgeSchema
>;

export type AwardBadgeInput = z.infer<
  typeof awardBadgeSchema
>;