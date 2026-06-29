import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CreateInvoiceForm } from "@/components/sales/CreateInvoiceForm";
import { InvoiceTable } from "@/components/sales/InvoiceTable";
import { OutstandingDuesTable } from "@/components/sales/OutstandingDuesTable";
import { SalesStats } from "@/components/sales/SalesStats";
import { CustomerListTable } from "@/components/sales/CustomerListTable";
import { AddCustomerModal } from "@/components/sales/AddCustomerModal";
import { formatAmountOnly } from "@/lib/utils";
import { SalesReturnsTab } from "@/components/sales/SalesReturnsTab";
import {
  getCustomers,
  getInvoiceFormLookups,
  getOutstandingDues,
  getRevenueByChannel,
  getSalesInvoices,
  getSalesReturns,
  getSalesStats,
} from "@/modules/sales/queries";
import { getCurrentUser } from "@/auth/session";
import { hasPermission } from "@/auth/permissions";
import { Role } from "@/lib/constants";
import { redirect } from "next/navigation";

type SalesPageProps = {
  searchParams?: Promise<{ tab?: string; page?: string; search?: string }>;
};

export default async function SalesPage({ searchParams }: SalesPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!hasPermission(user.role as Role, "sales", "view")) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const tab = params?.tab ?? "invoices";
  const search = params?.search ?? "";
  const page = parseInt(params?.page ?? "1") || 1;
  const now = new Date();

  // Isolate query parameter bindings based on the active tab
  const invoicesPage = tab === "invoices" ? page : 1;
  const invoicesSearch = tab === "invoices" ? search : "";

  const customersPage = tab === "customers" ? page : 1;
  const customersSearch = tab === "customers" ? search : "";

  const outstandingPage = tab === "outstanding" ? page : 1;
  const outstandingSearch = tab === "outstanding" ? search : "";

  const returnsPage = tab === "returns" ? page : 1;
  const returnsSearch = tab === "returns" ? search : "";

  const [invoicesResp, stats, customersResp, outstandingResp, returnsResp, lookups, revenueByChannel] = await Promise.all([
    getSalesInvoices({ page: invoicesPage, search: invoicesSearch, pageSize: 25 }),
    getSalesStats(),
    getCustomers(customersSearch, undefined, customersPage, 25),
    getOutstandingDues({ search: outstandingSearch, page: outstandingPage, pageSize: 25 }),
    getSalesReturns({ search: returnsSearch, page: returnsPage, pageSize: 25 }),
    getInvoiceFormLookups(),
    getRevenueByChannel(now.getMonth() + 1, now.getFullYear()),
  ]);

  const invoices = invoicesResp.data;
  const invoicesPagination = invoicesResp.pagination;

  const customers = customersResp.data;
  const customersPagination = customersResp.pagination;

  const outstanding = outstandingResp.data;
  const outstandingPagination = outstandingResp.pagination;

  const returns = returnsResp.data;
  const returnsPagination = returnsResp.pagination;

  const tabs = [
    { id: "invoices", label: "Invoices" },
    { id: "customers", label: "Customers" },
    { id: "outstanding", label: "Outstanding" },
    { id: "returns", label: "Returns" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Sales Invoices"
          description="Create multi-channel invoices, track customer payments, credit dues, and returns."
        />
        {hasPermission(user.role as Role, "sales", "create") && <CreateInvoiceForm {...lookups} />}
      </div>

      <SalesStats stats={stats} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40">
          <CardContent className="pt-2">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-200">Retail Revenue</p>
            <p className="mt-1 text-2xl font-semibold">{formatAmountOnly(Number(revenueByChannel.retail))}</p>
          </CardContent>
        </Card>
        <Card className="border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/40">
          <CardContent className="pt-2">
            <p className="text-sm font-medium text-green-700 dark:text-green-200">Wholesale Revenue</p>
            <p className="mt-1 text-2xl font-semibold">{formatAmountOnly(Number(revenueByChannel.wholesale))}</p>
          </CardContent>
        </Card>
        <Card className="border border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/40">
          <CardContent className="pt-2">
            <p className="text-sm font-medium text-purple-700 dark:text-purple-200">Project Revenue</p>
            <p className="mt-1 text-2xl font-semibold">{formatAmountOnly(Number(revenueByChannel.project))}</p>
          </CardContent>
        </Card>
      </div>

      <nav className="flex flex-wrap gap-2 border-b border-zinc-200 pb-2 dark:border-zinc-800">
        {tabs.map((item) => (
          <Link
            key={item.id}
            href={`/sales?tab=${item.id}`}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${tab === item.id ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {tab === "invoices" && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Invoices</h2>
            <p className="text-sm text-zinc-500">Retail, wholesale, and project invoices with payment status.</p>
          </div>
          {invoices.length === 0 && !search ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-zinc-500">No invoices yet.</p>
          ) : (
            <InvoiceTable invoices={invoices} pagination={invoicesPagination} searchQuery={invoicesSearch} role={user.role} />
          )}
        </section>
      )}

      {tab === "customers" && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Customers</h2>
              <p className="text-sm text-zinc-500">Active customer accounts, credit limits, and detailed double-entry ledgers.</p>
            </div>
            {hasPermission(user.role as Role, "sales", "create") && <AddCustomerModal />}
          </div>
          {customers.length === 0 && !search ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-zinc-500">No customers registered yet.</p>
          ) : (
            <CustomerListTable customers={customers as any} pagination={customersPagination} searchQuery={customersSearch} role={user.role} />
          )}
        </section>
      )}

      {tab === "outstanding" && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Outstanding Dues</h2>
            <p className="text-sm text-zinc-500">Customers with unpaid invoice balances.</p>
          </div>
          {outstanding.length === 0 && !search ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-zinc-500">No outstanding dues.</p>
          ) : (
            <OutstandingDuesTable dues={outstanding} pagination={outstandingPagination} searchQuery={outstandingSearch} role={user.role} />
          )}
        </section>
      )}

      {tab === "returns" && (
        <SalesReturnsTab returns={returns} pagination={returnsPagination} searchQuery={returnsSearch} />
      )}
    </div>
  );
}
