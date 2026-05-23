import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function csvEscape(value: any) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (s.includes(',') || s.includes('\n') || s.includes('"')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export async function GET() {
  const db = await getDb();

  const rows = await db.inventoryStock.findMany({ include: { product: true, warehouse: true } });

  const header = ['stockId', 'productId', 'productCode', 'productName', 'warehouseId', 'warehouse', 'quantity', 'reservedQty', 'reorderLevel', 'lastUpdated'];

  const lines = [header.join(',')];

  for (const r of rows) {
    lines.push([
      csvEscape(r.id),
      csvEscape(r.productId),
      csvEscape(r.product.code),
      csvEscape(r.product.name),
      csvEscape(r.warehouseId),
      csvEscape(r.warehouse.name),
      csvEscape(r.quantity),
      csvEscape(r.reservedQty),
      csvEscape(r.product.reorderLevel),
      csvEscape(r.lastUpdated.toISOString()),
    ].join(','));
  }

  const csv = lines.join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="inventory_export_${Date.now()}.csv"`,
    },
  });
}
