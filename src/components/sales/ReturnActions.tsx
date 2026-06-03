"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Download, Loader2 } from "lucide-react";
import { getSalesReturnDetails } from "@/modules/sales/actions";
import { getBusinessSettingsAction } from "@/modules/settings/actions";
import { generateCreditNotePDF, type CreditNoteProps } from "@/lib/credit-note-pdf";
import { CreditNotePreviewModal } from "./CreditNotePreviewModal";

interface ReturnActionsProps {
  returnId: string;
}

export function ReturnActions({ returnId }: ReturnActionsProps) {
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [returnData, setReturnData] = useState<CreditNoteProps | null>(null);

  const fetchDetailsAndSettings = async (): Promise<CreditNoteProps | null> => {
    if (returnData) return returnData;
    
    setLoading(true);
    try {
      const [returnDetails, settings] = await Promise.all([
        getSalesReturnDetails(returnId),
        getBusinessSettingsAction()
      ]);

      console.log("DEBUG: returnDetails = ", returnDetails);
      console.log("DEBUG: invoice = ", returnDetails?.invoice);
      console.log("DEBUG: invoice items = ", returnDetails?.invoice?.items);

      if (!returnDetails) {
        throw new Error("Return details not found");
      }

      const customer = returnDetails.customer;
      const invoice = returnDetails.invoice;

      const items = (invoice?.items || []).map((item: any) => ({
        productId: item.productId,
        productName: item.product?.name || "Unknown Product",
        productCode: item.product?.code || "",
        productUnit: item.product?.unit || "",
        qty: item.qty,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        notes: item.notes,
      }));

      const returns = (invoice?.salesReturns || []).map((ret: any) => ({
        id: ret.id,
        returnNumber: ret.returnNumber,
        totalAmount: Number(ret.totalAmount),
        notes: ret.notes,
        items: (ret.items || []).map((ritem: any) => ({
          productId: ritem.productId,
          qty: ritem.qty,
          totalPrice: Number(ritem.totalPrice),
        })),
      }));

      const creditNoteProps: CreditNoteProps = {
        srnNumber: returnDetails.returnNumber,
        returnDate: returnDetails.returnDate,
        originalInvoiceNumber: invoice?.invoiceNumber ?? "—",
        refundMethod: returnDetails.refundMethod,
        businessName: settings["business_name"] || "NextGen Interior And WaterProofing",
        businessPAN: settings["business_pan"] || "122782202",
        businessPhone: settings["business_phone"] || "9843146474",
        businessAddress: settings["business_address"] || "Gauradaha Nagarpalika-02, Jhapa, Nepal",
        
        customerName: customer?.name || "Unknown Customer",
        customerAddress: customer?.address || "",
        customerPhone: customer?.phone || "",
        
        invoiceDate: invoice?.invoiceDate || new Date(),
        invoiceType: invoice?.invoiceType || "RETAIL",
        status: invoice?.status || "SENT",
        
        items,
        returns,
        subtotal: Number(invoice?.subtotal || 0),
        discountAmount: Number(invoice?.discountAmount || 0),
        vatPercent: Number(invoice?.vatPercent || 13),
        vatAmount: Number(invoice?.vatAmount || 0),
        totalAmount: Number(invoice?.totalAmount || 0),
        paidAmount: Number(invoice?.paidAmount || 0),
        balanceAmount: Number(invoice?.balanceAmount || 0),
      };

      setReturnData(creditNoteProps);
      return creditNoteProps;
    } catch (err) {
      console.error("Failed to fetch return details", err);
      alert("Failed to load return details. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleView = async () => {
    const data = await fetchDetailsAndSettings();
    if (data) {
      setModalOpen(true);
    }
  };

  const handleDownload = async () => {
    const data = await fetchDetailsAndSettings();
    if (!data) return;

    setLoading(true);
    try {
      const blob = await generateCreditNotePDF(data);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const dateObj = new Date(data.returnDate);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      
      link.download = `CreditNote_${data.srnNumber}_${formattedDate}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF", err);
      alert("Failed to download PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={handleView}
        className="h-7 px-2 border-zinc-300 bg-white text-zinc-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 rounded text-xs font-semibold gap-1"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye size={12} />}
        View
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={handleDownload}
        className="h-7 px-2 border-red-200 bg-white text-red-700 hover:bg-red-50 hover:border-red-300 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300 rounded text-xs font-semibold gap-1"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download size={12} />}
        Credit Note
      </Button>

      <CreditNotePreviewModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        returnData={returnData}
      />
    </div>
  );
}
