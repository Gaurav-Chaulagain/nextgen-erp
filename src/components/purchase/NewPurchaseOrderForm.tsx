"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface LineItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export function NewPurchaseOrderForm() {
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [poDate, setPoDate] = useState(new Date().toISOString().split("T")[0]);
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const total = subtotal - discount + tax;

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Math.random().toString(),
        productId: "",
        productName: "",
        quantity: 1,
        unit: "PC",
        unitPrice: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<LineItem>) => {
    setItems(items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      // Call action to save draft
      console.log("Saving draft:", { supplierId, poDate, items, discount, tax });
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error saving draft");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ New Purchase Order</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Header Section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Supplier</label>
                <Input
                  placeholder="Select supplier"
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">PO Date</label>
                <Input type="date" value={poDate} onChange={(e) => setPoDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Expected Delivery</label>
                <Input
                  type="date"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Payment Terms</label>
                <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            {/* Line Items Section */}
            <div className="border rounded p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Line Items</h3>
                <Button variant="outline" size="sm" onClick={addItem}>
                  + Add Item
                </Button>
              </div>

              {items.length === 0 ? (
                <p className="text-sm text-zinc-500">No items added yet</p>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-2 items-end">
                      <Input placeholder="Product" value={item.productName} className="flex-1" />
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                        className="w-20"
                      />
                      <Input placeholder="Unit" value={item.unit} className="w-20" />
                      <Input
                        type="number"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                        className="w-28"
                      />
                      <span className="font-semibold w-28 text-right">
                        NPR {(item.quantity * item.unitPrice).toLocaleString("en-IN")}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals Section */}
            <div className="border rounded p-4 space-y-2 bg-zinc-50 dark:bg-zinc-900">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>NPR {subtotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <label>Discount:</label>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-32"
                />
              </div>
              <div className="flex justify-between items-center">
                <label>Tax:</label>
                <Input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  className="w-32"
                />
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span>NPR {total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDraft} disabled={saving}>
              {saving ? "Saving..." : "Save Draft"}
            </Button>
            <Button disabled={saving}>
              {saving ? "Submitting..." : "Submit Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
