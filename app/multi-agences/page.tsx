"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  Banknote,
  Bell,
  CalendarDays,
  CheckCircle2,
  Download,
  GitCompareArrows,
  Heart,
  Inbox,
  RefreshCw,
  Scale,
  Target,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useGlobalData } from "@/contexts/GlobalContext";
import { useAuth } from "@/contexts/AuthContext";
import { getNetworkOverviewAction } from "@/actions/AdminAction";
import { handleApiAction } from "@/functions/handleResponseApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  NetworkAlert,
  NetworkOverviewData,
  NetworkOverviewParams,
} from "./types";

const fmt = (n: number | null | undefined) => new Intl.NumberFormat("fr-FR").format(n ?? 0);
const fmtMoney = (n: number | null | undefined) => `${fmt(n)} FCFA`;
const fmtPct = (n: number | null | undefined) =>
  `${(n ?? 0) > 0 ? "+" : ""}${(n ?? 0).toLocaleString("fr-FR")} %`;
const fmtShare = (n: number | null | undefined) =>
  (n ?? 0).toLocaleString("fr-FR", { maximumFractionDigits: 1 });

const DATE_LABEL = { day: "numeric", month: "short", year: "numeric" } as const;

const pad = (n: number) => String(n).padStart(2, "0");
const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const labelDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", DATE_LABEL);

// Évaluées une seule fois au chargement du module (pas pendant le render) pour
// éviter l'erreur Next.js « unstable value new Date() in a Client Component ».
const TODAY = isoDate(new Date());
const MONTH_START = `${new Date().getFullYear()}-${pad(new Date().getMonth() + 1)}-01`;

interface KpiCard {
  label: string;
  value: string;
  sub: string;
  subClass?: string;
  icon: LucideIcon;
  iconBg: string;
}

/* ----------------------------------- Page ---------------------------------- */

