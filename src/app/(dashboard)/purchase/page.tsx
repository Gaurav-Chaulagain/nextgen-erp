import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { NewPurchaseOrderForm } from "@/components/purchase/NewPurchaseOrderForm";
import { PurchaseOrderTable } from "@/components/purchase/PurchaseOrderTable";
import { PurchaseStats } from "@/components/purchase/PurchaseStats";
import { getPurchaseOrders, getPurchaseStats } from "@/modules/purchase/queries";

export default async function PurchasePage() {
  const [ordersResp, stats] = await Promise.all([getPurchaseOrders(), getPurchaseStats()]);
  const orders = ordersResp.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Manage purchase orders, receipts, payments, and vendor relationships."
      />

      <PurchaseStats stats={stats} />

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Purchase Orders</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Track vendor orders, receipts, and payments.</p>
          </div>
          <NewPurchaseOrderForm />
        </div>

        {orders.length === 0 ? (
          <Card className="border border-dashed">
            <CardContent className="pt-6">
              <p className="text-center text-sm text-zinc-500">No purchase orders yet. Create one to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <PurchaseOrderTable orders={orders} />
        )}
      </section>
    </div>
  );
}
