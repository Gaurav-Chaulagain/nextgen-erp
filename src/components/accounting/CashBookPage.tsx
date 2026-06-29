"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/DataTable";
import { NPRAmount } from "@/components/shared/NPRAmount";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { fetchCashBookEntriesAction, fetchCashBookSummaryAction, deleteCashBookEntryAction } from "@/modules/accounting/actions";
import { AddCashEntryModal } from "./AddCashEntryModal";
import { EditCashEntryModal } from "./EditCashEntryModal";
import { ColumnDef } from "@tanstack/react-table";
import { Wallet, Coins, Building, QrCode, Plus, Calendar, RefreshCw, Pencil, Trash2, Lock, ArrowUpRight, ArrowDownRight, ArrowDownLeft, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PaymentMode } from "@/generated/prisma/enums";
import { DualDatePicker } from "@/components/shared/DualDatePicker";
import { DualDateDisplay } from "@/components/shared/DualDateDisplay";
import { hasPermission } from "@/auth/permissions";
import { Role } from "@/lib/constants";

interface CashEntryRow {
  id: string;
  entryDate: string;
  type: "RECEIVED" | "PAID";
  amount: string;
  description: string | null;
  partyType: string | null;
  partyId: string | null;
  referenceType: string | null;
  referenceId: string | null;
  paymentMethod: PaymentMode;
  runningBalance: string;
  creator: { name: string };
}

interface CashBookPageProps {
  role?: string;
}

