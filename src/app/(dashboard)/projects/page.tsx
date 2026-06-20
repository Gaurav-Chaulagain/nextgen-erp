import { ProjectsClient } from "@/components/projects/ProjectsClient";
import { getProjectStats, getProjectProfitability, getProjectLookups } from "@/modules/projects/queries";
import { PageHeader } from "@/components/layout/PageHeader";

type ProjectsPageProps = {
  searchParams?: Promise<{ tab?: string; page?: string; search?: string }>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const tab = params?.tab ?? "active";
  const search = params?.search ?? "";
  const page = parseInt(params?.page ?? "1") || 1;

  // Isolate query parameter bindings based on the active tab
  const activePage = tab === "active" ? page : 1;
  const activeSearch = tab === "active" ? search : "";

  const allPage = tab === "all" ? page : 1;
  const allSearch = tab === "all" ? search : "";

  const pnlPage = tab === "pnl" ? page : 1;
  const pnlSearch = tab === "pnl" ? search : "";

  const [stats, activeResp, allResp, pnlResp, lookups] = await Promise.all([
    getProjectStats(),
    getProjectProfitability({ status: "ACTIVE", page: activePage, search: activeSearch, pageSize: 25 }),
    getProjectProfitability({ page: allPage, search: allSearch, pageSize: 25 }),
    getProjectProfitability({ page: pnlPage, search: pnlSearch, pageSize: 25 }),
    getProjectLookups(),
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b pb-4 dark:border-zinc-800">
        <PageHeader
          title="Project Site Management"
          description="Manage contract budgets, issue supplies, record billings, and track margins in real-time."
        />
      </div>
      <ProjectsClient
        stats={stats}
        activeProjects={activeResp.data}
        activePagination={activeResp.pagination}
        allProjects={allResp.data}
        allPagination={allResp.pagination}
        pnlProjects={pnlResp.data}
        pnlPagination={pnlResp.pagination}
        currentTab={tab}
        searchQuery={search}
        lookups={lookups}
      />
    </div>
  );
}
