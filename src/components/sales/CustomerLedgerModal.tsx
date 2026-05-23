"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNPR } from "@/lib/utils";
import type { CustomerLedgerEntrySchema } from "@/modules/sales/types";

interface CustomerLedgerModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  customerName?: string;
  entries?: CustomerLedgerEntrySchema[];
}

export function CustomerLedgerModal({ open: openProp, onOpenChange, customerName = "", entries = [] }: CustomerLedgerModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [channel, setChannel] = useState("ALL");

  const open = openProp ?? internalOpen;
  const setOpen = (value: boolean) => {
    onOpenChange?.(value);
    if (openProp === undefined) setInternalOpen(value);
  };

  const filteredEntries = useMemo(
    () => entries.filter((entry) => channel === "ALL" || entry.channelType === channel),
    [channel, entries]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-screen max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Ledger - {customerName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="sm:w-56">
              <label className="text-sm font-medium">Channel</label>
              <select value={channel} onChange={(event) => setChannel(event.target.value)} className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
                <option value="ALL">All</option>
                <option value="RETAIL">Retail</option>
                <option value="WHOLESALE">Wholesale</option>
                <option value="PROJECT">Project</option>
              </select>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-3">
              <Input type="date" aria-label="From date" />
              <Input type="date" aria-label="To date" />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Channel</th>
                  <th className="px-4 py-2 text-right">Debit</th>
                  <th className="px-4 py-2 text-right">Credit</th>
                  <th className="px-4 py-2 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredEntries.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-zinc-500">No ledger entries</td></tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-4 py-2">{new Date(entry.entryDate).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-2">{entry.description}</td>
                      <td className="px-4 py-2">{entry.channelType}</td>
                      <td className="px-4 py-2 text-right">{entry.debit !== "0" ? formatNPR(Number(entry.debit)) : "-"}</td>
                      <td className="px-4 py-2 text-right">{entry.credit !== "0" ? formatNPR(Number(entry.credit)) : "-"}</td>
                      <td className="px-4 py-2 text-right font-semibold">{formatNPR(Number(entry.balance))}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline">Export PDF</Button>
          <Button variant="outline">Export Excel</Button>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
