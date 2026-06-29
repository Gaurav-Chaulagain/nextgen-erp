import { CashBookPage } from "@/components/accounting/CashBookPage";
import { getCurrentUser } from "@/auth/session";

export default async function Page() {
  const user = await getCurrentUser();
  const role = user?.role ?? "VIEWER";
  return <CashBookPage role={role} />;
}
