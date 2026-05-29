import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = await getDb();

  const [categories, brands, warehouses, suppliers] = await Promise.all([
    db.category.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
    db.brand.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
    db.warehouse.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
    db.supplier.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
  ]);

  return NextResponse.json({ categories, brands, warehouses, suppliers });
}
