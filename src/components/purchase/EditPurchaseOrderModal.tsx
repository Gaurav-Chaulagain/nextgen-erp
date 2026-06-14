"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getPurchaseLookups, updatePurchaseOrder } from "@/modules/purchase/actions";
import { ShoppingBag, Loader2, Calendar, FileText, Plus, Trash2 } from "lucide-react";
import { DualDatePicker } from "@/components/shared/DualDatePicker";
import { ProductAutocomplete } from "@/components/shared/ProductAutocomplete";
import type { PurchaseOrderSchema } from "@/modules/purchase/types";

interface EditPurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  po: PurchaseOrderSchema;
  userId: string;
}

export function EditPurchaseOrderModal({ isOpen, onClose, onSuccess, po, userId }: EditPurchaseOrderModalProps) {
  const router = useRouter();
  const [supplierId, setSupplierId] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [notes, setNotes] = useState("");
  const [itemsState, setItemsState] = useState<
    Array<{
      id: string;
      productId: string;
      productName: string;
      productCode: string;
      productUnit: string;
      orderedQty: number;
      unitPrice: number;
      conversionFactor: number;
      orderedUnit: string;
      notes: string;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [lookupsLoading, setLookupsLoading] = useState(false);

  // Lookups data
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (po && isOpen) {
      setSupplierId(po.supplierId);
      setExpectedDelivery(po.expectedDate ? po.expectedDate.split("T")[0] : "");
      setNotes(po.notes || "");
      setItemsState(
        po.items ? po.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          productCode: item.productCode,
          productUnit: item.productBaseUnit || item.productUnit,
          orderedQty: item.orderedQty,
          unitPrice: parseFloat(item.unitPrice),
          conversionFactor: item.conversionFactor || 1,
          orderedUnit: item.orderedUnit || item.productUnit,
          notes: item.notes || "",
        })) : []
      );
    }
  }, [po, isOpen]);

  const handleProductChange = (index: number, selectedProductId: string) => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const variant = product.variants?.find((v: any) => v.supplierId === supplierId);
    const basePrice = variant ? Number(variant.purchasePrice) : 0;
    const defaultUnit = product.purchaseUnit || product.unit;
    const factor = product.purchaseUnit ? Number(product.purchaseConversionFactor) : 1;
    const unitPrice = basePrice * factor;

    const updated = [...itemsState];
    updated[index] = {
      ...updated[index],
      productId: selectedProductId,
      productName: product.name,
      productCode: product.code,
      productUnit: product.unit,
      orderedUnit: defaultUnit,
      conversionFactor: factor,
      unitPrice: unitPrice,
    };
    setItemsState(updated);
  };

  const handleAddItem = () => {
    setItemsState([
      ...itemsState,
      {
        id: "",
        productId: "",
        productName: "",
        productCode: "",
        productUnit: "PCS",
        orderedQty: 1,
        unitPrice: 0,
        conversionFactor: 1,
        orderedUnit: "PCS",
        notes: "",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItemsState(itemsState.filter((_, idx) => idx !== index));
  };

  // Fetch lookups when the form opens
  useEffect(() => {
    if (isOpen) {
      (async () => {
        try {
          setLookupsLoading(true);
          const res = await getPurchaseLookups();
          setSuppliers(res.suppliers || []);
          setProducts(res.products || []);
        } catch (err) {
          console.error("Failed to load PO lookups", err);
          toast.error("Failed to load supplier dropdown data.");
        } finally {
          setLookupsLoading(false);
        }
      })();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!supplierId) {
      toast.error("Please select a supplier/vendor");
      return;
    }

    if (po.status === "DRAFT") {
      if (itemsState.length === 0) {
        toast.error("Please add at least one line item");
        return;
      }
      if (itemsState.some((item) => !item.productId)) {
        toast.error("Please select a product for all line items");
        return;
      }
    }

    setLoading(true);
    try {
      await updatePurchaseOrder(
        po.id,
        {
          supplierId,
          expectedDate: expectedDelivery ? new Date(expectedDelivery) : undefined,
          notes: notes || undefined,
          items: po.status === "DRAFT" ? itemsState.map((item) => ({
            id: item.id || undefined,
            productId: item.productId,
            orderedQty: item.orderedQty,
            unitPrice: item.unitPrice,
            orderedUnit: item.orderedUnit as any,
            conversionFactor: item.conversionFactor,
            notes: item.notes || undefined,
          })) : undefined,
        },
        userId
      );

      toast.success(`Purchase Order ${po.poNumber} updated successfully!`);
      onSuccess();
      onClose();
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update Purchase Order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-xl rounded-2xl p-6 bg-white text-zinc-900 border border-zinc-200 shadow-xl">
        <DialogHeader className="border-b pb-3 border-zinc-150">
          <DialogTitle className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <ShoppingBag size={20} className="text-blue-600" />
            Edit Purchase Order — <span className="font-mono text-zinc-500">{po?.poNumber}</span>
          </DialogTitle>
          <DialogDescription className="text-zinc-500 text-xs mt-0.5">
            Update supplier vendor profile, delivery expected date, and notes for this purchase order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 tracking-wider uppercase block">Supplier / Vendor *</label>
            {lookupsLoading ? (
              <div className="h-10 rounded-md border border-zinc-300 bg-zinc-50 flex items-center justify-center text-zinc-400 text-xs">
                <Loader2 className="h-4.5 w-4.5 animate-spin mr-1.5" /> Loading vendors...
              </div>
            ) : (
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full h-10 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 shadow-sm"
                disabled={loading}
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <DualDatePicker
              label="Expected Delivery Date"
              value={expectedDelivery || undefined}
              onChange={(date) => setExpectedDelivery(date.toISOString().split("T")[0])}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 tracking-wider uppercase block">Notes / Terms</label>
            <Input
              placeholder="Purchase terms, special shipping instructions, delivery coordinator..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              className="bg-white border-zinc-300 text-zinc-900 h-10 shadow-sm focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>

          {po.status === "DRAFT" && (
            <div className="space-y-2 pt-2 flex flex-col">
              <div className="flex justify-between items-center border-b pb-1.5 border-zinc-150">
                <label className="text-xs font-semibold text-zinc-500 tracking-wider uppercase block">
                  Order Line Items
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="h-7 px-2 text-xs flex items-center gap-1 border-zinc-350 hover:bg-zinc-50"
                >
                  <Plus size={12} /> Add Item
                </Button>
              </div>
              
              {itemsState.length === 0 ? (
                <div className="text-center py-4 border border-dashed border-zinc-350 rounded-xl bg-zinc-50/20">
                  <p className="text-xs text-zinc-400 italic">No line items added yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                  {itemsState.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2.5 items-end p-3 border border-zinc-200 rounded-xl bg-zinc-50/20 relative shadow-sm hover:border-zinc-300 transition-colors"
                    >
                      {/* Product Autocomplete */}
                      <div className="col-span-12 sm:col-span-5">
                        <label className="text-[9px] font-semibold text-zinc-500 block mb-0.5">Product *</label>
                        <ProductAutocomplete
                          products={products}
                          value={item.productId}
                          onChange={(productId) => handleProductChange(idx, productId)}
                          placeholder="Search product..."
                        />
                      </div>
                      
                      {/* Quantity */}
                      <div className="col-span-4 sm:col-span-2">
                        <label className="text-[9px] font-semibold text-zinc-500 block mb-0.5">Qty</label>
                        <Input
                          type="number"
                          step="any"
                          value={item.orderedQty}
                          onChange={(e) => {
                            const updated = [...itemsState];
                            updated[idx].orderedQty = Math.max(0.0001, parseFloat(e.target.value) || 0);
                            setItemsState(updated);
                          }}
                          min={0.0001}
                          disabled={loading}
                          className="h-9 text-xs bg-white border-zinc-300 text-zinc-900 text-center"
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="col-span-5 sm:col-span-3">
                        <label className="text-[9px] font-semibold text-zinc-500 block mb-0.5">Price (NPR)</label>
                        <Input
                          type="number"
                          step="any"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const updated = [...itemsState];
                            updated[idx].unitPrice = Math.max(0, parseFloat(e.target.value) || 0);
                            setItemsState(updated);
                          }}
                          min={0}
                          disabled={loading}
                          className="h-9 text-xs font-mono bg-white border-zinc-300 text-center"
                        />
                      </div>

                      {/* Delete Button */}
                      <div className="col-span-3 sm:col-span-2 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-rose-600 hover:text-rose-750 hover:bg-rose-50 border border-rose-100 rounded-lg"
                          disabled={loading}
                          onClick={() => handleRemoveItem(idx)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 border-t pt-4 border-zinc-150 flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading} className="h-10 px-4 rounded-xl font-bold">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="h-10 px-5 rounded-xl font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 bg-blue-600 text-white hover:bg-blue-700 border-none"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditPurchaseOrderModal;
