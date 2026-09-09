import { z } from "zod";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ])
);

export const createAssignmentSchema = z.object({
  courseId: z.uuid(),

  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200),

  instructions: z
    .string()
    .trim()
    .optional(),

  rubric: z
    .record(z.string(), jsonValueSchema)
    .optional(),

  dueDate: z
    .string()
    .datetime()
    .optional(),
});

export const submitAssignmentSchema = z.object({
  fileUrl: z
    .string()
    .trim()
    .min(1, "File URL is required"),
});

export const gradeSubmissionSchema = z.object({
  grade: z
    .number()
    .min(0)
    .max(100),

  feedback: z
    .string()
    .trim()
    .optional(),
});

export type CreateAssignmentInput =
  z.infer<typeof createAssignmentSchema>;

export type SubmitAssignmentInput =
  z.infer<typeof submitAssignmentSchema>;

export type GradeSubmissionInput =
  z.infer<typeof gradeSubmissionSchema>;