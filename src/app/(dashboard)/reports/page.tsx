"use client";

import React, { useState } from "react";
import { PageHeader } from "../../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { ReportViewer } from "../../../components/reports/ReportViewer";
import {
  TrendingUp,
  Calculator,
  Scale,
  RefreshCw,
  BarChart,
  ShoppingBag,
  AlertCircle,
  FileCheck,
  Percent,
  Briefcase,
  Coins
} from "lucide-react";

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const reportGroups = [
    {
      groupName: "Financial Accounts & Statements",
      desc: "Compile GAAP-compliant tax audit ledgers, trading margins, and snapshots.",
      reports: [
        {
          key: "profit_loss",
          title: "Profit & Loss Statement",
          desc: "Chronological Sales Revenues minus procurement COGS and operating expenses.",
          icon: TrendingUp,
          color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
        },
        {
          key: "trading_account",
          title: "Trading Account Margin",
          desc: "Compare opening inventory and purchases against closing stock to calculate trade COGS.",
          icon: Calculator,
          color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20"
        },
        {
          key: "balance_sheet",
          title: "Balance Sheet Snapshot",
          desc: "Statements of financial position comparing safe assets against AP liabilities and equities.",
          icon: Scale,
          color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20"
        },
        {
          key: "trial_balance",
          title: "Trial Balance Sheet",
          desc: "Aggregated listing of all debtor and creditor ledgers ensuring balances match.",
          icon: RefreshCw,
          color: "text-teal-500 bg-teal-50 dark:bg-teal-950/20"
        },
        {
          key: "cash_flow",
          title: "Cash Flow Statement",
          desc: "GAAP direct-method flows tracking operating receipts, suppliers, capital, and assets.",
          icon: Coins,
          color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
        }
      ]
    },
    {
      groupName: "Sales & Receivables Analytics",
      desc: "Assess daily income velocities, product performances, and outstanding aging debts.",
      reports: [
        {
          key: "sales_summary",
          title: "Sales Summary",
          desc: "Daily sales billing volumes and counts filtered by date range and channels.",
          icon: BarChart,
          color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20"
        },
        {
          key: "item_wise_sales",
          title: "Item-Wise Sales Volume",
          desc: "Top selling products showing quantity, contribution revenues, and profit margins.",
          icon: ShoppingBag,
          color: "text-rose-500 bg-rose-50 dark:bg-rose-950/20"
        },
        {
          key: "customer_aging",
          title: "Receivables Dues Aging",
          desc: "Aged debtor receivables broken down into 30, 60, 90, and 90+ overdue brackets.",
          icon: AlertCircle,
          color: "text-red-500 bg-red-50 dark:bg-red-950/20"
        }
      ]
    },
    {
      groupName: "Projects Site Costings",
      desc: "Evaluate construction contract profit margins and dispatch costings.",
      reports: [
        {
          key: "project_profitability",
          title: "Projects Job Margin Costing",
          desc: "Compare project contract budgets against site dispatches and Direct P&L.",
          icon: Briefcase,
          color: "text-orange-500 bg-orange-50 dark:bg-orange-950/20"
        }
      ]
    },
    {
      groupName: "Purchase & Payables Analysis",
      desc: "Analyze procurement expenses, outstanding vendor balances, and order pipelines.",
      reports: [
        {
          key: "purchase_summary",
          title: "Purchase Summary",
          desc: "Daily procurement purchase volumes and count analytics within period boundaries.",
          icon: FileCheck,
          color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20"
        },
        {
          key: "vendor_outstanding",
          title: "Vendor Outstanding AP",
          desc: "Summary of outstanding balances and payables owed to suppliers/creditors.",
          icon: AlertCircle,
          color: "text-rose-500 bg-rose-50 dark:bg-rose-950/20"
        }
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <PageHeader
        title={selectedReport ? "Dynamic Report Viewer" : "Analytical Reports Menu"}
        description={selectedReport ? "Configure filters, run database queries, and download client sheets." : "Review tax compliance reports, dynamic Balance Sheets, stock valuations, and project profit margins."}
      />

      {/* RENDER DYNAMIC REPORT VIEW OR MAIN GRID MENU */}
      {selectedReport ? (
        <ReportViewer reportKey={selectedReport} onBack={() => setSelectedReport(null)} />
      ) : (
        <div className="space-y-12">
          {reportGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-6">
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div>
                  <h2 className="text-xs font-black text-zinc-900 dark:text-zinc-50 tracking-wider uppercase">
                    {group.groupName}
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-medium mt-0.5">{group.desc}</p>
                </div>
                <span className="text-[10px] font-bold bg-purple-500/5 text-purple-600 dark:text-purple-400 border border-purple-200/20 px-2.5 py-0.5 rounded-full">
                  {group.reports.length} Statements
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.reports.map((rep) => {
                  const Icon = rep.icon;
                  return (
                    <Card
                      key={rep.key}
                      className="group border border-zinc-150/80 dark:border-zinc-800/80 dark:bg-zinc-950 shadow-sm rounded-2xl flex flex-col justify-between hover:border-purple-300/60 dark:hover:border-purple-800/50 hover:shadow-md hover:shadow-purple-500/5 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <CardHeader className="flex flex-row items-start justify-between pb-4">
                        <div className="space-y-1 pr-4">
                          <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                            {rep.title}
                          </CardTitle>
                        </div>
                        <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-105 duration-300 ${rep.color}`}>
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0 pb-6 flex-grow flex flex-col justify-between space-y-4">
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium leading-relaxed">
                          {rep.desc}
                        </p>
                        <button
                          onClick={() => setSelectedReport(rep.key)}
                          className="w-full py-2.5 text-center text-xs font-bold text-purple-600 bg-purple-50/50 hover:bg-purple-100 dark:text-purple-400 dark:bg-purple-950/20 dark:hover:bg-purple-900/30 rounded-xl transition-all duration-300 border border-purple-100/50 dark:border-purple-900/30 hover:shadow-sm hover:shadow-purple-500/5"
                        >
                          View Statement
                        </button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
