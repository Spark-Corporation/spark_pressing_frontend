"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  Clock,
  History,
  Phone,
  RefreshCw,
  Target,
  TriangleAlert,
  Wallet,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useGlobalData } from "@/contexts/GlobalContext";
import { useAuth } from "@/contexts/AuthContext";
import { getNetworkAgencyAction } from "@/actions/AdminAction";
import { handleApiAction } from "@/functions/handleResponseApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Agence } from "../data";
import type { NetworkAgencyDetailData } from "../types";

const fmt = (n: number | null | undefined) => new Intl.NumberFormat("fr-FR").format(n ?? 0);
const fmtMoney = (n: number | null | undefined) => `${fmt(n)} FCFA`;
const fmtPct = (n: number | null | undefined) =>
  `${(n ?? 0) > 0 ? "+" : ""}${(n ?? 0).toLocaleString("fr-FR")} %`;
const fmtShare = (n: number | null | undefined) =>
  (n ?? 0).toLocaleString("fr-FR", { maximumFractionDigits: 1 });

const DATE_LABEL = { day: "numeric", month: "short", year: "numeric" } as const;

const labelDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", DATE_LABEL);

const labelTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const RANK_SUFFIX = (rank: number | null | undefined) => {
  const units = ["1er", "2e", "3e", "4e", "5e", "6e", "7e", "8e", "9e", "10e"];
  const r = Math.max(1, Math.min(units.length, Math.round(rank ?? 0)));
  return units[r - 1];
};

const ROLE_LABELS: Record<string, string> = {
  manager: "Responsable agence",
  cashier: "Caissier",
  caissier: "Caissier",
  laveur: "Laveur",
  classeur: "Classeur",
};

const BATCH_STATUS: Record<string, string> = {
  completed: "Réussi",
  running: "En cours",
  failed: "Échoué",
};

