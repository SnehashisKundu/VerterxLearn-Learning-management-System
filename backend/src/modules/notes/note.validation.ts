import { z } from "zod";

export const createNoteSchema = z.object({
  timestampSeconds: z
    .number()
    .int("Timestamp must be an integer")
    .min(0, "Timestamp cannot be negative")
    .optional(),

  content: z
    .string()
    .trim()
    .min(1, "Note content cannot be empty")
    .max(10000, "Note content must not exceed 10000 characters"),
});

export const updateNoteSchema = createNoteSchema.partial();

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;