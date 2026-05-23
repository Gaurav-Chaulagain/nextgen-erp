"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { PurchaseOrderItemSchema } from "@/modules/purchase/types";

interface ReceiveGoodsModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  poItems?: PurchaseOrderItemSchema[];
  poNumber?: string;
}

export function ReceiveGoodsModal({ open: openProp, onOpenChange, poItems = [], poNumber = "" }: ReceiveGoodsModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [receiving, setReceiving] = useState<Record<string, number>>({});

  const open = openProp !== undefined ? openProp : internalOpen;
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    else setInternalOpen(v);
  };

  const handleReceive = (itemId: string, qty: number) => {
    setReceiving((prev) => ({ ...prev, [itemId]: qty }));
  };

  const handleSubmit = async () => {
    try {
      // Call receiveGoods action
      console.log("Receiving goods:", receiving);
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error receiving goods");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Receive Goods - {poNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {poItems.length === 0 ? (
            <p className="text-sm text-zinc-500">No items to receive</p>
          ) : (
            <div className="border rounded-lg divide-y">
              {poItems.map((item) => (
                <div key={item.id} className="p-4 flex items-end gap-4">
                  <div className="flex-1">
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-sm text-zinc-500">{item.productCode}</p>
                  </div>
                  <div className="flex gap-4 items-end">
                    <div>
                      <label className="text-xs text-zinc-600">Ordered</label>
                      <p className="font-semibold">{item.orderedQty}</p>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-600">Received</label>
                      <p className="font-semibold">{item.receivedQty}</p>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-600">Receiving Now</label>
                      <Input
                        type="number"
                        max={item.orderedQty - item.receivedQty}
                        min={0}
                        defaultValue={0}
                        onChange={(e) => handleReceive(item.id, parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-600">Unit</label>
                      <p>{item.productUnit}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Confirm Receipt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
