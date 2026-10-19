"use client";

import { ChevronsUpDown } from "lucide-react";
import { useSyncExternalStore } from "react";
import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGlobalData } from "@/contexts/GlobalContext";
import { useAuth } from "@/contexts/AuthContext";

export interface SuperNavItem {
  icon: AppIconName;
  label: string;
  path: string;
  exact?: boolean;
}

export interface SuperNavSection {
  title: string;
  items: SuperNavItem[];
}

export const superAdminSections: SuperNavSection[] = [
  {
    title: "PLATEFORME",
    items: [
      { icon: "dashboard", label: "Vue plateforme", path: "/superadmin", exact: true },
      { icon: "store", label: "Pressings", path: "/superadmin/pressings" },
      { icon: "branch", label: "Agences", path: "/superadmin/agences" },
      { icon: "lock", label: "Licences", path: "/superadmin/licences" },
      { icon: "alert", label: "Incidents", path: "/superadmin/incidents" },
    ],
  },
  {
    title: "GOUVERNANCE",
    items: [
      { icon: "user", label: "Utilisateurs", path: "/superadmin/utilisateurs" },
      { icon: "database", label: "Audit global", path: "/superadmin/audit" },
      { icon: "refresh", label: "Synchronisation", path: "/superadmin/synchronisation" },
      { icon: "settings", label: "Configuration", path: "/superadmin/configuration" },
    ],
  },
];

function isActive(itemPath: string, currentPath: string, exact?: boolean): boolean {
  if (exact) return currentPath === itemPath;
  if (itemPath === "/superadmin") return currentPath === "/superadmin" || currentPath === "/";
  return currentPath === itemPath || currentPath.startsWith(itemPath + "/");
}

interface SuperAdminSidebarProps {
  setMobileOpen: (open: boolean) => void;
}

const emptySubscribe = () => () => {};

export default function SuperAdminSidebar({ setMobileOpen }: SuperAdminSidebarProps) {
  const { currentPath, updatePath } = useGlobalData();
  const { currentUser } = useAuth();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const displayName = mounted
    ? currentUser
      ? `${currentUser.firstName ?? ""} ${currentUser.lastName ?? ""}`.trim() || "Awa Koné"
      : "Awa Koné"
    : "Awa Koné";
  const initials =
    displayName
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AK";

  return (
    <div className="flex h-full flex-col bg-primary text-white">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4">
        <p className="text-[15px] font-extrabold tracking-wide">
          <span className="text-secondary">SPARK</span> <span className="text-white">PRESSING</span>
        </p>

        {/* Sélecteur pressing / cloud */}
        <Button
          type="button"
          variant="ghost"
          className="mt-3 flex h-auto w-full items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-left text-[13px] font-medium text-white/90 hover:bg-white/15 hover:text-white"
        >
          <span>SPARK Cloud</span>
          <ChevronsUpDown className="size-4 text-white/60" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 pb-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]">
        {superAdminSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.path, currentPath ?? "/superadmin", item.exact);
                return (
                  <div
                    key={item.path}
                    onClick={() => {
                      updatePath(item.path);
                      setMobileOpen(false);
                    }}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                      active
                        ? "bg-white/15 text-white"
                        : "text-white/65 hover:bg-white/8 hover:text-white",
                    )}
                  >
                    <AppIcon
                      name={item.icon}
                      className={cn("size-[17px]", active ? "text-secondary" : "text-white/55")}
                      strokeWidth={active ? 2.3 : 1.9}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Santé plateforme */}
      <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10 mb-2">
        <p className="flex items-center gap-1.5 text-[12px] font-semibold">
          Santé plateforme
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            opérationnel
          </span>
        </p>
        <p className="mt-1 text-[11px] leading-snug text-white/60">
          Tous les services opérationnels
        </p>
      </div>

      {/* Pied : utilisateur */}
      <div className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 mt-auto">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-stone-200 text-[11px] font-bold text-primary">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold lowercase">{displayName.toLowerCase()}</p>
        </div>
        <AppIcon name="logout" className="size-4 text-white/40" />
      </div>
    </div>
  );
}
