import React from "react";
import { getCurrentUser } from "@/auth/session";
import { hasPermission } from "@/auth/permissions";
import { Role } from "@/lib/constants";
import { redirect } from "next/navigation";
import { ReportsClient } from "./ReportsClient";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!hasPermission(user.role as Role, "reports", "view")) {
    redirect("/dashboard");
  }
  return <ReportsClient />;
}
