"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

export function AddProductModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<any>({ name: '', categoryId: '', brandId: '', warehouseId: '', unit: 'PCS', description: '', minStockLevel: 0, reorderLevel: 0, quantity: 0, variants: [] });
  const [options, setOptions] = useState({ categories: [] as any[], brands: [] as any[], warehouses: [] as any[] });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/inventory/lookups');
        const j = await res.json();
        if (!mounted) return;
        setOptions({ categories: j.categories || [], brands: j.brands || [], warehouses: j.warehouses || [] });
      } catch (err) {
        console.error('Failed to load lookups', err);
      }
    })();
    return () => { mounted = false };
  }, []);
  const router = useRouter();

  function update<K extends string>(key: K, value: any) {
    setForm((s: any) => ({ ...s, [key]: value }));
  }

  function addVariant() {
    setForm((s: any) => ({ ...s, variants: [...(s.variants || []), { supplierId: '', purchasePrice: 0, retailPrice: 0, wholesalePrice: 0, projectPrice: 0 }] }));
  }

  async function submit() {
    try {
      const res = await fetch('/api/inventory/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
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
        <Button variant="default">Add Product</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{step === 1 ? 'Add Product — Basic' : 'Add Product — Vendor Pricing'}</DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-3">
            <Input placeholder="Name" value={form.name} onChange={(e) => update('name', e.target.value)} />
            <input list="categories" value={form.categoryId} onChange={(e) => update('categoryId', e.target.value)} className="w-full rounded-md border px-3 py-2" placeholder="Select category" />
            <datalist id="categories">
              {options.categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </datalist>

            <input list="brands" value={form.brandId} onChange={(e) => update('brandId', e.target.value)} className="w-full rounded-md border px-3 py-2" placeholder="Select brand" />
            <datalist id="brands">
              {options.brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </datalist>

            <input list="warehouses" value={form.warehouseId} onChange={(e) => update('warehouseId', e.target.value)} className="w-full rounded-md border px-3 py-2" placeholder="Select warehouse" />
            <datalist id="warehouses">
              {options.warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </datalist>
            <Input placeholder="Unit" value={form.unit} onChange={(e) => update('unit', e.target.value)} />
            <div className="flex gap-2">
              <Input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => update('quantity', Number(e.target.value))} />
              <Input type="number" placeholder="Reorder Level" value={form.reorderLevel} onChange={(e) => update('reorderLevel', Number(e.target.value))} />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {(form.variants || []).map((v: any, i: number) => (
              <div key={i} className="grid grid-cols-2 gap-2">
                <Input placeholder="Supplier ID" value={v.supplierId} onChange={(e) => { const arr = [...form.variants]; arr[i].supplierId = e.target.value; setForm({ ...form, variants: arr }); }} />
                <Input placeholder="Purchase Price" type="number" value={v.purchasePrice} onChange={(e) => { const arr = [...form.variants]; arr[i].purchasePrice = Number(e.target.value); setForm({ ...form, variants: arr }); }} />
                <Input placeholder="Retail Price" type="number" value={v.retailPrice} onChange={(e) => { const arr = [...form.variants]; arr[i].retailPrice = Number(e.target.value); setForm({ ...form, variants: arr }); }} />
                <Input placeholder="Wholesale Price" type="number" value={v.wholesalePrice} onChange={(e) => { const arr = [...form.variants]; arr[i].wholesalePrice = Number(e.target.value); setForm({ ...form, variants: arr }); }} />
              </div>
            ))}
            <div>
              <Button variant="outline" onClick={addVariant}>Add Variant</Button>
            </div>
          </div>
        )}

        <DialogFooter>
          {step > 1 && <Button variant="outline" onClick={() => setStep((s) => s - 1)}>Back</Button>}
          {step < 2 && <Button onClick={() => setStep(2)}>Next</Button>}
          {step === 2 && <Button onClick={submit}>Create Product</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddProductModal;
