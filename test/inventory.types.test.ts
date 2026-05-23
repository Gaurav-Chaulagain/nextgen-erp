import { describe, it, expect } from 'vitest';
import { createInventoryItemSchema, adjustInventoryQuantitySchema } from '../src/modules/inventory/types';
import { needsReorder } from '../src/modules/inventory/utils';

describe('Inventory module validation', () => {
  it('accepts string prices in variant definitions', () => {
    const result = createInventoryItemSchema.safeParse({
      name: 'Test Product',
      categoryId: 'cat-1',
      brandId: 'brand-1',
      warehouseId: 'wh-1',
      unit: 'PCS',
      minStockLevel: 5,
      reorderLevel: 10,
      quantity: 20,
      variants: [
        {
          supplierId: 'sup-1',
          purchasePrice: '50.75',
          retailPrice: '70.00',
          wholesalePrice: '60.00',
          projectPrice: '65.00',
          effectiveDate: '2026-01-01',
          isActive: true,
        },
      ],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.variants?.[0].purchasePrice).toBe('50.75');
      expect(result.data.variants?.[0].retailPrice).toBe('70.00');
    }
  });

  it('validates adjustment schema', () => {
    const result = adjustInventoryQuantitySchema.safeParse({ stockId: 'stock-1', adjustment: -5, notes: 'Shrinkage' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.adjustment).toBe(-5);
      expect(result.data.stockId).toBe('stock-1');
    }
  });

  it('identifies reorder state correctly', () => {
    expect(needsReorder(4, 10)).toBe(true);
    expect(needsReorder(10, 10)).toBe(true);
    expect(needsReorder(11, 10)).toBe(false);
  });
});
