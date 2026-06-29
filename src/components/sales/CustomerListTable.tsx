"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import { Search, BookOpen, Pencil, Trash2, AlertTriangle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { CustomerLedgerModal } from "./CustomerLedgerModal";
import { EditCustomerModal } from "./EditCustomerModal";
import { deleteCustomer, updateCustomer } from "@/modules/sales/actions";
import { toast } from "sonner";
import { hasPermission } from "@/auth/permissions";
import { Role } from "@/lib/constants";

interface CustomerData {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  contactPerson: string | null;
  panNumber: string | null;
  customerType: "RETAIL" | "WHOLESALE" | "PROJECT";
  creditLimit: string;
  openingBalance: string;
  notes: string | null;
  balance?: string;
  isActive: boolean;
}

interface CustomerListTableProps {
  customers: CustomerData[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  searchQuery: string;
  role?: string;
}

export function CustomerListTable({ customers: initialCustomers, pagination, searchQuery, role }: CustomerListTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [customers, setCustomers] = useState<CustomerData[]>(initialCustomers);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync prop changes to state
  useEffect(() => {
    setCustomers(initialCustomers);
  }, [initialCustomers]);

  // Sync local search state with searchQuery prop when it changes
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const urlSearch = searchParams.get("search") ?? "";
    if (localSearch === urlSearch) {
      return;
    }

    const timer = setTimeout(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      if (localSearch) {
        current.set("search", localSearch);
      } else {
        current.delete("search");
      }
      current.set("page", "1"); // Reset to page 1 on search
      router.push(`${pathname}?${current.toString()}`);
    }, 350);

