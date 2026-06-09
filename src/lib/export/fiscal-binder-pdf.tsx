import React from "react";
import { Document, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";

// Core styles matching nextgen-erp design guidelines
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 8,
    color: "#1f2937",
    fontFamily: "Helvetica",
    flexDirection: "column",
  },
  
  // Cover page specific styles
  coverContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 40,
  },
  coverHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  coverLogoText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    letterSpacing: 2,
    marginBottom: 4,
  },
  coverSubtitleText: {
    fontSize: 10,
    color: "#4b5563",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  coverDivider: {
    width: "100%",
    height: 2,
    backgroundColor: "#111827",
    marginVertical: 20,
  },
  coverTitleSection: {
    alignItems: "center",
    marginVertical: 30,
  },
  coverTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    lineHeight: 1.4,
    marginBottom: 10,
  },
  coverPeriod: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "bold",
    backgroundColor: "#f3f4f6",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  coverMetaGrid: {
    width: "100%",
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 15,
  },
  coverMetaCard: {
    width: "48%",
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  coverMetaLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#9ca3af",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  coverMetaValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  coverFooter: {
    alignItems: "center",
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 15,
  },
  coverFooterText: {
    fontSize: 8,
    color: "#6b7280",
    textAlign: "center",
  },

  // Standard Header for inside pages
  header: {
    backgroundColor: "#111827",
    padding: 14,
    color: "#ffffff",
    marginBottom: 15,
    borderRadius: 4,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 7,
    opacity: 0.8,
  },
  metaSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 8,
  },
  metaBlock: {
    flexDirection: "column",
    gap: 2,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#4b5563",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  titleText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
  },

  // Tables
  table: {
    flexDirection: "column",
    marginTop: 5,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingVertical: 5,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 5,
    alignItems: "center",
  },
  tableRowAlternate: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#f9fafb",
    paddingVertical: 5,
    alignItems: "center",
  },
  tableTotalRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#9ca3af",
    borderBottomWidth: 1,
    borderBottomColor: "#9ca3af",
    paddingVertical: 6,
    marginTop: 6,
    fontWeight: "bold",
  },

  // Column Widths
  col1: { width: "70%", paddingHorizontal: 4 },
  col2: { width: "30%", textAlign: "right", paddingHorizontal: 4 },
  
  colBS1: { width: "35%", paddingHorizontal: 4 },
  colBS2: { width: "15%", textAlign: "right", paddingHorizontal: 4 },
  colBS3: { width: "35%", paddingHorizontal: 4 },
  colBS4: { width: "15%", textAlign: "right", paddingHorizontal: 4 },

  colPrjCode: { width: "12%", paddingHorizontal: 4 },
  colPrjName: { width: "23%", paddingHorizontal: 4 },
  colPrjVal: { width: "13%", textAlign: "right", paddingHorizontal: 4 },
  colPrjMargin: { width: "13%", textAlign: "right", paddingHorizontal: 4 },

  colItemCode: { width: "15%", paddingHorizontal: 4 },
  colItemName: { width: "35%", paddingHorizontal: 4 },
  colItemQty: { width: "15%", textAlign: "right", paddingHorizontal: 4 },
  colItemVal: { width: "17%", textAlign: "right", paddingHorizontal: 4 },
  colItemProfit: { width: "18%", textAlign: "right", paddingHorizontal: 4 },

  colVendCode: { width: "15%", paddingHorizontal: 4 },
  colVendName: { width: "40%", paddingHorizontal: 4 },
  colVendPan: { width: "20%", paddingHorizontal: 4 },
  colVendBal: { width: "25%", textAlign: "right", paddingHorizontal: 4 },

  signSection: {
    marginTop: "auto",
    paddingTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signLine: {
    width: 140,
    borderTopWidth: 1,
    borderTopColor: "#9ca3af",
    marginTop: 25,
    textAlign: "center",
    fontSize: 7,
    color: "#4b5563",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 7,
    color: "#9ca3af",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 5,
  },
});

