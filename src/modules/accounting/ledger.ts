export type LedgerEntry = {
  id: string;
  description: string;
  account: string;
  debit: number;
  credit: number;
  postedAt: string;
};

export function calculateLedgerBalance(entries: LedgerEntry[]): number {
  return entries.reduce((balance, entry) => balance + entry.debit - entry.credit, 0);
}

export function createLedgerEntry(entry: LedgerEntry): LedgerEntry {
  return { ...entry };
}
