import { z } from "zod";

export const createAttemptSchema = z.object({});

export type CreateAttemptInput = z.infer<typeof createAttemptSchema>;