function formatMoney(value: string | number) {
  const amt = Number(value);
  if (isNaN(amt)) return "0.00";
  return amt.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Letterhead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>NextGen Interior And WaterProofing</Text>
      <Text style={styles.headerSubtitle}>
        Gauradaha Nagarpalika-02, Jhapa, Nepal | PAN: 122782202 | Official {title}
        {subtitle ? ` | ${subtitle}` : ""}
      </Text>
    </View>
  );
}

function StandardPageWrapper({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <Page size="A4" style={styles.page}>
      <Letterhead title={title} subtitle={subtitle} />
      {children}
      <View style={styles.signSection}>
        <View>
          <Text style={styles.signLine}>Prepared By (Accounts)</Text>
        </View>
        <View>
          <Text style={styles.signLine}>Authorized Audit Signature</Text>
        </View>
      </View>
      <Text style={styles.footer}>
        This is a certified system-generated operations binder. NextGen Interior And WaterProofing, Jhapa, Nepal.
      </Text>
    </Page>
  );
}

export function FiscalYearBinderPDF({ data }: { data: any }) {
  const { fiscalYear, trading, pl, balanceSheet, cashFlow, projects, topSelling, vendorOutstanding } = data;

  // Aggregate values for the cover page metrics
  const totalSales = pl.revenue.total;
  const grossProfit = pl.grossProfit;
  const netProfit = pl.netProfit;
  const totalReceivables = balanceSheet.assets.receivables;
  const totalPayables = balanceSheet.liabilities.payables;
  
  const formattedStart = new Date(fiscalYear.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const formattedEnd = new Date(fiscalYear.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const compiledDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <Document>
      {/* PAGE 1: COVER PAGE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverContainer}>
          <View style={styles.coverHeader}>
            <Text style={styles.coverLogoText}>NEXTGEN ERP SUITE</Text>
            <Text style={styles.coverSubtitleText}>NextGen Interior & Waterproofing</Text>
            <View style={styles.coverDivider} />
          </View>

          <View style={styles.coverTitleSection}>
            <Text style={styles.coverTitle}>ANNUAL OPERATIONAL & FINANCIAL AUDIT BINDER</Text>
            <Text style={styles.coverPeriod}>FISCAL PERIOD: {fiscalYear.name}</Text>
            <Text style={[styles.coverSubtitleText, { marginTop: 10, letterSpacing: 0.5 }]}>
              {formattedStart} — {formattedEnd}
            </Text>
          </View>

          <View style={{ width: "100%" }}>
            <Text style={[styles.sectionTitle, { fontSize: 8, color: "#111827", marginBottom: 10, borderBottomWidth: 1, borderBottomColor: "#111827", paddingBottom: 4 }]}>
              EXECUTIVE STATEMENT SUMMARIES
            </Text>
            <View style={styles.coverMetaGrid}>
              <View style={styles.coverMetaCard}>
                <Text style={styles.coverMetaLabel}>Total Net Revenue</Text>
                <Text style={styles.coverMetaValue}>NPR {formatMoney(totalSales)}</Text>
              </View>
              <View style={styles.coverMetaCard}>
                <Text style={styles.coverMetaLabel}>Gross Profit</Text>
                <Text style={styles.coverMetaValue}>NPR {formatMoney(grossProfit)}</Text>
              </View>
              <View style={styles.coverMetaCard}>
                <Text style={styles.coverMetaLabel}>Net Operating Profit</Text>
                <Text style={styles.coverMetaValue}>NPR {formatMoney(netProfit)}</Text>
              </View>
              <View style={styles.coverMetaCard}>
                <Text style={styles.coverMetaLabel}>Outstanding Receivables</Text>
                <Text style={styles.coverMetaValue}>NPR {formatMoney(totalReceivables)}</Text>
              </View>
              <View style={styles.coverMetaCard}>
                <Text style={styles.coverMetaLabel}>Outstanding Payables</Text>
                <Text style={styles.coverMetaValue}>NPR {formatMoney(totalPayables)}</Text>
              </View>
              <View style={styles.coverMetaCard}>
                <Text style={styles.coverMetaLabel}>Active Audited Projects</Text>
                <Text style={styles.coverMetaValue}>{projects.length} Sites</Text>
              </View>
            </View>
          </View>

          <View style={styles.coverFooter}>
            <Text style={styles.coverFooterText}>
              Binder compiled on: {compiledDate} | NextGen Interior & Waterproofing, Jhapa, Nepal
            </Text>
            <Text style={[styles.coverFooterText, { fontSize: 6, color: "#9ca3af", marginTop: 4 }]}>
              Certified system generated documents and records. Encrypted backup hash verification intact.
            </Text>
          </View>
        </View>
      </Page>

      {/* PAGE 2: TRADING ACCOUNT */}
      <StandardPageWrapper title="Trading Account" subtitle={`Fiscal Period: ${fiscalYear.name}`}>
        <View style={styles.metaSection}>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionTitle}>Period Range</Text>
            <Text style={styles.titleText}>{formattedStart} to {formattedEnd}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionTitle}>Gross Margin %</Text>
            <Text style={{ fontWeight: "bold" }}>
              GP Margin: {Number(trading.sales) > 0 ? ((Number(trading.grossProfit) / Number(trading.sales)) * 100).toFixed(2) : "0.00"}%
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colBS1}>DEBIT PARTICULARS (Dr)</Text>
            <Text style={styles.colBS2}>AMOUNT (NPR)</Text>
            <Text style={styles.colBS3}>CREDIT PARTICULARS (Cr)</Text>
            <Text style={styles.colBS4}>AMOUNT (NPR)</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.colBS1}>Opening Stock brought forward</Text>
            <Text style={styles.colBS2}>{formatMoney(trading.openingStock)}</Text>
            <Text style={styles.colBS3}>Sales Revenue (Net of VAT)</Text>
            <Text style={styles.colBS4}>{formatMoney(trading.sales)}</Text>
          </View>
          <View style={styles.tableRowAlternate}>
            <Text style={styles.colBS1}>Procurement Purchases</Text>
            <Text style={styles.colBS2}>{formatMoney(trading.purchases)}</Text>
            <Text style={styles.colBS3}>Closing Stock Valuation</Text>
            <Text style={styles.colBS4}>{formatMoney(trading.closingStock)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.colBS1}>Cost of Goods Sold (COGS)</Text>
            <Text style={styles.colBS2}>{formatMoney(trading.cogs)}</Text>
            <Text style={styles.colBS3}>-</Text>
            <Text style={styles.colBS4}>-</Text>
          </View>
          <View style={styles.tableRowAlternate}>
            <Text style={styles.colBS1}>Gross Profit transferred</Text>
            <Text style={styles.colBS2}>{formatMoney(trading.grossProfit)}</Text>
            <Text style={styles.colBS3}>-</Text>
            <Text style={styles.colBS4}>-</Text>
          </View>

          <View style={styles.tableTotalRow}>
            <Text style={styles.colBS1}>TOTAL DEBITS</Text>
            <Text style={styles.colBS2}>{formatMoney(Number(trading.cogs) + Number(trading.grossProfit))}</Text>
            <Text style={styles.colBS3}>TOTAL CREDITS</Text>
            <Text style={styles.colBS4}>{formatMoney(Number(trading.sales) + Number(trading.closingStock))}</Text>
          </View>
        </View>
      </StandardPageWrapper>

      {/* PAGE 3: PROFIT & LOSS STATEMENT */}
      <StandardPageWrapper title="Profit & Loss Statement" subtitle={`Fiscal Period: ${fiscalYear.name}`}>
        <View style={styles.metaSection}>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionTitle}>Period Range</Text>
            <Text style={styles.titleText}>{formattedStart} to {formattedEnd}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionTitle}>Summary Status</Text>
            <Text style={{ fontWeight: "bold" }}>Net Income: NPR {formatMoney(pl.netProfit)}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>SECTION / ACCOUNT PARTICULAR</Text>
            <Text style={styles.col2}>AMOUNT (NPR)</Text>
          </View>

          <View style={styles.tableRow}><Text style={[styles.col1, { fontWeight: "bold" }]}>REVENUES (SALES)</Text></View>
          <View style={styles.tableRowAlternate}><Text style={styles.col1}>  Retail Channel Revenue</Text><Text style={styles.col2}>{formatMoney(pl.revenue.retail)}</Text></View>
          <View style={styles.tableRow}><Text style={styles.col1}>  Wholesale Channel Revenue</Text><Text style={styles.col2}>{formatMoney(pl.revenue.wholesale)}</Text></View>
          <View style={styles.tableRowAlternate}><Text style={styles.col1}>  Project Channel Revenue</Text><Text style={styles.col2}>{formatMoney(pl.revenue.project)}</Text></View>
          <View style={styles.tableTotalRow}><Text style={styles.col1}>TOTAL REVENUE (A)</Text><Text style={styles.col2}>{formatMoney(pl.revenue.total)}</Text></View>

          <View style={styles.tableRow}><Text style={[styles.col1, { fontWeight: "bold", marginTop: 4 }]}>COST OF GOODS SOLD</Text></View>
          <View style={styles.tableRowAlternate}><Text style={styles.col1}>  Material Procurement & Cost of Sales (COGS)</Text><Text style={styles.col2}>{formatMoney(pl.cogs)}</Text></View>
          <View style={styles.tableTotalRow}><Text style={styles.col1}>TOTAL COST OF GOODS SOLD (B)</Text><Text style={styles.col2}>{formatMoney(pl.cogs)}</Text></View>

          <View style={[styles.tableTotalRow, { backgroundColor: "#f3f4f6" }]}><Text style={styles.col1}>GROSS PROFIT (C = A - B)</Text><Text style={styles.col2}>{formatMoney(pl.grossProfit)}</Text></View>

          <View style={styles.tableRow}><Text style={[styles.col1, { fontWeight: "bold", marginTop: 4 }]}>OPERATING EXPENSES</Text></View>
          <View style={styles.tableRowAlternate}><Text style={styles.col1}>  Operating Expenses (Rent, Utilities, Wages, Site Costs)</Text><Text style={styles.col2}>{formatMoney(pl.operatingExpenses)}</Text></View>
          <View style={styles.tableRow}><Text style={styles.col1}>  Fixed Asset Depreciation (SL & DDB)</Text><Text style={styles.col2}>{formatMoney(pl.depreciation)}</Text></View>
          <View style={styles.tableTotalRow}>
            <Text style={styles.col1}>TOTAL OPERATING EXPENSES (D)</Text>
            <Text style={styles.col2}>{formatMoney(Number(pl.operatingExpenses) + Number(pl.depreciation))}</Text>
          </View>

          <View style={[styles.tableTotalRow, { backgroundColor: "#e5e7eb", borderTopWidth: 2 }]}><Text style={[styles.col1, { fontWeight: "bold" }]}>NET OPERATIONS PROFIT / LOSS (C - D)</Text><Text style={[styles.col2, { fontWeight: "bold" }]}>{formatMoney(pl.netProfit)}</Text></View>
        </View>
      </StandardPageWrapper>

      {/* PAGE 4: BALANCE SHEET STATEMENT */}
      <StandardPageWrapper title="Balance Sheet" subtitle={`As of Snapshot: ${formattedEnd}`}>
        <View style={styles.metaSection}>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionTitle}>Snapshot Date</Text>
            <Text style={styles.titleText}>{formattedEnd}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionTitle}>Accounting Equation</Text>
            <Text style={{ fontWeight: "bold" }}>Assets = Liabilities + Equity (Balanced)</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colBS1}>ASSETS PARTICULARS</Text>
            <Text style={styles.colBS2}>AMOUNT (NPR)</Text>
            <Text style={styles.colBS3}>LIABILITIES & EQUITIES</Text>
            <Text style={styles.colBS4}>AMOUNT (NPR)</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.colBS1, { fontWeight: "bold" }]}>CURRENT ASSETS</Text><Text style={styles.colBS2}></Text>
            <Text style={[styles.colBS3, { fontWeight: "bold" }]}>CURRENT LIABILITIES</Text><Text style={styles.colBS4}></Text>
          </View>
          
          <View style={styles.tableRowAlternate}>
            <Text style={styles.colBS1}>  Cash-in-hand (Safe Vault)</Text><Text style={styles.colBS2}>{formatMoney(balanceSheet.assets.cash)}</Text>
            <Text style={styles.colBS3}>  Accounts Payable (Creditors)</Text><Text style={styles.colBS4}>{formatMoney(balanceSheet.liabilities.payables)}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.colBS1}>  Bank Vault Balances</Text><Text style={styles.colBS2}>{formatMoney(balanceSheet.assets.bank)}</Text>
            <Text style={[styles.colBS3, { fontWeight: "bold" }]}>TOTAL LIABILITIES (B)</Text><Text style={[styles.colBS4, { fontWeight: "bold" }]}>{formatMoney(balanceSheet.liabilities.total)}</Text>
          </View>

          <View style={styles.tableRowAlternate}>
            <Text style={styles.colBS1}>  Digital QR Wallets (eSewa/Khalti)</Text><Text style={styles.colBS2}>{formatMoney(balanceSheet.assets.digital)}</Text>
            <Text style={[styles.colBS3, { fontWeight: "bold", marginTop: 4 }]}>OWNER'S EQUITY</Text><Text style={styles.colBS4}></Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.colBS1}>  Accounts Receivable (Debtors)</Text><Text style={styles.colBS2}>{formatMoney(balanceSheet.assets.receivables)}</Text>
            <Text style={styles.colBS3}>  Owner starting Capital</Text><Text style={styles.colBS4}>{formatMoney(balanceSheet.equity.capital)}</Text>
          </View>

          <View style={styles.tableRowAlternate}>
            <Text style={styles.colBS1}>  Inventory Closing Stock Value</Text><Text style={styles.colBS2}>{formatMoney(balanceSheet.assets.inventory)}</Text>
            <Text style={styles.colBS3}>  Retained Earnings (Dynamic P&L)</Text><Text style={styles.colBS4}>{formatMoney(balanceSheet.equity.retainedEarnings)}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.colBS1, { fontWeight: "bold", marginTop: 4 }]}>FIXED ASSETS</Text><Text style={styles.colBS2}></Text>
            <Text style={[styles.colBS3, { fontWeight: "bold" }]}>TOTAL EQUITY (C)</Text><Text style={[styles.colBS4, { fontWeight: "bold" }]}>{formatMoney(balanceSheet.equity.total)}</Text>
          </View>

          <View style={styles.tableRowAlternate}>
            <Text style={styles.colBS1}>  Capitalized Asset Cost</Text><Text style={styles.colBS2}>{formatMoney(balanceSheet.assets.fixedCost)}</Text>
            <Text style={styles.colBS3}>-</Text><Text style={styles.colBS4}>-</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.colBS1}>  Less: Accum. Depreciation</Text><Text style={styles.colBS2}>({formatMoney(balanceSheet.assets.accumDepreciation)})</Text>
            <Text style={styles.colBS3}>-</Text><Text style={styles.colBS4}>-</Text>
          </View>

          <View style={styles.tableRowAlternate}>
            <Text style={styles.colBS1}>  Net Fixed Assets Value</Text><Text style={styles.colBS2}>{formatMoney(balanceSheet.assets.netFixed)}</Text>
            <Text style={styles.colBS3}>-</Text><Text style={styles.colBS4}>-</Text>
          </View>

          <View style={[styles.tableTotalRow, { backgroundColor: "#f3f4f6" }]}>
            <Text style={styles.colBS1}>TOTAL ASSETS (A)</Text>
            <Text style={styles.colBS2}>{formatMoney(balanceSheet.assets.total)}</Text>
            <Text style={styles.colBS3}>TOTAL LIABILITIES & EQUITY (B+C)</Text>
            <Text style={styles.colBS4}>{formatMoney(Number(balanceSheet.liabilities.total) + Number(balanceSheet.equity.total))}</Text>
          </View>
        </View>
      </StandardPageWrapper>

      {/* PAGE 5: CASH FLOW STATEMENT */}
      <StandardPageWrapper title="Cash Flow Statement" subtitle={`Fiscal Period: ${fiscalYear.name}`}>
        <View style={styles.metaSection}>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionTitle}>Period Range</Text>
            <Text style={styles.titleText}>{formattedStart} to {formattedEnd}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionTitle}>Net Cash Flow</Text>
            <Text style={{ fontWeight: "bold" }}>Net Change: NPR {formatMoney(cashFlow.netChange)}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>SECTION / PARTICULAR</Text>
            <Text style={styles.col2}>AMOUNT (NPR)</Text>
          </View>

          <View style={styles.tableRow}><Text style={[styles.col1, { fontWeight: "bold" }]}>CASH FLOW FROM OPERATING ACTIVITIES</Text></View>
          <View style={styles.tableRowAlternate}><Text style={styles.col1}>  Receipts from Customers</Text><Text style={styles.col2}>{formatMoney(cashFlow.operating.receiptsFromCustomers)}</Text></View>
          <View style={styles.tableRow}><Text style={styles.col1}>  Less: Payments to Suppliers</Text><Text style={styles.col2}>({formatMoney(cashFlow.operating.paymentsToSuppliers)})</Text></View>
          <View style={styles.tableRowAlternate}><Text style={styles.col1}>  Less: Operating Expenses Paid</Text><Text style={styles.col2}>({formatMoney(cashFlow.operating.operatingExpenses)})</Text></View>
          <View style={styles.tableTotalRow}><Text style={styles.col1}>NET CASH FROM OPERATING ACTIVITIES (A)</Text><Text style={styles.col2}>{formatMoney(cashFlow.operating.netOperating)}</Text></View>

          <View style={styles.tableRow}><Text style={[styles.col1, { fontWeight: "bold", marginTop: 4 }]}>CASH FLOW FROM INVESTING ACTIVITIES</Text></View>
          <View style={styles.tableRowAlternate}><Text style={styles.col1}>  Less: Purchase of Fixed Assets</Text><Text style={styles.col2}>({formatMoney(cashFlow.investing.fixedAssetPurchases)})</Text></View>
          <View style={styles.tableTotalRow}><Text style={styles.col1}>NET CASH USED IN INVESTING ACTIVITIES (B)</Text><Text style={styles.col2}>{formatMoney(cashFlow.investing.netInvesting)}</Text></View>

          <View style={styles.tableRow}><Text style={[styles.col1, { fontWeight: "bold", marginTop: 4 }]}>CASH FLOW FROM FINANCING ACTIVITIES</Text></View>
          <View style={styles.tableRowAlternate}><Text style={styles.col1}>  Owner Capital Contributions</Text><Text style={styles.col2}>{formatMoney(cashFlow.financing.capitalContributions)}</Text></View>
          <View style={styles.tableTotalRow}><Text style={styles.col1}>NET CASH FROM FINANCING ACTIVITIES (C)</Text><Text style={styles.col2}>{formatMoney(cashFlow.financing.netFinancing)}</Text></View>

          <View style={[styles.tableTotalRow, { backgroundColor: "#f3f4f6", borderTopWidth: 2 }]}><Text style={styles.col1}>NET INCREASE/DECREASE IN CASH (A + B + C)</Text><Text style={styles.col2}>{formatMoney(cashFlow.netChange)}</Text></View>
          <View style={styles.tableRow}><Text style={styles.col1}>Cash and Cash Equivalents at Beginning of Period</Text><Text style={styles.col2}>{formatMoney(cashFlow.openingCash)}</Text></View>
          <View style={[styles.tableTotalRow, { backgroundColor: "#e5e7eb" }]}><Text style={[styles.col1, { fontWeight: "bold" }]}>CASH AND CASH EQUIVALENTS AT END OF PERIOD</Text><Text style={[styles.col2, { fontWeight: "bold" }]}>{formatMoney(cashFlow.closingCash)}</Text></View>
        </View>
      </StandardPageWrapper>

      {/* PAGE 6: TOP SELLING PRODUCTS */}
      <StandardPageWrapper title="Product Sales Volume & Contribution" subtitle={`Fiscal Period: ${fiscalYear.name}`}>
        <View style={styles.metaSection}>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionTitle}>Section Summary</Text>
            <Text style={styles.titleText}>Product outflows and margin contributions</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionTitle}>Total Product Items Sold</Text>
            <Text style={{ fontWeight: "bold" }}>
              Qty: {topSelling.reduce((acc: number, curr: any) => acc + curr.quantity, 0)} Units
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colItemCode}>Item Code</Text>
            <Text style={styles.colItemName}>Product Particulars Description</Text>
            <Text style={styles.colItemQty}>Qty Sold</Text>
            <Text style={styles.colItemVal}>Revenue (NPR)</Text>
            <Text style={styles.colItemProfit}>Net Margin (NPR)</Text>
          </View>

          {topSelling.map((r: any, idx: number) => (
            <View key={idx} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}>
              <Text style={styles.colItemCode}>{r.code}</Text>
              <Text style={styles.colItemName}>{r.name}</Text>
              <Text style={styles.colItemQty}>{r.quantity}</Text>
              <Text style={styles.colItemVal}>{formatMoney(r.revenue)}</Text>
              <Text style={styles.colItemProfit}>{formatMoney(r.profit)}</Text>
            </View>
          ))}

          {topSelling.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.colItemName, { width: "100%", textAlign: "center", fontStyle: "italic" }]}>
                No product sales recorded in this period.
              </Text>
            </View>
          )}

          <View style={styles.tableTotalRow}>
            <Text style={styles.colItemCode}>-</Text>
            <Text style={styles.colItemName}>TOTAL VOLUME ACCUMULATED</Text>
            <Text style={styles.colItemQty}>{topSelling.reduce((acc: number, curr: any) => acc + curr.quantity, 0)}</Text>
            <Text style={styles.colItemVal}>{formatMoney(topSelling.reduce((acc: number, curr: any) => acc + curr.revenue, 0))}</Text>
            <Text style={styles.colItemProfit}>{formatMoney(topSelling.reduce((acc: number, curr: any) => acc + curr.profit, 0))}</Text>
          </View>
        </View>
      </StandardPageWrapper>

      {/* PAGE 7: VENDOR OUTSTANDING PAYABLES */}
      <StandardPageWrapper title="Vendor Outstanding Payables" subtitle={`As of: ${formattedEnd}`}>
        <View style={styles.metaSection}>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionTitle}>Section Summary</Text>
            <Text style={styles.titleText}>Outstanding dues to suppliers & vendors</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionTitle}>Total Outstanding Payables</Text>
            <Text style={{ fontWeight: "bold" }}>
              NPR {formatMoney(vendorOutstanding.reduce((acc: number, curr: any) => acc + curr.balance, 0))}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colVendCode}>Vendor Code</Text>
            <Text style={styles.colVendName}>Vendor / Supplier Name Particulars</Text>
            <Text style={styles.colVendPan}>PAN Number</Text>
            <Text style={styles.colVendBal}>Outstanding Balance (NPR)</Text>
          </View>

          {vendorOutstanding.map((r: any, idx: number) => (
            <View key={idx} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}>
              <Text style={styles.colVendCode}>{r.code}</Text>
              <Text style={styles.colVendName}>{r.name}</Text>
              <Text style={styles.colVendPan}>{r.pan}</Text>
              <Text style={styles.colVendBal}>{formatMoney(r.balance)}</Text>
            </View>
          ))}

          {vendorOutstanding.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.colVendName, { width: "100%", textAlign: "center", fontStyle: "italic" }]}>
                No supplier outstanding payables as of this date.
              </Text>
            </View>
          )}

          <View style={styles.tableTotalRow}>
            <Text style={styles.colVendCode}>-</Text>
            <Text style={styles.colVendName}>TOTAL OUTSTANDING ACCOUNT PAYABLE</Text>
            <Text style={styles.colVendPan}>-</Text>
            <Text style={styles.colVendBal}>{formatMoney(vendorOutstanding.reduce((acc: number, curr: any) => acc + curr.balance, 0))}</Text>
          </View>
        </View>
      </StandardPageWrapper>

      {/* PAGE 8: PROJECTS COSTING & PROFITABILITY */}
      <StandardPageWrapper title="Projects Profitability Summary" subtitle={`Fiscal Period: ${fiscalYear.name}`}>
        <View style={styles.metaSection}>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionTitle}>Section Summary</Text>
            <Text style={styles.titleText}>Construction site margin and material issues audit</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionTitle}>Total Net Project Profit</Text>
            <Text style={{ fontWeight: "bold" }}>
              NPR {formatMoney(projects.reduce((acc: number, curr: any) => acc + curr.profit, 0))}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colPrjCode}>Code</Text>
            <Text style={styles.colPrjName}>Project Site Description</Text>
            <Text style={styles.colPrjVal}>Contract</Text>
            <Text style={styles.colPrjVal}>Billed</Text>
            <Text style={styles.colPrjVal}>Materials Cost</Text>
            <Text style={styles.colPrjVal}>Net Profit</Text>
            <Text style={styles.colPrjMargin}>Margin%</Text>
          </View>

          {projects.map((r: any, idx: number) => (
            <View key={idx} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}>
              <Text style={styles.colPrjCode}>{r.code}</Text>
              <Text style={styles.colPrjName}>{r.name}</Text>
              <Text style={styles.colPrjVal}>{formatMoney(r.contractAmount)}</Text>
              <Text style={styles.colPrjVal}>{formatMoney(r.totalBilled)}</Text>
              <Text style={styles.colPrjVal}>{formatMoney(r.materialCost)}</Text>
              <Text style={styles.colPrjVal}>{formatMoney(r.profit)}</Text>
              <Text style={styles.colPrjMargin}>{r.margin.toFixed(2)}%</Text>
            </View>
          ))}

          {projects.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.colPrjName, { width: "100%", textAlign: "center", fontStyle: "italic" }]}>
                No project activities or milestone billings in this period.
              </Text>
            </View>
          )}

          <View style={styles.tableTotalRow}>
            <Text style={styles.colPrjCode}>-</Text>
            <Text style={styles.colPrjName}>TOTAL ACCUMULATION</Text>
            <Text style={styles.colPrjVal}>{formatMoney(projects.reduce((acc: number, curr: any) => acc + curr.contractAmount, 0))}</Text>
            <Text style={styles.colPrjVal}>{formatMoney(projects.reduce((acc: number, curr: any) => acc + curr.totalBilled, 0))}</Text>
            <Text style={styles.colPrjVal}>{formatMoney(projects.reduce((acc: number, curr: any) => acc + curr.materialCost, 0))}</Text>
            <Text style={styles.colPrjVal}>{formatMoney(projects.reduce((acc: number, curr: any) => acc + curr.profit, 0))}</Text>
            <Text style={styles.colPrjMargin}>-</Text>
          </View>
        </View>
      </StandardPageWrapper>
    </Document>
  );
}

export async function downloadFiscalYearBinderPDF(data: any): Promise<Blob> {
  return pdf(<FiscalYearBinderPDF data={data} />).toBlob();
}
