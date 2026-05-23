import React from "react";
import { PageHeader } from "../../../components/layout/PageHeader";

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Welcome to NextGen ERP"
        description="Your centralized operations hub for Interior and Waterproofing business management."
      />

      <div className="rounded-3xl border border-dashed border-zinc-200 bg-white p-16 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm uppercase tracking-[0.35em] text-emerald-500">ERP Control Panel</p>
        <h2 className="mt-5 text-4xl font-bold text-zinc-950 dark:text-zinc-50">
          Welcome to NextGen ERP
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-sm leading-7 text-zinc-500 dark:text-zinc-400">
          Begin with inventory management, purchase approvals, sales tracking, project billing, and financial reporting from one single dashboard.
        </p>
      </div>
    </div>
  );
}
