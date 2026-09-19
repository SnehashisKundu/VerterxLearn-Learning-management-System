import { z } from "zod";

export const activitySchema = z.object({
  activityDate: z.coerce.date().optional(),
});