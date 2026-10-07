"use client";

import { useSyncExternalStore } from "react";
import {
  ArrowLeftRight,
  BarChart3,
  Building2,
  ChevronsUpDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Package,
  RefreshCw,
  ScrollText,
  Settings,
  Shirt,
  Tags,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGlobalData } from "@/contexts/GlobalContext";
import { useAuth } from "@/contexts/AuthContext";

export interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  exact?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: "Opérations",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", exact: true },
      { icon: Package, label: "Dépôts", path: "/depots" },
      { icon: Users, label: "Clients", path: "/clients" },
      { icon: Shirt, label: "Atelier", path: "/atelier" },
      { icon: ArrowLeftRight, label: "Retraits", path: "/retraits" },
      { icon: Wallet, label: "Caisse", path: "/caisse" },
    ],
  },
  {
    title: "Pilotage",
    items: [
      { icon: Tags, label: "Articles et tarifs", path: "/articles" },
      { icon: BarChart3, label: "Rapports", path: "/rapports" },
      { icon: Building2, label: "Multi-agences", path: "/multi-agences" },
      { icon: ClipboardList, label: "Équipe & rôles", path: "/equipe" },
    ],
  },
  {
    title: "Système",
    items: [
      { icon: RefreshCw, label: "Synchronisation", path: "/synchronisation" },
      { icon: Settings, label: "Paramètres", path: "/parametres" },
      { icon: ScrollText, label: "Audit & logs", path: "/audit" },
    ],
  },
];

/** Retourne true si l'URL courante correspond à cet item de navigation */
function isActive(itemPath: string, currentPath: string, exact?: boolean): boolean {
  if (exact) return currentPath === itemPath;
  if (itemPath === "/dashboard") return currentPath === "/dashboard" || currentPath === "/";
  if (itemPath === "/") return currentPath === "/";
  return currentPath === itemPath || currentPath.startsWith(itemPath + "/");
}

interface SidebarProps {
  setMobileOpen: (open: boolean) => void;
}

const emptySubscribe = () => () => {};

export default function Sidebar({ setMobileOpen }: SidebarProps) {
  const { currentPath, updatePath } = useGlobalData();
  const { currentUser } = useAuth();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const displayName = mounted
    ? currentUser
      ? `${currentUser.firstName ?? ""} ${currentUser.lastName ?? ""}`.trim() || "Aicha Koné"
      : "Aicha Koné"
    : "Aicha Koné";
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

        {/* Sélecteur d'agence */}
        <Button
          type="button"
          variant="ghost"
          className="mt-3 flex h-auto w-full items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-left text-[13px] font-medium text-white/90 hover:bg-white/15 hover:text-white"
        >
          <span>Bingerville</span>
          <ChevronsUpDown className="size-4 text-white/60" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 pb-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.path, currentPath ?? "/dashboard", item.exact);
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
                    <item.icon
                      className={cn("size-[17px] shrink-0", active ? "text-secondary" : "text-white/55")}
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

      {/* Pied : statut réseau + utilisateur */}
      <div className="space-y-2.5 p-3">
        <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
          <p className="flex items-center gap-1.5 text-[12px] font-semibold">
            Réseau agences
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              actives
            </span>
          </p>
          <p className="mt-1 text-[11px] leading-snug text-white/60">
            4 agences actives · dernière synchro
            <br />
            il y a 2 min
          </p>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl px-2 py-1.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-stone-200 text-[11px] font-bold text-primary">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold lowercase">{displayName.toLowerCase()}</p>
          </div>
          <LogOut className="size-4 shrink-0 text-white/40" />
        </div>
      </div>
    </div>
  );
}
