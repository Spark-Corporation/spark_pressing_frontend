"use client";

import { useGlobalData } from "@/contexts/GlobalContext";
import Sidebar from "./Sidebar";
import SuperAdminSidebar from "./SuperAdminSidebar";
import Header from "./Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { mobileOpen, setMobileOpen, currentPath } = useGlobalData();
  const isSuperAdmin = currentPath.startsWith("/superadmin");

  return (
    <div className="flex min-h-screen bg-[#f2f4f2]">
      {/* Sidebar desktop */}
      <div className="fixed inset-y-0 left-0 z-40 hidden w-64 md:block">
        {isSuperAdmin ? (
          <SuperAdminSidebar setMobileOpen={setMobileOpen} />
        ) : (
          <Sidebar setMobileOpen={setMobileOpen} />
        )}
      </div>

      {/* Sidebar mobile (overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-sidebar shadow-xl">
            {isSuperAdmin ? (
              <SuperAdminSidebar setMobileOpen={setMobileOpen} />
            ) : (
              <Sidebar setMobileOpen={setMobileOpen} />
            )}
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex min-h-screen flex-1 flex-col bg-[#f2f4f2] md:pl-64">
        <Header />
        <main className="flex-1 px-4 py-5 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  );
}
