export function needsReorder(quantity: number, reorderLevel: number): boolean {
  return quantity <= reorderLevel;
}

export function formatStockStatus(quantity: number, reorderLevel: number): "ok" | "reorder" {
  return needsReorder(quantity, reorderLevel) ? "reorder" : "ok";
}

export function buildInventoryCode(prefix: string, id: string): string {
  return `${prefix}-${id.slice(0, 8).toUpperCase()}`;
}
