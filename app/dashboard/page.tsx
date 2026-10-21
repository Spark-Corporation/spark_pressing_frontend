"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ArrowUpRight } from "lucide-react";
import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGlobalData } from "@/contexts/GlobalContext";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardAction } from "@/actions/AdminAction";
import { handleApiAction } from "@/functions/handleResponseApi";
import type { DashboardData } from "@/lib/types";

const fmt = (n: number | null | undefined) => new Intl.NumberFormat("fr-FR").format(n ?? 0);
const fmtMoney = (n: number | null | undefined) => `${fmt(n)} FCFA`;
const fmtPct = (n: number | null | undefined) => {
  const v = n ?? 0;
  return `${v > 0 ? "+" : ""}${v.toLocaleString("fr-FR")} %`;
};

/* --------------------------------- Graphique ------------------------------- */

function RevenueChart({ series }: { series: { date: string; revenue: number | null }[] }) {
  const { path, points, days, maxLabel } = useMemo(() => {
    if (series.length < 2) {
      return { path: "", points: [] as { x: number; y: number }[], days: [] as string[], maxLabel: "0" };
    }
    const w = 600;
    const h = 200;
    const padX = 20;
    const padY = 20;
    const max = Math.max(...series.map((s) => s.revenue ?? 0)) || 1;
    const stepX = (w - padX * 2) / (series.length - 1);
    const pts = series.map((s, i) => ({
      x: Math.round(padX + i * stepX),
      y: Math.round(h - padY - ((s.revenue ?? 0) / max) * (h - padY * 2)),
    }));
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cx = (prev.x + curr.x) / 2;
      d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    const lbl = (v: number) => (v >= 1000000 ? `${(v / 1000000).toFixed(1).replace(".", ",")} M` : `${Math.round(v / 1000)} k`);
    const dayLabels = series.map((s) => {
      const dt = new Date(s.date);
      return dt.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
    });
    return { path: d, points: pts, days: dayLabels, maxLabel: lbl(max) };
  }, [series]);

  if (series.length < 2) {
    return (
      <div className="mt-2 flex h-52 items-center justify-center rounded-lg bg-muted/40 text-[13px] text-muted-foreground sm:h-60">
        Données insuffisantes pour afficher la courbe.
      </div>
    );
  }

  const last = series[series.length - 1];

  return (
    <div className="relative mt-2">
      <svg viewBox="0 0 600 220" className="h-52 w-full sm:h-60" role="img" aria-label="Revenu du réseau">
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <line x1="0" x2="600" y1={20 + i * 55} y2={20 + i * 55} stroke="#eef0ee" strokeWidth="1" />
            <text x="0" y={14 + i * 55} fontSize="11" fill="#9aa39e">
              {i === 0 ? maxLabel : i === 3 ? "0" : ""}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="7" fill="#15803d" opacity="0.12" />
            <circle cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke="#15803d" strokeWidth="2" />
          </g>
        ))}
      </svg>
      <div className="pointer-events-none absolute top-1/2 left-1/2 hidden -translate-x-6 -translate-y-16 rounded-md bg-primary px-2.5 py-1.5 text-center shadow-lg sm:block">
        <p className="text-[11px] font-bold text-secondary">{fmtMoney(last.revenue)}</p>
        <p className="text-[10px] text-white/70">
          {new Date(last.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
        </p>
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
        {days.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------- Page ---------------------------------- */

const AGENCY_COLORS = [
  { bar: "bg-primary", dot: "bg-primary" },
  { bar: "bg-emerald-600", dot: "bg-emerald-600" },
  { bar: "bg-secondary", dot: "bg-secondary" },
  { bar: "bg-slate-300", dot: "bg-slate-300" },
  { bar: "bg-sky-500", dot: "bg-sky-500" },
  { bar: "bg-violet-500", dot: "bg-violet-500" },
];

const PIPELINE_STYLES: Record<string, { icon: AppIconName; bg: string }> = {
  waiting: { icon: "task", bg: "bg-slate-100" },
  washing: { icon: "washing-machine", bg: "bg-sky-50" },
  ironing: { icon: "iron", bg: "bg-amber-50" },
  control: { icon: "quality", bg: "bg-orange-50" },
  ready: { icon: "check-circle", bg: "bg-emerald-50" },
};

const PAYMENT_METHODS: { key: string; label: string; bar: string }[] = [
  { key: "cash", label: "Espèces", bar: "bg-primary" },
  { key: "mobile_money", label: "Mobile Money", bar: "bg-emerald-600" },
  { key: "card", label: "Carte / Virement", bar: "bg-secondary" },
  { key: "wallet", label: "Portefeuille", bar: "bg-sky-500" },
  { key: "other", label: "Autres", bar: "bg-slate-300" },
];

const emptySubscribe = () => () => {};

export default function DashboardPage() {
  const { updatePath } = useGlobalData();
  const { logout, setLoading, currentUser } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const firstName = mounted && currentUser?.firstName ? currentUser.firstName.trim() : "à vous";

  useEffect(() => {
    handleApiAction({
      action: getDashboardAction,
      setLoading,
      logout,
      onSuccess: (res) => setData(res as DashboardData),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const k = data?.kpis;

  const kpis = useMemo((): { label: string; value: string; badge: string; badgeClass: string; sub: string; icon: AppIconName; iconBg: string }[] => {
    if (!k) return [];    return [
      {
        label: "Chiffre d'affaires",
        value: fmtMoney(k.revenue_today),
        badge: fmtPct(k.revenue_delta_pct),
        badgeClass: (k.revenue_delta_pct ?? 0) >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600",
        sub: "vs. même jour sem. dernière",
        icon: "cash",
        iconBg: "bg-stone-100 text-stone-500",
      },
      {
        label: "Dépôts du jour",
        value: fmt(k.deposits_today),
        badge: `${fmt(k.pieces_today)} pièces`,
        badgeClass: "bg-amber-50 text-amber-700",
        sub: `${fmt(k.deposits_open)} dépôts en cours`,
        icon: "box",
        iconBg: "bg-slate-100 text-slate-500",
      },
      {
        label: "Retraits effectués",
        value: fmt(k.retrieves_today),
        badge: `${(k.retrieve_rate_pct ?? 0).toLocaleString("fr-FR")} %`,
        badgeClass: "bg-amber-50 text-amber-700",
        sub: `${fmt(k.overdue_retrieves)} retards à traiter`,
        icon: "receipt",
        iconBg: "bg-stone-100 text-stone-500",
      },
      {
        label: "Clients fidélité",
        value: fmt(k.loyalty_clients),
        badge: `+${fmt(k.new_clients_month)}`,
        badgeClass: "bg-emerald-50 text-emerald-700",
        sub: `${fmt(k.clients)} clients au total`,
        icon: "heart",
        iconBg: "bg-stone-100 text-stone-500",
      },
    ];
  }, [k]);

  const agences = useMemo(() => {
    if (!data?.agencies?.length) return [];
    const max = Math.max(...data.agencies.map((a) => a.revenue ?? 0)) || 1;
    return data.agencies.map((a, i) => ({
      name: a.name,
      ca: fmtMoney(a.revenue),
      pct: Math.round((a.revenue / max) * 100),
      ...AGENCY_COLORS[i % AGENCY_COLORS.length],
      delta: fmtPct(a.revenue_delta_pct),
      up: (a.revenue_delta_pct ?? 0) >= 0,
    }));
  }, [data]);

  const pipeline = useMemo(() => {
    if (!data?.workshop_pipeline?.columns) return [];
    return data.workshop_pipeline.columns.map((c) => {
      const style = PIPELINE_STYLES[c.etat] ?? PIPELINE_STYLES.waiting;
      return {
        label: c.label,
        count: c.deposits,
        pieces: `${c.pieces} pièces`,
        icon: style.icon,
        bg: style.bg,
      };
    });
  }, [data]);

  const paymentRows = useMemo(() => {
    if (!data?.cash) return [];
    const methods = data.cash.by_payment_method ?? {};
    const total = Object.values(methods).reduce((s, v) => s + v, 0) || 1;
    return PAYMENT_METHODS.filter((m) => (methods[m.key] ?? 0) > 0).map((m) => ({
      label: m.label,
      value: fmtMoney(methods[m.key] ?? 0),
      pct: Math.round(((methods[m.key] ?? 0) / total) * 100),
      bar: m.bar,
    }));
  }, [data]);

  const buckets = useMemo(() => {
    if (!data?.unpaid_aging) return [];
    const b = data.unpaid_aging.buckets;
    return [
      { tranche: "0–30 jours", montant: fmtMoney(b["0_30"].amount), count: `${fmt(b["0_30"].count)} dépôts` },
      { tranche: "31–89 jours", montant: fmtMoney(b["31_89"].amount), count: `${fmt(b["31_89"].count)} dépôts` },
      { tranche: "90+ jours", montant: fmtMoney(b["90_plus"].amount), count: `${fmt(b["90_plus"].count)} dépôts` },
    ];
  }, [data]);

  const syncTime = data?.sync?.last_sync_at
    ? new Date(data.sync.last_sync_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : "—";

  const generatedDate = data?.generated_at
    ? new Date(data.generated_at).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";

  const cumul7d = useMemo(() => {
    if (!data?.series_7d?.length) return 0;
    return data.series_7d.reduce((s, p) => s + p.revenue, 0);
  }, [data]);

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Bonjour {firstName},</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Voici les performances du réseau{generatedDate ? ` au ${generatedDate}` : ""}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="lg" className="gap-1.5 px-3 text-xs font-semibold">
            <AppIcon name="calendar" className="size-3.5 text-muted-foreground" />
            Aujourd&apos;hui
          </Button>
          <Button variant="outline" size="lg" className="gap-1.5 px-3 text-xs font-semibold">
            <AppIcon name="download" className="size-3.5 text-muted-foreground" />
            Exporter
          </Button>
          <Button size="lg" className="gap-1.5 px-3 text-xs font-bold" onClick={() => updatePath("/depots/nouveau")}>
            <AppIcon name="plus" className="size-4" />
            Nouveau dépôt
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kd) => (
          <div key={kd.label} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{kd.label}</p>
              <span className={cn("flex size-8 items-center justify-center rounded-lg", kd.iconBg)}>
                <AppIcon name={kd.icon} className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-xl font-extrabold tracking-tight">{kd.value}</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", kd.badgeClass)}>{kd.badge}</span>
              {kd.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Revenus + comparaison */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 xl:col-span-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Revenu du réseau</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {fmtMoney(cumul7d)} cumul sur {data?.series_7d?.length ?? 0} jours
                {k ? (
                  <>
                    {" "}· <span className={cn("font-semibold", (k.revenue_delta_pct ?? 0) >= 0 ? "text-emerald-600" : "text-red-500")}>{fmtPct(k.revenue_delta_pct)}</span>
                  </>
                ) : null}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="px-2.5 text-[11px] font-semibold">
                Toutes les agences
              </Button>
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground" aria-label="Options du graphique">
                ···
              </Button>
            </div>
          </div>
          <RevenueChart series={data?.series_7d ?? []} />
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Comparaison agences</h2>
            <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold text-muted-foreground">
              Rapport <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">CA · {generatedDate || "aujourd'hui"}</p>
          <div className="mt-4 space-y-4">
            {agences.length === 0 && (
              <p className="text-xs text-muted-foreground">Aucune agence à afficher.</p>
            )}
            {agences.map((a) => (
              <div key={a.name}>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span className={cn("size-1.5 rounded-full", a.dot)} />
                    {a.name}
                  </span>
                  <span className="font-bold">{a.ca}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full", a.bar)} style={{ width: `${a.pct}%` }} />
                </div>
                <p className={cn("mt-1 text-right text-[11px] font-bold", a.up ? "text-emerald-600" : "text-red-500")}>
                  {a.delta}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline + caisse */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold">Pipeline atelier</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {fmt(data?.workshop_pipeline?.in_progress_deposits ?? 0)} commandes en cours · {fmt(data?.workshop_pipeline?.in_progress_pieces ?? 0)} pièces
              </p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold text-muted-foreground">
              Ouvrir l&apos;atelier <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {pipeline.length === 0 && (
              <p className="col-span-full text-xs text-muted-foreground">Aucune étape en cours.</p>
            )}
            {pipeline.map((s) => (
              <div key={s.label} className={cn("rounded-xl p-3", s.bg)}>
                <div className="flex items-center justify-between">
                  <AppIcon name={s.icon} className="size-4 text-muted-foreground" />
                  <span className="text-lg font-extrabold">{s.count}</span>
                </div>
                <p className="mt-2 text-xs font-bold">{s.label}</p>
                <p className="text-[11px] text-muted-foreground">{s.pieces}</p>
              </div>
            ))}
          </div>
          {Array.isArray(data?.workshop_pipeline?.due_soon) && data.workshop_pipeline.due_soon.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs ring-1 ring-amber-100">
              <AppIcon name="clock" className="size-4 text-amber-600" />
              <p className="flex-1 text-amber-900">
                <span className="font-bold">{data.workshop_pipeline.due_soon.length} commandes approchent leur délai promis</span>
              </p>
              <Button variant="link" size="sm" className="font-bold text-amber-700">
                À traiter
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold">Flux de caisse</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Aujourd&apos;hui</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold text-muted-foreground">
              Détails <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Solde net</p>
          <div className="flex items-center justify-between">
            <p className="text-xl font-extrabold">{fmtMoney(data?.cash?.balance ?? 0)}</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Caisse ouverte
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-emerald-50/70 p-2.5">
              <p className="text-[11px] text-muted-foreground">Encaissements</p>
              <p className="font-extrabold text-emerald-700">+{fmt(data?.cash?.receipts_deposits ?? 0)}</p>
            </div>
            <div className="rounded-lg bg-red-50/70 p-2.5">
              <p className="text-[11px] text-muted-foreground">Décaissements</p>
              <p className="font-extrabold text-red-500">−{fmt(data?.cash?.cash_out ?? 0)}</p>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-xs">
            {paymentRows.length === 0 && (
              <p className="text-[11px] text-muted-foreground">Aucun paiement enregistré.</p>
            )}
            {paymentRows.map((r) => (
              <div key={r.label}>
                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">{r.label}</span>
                  <span className="font-bold">{r.value}</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full", r.bar)} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Impayés */}
      <div className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold">Impayés et ancienneté des dépôts</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Solde total impayé et répartition par tranche d&apos;ancienneté</p>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold text-muted-foreground">
            Détail <ArrowUpRight className="size-3.5" />
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-[11px] text-muted-foreground">Solde total impayé</p>
            <p className="text-lg font-extrabold">{fmtMoney(data?.unpaid_aging?.total_amount ?? 0)}</p>
            <p className="text-[11px] text-muted-foreground">{fmt(data?.unpaid_aging?.total_count ?? 0)} dépôts en retard</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-[11px] text-muted-foreground">Dépôts en retard</p>
            <p className="text-lg font-extrabold">{fmt(data?.unpaid_aging?.total_count ?? 0)}</p>
            <p className="text-[11px] text-muted-foreground">{fmt(data?.unpaid_aging?.overdue_count ?? 0)} à traiter aujourd&apos;hui</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {buckets.map((t) => (
            <div key={t.tranche} className="rounded-xl bg-slate-50 p-4">
              <p className="text-[11px] text-muted-foreground">{t.tranche}</p>
              <p className="font-extrabold">{t.montant}</p>
              <p className="text-[11px] text-muted-foreground">{t.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activité + synchro */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold">Activité récente</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Transactions et mouvements · réseau en direct</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold text-muted-foreground">
              Toute l&apos;activité <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <div className="mt-4 divide-y divide-border">
            {(data?.recent_activity ?? []).length === 0 && (
              <p className="py-6 text-center text-[13px] text-muted-foreground">
                Aucune activité récente.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="text-sm font-bold">Synchronisation</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Continuité hors-ligne</p>

          <div className="mt-4 flex items-center gap-3 rounded-xl bg-stone-50 p-3 ring-1 ring-border/60">
            <span className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
              <AppIcon name="wallet" className="size-5 text-muted-foreground" />
            </span>
            <div>
              <p className={cn(
                "flex items-center gap-1.5 text-[13px] font-bold",
                data?.sync?.online ? "text-emerald-700" : "text-amber-700",
              )}>
                {data?.sync?.online ? "En ligne" : "Hors ligne"}{" "}
                <span className={cn("size-1.5 rounded-full", data?.sync?.online ? "bg-emerald-500" : "bg-amber-500")} />
              </p>
              <p className="text-[11px] text-muted-foreground">Dernière synchronisation à {syncTime}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs font-bold">Opérations en attente</p>
            <span className={cn(
              "inline-flex items-center gap-1 text-[11px] font-bold",
              (data?.sync?.pending_ops ?? 0) > 0 ? "text-amber-600" : "text-emerald-600",
            )}>
              <AppIcon name={(data?.sync?.pending_ops ?? 0) > 0 ? "alert" : "check-circle"} className="size-3.5" />
              {(data?.sync?.pending_ops ?? 0) > 0 ? `${data?.sync?.pending_ops} à envoyer` : "Tout est synchronisé"}
            </span>
          </div>

          <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
            Envoi automatique dès que la connexion est stable.
          </p>
          <Button variant="outline" size="lg" className="mt-2 w-full gap-1.5 text-xs font-bold sm:w-auto sm:px-4">
            <AppIcon name="refresh" className="size-3.5" />
            Synchroniser
          </Button>
        </div>
      </div>

      {/* Bandeau bas mobile : rappels */}
      <div className="flex items-center gap-2 rounded-xl border border-border bg-white p-3 text-xs text-muted-foreground xl:hidden">
        <AppIcon name="check-circle" className="size-4 text-emerald-600" />
        Données à jour · {data?.agencies?.length ?? 0} agences
        <span className="ml-auto inline-flex items-center gap-1 font-semibold text-foreground">
          <AppIcon name="eye" className="size-3.5" /> Réseau
        </span>
      </div>
    </div>
  );
}
