import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PurchaseStatsSchema } from "@/modules/purchase/types";

interface PurchaseStatsProps {
  stats: PurchaseStatsSchema;
}

export function PurchaseStats({ stats }: PurchaseStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-sm">This Month Purchases</CardTitle>
          <CardDescription>Total purchase value YTD</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
            NPR {parseFloat(stats.thisMonthTotal).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-sm">Pending Payments</CardTitle>
          <CardDescription>Outstanding payables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold text-orange-600 dark:text-orange-400">
            NPR {parseFloat(stats.pendingPayments).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-sm">Active Vendors</CardTitle>
          <CardDescription>Suppliers with orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold text-blue-600 dark:text-blue-400">
            {stats.activeVendors}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
