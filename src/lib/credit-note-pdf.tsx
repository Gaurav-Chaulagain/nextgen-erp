import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";

export interface CreditNoteProps {
  srnNumber: string;
  returnDate: string | Date;
  originalInvoiceNumber: string;
  refundMethod: string;
  businessName: string;
  businessPAN: string;
  businessPhone: string;
  businessAddress: string;
  
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  
  invoiceDate: string | Date;
  invoiceType: string;
  status: string;
  
  items: Array<{
    productId: string;
    productName: string;
    productCode: string;
    productUnit: string;
    qty: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string | null;
  }>;
  
  returns: Array<{
    id: string;
    returnNumber: string;
    totalAmount: number;
    notes?: string | null;
    items: Array<{
      productId: string;
      qty: number;
      totalPrice: number;
    }>;
  }>;
  
  subtotal: number;
  discountAmount: number;
  vatPercent: number;
  vatAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
}

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 9,
    color: "#18181b",
    fontFamily: "Helvetica",
  },
  header: {
    padding: 16,
    color: "#ffffff",
    backgroundColor: "#dc2626", // Red colored matching return theme
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
  },
  row: {
    flexDirection: "row",
  },
  between: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  section: {
    marginBottom: 14,
  },
  muted: {
    color: "#71717a",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f4f4f5", // Light gray background
    borderBottom: "1px solid #d4d4d8",
    paddingVertical: 6,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #e4e4e7",
    paddingVertical: 6,
  },
  returnedRow: {
    backgroundColor: "#fffafb",
  },
  itemCol: {
    width: "46%",
    paddingHorizontal: 4,
  },
  qtyCol: {
    width: "15%",
    textAlign: "right",
    paddingHorizontal: 4,
  },
  priceCol: {
    width: "18%",
    textAlign: "right",
    paddingHorizontal: 4,
  },
  totalCol: {
    width: "21%",
    textAlign: "right",
    paddingHorizontal: 4,
  },
  totals: {
    marginLeft: "auto",
    width: 220,
    marginTop: 16,
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    marginTop: 4,
    borderTop: "1px solid #a1a1aa",
    fontSize: 11,
    fontWeight: 700,
    color: "#dc2626", // Bold, larger font, red color
  },
  footer: {
    marginTop: 24,
    paddingTop: 10,
    borderTop: "1px solid #e4e4e7",
    textAlign: "center",
    color: "#71717a",
  },
  messageText: {
    fontSize: 8,
    color: "#71717a",
    marginTop: 6,
    textAlign: "center",
  },
  signatureLine: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  signatureText: {
    borderTop: "1px solid #71717a",
    width: 150,
    textAlign: "center",
    paddingTop: 4,
    fontSize: 9,
  },
  strikeText: {
    textDecoration: "line-through",
    color: "#71717a",
    fontSize: 8,
  },
  returnedText: {
    color: "#dc2626",
    fontSize: 8,
  },
  netText: {
    fontWeight: 700,
    fontSize: 9,
  },
  redBold: {
    color: "#dc2626",
    fontWeight: 700,
  },
});

function money(value: string | number) {
  const num = Number(value);
  const absVal = Math.abs(num).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return num < 0 ? `-NPR ${absVal}` : `NPR ${absVal}`;
}

