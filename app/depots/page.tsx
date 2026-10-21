"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Columns3,
} from "lucide-react";
import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useGlobalData } from "@/contexts/GlobalContext";
import { useAuth } from "@/contexts/AuthContext";
import { getDepositsAction } from "@/actions/AdminAction";
import { handleApiAction } from "@/functions/handleResponseApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DEPOTS,
  ETATS_ATELIER,
  formatFCFA,
  statutCommercial,
  type Depot,
  type EtatAtelier,
  type Prestation,
  type StatutCommercial,
} from "./data";
import type { ApiDeposit, DepositsEnvelope } from "@/lib/types";

const PAGE_SIZE = 6;
type Periode = "jour" | "semaine" | "mois";

const prestationBadge: Record<Prestation, string> = {
  Express: "bg-amber-100 text-amber-700",
  Classique: "bg-slate-200/70 text-slate-600",
  Repassage: "bg-sky-100 text-sky-700",
};

const etatDot: Record<string, string> = {
  Prêt: "bg-emerald-500",
  "En lavage": "bg-sky-500",
  "À trier": "bg-amber-500",
  Séchage: "bg-amber-500",
  Repassage: "bg-violet-500",
  Contrôle: "bg-orange-500",
  Retiré: "bg-muted-foreground/50",
};

