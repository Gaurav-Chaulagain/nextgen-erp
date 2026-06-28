"use server";

import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import Decimal from "decimal.js";
import { nextCode, serializeForClient } from "@/lib/utils";
import { getCurrentUser } from "@/auth/session";
import { createIncomeSchema, type CreateIncomeInput } from "./types";
import { checkServerPermission } from "@/auth/permissions.server";

async function resolveActiveUserId(db: any, userId?: string): Promise<string> {
  const resolved = userId || (await getCurrentUser())?.id;
  if (!resolved) {
    const fallbackUser = await db.user.findFirst({
      where: { isActive: true },
      select: { id: true }
    });
    if (fallbackUser) return fallbackUser.id;
    throw new Error("No active user found in the database. Please seed the database first.");
  }

  const userExists = await db.user.findUnique({
    where: { id: resolved },
    select: { id: true }
  });

  if (userExists) {
    return resolved;
  }

  const fallbackUser = await db.user.findFirst({
    where: { isActive: true },
    select: { id: true }
  });

  if (fallbackUser) {
    return fallbackUser.id;
  }

  throw new Error("No active user found in the database. Please seed the database first.");
}

export async function createIncome(data: CreateIncomeInput, userId: string) {
  await checkServerPermission("incomes", "create");
  const parsed = createIncomeSchema.parse(data);
  const db = (await getDb()) as any;
  const activeUserId = await resolveActiveUserId(db, userId);

  const result = await db.$transaction(async (tx: any) => {
    const incomeCode = await nextCode(tx, "income", "incomeCode", "INC");
    const amount = new Decimal(parsed.amount);

    const income = await tx.income.create({
      data: {
        incomeCode,
        category: parsed.category,
        amount,
        incomeDate: new Date(parsed.incomeDate),
        paymentMethod: parsed.paymentMethod,
        notes: parsed.notes,
        createdBy: activeUserId,
      },
    });

    // Cash Book RECEIVED entry (operating activity vault increment)
    await tx.cashBookEntry.create({
      data: {
        entryDate: new Date(parsed.incomeDate),
        type: "RECEIVED",
        amount,
        description: `Operating Income: [${parsed.category}] ${parsed.notes ?? ""}`,
        referenceType: "INCOME",
        referenceId: income.id,
        paymentMethod: parsed.paymentMethod,
        createdBy: activeUserId,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: activeUserId,
        action: "CREATE",
        module: "INCOME",
        recordId: income.id,
        newValues: { incomeCode, category: parsed.category, amount: amount.toString() },
      },
    });

    return income;
  });

  revalidatePath("/incomes");
  return serializeForClient(result);
}

export async function deleteIncome(id: string, userId: string) {
  await checkServerPermission("incomes", "delete");
  const db = (await getDb()) as any;
  const activeUserId = await resolveActiveUserId(db, userId);

  const result = await db.$transaction(async (tx: any) => {
    const income = await tx.income.findUnique({ where: { id } });
    if (!income) throw new Error("Income not found");

    // Remove matching CashBookEntries
    await tx.cashBookEntry.deleteMany({
      where: { referenceType: "INCOME", referenceId: id },
    });

    await tx.income.delete({ where: { id } });

    await tx.auditLog.create({
      data: {
        userId: activeUserId,
        action: "DELETE",
        module: "INCOME",
        recordId: id,
        oldValues: income as any,
      },
    });

    return income;
  });

  revalidatePath("/incomes");
  return serializeForClient(result);
}

export async function updateIncome(id: string, data: CreateIncomeInput, userId: string) {
  await checkServerPermission("incomes", "edit");
  const parsed = createIncomeSchema.parse(data);
  const db = (await getDb()) as any;
  const activeUserId = await resolveActiveUserId(db, userId);

  const result = await db.$transaction(async (tx: any) => {
    const existing = await tx.income.findUnique({ where: { id } });
    if (!existing) throw new Error("Income not found");

    const amount = new Decimal(parsed.amount);

    // Update the income record
    const updated = await tx.income.update({
      where: { id },
      data: {
        category: parsed.category,
        amount,
        incomeDate: new Date(parsed.incomeDate),
        paymentMethod: parsed.paymentMethod,
        notes: parsed.notes,
      },
    });

    // Remove old cash book entry and create a new one
    await tx.cashBookEntry.deleteMany({
      where: { referenceType: "INCOME", referenceId: id },
    });

    await tx.cashBookEntry.create({
      data: {
        entryDate: new Date(parsed.incomeDate),
        type: "RECEIVED",
        amount,
        description: `Operating Income: [${parsed.category}] ${parsed.notes ?? ""}`,
        referenceType: "INCOME",
        referenceId: id,
        paymentMethod: parsed.paymentMethod,
        createdBy: activeUserId,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: activeUserId,
        action: "UPDATE",
        module: "INCOME",
        recordId: id,
        oldValues: existing as any,
        newValues: { category: parsed.category, amount: amount.toString() },
      },
    });

    return updated;
  });

  revalidatePath("/incomes");
  return serializeForClient(result);
}
