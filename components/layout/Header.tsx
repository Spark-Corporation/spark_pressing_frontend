"use client";

import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useGlobalData } from "@/contexts/GlobalContext";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => {};

function pageTitle(path: string | null): string {
  if (!path) return "Dashboard";
  const map: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/": "Dashboard",
    "/depots": "Dépôts",
    "/depots/nouveau": "Dépôts / Nouveau dépôt",
    "/clients": "Clients",
    "/clients/nouveau": "Clients / Nouveau client",
    "/atelier": "Atelier",
    "/retraits": "Retraits",
    "/caisse": "Caisse",
    "/articles": "Articles et tarifs",
    "/rapports": "Rapports",
    "/multi-agences": "Multi-agences",
    "/equipe": "Équipe & rôles",
    "/synchronisation": "Synchronisation",
    "/parametres": "Paramètres",
    "/audit": "Audit & logs",
  };
  if (map[path]) return map[path];
  const first = "/" + (path.split("/")[1] ?? "");
  return map[first] ?? "Dashboard";
}

export default function Header() {
  const { globalSearch, setGlobalSearch, setMobileOpen, currentPath } = useGlobalData();
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
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-white px-4 py-3 md:px-6">
      {/* Menu mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      {/* Fil d'ariane */}
      <div className="hidden shrink-0 items-center gap-2 text-[13px] lg:flex">
        <span className="font-semibold tracking-wide text-muted-foreground">SPARK PRESSING</span>
        <span className="text-muted-foreground/50">|</span>
        <span className="font-semibold text-foreground">{pageTitle(currentPath)}</span>
      </div>

      {/* Recherche */}
      <div className="relative w-full max-w-xl flex-1 lg:mx-auto">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un client, téléphone ou code…"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          className="h-9 rounded-lg border-border bg-muted/60 pl-9 text-[13px]"
        />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Statut connexion */}
        <span className="hidden items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-[11px] font-medium text-muted-foreground md:inline-flex">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          En ligne · À jour · 10:34
        </span>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-[18px]" />
          <span className="absolute top-1 right-1 size-2 rounded-full bg-red-500 ring-2 ring-white" />
        </Button>

        {/* Profil */}
        <Button
          type="button"
          variant="ghost"
          className="flex h-auto items-center gap-2.5 rounded-full px-1 py-1 text-left"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white">
            {initials}
          </span>
          <span className="hidden leading-tight xl:block">
            <span className="block text-[13px] font-bold">{displayName}</span>
            <span className="block text-[11px] font-normal text-muted-foreground">Directrice réseau</span>
          </span>
          <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
        </Button>
      </div>
    </header>
  );
}
