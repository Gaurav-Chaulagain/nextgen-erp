import type { Session } from "next-auth";
import { auth } from "../auth-middleware";

export async function getCurrentUser(): Promise<Session["user"] | null> {
  const session = await auth();
  return session?.user ?? null;
}

export type CurrentUser = Awaited<ReturnType<typeof getCurrentUser>>;
