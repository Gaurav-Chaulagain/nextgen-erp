import { z } from "zod";

export const projectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  clientId: z.string().min(1),
  code: z.string().optional(),
  budget: z.number().nonnegative(),
  status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "CANCELLED"]).default("PLANNING"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type Project = z.infer<typeof projectSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
