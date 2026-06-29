import { getExpenses, getExpenseStats } from "@/modules/expenses/queries";
import { getCurrentUser } from "@/auth/session";
import { ExpensesPage } from "@/components/expenses/ExpensesPage";

type ExpensesPageProps = {
  searchParams?: Promise<{ page?: string; search?: string; month?: string }>;
};

export default async function ExpensesRoutePage({ searchParams }: ExpensesPageProps) {
  const user = await getCurrentUser();
  const userId = user?.id || "";
  const params = await searchParams;

  const page = parseInt(params?.page ?? "1") || 1;
  const search = params?.search ?? "";
  const month = params?.month ?? null;
  const pageSize = 25;

  const [expensesResp, stats] = await Promise.all([
    getExpenses({ page, pageSize, search, month }),
    getExpenseStats(),
  ]);

  return (
    <ExpensesPage
      expenses={expensesResp.data}
      availableMonths={expensesResp.availableMonths}
      pagination={expensesResp.pagination}
      searchQuery={search}
      selectedMonthFilter={month}
      stats={stats}
      userId={userId}
      role={user?.role ?? "VIEWER"}
    />
  );
}
