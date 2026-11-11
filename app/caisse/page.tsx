"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Download,
  Eye,
  MoreHorizontal,
  Plus,
  ReceiptText,
  Search,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useGlobalData } from "@/contexts/GlobalContext";
import { getCashCenterAction } from "@/actions/AdminAction";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CATEGORIES, formatFCFA, type JournalOp } from "./data";
import type { CashCenterData } from "./types";

const PAGE_SIZE = 7;
type Periode = "jour" | "semaine" | "mois";
const journalOperations: JournalOp[] = [];

const statutBadge: Record<JournalOp["statut"], string> = {
  Synchronisé: "bg-emerald-50 text-emerald-700",
  Validé: "bg-muted text-muted-foreground",
  "Hors ligne": "bg-amber-100 text-amber-700",
};

export default function CaissePage() {
  const { updatePath } = useGlobalData();
  const [cashCenter, setCashCenter] = useState<CashCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [periode, setPeriode] = useState<Periode>("mois");
  const [dateSel, setDateSel] = useState("today");
  const [categorie, setCategorie] = useState("all");
  const [paiement, setPaiement] = useState("all");
  const [statut, setStatut] = useState("all");
  const [page, setPage] = useState(1);
  const [columns, setColumns] = useState({ categorie: true, operateur: true, paiement: true, flux: true });

  const loadCashCenter = useCallback(() => {
    void handleApiAction({
      action: getCashCenterAction,
      setLoading,
      showErrorToast: false,
      onSuccess: (data) => {
        setCashCenter(data);
        console.log("loadCashCenter : ", data);
      },
      onError: setLoadError,
    });
  }, []);

  useEffect(() => {
    loadCashCenter();
  }, [loadCashCenter]);

  const kpis = useMemo(() => {
    if (!cashCenter) {
      const value = loading ? "Chargement…" : "—";
      const subtitle = loadError ? "Données indisponibles" : " ";
      return [
        { label: "Recettes du jour", value, sub: subtitle, icon: TrendingUp, iconBg: "bg-stone-100 text-stone-500" },
        { label: "Dépenses", value, sub: subtitle, icon: ArrowUpRight, iconBg: "bg-red-50 text-red-500" },
        { label: "Impayés", value, sub: subtitle, icon: ReceiptText, iconBg: "bg-amber-50 text-amber-600" },
        { label: "Écart de caisse", value, sub: subtitle, icon: CheckCircle2, iconBg: "bg-emerald-50 text-emerald-600" },
      ];
    }
    return [
      { label: "Recettes du jour", value: `${formatFCFA(cashCenter.kpis.receipts.value)} FCFA`, sub: `${cashCenter.kpis.receipts.delta_percent > 0 ? "+" : ""}${cashCenter.kpis.receipts.delta_percent?.toLocaleString("fr-FR")} % vs période précédente`, icon: TrendingUp, iconBg: "bg-stone-100 text-stone-500" },
      { label: "Dépenses", value: `${formatFCFA(cashCenter.kpis.expenses.value)} FCFA`, sub: `${cashCenter.kpis.expenses.count} sorties`, icon: ArrowUpRight, iconBg: "bg-red-50 text-red-500" },
      { label: "Impayés", value: `${formatFCFA(cashCenter.kpis.unpaid.value)} FCFA`, sub: `${cashCenter.kpis.unpaid.deposits} dépôts concernés`, icon: ReceiptText, iconBg: "bg-amber-50 text-amber-600" },
      { label: "Écart de caisse", value: `${formatFCFA(cashCenter.kpis.difference.value)} FCFA`, sub: cashCenter.kpis.difference.label, icon: CheckCircle2, iconBg: "bg-emerald-50 text-emerald-600" },
    ];
  }, [cashCenter, loading, loadError]);

  const hourlyMax = Math.max(
    1,
    ...(cashCenter?.hourly.series.flatMap(({ in: amountIn, out }) => [amountIn, out]) ?? []),
  );
  const dateLabel = cashCenter
    ? new Date(`${cashCenter.date}T12:00:00`).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Chargement…";
  const openingTime = cashCenter?.situation.opening.at
    ? new Date(cashCenter.situation.opening.at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : "—";
  const theoreticalTime = cashCenter?.theoretical.computed_at
    ? new Date(cashCenter.theoretical.computed_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : "—";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return journalOperations.filter((o) => {
      if (periode === "jour" && o.daysAgo > 1) return false;
      if (periode === "semaine" && o.daysAgo > 7) return false;
      if (dateSel === "today" && o.daysAgo > 0) return false;
      if (dateSel === "yesterday" && o.daysAgo !== 1) return false;
      if (categorie !== "all" && o.categorie !== categorie) return false;
      if (paiement !== "all" && o.paiement !== paiement) return false;
      if (statut !== "all" && o.statut !== statut) return false;
      if (q && !`${o.ref} ${o.categorie} ${o.operateur}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, periode, dateSel, categorie, paiement, statut]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);
  const resetPage = () => setPage(1);

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl">
            Centre de caisse
            <Badge
              variant="outline"
              className={cn(
                "border-0 text-[10px] font-bold",
                cashCenter?.session.status.code === "open" ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground",
              )}
            >
              {cashCenter ? `${cashCenter.agency} • ${cashCenter.session.status.label}` : loadError ? "Indisponible" : "Chargement…"}
            </Badge>
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Suivez les flux et rapprochez les moyens de paiement de {cashCenter?.agency ?? "votre agence"}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.info(`Journal du ${dateLabel}`, { description: "Période journalière sélectionnée." })}
          >
            <CalendarDays className="size-3.5" />
            {dateLabel}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.success("Export CSV lancé", { description: "Le journal sera téléchargé dans quelques secondes." })}
          >
            <Download className="size-3.5" />
            Exporter
          </Button>
          <Button size="lg" className="gap-1.5 px-3 text-xs font-bold" onClick={() => updatePath("/caisse/nouveau")}>
            <Plus className="size-4" />
            Nouveau mouvement
          </Button>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span>Impossible de charger les données de caisse : {loadError}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoadError(null);
              loadCashCenter();
            }}
            disabled={loading}
          >
            Réessayer
          </Button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
              <span className={cn("flex size-8 items-center justify-center rounded-lg", k.iconBg)}>
                <k.icon className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-xl font-extrabold tracking-tight">{k.value}</p>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Situation + solde + compté */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold">Situation de caisse</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{dateLabel}</p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "gap-1 border-0 text-[10px] font-bold",
                cashCenter?.session.status.code === "open" ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground",
              )}
            >
              <span className={cn("size-1.5 rounded-full", cashCenter?.session.status.code === "open" ? "bg-emerald-500" : "bg-muted-foreground")} />
              {cashCenter?.session.status.label ?? (loading ? "Chargement…" : "Indisponible")}
            </Badge>
          </div>
          <div className="mt-3 space-y-2.5 text-xs">
            {(cashCenter ? [
              ["Solde d'ouverture", `${formatFCFA(cashCenter.situation.opening.amount)} FCFA`, `${openingTime} • ${cashCenter.situation.opening.by}`, false],
              ["Encaissements dépôts", `+${formatFCFA(cashCenter.situation.deposit_receipts.amount)} FCFA`, `${cashCenter.situation.deposit_receipts.count} transactions`, false],
              ["Paiements de soldes", `+${formatFCFA(cashCenter.situation.balance_payments.amount)} FCFA`, `${cashCenter.situation.balance_payments.count} paiements`, false],
              ["Entrées hors dépôt", `+${formatFCFA(cashCenter.situation.cash_in.amount)} FCFA`, `${cashCenter.situation.cash_in.count} mouvements`, false],
              ["Sorties hors dépôt", `−${formatFCFA(cashCenter.situation.cash_out.amount)} FCFA`, `${cashCenter.situation.cash_out.count} mouvements`, true],
            ] : []).map(([label, v, sub, neg]) => (
              <div key={label as string} className="flex items-baseline justify-between gap-2">
                <div>
                  <p className="font-semibold">{label}</p>
                  <p className="text-[11px] text-muted-foreground">{sub}</p>
                </div>
                <p className={cn("font-extrabold", neg ? "text-red-500" : "")}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-primary p-4 text-white">
            <p className="text-xs text-white/70">Solde théorique</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight">
              {cashCenter ? `${formatFCFA(cashCenter.theoretical.amount)} FCFA` : "—"}
            </p>
            <p className="mt-1 text-[11px] text-white/60">Calculé à {theoreticalTime}</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-sm font-bold">Ventilation des encaissements</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {cashCenter ? `${formatFCFA(cashCenter.breakdown.total)} FCFA encaissés` : "Données indisponibles"}
            </p>
            <div className="mt-3 space-y-2.5 text-xs">
              {(cashCenter?.breakdown.methods ?? []).map((method, index) => {
                const barColors = ["bg-primary", "bg-emerald-500", "bg-amber-500", "bg-sky-500"];
                return <div key={method.code}>
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">{method.label}</span>
                    <span className="font-bold">{formatFCFA(method.amount)} FCFA • {method.percent.toLocaleString("fr-FR")} %</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full", barColors[index % barColors.length])} style={{ width: `${method.percent}%` }} />
                  </div>
                </div>
              })}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <h2 className="text-sm font-bold">Montant réellement compté</h2>
          <p className="mt-2 text-2xl font-extrabold tracking-tight">
            {cashCenter ? `${formatFCFA(cashCenter.counted.amount)} FCFA` : "—"}
          </p>
          <Badge
            variant="outline"
            className={cn(
              "mt-2 gap-1 border-0 text-[10px] font-bold",
              !cashCenter ? "bg-muted text-muted-foreground" : cashCenter.counted.difference === 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700",
            )}
          >
            <span className={cn(
              "size-1.5 rounded-full",
              !cashCenter ? "bg-muted-foreground" : cashCenter.counted.difference === 0 ? "bg-emerald-500" : "bg-red-500",
            )} />
            Écart {cashCenter ? `${formatFCFA(cashCenter.counted.difference)} FCFA` : "—"}
          </Badge>
          <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
            {cashCenter?.kpis.difference.label ?? "Données de comptage indisponibles."}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full border-emerald-200 bg-white text-xs font-bold"
            onClick={() => updatePath("/caisse/cloture")}
          >
            Clôturer la journée
          </Button>
        </div>
      </div>

      {/* Flux + synchro */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-4 sm:p-5 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Flux de caisse</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Entrées et sorties cumulées • tranche de 60 minutes</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-[11px] font-semibold text-muted-foreground"
              onClick={() => updatePath("/caisse/cloture")}
            >
              Voir le rapport
            </Button>
          </div>
          <p className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-500" /> Entrées</span>
            <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-red-400" /> Sorties</span>
            <span className="ml-auto font-bold text-foreground">
              Solde net {cashCenter ? `${cashCenter.hourly.net >= 0 ? "+" : "−"}${formatFCFA(Math.abs(cashCenter.hourly.net))} FCFA` : "—"}
            </span>
          </p>
          <div className="mt-3 flex h-40 items-end gap-2">
            {(cashCenter?.hourly.series ?? []).map((hour) => (
              <div key={hour.hour} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <div className="flex h-32 w-full items-end justify-center gap-1">
                  <div className="w-2.5 rounded-sm bg-emerald-500" style={{ height: `${hour.in ? Math.max(2, (hour.in / hourlyMax) * 100) : 0}%` }} title={`Entrées ${hour.hour} : ${formatFCFA(hour.in)} FCFA`} />
                  <div className="w-2.5 rounded-sm bg-red-400" style={{ height: `${hour.out ? Math.max(2, (hour.out / hourlyMax) * 100) : 0}%` }} title={`Sorties ${hour.hour} : ${formatFCFA(hour.out)} FCFA`} />
                </div>
                <span className="text-[10px] text-muted-foreground">{hour.hour}</span>
              </div>
            ))}
            {cashCenter && cashCenter.hourly.series.length === 0 && (
              <p className="m-auto text-xs text-muted-foreground">Aucun flux horaire disponible.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
          <h2 className="text-sm font-bold">Synchronisation hors ligne</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{cashCenter?.agency ?? "Agence"}</p>
          <p className="mt-3 rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
            L&apos;API du centre de caisse ne fournit pas encore les informations de synchronisation.
          </p>
        </div>
      </div>

      {/* Journal */}
      <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold">Journal de caisse</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {cashCenter
                ? `${cashCenter.journal_totals.operations} opérations • total entrées ${formatFCFA(cashCenter.journal_totals.total_in)} FCFA • total sorties ${formatFCFA(cashCenter.journal_totals.total_out)} FCFA`
                : "Totaux du journal indisponibles"}
            </p>
          </div>
          <div className="flex items-center gap-2">
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
                    ["categorie", "Catégorie"],
                    ["operateur", "Opérateur"],
                    ["paiement", "Paiement"],
                    ["flux", "Flux"],
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
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={() => toast.success("Export CSV lancé", { description: "Le journal sera téléchargé dans quelques secondes." })}
            >
              <Download className="size-3.5" />
              Exporter
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="relative min-w-52 flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher une référence, catégorie ou opérateur…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              className="h-9 bg-muted/40 pl-9 text-[13px]"
            />
          </div>
          <Select value={dateSel} onValueChange={(v) => { setDateSel(v ?? "today"); resetPage(); }}>
            <SelectTrigger className="w-auto text-xs data-[size=default]:h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd&apos;hui • {dateLabel}</SelectItem>
              <SelectItem value="yesterday">Hier</SelectItem>
              <SelectItem value="all">Toutes dates</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categorie} onValueChange={(v) => { setCategorie(v ?? "all"); resetPage(); }}>
            <SelectTrigger className="w-auto text-xs data-[size=default]:h-9">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={paiement} onValueChange={(v) => { setPaiement(v ?? "all"); resetPage(); }}>
            <SelectTrigger className="w-auto text-xs data-[size=default]:h-9">
              <SelectValue placeholder="Paiement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les paiements</SelectItem>
              {["Espèces", "Mobile Money", "Carte"].map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statut} onValueChange={(v) => { setStatut(v ?? "all"); resetPage(); }}>
            <SelectTrigger className="w-auto text-xs data-[size=default]:h-9">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {["Synchronisé", "Validé", "Hors ligne"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
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
        </div>

        <div className="mt-3">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">DATE / HEURE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">RÉFÉRENCE</TableHead>
                {columns.categorie && <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">CATÉGORIE</TableHead>}
                {columns.operateur && <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">OPÉRATEUR</TableHead>}
                {columns.paiement && <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PAIEMENT</TableHead>}
                {columns.flux && <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">FLUX</TableHead>}
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">MONTANT</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">STATUT</TableHead>
                <TableHead className="w-20 text-[10px] font-bold tracking-wide text-muted-foreground">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((o) => (
                <TableRow key={o.ref} className={cn(o.statut === "Hors ligne" && "bg-amber-50/50 hover:bg-amber-50")}>
                  <TableCell className="text-xs text-muted-foreground">{o.date}</TableCell>
                  <TableCell className="text-xs font-bold">{o.ref}</TableCell>
                  {columns.categorie && <TableCell className="text-xs">{o.categorie}</TableCell>}
                  {columns.operateur && <TableCell className="text-xs">{o.operateur}</TableCell>}
                  {columns.paiement && <TableCell className="text-xs text-muted-foreground">{o.paiement}</TableCell>}
                  {columns.flux && (
                    <TableCell className={cn("text-xs font-semibold", o.flux === "Sortie" ? "text-red-500" : "")}>
                      {o.flux}
                    </TableCell>
                  )}
                  <TableCell className="text-xs font-bold">{formatFCFA(o.montant)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("border-0 text-[10px] font-semibold", statutBadge[o.statut])}>
                      {o.statut}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Voir ${o.ref}`}
                        className="size-6"
                        onClick={() => toast.info(o.ref, { description: `${o.categorie} • ${formatFCFA(o.montant)} FCFA • ${o.operateur}.` })}
                      >
                        <Eye className="size-3.5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions pour ${o.ref}`} className="size-6">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => toast.info(o.ref, { description: `${formatFCFA(o.montant)} FCFA • ${o.operateur}.` })}>
                            Voir le détail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success("Reçu envoyé à l'impression")}>
                            Imprimer le reçu
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={9} className="py-10 text-center text-[13px] text-muted-foreground">
                    Le détail des opérations n&apos;est pas fourni par l&apos;API du centre de caisse.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            {filtered.length === 0 ? "0" : `${start + 1}–${start + rows.length}`} ligne détaillée • {cashCenter?.journal_totals.operations ?? 0} opérations au total
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="gap-1 px-2.5 text-[11px] font-semibold">
              <ChevronLeft className="size-3.5" />
              Précédent
            </Button>
            <Button variant="default" size="icon-sm" className="text-[11px] font-bold">
              {safePage}
            </Button>
            <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="gap-1 px-2.5 text-[11px] font-semibold">
              Suivant
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
