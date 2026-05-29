import { z } from "zod";

export const expenseCategorySchema = z.enum([
  "Shop Rent",
  "Transport Cost",
  "Staff Salary",
  "Miscellaneous"
]);

export const createExpenseSchema = z.object({
  category: expenseCategorySchema,
  amount: z.union([z.string(), z.number()]),
  expenseDate: z.union([z.string(), z.date()]),
  paymentMethod: z.enum(["CASH", "BANK", "CHEQUE", "ESEWA", "KHALTI"]),
  notes: z.string().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