function mapDeposit(d: ApiDeposit): Depot {
  const depositDate = d.deposit_date ? new Date(d.deposit_date) : null;
  const daysAgo = depositDate ? Math.floor((Date.now() - depositDate.getTime()) / 86400000) : 999;
  const retrieveDate = d.retrieve_date ? new Date(d.retrieve_date) : null;
  const retrait = d.retrieved_at
    ? `Retiré ${new Date(d.retrieved_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`
    : retrieveDate
      ? `${retrieveDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}, ${retrieveDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
      : "—";
  const etat = (d.etat_label || "À trier") as EtatAtelier;
  const prestation: Prestation = d.payment_method === "express" ? "Express" : "Classique";
  return {
    code: d.code,
    client: d.client_name || "—",
    phone: d.client_phone ?? undefined,
    prestation,
    articles: d.articles_label || "—",
    total: d.total,
    paye: d.advanced,
    retrait,
    etat,
    synchro: "À jour",
    daysAgo,
    agency: d.agency?.name ?? "—",
  };
}

export default function DepotsPage() {
  const { updatePath } = useGlobalData();
  const { setLoading, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [periode, setPeriode] = useState<Periode>("mois");
  const [statut, setStatut] = useState<"Tous" | StatutCommercial>("Tous");
  const [etat, setEtat] = useState<"Tous" | EtatAtelier>("Tous");
  const [agency, setAgency] = useState("Toutes");
  const [page, setPage] = useState(1);
  const [columns, setColumns] = useState({ prestation: true, articles: true, paye: true, reste: true });
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoadingPage] = useState(true);

  useEffect(() => {
    handleApiAction({
      action: getDepositsAction,
      setLoading,
      logout,
      onSuccess: (res) => {
        const envelope = res as DepositsEnvelope;
        if (envelope?.data) {
          setDepots(envelope.data.map(mapDeposit));
        }
        setLoadingPage(false);
      },
      onError: () => {
        setDepots(DEPOTS);
        setLoadingPage(false);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const agencies = useMemo(() => {
    const set = new Set(depots.map((d) => d.agency).filter(Boolean));
    return Array.from(set);
  }, [depots]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return depots.filter((d) => {
      if (periode === "jour" && d.daysAgo > 1) return false;
      if (periode === "semaine" && d.daysAgo > 7) return false;
      if (statut !== "Tous" && statutCommercial(d) !== statut) return false;
      if (etat !== "Tous" && d.etat !== etat) return false;
      if (agency !== "Toutes" && d.agency !== agency) return false;
      if (q && !`${d.code} ${d.client} ${d.phone ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, periode, statut, etat, agency, depots]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);
  const resetPage = () => setPage(1);

  const kpis = useMemo(() => {
    const today = depots.filter((d) => d.daysAgo <= 1);
    const revenue = today.reduce((s, d) => s + d.total, 0);
    const paid = today.reduce((s, d) => s + d.paye, 0);
    const toRetrieve = depots.filter((d) => d.etat === "Prêt").length;
    const rest = depots.reduce((s, d) => s + Math.max(0, d.total - d.paye), 0);
    const openCount = depots.filter((d) => d.total - d.paye > 0).length;
    return [
      { label: "Dépôts aujourd'hui", value: String(today.length), sub: `${depots.length} dépôts au total`, icon: "box", iconBg: "bg-stone-100 text-stone-500" },
      { label: "Chiffre d'affaires", value: `${formatFCFA(revenue)} FCFA`, sub: `${formatFCFA(paid)} FCFA encaissés`, icon: "cash", iconBg: "bg-amber-50 text-amber-600" },
      { label: "À retirer aujourd'hui", value: String(toRetrieve), sub: "Commandes prêtes", icon: "calendar", iconBg: "bg-slate-100 text-slate-500" },
      { label: "Reste à encaisser", value: `${formatFCFA(rest)} FCFA`, sub: `Sur ${openCount} dépôts ouverts`, icon: "wallet", iconBg: "bg-amber-50 text-amber-600" },
    ];
  }, [depots]);

  const resetAll = () => {
    setSearch("");
    setPeriode("mois");
    setStatut("Tous");
    setEtat("Tous");
    setAgency("Toutes");
    resetPage();
  };

  const openDetail = (d: Depot) => updatePath(`/depots/${d.code}`);

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Gestion des dépôts</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Suivez les commandes, les encaissements et l&apos;avancement atelier en temps réel.
          </p>
        </div>
        <Button
          size="lg"
          className="gap-1.5 px-3 text-xs font-bold"
          onClick={() => updatePath("/depots/nouveau")}
        >
          <AppIcon name="plus" className="size-4" />
          Nouveau dépôt
        </Button>
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-white p-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-3 h-7 w-32" />
                <Skeleton className="mt-2 h-3 w-28" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
            <Skeleton className="h-5 w-36" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </>
      ) : (
      <>
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
              <span className={cn("flex size-8 items-center justify-center rounded-lg", k.iconBg)}>
                <AppIcon name={k.icon as AppIconName} className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-xl font-extrabold tracking-tight">{k.value}</p>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="space-y-3 rounded-xl border border-border bg-white p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="mb-1.5 text-xs font-semibold">Recherche rapide</p>
            <div className="relative">
              <AppIcon name="search" className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Code, client ou téléphone"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  resetPage();
                }}
                className="h-9 bg-muted/40 pl-9 text-[13px]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
            <div>
              <p className="mb-1.5 text-xs font-semibold">Statut commercial</p>
              <Select
                value={statut}
                onValueChange={(v) => {
                  setStatut(v as "Tous" | StatutCommercial);
                  resetPage();
                }}
              >
                <SelectTrigger className="w-full text-xs data-[size=default]:h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Tous", "Soldé", "Partiellement payé", "Non payé"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold">État atelier</p>
              <Select
                value={etat}
                onValueChange={(v) => {
                  setEtat(v as "Tous" | EtatAtelier);
                  resetPage();
                }}
              >
                <SelectTrigger className="w-full text-xs data-[size=default]:h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tous">Tous</SelectItem>
                  {ETATS_ATELIER.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold">Agence</p>
              <Select
                value={agency}
                onValueChange={(v) => {
                  setAgency(v ?? "Toutes");
                  resetPage();
                }}
              >
                <SelectTrigger className="w-full text-xs data-[size=default]:h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Toutes">Toutes</SelectItem>
                  {agencies.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="ghost" size="sm" onClick={resetAll} className="text-xs font-semibold text-muted-foreground">
                Effacer
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <span className="font-medium text-muted-foreground">Résultats :</span>
          <Tabs
            value={periode}
            onValueChange={(v) => {
              setPeriode(v as Periode);
              resetPage();
            }}
          >
            <TabsList className="h-7">
              <TabsTrigger value="jour" className="px-3 text-[11px]">
                Jour
              </TabsTrigger>
              <TabsTrigger value="semaine" className="px-3 text-[11px]">
                Semaine
              </TabsTrigger>
              <TabsTrigger value="mois" className="px-3 text-[11px]">
                Mois
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <span className="ml-auto text-[11px] text-muted-foreground">
            {filtered.length} dépôts • Dernière actualisation il y a quelques secondes
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold">Dépôts récents</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {agency === "Toutes" ? "Opérations de toutes les agences" : `Opérations de l'agence ${agency}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={() => toast.success("Export CSV lancé", { description: "Le fichier sera téléchargé dans quelques secondes." })}
            >
              <AppIcon name="download" className="size-3.5" />
              Exporter
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                    <Columns3 className="size-3.5" />
                    Colonnes
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-44">
                {(
                  [
                    ["prestation", "Prestation"],
                    ["articles", "Articles / Poids"],
                    ["paye", "Payé"],
                    ["reste", "Reste"],
                  ] as const
                ).map(([key, label]) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={columns[key]}
                    onCheckedChange={(v) => setColumns((c) => ({ ...c, [key]: v === true }))}
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-3">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">CODE DÉPÔT</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">CLIENT</TableHead>
                {columns.prestation && <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PRESTATION</TableHead>}
                {columns.articles && <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">ARTICLES / POIDS</TableHead>}
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">TOTAL</TableHead>
                {columns.paye && <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PAYÉ</TableHead>}
                {columns.reste && <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">RESTE</TableHead>}
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">RETRAIT PRÉVU</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">ÉTAT ATELIER</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">SYNCHRO</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((d) => {
                const reste = d.total - d.paye;
                return (
                  <TableRow key={d.code} className="cursor-pointer" onClick={() => openDetail(d)}>
                    <TableCell>
                      <p className="text-xs font-bold">{d.code}</p>
                      <p className="text-[11px] text-muted-foreground">Aujourd&apos;hui, 10:21</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-[13px] font-semibold">{d.client}</p>
                      {d.phone && <p className="text-[11px] text-muted-foreground">{d.phone}</p>}
                    </TableCell>
                    {columns.prestation && (
                      <TableCell>
                        <Badge variant="outline" className={cn("border-0 text-[10px] font-semibold", prestationBadge[d.prestation])}>
                          {d.prestation}
                        </Badge>
                      </TableCell>
                    )}
                    {columns.articles && <TableCell className="text-xs text-muted-foreground">{d.articles}</TableCell>}
                    <TableCell className="text-xs font-bold">{formatFCFA(d.total)}</TableCell>
                    {columns.paye && <TableCell className="text-xs">{formatFCFA(d.paye)}</TableCell>}
                    {columns.reste && (
                      <TableCell className={cn("text-xs font-bold", reste > 0 ? "text-red-500" : "text-muted-foreground")}>
                        {formatFCFA(reste)}
                      </TableCell>
                    )}
                    <TableCell className="text-xs text-muted-foreground">{d.retrait}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1 border-0 bg-muted text-[10px] font-semibold text-foreground">
                        <span className={cn("size-1.5 rounded-full", etatDot[d.etat])} />
                        {d.etat}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={cn("text-[11px]", d.synchro === "À jour" ? "text-muted-foreground" : "font-semibold text-amber-600")}>
                        • {d.synchro}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions pour ${d.code}`}>
                              <AppIcon name="more-horizontal" className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => openDetail(d)}>Voir le détail</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success("Ticket envoyé à l'impression")}>
                            Imprimer le ticket
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toast.success("Acompte", { description: `Nouvel acompte pour ${d.code}.` })}>
                            Ajouter un acompte
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={11} className="py-10 text-center text-[13px] text-muted-foreground">
                    Aucun dépôt ne correspond à ces critères.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            {filtered.length === 0 ? "0" : `${start + 1}–${start + rows.length}`} sur {filtered.length} dépôts
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-1 px-2.5 text-[11px] font-semibold"
            >
              <ChevronLeft className="size-3.5" />
              Précédent
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === safePage ? "default" : "outline"}
                size="icon-sm"
                onClick={() => setPage(p)}
                className="text-[11px] font-bold"
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="gap-1 px-2.5 text-[11px] font-semibold"
            >
              Suivant
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
