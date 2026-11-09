"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  CircleDollarSign,
  Clock,
  Download,
  FileText,
  Heart,
  ReceiptText,
  Scale,
  ShoppingBag,
  TriangleAlert,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useGlobalData } from "@/contexts/GlobalContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  exportReportsAction,
  getReportsOverviewAction,
} from "@/actions/AdminAction";
import { handleApiAction } from "@/functions/handleResponseApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadBase64 } from "./data";
import type {
  ReportsExportFile,
  ReportsOverviewData,
  ReportsOverviewParams,
  ReportsPreset,
} from "./types";

type Metrique = "ca" | "ventes" | "panier";

const fmt = (n: number | null | undefined) => new Intl.NumberFormat("fr-FR").format(n ?? 0);
const fmtMoney = (n: number | null | undefined) => `${fmt(n)} FCFA`;
const fmtPct = (n: number | null | undefined) =>
  `${(n ?? 0) > 0 ? "+" : ""}${(n ?? 0).toLocaleString("fr-FR")} %`;
const fmtM = (n: number | null | undefined) =>
  `${((n ?? 0) / 1_000_000).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} M`;

const DATE_LABEL = { day: "numeric", month: "short", year: "numeric" } as const;

const PRESETS: { value: ReportsPreset; label: string }[] = [
  { value: "today", label: "Aujourd'hui" },
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
];

const METRIQUES: [Metrique, string][] = [
  ["ca", "Chiffre d'affaires"],
  ["ventes", "Ventes"],
  ["panier", "Panier moyen"],
];

const AGENCES_PAGE_SIZE = 5;

const DONUT_COLORS = [
  { cls: "stroke-emerald-500", dot: "bg-emerald-500" },
  { cls: "stroke-secondary", dot: "bg-secondary" },
  { cls: "stroke-slate-400", dot: "bg-slate-400" },
  { cls: "stroke-slate-200", dot: "bg-slate-200" },
  { cls: "stroke-sky-500", dot: "bg-sky-500" },
];

const REPORT_ICONS: Record<string, typeof FileText> = {
  daily: FileText,
  cashiers: Users,
  unpaid: ReceiptText,
  loyalty: Heart,
  cash: Wallet,
  agencies: Scale,
};

