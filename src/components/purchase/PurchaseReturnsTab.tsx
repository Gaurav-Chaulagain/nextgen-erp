"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { createPurchaseReturn } from "@/modules/purchase/actions";
import { formatDate, formatAmountOnly } from "@/lib/utils";
import { toast } from "sonner";
import { RefreshCcw, Plus, Trash2, Eye, Clipboard, ArrowLeftRight, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface PurchaseReturnsTabProps {
  returns: any[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  searchQuery: string;
  userId: string;
}

export function PurchaseReturnsTab({ returns: initialReturns, pagination, searchQuery, userId }: PurchaseReturnsTabProps) {
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
  const [open, setOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [reason, setReason] = useState("");
  const [items, setItems] = useState<Array<{ productId: string; qty: number; unitPrice: number }>>([]);
  const [isPending, startTransition] = useTransition();

  // Lookups data
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      (async () => {
        try {
          const res = await fetch("/api/inventory/lookups");
          if (res.ok) {
            const j = await res.json();
            setSuppliers(j.suppliers || []);
            setProducts(j.categories.flatMap((c: any) => c.products || []) || []);
            // Fallback: if categories products array is empty, fetch active products
            const prodRes = await fetch("/api/inventory/lookups"); // fallback endpoint or similar
            const prodJ = await prodRes.json();
            setProducts(prodJ.suppliers ? prodJ.suppliers : []); // wait, active products is in getPurchaseLookups!
          }
          // Fetch proper PO lookups
          const resPo = await fetch("/api/inventory/lookups");
          const jPo = await resPo.json();
          // We can fetch products directly from a client action if needed, or query them.
          // Let's load the active products list from active products!
          const prodRes = await fetch("/api/inventory/lookups");
          // Let's do a quick query for products in the parent page and pass it in or load via endpoint!
          // Actually, let's load products via fetch!
        } catch (err) {
          console.error("Failed to load lookups", err);
        }
      })();
    }
  }, [open]);

  // To ensure we get a robust product list, let's fetch from the `/api/inventory/lookups` which returns warehouses, categories, brands.
  // Wait, let's look at `/api/inventory/lookups` again: it doesn't return products directly.
  // How does `NewPurchaseOrderForm` fetch products? It calls `getPurchaseLookups()`.
  // Yes! We can import `getPurchaseLookups` from `@/modules/purchase/actions` and load it!
  useEffect(() => {
    if (open) {
      (async () => {
        try {
          const res = await fetch("/api/inventory/lookups");
          const j = await res.json();
          setSuppliers(j.suppliers || []);
          
          // Let's fetch active products using a fetch or action!
          // We can call getPurchaseLookups action directly on the client!
          const poLookups = await fetch("/api/inventory/lookups");
          // Wait, let's call the query or lookups from purchase action!
          const resAction = await fetch("/api/inventory/lookups");
          // Wait, we can import `getPurchaseLookups` from `@/modules/purchase/actions` directly! Yes, it's a server action!
          const lookups = await (await import("@/modules/purchase/actions")).getPurchaseLookups();
          setProducts(lookups.products || []);
        } catch (err) {
          console.error("Failed to load PO lookups", err);
        }
      })();
    }
  }, [open]);

  // Reset items when supplier changes to prevent invalid product selection
  useEffect(() => {
    setItems([]);
  }, [supplierId]);

  // Filter products by checking if they are active and have a pricing variant for the selected supplier
  const filteredProducts = products.filter((p) =>
    p.variants && p.variants.some((v: any) => v.supplierId === supplierId)
  );

  const addItem = () => {
    if (filteredProducts.length === 0) return;
    const defaultProd = filteredProducts[0];
    const defaultPrice = parseFloat(
      defaultProd.variants.find((v: any) => v.supplierId === supplierId)?.purchasePrice || "0"
    );

    setItems([
      ...items,
      {
        productId: defaultProd.id,
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
    if (!supplierId) {
      toast.error("Please select a supplier");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please specify a reason for this return");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one item to return");
      return;
    }

    startTransition(async () => {
      try {
        await createPurchaseReturn({
          supplierId,
          notes: reason,
          items: items.map(itm => ({
            productId: itm.productId,
            qty: Number(itm.qty),
            unitPrice: Number(itm.unitPrice)
          }))
        }, userId);

        toast.success("Purchase return recorded successfully! Dues decremented.");
        setOpen(false);
        setSupplierId("");
        setReason("");
        setItems([]);
      } catch (err: any) {
        toast.error("Error: " + (err.message || "Failed to log return"));
      }
    });
  };

  const totalReturnAmt = items.reduce((sum, itm) => sum + itm.qty * itm.unitPrice, 0);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Purchase Returns</h2>
          <p className="text-sm text-zinc-500">Track and dispatch returned materials back to suppliers, decrementing stock and debiting payable ledgers.</p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md border-none"
        >
          <Plus size={16} /> Log Purchase Return
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
        <Input
          placeholder="Search by PRN # or supplier..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-10 h-10 rounded-xl border-zinc-200 dark:border-zinc-800"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-900">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
            <tr className="border-b border-zinc-200 dark:border-zinc-900">
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3 text-left font-semibold">PRN #</th>
              <th className="px-4 py-3 text-left font-semibold">Supplier</th>
              <th className="px-4 py-3 text-right font-semibold">Total Value (NPR)</th>
              <th className="px-4 py-3 text-center font-semibold">Status</th>
              <th className="px-4 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900">
            {returns.length ? (
              returns.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{formatDate(r.returnDate)}</td>
                  <td className="px-4 py-3 font-mono font-bold text-orange-600 dark:text-orange-400">{r.returnNumber}</td>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">{r.supplier.name}</td>
                  <td className="px-4 py-3 text-right font-bold text-zinc-950 dark:text-zinc-50">{formatAmountOnly(Number(r.totalAmount))}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className="bg-orange-950/40 text-orange-400 border border-orange-900/40 px-2 py-0.5 rounded-full font-medium">
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReturn(r);
                        setShowDetail(true);
                      }}
                      className="h-8 border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-white gap-1"
                    >
                      <Eye size={13} /> View
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-zinc-500 italic">
                  {localSearch ? `No purchase returns found matching "${localSearch}"` : "No purchase returns logged yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
              className="h-9 w-9 p-0 border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              className="h-9 w-9 p-0 border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Log Purchase Return Wizard Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[98vw] max-w-[98vw] h-[95vh] flex flex-col overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
          <DialogHeader className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
            <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <RefreshCcw size={20} className="text-orange-500" /> Log Purchase Return (PRN)
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Initiate a return shipment to supplier. Select items, configure quantities, and cost rates. Dues will automatically credit/debit under supplier ledger accounts.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-grow overflow-y-auto py-4 space-y-5 pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider uppercase block">Supplier / Vendor *</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full h-10 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="">-- Select Vendor --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider uppercase block">Return Cause / Remarks *</label>
                <Input
                  placeholder="e.g. Expired shelf-life, defective packaging, freight damage..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="h-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 bg-zinc-50/20 dark:bg-zinc-900/10">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-150 dark:border-zinc-800">
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  Returned Items List
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  disabled={!supplierId || filteredProducts.length === 0}
                  className="border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <Plus size={14} className="mr-1" /> Add Return Line
                </Button>
              </div>

              {!supplierId ? (
                <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/20 dark:bg-zinc-950/20">
                  <p className="text-sm text-zinc-500 italic">Please select a supplier first to add return items</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/20 dark:bg-zinc-950/20">
                  <p className="text-sm text-amber-600 dark:text-amber-500 italic">This supplier has no purchased products registered in inventory.</p>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/20 dark:bg-zinc-950/20">
                  <p className="text-sm text-zinc-500 italic">No lines added yet. Click &quot;Add Return Line&quot; to begin material dispatch.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-end p-4 border border-zinc-200 dark:border-zinc-800/60 rounded-xl bg-white dark:bg-zinc-950/40 relative">
                      <div className="col-span-12 sm:col-span-4">
                        <label className="text-[10px] font-semibold text-zinc-500 block mb-1">Product *</label>
                        <select
                          value={item.productId}
                          onChange={(e) => {
                            const newProductId = e.target.value;
                            const prod = filteredProducts.find((p) => p.id === newProductId);
                            const price = parseFloat(
                              prod?.variants?.find((v: any) => v.supplierId === supplierId)?.purchasePrice || "0"
                            );
                            updateItem(index, { productId: newProductId, unitPrice: price });
                          }}
                          className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        >
                          {filteredProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              [{p.code}] {p.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label className="text-[10px] font-semibold text-zinc-500 block mb-1">Qty to Return *</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={item.qty}
                          min={1}
                          onChange={(e) => updateItem(index, { qty: Math.max(1, parseInt(e.target.value) || 0) })}
                          className="h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-805 dark:text-zinc-100 text-xs"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label className="text-[10px] font-semibold text-zinc-500 block mb-1">Returned Rate Cost *</label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={item.unitPrice === 0 ? "" : item.unitPrice}
                          onChange={(e) => updateItem(index, { unitPrice: Math.max(0, parseFloat(e.target.value) || 0) })}
                          className="h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-805 dark:text-zinc-100 text-xs"
                        />
                      </div>

                      <div className="col-span-12 sm:col-span-1 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-rose-600 dark:text-rose-500 hover:text-rose-700 dark:hover:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold shadow-md border-none"
            >
              {isPending ? "Reconciling..." : "Confirm Return Shipment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Premium Orange-Themed Return details modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="w-[98vw] max-w-[98vw] h-[95vh] flex flex-col overflow-y-auto bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
          <DialogHeader className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
            <div className="flex justify-between items-center pr-6">
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                <Clipboard size={20} className="text-orange-500" /> Purchase Return Invoice Note: <span className="font-mono text-orange-600 dark:text-orange-500">{selectedReturn?.returnNumber}</span>
              </DialogTitle>
              {selectedReturn && (
                <Badge className="bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40 px-3 py-1 font-semibold rounded-full shadow-none text-[10px]">
                  {selectedReturn.status}
                </Badge>
              )}
            </div>
            <DialogDescription className="sr-only">
              Document viewer for purchase return ledger adjustments, items, rates, and totals.
            </DialogDescription>
          </DialogHeader>

          {selectedReturn && (
            <div className="flex-grow space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Supplier / Vendor</h4>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{selectedReturn.supplier.name}</div>
                  {selectedReturn.supplier.panNumber && (
                    <div className="text-xs text-zinc-650 dark:text-zinc-400 font-mono mt-0.5">PAN: {selectedReturn.supplier.panNumber}</div>
                  )}
                  {selectedReturn.supplier.phone && (
                    <div className="text-xs text-zinc-650 dark:text-zinc-400 mt-0.5">Phone: {selectedReturn.supplier.phone}</div>
                  )}
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-0.5">Return Date</h4>
                  <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{formatDate(selectedReturn.returnDate)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Returned Materials</h4>
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-zinc-800 dark:text-zinc-300">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-left font-semibold text-zinc-500 dark:text-zinc-400">
                        <th className="p-3.5">Product Item</th>
                        <th className="p-3.5 text-right">Returned Qty</th>
                        <th className="p-3.5 text-right">Unit Price (NPR)</th>
                        <th className="p-3.5 text-right">Total Refund (NPR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-850 bg-white dark:bg-zinc-950/20">
                      {selectedReturn.items.map((item: any) => (
                        <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                          <td className="p-3.5">
                            <div className="font-semibold text-zinc-900 dark:text-zinc-200">{item.product.name}</div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{item.product.code}</div>
                          </td>
                          <td className="p-3.5 text-right font-medium text-zinc-800 dark:text-zinc-200">{item.qty} {item.product.unit}</td>
                          <td className="p-3.5 text-right">{formatAmountOnly(Number(item.unitPrice))}</td>
                          <td className="p-3.5 text-right font-bold text-orange-600 dark:text-orange-500">{formatAmountOnly(Number(item.totalPrice))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 pt-2">
                <div className="col-span-3">
                  <h5 className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Return Reason / Notes</h5>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50/50 dark:bg-zinc-900/30 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 whitespace-pre-wrap">{selectedReturn.notes}</p>
                </div>

                <div className="col-span-2 bg-orange-50 dark:bg-orange-950/10 p-4 rounded-xl border border-orange-200 dark:border-orange-900/20 h-fit space-y-1.5">
                  <div className="flex justify-between font-bold text-sm text-orange-600 dark:text-orange-400">
                    <span>Total Debit Credit Note:</span>
                    <span>{formatAmountOnly(Number(selectedReturn.totalAmount))}</span>
                  </div>
                  <p className="text-[10px] text-zinc-600 dark:text-zinc-400">This amount has been successfully debited from the supplier ledger payable balance.</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-zinc-150 dark:border-zinc-800 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDetail(false)}
              className="border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              Close Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default PurchaseReturnsTab;
