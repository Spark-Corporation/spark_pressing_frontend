"use client";

import { useGlobalData } from "@/contexts/GlobalContext";
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
  const { currentPath } = useGlobalData();
  const isAuthRoute = AUTH_ROUTES.some(
    (r) => currentPath === r || currentPath.startsWith(r + "/"),
  );

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
