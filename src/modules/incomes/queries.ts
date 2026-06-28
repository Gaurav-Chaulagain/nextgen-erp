import { getDb } from "@/lib/db";
import { serializeForClient } from "@/lib/utils";
import Decimal from "decimal.js";

type GetIncomesOptions = {
  page?: number;
  pageSize?: number;
  search?: string | null;
  month?: string | null;
};

export async function getIncomes(opts: GetIncomesOptions = {}) {
  const { page = 1, pageSize = 25, search = null, month = null } = opts;
  const db = (await getDb()) as any;

  const where: any = {};
  if (search) {
    where.OR = [
      { incomeCode: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
      { notes: { contains: search, mode: "insensitive" } },
    ];
  }

  if (month && month !== "all") {
    const [year, m] = month.split("-");
    const startDate = new Date(Number(year), Number(m) - 1, 1);
    const endDate = new Date(Number(year), Number(m), 0, 23, 59, 59, 999);
    where.incomeDate = {
      gte: startDate,
      lte: endDate,
    };
  }

  // Get distinct months for the dropdown (high performance query)
  const allIncomeDates = await db.income.findMany({
    select: { incomeDate: true },
    orderBy: { incomeDate: "desc" },
  });

  const getMonthKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  };
  const availableMonths = Array.from(
    new Set(allIncomeDates.map((e: any) => getMonthKey(e.incomeDate)))
  );

  const [incomes, total] = await Promise.all([
    db.income.findMany({
      where,
      include: { creator: { select: { name: true } } },
      orderBy: { incomeDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.income.count({ where }),
  ]);

  return serializeForClient({
    data: incomes,
    availableMonths,
    pagination: { page, pageSize, total },
  });
}

export async function getIncomeStats() {
  const db = (await getDb()) as any;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const incomes = await db.income.findMany({
    where: { incomeDate: { gte: monthStart } },
  });

  const totalThisMonth = incomes.reduce((sum: Decimal, e: any) => sum.plus(e.amount), new Decimal(0));

  const categories = [
    "Commission",
    "Interest Received",
    "Rent Received",
    "Miscellaneous Incomes"
  ];
  const breakdown = categories.map((cat) => {
    const val = incomes
      .filter((e: any) => e.category === cat)
      .reduce((sum: Decimal, e: any) => sum.plus(e.amount), new Decimal(0));
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
