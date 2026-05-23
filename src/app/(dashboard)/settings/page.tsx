import React from "react";
import { PageHeader } from "../../../components/layout/PageHeader";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure system preferences, user profiles, and ERP defaults."
      />
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Settings are available in the next iteration.</h3>
        <p className="text-xs text-zinc-500 mt-1 dark:text-zinc-400">This area will centralize permissions, appearance, and company settings.</p>
      </div>
    </div>
  );
}