export default function RapportsPage() {
  const { updatePath } = useGlobalData();
  const { logout, setLoading } = useAuth();
  const [data, setData] = useState<ReportsOverviewData | null>(null);
  const [loading, setLoadingState] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [preset, setPreset] = useState<ReportsPreset>("30d");
  const [agence, setAgence] = useState("all");
  const [comparaison, setComparaison] = useState("vs période précédente");
  const [metrique, setMetrique] = useState<Metrique>("ca");
  const [agencePage, setAgencePage] = useState(1);
  const [agenceOptions, setAgenceOptions] = useState<{ value: string; label: string }[]>([
    { value: "all", label: "Toutes les agences" },
  ]);

  const loadOverview = useCallback(() => {
    void handleApiAction({
      action: getReportsOverviewAction,
      params: { preset: preset, agency_id: agence } as ReportsOverviewParams,
      setLoading: setLoadingState,
      showErrorToast: false,
      logout,
      onSuccess: (res) => {
        const overview = res as ReportsOverviewData;
        setData(overview);
        setLoadError(null);
        // On conserve la liste complète des agences, même lorsqu'un filtre est actif.
        setAgenceOptions((prev) => {
          const merged = new Map(prev.map((o) => [o.value, o.label]));
          for (const a of overview.agencies ?? []) {
            merged.set(String(a.agency_id), a.name);
          }
          return Array.from(merged, ([value, label]) => ({ value, label }));
        });
      },
      onError: setLoadError,
    });
  }, [preset, agence, logout]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const buildQuery = useCallback(
    (): ReportsOverviewParams => ({
      preset: preset,
      agency_id: agence !== "all" ? agence : undefined,
    }),
    [preset, agence],
  );

  const handleExport = useCallback(
    (format: "csv" | "pdf") => {
      void handleApiAction({
        action: (p?: { format: "csv" | "pdf"; query: ReportsOverviewParams }) =>
          exportReportsAction("/reports/overview", p?.format ?? format, p?.query),
        params: { format, query: buildQuery() },
        setLoading,
        logout,
        showToast: false,
        onSuccess: (res: ReportsExportFile) => {
          downloadBase64(res.base64, res.mime, res.filename);
          toast.success("Export téléchargé", {
            description: `Le rapport au format ${format.toUpperCase()} est prêt.`,
          });
        },
      });
    },
    [buildQuery, setLoading, logout],
  );

  const periodeLabel = useMemo(() => {
    if (!data) return loading ? "Chargement…" : "—";
    const from = new Date(`${data.period.from}T12:00:00`);
    const to = new Date(`${data.period.to}T12:00:00`);
    return `${from.toLocaleDateString("fr-FR", DATE_LABEL)} – ${to.toLocaleDateString("fr-FR", DATE_LABEL)}`;
  }, [data, loading]);

  const kpis = useMemo(() => {
    if (!data) {
      const value = loading ? "Chargement…" : "—";
      const sub = loadError ? "Données indisponibles" : " ";
      return [
        { label: "Chiffre d'affaires", value, sub, icon: Banknote, iconBg: "bg-stone-100 text-stone-500" },
        { label: "Ventes", value, sub, icon: ShoppingBag, iconBg: "bg-stone-100 text-stone-500" },
        { label: "Remises", value, sub, icon: CircleDollarSign, iconBg: "bg-amber-50 text-amber-600" },
        { label: "Impayés", value, sub, icon: TriangleAlert, iconBg: "bg-red-50 text-red-500" },
      ];
    }
    const k = data.kpis;
    return [
      {
        label: "Chiffre d'affaires",
        value: fmtMoney(k.revenue.value),
        sub: `${fmtPct(k.revenue.delta_percent)} vs période précédente`,
        icon: Banknote,
        iconBg: "bg-stone-100 text-stone-500",
      },
      {
        label: "Ventes",
        value: fmt(k.sales.value),
        sub: `${fmtPct(k.sales.delta_percent)} • panier ${fmt(k.sales.average_basket)}`,
        icon: ShoppingBag,
        iconBg: "bg-stone-100 text-stone-500",
      },
      {
        label: "Remises",
        value: fmtMoney(k.discounts.value),
        sub: `${(k.discounts.share_of_revenue ?? 0).toLocaleString("fr-FR")} % du CA`,
        icon: CircleDollarSign,
        iconBg: "bg-amber-50 text-amber-600",
      },
      {
        label: "Impayés",
        value: fmtMoney(k.unpaid.value),
        sub: `${fmtPct(k.unpaid.delta_percent)} vs période précédente`,
        icon: TriangleAlert,
        iconBg: "bg-red-50 text-red-500",
      },
    ];
  }, [data, loading, loadError]);

  const bars = useMemo(() => {
    const series = (data?.revenue_chart.series ?? []).slice(-12);
    const get = (s: ReportsOverviewData["revenue_chart"]["series"][number]) =>
      metrique === "ca" ? s.revenue : metrique === "ventes" ? s.sales : s.average_basket;
    const max = Math.max(1, ...series.map(get));
    const fmtBar = (v: number) => {
      if (metrique === "ventes") return fmt(v);
      if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(".", ",")}M`;
      return `${Math.round(v / 1000)}k`;
    };
    return series.map((s) => {
      const v = get(s) ?? 0;
      return {
        v: Math.max(2, Math.round((v / max) * 100)),
        label: fmtBar(v),
      };
    });
  }, [data, metrique]);

  const donut = useMemo(() => {
    const methods = data?.payments.methods ?? [];
    return methods.map((m, i) => {
      const cumulative = methods
        .slice(0, i)
        .reduce((total, method) => total + method.percent, 0);
      const offset = 25 - cumulative;
      return { ...m, ...DONUT_COLORS[i % DONUT_COLORS.length], offset };
    });
  }, [data]);

  const agencesRows = useMemo(
    () =>
      (data?.agencies ?? []).map((a) => ({
        id: a.agency_id,
        nom: a.name,
        ca: fmtMoney(a.revenue),
        ventes: a.sales,
        panier: fmtMoney(a.average_basket),
        evolution: fmtPct(a.delta_percent),
        up: (a.delta_percent ?? 0) >= 0,
      })),
    [data],
  );

  const agencesPagination = useMemo(() => {
    const total = agencesRows.length;
    const totalPages = Math.max(1, Math.ceil(total / AGENCES_PAGE_SIZE));
    const safePage = Math.min(agencePage, totalPages);
    const start = (safePage - 1) * AGENCES_PAGE_SIZE;
    return {
      total,
      totalPages,
      page: safePage,
      start: total > 0 ? start + 1 : 0,
      end: Math.min(start + AGENCES_PAGE_SIZE, total),
      rows: agencesRows.slice(start, start + AGENCES_PAGE_SIZE),
    };
  }, [agencesRows, agencePage]);

  return (
    <div className="space-y-5">
      {loadError && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          <TriangleAlert className="size-4 shrink-0" />
          <p className="flex-1">{loadError}</p>
          <Button size="sm" variant="outline" className="text-[11px] font-bold" onClick={loadOverview}>
            Réessayer
          </Button>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-xl text-[13px] text-muted-foreground">
          Analysez l&apos;activité commerciale, les encaissements et la qualité opérationnelle.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.info("Programmation", { description: "Rapport mensuel envoyé le 1er à 08:00." })}
          >
            <Clock className="size-3.5" />
            Programmer
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button size="lg" className="gap-1.5 px-3 text-xs font-bold">
                  <Download className="size-4" />
                  Exporter CSV / PDF
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-xs" onClick={() => handleExport("csv")}>
                Exporter CSV / Excel
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs" onClick={() => handleExport("pdf")}>
                Exporter PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-white p-3">
        <div className="min-w-40 flex-1">
          <p className="mb-1 text-[10px] font-bold text-muted-foreground">Période</p>
          <Select
            items={PRESETS}
            value={preset}
            onValueChange={(v) => {
              setPreset((v as ReportsPreset) ?? preset);
              setAgencePage(1);
            }}
          >
            <SelectTrigger className="w-full text-xs data-[size=default]:h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRESETS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-40 flex-1">
          <p className="mb-1 text-[10px] font-bold text-muted-foreground">Agence</p>
          <Select
            items={agenceOptions}
            value={agence}
            onValueChange={(v) => {
              setAgence(v ?? "all");
              setAgencePage(1);
            }}
          >
            <SelectTrigger className="w-full text-xs data-[size=default]:h-9">
              <SelectValue placeholder="Agence" />
            </SelectTrigger>
            <SelectContent>
              {agenceOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-40 flex-1">
          <p className="mb-1 text-[10px] font-bold text-muted-foreground">Comparaison</p>
          <Select value={comparaison} onValueChange={(v) => setComparaison(v ?? comparaison)}>
            <SelectTrigger className="w-full text-xs data-[size=default]:h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vs période précédente">vs période précédente</SelectItem>
              <SelectItem value="vs même mois N-1">vs même mois N-1</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-1.5 pt-5">
          {PRESETS.map((p) => (
            <Button
              key={p.value}
              variant={preset === p.value ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setPreset(p.value);
                setAgencePage(1);
              }}
              className="h-9 px-3 text-[11px] font-bold"
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

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

      {/* Évolution + donut */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Évolution du chiffre d&apos;affaires</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{periodeLabel}</p>
            </div>
            <Badge variant="outline" className="border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
              Objectif {data?.revenue_chart.objective?.percent ?? "—"}%
            </Badge>
          </div>
          <div className="mt-3 flex gap-1.5">
            {METRIQUES.map(([v, label]) => (
              <Button
                key={v}
                variant={metrique === v ? "default" : "ghost"}
                size="sm"
                onClick={() => setMetrique(v)}
                className="h-7 rounded-full px-3 text-[11px] font-bold"
              >
                {label}
              </Button>
            ))}
          </div>
          {bars.length === 0 ? (
            <div className="mt-3 flex h-44 items-center justify-center text-xs text-muted-foreground">
              {loading ? "Chargement des données…" : "Aucune donnée pour cette période."}
            </div>
          ) : (
            <div className="mt-3 flex h-44 items-end gap-1.5">
              {bars.map((b, i) => (
                <div key={i} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1 self-stretch">
                  <span className="text-[10px] font-bold text-muted-foreground">{b.label}</span>
                  <div
                    className={cn("w-full rounded-sm", i === bars.length - 1 ? "bg-secondary" : "bg-emerald-500/70")}
                    style={{ height: `${b.v}%` }}
                  />
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-500" /> Période actuelle</span>
            <span className="font-bold text-foreground">{fmtM(data?.revenue_chart.totals.current)}</span>
            <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-muted-foreground/40" /> Précédente</span>
            <span className="font-bold text-foreground">{fmtM(data?.revenue_chart.totals.previous)}</span>
            <span className="ml-auto">Projection <span className="font-bold text-foreground">{fmtM(data?.revenue_chart.totals.projection)}</span></span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold">Recettes par paiement</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{fmtMoney(data?.payments.total)} encaissés</p>
            {donut.length === 0 ? (
              <div className="mt-3 flex h-28 items-center justify-center text-xs text-muted-foreground">
                {loading ? "Chargement des données…" : "Aucun encaissement sur la période."}
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-4">
                <svg viewBox="0 0 36 36" className="size-28 shrink-0" role="img" aria-label="Répartition des paiements">
                  <circle cx="18" cy="18" r="15.9155" fill="none" strokeWidth="4.5" className="stroke-muted" />
                  {donut.map((s) => (
                    <circle
                      key={s.code}
                      cx="18"
                      cy="18"
                      r="15.9155"
                      fill="none"
                      strokeWidth="4.5"
                      strokeDasharray={`${s.percent} ${100 - s.percent}`}
                      strokeDashoffset={s.offset}
                      strokeLinecap="butt"
                      className={s.cls}
                    />
                  ))}
                </svg>
                <div className="min-w-0 flex-1 space-y-1.5 text-xs">
                  {donut.map((s) => (
                    <p key={s.code} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span className={cn("size-1.5 rounded-full", s.dot)} />
                        {s.label}
                      </span>
                      <span className="font-bold">{s.percent}%</span>
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold">Mouvements hors vente</h2>
            <div className="mt-2 space-y-1.5 text-xs">
              <p className="flex justify-between"><span className="text-muted-foreground">Dépôts</span><span className="font-bold">+{fmt(data?.non_sales_movements.cash_in)}</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Retraits</span><span className="font-bold text-red-500">−{fmt(data?.non_sales_movements.cash_out)}</span></p>
              <p className="flex justify-between border-t border-border pt-1.5"><span className="font-bold">Solde théorique</span><span className="font-extrabold">{fmt(data?.non_sales_movements.theoretical_balance)}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Agences + fidélité */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 xl:col-span-2">
          <h2 className="text-sm font-bold">Performance des agences</h2>
          <div className="mt-3">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {["AGENCE", "CA", "VENTES", "PANIER", "ÉVOLUTION"].map((h) => (
                    <TableHead key={h} className="text-[10px] font-bold tracking-wide text-muted-foreground">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {agencesRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-xs text-muted-foreground">
                      {loading ? "Chargement des données…" : "Aucune agence sur la période."}
                    </TableCell>
                  </TableRow>
                )}
                {agencesPagination.rows.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-xs font-bold">{a.nom}</TableCell>
                    <TableCell className="text-xs">{a.ca}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{fmt(a.ventes)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{a.panier}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border-0 text-[10px] font-bold", a.up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-500")}>
                        {a.evolution}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span>
              {agencesPagination.total > 0
                ? `${agencesPagination.start}–${agencesPagination.end} sur ${agencesPagination.total} résultats`
                : "0 résultat"}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: agencesPagination.totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === agencesPagination.page ? "default" : "outline"}
                  size="icon-sm"
                  onClick={() => setAgencePage(p)}
                  className="text-[11px] font-bold"
                  aria-label={`Page ${p}`}
                  aria-current={p === agencesPagination.page ? "page" : undefined}
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="text-sm font-bold">Programme fidélité</h2>
          <p className="mt-2 text-2xl font-extrabold">{fmt(data?.loyalty.active_members)}</p>
          <p className="text-[11px] text-muted-foreground">membres actifs</p>
          <div className="mt-3 space-y-1.5 text-xs">
            <p className="flex justify-between"><span className="text-muted-foreground">Points émis</span><span className="font-bold">{fmt(data?.loyalty.points_issued)}</span></p>
            <p className="flex justify-between"><span className="text-muted-foreground">Points utilisés</span><span className="font-bold">{fmt(data?.loyalty.points_used)}</span></p>
            <p className="flex justify-between"><span className="text-muted-foreground">Rétention</span><span className="font-bold">{fmt(data?.loyalty.retention_percent)}%</span></p>
          </div>
        </div>
      </div>

      {/* Rapports détaillés */}
      <div className="rounded-xl border border-border bg-white p-5">
        <h2 className="text-sm font-bold">Rapports détaillés</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Accès rapide et exportable</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {(data?.reports ?? []).map((r) => {
            const Icon = REPORT_ICONS[r.code] ?? FileText;
            return (
              <button
                key={r.code}
                type="button"
                onClick={() =>
                  r.code === "daily"
                    ? updatePath("/rapports/bilan")
                    : toast.info(r.label, { description: "Rapport disponible prochainement en export." })
                }
                className="flex items-center gap-2.5 rounded-xl border border-border p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                  <Icon className="size-4 text-muted-foreground" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold">{r.label}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{r.detail}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Lien écrans restants */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
        <CalendarDays className="size-4 shrink-0" />
        <p className="flex-1">Dernier écran restant du sidebar : Audit &amp; logs.</p>
      </div>
    </div>
  );
}
