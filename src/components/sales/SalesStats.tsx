import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNPR } from "@/lib/utils";
import type { SalesStatsSchema } from "@/modules/sales/types";

interface SalesStatsProps {
  stats: SalesStatsSchema;
}

export function SalesStats({ stats }: SalesStatsProps) {
  const cards = [
    { title: "Today's Sales", description: "Invoiced today", value: stats.todaySales, tone: "text-blue-600 dark:text-blue-400" },
    {
      title: "Monthly Revenue",
      description: `${stats.monthlyGrowthPercent}% vs last month`,
      value: stats.monthlyRevenue,
      tone: "text-green-600 dark:text-green-400",
    },
    { title: "Outstanding Credit", description: "Unpaid customer dues", value: stats.outstanding, tone: "text-amber-600 dark:text-amber-400" },
    { title: "Returns", description: "Returned goods value", value: stats.returns, tone: "text-rose-600 dark:text-rose-400" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader>
            <CardTitle className="text-sm">{card.title}</CardTitle>
            <CardDescription>{card.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-semibold ${card.tone}`}>{formatNPR(Number(card.value))}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
