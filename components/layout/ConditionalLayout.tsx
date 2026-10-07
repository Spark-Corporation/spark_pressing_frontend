"use client";

import { usePathname } from "next/navigation";
import DashboardLayout from "./DashboardLayout";

export const AUTH_ROUTES = [
  "/login",
  "/mot-de-passe-oublie",
  "/nouveau-mot-de-passe",
  "/reinitialisation-reussie",
  "/verifier-code",
];

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.some(
    (r) => pathname === r || pathname?.startsWith(r + "/"),
  );

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
