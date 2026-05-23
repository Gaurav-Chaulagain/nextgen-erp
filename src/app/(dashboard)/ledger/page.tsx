"use client";

import React, { useState } from "react";
import { PageHeader } from "../../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { DataTable } from "../../../components/shared/DataTable";
import { NPRAmount } from "../../../components/shared/NPRAmount";
import { ColumnDef } from "@tanstack/react-table";
import { BookOpen, ArrowUpRight, ArrowDownLeft, Scale } from "lucide-react";

interface LedgerEntry {
  id: string;
  date: string;
  reference: string;
  accountName: string;
  particulars: string;
  debit: number | null;
  credit: number | null;
  balance: number;
}

const mockLedgerEntries: LedgerEntry[] = [
  {
    id: "TXN-001",
    date: "2026-05-18",
    reference: "INV-2026-004",
    accountName: "Gauradaha Commercial Complex Project",
    particulars: "防水 (Waterproofing) Chemicals Sales Delivery",
    debit: 154000.0,
    credit: null,
    balance: 154000.0,
  },
  {
    id: "TXN-002",
    date: "2026-05-19",
    reference: "PO-2026-002",
    accountName: "Shiv Shakti Cement Udhyog",
    particulars: "OPC Cement Procurement - 400 Bags",
    debit: null,
    credit: 280000.0,
    balance: -126000.0,
  },
  {
    id: "TXN-003",
    date: "2026-05-20",
    reference: "PAY-2026-009",
    accountName: "Nischal Timsina Villa Interior",
    particulars: "Advance receipt for wooden panel works",
    debit: 350000.0,
    credit: null,
    balance: 224000.0,
  },
  {
    id: "TXN-004",
    date: "2026-05-21",
    reference: "INV-2026-005",
    accountName: "Jhapa Development Authority",
    particulars: "Interiors Materials Billing - PVC Pipes",
    debit: 85000.0,
    credit: null,
    balance: 309000.0,
  },
];

export default function LedgerPage() {
  const [data] = useState<LedgerEntry[]>(mockLedgerEntries);

  const columns: ColumnDef<LedgerEntry>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-zinc-500">{row.getValue("date")}</span>
      ),
    },
    {
      accessorKey: "reference",
      header: "Reference",
      cell: ({ row }) => (
        <span className="text-xs font-bold text-primary font-mono">{row.getValue("reference")}</span>
      ),
    },
    {
      accessorKey: "accountName",
      header: "Account Name",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate font-semibold text-zinc-800 dark:text-zinc-200">
          {row.getValue("accountName")}
        </div>
      ),
    },
    {
      accessorKey: "particulars",
      header: "Particulars",
      cell: ({ row }) => (
        <div className="max-w-[280px] truncate text-zinc-500 dark:text-zinc-400">
          {row.getValue("particulars")}
        </div>
      ),
    },
    {
      accessorKey: "debit",
      header: "Debit (Dr)",
      cell: ({ row }) => {
        const amt = row.getValue("debit") as number | null;
        return amt ? (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            <NPRAmount amount={amt} />
          </span>
        ) : (
          <span className="text-zinc-300">-</span>
        );
      },
    },
    {
      accessorKey: "credit",
      header: "Credit (Cr)",
      cell: ({ row }) => {
        const amt = row.getValue("credit") as number | null;
        return amt ? (
          <span className="font-semibold text-rose-600 dark:text-rose-400">
            <NPRAmount amount={amt} />
          </span>
        ) : (
          <span className="text-zinc-300">-</span>
        );
      },
    },
    {
      accessorKey: "balance",
      header: "Running Balance",
      cell: ({ row }) => {
        const amt = row.getValue("balance") as number;
        return (
          <span className={`font-bold ${amt >= 0 ? "text-zinc-900 dark:text-zinc-50" : "text-rose-600"}`}>
            <NPRAmount amount={amt} showSign={true} />
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="General Ledger"
        description="Verify individual accounts, customer ledgers, supplier balances, and transaction journals."
      />

      {/* Summary Matrix */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border border-zinc-100 shadow-sm rounded-2xl dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Debit (Receivables)</CardTitle>
            <div className="p-2.5 rounded-xl text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              <NPRAmount amount={589000.0} />
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-1">Due from active client billings</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-100 shadow-sm rounded-2xl dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Credit (Payables)</CardTitle>
            <div className="p-2.5 rounded-xl text-rose-500 bg-rose-50 dark:bg-rose-950/20">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              <NPRAmount amount={280000.0} />
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-1">Outstanding supplier payables</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-100 shadow-sm rounded-2xl dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Net Ledger Balance</CardTitle>
            <div className="p-2.5 rounded-xl text-purple-500 bg-purple-50 dark:bg-purple-950/20">
              <Scale className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              <NPRAmount amount={309000.0} />
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-1">Net surplus cash and receivables</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Ledger Sheet */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Double Entry Ledger Journal</h2>
        </div>

        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Search accounts or details..."
          searchColumnId="accountName"
          pagination={{
            pageIndex: 0,
            pageSize: 5,
            pageCount: 1,
            totalItems: data.length,
          }}
          onExport={() => alert("Exporting Ledger as CSV...")}
        />
      </div>
    </div>
  );
}
