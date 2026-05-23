"use client";

import React, { useState } from "react";
import { PageHeader } from "../../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { DataTable } from "../../../components/shared/DataTable";
import { StatusBadge } from "../../../components/shared/StatusBadge";
import { ColumnDef } from "@tanstack/react-table";
import type { Role } from "../../../lib/constants";
import { ROLE_LABELS } from "../../../lib/constants";
import { Users, UserPlus, ShieldAlert, KeyRound } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
}

const mockUsers: UserItem[] = [
  {
    id: "USR-001",
    name: "Nischal Timsina",
    email: "nischal@nextgen.com",
    role: "OWNER",
    isActive: true,
    createdAt: "2026-01-01",
    lastLogin: "2026-05-21 17:45",
  },
  {
    id: "USR-002",
    name: "Rabin Sharma",
    email: "rabin@nextgen.com",
    role: "SUPERADMIN",
    isActive: true,
    createdAt: "2026-01-01",
    lastLogin: "2026-05-21 18:02",
  },
  {
    id: "USR-003",
    name: "Sita Dahal",
    email: "sita@nextgen.com",
    role: "MANAGER",
    isActive: true,
    createdAt: "2026-02-15",
    lastLogin: "2026-05-21 15:30",
  },
  {
    id: "USR-004",
    name: "Gopal Adhikari",
    email: "gopal@nextgen.com",
    role: "SALES_STAFF",
    isActive: true,
    createdAt: "2026-03-10",
    lastLogin: "2026-05-20 16:15",
  },
  {
    id: "USR-005",
    name: "Hari Prasad",
    email: "hari@nextgen.com",
    role: "PURCHASE_STAFF",
    isActive: false,
    createdAt: "2026-04-01",
    lastLogin: "2026-04-10 11:20",
  },
];

export default function UsersPage() {
  const [data] = useState<UserItem[]>(mockUsers);

  const columns: ColumnDef<UserItem>[] = [
    {
      accessorKey: "name",
      header: "User Name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-zinc-900 dark:text-zinc-50">{row.getValue("name")}</span>
          <span className="text-xs text-zinc-400 font-mono mt-0.5">{row.original.id}</span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email Address",
      cell: ({ row }) => (
        <span className="text-zinc-600 dark:text-zinc-400 font-medium">{row.getValue("email")}</span>
      ),
    },
    {
      accessorKey: "role",
      header: "Security Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as Role;
        let roleBadgeStyle = "";
        switch (role) {
          case "SUPERADMIN":
            roleBadgeStyle = "bg-rose-500/10 text-rose-600 border border-rose-500/25";
            break;
          case "OWNER":
            roleBadgeStyle = "bg-purple-500/10 text-purple-600 border border-purple-500/25";
            break;
          case "MANAGER":
            roleBadgeStyle = "bg-blue-500/10 text-blue-600 border border-blue-500/25";
            break;
          default:
            roleBadgeStyle = "bg-zinc-500/10 text-zinc-600 border border-zinc-500/25 dark:text-zinc-400";
            break;
        }
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider ${roleBadgeStyle}`}>
            {ROLE_LABELS[role]}
          </span>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const active = row.getValue("isActive") as boolean;
        return <StatusBadge status={active ? "ACTIVE" : "CANCELLED"} />;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Registered On",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-zinc-500">{row.getValue("createdAt")}</span>
      ),
    },
    {
      accessorKey: "lastLogin",
      header: "Last Active",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-zinc-500">{row.getValue("lastLogin") || "Never"}</span>
      ),
    },
    {
      id: "actions",
      header: "Operations",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => alert(`Resetting password/permissions for: ${row.original.name}`)}
          className="h-8 text-xs font-bold border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          Manage Access
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="User & Security Management"
        description="Configure access control lists, invite branch managers, and verify audit logs."
        actions={
          <Button className="h-10 px-4 rounded-xl flex items-center gap-2 font-bold shadow-md shadow-primary/20">
            <UserPlus className="h-4 w-4" />
            Invite Staff Member
          </Button>
        }
      />

      {/* Security Status Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border border-zinc-100 shadow-sm rounded-2xl dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Active Staff Accounts</CardTitle>
            <div className="p-2.5 rounded-xl text-blue-500 bg-blue-50 dark:bg-blue-950/20">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">4</div>
            <p className="text-xs text-zinc-400 font-medium mt-1">Authorized logins to operations console</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-100 shadow-sm rounded-2xl dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Security Roles Assigned</CardTitle>
            <div className="p-2.5 rounded-xl text-purple-500 bg-purple-50 dark:bg-purple-950/20">
              <KeyRound className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">4 / 6 Roles</div>
            <p className="text-xs text-zinc-400 font-medium mt-1">Matrix privileges mapped correctly</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-100 shadow-sm rounded-2xl dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Disabled / Revoked</CardTitle>
            <div className="p-2.5 rounded-xl text-rose-500 bg-rose-50 dark:bg-rose-950/20">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">1 Account</div>
            <p className="text-xs text-zinc-400 font-medium mt-1">Revoked security credentials</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Database Table */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Authorized Personnel Directory</h2>
        </div>

        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Search by username or email..."
          searchColumnId="name"
          pagination={{
            pageIndex: 0,
            pageSize: 5,
            pageCount: 1,
            totalItems: data.length,
          }}
        />
      </div>
    </div>
  );
}
