"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Banknote,
  Bell,
  Building2,
  Clock,
  FileText,
  Hash,
  Heart,
  Megaphone,
  Package,
  Palette,
  ReceiptText,
  RefreshCw,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Shirt,
  Tags,
  Truck,
  Users,
  Wallet,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useGlobalData } from "@/contexts/GlobalContext";
import { useAuth } from "@/contexts/AuthContext";
import { getSettingsAction } from "@/actions/AdminAction";
import type {
  SettingsCard,
  SettingsData,
  SettingsGroup,
} from "@/app/parametres/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// --------------------------- Mappings UI (icônes & routes par clé de carte) ---------------------------

const ICON_BY_KEY: Record<string, React.ElementType> = {
  organisation: Building2,
  agencies: Building2,
  users: Users,
  users_roles: Users,
  catalogue: Package,
  catalog: Package,
  deposit_codes: Hash,
  codes_depot: Hash,
  processing_delays: Clock,
  processing_times: Clock,
  promotions: Megaphone,
  loyalty: Heart,
  fidelity: Heart,
  workshop_cycle: Shirt,
  workshop: Shirt,
  pricing: Banknote,
  tarif: Banknote,
  collection_delivery: Truck,
  collection: Truck,
  payments: Wallet,
  paiements: Wallet,
  notifications: Bell,
  branding: Palette,
  receipts: ReceiptText,
  receipts_tickets: ReceiptText,
  security: ShieldCheck,
  offline_mode: WifiOff,
  audit: ScrollText,
};

const ROUTE_BY_KEY: Record<string, string> = {
  organisation: "/parametres/organisation",
  agencies: "/parametres/organisation",
  users: "/equipe",
  users_roles: "/equipe",
  catalogue: "/articles",
  catalog: "/articles",
  deposit_codes: "/parametres/operations",
  codes_depot: "/parametres/operations",
  processing_delays: "/parametres/operations",
  processing_times: "/parametres/operations",
  promotions: "/parametres/promotions",
  loyalty: "/parametres/promotions",
  fidelity: "/parametres/promotions",
  workshop_cycle: "/parametres/operations",
  workshop: "/parametres/operations",
  pricing: "/parametres/operations",
  tarif: "/parametres/operations",
  collection_delivery: "/parametres/collecte",
  collection: "/parametres/collecte",
  payments: "/parametres/paiements",
  paiements: "/parametres/paiements",
  notifications: "/parametres/notifications",
  branding: "/parametres/branding",
  receipts: "/parametres/recus",
  receipts_tickets: "/parametres/recus",
  security: "/parametres/securite",
  offline_mode: "/parametres/hors-ligne",
  audit: "/parametres/audit",
};

function cardIcon(key: string): React.ElementType {
  return ICON_BY_KEY[key] ?? Settings;
}

function cardRoute(key: string): string {
  return ROUTE_BY_KEY[key] ?? `/parametres/${key.replace(/_/g, "-")}`;
}

const STATUS_BADGE: Record<string, string> = {
  up_to_date: "bg-emerald-50 text-emerald-700",
  to_check: "bg-sky-100 text-sky-700",
  action_required: "bg-amber-100 text-amber-700",
};

function formatChangeDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const now = new Date();
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay) return `Aujourd'hui • ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Hier • ${time}`;
  return `${d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} • ${time}`;
}

