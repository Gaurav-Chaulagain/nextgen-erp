"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import { Search, BookOpen, Pencil, Trash2, AlertTriangle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { SupplierLedgerModal } from "./SupplierLedgerModal";
import { EditSupplierModal } from "./EditSupplierModal";
import { deleteSupplier, updateSupplier } from "@/modules/purchase/actions";
import { toast } from "sonner";
import { hasPermission } from "@/auth/permissions";
import { Role } from "@/lib/constants";

interface SupplierData {
  id: string;
  code: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  panNumber: string | null;
  openingBalance: string;
  notes: string | null;
  balance?: string;
  isActive: boolean;
  purchaseOrdersCount?: number;
}

interface SupplierListTableProps {
  suppliers: SupplierData[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  searchQuery: string;
  userId: string;
  role?: string;
}

export function SupplierListTable({ suppliers: initialSuppliers, pagination, searchQuery, userId, role }: SupplierListTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [suppliers, setSuppliers] = useState<SupplierData[]>(initialSuppliers);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync prop changes to state
  useEffect(() => {
    setSuppliers(initialSuppliers);
  }, [initialSuppliers]);

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
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [selectedSupplierName, setSelectedSupplierName] = useState<string>("");
  const [selectedSupplierPan, setSelectedSupplierPan] = useState<string>("");
  const [selectedSupplierPhone, setSelectedSupplierPhone] = useState<string>("");
  const [showLedgerModal, setShowLedgerModal] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<SupplierData | null>(null);

  // Deletion Confirmation State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<SupplierData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Blocking Warning State (Deactivate Instead)
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockMessage, setBlockMessage] = useState("");
  const [supplierToDeactivate, setSupplierToDeactivate] = useState<SupplierData | null>(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  const handleOpenLedger = (id: string, name: string, pan?: string | null, phone?: string | null) => {
    setSelectedSupplierId(id);
    setSelectedSupplierName(name);
    setSelectedSupplierPan(pan || "");
    setSelectedSupplierPhone(phone || "");
    setShowLedgerModal(true);
  };

  const handleOpenEdit = (supplier: SupplierData) => {
    setSupplierToEdit(supplier);
    setShowEditModal(true);
  };

  const handleDeleteClick = (supplier: SupplierData) => {
    setSupplierToDelete(supplier);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteSupplier(supplierToDelete.id, userId);
      toast.success(`Supplier "${supplierToDelete.name}" successfully deleted.`);
      setShowDeleteModal(false);
      setSupplierToDelete(null);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("Cannot delete.")) {
        // Intercept block check error and show Deactivate option
        setBlockMessage(err.message);
        setSupplierToDeactivate(supplierToDelete);
        setShowDeleteModal(false);
        setShowBlockModal(true);
      } else {
        toast.error(err.message || "Failed to delete supplier");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!supplierToDeactivate) return;

    try {
      setDeactivateLoading(true);
      await updateSupplier(supplierToDeactivate.id, { isActive: false }, userId);
      toast.success(`Supplier "${supplierToDeactivate.name}" has been deactivated successfully.`);
      setShowBlockModal(false);
      setSupplierToDeactivate(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to deactivate supplier");
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
              <th className="px-4 py-3">Supplier Name</th>
              <th className="px-4 py-3 font-mono text-xs">PAN</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3 text-right">Balance Owed (AP) (NPR)</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500 italic">
                  No suppliers found matching "{localSearch}"
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => {
                const bal = parseFloat(supplier.balance || "0");
                return (
                  <tr key={supplier.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-zinc-950 dark:text-zinc-150">{supplier.code}</td>
                    <td className="px-4 py-3 font-bold text-zinc-900 dark:text-zinc-100">
                      {supplier.name}
                      {supplier.contactPerson && (
                        <span className="block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">Contact: {supplier.contactPerson}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-purple-600 dark:text-purple-400">{supplier.panNumber ?? "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-teal-600 dark:text-teal-400">{supplier.phone ?? "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-extrabold font-mono ${
                          bal > 0 ? "text-rose-600 dark:text-rose-500" : "text-zinc-400 dark:text-zinc-500 font-medium"
                        }`}
                      >
                        {bal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={supplier.isActive ? "default" : "secondary"} className="h-5">
                        {supplier.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenLedger(supplier.id, supplier.name, supplier.panNumber, supplier.phone)}
                          className="text-xs h-8 gap-1 border-primary/20 text-primary hover:bg-primary/5 rounded-lg font-bold"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          Ledger
                        </Button>
                        {hasPermission(role as Role, "purchase", "edit") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(supplier)}
                            className="h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {hasPermission(role as Role, "purchase", "delete") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(supplier)}
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

      {/* Supplier Ledger Modal */}
      {selectedSupplierId && showLedgerModal && (
        <SupplierLedgerModal
          open={showLedgerModal}
          onOpenChange={setShowLedgerModal}
          supplierId={selectedSupplierId}
          supplierName={selectedSupplierName}
          supplierPan={selectedSupplierPan}
          supplierPhone={selectedSupplierPhone}
        />
      )}

      {/* Edit Supplier Modal */}
      {supplierToEdit && showEditModal && (
        <EditSupplierModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSupplierToEdit(null);
          }}
          onSuccess={() => router.refresh()}
          supplier={supplierToEdit}
          userId={userId}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={(val) => !val && setShowDeleteModal(false)}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500 animate-pulse" />
              Delete Supplier / Vendor
            </DialogTitle>
            <p className="text-xs text-zinc-400 mt-1">
              Verify database record removal. This cannot be undone.
            </p>
          </DialogHeader>

          <div className="py-4 text-sm text-zinc-600 dark:text-zinc-400">
            Are you sure you want to delete supplier <strong className="text-zinc-950 dark:text-zinc-50">"{supplierToDelete?.name}"</strong>? This will permanently erase their account from the database.
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
              Deactivating keeps historical ledger logs safe, but prevents staff from creating new purchase orders under this account.
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

export default SupplierListTable;
