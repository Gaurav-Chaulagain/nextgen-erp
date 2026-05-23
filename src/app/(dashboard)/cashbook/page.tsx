"use client";

import React, { useState } from "react";
import { PageHeader } from "../../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { DataTable } from "../../../components/shared/DataTable";
import { NPRAmount } from "../../../components/shared/NPRAmount";
import { ColumnDef } from "@tanstack/react-table";
import { Wallet, Coins, Building, QrCode } from "lucide-react";

interface CashbookEntry {
  id: string;
  date: string;
  type: "CASH" | "BANK" | "ESewa/Khalti";
  mode: "IN" | "OUT";
  amount: number;
  accountName: string;
  remarks: string;
}

const mockCashbookEntries: CashbookEntry[] = [
  {
    id: "CB-001",
    date: "2026-05-18",
    type: "CASH",
    mode: "IN",
    amount: 15000.0,
    accountName: "Retail Cement Customer",
    remarks: "Sold 15 bags OPC cement in retail",
  },
  {
    id: "CB-002",
    date: "2026-05-19",
    type: "BANK",
    mode: "OUT",
    amount: 250000.0,
    accountName: "Panchakanya Steels",
    remarks: "T/T Bank payment for steel rebars",
  },
  {
    id: "CB-003",
    date: "2026-05-20",
    type: "ESewa/Khalti",
    mode: "IN",
    amount: 18500.0,
    accountName: "Hari Bahadur Khadka",
    remarks: "Paint materials retail purchase via eSewa QR",
  },
  {
    id: "CB-004",
    date: "2026-05-21",
    type: "BANK",
    mode: "IN",
    amount: 850000.0,
    accountName: "Jhapa Development Authority",
    remarks: "Running bill clearance cheque deposit",
  },
  {
    id: "CB-005",
    date: "2026-05-21",
    type: "CASH",
    mode: "OUT",
    amount: 4500.0,
    accountName: "Office Supplies",
    remarks: "Stationery and printing expenses",
  },
];

export default function CashbookPage() {
  const [data] = useState<CashbookEntry[]>(mockCashbookEntries);

  const columns: ColumnDef<CashbookEntry>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-zinc-500">{row.getValue("date")}</span>
      ),
    },
    {
      accessorKey: "type",
      header: "Ledger Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        let badgeStyle = "";
        switch (type) {
          case "CASH":
            badgeStyle = "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800";
            break;
          case "BANK":
            badgeStyle = "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800";
            break;
          case "ESewa/Khalti":
            badgeStyle = "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800";
            break;
        }
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider ${badgeStyle}`}>
            {type}
          </span>
        );
      },
    },
    {
      accessorKey: "mode",
      header: "Mode",
      cell: ({ row }) => {
        const mode = row.getValue("mode") as string;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider ${
            mode === "IN"
              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
          }`}>
            {mode === "IN" ? "Cash In (Receipt)" : "Cash Out (Payment)"}
          </span>
        );
      },
    },
    {
      accessorKey: "accountName",
      header: "Account / Entity",
      cell: ({ row }) => (
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{row.getValue("accountName")}</span>
      ),
    },
    {
      accessorKey: "remarks",
      header: "Remarks / Narration",
      cell: ({ row }) => (
        <span className="text-zinc-500 dark:text-zinc-400 text-xs">{row.getValue("remarks")}</span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const mode = row.original.mode;
        const amt = row.getValue("amount") as number;
        return (
          <span className={`font-bold ${mode === "IN" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {mode === "IN" ? "+" : "-"}
            <NPRAmount amount={amt} />
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Cash Book"
        description="Monitor physical cash vaults, commercial bank accounts, and mobile digital payments."
      />

      {/* Cash Box Summary */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border border-zinc-100 shadow-sm rounded-2xl dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Cash-In-Hand</CardTitle>
            <div className="p-2.5 rounded-xl text-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <Coins className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              <NPRAmount amount={45200.0} />
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-1">Physical currency inside safe vaults</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-100 shadow-sm rounded-2xl dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Bank Accounts Balance</CardTitle>
            <div className="p-2.5 rounded-xl text-blue-500 bg-blue-50 dark:bg-blue-950/20">
              <Building className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              <NPRAmount amount={1425000.0} />
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-1">Nabil Bank & Global IME bank books</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-100 shadow-sm rounded-2xl dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Digital Wallet (eSewa/Khalti)</CardTitle>
            <div className="p-2.5 rounded-xl text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20">
              <QrCode className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              <NPRAmount amount={38450.0} />
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-1">Direct merchant QR wallet reserves</p>
          </CardContent>
        </Card>
      </div>

      {/* Cash Book Transactions List */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Wallet className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Live Cash/Bank Transactions</h2>
        </div>

        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Search remarks or accounts..."
          searchColumnId="remarks"
          pagination={{
            pageIndex: 0,
            pageSize: 5,
            pageCount: 1,
            totalItems: data.length,
          }}
          onExport={() => alert("Exporting Cash Book as CSV...")}
        />
      </div>
    </div>
  );
}
