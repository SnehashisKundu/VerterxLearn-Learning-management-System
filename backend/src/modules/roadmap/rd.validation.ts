import { z } from "zod";

export const roadmapParamsSchema = z.object({
  courseId: z
    .string()
    .trim()
    .min(1, "Course ID is required"),
});

export type RoadmapParamsInput =
  z.infer<typeof roadmapParamsSchema>;