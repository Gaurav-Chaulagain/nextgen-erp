"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatNPR } from "@/lib/utils";
import { generateCreditNotePDF, type CreditNoteProps } from "@/lib/credit-note-pdf";

interface CreditNotePreviewModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  returnData?: CreditNoteProps | null;
}

export function CreditNotePreviewModal({ open = false, onOpenChange, returnData }: CreditNotePreviewModalProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!returnData) return;
    setDownloading(true);
    try {
      const blob = await generateCreditNotePDF(returnData);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const dateObj = new Date(returnData.returnDate);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      
      link.download = `CreditNote_${returnData.srnNumber}_${formattedDate}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  const returnsByProduct = new Map<
    string,
    {
      qty: number;
      totalPrice: number;
      details: Array<{ returnNumber: string; qty: number; notes: string | null }>;
    }
  >();

  if (returnData && returnData.returns) {
    for (const ret of returnData.returns) {
      for (const item of ret.items) {
        const existing = returnsByProduct.get(item.productId) || { qty: 0, totalPrice: 0, details: [] };
        existing.qty += item.qty;
        existing.totalPrice += Number(item.totalPrice);
        existing.details.push({
          returnNumber: ret.returnNumber,
          qty: item.qty,
          notes: ret.notes || null,
        });
        returnsByProduct.set(item.productId, existing);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-[98vw] h-[95vh] flex flex-col overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Credit Note & Revised Invoice Preview</DialogTitle>
          <DialogDescription className="sr-only">
            Preview of Sales Return Credit Note and Revised Invoice details.
          </DialogDescription>
        </DialogHeader>

        {returnData ? (
          <div className="overflow-hidden rounded-lg border bg-white text-zinc-950">
            {/* Header section (Red-themed) */}
            <div className="p-6 text-white bg-red-650">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">{returnData.businessName}</h2>
                  <p className="text-sm opacity-90">PAN: {returnData.businessPAN} | Phone: {returnData.businessPhone}</p>
                  <p className="text-sm opacity-90">{returnData.businessAddress}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm uppercase opacity-80 font-bold">Credit Note</p>
                  <p className="text-xl font-semibold">{returnData.srnNumber}</p>
                  <p className="text-sm opacity-90">Ref Invoice: {returnData.originalInvoiceNumber}</p>
                </div>
              </div>
            </div>

            {/* Customer section */}
            <div className="grid gap-4 p-6 sm:grid-cols-2 border-b">
              <div>
                <p className="text-xs font-semibold uppercase text-zinc-500">Bill To (Customer)</p>
                <p className="mt-1 font-semibold text-zinc-900">{returnData.customerName}</p>
                <p className="text-sm text-zinc-650">{returnData.customerAddress || "Address not provided"}</p>
                <p className="text-sm text-zinc-650">Phone: {returnData.customerPhone || "-"}</p>
              </div>
              <div className="text-sm sm:text-right text-zinc-650">
                <p>Invoice Date: {new Date(returnData.invoiceDate).toLocaleDateString("en-IN")}</p>
                <p>Return Date: {new Date(returnData.returnDate).toLocaleDateString("en-IN")}</p>
                <p>Refund Method: <span className="font-semibold uppercase">{returnData.refundMethod}</span></p>
              </div>
            </div>

            {/* Items Table */}
            <div className="px-6 py-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-zinc-50 text-zinc-700">
                    <th className="px-3 py-2.5 text-left font-semibold">Product Description & Returns</th>
                    <th className="px-3 py-2.5 text-right font-semibold w-36">Qty</th>
                    <th className="px-3 py-2.5 text-right font-semibold w-28">Unit Price</th>
                    <th className="px-3 py-2.5 text-right font-semibold w-36">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {returnData.items.map((item, index) => {
                    const retInfo = returnsByProduct.get(item.productId);
                    const isFullyReturned = retInfo && retInfo.qty >= item.qty;

                    return (
                      <tr
                        key={item.productId || index}
                        className={`align-top hover:bg-zinc-50/50 transition-colors ${
                          isFullyReturned ? "bg-rose-50/20" : ""
                        }`}
                      >
                        <td className="px-3 py-3">
                          <div className="font-medium text-zinc-900 flex items-center gap-2 flex-wrap">
                            <span>{item.productName}</span>
                            {isFullyReturned && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                                Fully Returned
                              </span>
                            )}
                            {retInfo && !isFullyReturned && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                                Partially Returned
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                            SKU: {item.productCode} {item.notes ? `| Notes: ${item.notes}` : ""}
                          </div>

                          {retInfo && retInfo.details.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {retInfo.details.map((d, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50/60 px-2 py-0.5 rounded border border-rose-100/50 w-fit"
                                >
                                  <span className="font-mono text-[9px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.2 rounded">
                                    {d.returnNumber}
                                  </span>
                                  <span>
                                    Returned: -{d.qty} {item.productUnit}{" "}
                                    {d.notes ? `— "${d.notes}"` : ""}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="px-3 py-3 text-right">
                          {retInfo ? (
                            <div className="flex flex-col font-mono text-xs gap-0.5">
                              <span className="text-zinc-400 line-through">
                                {item.qty} {item.productUnit}
                              </span>
                              <span className="text-rose-600 font-medium">
                                -{retInfo.qty} {item.productUnit}
                              </span>
                              <span className="font-bold text-zinc-900 border-t border-dashed border-zinc-200 pt-0.5 mt-0.5">
                                {item.qty - retInfo.qty} {item.productUnit}
                              </span>
                            </div>
                          ) : (
                            <span className="font-mono text-zinc-900">
                              {item.qty} {item.productUnit}
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-3 text-right font-mono text-zinc-900">
                          {formatNPR(item.unitPrice)}
                        </td>

                        <td className="px-3 py-3 text-right">
                          {retInfo ? (
                            <div className="flex flex-col font-mono text-xs gap-0.5">
                              <span className="text-zinc-400 line-through">
                                {formatNPR(item.totalPrice)}
                              </span>
                              <span className="text-rose-600 font-medium">
                                -{formatNPR(retInfo.totalPrice)}
                              </span>
                              <span className="font-bold text-zinc-900 border-t border-dashed border-zinc-200 pt-0.5 mt-0.5">
                                {formatNPR(item.totalPrice - retInfo.totalPrice)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-mono text-zinc-900">
                              {formatNPR(item.totalPrice)}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Summary Calculations */}
              {(() => {
                const totalReturned = returnData.returns
                  ? returnData.returns.reduce((sum, ret) => sum + Number(ret.totalAmount), 0)
                  : 0;

                const netTotal = returnData.totalAmount - totalReturned;
                const originalTotal = returnData.totalAmount;

                return (
                  <div className="ml-auto mt-6 w-full max-w-sm space-y-2 text-sm border-t pt-4">
                    <div className="flex justify-between text-zinc-500">
                      <span>Original Subtotal</span>
                      <span>{formatNPR(returnData.subtotal)}</span>
                    </div>
                    {returnData.discountAmount > 0 && (
                      <div className="flex justify-between text-zinc-500">
                        <span>Original Discount</span>
                        <span>{formatNPR(returnData.discountAmount)}</span>
                      </div>
                    )}
                    {returnData.vatAmount > 0 && (
                      <div className="flex justify-between text-zinc-500">
                        <span>Original VAT ({returnData.vatPercent}%)</span>
                        <span>{formatNPR(returnData.vatAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-b pb-2 font-semibold text-zinc-800">
                      <span>Original Total</span>
                      <span>{formatNPR(originalTotal)}</span>
                    </div>

                    {totalReturned > 0 && (
                      <>
                        <div className="flex justify-between text-rose-600 font-semibold">
                          <span>Total Returned (incl. VAT)</span>
                          <span>-{formatNPR(totalReturned)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 text-base font-bold text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200 shadow-sm">
                          <span>Net Invoice Value</span>
                          <span className="font-mono">{formatNPR(netTotal)}</span>
                        </div>
                      </>
                    )}

                    {totalReturned === 0 && (
                      <div className="flex justify-between border-t pt-2 text-base font-bold text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200 shadow-sm">
                        <span>Total Amount</span>
                        <span className="font-mono">{formatNPR(netTotal)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-xs text-zinc-500 px-2 pt-1">
                      <span>Amount Paid</span>
                      <span>{formatNPR(returnData.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-orange-600 px-2">
                      <span>Balance Due</span>
                      <span className="font-mono">{formatNPR(returnData.balanceAmount)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer terms */}
            <div className="border-t bg-zinc-50 p-4 text-center text-sm text-zinc-500">
              This credit note is issued against return of goods. Amount will be adjusted against your account or refunded accordingly.
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No return data loaded.</p>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>Close</Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white border-none" onClick={handleDownloadPDF} disabled={downloading}>
            {downloading ? "Generating..." : "Download PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
