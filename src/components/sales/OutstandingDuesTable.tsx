"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import { formatNPR } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { OutstandingDueSchema } from "@/modules/sales/types";

interface OutstandingDuesTableProps {
  dues: OutstandingDueSchema[];
}

export function OutstandingDuesTable({ dues }: OutstandingDuesTableProps) {
  const columns: ColumnDef<OutstandingDueSchema, any>[] = [
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => <span className="font-medium">{row.original.customerName}</span>,
    },
    {
      accessorKey: "customerType",
      header: "Type",
      cell: ({ row }) => <Badge variant="outline">{row.original.customerType}</Badge>,
    },
    {
      accessorKey: "totalBilled",
      header: "Total Billed",
      cell: ({ row }) => formatNPR(Number(row.original.totalBilled)),
    },
    {
      accessorKey: "totalPaid",
      header: "Total Paid",
      cell: ({ row }) => formatNPR(Number(row.original.totalPaid)),
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => <span className="font-semibold text-amber-600">{formatNPR(Number(row.original.balance))}</span>,
    },
    {
      accessorKey: "lastInvoiceDate",
      header: "Last Invoice",
      cell: ({ row }) => row.original.lastInvoiceDate ? new Date(row.original.lastInvoiceDate).toLocaleDateString("en-IN") : "-",
    },
    {
      accessorKey: "daysOverdue",
      header: "Days Overdue",
      cell: ({ row }) => <span className={row.original.daysOverdue > 30 ? "font-semibold text-red-600" : ""}>{row.original.daysOverdue}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: () => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Payment</Button>
          <Button variant="outline" size="sm">Ledger</Button>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={dues} searchPlaceholder="Search customers..." searchColumnId="customerName" />;
}
