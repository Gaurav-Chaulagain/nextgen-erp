"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  fetchProfitLossAction,
  fetchTradingAccountAction,
  fetchBalanceSheetAction,
  fetchTrialBalanceDataAction,
  fetchSalesSummaryAction,
  fetchItemWiseSalesAction,
  fetchAgingReportAction,
  fetchProjectProfitabilityAction,
  fetchCashFlowAction,
  fetchPurchaseSummaryAction,
  fetchVendorOutstandingAction
} from "@/modules/accounting/actions";
import {
  fetchInvoiceByIdAction
} from "@/modules/sales/actions";
import {
  fetchPOByIdAction
} from "@/modules/purchase/actions";
import {
  exportProfitLossExcel,
  exportTradingAccountExcel,
  exportBalanceSheetExcel,
  exportTrialBalanceExcel,
  exportSalesSummaryExcel,
  exportItemWiseSalesExcel,
  exportAgingExcel,
  exportProjectProfitabilityExcel,
  exportCashFlowExcel,
  exportPurchaseSummaryExcel,
  exportVendorOutstandingExcel
} from "@/lib/export/reports-excel";
import {
  downloadProfitLossPDF,
  downloadTradingAccountPDF,
  downloadBalanceSheetPDF,
  downloadTrialBalancePDF,
  downloadAgingPDF,
  downloadProjectProfitabilityPDF,
  downloadCashFlowPDF,
  downloadSalesSummaryPDF,
  downloadItemWiseSalesPDF,
  downloadPurchaseSummaryPDF,
  downloadVendorOutstandingPDF
} from "@/lib/export/reports-pdf";

import { ProfitLossReport } from "./ProfitLossReport";
import { BalanceSheetReport } from "./BalanceSheetReport";
import { TradingAccountReport } from "./TradingAccountReport";
import { OutstandingAgingReport } from "./OutstandingAgingReport";
import { CashFlowReport } from "./CashFlowReport";

import { NPRAmount } from "@/components/shared/NPRAmount";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Download, RefreshCw, BarChart, ShoppingBag } from "lucide-react";
import { InvoicePreviewModal } from "@/components/sales/InvoicePreviewModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ReportViewerProps {
  reportKey: string;
  onBack: () => void;
}

