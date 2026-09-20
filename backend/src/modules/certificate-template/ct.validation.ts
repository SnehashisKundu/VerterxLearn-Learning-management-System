import { z } from "zod";

const layoutPositionSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0.05).max(1),
});

export const certificateLayoutSchema = z.object({
  studentName: layoutPositionSchema,
  courseTitle: layoutPositionSchema,
  issuedDate: layoutPositionSchema,
  certificateId: layoutPositionSchema,
});

export const createCertificateTemplateSchema = z.object({
  name: z
    .string()
    .min(2, "Template name must be at least 2 characters")
    .max(150, "Template name must not exceed 150 characters"),

  templateUrl: z
    .string()
    .url("Invalid template URL"),

  layout: certificateLayoutSchema.optional(),
});

export const certificateTemplateIdParamSchema = z.object({
  templateId: z
    .string()
    .uuid("Invalid template ID"),
});

export type CertificateLayout = z.infer<
  typeof certificateLayoutSchema
>;

export type CreateCertificateTemplateInput =
  z.infer<typeof createCertificateTemplateSchema>;