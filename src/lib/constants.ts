export const VAT_RATE = 0.13; // Nepal standard VAT: 13%
export const CURRENCY = "NPR"; // Nepali Rupee
export const PAGINATION_SIZE = 20;

export const INVOICE_COLORS = {
  RETAIL: "#2563eb", // Blue
  WHOLESALE: "#16a34a", // Green
  PROJECT: "#9333ea", // Purple
} as const;

export const ROLES = [
  "SUPERADMIN",
  "OWNER",
  "MANAGER",
  "SALES_STAFF",
  "PURCHASE_STAFF",
  "VIEWER",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  SUPERADMIN: "Super Admin",
  OWNER: "Business Owner",
  MANAGER: "Manager",
  SALES_STAFF: "Sales Staff",
  PURCHASE_STAFF: "Purchase Staff",
  VIEWER: "Viewer / Read-Only",
};
