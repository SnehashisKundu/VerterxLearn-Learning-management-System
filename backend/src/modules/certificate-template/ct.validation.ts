import { z } from "zod";

export const createCertificateTemplateSchema = z.object({
  name: z
    .string()
    .min(2, "Template name must be at least 2 characters")
    .max(150, "Template name must not exceed 150 characters"),

  templateUrl: z
    .string()
    .url("Invalid template URL"),
});

export const certificateTemplateIdParamSchema = z.object({
  templateId: z
    .string()
    .uuid("Invalid template ID"),
});

export type CreateCertificateTemplateInput =
  z.infer<typeof createCertificateTemplateSchema>;