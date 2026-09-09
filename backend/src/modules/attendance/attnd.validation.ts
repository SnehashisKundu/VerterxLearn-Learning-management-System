import { z } from "zod";

export const createAttendanceSessionSchema = z.object({
  courseId: z
    .string()
    .uuid("Invalid course ID"),
});

export const scanAttendanceSchema = z.object({
  sessionId: z
    .string()
    .uuid("Invalid session ID"),

  qrToken: z
    .string()
    .trim()
    .min(1, "QR token is required"),
});

export type CreateAttendanceSessionInput =
  z.infer<typeof createAttendanceSessionSchema>;

export type ScanAttendanceInput =
  z.infer<typeof scanAttendanceSchema>;