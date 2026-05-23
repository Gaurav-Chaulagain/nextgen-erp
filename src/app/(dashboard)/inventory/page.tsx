import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { fetchInventoryAlerts, fetchInventoryItems, fetchStockSummary } from "@/modules/inventory/queries";
import AddProductModal from '@/components/inventory/AddProductModal';
import AdjustStockModal from '@/components/inventory/AdjustStockModal';

export default async function InventoryPage() {
  const [itemsResp, summary, alerts] = await Promise.all([
    fetchInventoryItems(),
    fetchStockSummary(),
    fetchInventoryAlerts(),
  ]);
  const items = itemsResp?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Stock Level"
        description="Monitor product levels, brands, categories, and warehouse stocks."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader>
            <CardTitle>Total Active Products</CardTitle>
            <CardDescription>Products assigned to active inventory records.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-4 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{summary.totalProducts}</div>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader>
            <CardTitle>Total Stock Units</CardTitle>
            <CardDescription>Sum of available quantities across warehouses.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-4 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{summary.totalStock}</div>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader>
            <CardTitle>Reorder Alerts</CardTitle>
            <CardDescription>Products below reorder level across warehouses.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant={alerts.length > 0 ? "destructive" : "secondary"}>
                {alerts.length > 0 ? `${alerts.length} require attention` : "All good"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {alerts.length > 0 ? (
        <section className="rounded-3xl border border-orange-200 bg-orange-50 p-6 dark:border-orange-900/40 dark:bg-orange-950/60">
          <h2 className="text-lg font-semibold text-orange-900 dark:text-orange-100">Low stock alerts</h2>
          <p className="mt-2 text-sm text-orange-700 dark:text-orange-300">
            {alerts.length} item{alerts.length === 1 ? "" : "s"} are at or below their reorder level.
          </p>
        </section>
      ) : (
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No reorder alerts at the moment.</p>
        </section>
      )}

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Inventory Snapshot</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Review stock levels and warehouse allocations.</p>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">{items.length} inventory rows</div>
        </div>
        <div className="flex items-center justify-end gap-2 mb-4">
          <AddProductModal />
          <AdjustStockModal />
        </div>
        <InventoryTable items={items} />
      </section>
    </div>
  );
}
