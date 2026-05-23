export type DepreciationEntry = {
  assetId: string;
  fiscalYear: string;
  amount: number;
  accumulated: number;
  recordedAt: string;
};

export function calculateDepreciation(cost: number, salvage: number, lifeYears: number): number {
  if (lifeYears <= 0) return 0;
  return (cost - salvage) / lifeYears;
}

export function createDepreciationEntry(entry: DepreciationEntry): DepreciationEntry {
  return entry;
}
