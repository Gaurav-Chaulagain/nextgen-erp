export type ReportSummary = {
  title: string;
  value: number;
  unit?: string;
};

export function generateSalesReport(period: string): ReportSummary[] {
  return [
    { title: `Sales for ${period}`, value: 0, unit: "NPR" },
  ];
}

export function generatePurchaseReport(period: string): ReportSummary[] {
  return [
    { title: `Purchases for ${period}`, value: 0, unit: "NPR" },
  ];
}
