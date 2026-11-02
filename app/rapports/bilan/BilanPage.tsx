"use client";

import { io } from "next/cache";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { downloadBase64 } from "../data";
import { exportReportsAction, getReportsDailyAction } from "@/actions/AdminAction";
import { handleApiAction } from "@/functions/handleResponseApi";
import type { DailyReportData, ReportsExportFile } from "../types";

const PAGE_SIZE = 4;
const AVATAR_BGS = [
  "bg-amber-100 text-amber-700",
  "bg-slate-200 text-slate-600",
  "bg-stone-200 text-stone-600",
  "bg-orange-100 text-orange-700",
  "bg-emerald-100 text-emerald-700",
  "bg-primary text-white",
];

const fmt = (n: number | null | undefined) => new Intl.NumberFormat("fr-FR").format(n ?? 0);
const fmtMoney = (n: number | null | undefined) => `${fmt(n)} FCFA`;
const fmtPct = (n: number | null | undefined) =>
  `${(n ?? 0) > 0 ? "+" : ""}${(n ?? 0).toLocaleString("fr-FR")} %`;
const fmtM = (n: number | null | undefined) =>
  `${((n ?? 0) / 1_000_000).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} M`;
const fmtBar = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1).replace(".", ",")}M` : `${Math.round(v / 1000)}k`;
const fmtSigned = (n: number | null | undefined, suffix: string = "") => {
  const v = n ?? 0;
  return `${v > 0 ? "+" : v < 0 ? "−" : ""}${fmt(Math.abs(v))}${suffix}`;
};

function initials(fullname: string) {
  return (
    fullname
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "—"
  );
}

export default function BilanPage() {
  use(io());

  const router = useRouter();
  const [data, setData] = useState<DailyReportData | null>(null);
  const [loading, setLoadingState] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const [date, setDate] = useState(today);
  const [agency, setAgency] = useState("Cocody Angré");
  const [session, setSession] = useState("all");
  const [periode, setPeriode] = useState("jour");
  const [page, setPage] = useState(1);

  const loadBilan = useCallback(() => {
    void handleApiAction({
      action: getReportsDailyAction,
      params: { date: date },
      setLoading: setLoadingState,
      showErrorToast: false,
      onSuccess: (res) => {
        setData(res as DailyReportData);
        setLoadError(null);
        setPage(1);
      },
      onError: setLoadError,
    });
  }, [date]);

  useEffect(() => {
    loadBilan();
  }, [loadBilan]);

  const handleExport = useCallback(
    (format: "csv" | "pdf") => {
      if (format === "csv" && !data?.exports.csv) {
        toast.error("Export CSV", { description: "Export indisponible pour ce bilan." });
        return;
      }
      if (format === "pdf" && !data?.exports.pdf) {
        toast.error("Export PDF", { description: "Export indisponible pour ce bilan." });
        return;
      }
      void handleApiAction({
        action: (p?: { format: "csv" | "pdf" }) =>
          exportReportsAction("/reports/daily", p?.format ?? format, { date: date }),
        params: { format },
        setLoading: setExporting,
        showToast: false,
        onSuccess: (res: ReportsExportFile) => {
          downloadBase64(res.base64, res.mime, res.filename);
          toast.success("Export téléchargé", {
            description: `Le bilan au format ${format.toUpperCase()} est prêt.`,
          });
        },
      });
    },
    [date, data],
  );

  const dateLabel = useMemo(
    () =>
      data
        ? new Date(`${data.date}T12:00:00`).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : date,
    [data, date],
  );
  const comparedLabel = useMemo(() => {
    if (!data?.kpis.receipts.compared_to) return "";
    return new Date(`${data.kpis.receipts.compared_to}T12:00:00`).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  }, [data]);

  const bars = useMemo(() => {
    const series = data?.receipts_chart.series ?? [];
    const amounts = series.map((s) => s.amount ?? 0);
    const max = Math.max(1, ...amounts);
    return series.map((s) => ({
      h: s.hour,
      label: fmtBar(s.amount ?? 0),
      v: Math.max(2, Math.round(((s.amount ?? 0) / max) * 100)),
    }));
  }, [data]);

  const rows = useMemo(() => {
    const list = data?.cashiers ?? [];
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return {
      totalPages,
      slice: list.slice(start, start + PAGE_SIZE),
      total: list.length,
      start: list.length > 0 ? start + 1 : 0,
      end: Math.min(start + PAGE_SIZE, list.length),
    };
  }, [data, page]);

  const ecartBadge = (gap: number | null) => {
    const v = gap ?? 0;
    return {
      label: fmtSigned(v, " FCFA"),
      cls: v === 0 ? "bg-emerald-50 text-emerald-700" : v > 0 ? "bg-amber-100 text-amber-700" : "bg-red-50 text-red-500",
    };
  };

  const kpis = useMemo(() => {
    if (!data) {
      const value = loading ? "Chargement…" : "—";
      const sub = loadError ? "Données indisponibles" : " ";
      return [
        { label: "Recettes encaissées", value, sub },
        { label: "Ventes soldées", value, sub },
        { label: "Impayés ouverts", value, sub },
        { label: "Écart de caisse", value, sub },
      ];
    }
    const k = data.kpis;
    return [
      {
        label: "Recettes encaissées",
        value: fmtMoney(k.receipts.value),
        sub: `${fmtPct(k.receipts.delta_percent)} vs session du ${comparedLabel}`,
      },
      {
        label: "Ventes soldées",
        value: fmt(k.settled_sales.value),
        sub: `${k.settled_sales.share_percent.toLocaleString("fr-FR")} % des dépôts`,
      },
      {
        label: "Impayés ouverts",
        value: fmtMoney(k.open_unpaid.value),
        sub: `${k.open_unpaid.deposits} dépôts`,
      },
      {
        label: "Écart de caisse",
        value: fmtSigned(k.cash_gap.value, " FCFA"),
        sub: `Seuil ±${fmt(k.cash_gap.tolerance)} • ${k.cash_gap.within_tolerance ? "dans le seuil" : "hors seuil"}`,
      },
    ];
  }, [data, loading, loadError, comparedLabel]);

  const reconciliationBox = useMemo(() => {
    if (!data) return { tone: "bg-amber-50 text-amber-700 ring-amber-100", label: "" };
    const r = data.reconciliation;
    return {
      tone: r.within_tolerance
        ? "bg-amber-50 text-amber-700 ring-amber-100"
        : "bg-red-50 text-red-600 ring-red-100",
      label: `${r?.within_tolerance ? "Dans le seuil" : "Hors seuil"} : ${r?.comment?.toLowerCase()}`,
    };
  }, [data]);

  return (
    <div className="space-y-5">
      {loadError && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          <AlertTriangle className="size-4 shrink-0" />
          <p className="flex-1">{loadError}</p>
          <Button size="sm" variant="outline" className="text-[11px] font-bold" onClick={loadBilan}>
            Réessayer
          </Button>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-wrap items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Retour aux rapports"
          onClick={() => router.back()}
          className="mt-1 bg-primary text-white hover:bg-primary/90 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Bilan journalier et performance caissiers</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {dateLabel}
            {data?.agency ? ` • Agence d'opération : ${data.agency}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            disabled={exporting || !data?.exports.csv}
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => handleExport("csv")}
          >
            <FileSpreadsheet className="size-3.5" />
            Excel
          </Button>
          <Button
            size="lg"
            disabled={exporting || !data?.exports.pdf}
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => handleExport("pdf")}
          >
            <FileText className="size-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-white p-3">
        <div className="min-w-40 flex-1">
          <p className="mb-1 text-[10px] font-bold text-muted-foreground">Date</p>
          <Input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value || date)}
            className="h-9 text-xs"
          />
        </div>
        <div className="min-w-40 flex-1">
          <p className="mb-1 text-[10px] font-bold text-muted-foreground">Agence</p>
          <Select value={agency} onValueChange={(v) => setAgency(v ?? agency)}>
            <SelectTrigger className="w-full text-xs data-[size=default]:h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(data?.agency ? [data.agency, "Bingerville", "Plateau", "Marcory"] : ["Cocody Angré", "Bingerville", "Plateau", "Marcory"])
                .filter((a, i, arr) => arr.indexOf(a) === i)
                .map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-40 flex-1">
          <p className="mb-1 text-[10px] font-bold text-muted-foreground">Session</p>
          <Select value={session} onValueChange={(v) => setSession(v ?? "all")}>
            <SelectTrigger className="w-full text-xs data-[size=default]:h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sessions</SelectItem>
              <SelectItem value="matin">Matin • 08:00–13:00</SelectItem>
              <SelectItem value="soir">Soir • 13:00–18:30</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="mt-5 gap-1.5 px-3 text-xs font-bold"
          onClick={loadBilan}
          disabled={loading}
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          Actualiser
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-white p-4">
            <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
            <p className="mt-2 text-xl font-extrabold tracking-tight">{k.value}</p>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {/* Recettes par moyen */}
          <div className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Recettes par moyen de paiement</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Encaissements confirmés</p>
              </div>
              <Badge variant="outline" className="border-0 bg-amber-100 text-[10px] font-bold text-amber-700">
                {fmtM(data?.receipts_chart.total)}
              </Badge>
            </div>
            {bars.length === 0 ? (
              <div className="mt-3 flex h-36 items-center justify-center text-xs text-muted-foreground">
                {loading ? "Chargement des données…" : "Aucun encaissement sur la période."}
              </div>
            ) : (
              <>
                <div className="mt-3 flex h-36 items-end gap-1.5">
                  {bars.map((b, i) => (
                    <div key={i} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1 self-stretch">
                      <span className="text-[10px] font-bold text-muted-foreground">{b.label}</span>
                      <div
                        className={cn("w-full rounded-sm", i === bars.length - 1 ? "bg-secondary" : "bg-emerald-500/25")}
                        style={{ height: `${b.v}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-1 flex gap-1.5">
                  {bars.map((b, i) => (
                    <span key={i} className="min-w-0 flex-1 text-center text-[10px] text-muted-foreground">
                      {b.h}
                    </span>
                  ))}
                </div>
              </>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(data?.receipts_chart.methods ?? []).map((m) => (
                <div key={m.code} className="rounded-lg bg-muted/50 p-2.5 text-center">
                  <p className="text-[11px] text-muted-foreground">{m.label}</p>
                  <p className="text-xs font-extrabold">{fmt(m.amount)}</p>
                </div>
              ))}
              {!loading && (data?.receipts_chart.methods.length ?? 0) === 0 && (
                <p className="col-span-2 text-center text-xs text-muted-foreground sm:col-span-4">
                  Aucun moyen de paiement encaissé.
                </p>
              )}
            </div>
          </div>

          {/* Soldes + remises */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-white p-4">
              <h2 className="text-[13px] font-bold">Soldes &amp; impayés</h2>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p className="text-xl font-extrabold">{fmt(data?.settlement.settled)}</p>
                  <p className="text-[11px] text-emerald-600">
                    Soldés • {(data?.settlement.settled_percent ?? 0).toLocaleString("fr-FR")}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-red-500">{fmt(data?.settlement.unpaid)}</p>
                  <p className="text-[11px] text-red-500">{fmtMoney(data?.settlement.unpaid_amount)}</p>
                </div>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(100, data?.settlement.settled_percent ?? 0)}%` }}
                />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-white p-4">
              <h2 className="text-[13px] font-bold">Remises accordées</h2>
              <p className="mt-1 text-xs font-semibold">
                {fmt(data?.discounts.count)} remises • {fmtMoney(data?.discounts.amount)} •{" "}
                {(data?.discounts.share_of_revenue ?? 0).toLocaleString("fr-FR")}% du CA
              </p>
              <p className="mt-2 rounded-lg bg-sky-50 p-2 text-[11px] text-sky-800 ring-1 ring-sky-100">
                <span className="font-bold">{fmt(data?.discounts.sensitive.count)} remises sensibles</span>
                <br />
                Supérieures à {(data?.discounts.sensitive.threshold_percent ?? 0).toLocaleString("fr-FR")}%, validation
                manager.
              </p>
            </div>
          </div>

          {/* Caissiers */}
          <div className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Performance des caissiers</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Tickets, ventes, panier, productivité</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-[11px] font-bold"
                onClick={() => toast.info("Comparaison", { description: "Performance vs mois précédent." })}
              >
                Comparer avec le mois précédent
              </Button>
            </div>
            <div className="mt-3">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">CAISSIER / SESSION</TableHead>
                    <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">RECETTES</TableHead>
                    <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">VENTES</TableHead>
                    <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PANIER</TableHead>
                    <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PRODUCTIVITÉ</TableHead>
                    <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">ÉCART</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-xs text-muted-foreground">
                        {loading ? "Chargement des données…" : "Aucune session de caisse sur la période."}
                      </TableCell>
                    </TableRow>
                  )}
                  {rows.slice.map((c, i) => {
                    const ecart = ecartBadge(c.gap);
                    const sessionAt = c.session.at
                      ? ` • ${new Date(c.session.at).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`
                      : "";
                    return (
                      <TableRow key={c.user_id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", AVATAR_BGS[i % AVATAR_BGS.length])}>
                              {initials(c.fullname)}
                            </span>
                            <span>
                              <span className="block text-xs font-bold">{c.fullname}</span>
                              <span className="block text-[11px] text-muted-foreground">
                                {c.session.status}
                                {sessionAt}
                              </span>
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-bold">{fmtMoney(c.receipts)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{fmt(c.sales)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{fmtMoney(c.average_basket)}</TableCell>
                        <TableCell>
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${Math.min(100, c.productivity_percent)}%` }}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("border-0 text-[10px] font-bold", ecart.cls)}>
                            {ecart.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-muted-foreground">
                {rows.total > 0 ? `${rows.start}–${rows.end} sur ${rows.total} résultats` : "0 résultat"}
              </p>
              {rows.totalPages > 1 && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: rows.totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="icon-sm"
                      onClick={() => setPage(p)}
                      className="text-[11px] font-bold"
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Latéral */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Mouvements hors dépôt</h2>
            <div className="mt-2 space-y-1.5 text-xs">
              {(data?.non_deposit_movements ?? []).map((m) => (
                <p key={m.label} className="flex justify-between">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className={cn("font-bold", m.amount < 0 && "text-red-500")}>{fmtSigned(m.amount)}</span>
                </p>
              ))}
              {!loading && (data?.non_deposit_movements.length ?? 0) === 0 && (
                <p className="text-muted-foreground">Aucun mouvement hors dépôt.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Rapprochement caisse</h2>
            <div className="mt-2 space-y-1.5 text-xs">
              <p className="flex justify-between"><span className="text-muted-foreground">Solde théorique</span><span className="font-bold">{fmt(data?.reconciliation.theoretical)}</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Comptage déclaré</span><span className="font-bold">{fmt(data?.reconciliation.counted)}</span></p>
            </div>
            <p className={cn("mt-2 flex items-start gap-1.5 rounded-lg p-2 text-[11px] font-bold ring-1", reconciliationBox.tone)}>
              <Check className="mt-0.5 size-3.5 shrink-0" />
              <span>
                Écart : {fmtSigned(data?.reconciliation.difference, " FCFA")}
                {reconciliationBox.label && (
                  <span className="block font-normal">{reconciliationBox.label}</span>
                )}
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="size-4 shrink-0 text-emerald-600" />
              <p>Bilan du {dateLabel}{data?.agency ? ` • ${data.agency}` : ""}</p>
            </div>
            <div className="mt-3">
              <p className="mb-1 text-[10px] font-bold text-muted-foreground">Résultats :</p>
              <Tabs value={periode} onValueChange={(v) => setPeriode(v)}>
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
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full gap-1.5 text-xs font-bold"
              onClick={() => handleExport("csv")}
              disabled={exporting || !data?.exports.csv}
            >
              <Download className="size-3.5" />
              Exporter le bilan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
