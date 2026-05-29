import type { Role } from "../lib/constants";

export type Action = "view" | "create" | "edit" | "delete" | "export" | "approve";

export type Module =
  | "dashboard"
  | "inventory"
  | "purchase"
  | "sales"
  | "projects"
  | "ledger"
  | "cashbook"
  | "reports"
  | "users"
  | "expenses";

// Map each role to its allowed modules and the actions permitted within each module
const PERMISSIONS: Record<Role, Partial<Record<Module, Action[]>>> = {
  SUPERADMIN: {
    dashboard: ["view", "create", "edit", "delete", "export", "approve"],
    inventory: ["view", "create", "edit", "delete", "export", "approve"],
    purchase: ["view", "create", "edit", "delete", "export", "approve"],
    sales: ["view", "create", "edit", "delete", "export", "approve"],
    projects: ["view", "create", "edit", "delete", "export", "approve"],
    ledger: ["view", "create", "edit", "delete", "export", "approve"],
    cashbook: ["view", "create", "edit", "delete", "export", "approve"],
    reports: ["view", "create", "edit", "delete", "export", "approve"],
    users: ["view", "create", "edit", "delete", "export", "approve"],
    expenses: ["view", "create", "edit", "delete", "export", "approve"],
  },
  OWNER: {
    dashboard: ["view", "create", "edit", "delete", "export", "approve"],
    inventory: ["view", "create", "edit", "delete", "export", "approve"],
    purchase: ["view", "create", "edit", "delete", "export", "approve"],
    sales: ["view", "create", "edit", "delete", "export", "approve"],
    projects: ["view", "create", "edit", "delete", "export", "approve"],
    ledger: ["view", "create", "edit", "delete", "export", "approve"],
    cashbook: ["view", "create", "edit", "delete", "export", "approve"],
    reports: ["view", "create", "edit", "delete", "export", "approve"],
    users: ["view", "create", "edit", "delete", "export", "approve"],
    expenses: ["view", "create", "edit", "delete", "export", "approve"],
  },
  MANAGER: {
    dashboard: ["view", "create", "edit", "delete", "export", "approve"],
    inventory: ["view", "create", "edit", "delete", "export", "approve"],
    purchase: ["view", "create", "edit", "delete", "export", "approve"],
    sales: ["view", "create", "edit", "delete", "export", "approve"],
    projects: ["view", "create", "edit", "delete", "export", "approve"],
    ledger: ["view", "create", "edit", "delete", "export", "approve"],
    cashbook: ["view", "create", "edit", "delete", "export", "approve"],
    reports: ["view", "create", "edit", "delete", "export", "approve"],
    users: [], // Managers do not manage users
    expenses: ["view", "create", "edit", "delete", "export", "approve"],
  },
  SALES_STAFF: {
    dashboard: ["view"],
    sales: ["view", "create", "edit", "delete", "export", "approve"],
    cashbook: ["view", "create", "edit", "delete", "export", "approve"],
    inventory: ["view"],
    ledger: ["view"],
    projects: ["view"],
    reports: ["view"], // SALES_STAFF can only view sales reports; routing filters this
    purchase: [],
    users: [],
    expenses: ["view"],
  },
  PURCHASE_STAFF: {
    dashboard: ["view"],
    purchase: ["view", "create", "edit", "delete", "export", "approve"],
    inventory: ["view", "create", "edit", "delete", "export", "approve"],
    ledger: ["view"],
    reports: ["view"], // PURCHASE_STAFF can only view purchase reports; routing filters this
    sales: [],
    projects: [],
    cashbook: [],
    users: [],
    expenses: ["view"],
  },
  VIEWER: {
    dashboard: ["view"],
    inventory: ["view"],
    purchase: ["view"],
    sales: ["view"],
    projects: ["view"],
    ledger: ["view"],
    cashbook: ["view"],
    reports: ["view"],
    users: [],
    expenses: ["view"],
  },
};

/**
 * Check whether a user's role allows them to perform a specific action inside a module.
 */
export function hasPermission(role: Role, module: Module, action: Action): boolean {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) return false;
  const actions = rolePermissions[module];
  return actions ? actions.includes(action) : false;
}
