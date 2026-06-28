"use client";

import React, { useState, useTransition } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createIncome } from '@/modules/incomes/actions';
import { toast } from 'sonner';
import { DualDatePicker } from '@/components/shared/DualDatePicker';
import { Plus, CreditCard, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AddIncomeModalProps {
  userId: string;
}

export function AddIncomeModal({ userId }: AddIncomeModalProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("Commission");
  const [amount, setAmount] = useState("");
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<any>("CASH");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid income amount");
      return;
    }
    if (!incomeDate) {
      toast.error("Please select an income date");
      return;
    }

    startTransition(async () => {
      try {
        await createIncome({
          category: category as any,
          amount: Number(amount),
          incomeDate: new Date(incomeDate),
          paymentMethod,
          notes: notes || undefined
        }, userId);

        toast.success("Operating income logged successfully! Cash book entry posted.");
        setOpen(false);
        setAmount("");
        setNotes("");
        router.refresh();
      } catch (err: any) {
        toast.error("Error: " + (err.message || "Failed to log income"));
      }
    });
  };

  const selectClass = "w-full h-10 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-450/50 focus:border-emerald-400";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md border-none transition-all">
          <Plus size={16} /> Log Income
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md border-zinc-200 bg-white text-zinc-900 rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <CreditCard size={18} className="text-emerald-500" /> Log Operating Income
          </DialogTitle>
          <DialogDescription className="text-zinc-500 text-xs mt-0.5">
            Record a daily operations inflow (e.g. Commission, Interest, Rent, Miscellaneous). This immediately increments the selected vault cash balance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Income Category *</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={selectClass}
            >
              <option value="Commission">Commission</option>
              <option value="Interest Received">Interest Received</option>
              <option value="Rent Received">Rent Received</option>
              <option value="Miscellaneous Incomes">Miscellaneous Incomes</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Amount (NPR) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white border-zinc-300 text-zinc-900 h-10 font-mono focus:ring-emerald-400/50 focus:border-emerald-400"
              />
            </div>

            <div>
              <DualDatePicker
                label="Payment Date"
                value={incomeDate}
                onChange={(date) => setIncomeDate(date.toISOString().split("T")[0])}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="paymentMethod" className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Deposit Vault *</Label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className={selectClass}
            >
              <option value="CASH">CASH VAULT</option>
              <option value="BANK">BANK ACCOUNT / TRANSFERS</option>
              <option value="CHEQUE">CHEQUE DISBURSEMENT</option>
              <option value="ESEWA">eSEWA TRANSFER</option>
              <option value="KHALTI">KHALTI WALLET</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Income Notes / Memo</Label>
            <textarea
              id="notes"
              placeholder="e.g. Commission from supplier, interest received from deposit, etc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-16 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-450/50 focus:border-emerald-400"
            />
          </div>
        </div>

        <DialogFooter className="border-t border-zinc-100 pt-4 flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-md border-none"
          >
            <Save size={14} className="mr-1" /> Log Operation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddIncomeModal;
