"use client";

import React from "react";
import { formatNPR } from "@/lib/utils";
import { Check } from "lucide-react";

interface PendingPaymentItem {
  id: string;
  vendorName: string;
  poNumber: string;
  amountDue: string;
  dueDate: string;
  daysOverdue: number;
}

interface PendingPaymentsWidgetProps {
  payments: PendingPaymentItem[];
}

export function PendingPaymentsWidget({ payments }: PendingPaymentsWidgetProps) {
  const items = payments.map((p) => ({
    id: p.id,
    poNumber: p.poNumber,
    supplierName: p.vendorName,
    amount: Number(p.amountDue),
    expectedDate: p.dueDate,
    isOverdue: p.daysOverdue > 0,
  }));

  return (
    <div className="w-full rounded-xl border bg-card p-6 font-sans">
      <div className="pb-4">
        <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-50 tracking-wider flex items-center gap-2">
          Accounts Payable Dues
        </h3>
        <p className="text-xs text-zinc-650 font-bold dark:text-zinc-350 mt-1">
          Overdue purchase payments owed to suppliers/creditors
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-4 flex flex-col gap-2 w-full md:max-w-md"
          >
            {/* Row 1 — PO number: */}
            <span className="text-xs text-muted-foreground font-mono">
              {item.poNumber}
            </span>

            {/* Row 2 — Full supplier name (NO truncation): */}
            <p className="text-sm font-semibold leading-snug">
              {item.supplierName}
            </p>

            {/* Row 3 — Amount and due status: */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold">
                  {formatNPR(item.amount)}
                </span>
                <span className="text-xs text-muted-foreground">
                  Expected: {item.expectedDate}
                </span>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                item.isOverdue 
                  ? "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400" 
                  : "bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
              }`}>
                {item.isOverdue ? "Overdue" : "Due Soon"}
              </span>
            </div>
          </div>
        ))}

        {payments.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-2">
            <span className="p-2.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-full border border-emerald-150">
              <Check className="h-4.5 w-4.5 stroke-[2.5]" />
            </span>
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
              All supplier payables clear.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
