import { z } from "zod";

export const createEnrollmentSchema = z.object({
  courseId: z.uuid("Invalid course ID"),
});

export type CreateEnrollmentInput = z.infer<
  typeof createEnrollmentSchema
>;