export type CashBookEntry = {
  id: string;
  reference: string;
  type: "INFLOW" | "OUTFLOW";
  amount: number;
  description?: string;
  date: string;
};

export function recordCashBookEntry(entry: CashBookEntry): CashBookEntry {
  return entry;
}

export function summarizeCashBook(entries: CashBookEntry[]) {
  return entries.reduce(
    (summary, entry) => {
      if (entry.type === "INFLOW") {
        summary.inflow += entry.amount;
      } else {
        summary.outflow += entry.amount;
      }
      return summary;
    },
    { inflow: 0, outflow: 0 }
  );
}