export function ReportViewer({ reportKey, onBack }: ReportViewerProps) {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  // Detail view states
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [showPOPreview, setShowPOPreview] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Filters state
  const todayStr = new Date().toISOString().split("T")[0];
  const lastMonthStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [asOf, setAsOf] = useState<string>(todayStr);
  const [dateFrom, setDateFrom] = useState<string>(lastMonthStr);
  const [dateTo, setDateTo] = useState<string>(todayStr);
  const [channel, setChannel] = useState<string>("ALL");

  const handleViewInvoice = async (id: string) => {
    setLoadingDetail(true);
    try {
      const inv = await fetchInvoiceByIdAction(id);
      if (inv) {
        setSelectedInvoice(inv);
        setShowInvoicePreview(true);
      } else {
        toast.error("Invoice details not found");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load invoice details");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleViewPO = async (id: string) => {
    setLoadingDetail(true);
    try {
      const po = await fetchPOByIdAction(id);
      if (po) {
        setSelectedPO(po);
        setShowPOPreview(true);
      } else {
        toast.error("Purchase Order details not found");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load Purchase Order details");
    } finally {
      setLoadingDetail(false);
    }
  };

  // Fetch Report Data
  const generateReport = async () => {
    setLoading(true);
    setReportData(null);
    try {
      let res: any = null;
      switch (reportKey) {
        case "profit_loss":
          res = await fetchProfitLossAction(month, year);
          break;
        case "trading_account":
          res = await fetchTradingAccountAction(month, year);
          break;
        case "balance_sheet":
          res = await fetchBalanceSheetAction(asOf);
          break;
        case "trial_balance":
          res = await fetchTrialBalanceDataAction(asOf);
          break;
        case "sales_summary":
          res = await fetchSalesSummaryAction(dateFrom, dateTo, channel === "ALL" ? undefined : (channel as any));
          break;
        case "item_wise_sales":
          res = await fetchItemWiseSalesAction(dateFrom, dateTo);
          break;
        case "customer_aging":
          res = await fetchAgingReportAction();
          break;
        case "project_profitability":
          res = await fetchProjectProfitabilityAction();
          break;
        case "cash_flow":
          res = await fetchCashFlowAction(month, year);
          break;
        case "purchase_summary":
          res = await fetchPurchaseSummaryAction(dateFrom, dateTo);
          break;
        case "vendor_outstanding":
          res = await fetchVendorOutstandingAction();
          break;
        default:
          throw new Error("Invalid report key requested");
      }

      setReportData(res);
      toast.success("Analytical Report compiled successfully");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to compile reporting data");
    } finally {
      setLoading(false);
    }
  };

  // Run on mount for instant visual load
  useEffect(() => {
    generateReport();
  }, [reportKey]);

  // Excel triggers
  const triggerExcelDownload = () => {
    if (!reportData) return;
    try {
      let blob: Blob;
      let filename = `${reportKey}_report.xlsx`;
      switch (reportKey) {
        case "profit_loss":
          blob = exportProfitLossExcel(reportData);
          break;
        case "trading_account":
          blob = exportTradingAccountExcel(reportData);
          break;
        case "balance_sheet":
          blob = exportBalanceSheetExcel(reportData);
          break;
        case "trial_balance":
          blob = exportTrialBalanceExcel(reportData);
          break;
        case "sales_summary":
          blob = exportSalesSummaryExcel(reportData);
          break;
        case "item_wise_sales":
          blob = exportItemWiseSalesExcel(reportData);
          break;
        case "customer_aging":
          blob = exportAgingExcel(reportData);
          break;
        case "project_profitability":
          blob = exportProjectProfitabilityExcel(reportData);
          break;
        case "cash_flow":
          blob = exportCashFlowExcel(reportData);
          break;
        case "purchase_summary":
          blob = exportPurchaseSummaryExcel(reportData);
          break;
        case "vendor_outstanding":
          blob = exportVendorOutstandingExcel(reportData);
          break;
        default:
          return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      toast.success("Excel Spreadsheet statement downloaded");
    } catch (e) {
      toast.error("Failed to generate Excel download");
    }
  };

  // PDF triggers
  const triggerPDFDownload = async () => {
    if (!reportData) return;
    try {
      let blob: Blob;
      let filename = `${reportKey}_report.pdf`;
      switch (reportKey) {
        case "profit_loss":
          blob = await downloadProfitLossPDF(reportData);
          break;
        case "trading_account":
          blob = await downloadTradingAccountPDF(reportData);
          break;
        case "balance_sheet":
          blob = await downloadBalanceSheetPDF(reportData);
          break;
        case "trial_balance":
          blob = await downloadTrialBalancePDF(reportData);
          break;
        case "customer_aging":
          blob = await downloadAgingPDF(reportData);
          break;
        case "project_profitability":
          blob = await downloadProjectProfitabilityPDF(reportData);
          break;
        case "cash_flow":
          blob = await downloadCashFlowPDF(reportData);
          break;
        case "sales_summary":
          blob = await downloadSalesSummaryPDF(reportData);
          break;
        case "item_wise_sales":
          blob = await downloadItemWiseSalesPDF(reportData);
          break;
        case "purchase_summary":
          blob = await downloadPurchaseSummaryPDF(reportData);
          break;
        case "vendor_outstanding":
          blob = await downloadVendorOutstandingPDF(reportData);
          break;
        default:
          toast.error("PDF download not supported for this report type.");
          return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      toast.success("Certified A4 PDF statement downloaded");
    } catch (e) {
      toast.error("Failed to generate PDF document");
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Header bar */}
      <Card className="border border-zinc-100 shadow-sm rounded-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="px-4 py-2 border border-zinc-200 text-xs font-bold rounded-xl text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 transition-colors"
            >
              ← Back to Menu
            </button>
            <div>
              <h1 className="text-base font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide">
                Configure Report Filters
              </h1>
              <p className="text-xs text-zinc-400 font-medium">Select the boundaries to compile ledger logs.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Months filters */}
            {(reportKey === "profit_loss" || reportKey === "trading_account" || reportKey === "cash_flow") && (
              <div className="flex items-center gap-2">
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="px-3 py-2 border border-zinc-200 text-xs font-semibold rounded-xl dark:border-zinc-800 dark:bg-zinc-900 focus:outline-none"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("default", { month: "long" })}
                    </option>
                  ))}
                </select>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="px-3 py-2 border border-zinc-200 text-xs font-semibold rounded-xl dark:border-zinc-800 dark:bg-zinc-900 focus:outline-none"
                >
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* AsOf target date picker */}
            {(reportKey === "balance_sheet" || reportKey === "trial_balance") && (
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="text-zinc-400">As Of:</span>
                <input
                  type="date"
                  value={asOf}
                  onChange={(e) => setAsOf(e.target.value)}
                  className="px-3 py-2 border border-zinc-200 rounded-xl dark:border-zinc-800 dark:bg-zinc-900 focus:outline-none"
                />
              </div>
            )}

            {/* Date range filters */}
            {(reportKey === "sales_summary" || reportKey === "item_wise_sales" || reportKey === "purchase_summary") && (
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="text-zinc-400">From:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-2 border border-zinc-200 rounded-xl dark:border-zinc-800 dark:bg-zinc-900 focus:outline-none"
                />
                <span className="text-zinc-400">To:</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-2 border border-zinc-200 rounded-xl dark:border-zinc-800 dark:bg-zinc-900 focus:outline-none"
                />

                {reportKey === "sales_summary" && (
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="px-3 py-2 border border-zinc-200 rounded-xl dark:border-zinc-800 dark:bg-zinc-900 focus:outline-none"
                  >
                    <option value="ALL">All Channels</option>
                    <option value="RETAIL">Retail Only</option>
                    <option value="WHOLESALE">Wholesale Only</option>
                    <option value="PROJECT">Project Only</option>
                  </select>
                )}
              </div>
            )}

            <button
              onClick={generateReport}
              disabled={loading}
              className="px-4 py-2 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 text-xs font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              Run Query
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Downloader toolbar */}
      {reportData && !loading && (
        <div className="flex justify-end gap-3 animate-fade-in">
          {reportData && !loading && (
            <button
              onClick={triggerPDFDownload}
              className="px-4 py-2.5 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold rounded-2xl flex items-center gap-2 border border-zinc-200/40 dark:border-zinc-800/40 transition-colors"
            >
              <Download className="h-4.5 w-4.5 text-zinc-500" />
              Download A4 PDF Statement
            </button>
          )}

          <button
            onClick={triggerExcelDownload}
            className="px-4 py-2.5 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold rounded-2xl flex items-center gap-2 border border-zinc-200/40 dark:border-zinc-800/40 transition-colors"
          >
            <Download className="h-4.5 w-4.5 text-emerald-500" />
            Download Excel Spreadsheet
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-6">
          <div className="h-16 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-2xl w-full" />
          <div className="h-64 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-3xl w-full" />
        </div>
      )}

      {/* Compiled Reports Renders */}
      {!loading && reportData && (
        <div className="space-y-6 animate-fade-in">
          {reportKey === "profit_loss" && <ProfitLossReport data={reportData} />}
          {reportKey === "balance_sheet" && <BalanceSheetReport data={reportData} />}
          {reportKey === "trading_account" && <TradingAccountReport data={reportData} />}
          {reportKey === "customer_aging" && <OutstandingAgingReport data={reportData} />}
          {reportKey === "cash_flow" && <CashFlowReport data={reportData} />}

          {/* 4. TRIAL BALANCE */}
          {reportKey === "trial_balance" && (
            <Card className="border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 shadow-md rounded-3xl overflow-hidden">
              <div className="bg-zinc-900 text-zinc-100 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Analytical Trial Balance</h2>
                  <p className="text-xs text-zinc-400 font-medium mt-1">Aggregated Sum of accounts as of: {asOf}</p>
                </div>
                <div className="p-3 bg-zinc-800 rounded-2xl"><RefreshCw className="h-5 w-5 text-indigo-400" /></div>
              </div>
              <CardContent className="p-8">
                <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden text-sm font-semibold">
                  <div className="grid grid-cols-5 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <span>Account Code</span>
                    <span className="col-span-2">Account Name Particulars</span>
                    <span className="text-right">Debit Balance (Dr) (NPR)</span>
                    <span className="text-right">Credit Balance (Cr) (NPR)</span>
                  </div>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {reportData.rows.map((r: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-5 px-6 py-3.5 items-center">
                        <span className="text-xs font-bold text-zinc-400">{r.code}</span>
                        <span className="col-span-2 text-zinc-800 dark:text-zinc-200">{r.name} <span className="text-[10px] text-zinc-400">({r.type})</span></span>
                        <span className="text-right text-zinc-800 dark:text-zinc-200">{r.debit !== "0" ? <NPRAmount amount={Number(r.debit)} showCurrency={false} /> : "-"}</span>
                        <span className="text-right text-zinc-800 dark:text-zinc-200">{r.credit !== "0" ? <NPRAmount amount={Number(r.credit)} showCurrency={false} /> : "-"}</span>
                      </div>
                    ))}
                    <div className="grid grid-cols-5 px-6 py-5 items-center bg-zinc-50/50 dark:bg-zinc-900/30 font-extrabold border-t border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-xs">
                      <span>-</span>
                      <span className="col-span-2">TOTAL COMPREHENSIVE BALANCES</span>
                      <span className="text-right"><NPRAmount amount={Number(reportData.totals.debit)} showCurrency={false} /></span>
                      <span className="text-right"><NPRAmount amount={Number(reportData.totals.credit)} showCurrency={false} /></span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 5. SALES SUMMARY (Chronological log of individual Invoices) */}
          {reportKey === "sales_summary" && (
            <Card className="border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 shadow-md rounded-3xl overflow-hidden">
              <div className="bg-zinc-900 text-zinc-100 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Sales Chronological Log</h2>
                  <p className="text-xs text-zinc-400 font-medium mt-1">Taxable sales invoices between {dateFrom} and {dateTo}</p>
                </div>
                <div className="p-3 bg-zinc-800 rounded-2xl"><BarChart className="h-5 w-5 text-indigo-400" /></div>
              </div>
              <CardContent className="p-8">
                <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden text-sm font-semibold">
                  <div className="grid grid-cols-5 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <span>Date</span>
                    <span>Invoice Number</span>
                    <span>Customer Name</span>
                    <span className="text-right">Taxable Sales Amount (NPR)</span>
                    <span className="text-right">Action</span>
                  </div>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 max-h-[400px] overflow-y-auto">
                    {reportData.map((r: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-5 px-6 py-3.5 items-center">
                        <span className="text-zinc-800 dark:text-zinc-200">{r.date}</span>
                        <span className="font-mono text-zinc-800 dark:text-zinc-200">{r.invoiceNumber} <span className="text-[10px] text-zinc-400 font-bold font-sans uppercase">({r.channel})</span></span>
                        <span className="text-zinc-800 dark:text-zinc-200 truncate">{r.customerName}</span>
                        <span className="text-right text-zinc-900 dark:text-zinc-50"><NPRAmount amount={r.amount} showCurrency={false} /></span>
                        <div className="text-right">
                          <button
                            onClick={() => handleViewInvoice(r.id)}
                            disabled={loadingDetail}
                            className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200 text-xs rounded-lg border border-zinc-200/40 dark:border-zinc-800/40 font-bold transition-all disabled:opacity-50"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                    {reportData.length === 0 && (
                      <div className="p-8 text-center text-zinc-400 col-span-5">No invoices found in this period.</div>
                    )}
                  </div>
                  <div className="grid grid-cols-5 px-6 py-5 items-center bg-zinc-50/50 dark:bg-zinc-900/30 font-extrabold border-t border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-xs">
                    <span>RUNNING BALANCE TOTAL</span>
                    <span>-</span>
                    <span>{reportData.length} Invoices</span>
                    <span className="text-right text-zinc-900 dark:text-zinc-50"><NPRAmount amount={reportData.reduce((acc: number, curr: any) => acc + curr.amount, 0)} showCurrency={false} /></span>
                    <span>-</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 6. ITEM-WISE SALES */}
          {reportKey === "item_wise_sales" && (
            <Card className="border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 shadow-md rounded-3xl overflow-hidden">
              <div className="bg-zinc-900 text-zinc-100 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Product Sales Volumes & Profits</h2>
                  <p className="text-xs text-zinc-400 font-medium mt-1">Item-wise sales performance breakdown</p>
                </div>
                <div className="p-3 bg-zinc-800 rounded-2xl"><ShoppingBag className="h-5 w-5 text-indigo-400" /></div>
              </div>
              <CardContent className="p-8">
                <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden text-sm font-semibold">
                  <div className="grid grid-cols-6 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <span>Code</span>
                    <span className="col-span-2">Product Description Name</span>
                    <span className="text-right">Qty Sold</span>
                    <span className="text-right">Sales Revenue (NPR)</span>
                    <span className="text-right">Direct Net Profit (NPR)</span>
                  </div>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {reportData.map((r: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-6 px-6 py-3.5 items-center">
                        <span className="text-xs font-bold text-zinc-400">{r.code}</span>
                        <span className="col-span-2 text-zinc-800 dark:text-zinc-200">{r.name}</span>
                        <span className="text-right text-zinc-800 dark:text-zinc-200">{r.quantity}</span>
                        <span className="text-right text-zinc-800 dark:text-zinc-200"><NPRAmount amount={r.revenue} showCurrency={false} /></span>
                        <span className="text-right text-emerald-600 dark:text-emerald-400 font-bold"><NPRAmount amount={r.profit} showCurrency={false} /></span>
                      </div>
                    ))}
                    {reportData.length === 0 && (
                      <div className="p-8 text-center text-zinc-400">No product sales mapped in this period.</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}



          {/* 10. PROJECT PROFITABILITY */}
          {reportKey === "project_profitability" && (
            <Card className="border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 shadow-md rounded-3xl overflow-hidden">
              <div className="bg-zinc-900 text-zinc-100 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Projects Contract Profitability Summary</h2>
                  <p className="text-xs text-zinc-400 font-medium mt-1">Milestones billed vs material consumption job costing margins</p>
                </div>
                <div className="p-3 bg-zinc-800 rounded-2xl"><RefreshCw className="h-5 w-5 text-indigo-400" /></div>
              </div>
              <CardContent className="p-8">
                <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden text-sm font-semibold">
                  <div className="grid grid-cols-8 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <span>PRJ Code</span>
                    <span className="col-span-2">Project contract Name</span>
                    <span className="text-right">Contract Amt (NPR)</span>
                    <span className="text-right">Total Billed (NPR)</span>
                    <span className="text-right">Material Cost (NPR)</span>
                    <span className="text-right">Gross Profit (NPR)</span>
                    <span className="text-right">Margin %</span>
                  </div>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {reportData.map((r: any, idx: number) => {
                      const isHigh = r.margin >= 20;
                      const isLow = r.margin < 10;
                      return (
                        <div key={idx} className="grid grid-cols-8 px-6 py-3.5 items-center">
                          <span className="text-xs font-bold text-zinc-400">{r.code}</span>
                          <div className="col-span-2 pr-4">
                            <span className="text-zinc-800 dark:text-zinc-200 block truncate">{r.name}</span>
                            <span className="text-[10px] text-zinc-400 font-medium block">Client: {r.clientName}</span>
                          </div>
                          <span className="text-right text-zinc-800 dark:text-zinc-200"><NPRAmount amount={r.contractAmount} showCurrency={false} /></span>
                          <span className="text-right text-zinc-800 dark:text-zinc-200"><NPRAmount amount={r.totalBilled} showCurrency={false} /></span>
                          <span className="text-right text-rose-600 dark:text-rose-400"><NPRAmount amount={r.materialCost} showCurrency={false} /></span>
                          <span className="text-right text-zinc-900 dark:text-zinc-50"><NPRAmount amount={r.profit} showCurrency={false} /></span>
                          <span className={`text-right font-extrabold ${isHigh ? "text-emerald-600 dark:text-emerald-400" : isLow ? "text-rose-600 dark:text-rose-400" : "text-amber-500"}`}>
                            {r.margin.toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* 12. PURCHASE SUMMARY (Chronological log of individual Purchase Orders) */}
          {reportKey === "purchase_summary" && (
            <Card className="border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 shadow-md rounded-3xl overflow-hidden">
              <div className="bg-zinc-900 text-zinc-100 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Purchase Chronological Log</h2>
                  <p className="text-xs text-zinc-400 font-medium mt-1">Procurement purchase orders between {dateFrom} and {dateTo}</p>
                </div>
                <div className="p-3 bg-zinc-800 rounded-2xl"><BarChart className="h-5 w-5 text-indigo-400" /></div>
              </div>
              <CardContent className="p-8">
                <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden text-sm font-semibold">
                  <div className="grid grid-cols-5 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <span>Date</span>
                    <span>PO Number</span>
                    <span>Vendor Name</span>
                    <span className="text-right">Purchase Amount (NPR)</span>
                    <span className="text-right">Action</span>
                  </div>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 max-h-[400px] overflow-y-auto">
                    {reportData.map((r: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-5 px-6 py-3.5 items-center">
                        <span className="text-zinc-800 dark:text-zinc-200">{r.date}</span>
                        <span className="font-mono text-zinc-800 dark:text-zinc-200">{r.poNumber}</span>
                        <span className="text-zinc-800 dark:text-zinc-200 truncate">{r.vendorName}</span>
                        <span className="text-right text-zinc-900 dark:text-zinc-50"><NPRAmount amount={r.amount} showCurrency={false} /></span>
                        <div className="text-right">
                          <button
                            onClick={() => handleViewPO(r.id)}
                            disabled={loadingDetail}
                            className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200 text-xs rounded-lg border border-zinc-200/40 dark:border-zinc-800/40 font-bold transition-all disabled:opacity-50"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                    {reportData.length === 0 && (
                      <div className="p-8 text-center text-zinc-400 col-span-5">No purchase orders found in this period.</div>
                    )}
                  </div>
                  <div className="grid grid-cols-5 px-6 py-5 items-center bg-zinc-50/50 dark:bg-zinc-900/30 font-extrabold border-t border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-xs">
                    <span>RUNNING BALANCE TOTAL</span>
                    <span>-</span>
                    <span>{reportData.length} Purchase Orders</span>
                    <span className="text-right text-zinc-900 dark:text-zinc-50"><NPRAmount amount={reportData.reduce((acc: number, curr: any) => acc + curr.amount, 0)} showCurrency={false} /></span>
                    <span>-</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

      {/* Invoice Preview Modal */}
      {selectedInvoice && showInvoicePreview && (
        <InvoicePreviewModal
          open={showInvoicePreview}
          onOpenChange={setShowInvoicePreview}
          invoice={selectedInvoice}
        />
      )}

      {/* Premium Purchase Order Detail Dialog */}
      <Dialog open={showPOPreview} onOpenChange={setShowPOPreview}>
        <DialogContent className="w-[98vw] max-w-[98vw] h-[95vh] flex flex-col overflow-y-auto bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
          <DialogHeader className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
            <div className="flex justify-between items-center pr-6">
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                <ShoppingBag size={20} className="text-blue-500" /> Purchase Order Details: <span className="font-mono text-zinc-500">{selectedPO?.poNumber}</span>
              </DialogTitle>
              {selectedPO && (
                <Badge className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 px-3 py-1 font-semibold rounded-full shadow-none text-[10px]">
                  {selectedPO.status}
                </Badge>
              )}
            </div>
            <DialogDescription className="sr-only">Detailed view of products requested and received status</DialogDescription>
          </DialogHeader>

          {selectedPO ? (
            <div className="space-y-6 pt-4 flex-grow flex flex-col">
              {/* Header Overview Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-zinc-50/50 dark:bg-zinc-900/30 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Supplier Particulars</h3>
                  <div className="font-bold text-zinc-900 dark:text-zinc-200">{selectedPO.supplierName}</div>
                  {selectedPO.supplierPanNumber && <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">PAN: {selectedPO.supplierPanNumber}</div>}
                  {selectedPO.supplierPhone && <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Phone: {selectedPO.supplierPhone}</div>}
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Procurement Schedule</h3>
                  <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Order Date: <span className="text-zinc-900 dark:text-zinc-200 font-bold">{formatDate(selectedPO.orderDate)}</span></div>
                  <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Expected: <span className="text-zinc-900 dark:text-zinc-200 font-bold">{selectedPO.expectedDate ? formatDate(selectedPO.expectedDate) : "—"}</span></div>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Accounts Summary</h3>
                  <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Net total: <span className="text-zinc-900 dark:text-zinc-100 font-bold"><NPRAmount amount={Number(selectedPO.totalAmount)} /></span></div>
                  <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Paid so far: <span className="text-zinc-550 dark:text-zinc-400 font-bold"><NPRAmount amount={Number(selectedPO.paidAmount)} /></span></div>
                  <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Remaining Balance: <span className="text-amber-600 dark:text-amber-500 font-extrabold"><NPRAmount amount={Number(selectedPO.balance)} /></span></div>
                </div>
              </div>

              {/* Items Table */}
              <div className="flex-grow">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">Requested items</h3>
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-sm text-zinc-800 dark:text-zinc-300">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider">
                        <th className="px-5 py-3">Code</th>
                        <th className="px-5 py-3">Product Name</th>
                        <th className="px-5 py-3 text-right">Ordered Qty</th>
                        <th className="px-5 py-3 text-right">Received Qty</th>
                        <th className="px-5 py-3 text-right">Unit Price (NPR)</th>
                        <th className="px-5 py-3 text-right">Total (NPR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-850 text-zinc-800 dark:text-zinc-300 font-medium">
                      {selectedPO.items.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                          <td className="px-5 py-3 font-mono text-xs text-zinc-500">{item.productCode}</td>
                          <td className="px-5 py-3 text-zinc-900 dark:text-zinc-200">{item.productName}</td>
                          <td className="px-5 py-3 text-right">{item.orderedQty} <span className="text-xs text-zinc-500 font-sans">{item.productUnit}</span></td>
                          <td className="px-5 py-3 text-right text-emerald-600 dark:text-emerald-400">{item.receivedQty} <span className="text-xs text-zinc-500 font-sans">{item.productUnit}</span></td>
                          <td className="px-5 py-3 text-right"><NPRAmount amount={Number(item.unitPrice)} showCurrency={false} /></td>
                          <td className="px-5 py-3 text-right text-zinc-900 dark:text-zinc-200"><NPRAmount amount={Number(item.totalPrice)} showCurrency={false} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payments History section if any */}
              {selectedPO.payments && selectedPO.payments.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">Bookkept Payments</h3>
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-sm text-zinc-800 dark:text-zinc-300">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider">
                          <th className="px-5 py-3">Payment Date</th>
                          <th className="px-5 py-3">Method</th>
                          <th className="px-5 py-3">Notes / Ref</th>
                          <th className="px-5 py-3 text-right">Amount Paid (NPR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-850 text-zinc-800 dark:text-zinc-300 font-medium">
                        {selectedPO.payments.map((p: any, idx: number) => (
                          <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                            <td className="px-5 py-3 text-zinc-650 dark:text-zinc-400">{formatDate(p.paymentDate)}</td>
                            <td className="px-5 py-3">
                              <Badge variant="outline" className="border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] shadow-none">
                                {p.paymentMethod}
                              </Badge>
                            </td>
                            <td className="px-5 py-3 text-zinc-650 dark:text-zinc-400 text-xs italic">{p.notes || "No notes"}</td>
                            <td className="px-5 py-3 text-right text-zinc-900 dark:text-zinc-200 font-bold"><NPRAmount amount={Number(p.amount)} showCurrency={false} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No purchase order selected.</p>
          )}

          <DialogFooter className="border-t border-zinc-150 dark:border-zinc-800 pt-3">
            <Button variant="outline" className="border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => setShowPOPreview(false)}>
              Close View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* 13. VENDOR OUTSTANDING PAYABLES */}
          {reportKey === "vendor_outstanding" && (
            <Card className="border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 shadow-md rounded-3xl overflow-hidden">
              <div className="bg-zinc-900 text-zinc-100 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Vendor Outstanding Payables</h2>
                  <p className="text-xs text-zinc-400 font-medium mt-1">Outstanding balances owed to suppliers/creditors</p>
                </div>
                <div className="p-3 bg-zinc-800 rounded-2xl"><RefreshCw className="h-5 w-5 text-rose-400" /></div>
              </div>
              <CardContent className="p-8">
                <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden text-sm font-semibold">
                  <div className="grid grid-cols-4 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <span>Vendor Code</span>
                    <span className="col-span-2">Vendor / Supplier Particulars</span>
                    <span className="text-right">Outstanding Balance (NPR)</span>
                  </div>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {reportData.map((r: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-4 px-6 py-3.5 items-center">
                        <span className="text-xs font-bold text-zinc-400">{r.code}</span>
                        <span className="col-span-2 text-zinc-800 dark:text-zinc-200">
                          {r.name} <span className="text-[10px] text-zinc-400 font-medium">(PAN: {r.pan})</span>
                        </span>
                        <span className="text-right text-rose-600 font-bold"><NPRAmount amount={r.balance} showCurrency={false} /></span>
                      </div>
                    ))}
                    {reportData.length === 0 && (
                      <div className="p-8 text-center text-zinc-400">No outstanding vendor balances.</div>
                    )}
                    <div className="grid grid-cols-4 px-6 py-5 items-center bg-zinc-50/50 dark:bg-zinc-900/30 font-extrabold border-t border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-xs">
                      <span>-</span>
                      <span className="col-span-2">TOTAL OUTSTANDING AP</span>
                      <span className="text-right text-rose-600"><NPRAmount amount={reportData.reduce((acc: number, curr: any) => acc + curr.balance, 0)} showCurrency={false} /></span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
