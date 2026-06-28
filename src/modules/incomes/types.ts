import { z } from "zod";

export const incomeCategorySchema = z.enum([
  "Commission",
  "Interest Received",
  "Rent Received",
  "Miscellaneous Incomes"
]);

export const createIncomeSchema = z.object({
  category: incomeCategorySchema,
  amount: z.union([z.string(), z.number()]),
  incomeDate: z.union([z.string(), z.date()]),
  paymentMethod: z.enum(["CASH", "BANK", "CHEQUE", "ESEWA", "KHALTI"]),
  notes: z.string().optional(),
});

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
