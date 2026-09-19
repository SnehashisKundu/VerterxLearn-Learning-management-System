import { z } from "zod";

export const studentAnalyticsSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
});

export type StudentAnalyticsInput = z.infer<
  typeof studentAnalyticsSchema
>;