    return () => clearTimeout(timer);
  }, [localSearch, pathname, router, searchParams]);

  const handlePageChange = (pageIndex: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("page", String(pageIndex + 1));
    router.push(`${pathname}?${current.toString()}`);
  };

  // Ledger Modal State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>("");
  const [showLedgerModal, setShowLedgerModal] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<CustomerData | null>(null);

  // Deletion Confirmation State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<CustomerData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Blocking Warning State (Deactivate Instead)
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockMessage, setBlockMessage] = useState("");
  const [customerToDeactivate, setCustomerToDeactivate] = useState<CustomerData | null>(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  const handleOpenLedger = (id: string, name: string) => {
    setSelectedCustomerId(id);
    setSelectedCustomerName(name);
    setShowLedgerModal(true);
  };

  const handleOpenEdit = (customer: CustomerData) => {
    setCustomerToEdit(customer);
    setShowEditModal(true);
  };

  const handleDeleteClick = (customer: CustomerData) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteCustomer(customerToDelete.id);
      toast.success(`Customer "${customerToDelete.name}" successfully deleted.`);
      setShowDeleteModal(false);
      setCustomerToDelete(null);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("Cannot delete.")) {
        // Intercept block check error and show Deactivate option
        setBlockMessage(err.message);
        setCustomerToDeactivate(customerToDelete);
        setShowDeleteModal(false);
        setShowBlockModal(true);
      } else {
        toast.error(err.message || "Failed to delete customer");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!customerToDeactivate) return;

    try {
      setDeactivateLoading(true);
      await updateCustomer(customerToDeactivate.id, { isActive: false });
      toast.success(`Customer "${customerToDeactivate.name}" has been deactivated successfully.`);
      setShowBlockModal(false);
      setCustomerToDeactivate(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to deactivate customer");
    } finally {
      setDeactivateLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
        <Input
          placeholder="Search by name, code, or phone..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-10 h-10 rounded-xl border-zinc-200 dark:border-zinc-800"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400">
            <tr className="font-semibold text-left">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3 text-right">Credit Limit (NPR)</th>
              <th className="px-4 py-3 text-right">Ledger Balance (NPR)</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-zinc-500 italic">
                  No customers found matching "{localSearch}"
                </td>
              </tr>
            ) : (
              customers.map((customer) => {
                const bal = parseFloat(customer.balance || "0");
                return (
                  <tr key={customer.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                    <td className="px-4 py-3 text-xs font-bold text-zinc-950 dark:text-zinc-150">{customer.code}</td>
                    <td className="px-4 py-3 font-bold text-zinc-900 dark:text-zinc-100">
                      {customer.name}
                      {customer.address && (
                        <span className="block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">{customer.address}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {customer.customerType === "WHOLESALE" && (
                        <Badge variant="outline" className="text-[10px] uppercase font-extrabold tracking-wider rounded-md bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          WHOLESALE
                        </Badge>
                      )}
                      {customer.customerType === "RETAIL" && (
                        <Badge variant="outline" className="text-[10px] uppercase font-extrabold tracking-wider rounded-md bg-blue-500/10 text-blue-600 border-blue-500/20">
                          RETAIL
                        </Badge>
                      )}
                      {customer.customerType === "PROJECT" && (
                        <Badge variant="outline" className="text-[10px] uppercase font-extrabold tracking-wider rounded-md bg-purple-500/10 text-purple-600 border-purple-500/20">
                          PROJECT
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-teal-600 dark:text-teal-400">{customer.phone ?? "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-extrabold text-sm text-rose-600 dark:text-rose-400">
                        {parseFloat(customer.creditLimit).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-extrabold text-sm ${
                          bal > 0 ? "text-emerald-600 dark:text-emerald-500" : "text-zinc-400 dark:text-zinc-500 font-medium"
                        }`}
                      >
                        {bal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={customer.isActive ? "default" : "secondary"} className="h-5">
                        {customer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenLedger(customer.id, customer.name)}
                          className="text-xs h-8 gap-1 border-primary/20 text-primary hover:bg-primary/5 rounded-lg font-bold"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          Ledger
                        </Button>
                        {hasPermission(role as Role, "sales", "edit") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(customer)}
                            className="h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {hasPermission(role as Role, "sales", "delete") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(customer)}
                            className="h-8 w-8 rounded-lg text-zinc-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 mt-4">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Showing Page {pagination.page} of {Math.max(1, Math.ceil(pagination.total / pagination.pageSize))} (Total {pagination.total} records)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 2)}
              disabled={pagination.page === 1}
              className="h-9 w-9 p-0 border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              className="h-9 w-9 p-0 border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Customer Ledger Modal */}
      {selectedCustomerId && showLedgerModal && (
        <CustomerLedgerModal
          open={showLedgerModal}
          onOpenChange={setShowLedgerModal}
          customerId={selectedCustomerId}
          customerName={selectedCustomerName}
        />
      )}

      {/* Edit Customer Modal */}
      {customerToEdit && showEditModal && (
        <EditCustomerModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setCustomerToEdit(null);
          }}
          onSuccess={() => router.refresh()}
          customer={customerToEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={(val) => !val && setShowDeleteModal(false)}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500 animate-pulse" />
              Delete Customer
            </DialogTitle>
            <p className="text-xs text-zinc-400 mt-1">
              Verify database record removal. This cannot be undone.
            </p>
          </DialogHeader>

          <div className="py-4 text-sm text-zinc-600 dark:text-zinc-400">
            Are you sure you want to delete customer <strong className="text-zinc-950 dark:text-zinc-50">"{customerToDelete?.name}"</strong>? This will permanently erase their account from the database.
          </div>

          <DialogFooter className="pt-4 border-t border-zinc-150 dark:border-zinc-900">
            <div className="flex items-center gap-2 justify-end w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="h-10 px-4 rounded-xl text-zinc-600 font-bold border-zinc-200 dark:border-zinc-800"
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="h-10 px-5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2 shadow-md shadow-rose-600/20 border-0"
                disabled={deleteLoading}
              >
                {deleteLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm Delete
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Blocking Warning Modal (Deactivate Instead) */}
      <Dialog open={showBlockModal} onOpenChange={(val) => !val && setShowBlockModal(false)}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Deletion Blocked
            </DialogTitle>
            <p className="text-xs text-zinc-400 mt-1">
              Active transaction postings exist on this account.
            </p>
          </DialogHeader>

          <div className="py-4 text-sm text-zinc-600 dark:text-zinc-400 space-y-3">
            <p>{blockMessage}</p>
            <p className="text-xs text-zinc-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-2.5 rounded-xl">
              Deactivating keeps historical ledger logs safe, but prevents staff from creating new sales invoices under this account.
            </p>
          </div>

          <DialogFooter className="pt-4 border-t border-zinc-150 dark:border-zinc-900">
            <div className="flex items-center gap-2 justify-end w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBlockModal(false)}
                className="h-10 px-4 rounded-xl text-zinc-600 font-bold border-zinc-200 dark:border-zinc-800"
                disabled={deactivateLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDeactivate}
                className="h-10 px-5 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2 shadow-md shadow-amber-500/20 border-0"
                disabled={deactivateLoading}
              >
                {deactivateLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Deactivate Instead
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CustomerListTable;
