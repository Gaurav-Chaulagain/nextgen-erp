import { NextResponse } from 'next/server';
import { json } from 'stream/consumers';
import { getCurrentUser } from '@/auth/session';
import { createInventoryItem } from '@/modules/inventory/actions';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  try {
    const created = await createInventoryItem(body, user.id);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 400 });
  }
}
