import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { NewPurchaseOrderForm } from "@/components/purchase/NewPurchaseOrderForm";
import { PurchaseOrderTable } from "@/components/purchase/PurchaseOrderTable";
import { SupplierListTable } from "@/components/purchase/SupplierListTable";
import { AddSupplierModal } from "@/components/purchase/AddSupplierModal";
import { PurchaseStats } from "@/components/purchase/PurchaseStats";
import { PurchaseReturnsTab } from "@/components/purchase/PurchaseReturnsTab";
import { getPurchaseOrders, getPurchaseStats, getSuppliers, getPurchaseReturns } from "@/modules/purchase/queries";
import { getCurrentUser } from "@/auth/session";

type PurchasePageProps = {
  searchParams?: Promise<{ tab?: string; page?: string; search?: string }>;
};

export default async function PurchasePage({ searchParams }: PurchasePageProps) {
  const user = await getCurrentUser();
  const userId = user?.id || "";
  const params = await searchParams;
  const tab = params?.tab ?? "orders";
  const search = params?.search ?? "";
  const page = parseInt(params?.page ?? "1") || 1;

  // Isolate query parameter bindings based on the active tab
  const ordersPage = tab === "orders" ? page : 1;
  const ordersSearch = tab === "orders" ? search : "";

  const suppliersPage = tab === "suppliers" ? page : 1;
  const suppliersSearch = tab === "suppliers" ? search : "";

  const returnsPage = tab === "returns" ? page : 1;
  const returnsSearch = tab === "returns" ? search : "";

  const [ordersResp, stats, suppliersResp, returnsResp] = await Promise.all([
    getPurchaseOrders({ page: ordersPage, search: ordersSearch, pageSize: 25 }),
    getPurchaseStats(),
    getSuppliers(suppliersSearch, suppliersPage, 25),
    getPurchaseReturns({ page: returnsPage, search: returnsSearch, pageSize: 25 }),
  ]);
  
  const orders = ordersResp.data;
  const pagination = ordersResp.pagination;
  const suppliers = suppliersResp.data;
  const suppliersPagination = suppliersResp.pagination;
  const returns = returnsResp.data;
  const returnsPagination = returnsResp.pagination;

  const tabs = [
    { id: "orders", label: "Purchase Orders" },
    { id: "suppliers", label: "Suppliers (Vendors)" },
    { id: "returns", label: "Purchase Returns" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase & Vendor Operations"
        description="Manage purchase orders, goods receipts, material stocking, and vendor relationships."
      />

      <PurchaseStats stats={stats} />

      <nav className="flex gap-2 border-b border-zinc-200 pb-2 dark:border-zinc-800">
        {tabs.map((item) => (
          <Link
            key={item.id}
            href={`/purchase?tab=${item.id}`}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              tab === item.id
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {tab === "orders" && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Purchase Orders</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Track vendor orders, receipts, and payments.</p>
            </div>
            <NewPurchaseOrderForm userId={userId} />
          </div>

          {orders.length === 0 && !search ? (
            <Card className="border border-dashed">
              <CardContent className="pt-6">
                <p className="text-center text-sm text-zinc-500">No purchase orders yet. Create one to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <PurchaseOrderTable orders={orders} pagination={pagination} searchQuery={search} userId={userId} />
          )}
        </section>
      )}

      {tab === "suppliers" && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Suppliers & Vendors</h2>
              <p className="text-sm text-zinc-500">Active vendor accounts, contact details, PAN info, and double-entry payables.</p>
            </div>
            <AddSupplierModal userId={userId} />
          </div>
          {suppliers.length === 0 && !search ? (
            <Card className="border border-dashed">
              <CardContent className="pt-6">
                <p className="text-center text-sm text-zinc-500">No suppliers registered yet. Create one to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <SupplierListTable suppliers={suppliers as any} pagination={suppliersPagination} searchQuery={suppliersSearch} userId={userId} />
          )}
        </section>
      )}

      {tab === "returns" && (
        <PurchaseReturnsTab returns={returns} pagination={returnsPagination} searchQuery={returnsSearch} userId={userId} />
      )}
    </div>
  );
}

