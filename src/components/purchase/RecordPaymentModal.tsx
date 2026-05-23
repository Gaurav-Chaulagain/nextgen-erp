"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface RecordPaymentModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  total?: number;
  paidAmount?: number;
  poNumber?: string;
}

export function RecordPaymentModal({
  open: openProp,
  onOpenChange,
  total = 0,
  paidAmount = 0,
  poNumber = "",
}: RecordPaymentModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const open = openProp !== undefined ? openProp : internalOpen;
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    else setInternalOpen(v);
  };

  const balance = total - paidAmount;

  const handleSubmit = async () => {
    try {
      if (amount <= 0 || amount > balance) {
        alert("Invalid payment amount");
        return;
      }
      // Call recordPurchasePayment action
      console.log("Recording payment:", { amount, paymentMethod, date, reference, notes });
      setOpen(false);
      setAmount(0);
    } catch (err) {
      console.error(err);
      alert("Error recording payment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment - {poNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-600">Total:</span>
              <span className="font-semibold">NPR {total.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Previously Paid:</span>
              <span>NPR {paidAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Balance Due:</span>
              <span className="font-semibold text-orange-600">NPR {balance.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Payment Amount *</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              max={balance}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Payment Method *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CHEQUE">Cheque</option>
              <option value="CASH">Cash</option>
              <option value="ESEWA">eSewa</option>
              <option value="KHALTI">Khalti</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Payment Date *</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium">Reference / Cheque #</label>
            <Input value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Record Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
