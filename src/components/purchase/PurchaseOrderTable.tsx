"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { PurchaseOrderSchema } from "@/modules/purchase/types";

interface PurchaseOrderTableProps {
  orders: PurchaseOrderSchema[];
}

export function PurchaseOrderTable({ orders }: PurchaseOrderTableProps) {
  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
    ORDERED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    PARTIAL: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
    RECEIVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  };

  const columns: ColumnDef<PurchaseOrderSchema, any>[] = [
    {
      accessorKey: "poNumber",
      header: "PO #",
      cell: ({ row }) => (
        <span className="font-mono text-sm font-semibold">{row.original.poNumber}</span>
      ),
    },
    {
      accessorKey: "supplierName",
      header: "Vendor",
      cell: ({ row }) => (
        <div className="text-sm text-zinc-900 dark:text-zinc-50">{row.original.supplierName}</div>
      ),
    },
    {
      accessorKey: "orderDate",
      header: "Order Date",
      cell: ({ row }) => (
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {new Date(row.original.orderDate).toLocaleDateString("en-IN")}
        </span>
      ),
    },
    {
      accessorKey: "expectedDate",
      header: "Expected Delivery",
      cell: ({ row }) => (
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {row.original.expectedDate
            ? new Date(row.original.expectedDate).toLocaleDateString("en-IN")
            : "—"
          }
        </span>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-semibold">
          NPR {parseFloat(row.original.totalAmount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
        </span>
      ),
    },
    {
      accessorKey: "paidAmount",
      header: "Paid",
      cell: ({ row }) => (
        <span className="text-sm">
          NPR {parseFloat(row.original.paidAmount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
        </span>
      ),
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => (
        <span className={parseFloat(row.original.balance) > 0 ? "text-orange-600 font-semibold" : "text-green-600 font-semibold"}>
          NPR {parseFloat(row.original.balance).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={statusColors[row.original.status] || statusColors.DRAFT}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            View
          </Button>
          {["ORDERED", "PARTIAL", "RECEIVED"].includes(row.original.status) && (
            <Button variant="outline" size="sm">
              Receive
            </Button>
          )}
          {parseFloat(row.original.balance) > 0 && (
            <Button variant="outline" size="sm">
              Pay
            </Button>
          )}
          {!row.original.billImageUrl && (
            <Button variant="outline" size="sm">
              Bill
            </Button>
          )}
          {["DRAFT", "ORDERED"].includes(row.original.status) && (
            <Button variant="outline" size="sm" className="text-red-600">
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={orders} />;
}