export default function MultiAgencesPage() {
  const { updatePath } = useGlobalData();
  const { logout } = useAuth();
  const [data, setData] = useState<NetworkOverviewData | null>(null);
  const [loading, setLoadingState] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState(MONTH_START);
  const [dateTo, setDateTo] = useState(TODAY);

  const loadOverview = useCallback(() => {
    void handleApiAction({
      action: getNetworkOverviewAction,
      params: { date_from: dateFrom, date_to: dateTo } as NetworkOverviewParams,
      setLoading: setLoadingState,
      showErrorToast: false,
      logout,
      onSuccess: (res) => {
        setData(res as NetworkOverviewData);
        setLoadError(null);
      },
      onError: setLoadError,
    });
  }, [dateFrom, dateTo, logout]);

  useEffect(() => {
    loadOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo]);

  const { k: kpis, period } = useMemo(
    () => ({ k: data?.kpis, period: data?.period }),
    [data],
  );

  const periodeLabel = useMemo(() => {
    if (!period) return "Mois en cours";
    return `${labelDate(period.from)} – ${labelDate(period.to)}`;
  }, [period]);

  const periodeCompare = useMemo(() => {
    if (!period) return null;
    return `${labelDate(period.compare_from)} – ${labelDate(period.compare_to)}`;
  }, [period]);

  /* ----------------------------------- KPI --------------------------------- */

  const kpiCards = useMemo((): KpiCard[] => {
    if (!kpis) {
      const value = loading ? "Chargement…" : "—";
      const sub = loadError ? "Données indisponibles" : " ";
      const placeholder = { value, sub };
      return [
        { label: "Chiffre d'affaires", ...placeholder, icon: Banknote, iconBg: "bg-stone-100 text-stone-500" },
        { label: "Dépôts", ...placeholder, icon: Inbox, iconBg: "bg-stone-100 text-stone-500" },
        { label: "Retraits", ...placeholder, icon: CheckCircle2, iconBg: "bg-amber-50 text-amber-600" },
        { label: "Cash-flow net", ...placeholder, icon: Wallet, iconBg: "bg-stone-100 text-stone-500" },
        { label: "Impayés", ...placeholder, icon: TriangleAlert, iconBg: "bg-red-50 text-red-500" },
        { label: "Membres fidélité", ...placeholder, icon: Heart, iconBg: "bg-amber-50 text-amber-600" },
        { label: "Santé synchronisation", ...placeholder, icon: RefreshCw, iconBg: "bg-stone-100 text-stone-500" },
        { label: "Objectif réseau", ...placeholder, icon: Target, iconBg: "bg-sky-50 text-sky-600" },
      ];
    }
    return [
      {
        label: "Chiffre d'affaires",
        value: fmtMoney(kpis.revenue.value),
        sub: `${fmtPct(kpis.revenue.delta_percent)}${periodeCompare ? ` vs ${periodeCompare}` : ""}`,
        icon: Banknote,
        iconBg: "bg-stone-100 text-stone-500",
      },
      {
        label: "Dépôts",
        value: fmt(kpis.deposits.value),
        sub: `${fmt(kpis.deposits.pieces)} pièces reçues`,
        icon: Inbox,
        iconBg: "bg-stone-100 text-stone-500",
      },
      {
        label: "Retraits",
        value: fmt(kpis.retrievals.value),
        sub: `${fmtShare(kpis.retrievals.finalized_percent)} % finalisés`,
        icon: CheckCircle2,
        iconBg: "bg-amber-50 text-amber-600",
      },
      {
        label: "Cash-flow net",
        value: fmtMoney(kpis.cash_flow.value),
        sub: `${fmtPct(kpis.cash_flow.delta_percent)} sur la période`,
        icon: Wallet,
        iconBg: "bg-stone-100 text-stone-500",
      },
      {
        label: "Impayés",
        value: fmtMoney(kpis.unpaid.value),
        sub: `${fmt(kpis.unpaid.deposits)} dépôts • ${fmtShare(kpis.unpaid.share_of_revenue)} % du CA`,
        subClass: "text-red-500",
        icon: TriangleAlert,
        iconBg: "bg-red-50 text-red-500",
      },
      {
        label: "Membres fidélité",
        value: fmt(kpis.loyalty.members),
        sub: `${fmt(kpis.loyalty.points_issued)} points attribués`,
        subClass: "text-amber-600",
        icon: Heart,
        iconBg: "bg-amber-50 text-amber-600",
      },
      {
        label: "Santé synchronisation",
        value: `${fmtShare(kpis.sync_health.percent)} %`,
        sub: `${fmt(kpis.sync_health.online_agencies)} / ${fmt(kpis.sync_health.agencies)} agences en ligne`,
        icon: RefreshCw,
        iconBg: "bg-stone-100 text-stone-500",
      },
      {
        label: "Objectif réseau",
        value: `${fmtShare(kpis.network_objective.percent)} %`,
        sub: `${fmt(kpis.network_objective.agencies_above_85)} agences au-dessus de 85 %`,
        icon: Target,
        iconBg: "bg-sky-50 text-sky-600",
      },
    ];
  }, [kpis, periodeCompare, loading, loadError]);

  /* --------------------------------- Graphique ------------------------------ */

  const caBars = useMemo(() => {
    const series = data?.revenue_chart.series ?? [];
    const max = Math.max(1, ...series.map((s) => s.revenue ?? 0));
    return series.map((s) => ({
      date: s.date,
      v: Math.max(2, Math.round(((s.revenue ?? 0) / max) * 100)),
    }));
  }, [data]);

  const barStep = caBars.length > 10 ? Math.ceil(caBars.length / 6) : 1;

  /* ---------------------------------- Alertes ------------------------------- */

  const ALERT_ICONS: Record<string, LucideIcon> = {
    unpaid: TriangleAlert,
    delay: Bell,
    rhyme: Bell,
    sync: RefreshCw,
    objective: Target,
  };

  const alertTone = (a: NetworkAlert) =>
    a.severity === "critical" ? "red" : a.severity === "warning" || a.severity === "high" ? "amber" : a.severity === "success" ? "emerald" : "muted";

  const alertPath = (a: NetworkAlert): string => {
    switch (a.type) {
      case "unpaid":
        return "/retraits";
      case "sync":
        return "/synchronisation";
      case "delay":
        return "/retraits";
      default:
        return `/multi-agences/${a.agency_id}`;
    }
  };

  /* -------------------------------- Navigation ------------------------------ */

  const agencyPath = (agencyId: number) => `/multi-agences/${agencyId}`;

  const agencesEnLigne = data?.agencies.filter((a) => a.online).length ?? 0;

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
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Vue consolidée multi-agences</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Performance du réseau SPARK PRESSING • {periodeLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-2 py-1.5">
            <CalendarDays className="size-3.5 text-muted-foreground" />
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value || dateFrom)}
              className="w-28 bg-transparent text-xs font-bold text-foreground outline-none"
              aria-label="Date de début"
            />
            <span className="text-xs text-muted-foreground">→</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              max={TODAY}
              onChange={(e) => setDateTo(e.target.value || dateTo)}
              className="w-28 bg-transparent text-xs font-bold text-foreground outline-none"
              aria-label="Date de fin"
            />
          </div>
          <Button
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={loadOverview}
            disabled={loading}
          >
            {loading ? "Chargement…" : "Appliquer"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.success("Export lancé", { description: `Rapport consolidé en cours de génération${periodeLabel ? ` • ${periodeLabel}` : ""}.` })}
          >
            <Download className="size-3.5" />
            Exporter
          </Button>
          <Button
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.info("Comparaison", { description: "Sélectionnez 2 agences à comparer." })}
          >
            <GitCompareArrows className="size-4" />
            Comparer
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
              <span className={cn("flex size-8 items-center justify-center rounded-lg", k.iconBg)}>
                <k.icon className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-xl font-extrabold tracking-tight">{k.value}</p>
            <p className={cn("mt-1.5 text-[11px] text-muted-foreground", k.subClass)}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* CA + classement */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Chiffre d&apos;affaires réseau</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {fmtMoney(data?.revenue_chart.total)} • évolution journalière
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs font-semibold text-muted-foreground"
              onClick={() => toast.info("Rapport financier", { description: `${periodeLabel} • toutes agences.` })}
            >
              Rapport financier <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          {caBars.length === 0 ? (
            <div className="mt-4 flex h-44 items-center justify-center text-xs text-muted-foreground">
              {loading ? "Chargement des données…" : loadError ? "Données indisponibles." : "Aucun encaissement sur la période."}
            </div>
          ) : (
            <>
              <div className="mt-4 flex h-44 items-end gap-1.5">
                {caBars.map((b, i) => (
                  <div
                    key={b.date}
                    title={`${labelDate(b.date)} • ${fmtMoney(data?.revenue_chart.series[i]?.revenue)}`}
                    className={cn("min-w-0 flex-1 rounded-sm", i === caBars.length - 1 ? "bg-secondary" : "bg-emerald-500")}
                    style={{ height: `${b.v}%` }}
                  />
                ))}
              </div>
              <div className="mt-1 flex gap-1.5">
                {caBars.map((b, i) => (
                  <span key={b.date} className="min-w-0 flex-1 text-center text-[10px] text-muted-foreground">
                    {i % barStep === 0 ? labelDate(b.date).split(/[\s\u202f]/)[0] : ""}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Classement des agences</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">CA cumulé et tendance</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs font-semibold text-muted-foreground"
              onClick={() => toast.info("Drill-down", { description: "Détail par agence et par semaine." })}
            >
              Drill-down <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <div className="mt-4 space-y-4">
            {(data?.ranking ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {loading ? "Chargement des données…" : "Aucune agence sur la période."}
              </p>
            ) : (
              data?.ranking.map((a, i) => {
                const path = agencyPath(a.agency_id);
                const barColors = ["bg-emerald-600", "bg-primary", "bg-secondary", "bg-slate-300"];
                return (
                  <button
                    key={a.agency_id}
                    type="button"
                    onClick={() => updatePath(path)}
                    className="block w-full text-left"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <span className={cn(
                          "flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                          a.rank === 1 ? "bg-primary text-white" : "bg-muted",
                        )}>
                          {a.rank ?? i + 1}
                        </span>
                        {a.name}
                      </span>
                      <span className="text-right">
                        <span className="block font-bold">{fmtMoney(a.revenue)}</span>
                        <span className={cn("block text-[11px] font-bold", (a.delta_percent ?? 0) < 0 ? "text-red-500" : "text-emerald-600")}>
                          {fmtPct(a.delta_percent)}
                        </span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", barColors[i % barColors.length])}
                        style={{ width: `${Math.min(100, Math.max(0, a.share_percent ?? 0))}%` }}
                      />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Comparaison + alertes */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Comparaison inter-agences</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Activité, recouvrement et objectifs</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs font-semibold text-muted-foreground"
              onClick={() => toast.info("Analyse", { description: `Comparaison détaillée de ${fmt(data?.comparison.length)} agence(s).` })}
            >
              Ouvrir l&apos;analyse <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] font-bold tracking-wide text-muted-foreground">
                  <th className="pb-2">AGENCE</th>
                  <th className="pb-2">DÉPÔTS</th>
                  <th className="pb-2">RETRAITS</th>
                  <th className="pb-2">IMPAYÉS</th>
                  <th className="pb-2">OBJECTIF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(data?.comparison ?? []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-xs text-muted-foreground">
                      {loading ? "Chargement des données…" : "Aucune agence sur la période."}
                    </td>
                  </tr>
                )}
                {(data?.comparison ?? []).map((c) => (
                  <tr key={c.agency_id} className="hover:bg-muted/30">
                    <td className="py-2.5 font-bold">{c.name}</td>
                    <td className="py-2.5 text-muted-foreground">{fmt(c.deposits)}</td>
                    <td className="py-2.5 text-muted-foreground">{fmt(c.retrieved)}</td>
                    <td
                      className={cn(
                        "py-2.5 font-semibold",
                        (c.unpaid_level === "critical" || c.unpaid_level === "high") && "text-red-500",
                        c.unpaid_level === "warning" && "text-secondary",
                      )}
                      title={c.objective ? `Reste ${fmtMoney(c.unpaid)}` : undefined}
                    >
                      {fmtMoney(c.unpaid)}
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2" title={`Cible ${fmtMoney(c.objective?.target)} • reste ${fmtMoney(c.objective?.remaining)}`}>
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              (c.objective?.percent ?? 0) >= 85
                                ? "bg-emerald-500"
                                : (c.objective?.percent ?? 0) >= 75
                                  ? "bg-secondary"
                                  : "bg-red-400",
                            )}
                            style={{ width: `${Math.min(100, Math.max(0, c.objective?.percent ?? 0))}%` }}
                          />
                        </div>
                        <span className="font-bold">{fmtShare(c.objective?.percent)} %</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="text-sm font-bold">Alertes opérationnelles</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {fmt(data?.alerts.length)} élément(s) à traiter
          </p>
          <div className="mt-3 space-y-2.5">
            {(data?.alerts ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {loading ? "Chargement des données…" : "Aucune alerte. Tout est en ordre ✔"}
              </p>
            ) : (
              data?.alerts.map((a) => {
                const tone = alertTone(a);
                const Icon = ALERT_ICONS[a.type] ?? Bell;
                return (
                  <div key={`${a.agency_id}-${a.type}-${a.title}`} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full",
                        tone === "red" && "bg-red-50 text-red-500",
                        tone === "amber" && "bg-amber-50 text-amber-600",
                        tone === "emerald" && "bg-emerald-50 text-emerald-600",
                        tone === "muted" && "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold">{a.title}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{a.detail}</p>
                    </div>
                    <button
                      type="button"
                      className="h-auto shrink-0 text-[11px] font-bold text-foreground hover:underline"
                      onClick={() => updatePath(alertPath(a))}
                    >
                      Voir →
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Réseau */}
      <div className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold">Réseau d&apos;agences</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {fmt(agencesEnLigne)} / {fmt(data?.agencies.length)} agence(s) en ligne • état de service en temps réel
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs font-semibold text-muted-foreground"
            onClick={() => toast.info("Gestion", { description: "Ajoutez ou configurez une agence." })}
          >
            Gérer les agences <ArrowUpRight className="size-3.5" />
          </Button>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {(data?.agencies ?? []).length === 0 ? (
            <p className="col-span-full text-xs text-muted-foreground">
              {loading ? "Chargement des données…" : "Aucune agence sur la période."}
            </p>
          ) : (
            data?.agencies.map((a) => {
              const path = agencyPath(a.agency_id);
              return (
                <button
                  key={a.agency_id}
                  type="button"
                  onClick={() => updatePath(path)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-colors hover:border-primary",
                    a.online ? "border-border" : "border-red-200 bg-red-50/40",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 truncate text-[11px] text-muted-foreground">{a.address || "—"}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "gap-1 shrink-0 border-0 text-[10px] font-bold",
                        a.online ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600",
                      )}
                    >
                      <span className={cn("size-1.5 rounded-full", a.online ? "bg-emerald-500" : "bg-red-400")} />
                      {a.status_label || (a.online ? "En ligne" : "Hors ligne")}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[13px] font-extrabold">{a.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {fmt(a.deposits)} dépôts • objectif {fmtShare(a.objective_percent)} %
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Lien discret vers les écrans restants */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
        <Scale className="size-4 shrink-0" />
        <p className="flex-1">Écrans restants du sidebar : Rapports, Équipe &amp; rôles, Paramètres, Audit &amp; logs.</p>
      </div>
    </div>
  );
}
