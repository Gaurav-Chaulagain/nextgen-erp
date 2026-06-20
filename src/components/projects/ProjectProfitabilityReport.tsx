"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNepaliNumber } from "@/lib/utils";
import type { ProjectProfitabilitySchema } from "@/modules/projects/types";
import { FileText, Calculator, Search, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface ProjectProfitabilityReportProps {
  projects: ProjectProfitabilitySchema[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  searchQuery: string;
}

export function ProjectProfitabilityReport({
  projects,
  pagination,
  searchQuery,
}: ProjectProfitabilityReportProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync local search state with searchQuery prop when it changes
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const urlSearch = searchParams.get("search") ?? "";
    if (localSearch === urlSearch) {
      return;
    }

    const timer = setTimeout(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      if (localSearch) {
        current.set("search", localSearch);
      } else {
        current.delete("search");
      }
      current.set("page", "1"); // Reset to page 1 on search
      router.push(`${pathname}?${current.toString()}`);
    }, 350);

    return () => clearTimeout(timer);
  }, [localSearch, pathname, router, searchParams]);

  const handlePageChange = (pageIndex: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("page", String(pageIndex + 1));
    router.push(`${pathname}?${current.toString()}`);
  };

  const formatNumberOnly = (amount: number | string) => {
    const val = Number(amount) || 0;
    const parts = val.toFixed(2).split(".");
    return `${formatNepaliNumber(Number(parts[0]))}.${parts[1]}`;
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rowsHtml = projects
      .map((p) => {
        const matCost = Number(p.totalCost);
        const transport = Number((p as any).transportCost || 0);
        const labor = Number((p as any).labourCost || 0);
        const misc = Number((p as any).miscCost || 0);
        const profit = Number(p.contractAmount) - Number(p.totalBilled);
        const margin = Number(p.contractAmount) > 0 ? (profit / Number(p.contractAmount)) * 100 : 0;

        return `
        <tr style="border-bottom: 1px solid #e4e4e7; font-size: 11px;">
          <td style="padding: 8px; font-family: monospace;">${p.projectCode}</td>
          <td style="padding: 8px; font-weight: bold;">${p.projectName}</td>
          <td style="padding: 8px;">${p.clientName}</td>
          <td style="padding: 8px; text-align: right;">${formatNumberOnly(Number(p.contractAmount))}</td>
          <td style="padding: 8px; text-align: right;">${formatNumberOnly(Number(p.totalBilled))}</td>
          <td style="padding: 8px; text-align: right;">${formatNumberOnly(matCost)}</td>
          <td style="padding: 8px; text-align: right;">${formatNumberOnly(transport)}</td>
          <td style="padding: 8px; text-align: right;">${formatNumberOnly(labor)}</td>
          <td style="padding: 8px; text-align: right;">${formatNumberOnly(misc)}</td>
          <td style="padding: 8px; text-align: right; font-weight: bold; color: ${profit >= 0 ? "#15803d" : "#b91c1c"};">
            ${formatNumberOnly(profit)}
          </td>
          <td style="padding: 8px; text-align: right; font-weight: bold; color: ${margin >= 20 ? "#15803d" : margin >= 10 ? "#b45309" : "#b91c1c"};">
            ${margin.toFixed(1)}%
          </td>
        </tr>
      `;
      })
      .join("");

    const totalContract = projects.reduce((sum, p) => sum + Number(p.contractAmount), 0);
    const totalBilled = projects.reduce((sum, p) => sum + Number(p.totalBilled), 0);
    const totalMatCost = projects.reduce((sum, p) => sum + Number(p.totalCost), 0);
    const totalTransport = projects.reduce((sum, p) => sum + Number((p as any).transportCost || 0), 0);
    const totalLabor = projects.reduce((sum, p) => sum + Number((p as any).labourCost || 0), 0);
    const totalMisc = projects.reduce((sum, p) => sum + Number((p as any).miscCost || 0), 0);

    const cumulativeProfit = totalContract - totalBilled;
    const cumulativeMargin = totalContract > 0 ? (cumulativeProfit / totalContract) * 100 : 0;

    printWindow.document.write(`
      <html>
        <head>
          <title>NextGen ERP - Project Profitability Report</title>
          <style>
            @page { size: landscape; margin: 12mm; }
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #18181b; }
            .header { text-align: center; border-bottom: 2px solid #18181b; padding-bottom: 12px; margin-bottom: 24px; }
            .header h1 { margin: 0; font-size: 20px; }
            .header p { margin: 4px 0 0 0; font-size: 12px; color: #71717a; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; table-layout: fixed; }
            th { background-color: #f4f4f5; text-align: left; padding: 10px 6px; font-size: 10px; text-transform: uppercase; border-bottom: 2px solid #d4d4d8; word-wrap: break-word; }
            td { padding: 10px 6px; font-size: 10px; word-wrap: break-word; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>NextGen Interior And WaterProofing</h1>
            <p>PAN: 122782202 | Phone: 9843146474 | Gauradaha-02, Jhapa, Nepal</p>
            <h2 style="font-size: 15px; margin-top: 14px; text-transform: uppercase; letter-spacing: 1px;">Project Profitability Matrix</h2>
          </div>
          <table style="width: 100%;">
            <thead>
              <tr>
                <th style="width: 5%;">Code</th>
                <th style="width: 25%;">Project Name</th>
                <th style="width: 10%;">Client</th>
                <th style="width: 9%; text-align: right;">Contract<br><span style="font-size: 8px; font-weight: normal; color: #71717a;">(NPR)</span></th>
                <th style="width: 9%; text-align: right;">Billed (Rev)<br><span style="font-size: 8px; font-weight: normal; color: #71717a;">(NPR)</span></th>
                <th style="width: 8%; text-align: right;">Material Cost<br><span style="font-size: 8px; font-weight: normal; color: #71717a;">(NPR)</span></th>
                <th style="text-align: right; width: 7%;">Transport<br><span style="font-size: 8px; font-weight: normal; color: #71717a;">(NPR)</span></th>
                <th style="text-align: right; width: 7%;">Labor<br><span style="font-size: 8px; font-weight: normal; color: #71717a;">(NPR)</span></th>
                <th style="text-align: right; width: 7%;">Misc<br><span style="font-size: 8px; font-weight: normal; color: #71717a;">(NPR)</span></th>
                <th style="width: 8%; text-align: right;">Net Profit<br><span style="font-size: 8px; font-weight: normal; color: #71717a;">(NPR)</span></th>
                <th style="width: 5%; text-align: right;">Net Margin</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr style="border-top: 2px solid #18181b; background-color: #fafafa; font-weight: bold; font-size: 10px;">
                <td colspan="3" style="padding: 10px 6px;">CUMULATIVE TOTALS</td>
                <td style="padding: 10px 6px; text-align: right;">${formatNumberOnly(totalContract)}</td>
                <td style="padding: 10px 6px; text-align: right;">${formatNumberOnly(totalBilled)}</td>
                <td style="padding: 10px 6px; text-align: right;">${formatNumberOnly(totalMatCost)}</td>
                <td style="padding: 10px 6px; text-align: right;">${formatNumberOnly(totalTransport)}</td>
                <td style="padding: 10px 6px; text-align: right;">${formatNumberOnly(totalLabor)}</td>
                <td style="padding: 10px 6px; text-align: right;">${formatNumberOnly(totalMisc)}</td>
                <td style="padding: 10px 6px; text-align: right; color: ${cumulativeProfit >= 0 ? "#15803d" : "#b91c1c"};">
                  ${formatNumberOnly(cumulativeProfit)}
                </td>
                <td style="padding: 10px 6px; text-align: right; color: ${cumulativeMargin >= 20 ? "#15803d" : cumulativeMargin >= 10 ? "#b45309" : "#b91c1c"};">
                  ${cumulativeMargin.toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintProject = (p: ProjectProfitabilitySchema) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const matCost = Number(p.totalCost);
    const transport = Number((p as any).transportCost || 0);
    const labor = Number((p as any).labourCost || 0);
    const misc = Number((p as any).miscCost || 0);
    const totalExpenses = matCost + transport + labor + misc;
    const profit = Number(p.contractAmount) - Number(p.totalBilled);
    const margin = Number(p.contractAmount) > 0 ? (profit / Number(p.contractAmount)) * 100 : 0;

    printWindow.document.write(`
      <html>
        <head>
          <title>NextGen ERP - Project P&L - ${p.projectCode}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #18181b; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #18181b; padding-bottom: 12px; margin-bottom: 24px; }
            .header h1 { margin: 0; font-size: 20px; }
            .header p { margin: 4px 0 0 0; font-size: 12px; color: #71717a; }
            .doc-title { font-size: 15px; margin-top: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
            
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 30px; background: #fafafa; border: 1px solid #e4e4e7; padding: 16px; border-radius: 12px; }
            .meta-item { font-size: 12px; line-height: 1.6; }
            .meta-label { font-weight: bold; color: #71717a; width: 120px; display: inline-block; }
            
            .pl-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            .pl-table th { background-color: #f4f4f5; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #d4d4d8; }
            .pl-table td { padding: 12px; border-bottom: 1px solid #e4e4e7; }
            
            .category-row { font-weight: bold; background-color: #fcfcfc; font-size: 13px; color: #27272a; border-bottom: 2px solid #e4e4e7; }
            .indent { padding-left: 28px !important; color: #52525b; }
            .total-row { font-weight: bold; background-color: #fafafa; border-top: 2px solid #18181b; font-size: 13px; }
            .profit-row { font-weight: bold; background-color: #f0fdf4; border-top: 2px solid #15803d; font-size: 14px; color: #15803d; }
            .loss-row { font-weight: bold; background-color: #fef2f2; border-top: 2px solid #b91c1c; font-size: 14px; color: #b91c1c; }
            
            .right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>NextGen Interior And WaterProofing</h1>
            <p>PAN: 122782202 | Phone: 9843146474 | Gauradaha-02, Jhapa, Nepal</p>
            <div class="doc-title">Project Profit & Loss Statement</div>
          </div>
          
          <div class="meta-grid">
            <div class="meta-item">
              <div><span class="meta-label">Project Code:</span> <strong>${p.projectCode}</strong></div>
              <div><span class="meta-label">Project Name:</span> <strong>${p.projectName}</strong></div>
              <div><span class="meta-label">Client Name:</span> ${p.clientName}</div>
            </div>
            <div class="meta-item">
              <div><span class="meta-label">Start Date:</span> ${p.startDate ? new Date(p.startDate).toLocaleDateString("en-IN") : "—"}</div>
              <div><span class="meta-label">Deadline:</span> ${p.endDate ? new Date(p.endDate).toLocaleDateString("en-IN") : "—"}</div>
              <div><span class="meta-label">Project Status:</span> <strong>${p.status}</strong></div>
            </div>
          </div>
          
          <table class="pl-table">
            <thead>
              <tr>
                <th>Particulars</th>
                <th class="right">Amount (NPR)</th>
              </tr>
            </thead>
            <tbody>
              <!-- Revenue Section -->
              <tr class="category-row">
                <td colspan="2">1. REVENUE</td>
              </tr>
              <tr>
                <td class="indent">Contract Amount (Total Budget)</td>
                <td class="right">${formatNumberOnly(p.contractAmount)}</td>
              </tr>
              <tr>
                <td class="indent">Billed Revenue (Milestone Billings Raised)</td>
                <td class="right">${formatNumberOnly(p.totalBilled)}</td>
              </tr>
              
              <!-- Cost Section -->
              <tr class="category-row">
                <td colspan="2">2. DIRECT EXPENSES / COSTS</td>
              </tr>
              <tr>
                <td class="indent">Material Cost (Dispatched Goods)</td>
                <td class="right">${formatNumberOnly(matCost)}</td>
              </tr>
              <tr>
                <td class="indent">Transportation Cost</td>
                <td class="right">${formatNumberOnly(transport)}</td>
              </tr>
              <tr>
                <td class="indent">Labour Cost</td>
                <td class="right">${formatNumberOnly(labor)}</td>
              </tr>
              <tr>
                <td class="indent">Miscellaneous Cost</td>
                <td class="right">${formatNumberOnly(misc)}</td>
              </tr>
              <tr class="total-row">
                <td>Total Expenses (Material + Logistics)</td>
                <td class="right">${formatNumberOnly(totalExpenses)}</td>
              </tr>
              
              <!-- Profitability Section -->
              <tr class="${profit >= 0 ? "profit-row" : "loss-row"}">
                <td>NET PROFIT (Contract Value - Total Billed)</td>
                <td class="right">${formatNumberOnly(profit)}</td>
              </tr>
              <tr class="${profit >= 0 ? "profit-row" : "loss-row"}" style="border-top: none;">
                <td>NET MARGIN (%)</td>
                <td class="right">${margin.toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
          
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between w-full max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search profitability matrix..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 h-9 w-full rounded-xl bg-zinc-50 border-zinc-200 focus:bg-white dark:bg-zinc-900/40 dark:border-zinc-800"
          />
        </div>
      </div>

      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-dashed">
        <div className="flex items-center gap-2">
          <Calculator className="h-4.5 w-4.5 text-zinc-500" />
          <p className="text-xs text-zinc-500 font-medium">
            This matrix displays material, transport, labour, and miscellaneous costs dynamically fetched from issued supplies.
          </p>
        </div>
        <Button onClick={handlePrint} variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Print Report (PDF)
        </Button>
      </div>

      <div className="rounded-2xl border bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 uppercase tracking-wider text-[10px]">
              <TableHead className="font-bold">Code</TableHead>
              <TableHead className="font-bold">Project</TableHead>
              <TableHead className="font-bold">Client</TableHead>
              <TableHead className="text-right font-bold">
                <div>Contract</div>
                <div className="text-[8px] text-zinc-400 dark:text-zinc-500 font-normal mt-0.5">(NPR)</div>
              </TableHead>
              <TableHead className="text-right font-bold">
                <div>Billed (Rev)</div>
                <div className="text-[8px] text-zinc-400 dark:text-zinc-500 font-normal mt-0.5">(NPR)</div>
              </TableHead>
              <TableHead className="text-right font-bold">
                <div>Mat. Cost</div>
                <div className="text-[8px] text-zinc-400 dark:text-zinc-500 font-normal mt-0.5">(NPR)</div>
              </TableHead>
              <TableHead className="text-right font-bold">
                <div>Transport</div>
                <div className="text-[8px] text-zinc-400 dark:text-zinc-500 font-normal mt-0.5">(NPR)</div>
              </TableHead>
              <TableHead className="text-right font-bold">
                <div>Labor</div>
                <div className="text-[8px] text-zinc-400 dark:text-zinc-500 font-normal mt-0.5">(NPR)</div>
              </TableHead>
              <TableHead className="text-right font-bold">
                <div>Misc</div>
                <div className="text-[8px] text-zinc-400 dark:text-zinc-500 font-normal mt-0.5">(NPR)</div>
              </TableHead>
              <TableHead className="text-right font-bold">
                <div>Net Profit</div>
                <div className="text-[8px] text-zinc-400 dark:text-zinc-500 font-normal mt-0.5">(NPR)</div>
              </TableHead>
              <TableHead className="text-right font-bold">Net Margin</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p) => {
              const matCost = Number(p.totalCost);
              const transport = Number((p as any).transportCost || 0);
              const labor = Number((p as any).labourCost || 0);
              const misc = Number((p as any).miscCost || 0);
              const profit = Number(p.contractAmount) - Number(p.totalBilled);
              const margin = Number(p.contractAmount) > 0 ? (profit / Number(p.contractAmount)) * 100 : 0;

              return (
                <TableRow key={p.projectId} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 text-xs">
                  <TableCell className="font-mono">{p.projectCode}</TableCell>
                  <TableCell className="font-semibold text-zinc-900 dark:text-zinc-50">{p.projectName}</TableCell>
                  <TableCell className="text-zinc-500">{p.clientName}</TableCell>
                  <TableCell className="text-right font-semibold text-blue-600 dark:text-blue-400">
                    {formatNumberOnly(p.contractAmount)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-indigo-600 dark:text-indigo-400">
                    {formatNumberOnly(p.totalBilled)}
                  </TableCell>
                  <TableCell className="text-right text-purple-600 dark:text-purple-400 font-medium">
                    {formatNumberOnly(matCost)}
                  </TableCell>
                  <TableCell className="text-right text-zinc-700 dark:text-zinc-300 font-medium">
                    {formatNumberOnly(transport)}
                  </TableCell>
                  <TableCell className="text-right text-zinc-700 dark:text-zinc-300 font-medium">
                    {formatNumberOnly(labor)}
                  </TableCell>
                  <TableCell className="text-right text-zinc-700 dark:text-zinc-300 font-medium">
                    {formatNumberOnly(misc)}
                  </TableCell>
                  <TableCell className={`text-right font-bold ${profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
                    {formatNumberOnly(profit)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        margin >= 20
                          ? "font-bold text-green-600 dark:text-green-400"
                          : margin >= 10
                          ? "font-bold text-amber-600 dark:text-amber-400"
                          : "font-bold text-red-600"
                      }
                    >
                      {margin.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900"
                      onClick={() => handlePrintProject(p)}
                      title="Download Project P&L PDF"
                    >
                      <Download className="h-4.5 w-4.5 text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 mt-4">
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
    </div>
  );
}
