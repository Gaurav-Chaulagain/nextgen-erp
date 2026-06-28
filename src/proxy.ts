import { auth } from "./auth-middleware";
import { NextResponse } from "next/server";
import { hasPermission } from "./auth/permissions";
import type { Module } from "./auth/permissions";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname === "/login";

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Inject user role header for downstream server components
  const role = (req.auth?.user as any)?.role || "VIEWER";

  // Enforce page-level Role-Based Access Control (RBAC)
  const pathname = req.nextUrl.pathname;
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  const modules = [
    "dashboard",
    "inventory",
    "purchase",
    "sales",
    "projects",
    "ledger",
    "cashbook",
    "expenses",
    "incomes",
    "reports",
    "users",
  ];

  if (firstSegment && modules.includes(firstSegment)) {
    const isAllowed = hasPermission(role as any, firstSegment as Module, "view");
    if (!isAllowed) {
      if (firstSegment !== "dashboard") {
        return NextResponse.redirect(new URL("/dashboard?error=unauthorized", req.nextUrl));
      } else {
        return NextResponse.redirect(new URL("/login?error=unauthorized", req.nextUrl));
      }
    }
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-role", role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: [
    "/((?!login|forgot-password|verify-otp|reset-password|api|_next|favicon.ico|icon.png|next.svg|vercel.svg|logo.png|login-hero.png).*)",
  ],
};
