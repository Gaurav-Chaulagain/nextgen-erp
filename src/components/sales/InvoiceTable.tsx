"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import { formatNPR } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { SalesInvoiceSchema } from "@/modules/sales/types";

interface InvoiceTableProps {
  invoices: SalesInvoiceSchema[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  const channelColors: Record<string, string> = {
    RETAIL: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
    WHOLESALE: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
    PROJECT: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200",
  };

  const statusColors: Record<string, string> = {
    DRAFT: "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100",
    SENT: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
    PARTIAL: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
    PAID: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
    OVERDUE: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
    CANCELLED: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  };

  const columns: ColumnDef<SalesInvoiceSchema, any>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
      cell: ({ row }) => <span className="font-mono text-sm font-semibold">{row.original.invoiceNumber}</span>,
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{row.original.customerName}</p>
          {row.original.projectName && <p className="text-xs text-zinc-500">{row.original.projectName}</p>}
        </div>
      ),
    },
    {
      accessorKey: "invoiceType",
      header: "Channel",
      cell: ({ row }) => <Badge className={channelColors[row.original.invoiceType]}>{row.original.invoiceType}</Badge>,
    },
    {
      accessorKey: "invoiceDate",
      header: "Date",
      cell: ({ row }) => <span className="text-sm">{new Date(row.original.invoiceDate).toLocaleDateString("en-IN")}</span>,
    },
    {
      id: "items",
      header: "Items",
      cell: ({ row }) => <span className="text-sm">{row.original.items.length}</span>,
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => <span className="font-semibold">{formatNPR(Number(row.original.totalAmount))}</span>,
    },
    {
      accessorKey: "paidAmount",
      header: "Paid",
      cell: ({ row }) => <span>{formatNPR(Number(row.original.paidAmount))}</span>,
    },
    {
      accessorKey: "balanceAmount",
      header: "Balance",
      cell: ({ row }) => (
        <span className={Number(row.original.balanceAmount) > 0 ? "font-semibold text-amber-600" : "font-semibold text-green-600"}>
          {formatNPR(Number(row.original.balanceAmount))}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <Badge className={statusColors[row.original.status]}>{row.original.status}</Badge>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: () => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">View/Print</Button>
          <Button variant="outline" size="sm">Payment</Button>
          <Button variant="outline" size="sm">Return</Button>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={invoices} searchPlaceholder="Search invoices..." searchColumnId="customerName" />;
}
