import { getIncomes, getIncomeStats } from "@/modules/incomes/queries";
import { getCurrentUser } from "@/auth/session";
import { IncomesPage } from "@/components/incomes/IncomesPage";

type IncomesPageProps = {
  searchParams?: Promise<{ page?: string; search?: string; month?: string }>;
};

export default async function IncomesRoutePage({ searchParams }: IncomesPageProps) {
  const user = await getCurrentUser();
  const userId = user?.id || "";
  const params = await searchParams;

  const page = parseInt(params?.page ?? "1") || 1;
  const search = params?.search ?? "";
  const month = params?.month ?? null;
  const pageSize = 25;

  const [incomesResp, stats] = await Promise.all([
    getIncomes({ page, pageSize, search, month }),
    getIncomeStats(),
  ]);

  return (
    <IncomesPage
      incomes={incomesResp.data}
      availableMonths={incomesResp.availableMonths}
      pagination={incomesResp.pagination}
      searchQuery={search}
      selectedMonthFilter={month}
      stats={stats}
      userId={userId}
    />
  );
}
