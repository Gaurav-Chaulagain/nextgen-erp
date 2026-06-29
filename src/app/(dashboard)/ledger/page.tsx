import { LedgerPage } from "@/components/accounting/LedgerPage";
import { getCurrentUser } from "@/auth/session";
import { hasPermission } from "@/auth/permissions";
import { Role } from "@/lib/constants";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!hasPermission(user.role as Role, "ledger", "view")) {
    redirect("/dashboard");
  }
  return <LedgerPage />;
}
