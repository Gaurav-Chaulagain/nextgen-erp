import React from "react";
import { getCurrentUser } from "@/auth/session";
import { getUsersList } from "../../../modules/users/queries";
import { UsersPage } from "../../../components/users/UsersPage";
import { redirect } from "next/navigation";
import { hasPermission } from "@/auth/permissions";
import { Role } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function Page() {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    redirect("/login");
  }

  if (!hasPermission(sessionUser.role as Role, "users", "view")) {
    redirect("/dashboard");
  }

  // Fetch initial users from DB
  const users = await getUsersList();

  return (
    <UsersPage
      initialUsers={users}
      sessionUser={{
        id: sessionUser.id,
        name: sessionUser.name || "Default Staff",
        email: sessionUser.email || "",
        role: (sessionUser as any).role || "VIEWER",
      }}
    />
  );
}
