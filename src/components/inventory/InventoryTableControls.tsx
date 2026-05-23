"use client";

import React from 'react';

export function PaginationControls({ page, pageSize, total, onPageChange }: { page: number; pageSize: number; total: number; onPageChange?: (p: number) => void; }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-between mt-3">
      <div className="text-sm text-zinc-500">Showing page {page} of {pageCount} ({total} items)</div>
      <div className="flex gap-2">
        <button className="btn" onClick={() => onPageChange?.(Math.max(1, page - 1))} disabled={page <= 1}>Prev</button>
        <button className="btn" onClick={() => onPageChange?.(Math.min(pageCount, page + 1))} disabled={page >= pageCount}>Next</button>
      </div>
    </div>
  );
}

export default PaginationControls;
