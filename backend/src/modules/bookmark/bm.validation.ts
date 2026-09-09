import { z } from "zod";

export const createBookmarkSchema = z.object({
  timestampSeconds: z
    .number()
    .int("Timestamp must be an integer")
    .min(0, "Timestamp cannot be negative"),
});

export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;