export default function ParametresHub() {
  const { updatePath } = useGlobalData();
  const { logout } = useAuth();
  const [, startTransition] = useTransition();

  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  const [search, setSearch] = useState("");
  const [filterCode, setFilterCode] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    startTransition(async () => {
      try {
        const result = await getSettingsAction();
        if (cancelled) return;
        if (!result.success) {
          setLoadError(result.error);
          if (result.error.includes("Non autorisé")) logout();
          toast.error("Impossible de charger les paramètres", { description: result.error });
          setLoading(false);
          return;
        }
        setSettings(result.data.data);
        setLoadError(null);
        setLoading(false);
      } catch (error: unknown) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "Impossible de charger les paramètres.";
        setLoadError(message);
        toast.error("Impossible de charger les paramètres", { description: message });
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loadAttempt, logout, startTransition]);

  const retryLoading = () => {
    setLoadError(null);
    setLoading(true);
    setLoadAttempt((a) => a + 1);
  };

  const filterLabels = useMemo(() => {
    if (!settings) return [];
    return settings.filters.map((f) => ({ code: f.code, label: f.label }));
  }, [settings]);

  const matchesFilter = (card: SettingsCard, code: string) => card.group === code || card.key === code;

  const visibleGroups = useMemo<SettingsGroup[]>(() => {
    if (!settings) return [];
    const groups = settings.groups;
    if (!filterCode) return groups;
    return groups
      .filter((g) => g.code === filterCode || g.cards.some((c) => matchesFilter(c, filterCode)))
      .map((g) =>
        g.code === filterCode
          ? g
          : { ...g, cards: g.cards.filter((c) => matchesFilter(c, filterCode)) },
      );
  }, [settings, filterCode]);

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return visibleGroups;
    return visibleGroups
      .map((g) => ({
        ...g,
        cards: g.cards.filter((c) => `${c.label} ${c.summary ?? ""}`.toLowerCase().includes(q)),
      }))
      .filter((g) => g.cards.length > 0);
  }, [visibleGroups, search]);

  const totalCards = filteredGroups.reduce((acc, g) => acc + g.cards.length, 0);
  const summary = settings?.summary;
  const progress = summary && summary.categories > 0 ? Math.round((summary.up_to_date / summary.categories) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Paramètres</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Configurez le réseau, les opérations et la continuité de service depuis un espace unique.
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="gap-1.5 px-3 text-xs font-bold"
          onClick={() => toast.info("Journal des modifications", { description: "Historique complet des réglages." })}
        >
          <FileText className="size-3.5" />
          Journal des modifications
        </Button>
      </div>

      {loadError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{loadError}</p>
          <Button variant="outline" size="sm" onClick={retryLoading}>
            Réessayer
          </Button>
        </div>
      )}

      {/* Recherche + état */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-4 xl:col-span-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un paramètre, une règle ou une agence…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 bg-muted/40 pr-12 pl-9 text-[13px]"
            />
            <kbd className="absolute top-1/2 right-3 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              ⌘K
            </kbd>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Button
              variant={!filterCode ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterCode(null)}
              className="h-7 rounded-full px-3 text-[11px] font-bold"
            >
              Tous
            </Button>
            {filterLabels.map((f) => (
              <Button
                key={f.code}
                variant={filterCode === f.code ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterCode(f.code)}
                className="h-7 rounded-full px-3 text-[11px] font-bold"
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <h2 className="text-sm font-bold">État global</h2>
          {loading ? (
            <div className="mt-2 space-y-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-1.5 w-full" />
              <Skeleton className="h-3 w-32" />
            </div>
          ) : summary ? (
            <>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{summary.label}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1.5 flex justify-between text-[11px]">
                <span className="text-muted-foreground">{summary.up_to_date} à jour</span>
                <span className="font-bold text-amber-600">{summary.to_check} à vérifier</span>
              </p>
            </>
          ) : null}
        </div>
      </div>

      {/* Catégories */}
      {loading ? (
        <div className="rounded-xl border border-border bg-white p-4">
          <Skeleton className="h-3 w-24" />
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        filteredGroups.map((g) => (
          <div key={g.code}>
            <p className="mb-2 flex items-center justify-between px-1 text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
              {g.label}
              <span className="font-semibold normal-case tracking-normal">
                {g.cards.length} {g.cards.length > 1 ? "catégories" : "catégorie"}
              </span>
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {g.cards.map((c) => {
                const Icon = cardIcon(c.key);
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => updatePath(cardRoute(c.key))}
                    className="rounded-xl border border-border bg-white p-4 text-left transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-muted/60">
                        <Icon className="size-4 text-muted-foreground" />
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-0 text-[10px] font-bold",
                          STATUS_BADGE[c.status] ?? "bg-muted text-foreground",
                        )}
                      >
                        {c.status_label}
                      </Badge>
                    </div>
                    <p className="mt-2.5 text-[13px] font-extrabold">{c.label}</p>
                    <p className="text-[11px] text-muted-foreground">{c.summary}</p>
                    <p className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">{c.updated_relative ?? "—"}</span>
                      <span className="font-bold text-primary">Configurer →</span>
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}
      {!loading && totalCards === 0 && (
        <p className="rounded-xl border border-border bg-white p-8 text-center text-[13px] text-muted-foreground">
          {search
            ? `Aucune catégorie ne correspond à « ${search} ».`
            : "Aucun paramètre disponible pour ce filtre."}
        </p>
      )}

      {/* Dernières modifications */}
      <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold">Dernières modifications</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Traçabilité des changements sensibles</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs font-semibold text-muted-foreground"
            onClick={() => toast.info("Journal complet", { description: "Toutes les modifications de réglages." })}
          >
            Voir tout le journal →
          </Button>
        </div>
        <div className="mt-3 divide-y divide-border">
          {loading && <Skeleton className="h-10 w-full rounded-lg" />}
          {!loading && (settings?.recent_changes ?? []).length === 0 && (
            <p className="py-2.5 text-xs text-muted-foreground">Aucune modification enregistrée.</p>
          )}
          {!loading &&
            (settings?.recent_changes ?? []).map((m, i) => (
              <div key={`${m.at}-${i}`} className="flex flex-wrap items-center gap-2 py-2.5 text-xs">
                <span className="w-32 shrink-0 text-muted-foreground">{formatChangeDate(m.at)}</span>
                <p className="min-w-0 flex-1 font-semibold">{m.description}</p>
                <span className="text-muted-foreground">{m.by}</span>
                <Badge variant="outline" className="border-0 bg-muted text-[10px] font-semibold text-foreground">
                  {m.scope}
                </Badge>
              </div>
            ))}
        </div>
      </div>

      {/* Lien profil */}
      <button
        type="button"
        onClick={() => updatePath("/parametres/profil")}
        className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border p-3 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40"
      >
        <Tags className="size-4 shrink-0" />
        <p className="flex-1">
          <span className="font-bold text-foreground">Profil et sécurité staff</span> — identité, mot de passe, sessions et préférences du compte connecté.
        </p>
        <RefreshCw className="size-4 shrink-0" />
      </button>
    </div>
  );
}
