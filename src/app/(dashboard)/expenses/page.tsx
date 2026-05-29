import { getExpenses, getExpenseStats } from "@/modules/expenses/queries";
import { getCurrentUser } from "@/auth/session";
import { ExpensesPage } from "@/components/expenses/ExpensesPage";

export default async function ExpensesRoutePage() {
  const user = await getCurrentUser();
  const userId = user?.id || "";

  const [expensesResp, stats] = await Promise.all([
    getExpenses(),
    getExpenseStats(),
  ]);

  return (
    <ExpensesPage
      expenses={expensesResp.data}
      stats={stats}
      userId={userId}
    />
  );
}
