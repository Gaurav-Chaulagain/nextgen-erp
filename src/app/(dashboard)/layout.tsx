import React from "react";
import { redirect } from "next/navigation";
import { auth } from "../../auth-middleware";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await auth();

  // If no session exists, redirect to login page (fallback check)
  if (!session?.user) {
    redirect("/login");
  }

  // Cast user role
  const user = {
    name: session.user.name,
    email: session.user.email,
    role: (session.user as any).role,
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header Bar */}
        <Header user={user} />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-7xl h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
