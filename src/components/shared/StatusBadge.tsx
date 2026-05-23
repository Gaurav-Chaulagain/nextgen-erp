import React from "react";
import { Badge } from "../ui/badge";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // Return different colors depending on common ERP statuses
  const getStatusStyles = (stat: string) => {
    const s = stat.toUpperCase();
    switch (s) {
      // General Active/Completed/Paid
      case "ACTIVE":
      case "COMPLETED":
      case "RECEIVED":
      case "PAID":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20";
      // Warnings / Pending / Partial
      case "PLANNING":
      case "ORDERED":
      case "PARTIAL":
      case "SENT":
      case "PENDING":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20";
      // Danger / Cancelled / Overdue
      case "CANCELLED":
      case "OVERDUE":
      case "ON_HOLD":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20";
      // Draft / Inactive
      case "DRAFT":
      case "INACTIVE":
      default:
        return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20 hover:bg-zinc-500/20";
    }
  };

  return (
    <Badge variant="outline" className={`font-semibold capitalize px-2 py-0.5 rounded-full border ${getStatusStyles(status)}`}>
      {status.toLowerCase().replace("_", " ")}
    </Badge>
  );
}
export default StatusBadge;
