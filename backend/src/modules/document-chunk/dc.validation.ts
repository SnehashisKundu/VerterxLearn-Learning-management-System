import { z } from "zod";

export const createDocumentChunkSchema = z.object({
  lectureId: z.string().uuid("Lecture ID must be a valid UUID").optional(),

  content: z
    .string()
    .trim()
    .min(1, "Chunk content cannot be empty"),

  chunkIndex: z
    .number()
    .int("Chunk index must be an integer")
    .min(0, "Chunk index cannot be negative"),
});

export const updateDocumentChunkSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Chunk content cannot be empty")
    .optional(),

  chunkIndex: z
    .number()
    .int("Chunk index must be an integer")
    .min(0, "Chunk index cannot be negative")
    .optional(),
});

export type CreateDocumentChunkInput = z.infer<
  typeof createDocumentChunkSchema
>;

export type UpdateDocumentChunkInput = z.infer<
  typeof updateDocumentChunkSchema
>;