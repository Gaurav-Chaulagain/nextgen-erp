"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Role } from "../../lib/constants";
import { hasPermission, Module } from "../../auth/permissions";
import { Badge } from "../ui/badge";
import { ROLE_LABELS } from "../../lib/constants";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FileSpreadsheet,
  Briefcase,
  BookOpen,
  Wallet,
  BarChart3,
  Users,
  Settings,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: Role;
  };
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  module: Module | "settings"; // Settings module doesn't map directly to db but we can show it to everyone
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, module: "dashboard" },
  { label: "Inventory", href: "/inventory", icon: Package, module: "inventory" },
  { label: "Purchase", href: "/purchase", icon: ShoppingBag, module: "purchase" },
  { label: "Sales", href: "/sales", icon: FileSpreadsheet, module: "sales" },
  { label: "Projects", href: "/projects", icon: Briefcase, module: "projects" },
  { label: "Ledger", href: "/ledger", icon: BookOpen, module: "ledger" },
  { label: "Cash Book", href: "/cashbook", icon: Wallet, module: "cashbook" },
  { label: "Reports", href: "/reports", icon: BarChart3, module: "reports" },
  { label: "Users", href: "/users", icon: Users, module: "users" },
  { label: "Settings", href: "/settings", icon: Settings, module: "settings" },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const filteredNavItems = navItems.filter((item) => {
    if (item.module === "settings") return true;
    return hasPermission(user.role, item.module, "view");
  });

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-300 dark:bg-black border-r border-zinc-800">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/60">
        <Link href="/dashboard" className="flex flex-col">
          <span className="text-md font-bold tracking-tight text-white uppercase">
            NextGen ERP
          </span>
          <span className="text-xs text-zinc-500 font-medium">
            Interior & Waterproofing
          </span>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "hover:bg-zinc-800/50 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Session Details at bottom */}
      <div className="p-4 border-t border-zinc-800/60 bg-zinc-950/20">
        <div className="flex flex-col gap-3 px-3 py-2.5 rounded-2xl bg-zinc-950/40 border border-zinc-800/40">
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-white truncate">
              {user.name || "ERP Staff"}
            </p>
            <p className="text-xs text-zinc-500 truncate mt-0.5">
              {user.email || "staff@nextgen.com"}
            </p>
            <div className="mt-2.5">
              <Badge className="bg-primary/15 text-primary border border-primary/25 rounded-md text-[10px] uppercase font-bold py-0.5 px-2">
                {ROLE_LABELS[user.role]}
              </Badge>
            </div>
          </div>
          
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800/40 gap-2 h-9 p-0 px-3 rounded-xl border border-zinc-800/40 mt-1"
          >
            <LogOut className="h-4 w-4 text-zinc-400" />
            <span className="text-xs font-semibold">Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <div className="hidden lg:flex flex-col w-64 h-full shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Drawer Trigger (Only visible on mobile headers) */}
      <div className="lg:hidden">
        {/* Rendered inside Dashboard layout via sheet trigger */}
      </div>
    </>
  );
}

export default Sidebar;
