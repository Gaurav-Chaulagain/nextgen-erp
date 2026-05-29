import { getDb } from "@/lib/db";
import { serializeForClient } from "@/lib/utils";
import Decimal from "decimal.js";

export async function getExpenses() {
  const db = await getDb();

  const expenses = await db.expense.findMany({
    include: { creator: { select: { name: true } } },
    orderBy: { expenseDate: "desc" },
  });

  return serializeForClient({
    data: expenses,
  });
}

export async function getExpenseStats() {
  const db = await getDb();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const expenses = await db.expense.findMany({
    where: { expenseDate: { gte: monthStart } },
  });

  const totalThisMonth = expenses.reduce((sum, e) => sum.plus(e.amount), new Decimal(0));

  const categories = ["Shop Rent", "Transport Cost", "Staff Salary", "Miscellaneous"];
  const breakdown = categories.map((cat) => {
    const val = expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum.plus(e.amount), new Decimal(0));
    return {
      category: cat,
      amount: val.toString(),
    };
  });

  return serializeForClient({
    totalThisMonth: totalThisMonth.toString(),
    breakdown,
  });
}
