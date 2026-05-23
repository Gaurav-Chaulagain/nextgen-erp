"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { VendorLedgerEntrySchema } from "@/modules/purchase/types";

interface SupplierLedgerModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  supplierName?: string;
  supplierPan?: string;
  supplierPhone?: string;
  ledgerEntries?: VendorLedgerEntrySchema[];
}

export function SupplierLedgerModal({
  open: openProp,
  onOpenChange,
  supplierName = "",
  supplierPan = "",
  supplierPhone = "",
  ledgerEntries = [],
}: SupplierLedgerModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const open = openProp !== undefined ? openProp : internalOpen;
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    else setInternalOpen(v);
  };

  const filteredEntries = ledgerEntries.filter((entry) => {
    const entryDate = new Date(entry.entryDate);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;

    if (fromDate && entryDate < fromDate) return false;
    if (toDate && entryDate > toDate) return false;
    return true;
  });

  const handleDownloadPDF = () => {
    console.log("Downloading PDF for", supplierName);
  };

  const handleDownloadExcel = () => {
    console.log("Downloading Excel for", supplierName);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Supplier Ledger - {supplierName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Supplier Info */}
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-zinc-600">Name</p>
              <p className="font-semibold">{supplierName}</p>
            </div>
            <div>
              <p className="text-zinc-600">PAN</p>
              <p className="font-semibold">{supplierPan || "—"}</p>
            </div>
            <div>
              <p className="text-zinc-600">Phone</p>
              <p className="font-semibold">{supplierPhone || "—"}</p>
            </div>
          </div>

          {/* Date Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">From Date</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">To Date</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          {/* Ledger Table */}
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-100 dark:bg-zinc-900 border-b">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Date</th>
                  <th className="px-4 py-2 text-left font-semibold">Description</th>
                  <th className="px-4 py-2 text-right font-semibold">Debit</th>
                  <th className="px-4 py-2 text-right font-semibold">Credit</th>
                  <th className="px-4 py-2 text-right font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-center text-zinc-500">
                      No ledger entries
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                      <td className="px-4 py-2">{new Date(entry.entryDate).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-2">{entry.description}</td>
                      <td className="px-4 py-2 text-right">
                        {entry.debit !== "0" ? `NPR ${parseFloat(entry.debit).toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {entry.credit !== "0" ? `NPR ${parseFloat(entry.credit).toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold">
                        NPR {parseFloat(entry.balance).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleDownloadPDF}>
            Download PDF
          </Button>
          <Button variant="outline" onClick={handleDownloadExcel}>
            Download Excel
          </Button>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
