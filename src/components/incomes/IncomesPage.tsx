"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddIncomeModal } from "./AddIncomeModal";
import { deleteIncome, updateIncome } from "@/modules/incomes/actions";
import { formatDate, formatNPR, formatAmountOnly } from "@/lib/utils";
import { toast } from "sonner";
import { DualDateDisplay } from "@/components/shared/DualDateDisplay";
import {
  Trash2,
  TrendingUp,
  Eye,
  Pencil,
  X,
  Download,
  CalendarDays,
  FileSpreadsheet,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { hasPermission } from "@/auth/permissions";
import { Role } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface Income {
  id: string;
  incomeCode: string;
  category: string;
  amount: number;
  incomeDate: string;
  paymentMethod: string;
  notes?: string | null;
}

interface IncomesPageProps {
  incomes: Income[];
  availableMonths: string[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  searchQuery: string;
  selectedMonthFilter: string | null;
  stats: {
    totalThisMonth: string;
    breakdown: Array<{ category: string; amount: string }>;
  };
  userId: string;
  role?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMonthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(key: string) {
  const [year, month] = key.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function downloadCSV(rows: Income[], monthLabel: string) {
  const header = ["Code", "Date", "Category", "Amount (NPR)", "Payment Method", "Notes"];
  const csvRows = rows.map((e) => [
    e.incomeCode,
    new Date(e.incomeDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    e.category,
    Number(e.amount).toFixed(2),
    e.paymentMethod,
    (e.notes || "").replace(/,/g, " "),
  ]);

  const total = rows.reduce((s, e) => s + Number(e.amount), 0);
  csvRows.push(["", "", "TOTAL", total.toFixed(2), "", ""]);

  const content = [header, ...csvRows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Incomes_${monthLabel.replace(/\s/g, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPDF(rows: Income[], monthLabel: string) {
  const total = rows.reduce((s, e) => s + Number(e.amount), 0);
  const printDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Build category summary
  const byCategory: Record<string, number> = {};
  rows.forEach((e) => { byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount); });
  const catSummaryRows = Object.entries(byCategory)
    .map(([cat, amt]) => `<tr><td style="padding:6px 12px;border:1px solid #e5e7eb">${cat}</td><td style="padding:6px 12px;border:1px solid #e5e7eb;text-align:right;font-weight:600">NPR ${Number(amt).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td></tr>`)
    .join("");

  // Build income rows
  const incomeRows = rows.map((e, i) => `
    <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f9fafb"}">
      <td style="padding:7px 10px;border:1px solid #e5e7eb;font-family:monospace;color:#059669;font-weight:700">${e.incomeCode}</td>
      <td style="padding:7px 10px;border:1px solid #e5e7eb;color:#374151">${new Date(e.incomeDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</td>
      <td style="padding:7px 10px;border:1px solid #e5e7eb">
        <span style="padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;background:#d1fae5;color:#065f46">${e.category}</span>
      </td>
      <td style="padding:7px 10px;border:1px solid #e5e7eb;text-align:right;font-weight:700;color:#111827">NPR ${Number(e.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      <td style="padding:7px 10px;border:1px solid #e5e7eb;text-align:center">
        <span style="padding:2px 8px;border-radius:4px;font-size:11px;background:#f3f4f6;color:#374151">${e.paymentMethod}</span>
      </td>
      <td style="padding:7px 10px;border:1px solid #e5e7eb;color:#9ca3af;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.notes || "—"}</td>
    </tr>
  `).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Income Report — ${monthLabel}</title>
  <style>
    @page { size: A4 landscape; margin: 18mm 14mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; font-size: 13px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #059669; padding-bottom: 14px; margin-bottom: 20px; }
    .company-name { font-size: 22px; font-weight: 800; color: #111827; letter-spacing: -0.5px; }
    .company-sub { font-size: 11px; color: #6b7280; margin-top: 3px; }
    .report-title { text-align: right; }
    .report-title h2 { font-size: 16px; font-weight: 700; color: #059669; }
    .report-title p { font-size: 11px; color: #6b7280; margin-top: 2px; }
    .section-title { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; margin-top: 18px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    thead tr { background: #111827; color: #ffffff; }
    thead th { padding: 9px 10px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
    thead th:nth-child(4) { text-align: right; }
    .tfoot-row td { padding: 9px 10px; background: #f3f4f6; font-weight: 700; border: 1px solid #e5e7eb; }
    .summary-table { width: auto; min-width: 300px; }
    .total-box { margin-top: 16px; background: #ecfdf5; border: 2px solid #059669; border-radius: 8px; padding: 12px 18px; display: inline-block; }
    .total-box .label { font-size: 10px; color: #065f46; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
    .total-box .amount { font-size: 22px; font-weight: 800; color: #059669; margin-top: 2px; }
    .footer { margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 12px; display: flex; justify-content: space-between; font-size: 10px; color: #9ca3af; }
    .sig { margin-top: 40px; border-top: 1px solid #374151; width: 180px; padding-top: 6px; font-size: 10px; color: #6b7280; }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-name">NextGen ERP</div>
      <div class="company-sub">Operating Revenues Report</div>
    </div>
    <div class="report-title">
      <h2>Income Ledger — ${monthLabel}</h2>
      <p>Generated: ${printDate} &nbsp;|&nbsp; Total Entries: ${rows.length}</p>
    </div>
  </div>

  <div class="section-title">Category Summary</div>
  <table class="summary-table">
    <thead><tr><th>Category</th><th style="text-align:right">Total (NPR)</th></tr></thead>
    <tbody>${catSummaryRows}</tbody>
  </table>

  <div class="total-box" style="margin-top:12px">
    <div class="label">${monthLabel} — Grand Total</div>
    <div class="amount">NPR ${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
  </div>

  <div class="section-title" style="margin-top:24px">Detailed Income Journal Entries</div>
  <table>
    <thead>
      <tr>
        <th>Code</th>
        <th>Date</th>
        <th>Category</th>
        <th style="text-align:right">Amount (NPR)</th>
        <th style="text-align:center">Vault</th>
        <th>Memo / Notes</th>
      </tr>
    </thead>
    <tbody>${incomeRows}</tbody>
    <tfoot>
      <tr class="tfoot-row">
        <td colspan="3" style="font-weight:700;font-size:12px">TOTAL</td>
        <td style="text-align:right;font-weight:800;font-size:13px;color:#059669">NPR ${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        <td colspan="2"></td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">
    <span>NextGen Interior &amp; Waterproofing ERP &nbsp;|&nbsp; Confidential</span>
    <span>Printed: ${printDate}</span>
  </div>

  <div style="margin-top:40px;display:flex;gap:80px">
    <div class="sig">Prepared By</div>
    <div class="sig">Approved By</div>
    <div class="sig">Accounts</div>
  </div>

  <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };<\/script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=1000,height=700");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function IncomesPage({
  incomes,
  availableMonths,
  pagination,
  searchQuery,
  selectedMonthFilter,
  stats,
  userId,
  role,
}: IncomesPageProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const currentMonthKey = getMonthKey(new Date().toISOString());
  const [selectedMonth, setSelectedMonth] = useState<string>(selectedMonthFilter || currentMonthKey);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setSelectedMonth(selectedMonthFilter || currentMonthKey);
  }, [selectedMonthFilter, currentMonthKey]);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const urlSearch = new URLSearchParams(window.location.search).get("search") ?? "";
    if (localSearch === urlSearch) {
      return;
    }

    const timer = setTimeout(() => {
      const current = new URLSearchParams(window.location.search);
      if (localSearch) {
        current.set("search", localSearch);
      } else {
        current.delete("search");
      }
      current.set("page", "1"); // Reset to page 1 on search
      router.push(`${window.location.pathname}?${current.toString()}`);
    }, 350);

    return () => clearTimeout(timer);
  }, [localSearch, router]);

  const handleMonthChange = (val: string) => {
    setSelectedMonth(val);
    const current = new URLSearchParams(window.location.search);
    if (val && val !== "all") {
      current.set("month", val);
    } else {
      current.delete("month");
    }
    current.set("page", "1"); // Reset to page 1 on month change
    router.push(`${window.location.pathname}?${current.toString()}`);
  };

  const handlePageChange = (pageIndex: number) => {
    const current = new URLSearchParams(window.location.search);
    current.set("page", String(pageIndex + 1));
    router.push(`${window.location.pathname}?${current.toString()}`);
  };

  const filteredIncomes = incomes;

  const filteredTotal = useMemo(
    () => filteredIncomes.reduce((s, e) => s + Number(e.amount), 0),
    [filteredIncomes]
  );

  // View modal state
  const [viewIncome, setViewIncome] = useState<Income | null>(null);

  // Edit modal state
  const [editIncome, setEditIncome] = useState<Income | null>(null);
  const [editCategory, setEditCategory] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editPayment, setEditPayment] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const openEdit = (e: Income) => {
    setEditIncome(e);
    setEditCategory(e.category);
    setEditAmount(String(e.amount));
    setEditDate(e.incomeDate.split("T")[0]);
    setEditPayment(e.paymentMethod);
    setEditNotes(e.notes || "");
  };

  const handleDelete = (id: string, code: string) => {
    if (!confirm(`Delete income ${code}? This will reverse the cash book entry.`)) return;
    startTransition(async () => {
      try {
        await deleteIncome(id, userId);
        toast.success("Income deleted successfully!");
        router.refresh();
      } catch (err: any) {
        toast.error("Error: " + (err.message || "Failed to delete income"));
      }
    });
  };

  const handleUpdate = () => {
    if (!editIncome) return;
    if (!editAmount || parseFloat(editAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    startTransition(async () => {
      try {
        await updateIncome(editIncome.id, {
          category: editCategory as any,
          amount: Number(editAmount),
          incomeDate: new Date(editDate),
          paymentMethod: editPayment as any,
          notes: editNotes || undefined,
        }, userId);
        toast.success("Income updated successfully!");
        setEditIncome(null);
        router.refresh();
      } catch (err: any) {
        toast.error("Error: " + (err.message || "Failed to update income"));
      }
    });
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Commission": return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "Interest Received": return "text-teal-700 bg-teal-50 border-teal-200";
      case "Rent Received": return "text-blue-700 bg-blue-50 border-blue-200";
      default: return "text-purple-700 bg-purple-50 border-purple-200";
    }
  };

  const getCategoryIconColor = (cat: string) => {
    switch (cat) {
      case "Commission": return "text-emerald-500 bg-emerald-50 border-emerald-200";
      case "Interest Received": return "text-teal-500 bg-teal-50 border-teal-200";
      case "Rent Received": return "text-blue-500 bg-blue-50 border-blue-200";
      default: return "text-purple-500 bg-purple-50 border-purple-200";
    }
  };

  const selectClass = "w-full h-10 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400";

  const currentMonthLabel = selectedMonth === "all" ? "All Months" : getMonthLabel(selectedMonth);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Operating Incomes Ledger"
          description="Log daily running revenues, commissions, interest, rent yields, and double-entry vault allocations."
        />
        {hasPermission(role as Role, "incomes", "create") && <AddIncomeModal userId={userId} />}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border border-zinc-200 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl border border-emerald-200">
              <TrendingUp size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total This Month</span>
              <span className="text-sm font-bold text-zinc-900">{formatNPR(Number(stats.totalThisMonth))}</span>
            </div>
          </CardContent>
        </Card>

        {stats.breakdown.map((b) => (
          <Card key={b.category} className="border border-zinc-200 bg-white rounded-2xl shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border font-bold text-base w-9 h-9 flex items-center justify-center ${getCategoryIconColor(b.category)}`}>
                ₨
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">{b.category}</span>
                <span className="text-sm font-bold text-zinc-900">{formatNPR(Number(b.amount))}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table section */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">

        {/* Table header row with filter + download */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold text-zinc-900 uppercase tracking-wider">Income Journal Entries</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {selectedMonth === "all"
                ? `Showing all ${incomes.length} entries`
                : `${filteredIncomes.length} entries · ${currentMonthLabel} · Total: ${formatNPR(filteredTotal)}`}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-none sm:w-48">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search incomes..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-8 h-9 w-full rounded-lg bg-zinc-50 border-zinc-200 focus:bg-white dark:bg-zinc-900/40 dark:border-zinc-800 text-xs"
              />
            </div>

            {/* Month selector */}
            <div className="relative flex items-center gap-1.5">
              <CalendarDays size={15} className="text-zinc-400 absolute left-2.5 pointer-events-none" />
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="h-9 pl-8 pr-3 rounded-lg border border-zinc-300 bg-white text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 shadow-sm cursor-pointer"
              >
                <option value="all">All Months</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>{getMonthLabel(m)}</option>
                ))}
              </select>
            </div>

            {/* Download CSV button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadCSV(filteredIncomes, currentMonthLabel)}
              disabled={filteredIncomes.length === 0}
              className="h-9 px-3 gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 bg-white rounded-lg text-xs font-semibold shadow-sm"
            >
              <FileSpreadsheet size={14} />
              CSV
              {filteredIncomes.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                  {filteredIncomes.length}
                </span>
              )}
            </Button>

            {/* Download PDF button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadPDF(filteredIncomes, currentMonthLabel)}
              disabled={filteredIncomes.length === 0}
              className="h-9 px-3 gap-1.5 border-teal-350 text-emerald-800 hover:bg-emerald-50 hover:border-emerald-400 bg-white rounded-lg text-xs font-semibold shadow-sm"
            >
              <FileText size={14} />
              PDF
              {filteredIncomes.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                  {filteredIncomes.length}
                </span>
              )}
            </Button>
          </div>

        </div>

        {/* Month summary card (if a specific month is selected) */}
        {selectedMonth !== "all" && filteredIncomes.length > 0 && (() => {
          const byCategory: Record<string, number> = {};
          filteredIncomes.forEach((e) => {
            byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount);
          });
          return (
            <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Download size={14} className="text-emerald-500" />
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{currentMonthLabel} Summary</span>
              </div>
              <div className="flex flex-wrap gap-3 flex-1">
                {Object.entries(byCategory).map(([cat, amt]) => (
                  <span key={cat} className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getCategoryColor(cat)}`}>
                    {cat}: {formatNPR(amt)}
                  </span>
                ))}
              </div>
              <div className="text-sm font-bold text-zinc-900 border-l border-emerald-200 pl-4">
                Total: {formatNPR(filteredTotal)}
              </div>
            </div>
          );
        })()}

        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr className="border-b border-zinc-200">
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Code</th>
                <th className="px-4 py-3 text-left font-semibold">Category</th>
                <th className="px-4 py-3 text-right font-semibold">Amount (NPR)</th>
                <th className="px-4 py-3 text-center font-semibold">Vault Method</th>
                <th className="px-4 py-3 text-left font-semibold">Memo / Notes</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {filteredIncomes.length ? (
                filteredIncomes.map((e) => (
                  <tr key={e.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="px-4 py-3 text-zinc-600"><DualDateDisplay date={e.incomeDate} /></td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-550">{e.incomeCode}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryColor(e.category)}`}>
                        {e.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-zinc-900">{formatAmountOnly(Number(e.amount))}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 text-xs font-semibold">{e.paymentMethod}</span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-zinc-400 font-medium">{e.notes || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {/* View */}
                        <button
                          onClick={() => setViewIncome(e)}
                          className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                          title="View details"
                        >
                          <Eye size={14} />
                        </button>
                        {hasPermission(role as Role, "incomes", "edit") && (
                          <button
                            onClick={() => openEdit(e)}
                            className="p-1.5 text-zinc-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-all"
                            title="Edit income"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        {hasPermission(role as Role, "incomes", "delete") && (
                          <button
                            onClick={() => handleDelete(e.id, e.incomeCode)}
                            disabled={isPending}
                            className="p-1.5 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                            title="Delete income"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <div className="flex flex-col items-center gap-2 text-zinc-400">
                      <CalendarDays size={28} className="text-zinc-300" />
                      <p className="text-sm font-medium">No incomes found for {currentMonthLabel}</p>
                      <p className="text-xs">Try selecting a different month or log a new income.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {/* Totals footer row */}
            {filteredIncomes.length > 0 && (
              <tfoot className="border-t-2 border-zinc-200 bg-zinc-50">
                <tr>
                  <td colSpan={3} className="px-4 py-2.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    {selectedMonth === "all" ? "Grand Total" : `${currentMonthLabel} Total`}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-emerald-600 text-sm">
                    {formatAmountOnly(filteredTotal)}
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {/* Pagination Controls */}
        {pagination && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 mt-4 border-t pt-4">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Showing Page {pagination.page} of {Math.max(1, Math.ceil(pagination.total / pagination.pageSize))} (Total {pagination.total} records)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 2)}
                disabled={pagination.page === 1}
                className="h-9 w-9 p-0 border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page)}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                className="h-9 w-9 p-0 border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* ── View Details Modal ── */}
      {viewIncome && (
        <Dialog open={!!viewIncome} onOpenChange={() => setViewIncome(null)}>
          <DialogContent className="max-w-md bg-white border-zinc-200 rounded-2xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-zinc-900 font-bold flex items-center gap-2">
                <Eye size={16} className="text-emerald-500" /> Income Details
              </DialogTitle>
              <DialogDescription className="text-zinc-500 text-xs">
                Read-only view of recorded income entry.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Code</p>
                  <p className="text-sm font-mono font-bold text-emerald-600">{viewIncome.incomeCode}</p>
                </div>
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Date</p>
                  <p className="text-sm font-semibold text-zinc-800">{formatDate(viewIncome.incomeDate)}</p>
                </div>
              </div>
              <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Category</p>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryColor(viewIncome.category)}`}>
                  {viewIncome.category}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Amount</p>
                  <p className="text-base font-bold text-zinc-900">{formatNPR(Number(viewIncome.amount))}</p>
                </div>
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Payment Method</p>
                  <p className="text-sm font-semibold text-zinc-700">{viewIncome.paymentMethod}</p>
                </div>
              </div>
              <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Memo / Notes</p>
                <p className="text-sm text-zinc-600">{viewIncome.notes || "—"}</p>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-zinc-100">
              <Button variant="outline" onClick={() => setViewIncome(null)} className="border-zinc-300 text-zinc-700">
                <X size={14} className="mr-1" /> Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Edit Income Modal ── */}
      {editIncome && (
        <Dialog open={!!editIncome} onOpenChange={() => setEditIncome(null)}>
          <DialogContent className="max-w-md bg-white border-zinc-200 rounded-2xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-zinc-900 font-bold flex items-center gap-2">
                <Pencil size={16} className="text-amber-500" /> Edit Income — {editIncome.incomeCode}
              </DialogTitle>
              <DialogDescription className="text-zinc-500 text-xs">
                Update the details for this income entry.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Category</Label>
                <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className={selectClass}>
                  <option value="Commission">Commission</option>
                  <option value="Interest Received">Interest Received</option>
                  <option value="Rent Received">Rent Received</option>
                  <option value="Miscellaneous Incomes">Miscellaneous Incomes</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Amount (NPR)</Label>
                  <Input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="bg-white border-zinc-300 text-zinc-900 h-10 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Date</Label>
                  <Input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="bg-white border-zinc-300 text-zinc-900 h-10"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Payment Method</Label>
                <select value={editPayment} onChange={(e) => setEditPayment(e.target.value)} className={selectClass}>
                  <option value="CASH">CASH VAULT</option>
                  <option value="BANK">BANK ACCOUNT / TRANSFERS</option>
                  <option value="CHEQUE">CHEQUE DISBURSEMENT</option>
                  <option value="ESEWA">eSEWA TRANSFER</option>
                  <option value="KHALTI">KHALTI WALLET</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Notes / Memo</Label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Optional memo..."
                  className="w-full min-h-16 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
              <Button variant="outline" onClick={() => setEditIncome(null)} disabled={isPending} className="border-zinc-300 text-zinc-700">
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isPending} className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
                <Pencil size={13} className="mr-1" /> Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default IncomesPage;
