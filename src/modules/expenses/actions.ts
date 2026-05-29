"use server";

import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import Decimal from "decimal.js";
import { nextCode } from "@/lib/utils";
import { createExpenseSchema, type CreateExpenseInput } from "./types";

export async function createExpense(data: CreateExpenseInput, userId: string) {
  const parsed = createExpenseSchema.parse(data);
  const db = await getDb();

  const result = await db.$transaction(async (tx: any) => {
    const expenseCode = await nextCode(tx, "expense", "expenseCode", "EXP");
    const amount = new Decimal(parsed.amount);

    const expense = await tx.expense.create({
      data: {
        expenseCode,
        category: parsed.category,
        amount,
        expenseDate: new Date(parsed.expenseDate),
        paymentMethod: parsed.paymentMethod,
        notes: parsed.notes,
        createdBy: userId,
      },
    });

    // Cash Book PAID entry (operating activity vault decrement)
    await tx.cashBookEntry.create({
      data: {
        entryDate: new Date(parsed.expenseDate),
        type: "PAID",
        amount,
        description: `Operating Expense: [${parsed.category}] ${parsed.notes ?? ""}`,
        referenceType: "EXPENSE",
        referenceId: expense.id,
        paymentMethod: parsed.paymentMethod,
        createdBy: userId,
      },
    });

    await tx.auditLog.create({
      data: {
        userId,
        action: "CREATE",
        module: "EXPENSE",
        recordId: expense.id,
        newValues: { expenseCode, category: parsed.category, amount: amount.toString() },
      },
    });

    return expense;
  });

  revalidatePath("/expenses");
  return result;
}

export async function deleteExpense(id: string, userId: string) {
  const db = await getDb();

  const result = await db.$transaction(async (tx: any) => {
    const expense = await tx.expense.findUnique({ where: { id } });
    if (!expense) throw new Error("Expense not found");

    // Remove matching CashBookEntries
    await tx.cashBookEntry.deleteMany({
      where: { referenceType: "EXPENSE", referenceId: id },
    });

    await tx.expense.delete({ where: { id } });

    await tx.auditLog.create({
      data: {
        userId,
        action: "DELETE",
        module: "EXPENSE",
        recordId: id,
        oldValues: expense as any,
      },
    });

    return expense;
  });

  revalidatePath("/expenses");
  return result;
}

export async function updateExpense(id: string, data: CreateExpenseInput, userId: string) {
  const parsed = createExpenseSchema.parse(data);
  const db = await getDb();

  const result = await db.$transaction(async (tx: any) => {
    const existing = await tx.expense.findUnique({ where: { id } });
    if (!existing) throw new Error("Expense not found");

    const amount = new Decimal(parsed.amount);

    // Update the expense record
    const updated = await tx.expense.update({
      where: { id },
      data: {
        category: parsed.category,
        amount,
        expenseDate: new Date(parsed.expenseDate),
        paymentMethod: parsed.paymentMethod,
        notes: parsed.notes,
      },
    });

    // Remove old cash book entry and create a new one
    await tx.cashBookEntry.deleteMany({
      where: { referenceType: "EXPENSE", referenceId: id },
    });

    await tx.cashBookEntry.create({
      data: {
        entryDate: new Date(parsed.expenseDate),
        type: "PAID",
        amount,
        description: `Operating Expense: [${parsed.category}] ${parsed.notes ?? ""}`,
        referenceType: "EXPENSE",
        referenceId: id,
        paymentMethod: parsed.paymentMethod,
        createdBy: userId,
      },
    });

    await tx.auditLog.create({
      data: {
        userId,
        action: "UPDATE",
        module: "EXPENSE",
        recordId: id,
        oldValues: existing as any,
        newValues: { category: parsed.category, amount: amount.toString() },
      },
    });

    return updated;
  });

  revalidatePath("/expenses");
  return result;
}
