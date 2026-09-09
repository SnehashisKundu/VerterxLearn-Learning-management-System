import { z } from "zod";

export const createCertificateSchema = z.object({
  courseId: z
    .string()
    .uuid("Invalid course ID"),

  // Optional:
  // If provided, the selected template will be used.
  // If omitted, the active/default template will be used.
  templateId: z
    .string()
    .uuid("Invalid template ID")
    .optional(),
});

export const certificateIdParamSchema = z.object({
  certificateId: z
    .string()
    .uuid("Invalid certificate ID"),
});

export type CreateCertificateInput =
  z.infer<typeof createCertificateSchema>;