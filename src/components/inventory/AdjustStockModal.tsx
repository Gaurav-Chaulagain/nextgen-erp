"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

export function AdjustStockModal({ initialStockId, open: openProp, onOpenChange }: { initialStockId?: string; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = typeof openProp === 'boolean' ? openProp : internalOpen;
  const setOpen = (v: boolean) => {
    if (typeof openProp === 'boolean') {
      onOpenChange?.(v);
    } else {
      setInternalOpen(v);
    }
  };
  const [stockId, setStockId] = useState(initialStockId || '');
  const [adjustment, setAdjustment] = useState(0);
  const [notes, setNotes] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (initialStockId) {
      setStockId(initialStockId);
      setOpen(true);
    }
  }, [initialStockId]);

  async function submit() {
    try {
      const res = await fetch('/api/inventory/adjust', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stockId, adjustment, notes }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Failed');
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Error: ' + (err as any).message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Adjust Stock</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input placeholder="Stock ID" value={stockId} onChange={(e) => setStockId(e.target.value)} />
          <Input placeholder="Adjustment (positive or negative)" type="number" value={adjustment} onChange={(e) => setAdjustment(Number(e.target.value))} />
          <Input placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AdjustStockModal;