export function CreditNotePDF({
  srnNumber,
  returnDate,
  originalInvoiceNumber,
  refundMethod,
  businessName,
  businessPAN,
  businessPhone,
  businessAddress,
  customerName,
  customerAddress,
  customerPhone,
  invoiceDate,
  invoiceType,
  status,
  items,
  returns,
  subtotal,
  discountAmount,
  vatPercent,
  vatAmount,
  totalAmount,
  paidAmount,
  balanceAmount,
}: CreditNoteProps) {
  // Aggregate returns by product variants for detailed breakdown
  const returnsByProduct = new Map<
    string,
    {
      qty: number;
      totalPrice: number;
      details: Array<{ returnNumber: string; qty: number; notes: string | null }>;
    }
  >();

  if (returns) {
    for (const ret of returns) {
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
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.between}>
            <View>
              <Text style={styles.headerTitle}>{businessName}</Text>
              <Text>PAN: {businessPAN} | Phone: {businessPhone}</Text>
              <Text>{businessAddress}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>CREDIT NOTE</Text>
              <Text>SRN No: {srnNumber}</Text>
              <Text>Date: {new Date(returnDate).toLocaleDateString("en-IN")}</Text>
              <Text>Ref Invoice: {originalInvoiceNumber}</Text>
            </View>
          </View>
        </View>

        {/* Customer Section */}
        <View style={[styles.between, styles.section, { borderBottom: "1px solid #e4e4e7", paddingBottom: 8 }]}>
          <View>
            <Text style={styles.muted}>Bill To (Customer)</Text>
            <Text style={{ fontSize: 11, fontWeight: "bold" }}>{customerName}</Text>
            <Text>{customerAddress || "Address not provided"}</Text>
            <Text>Phone: {customerPhone || "-"}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text>Invoice Date: {new Date(invoiceDate).toLocaleDateString("en-IN")}</Text>
            <Text>Invoice Channel: {invoiceType}</Text>
            <Text>Refund Method: {refundMethod}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.tableHeader}>
          <Text style={styles.itemCol}>Product Description & Returns</Text>
          <Text style={styles.qtyCol}>Qty</Text>
          <Text style={styles.priceCol}>Unit Price</Text>
          <Text style={styles.totalCol}>Total Price</Text>
        </View>

        {items.map((item, index) => {
          const retInfo = returnsByProduct.get(item.productId);
          const isFullyReturned = retInfo && retInfo.qty >= item.qty;

          return (
            <View key={item.productId || index} style={[styles.tableRow, isFullyReturned ? styles.returnedRow : {}]}>
              <View style={styles.itemCol}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                  <Text style={{ fontWeight: "bold" }}>{item.productName}</Text>
                  {isFullyReturned && (
                    <Text style={{ fontSize: 6, color: "#b91c1c", backgroundColor: "#fee2e2", paddingHorizontal: 3, borderRadius: 2, fontWeight: "bold" }}>
                      Fully Returned
                    </Text>
                  )}
                  {retInfo && !isFullyReturned && (
                    <Text style={{ fontSize: 6, color: "#d97706", backgroundColor: "#fef3c7", paddingHorizontal: 3, borderRadius: 2, fontWeight: "bold" }}>
                      Partially Returned
                    </Text>
                  )}
                </View>
                <Text style={styles.muted}>SKU: {item.productCode} {item.notes ? `| Notes: ${item.notes}` : ""}</Text>
                
                {retInfo && retInfo.details.map((d, idx) => (
                  <View key={idx} style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 }}>
                    <Text style={{ fontSize: 6, fontWeight: "bold", color: "#b91c1c", backgroundColor: "#fee2e2", paddingHorizontal: 3, borderRadius: 2 }}>
                      {d.returnNumber}
                    </Text>
                    <Text style={{ fontSize: 8, color: "#b91c1c" }}>
                      Returned: -{d.qty} {item.productUnit} {d.notes ? `— "${d.notes}"` : ""}
                    </Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.qtyCol}>
                {retInfo ? (
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.strikeText}>{item.qty} {item.productUnit}</Text>
                    <Text style={styles.returnedText}>-{retInfo.qty} {item.productUnit}</Text>
                    <Text style={styles.netText}>{item.qty - retInfo.qty} {item.productUnit}</Text>
                  </View>
                ) : (
                  <Text>{item.qty} {item.productUnit}</Text>
                )}
              </View>
              
              <View style={styles.priceCol}>
                <Text>{money(item.unitPrice)}</Text>
              </View>
              
              <View style={styles.totalCol}>
                {retInfo ? (
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.strikeText}>{money(item.totalPrice)}</Text>
                    <Text style={styles.returnedText}>-{money(retInfo.totalPrice)}</Text>
                    <Text style={styles.netText}>{money(item.totalPrice - retInfo.totalPrice)}</Text>
                  </View>
                ) : (
                  <Text>{money(item.totalPrice)}</Text>
                )}
              </View>
            </View>
          );
        })}

        {/* Financial Summary */}
        {(() => {
          const totalReturned = returns
            ? returns.reduce((sum, ret) => sum + Number(ret.totalAmount), 0)
            : 0;

          // netTotal is the original invoice totalAmount minus what has been returned
          const netTotal = totalAmount - totalReturned;
          const originalTotal = totalAmount;

          return (
            <View style={styles.totals}>
              <View style={styles.totalLine}>
                <Text style={styles.muted}>Original Subtotal</Text>
                <Text>{money(subtotal)}</Text>
              </View>
              {discountAmount > 0 && (
                <View style={styles.totalLine}>
                  <Text style={styles.muted}>Original Discount</Text>
                  <Text>{money(discountAmount)}</Text>
                </View>
              )}
              {vatAmount > 0 && (
                <View style={styles.totalLine}>
                  <Text style={styles.muted}>Original VAT ({vatPercent}%)</Text>
                  <Text>{money(vatAmount)}</Text>
                </View>
              )}
              <View style={styles.totalLine}>
                <Text style={{ fontWeight: "bold" }}>Original Total</Text>
                <Text style={{ fontWeight: "bold" }}>{money(originalTotal)}</Text>
              </View>

              {totalReturned > 0 && (
                <>
                  <View style={styles.totalLine}>
                    <Text style={styles.redBold}>Total Returned (incl. VAT)</Text>
                    <Text style={styles.redBold}>-{money(totalReturned)}</Text>
                  </View>
                  <View style={styles.grandTotal}>
                    <Text>Net Invoice Value</Text>
                    <Text>{money(netTotal)}</Text>
                  </View>
                </>
              )}

              {totalReturned === 0 && (
                <View style={styles.grandTotal}>
                  <Text>Total Amount</Text>
                  <Text>{money(netTotal)}</Text>
                </View>
              )}

              <View style={[styles.totalLine, { fontSize: 8 }]}><Text style={styles.muted}>Amount Paid</Text><Text>{money(paidAmount)}</Text></View>
              <View style={[styles.totalLine, { fontSize: 9, color: "#ea580c" }]}><Text style={{ fontWeight: "bold" }}>Balance Due</Text><Text style={{ fontWeight: "bold" }}>{money(balanceAmount)}</Text></View>
            </View>
          );
        })()}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.messageText}>
            This credit note is issued against return of goods. Amount will be adjusted against your account or refunded accordingly.
          </Text>
        </View>

        {/* Authorized Signature */}
        <View style={styles.signatureLine}>
          <View>
            <Text style={styles.signatureText}>Authorized Signature</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function generateCreditNotePDF(
  returnData: CreditNoteProps
): Promise<Blob> {
  return pdf(<CreditNotePDF {...returnData} />).toBlob();
}
