"use client";

import React from "react";
import { PageHeader } from "../../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { NPRAmount } from "../../../components/shared/NPRAmount";
import { BarChart3, TrendingUp, DollarSign, Calculator, Percent } from "lucide-react";
import { VAT_RATE } from "../../../lib/constants";

export default function ReportsPage() {
  const reportsList = [
    {
      title: "Profit & Loss Statement (Q4)",
      desc: "Revenues, cost of goods sold, and operating profit.",
      icon: TrendingUp,
      metrics: [
        { label: "Gross Revenue", value: 3450000.0, color: "text-zinc-900 dark:text-zinc-100" },
        { label: "Cost of Materials (COGS)", value: 2150000.0, color: "text-rose-600 dark:text-rose-400" },
        { label: "Operating Net Profit", value: 1300000.0, color: "text-emerald-600 dark:text-emerald-400" },
      ],
    },
    {
      title: "VAT Computation Summary",
      desc: `Computed based on standard Nepal VAT rate of ${(VAT_RATE * 100).toFixed(0)}%.`,
      icon: Calculator,
      metrics: [
        { label: "Output VAT (on Sales)", value: 448500.0, color: "text-zinc-900 dark:text-zinc-100" },
        { label: "Input VAT Credit (on Purchases)", value: 279500.0, color: "text-rose-600 dark:text-rose-400" },
        { label: "Net VAT Payable to IRD", value: 169000.0, color: "text-primary" },
      ],
    },
    {
      title: "Category Wise Sales Revenue",
      desc: "Key performance indicators across product lines.",
      icon: BarChart3,
      metrics: [
        { label: "Waterproofing Chemicals", value: 1420000.0, color: "text-zinc-900 dark:text-zinc-100" },
        { label: "OPC/PPC Cement", value: 980000.0, color: "text-zinc-900 dark:text-zinc-100" },
        { label: "PVC Pipes & Fittings", value: 650000.0, color: "text-zinc-900 dark:text-zinc-100" },
        { label: "Paints & Wire", value: 400000.0, color: "text-zinc-900 dark:text-zinc-100" },
      ],
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Analytical Reports"
        description="Review taxation sheets, profit metrics, and inventory valuation stats."
      />

      {/* Mini KPI */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border border-zinc-100 shadow-sm rounded-2xl dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Revenue YTD</CardTitle>
            <div className="p-2.5 rounded-xl text-blue-500 bg-blue-50 dark:bg-blue-950/20">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              <NPRAmount amount={12450000.0} />
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-1">Year-To-Date operations volume</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-100 shadow-sm rounded-2xl dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Tax Liability (VAT)</CardTitle>
            <div className="p-2.5 rounded-xl text-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <Percent className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              <NPRAmount amount={169000.0} />
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-1">Unpaid VAT liability this quarter</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-100 shadow-sm rounded-2xl dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Material In stock</CardTitle>
            <div className="p-2.5 rounded-xl text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20">
              <BarChart3 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              <NPRAmount amount={3860000.0} />
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-1">Valued at standard procurement cost</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Breakdown Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportsList.map((rep, idx) => {
          const Icon = rep.icon;
          return (
            <Card key={idx} className="border border-zinc-100 shadow-sm rounded-2xl dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-between overflow-hidden">
              <div>
                <CardHeader className="flex flex-row items-start justify-between border-b border-zinc-100/60 dark:border-zinc-800/40 pb-4">
                  <div className="space-y-1 pr-4">
                    <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{rep.title}</CardTitle>
                    <p className="text-xs text-zinc-500 font-medium dark:text-zinc-400">{rep.desc}</p>
                  </div>
                  <div className="p-2.5 rounded-xl text-primary bg-primary/10">
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-4">
                  {rep.metrics.map((met, mIdx) => (
                    <div key={mIdx} className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-zinc-400">{met.label}</span>
                      <span className={met.color}>
                        <NPRAmount amount={met.value} />
                      </span>
                    </div>
                  ))}
                </CardContent>
              </div>

              <div className="bg-zinc-50/50 dark:bg-zinc-900/20 px-6 py-4 border-t border-zinc-100/60 dark:border-zinc-800/40">
                <button
                  onClick={() => alert(`Generating details for: ${rep.title}`)}
                  className="w-full text-center text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                >
                  Generate Detailed Statement
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