export default function AgenceView({ agence, agencyId }: { agence: Agence; agencyId: number }) {
  const router = useRouter();
  const { updatePath } = useGlobalData();
  const { logout } = useAuth();
  const [data, setData] = useState<NetworkAgencyDetailData | null>(null);
  const [loading, setLoadingState] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDetail = useCallback(() => {
    void handleApiAction({
      action: getNetworkAgencyAction,
      params: { agency_id: agencyId },
      setLoading: setLoadingState,
      showErrorToast: false,
      logout,
      onSuccess: (res) => {
        setData(res as NetworkAgencyDetailData);
        setLoadError(null);
      },
      onError: setLoadError,
    });
  }, [agencyId, logout]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  /* -------------------------------- Dérivés -------------------------------- */

  const agy = data?.agency;
  const k = data?.kpis;
  const perfChart = data?.performance_chart;

  const perfBars = useMemo(() => {
    const series = perfChart?.series ?? [];
    const useCumulative = perfChart?.cumulative !== false;
    const valueOf = (s: { revenue: number; cumulative?: number }) =>
      useCumulative ? (s.cumulative ?? s.revenue) : s.revenue;
    const max = Math.max(1, ...series.map(valueOf));
    return series.map((s) => ({
      date: s.date,
      v: Math.max(2, Math.round((valueOf(s) / max) * 100)),
      raw: valueOf(s),
    }));
  }, [perfChart]);

  const barStep = perfBars.length > 10 ? Math.ceil(perfBars.length / 6) : 1;

  const kpiCards = useMemo(() => {
    if (!k) {
      return [
        { label: "Chiffre d'affaires", value: agence.ca, sub: `${agence.caDelta} • network_rank à venir`, icon: Banknote, iconBg: "bg-stone-100 text-stone-500" },
        { label: "Caisse aujourd'hui", value: agence.caisse, sub: "Écart 0 FCFA", icon: Wallet, iconBg: "bg-stone-100 text-stone-500" },
        { label: "Dépôts / retraits", value: `${agence.depots} / ${agence.retraits}`, sub: agence.tauxRetrait, subClass: "text-amber-600", icon: RefreshCw, iconBg: "bg-amber-50 text-amber-600" },
        { label: "Objectif mensuel", value: `${agence.objectif} %`, sub: agence.objectifReste, subClass: "text-sky-600", icon: Target, iconBg: "bg-sky-50 text-sky-600" },
      ];
    }
    return [
      {
        label: "Chiffre d'affaires",
        value: fmtMoney(k.revenue.value),
        sub: `${fmtPct(k.revenue.delta_percent)} • ${RANK_SUFFIX(k.revenue.network_rank)} du réseau`,
        icon: Banknote,
        iconBg: "bg-stone-100 text-stone-500",
      },
      {
        label: "Caisse aujourd'hui",
        value: fmtMoney(k.cash_today.value),
        sub: `Écart ${fmtMoney(k.cash_today.gap)} • caisse ${k.cash_today.session_status === "open" ? "ouverte" : "clôturée"}`,
        subClass: (k.cash_today.gap ?? 0) !== 0 ? "text-red-500" : undefined,
        icon: Wallet,
        iconBg: "bg-stone-100 text-stone-500",
      },
      {
        label: "Dépôts / retraits",
        value: `${fmt(k.deposits_retrievals.deposits)} / ${fmt(k.deposits_retrievals.retrieved)}`,
        sub: `Taux de retrait ${fmtShare(k.deposits_retrievals.retrieval_rate)} %`,
        subClass: "text-amber-600",
        icon: RefreshCw,
        iconBg: "bg-amber-50 text-amber-600",
      },
      {
        label: "Objectif mensuel",
        value: `${fmtShare(k.objective.percent)} %`,
        sub: `Il reste ${fmtMoney(k.objective.remaining)}`,
        subClass: (k.objective.percent ?? 0) >= 85 ? "text-emerald-600" : "text-sky-600",
        icon: Target,
        iconBg: "bg-sky-50 text-sky-600",
      },
    ];
  }, [k, agence]);

  const comparisonRows = useMemo<[string, string, string][]>(() => {
    if (data) {
      return data.network_comparison.map((c) => {
        const display =
          c.unit === "amount"
            ? fmtMoney(c.value)
            : c.unit === "percent"
              ? `${fmtShare(c.value)} %`
              : fmt(c.value);
        return [c.label, display, c.detail || ""];
      });
    }
    return [
      ["Chiffre d'affaires", agence.ca, agence.caDelta],
      ["Panier moyen", agence.panier, ""],
      ["Impayés", agence.impayesPct, ""],
      ["Retards atelier", agence.retardsPct, ""],
      ["Satisfaction", agence.satisfaction, ""],
    ];
  }, [data, agence]);

  const atelierTiles = useMemo(() => {
    const w = data?.workshop;
    if (!w) return { total: agence.atelierTotal, tiles: agence.atelier.map((s) => ({ label: s.label, value: s.value, sub: s.sub })) };
    return {
      total: `${fmt(w.orders)} commandes • ${fmt(w.pieces)} pièces en circulation`,
      tiles: w.columns.map((c) => ({
        label: c.label,
        value: c.deposits,
        sub: `${fmt(c.pieces)} pièces`,
      })),
    };
  }, [data, agence]);

  const du = data?.delays_unpaid;
  const delayRows = useMemo(() => {
    if (du)
      return {
        title: `${fmtMoney(du.to_recover.amount)} à recouvrer • ${fmt(du.to_recover.deposits)} dépôts`,
        tiles: [
          { label: "Retards atelier", bg: "bg-amber-50/60", ring: "ring-amber-100", labelCls: "text-amber-700", count: `${fmt(du.workshop_delays.deposits)} dépôts`, note: `${fmt(du.workshop_delays.over_24h)} dépôt(s) plus de 24 h` },
          { label: "Impayés à relancer", bg: "bg-red-50/60", ring: "ring-red-100", labelCls: "text-red-600", count: `${fmt(du.unpaid_followup.clients)} clients`, note: `${fmtMoney(du.unpaid_followup.amount)} depuis ${fmt(du.unpaid_followup.since_days)}+ jours` },
        ],
        rows: du.rows.map((r) => ({
          code: r.code,
          client: r.client,
          delay: r.delay,
          amount: fmtMoney(r.left_to_pay),
          leftToPay: r.left_to_pay,
        })),
      };
    return {
      title: `${agence.impayes} à recouvrer • 14 dépôts`,
      tiles: [
        { label: "Retards atelier", bg: "bg-amber-50/60", ring: "ring-amber-100", labelCls: "text-amber-700", count: `${agence.retards.length} dépôts`, note: agence.retardsNote },
        { label: "Impayés à relancer", bg: "bg-red-50/60", ring: "ring-red-100", labelCls: "text-red-600", count: agence.impayesClients, note: agence.impayesNote },
      ],
      rows: agence.retards.map((r) => ({
        code: r.code,
        client: r.client,
        delay: r.duree,
        amount: r.montant,
        leftToPay: 0,
      })),
    };
  }, [du, agence]);

  const teamModel = useMemo(() => {
    const t = data?.team;
    return {
      title: `${fmt(t?.members ?? agence.equipe.length)} membres • ${fmt(t?.present ?? 6)} présents`,
      members: t
        ? t.list.map((m, i) => ({
            initials: m.initials,
            nom: m.fullname,
            role: ROLE_LABELS[m.role] ?? m.role,
            statut: (m.status_label || (m.present ? "Présent" : "Pause")) as "Présent" | "Pause",
            bg: i % 3 === 0 ? "bg-primary text-white" : "bg-stone-200 text-stone-600",
          }))
        : agence.equipe,
    };
  }, [data, agence]);

  const historyModel = useMemo(() => {
    const h = data?.history;
    if (!h)
      return { rows: agence.historique.map((x) => ({ heure: x.heure, title: x.title, sub: x.sub, amount: null as number | null, type: "info" })) };
    return {
      rows: h.map((x) => ({
        heure: labelTime(x.at),
        title: x.title,
        sub: x.subtitle || "",
        amount: x.amount ?? null,
        type: x.amount_type as string,
      })),
    };
  }, [data, agence]);

  const syncModel = useMemo(() => {
    const s = data?.sync;
    return {
      online: s?.online ?? true,
      label: s?.status_label ?? "En ligne • synchronisée",
      lastSync: s?.last_sync_at ? `Dernière synchro à ${labelTime(s.last_sync_at)}` : "Dernière synchro à 10:42:08",
      rows: [
        ["Disponibilité 30 jours", s ? `${fmtShare(s.availability_percent)} %` : "99,8 %"],
        ["Opérations en attente", fmt(s?.pending_operations ?? 0)],
        ["Interruptions 30 jours", fmt(s?.interruptions_30d ?? 2)],
        ["Dernier lot", s ? (BATCH_STATUS[s.last_batch_status] ?? s.last_batch_status) : "Réussi"],
      ] as [string, string][],
    };
  }, [data]);

  const clientsData = data?.clients;

  /* --------------------------------- Rendu --------------------------------- */

  return (
    <div className="space-y-5">
      {loadError && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          <TriangleAlert className="size-4 shrink-0" />
          <p className="flex-1">{loadError}</p>
          <Button size="sm" variant="outline" className="text-[11px] font-bold" onClick={loadDetail}>
            Réessayer
          </Button>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-wrap items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Retour aux agences"
          onClick={() => router.back()}
          className="mt-1 bg-primary text-white hover:bg-primary/90 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">{agy?.name ?? agence.nom}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Agence {agy?.code ?? agence.code} • {agy?.address ?? agence.adresse} •{" "}
            {agy?.opening_hours?.label ?? "ouverte aujourd'hui de 08:00 à 19:00"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.success("Appel lancé", { description: `Agence ${agy?.name ?? agence.nom} • ${agy?.contact ?? "POS-01"}.` })}
          >
            <Phone className="size-3.5" />
            Contacter
          </Button>
          <Button
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.info("Gestion", { description: `Paramètres de l'agence ${agy?.name ?? agence.nom}.` })}
          >
            Gérer l&apos;agence
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

      {/* Perf + comparaison */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Performance financière</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {fmtMoney(perfChart?.total)} • progression cumulative
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs font-semibold text-muted-foreground"
              onClick={() => toast.info("Transactions", { description: `Journal de l'agence ${agy?.name ?? agence.nom}.` })}
            >
              Voir les transactions <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          {perfBars.length === 0 ? (
            <div className="mt-4 flex h-40 items-center justify-center text-xs text-muted-foreground">
              {loading ? "Chargement des données…" : loadError ? "Données indisponibles." : "Aucun encaissement sur la période."}
            </div>
          ) : (
            <>
              <div className="mt-4 flex h-40 items-end gap-1.5">
                {perfBars.map((b, i) => (
                  <div
                    key={b.date}
                    title={`${labelDate(b.date)} • ${fmtMoney(b.raw)}`}
                    className={cn("min-w-0 flex-1 rounded-sm", i === perfBars.length - 1 ? "bg-secondary" : "bg-emerald-500")}
                    style={{ height: `${b.v}%` }}
                  />
                ))}
              </div>
              <div className="mt-1 flex gap-1.5">
                {perfBars.map((b, i) => (
                  <span key={b.date} className="min-w-0 flex-1 text-center text-[10px] text-muted-foreground">
                    {i % barStep === 0 ? labelDate(b.date).split(/[\s\u202f]/).slice(-2).join(" ") : ""}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="text-sm font-bold">Comparaison au réseau</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Rang et écarts clés</p>
          <div className="mt-3 divide-y divide-border text-xs">
            {comparisonRows.map(([label, value, detail], i) => (
              <div key={label} className="py-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={cn("font-bold", label.includes("Retard") && "text-red-500")}>{value}</span>
                </div>
                {detail && i > 0 && <p className="text-[11px] text-muted-foreground">{detail}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Atelier + fidélité */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Activité atelier</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{atelierTiles.total}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs font-semibold text-muted-foreground"
              onClick={() => updatePath("/atelier")}
            >
              Ouvrir l&apos;atelier <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {atelierTiles.tiles.map((s, i) => (
              <div key={s.label} className={cn("rounded-xl p-3", i % 2 === 0 ? "bg-slate-100" : "bg-sky-50")}>
                <p className="text-lg font-extrabold">{s.value}</p>
                <p className="text-xs font-bold">{s.label}</p>
                <p className="text-[11px] text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs ring-1 ring-amber-100">
            <Clock className="size-4 shrink-0 text-amber-600" />
            <p className="flex-1 text-amber-900">
              <span className="font-bold">{fmt(data?.workshop.due_soon ?? 6)} commandes approchent leur délai promis</span>
              <span className="text-amber-700"> • {fmt(data?.workshop.late ?? 2)} retards à prioriser</span>
            </p>
            <Button variant="ghost" size="sm" className="h-auto p-0 text-[11px] font-bold text-amber-700" onClick={() => updatePath("/atelier")}>
              Traiter →
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="text-sm font-bold">Clients &amp; fidélité</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Portefeuille {agy?.name ?? agence.nom}</p>
          <div className="mt-3 divide-y divide-border text-xs">
            {[
              ["Clients actifs", fmt(clientsData?.active ?? agence.clientsActifs)],
              ["Membres fidélité", fmt(clientsData?.loyalty_members ?? agence.membresFidelite)],
              ["Points attribués", clientsData ? fmt(clientsData.points_this_month) : agence.points],
              ["Nouveaux VIP (7 j)", clientsData ? fmt(clientsData.new_vip_7d) : agence.nouveauxVip],
              ["Nouveaux ce mois", fmt(clientsData?.new_this_month ?? 0)],
            ].map(([label, v]) => (
              <div key={label} className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-bold">{v}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {fmtShare(clientsData?.members_percent ?? Number(agence.fidelitePct.replace(",", ".").replace(/[^\d.]/g, "")))} % du portefeuille
          </p>
          <DistributionBar distribution={clientsData?.distribution} fallback={agence.repartition} />
        </div>
      </div>

      {/* Retards + équipe */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Retards &amp; impayés</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{delayRows.title}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs font-semibold text-muted-foreground"
              onClick={() => toast.success("Plan de relance", { description: "SMS + appels programmés sur 7 jours." })}
            >
              Plan de relance <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {delayRows.tiles.map((t) => (
              <div key={t.label} className={cn("rounded-xl p-3 ring-1", t.bg, t.ring)}>
                <p className={cn("text-[11px] font-bold", t.labelCls)}>{t.label}</p>
                <p className="text-lg font-extrabold">{t.count}</p>
                <p className="text-[11px] text-muted-foreground">{t.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 divide-y divide-border">
            {delayRows.rows.length === 0 && (
              <p className="py-2 text-xs text-muted-foreground">{loading ? "Chargement des données…" : "Aucun retard à signaler ✔"}</p>
            )}
            {delayRows.rows.map((r) => (
              <div key={r.code} className="flex items-center gap-2 py-2 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{r.code}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{r.client}</p>
                </div>
                <Badge variant="outline" className="shrink-0 border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700">
                  {r.delay}
                </Badge>
                <span className={cn("w-24 shrink-0 text-right font-bold", r.leftToPay > 0 ? "" : "text-emerald-600")}>{r.amount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Équipe</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{teamModel.title}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs font-semibold text-muted-foreground"
              onClick={() => toast.info("Planning", { description: `Semaine de l'équipe ${agy?.name ?? agence.nom}.` })}
            >
              Planning <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <div className="mt-3 space-y-2.5">
            {teamModel.members.map((m, i) => (
              <div key={`${m.nom}-${i}`} className="flex items-center gap-2.5">
                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold", m.bg)}>
                  {m.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">{m.nom}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{m.role}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 border-0 text-[10px] font-bold",
                    m.statut === "Présent" ? "bg-muted text-foreground" : "bg-amber-100 text-amber-700",
                  )}
                >
                  {m.statut}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historique + synchro */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Historique récent</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Activité de gestion et événements majeurs</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs font-semibold text-muted-foreground"
              onClick={() => toast.info("Historique", { description: `Journal complet de ${agy?.name ?? agence.nom}.` })}
            >
              Tout l&apos;historique <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <div className="mt-3">
            {historyModel.rows.length === 0 && (
              <p className="text-xs text-muted-foreground">{loading ? "Chargement des données…" : "Aucun événement récent."}</p>
            )}
            {historyModel.rows.map((h, i) => (
              <div key={`${h.heure}-${i}`} className="relative flex gap-2.5 pb-3 last:pb-0">
                {i < historyModel.rows.length - 1 && <span className="absolute top-4 left-[3px] h-[calc(100%-0.75rem)] w-px bg-border" />}
                <span className="z-10 mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                <p className="w-12 shrink-0 text-[11px] text-muted-foreground">{h.heure}</p>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold">{h.title}</p>
                  {h.sub && <p className="text-[11px] text-muted-foreground">{h.sub}</p>}
                </div>
                {h.amount !== null && h.amount !== undefined && (
                  <span className={cn("shrink-0 text-[11px] font-bold", h.type === "debit" ? "text-red-500" : "text-emerald-600")}>
                    {h.type === "debit" ? "−" : "+"}{fmtMoney(h.amount)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="text-sm font-bold">Synchronisation</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Continuité de service</p>
          <div
            className={cn(
              "mt-3 flex items-center gap-2 rounded-lg p-2.5 ring-1",
              syncModel.online ? "bg-emerald-50/60 ring-emerald-100" : "bg-red-50/60 ring-red-100",
            )}
          >
            <Wifi className={cn("size-4 shrink-0", syncModel.online ? "text-emerald-600" : "text-red-500")} />
            <div className="min-w-0 flex-1 text-[11px]">
              <p className={cn("font-bold", syncModel.online ? "text-emerald-800" : "text-red-700")}>{syncModel.label}</p>
              <p className={syncModel.online ? "text-emerald-700" : "text-red-600"}>{syncModel.lastSync}</p>
            </div>
            <History className="size-3.5 shrink-0 text-muted-foreground" />
          </div>
          <div className="mt-3 space-y-1.5 text-xs">
            {syncModel.rows.map(([label, v]) => (
              <p key={label} className="flex justify-between">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-bold">{v}</span>
              </p>
            ))}
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0" />
            Horaires {(agy?.opening_hours?.opens_at ?? "08:00")} → {(agy?.opening_hours?.closes_at ?? "19:00")}
          </p>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Répartition fidélité --------------------------- */

const DISTRIBUTION_STYLES = ["bg-slate-300", "bg-emerald-500", "bg-secondary", "bg-sky-500", "bg-violet-500"];

function DistributionBar({
  distribution,
  fallback,
}: {
  distribution?: { code: string; label: string; count: number }[];
  fallback: [number, number, number];
}) {
  const segments = useMemo(() => {
    if (distribution && distribution.length > 0) {
      const total = distribution.reduce((sum, d) => sum + (d.count ?? 0), 0) || 1;
      return distribution.map((d, i) => ({
        label: d.label,
        percent: Math.round(((d.count ?? 0) / total) * 100),
        cls: DISTRIBUTION_STYLES[i % DISTRIBUTION_STYLES.length],
      }));
    }
    return fallback.map((percent, i) => ({
      label: "",
      percent,
      cls: DISTRIBUTION_STYLES[i % DISTRIBUTION_STYLES.length],
    }));
  }, [distribution, fallback]);

  return (
    <div title={segments.map((s) => `${s.label ? `${s.label} • ` : ""}${s.percent} %`).join(" • ")} className="mt-1 flex h-1.5 overflow-hidden rounded-full">
      {segments.map((s, i) => (
        <div key={i} className={s.cls} style={{ width: `${s.percent}%` }} />
      ))}
    </div>
  );
}
