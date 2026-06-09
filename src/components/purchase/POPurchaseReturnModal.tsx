"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCcw, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { formatAmountOnly } from "@/lib/utils";
import { createPurchaseReturn, getProductStockLevels } from "@/modules/purchase/actions";
import type { PurchaseOrderSchema } from "@/modules/purchase/types";

interface POPurchaseReturnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  po: PurchaseOrderSchema;
  userId: string;
}

export function POPurchaseReturnModal({ open, onOpenChange, po, userId }: POPurchaseReturnModalProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [items, setItems] = useState<Array<{ productId: string; qty: number; unitPrice: number }>>([]);
  const [stockLevels, setStockLevels] = useState<Record<string, number>>({});
  const [loadingStock, setLoadingStock] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Load stock levels for items in the PO
  useEffect(() => {
    if (open && po.items.length > 0) {
      (async () => {
        setLoadingStock(true);
        try {
          const productIds = po.items.map((i) => i.productId);
          const levels = await getProductStockLevels(productIds);
          setStockLevels(levels || {});
        } catch (err) {
          console.error("Failed to load stock levels", err);
          toast.error("Failed to retrieve inventory stock counts.");
        } finally {
          setLoadingStock(false);
        }
      })();
    }
  }, [open, po]);

  const addItem = () => {
    if (po.items.length === 0) return;
    
    // Find first item that hasn't been added yet (or just default to first)
    const availableItem = po.items.find(pi => !items.some(it => it.productId === pi.productId)) || po.items[0];
    const defaultPrice = parseFloat(availableItem.unitPrice || "0");

    setItems([
      ...items,
      {
        productId: availableItem.productId,
        qty: 1,
        unitPrice: defaultPrice,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, updates: any) => {
    setItems(items.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  };

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.error("Please specify a reason for this return");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one item to return");
      return;
    }

    // Validation checks
    for (const item of items) {
      const poItem = po.items.find((pi) => pi.productId === item.productId);
      const stockQty = stockLevels[item.productId] ?? 0;
      const receivedQty = poItem?.receivedQty ?? 0;

      if (item.qty > receivedQty) {
        toast.error(`Cannot return quantity ${item.qty} of "${poItem?.productName}". Max received is ${receivedQty}.`);
        return;
      }
      if (item.qty > stockQty) {
        toast.error(`Cannot return quantity ${item.qty} of "${poItem?.productName}". Current stock is only ${stockQty}.`);
        return;
      }
    }

    startTransition(async () => {
      try {
        await createPurchaseReturn({
          supplierId: po.supplierId,
          notes: `[PO Return: ${po.poNumber}] ${reason}`,
          items: items.map(itm => ({
            productId: itm.productId,
            qty: Number(itm.qty),
            unitPrice: Number(itm.unitPrice)
          }))
        }, userId);

        toast.success("Purchase return recorded successfully! Dues decremented.");
        onOpenChange(false);
        setReason("");
        setItems([]);
        router.refresh();
      } catch (err: any) {
        toast.error("Error: " + (err.message || "Failed to log return"));
      }
    });
  };

  const totalReturnAmt = items.reduce((sum, itm) => sum + itm.qty * itm.unitPrice, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-[98vw] h-[95vh] flex flex-col overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
        <DialogHeader className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
          <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <RefreshCcw size={20} className="text-orange-500" /> Log PO Purchase Return (PRN)
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Log a return shipment specifically linked to Purchase Order <strong className="text-zinc-900 dark:text-zinc-200">{po.poNumber}</strong>. Mapped items automatically pull original cost rates (CP) and current stock balances.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto py-4 space-y-5 pr-1">
          {/* Locked Supplier Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Linked Supplier</span>
              <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{po.supplierName}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Purchase Order Ref</span>
              <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 font-mono">{po.poNumber}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">PO Receipt Status</span>
              <div>
                <Badge variant="outline" className="border-zinc-300 dark:border-zinc-800 text-zinc-650 dark:text-zinc-300 shadow-none text-[10px] py-0">
                  {po.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Reason Field */}
          <div className="space-y-1.5 p-1">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider uppercase block">Return Cause / Remarks *</label>
            <Input
              placeholder="e.g. Broken packaging, wrong variant delivered, parts missing..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100"
            />
          </div>

          {/* Items Section */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 bg-zinc-50/20 dark:bg-zinc-900/10">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-150 dark:border-zinc-800">
              <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                Returned Materials (Restricted to PO items)
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={addItem}
                disabled={po.items.length === 0 || loadingStock}
                className="border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <Plus size={14} className="mr-1" /> Add Return Line
              </Button>
            </div>

            {loadingStock ? (
              <div className="text-center py-8 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                <p className="text-sm text-zinc-500 italic">Querying real-time inventory balances...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/20 dark:bg-zinc-950/20">
                <p className="text-sm text-zinc-500 italic">No lines added yet. Click &quot;Add Return Line&quot; to begin material dispatch.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => {
                  const poItem = po.items.find((pi) => pi.productId === item.productId);
                  const stockQty = stockLevels[item.productId] ?? 0;
                  const receivedQty = poItem?.receivedQty ?? 0;
                  const originalPrice = parseFloat(poItem?.unitPrice || "0");

                  const isQtyExceededStock = item.qty > stockQty;
                  const isQtyExceededPO = item.qty > receivedQty;

                  return (
                    <div key={index} className="grid grid-cols-12 gap-3 items-start p-4 border border-zinc-200 dark:border-zinc-800/60 rounded-xl bg-white dark:bg-zinc-950/40 relative">
                      {/* Product Selector */}
                      <div className="col-span-12 sm:col-span-4">
                        <label className="text-[10px] font-semibold text-zinc-500 block mb-1">Product *</label>
                        <select
                          value={item.productId}
                          onChange={(e) => {
                            const newProductId = e.target.value;
                            const matched = po.items.find(pi => pi.productId === newProductId);
                            const price = parseFloat(matched?.unitPrice || "0");
                            updateItem(index, { productId: newProductId, unitPrice: price });
                          }}
                          className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        >
                          {po.items.map((pi) => (
                            <option key={pi.productId} value={pi.productId}>
                              [{pi.productCode}] {pi.productName}
                            </option>
                          ))}
                        </select>
                        {poItem && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            <span className="text-[9px] bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 px-1 py-0.5 rounded font-mono">
                              PO: {poItem.orderedQty} ordered / {receivedQty} received
                            </span>
                            <span className={`text-[9px] px-1 py-0.5 rounded font-mono ${
                              stockQty === 0 ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            }`}>
                              Stock: {stockQty} {poItem.productUnit}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Qty to Return */}
                      <div className="col-span-6 sm:col-span-3">
                        <label className="text-[10px] font-semibold text-zinc-500 block mb-1">Qty to Return *</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={item.qty}
                          min={1}
                          onChange={(e) => updateItem(index, { qty: Math.max(1, parseInt(e.target.value) || 0) })}
                          className={`h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 text-xs ${
                            isQtyExceededStock || isQtyExceededPO ? "border-rose-500 focus:ring-rose-500/50" : ""
                          }`}
                        />
                        {isQtyExceededPO && (
                          <div className="mt-1 text-[9px] text-rose-600 flex items-center gap-0.5">
                            <AlertCircle size={10} /> Max received: {receivedQty}
                          </div>
                        )}
                        {!isQtyExceededPO && isQtyExceededStock && (
                          <div className="mt-1 text-[9px] text-rose-600 flex items-center gap-0.5">
                            <AlertCircle size={10} /> Exceeds stock ({stockQty})
                          </div>
                        )}
                      </div>

                      {/* Returned Rate Cost */}
                      <div className="col-span-6 sm:col-span-3">
                        <label className="text-[10px] font-semibold text-zinc-500 block mb-1">Returned Rate Cost *</label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={item.unitPrice === 0 ? "" : item.unitPrice}
                          onChange={(e) => updateItem(index, { unitPrice: Math.max(0, parseFloat(e.target.value) || 0) })}
                          className="h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 text-xs"
                        />
                        {poItem && (
                          <div className="mt-1.5 text-[9px] text-zinc-500 font-mono">
                            Orig. Cost: NPR {formatAmountOnly(originalPrice)}
                          </div>
                        )}
                      </div>

                      {/* Remove Line */}
                      <div className="col-span-12 sm:col-span-2 flex justify-end pt-5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-rose-600 dark:text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sum Summary */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-900/30 border-dashed space-y-1 text-sm">
            <div className="flex justify-between font-bold text-base text-zinc-800 dark:text-zinc-100">
              <span>Estimated Ledger Debit Deductions:</span>
              <span className="text-orange-600 dark:text-orange-500">{formatAmountOnly(totalReturnAmt)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-zinc-150 dark:border-zinc-800 pt-4 flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || items.length === 0 || loadingStock}
            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold shadow-md border-none"
          >
            {isPending ? "Reconciling..." : "Confirm Return Shipment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
