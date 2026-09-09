import { z } from "zod";

export const createIdCardSchema = z.object({}).strict();

export const scanQrSchema = z.object({
  qrToken: z
    .string()
    .trim()
    .min(1, "QR token is required"),
});

export type ScanQrInput =
  z.infer<typeof scanQrSchema>;