export function CashBookPage({ role }: CashBookPageProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  const [summary, setSummary] = useState({
    openingBalance: "0.00",
    receivedToday: "0.00",
    paidToday: "0.00",
    closingBalance: "0.00",
    receivedThisMonth: "0.00",
    paidThisMonth: "0.00",
    methodBalances: {} as Record<string, string>,
  });
  
  const [entries, setEntries] = useState<CashEntryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CashEntryRow | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this cashbook entry? This will also remove any linked ledger entry and recalculate party balances.")) {
      return;
    }
    try {
      const res = await deleteCashBookEntryAction(id);
      if (res.success) {
        toast.success("Cash transaction deleted successfully.");
        loadData();
      } else {
        toast.error(`Deletion failed: ${res.error}`);
      }
    } catch (err: any) {
      toast.error(`Error deleting transaction: ${err.message}`);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Default to today for summary
      const todayString = new Date().toISOString().slice(0, 10);
      const sumData = await fetchCashBookSummaryAction(todayString);
      setSummary(sumData);

      const entriesData = await fetchCashBookEntriesAction(
        dateFrom || undefined,
        dateTo || undefined
      );
      setEntries(entriesData.entries as any[]);
    } catch (err: any) {
      toast.error(`Failed to load Cash Book: ${err.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Default: Set date filters to today's month first day to today
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const today = now.toISOString().slice(0, 10);
    setDateFrom(firstDay);
    setDateTo(today);
  }, []);

  useEffect(() => {
    if (dateFrom && dateTo) {
      loadData();
    }
  }, [dateFrom, dateTo]);

  const columns: ColumnDef<CashEntryRow>[] = [
    {
      accessorKey: "entryDate",
      header: "Date",
      cell: ({ row }) => <DualDateDisplay date={row.original.entryDate} />,
    },
    {
      accessorKey: "paymentMethod",
      header: "Vault / Mode",
      cell: ({ row }) => {
        const method = row.getValue("paymentMethod") as PaymentMode;
        let badgeStyle = "";
        switch (method) {
          case "CASH":
            badgeStyle = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800";
            break;
          case "BANK":
            badgeStyle = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800";
            break;
          case "CHEQUE":
            badgeStyle = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800";
            break;
          case "ESEWA":
          case "KHALTI":
            badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800";
            break;
        }
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider border ${badgeStyle}`}>
            {method}
          </span>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider border ${
            type === "RECEIVED"
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-600 border-rose-500/20"
          }`}>
            {type === "RECEIVED" ? "Inflow (Receipt)" : "Outflow (Payment)"}
          </span>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Narration Remarks",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-zinc-800 dark:text-zinc-200 max-w-[400px] break-words whitespace-normal">
            {row.getValue("description") || "-"}
          </div>
          {row.original.partyType && (
            <span className="text-[10px] text-zinc-400 block uppercase font-bold">
              Account Link: {row.original.partyType}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount (NPR)",
      cell: ({ row }) => {
        const amt = parseFloat(row.getValue("amount"));
        const isInflow = row.original.type === "RECEIVED";
        return (
          <span className={`font-bold ${isInflow ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {isInflow ? "+" : "-"}
            <NPRAmount amount={amt} showCurrency={false} />
          </span>
        );
      },
    },
    {
      accessorKey: "runningBalance",
      header: "Running Balance (NPR)",
      cell: ({ row }) => (
        <span className="font-bold text-zinc-900 dark:text-zinc-50">
          <NPRAmount amount={Number(row.getValue("runningBalance"))} showCurrency={false} />
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const entry = row.original;
        const isManual = !entry.referenceType || entry.referenceType === "CASH_BOOK";
        
        const canEdit = hasPermission(role as Role, "cashbook", "edit");
        const canDelete = hasPermission(role as Role, "cashbook", "delete");

        if (!canEdit) {
          return (
            <div className="flex items-center justify-center h-7 w-7 text-zinc-450 dark:text-zinc-650" title="Read-only access">
              <Lock className="h-3.5 w-3.5" />
            </div>
          );
        }

        if (isManual) {
          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingEntry(entry);
                  setIsEditModalOpen(true);
                }}
                className="h-7 w-7 p-0 border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
                title="Edit Transaction"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              {canDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(entry.id);
                  }}
                  className="h-7 w-7 p-0 border-red-200 text-red-650 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/20"
                  title="Delete Transaction"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          );
        }
        
        return (
          <div className="flex items-center justify-center h-7 w-7 text-zinc-450 dark:text-zinc-600" title={`System-generated transaction (${entry.referenceType}). Manage from original module.`}>
            <Lock className="h-3.5 w-3.5" />
          </div>
        );
      },
    },
  ];

  const receivedVal = Number(summary.receivedThisMonth || 0);
  const paidVal = Number(summary.paidThisMonth || 0);
  const netFlow = receivedVal - paidVal;
  const isNetPositive = netFlow >= 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Cash Book Journal"
          description="Monitor cash inflows, physical vault reserves, bank accounts, and digital digital transactions."
        />
        {hasPermission(role as Role, "cashbook", "create") && (
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex gap-1 h-10 px-4 rounded-xl shadow-sm text-xs font-bold shrink-0 self-start md:self-auto"
          >
            <Plus className="h-4 w-4" />
            Record Transaction
          </Button>
        )}
      </div>

      {/* Cash Box Summary KPI Cards */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Card key={n} className="border border-zinc-100 dark:border-zinc-800 shadow-sm rounded-2xl h-32 animate-pulse bg-zinc-50 dark:bg-zinc-900" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {/* Cash Vault */}
          <Card className="border border-zinc-100 shadow-sm rounded-2xl dark:border-zinc-800 dark:bg-zinc-950 hover:shadow-md hover:-translate-y-1 transition-all duration-300 border-t-[4px] border-t-amber-500 group relative overflow-hidden cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-50/10 to-transparent dark:from-amber-950/5 pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Cash-In-Hand Vault</CardTitle>
              <div className="p-2.5 rounded-xl text-amber-500 bg-amber-50 dark:bg-amber-950/20 group-hover:scale-110 transition-transform duration-300">
                <Coins className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                <NPRAmount amount={Number(summary.methodBalances["CASH"] || 0)} />
              </div>
              <p className="text-xs text-zinc-400 font-semibold mt-1">Physical currency inside office safes</p>
            </CardContent>
          </Card>

          {/* Bank Balance */}
          <Card className="border border-zinc-100 shadow-sm rounded-2xl dark:border-zinc-800 dark:bg-zinc-950 hover:shadow-md hover:-translate-y-1 transition-all duration-300 border-t-[4px] border-t-blue-500 group relative overflow-hidden cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/10 to-transparent dark:from-blue-950/5 pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Commercial Bank Balance</CardTitle>
              <div className="p-2.5 rounded-xl text-blue-500 bg-blue-50 dark:bg-blue-950/20 group-hover:scale-110 transition-transform duration-300">
                <Building className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                <NPRAmount amount={Number(summary.methodBalances["BANK"] || 0)} />
              </div>
              <p className="text-xs text-zinc-400 font-semibold mt-1">Cleared Nabil Bank deposits</p>
            </CardContent>
          </Card>

          {/* Digital QR Wallets */}
          <Card className="border border-zinc-100 shadow-sm rounded-2xl dark:border-zinc-800 dark:bg-zinc-950 hover:shadow-md hover:-translate-y-1 transition-all duration-300 border-t-[4px] border-t-emerald-500 group relative overflow-hidden cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/10 to-transparent dark:from-emerald-950/5 pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Digital QR Wallets</CardTitle>
              <div className="p-2.5 rounded-xl text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 group-hover:scale-110 transition-transform duration-300">
                <QrCode className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                <NPRAmount amount={Number(summary.methodBalances["ESEWA"] || 0) + Number(summary.methodBalances["KHALTI"] || 0)} />
              </div>
              <p className="text-xs text-zinc-400 font-semibold mt-1">Direct merchant QR balances</p>
            </CardContent>
          </Card>

          {/* Amount Received (This Month) */}
          <Card className="border border-zinc-100 shadow-sm rounded-2xl dark:border-zinc-800 dark:bg-zinc-950 hover:shadow-md hover:-translate-y-1 transition-all duration-300 border-t-[4px] border-t-emerald-500 group relative overflow-hidden cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/10 to-transparent dark:from-emerald-950/5 pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Received (This Month)</CardTitle>
              <div className="p-2.5 rounded-xl text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-450">
                <NPRAmount amount={receivedVal} />
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                  isNetPositive 
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" 
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400"
                }`}>
                  {isNetPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {isNetPositive ? "Surplus" : "Deficit"}
                </span>
                <span className="text-[10px] text-zinc-400 font-semibold">
                  Net: {isNetPositive ? "+" : ""}<NPRAmount amount={netFlow} showCurrency={false} />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Amount Paid (This Month) */}
          <Card className="border border-zinc-100 shadow-sm rounded-2xl dark:border-zinc-800 dark:bg-zinc-950 hover:shadow-md hover:-translate-y-1 transition-all duration-300 border-t-[4px] border-t-rose-500 group relative overflow-hidden cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-b from-rose-50/10 to-transparent dark:from-rose-950/5 pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Paid (This Month)</CardTitle>
              <div className="p-2.5 rounded-xl text-rose-500 bg-rose-50 dark:bg-rose-950/20 group-hover:scale-110 transition-transform duration-300">
                <TrendingDown className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-455">
                <NPRAmount amount={paidVal} />
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                  isNetPositive 
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" 
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400"
                }`}>
                  {isNetPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {isNetPositive ? "Surplus" : "Deficit"}
                </span>
                <span className="text-[10px] text-zinc-400 font-semibold">
                  Net: {isNetPositive ? "+" : ""}<NPRAmount amount={netFlow} showCurrency={false} />
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Cash Book Table */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
        {/* Date Filter & Title row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Vault & Bank Journals</h2>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <DualDatePicker
              label="From"
              value={dateFrom || undefined}
              onChange={(date) => setDateFrom(date.toISOString().split("T")[0])}
            />
            <DualDatePicker
              label="To"
              value={dateTo || undefined}
              onChange={(date) => setDateTo(date.toISOString().split("T")[0])}
            />
            <Button size="sm" onClick={loadData} disabled={isLoading} className="h-9 px-3">
              <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={entries}
            searchPlaceholder="Search remarks or narration..."
            searchColumnId="description"
            pagination={{
              pageIndex: 0,
              pageSize: 15,
              pageCount: Math.ceil(entries.length / 15),
              totalItems: entries.length,
            }}
          />
        )}
      </div>

      {/* Transaction recording Modal */}
      <AddCashEntryModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={loadData}
      />

      {/* Transaction editing Modal */}
      <EditCashEntryModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        entry={editingEntry}
        onSuccess={loadData}
      />
    </div>
  );
}
