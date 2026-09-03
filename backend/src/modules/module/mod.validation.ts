import { z } from "zod";

export const createModuleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must not exceed 200 characters"),

  orderIndex: z
    .number()
    .int("Order index must be an integer")
    .min(0, "Order index cannot be negative"),
});

export const updateModuleSchema = createModuleSchema.partial();

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;