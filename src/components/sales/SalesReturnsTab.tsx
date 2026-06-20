"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatAmountOnly } from "@/lib/utils";
import { ReturnActions } from "./ReturnActions";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface SalesReturnsTabProps {
  returns: any[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  searchQuery: string;
  userId?: string;
}

export function SalesReturnsTab({ returns: initialReturns, pagination, searchQuery, userId }: SalesReturnsTabProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [returns, setReturns] = useState<any[]>(initialReturns);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync prop changes to state
  useEffect(() => {
    setReturns(initialReturns);
  }, [initialReturns]);

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

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Sales Returns Log</h2>
          <p className="text-sm text-zinc-500">Distinct Red-themed Return Notes (SRN-XXXX) tracking re-credited inventory stock and digital cash book payouts.</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
        <Input
          placeholder="Search by SRN # or customer..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-10 h-10 rounded-xl border-zinc-200 dark:border-zinc-800"
        />
      </div>

      <div className="space-y-6">
        {returns.length ? (
          returns.map((r: any) => (
            <div key={r.id} className="rounded-xl border border-red-100 bg-red-50/20 p-5 dark:border-red-950/40 dark:bg-red-950/10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-red-100/60 pb-3 dark:border-red-950/20 mb-3">
                <div>
                  <span className="inline-flex items-center rounded-lg bg-red-100 px-3 py-1 font-mono text-xs font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
                    {r.returnNumber}
                  </span>
                  <span className="ml-3 text-xs text-zinc-500 font-medium">
                    Date: {new Date(r.returnDate).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-zinc-500 font-semibold">
                    Original Invoice: <span className="font-mono text-zinc-800 dark:text-zinc-200">{r.invoice?.invoiceNumber ?? "—"}</span>
                  </span>
                  <span className="text-xs text-zinc-500 font-semibold flex items-center gap-1.5">
                    Refund Method: <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300 font-mono text-[10px]">{r.refundMethod}</Badge>
                  </span>
                  <Badge className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 text-[10px] font-bold px-2 py-0.5">{r.status}</Badge>
                  <ReturnActions returnId={r.id} />
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-zinc-650 dark:text-zinc-350">
                  <thead>
                    <tr className="border-b border-red-100/40 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <th className="px-3 py-1.5 text-left">Product Name</th>
                      <th className="px-3 py-1.5 text-left">Warehouse</th>
                      <th className="px-3 py-1.5 text-right">Qty</th>
                      <th className="px-3 py-1.5 text-right">Rate (NPR)</th>
                      <th className="px-3 py-1.5 text-right">Total Price (NPR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100/20 font-medium">
                    {r.items?.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 text-zinc-800 dark:text-zinc-200">{item.product?.name}</td>
                        <td className="px-3 py-2 text-zinc-550">{item.warehouse?.name}</td>
                        <td className="px-3 py-2 text-right">{item.qty}</td>
                        <td className="px-3 py-2 text-right">{formatAmountOnly(Number(item.unitPrice))}</td>
                        <td className="px-3 py-2 text-right text-zinc-800 dark:text-zinc-200">{formatAmountOnly(Number(item.totalPrice))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 pt-3 border-t border-red-100/40 dark:border-red-950/20 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 text-xs">
                <div className="text-zinc-500 max-w-md">
                  <span className="font-semibold text-zinc-750 dark:text-zinc-350">Reason:</span> {r.notes || "No reason specified."}
                </div>
                {(() => {
                  const originalVatPercent = r.invoice?.vatPercent ? Number(r.invoice.vatPercent) : 0;
                  const hasVat = originalVatPercent > 0;
                  const totalAmount = Number(r.totalAmount);
                  const subtotal = hasVat ? totalAmount / (1 + originalVatPercent / 100) : totalAmount;
                  const vatAmount = totalAmount - subtotal;
                  
                  return (
                    <div className="text-right space-y-1 ml-auto font-medium text-zinc-600 dark:text-zinc-400">
                      {hasVat && (
                        <>
                          <div>Subtotal: <span className="text-zinc-900 dark:text-zinc-100">{formatAmountOnly(subtotal)}</span></div>
                          <div>VAT ({originalVatPercent}%): <span className="text-zinc-900 dark:text-zinc-100">{formatAmountOnly(vatAmount)}</span></div>
                        </>
                      )}
                      <div className="font-bold text-red-700 dark:text-red-300 text-sm pt-1">
                        Total Credit: {formatAmountOnly(totalAmount)}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed p-10 text-center text-sm text-zinc-500">
            {localSearch ? `No sales returns found matching "${localSearch}"` : "No Sales Returns found."}
          </div>
        )}
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
              className="h-9 w-9 p-0 border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-750 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              className="h-9 w-9 p-0 border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-750 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

export default SalesReturnsTab;
