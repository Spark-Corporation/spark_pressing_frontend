"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  FileClock,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AUDIT_EVENTS, type AuditCategory, type AuditEvent } from "./data";

const PAGE_SIZE = 5;
type AuditTab = "Tous" | AuditCategory;

const statusClass: Record<AuditEvent["status"], string> = {
  Succès: "bg-emerald-50 text-emerald-700",
  Échec: "bg-red-50 text-red-700",
  "À vérifier": "bg-amber-50 text-amber-700",
};

const severityClass: Record<AuditEvent["severity"], string> = {
  Information: "bg-sky-50 text-sky-700",
  Attention: "bg-amber-50 text-amber-700",
  Critique: "bg-red-50 text-red-700",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function exportCsv(events: AuditEvent[]) {
  const headers = ["Identifiant", "Date", "Action", "Acteur", "Rôle", "Agence", "Ressource", "Statut", "Sévérité"];
  const rows = events.map((event) => [
    event.id,
    event.timestamp,
    event.action,
    event.actor,
    event.role,
    event.agency,
    event.resource,
    event.status,
    event.severity,
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(";"))
    .join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "journal-audit.csv";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof FileClock;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-semibold text-muted-foreground">{label}</p>
        <span className={`flex size-8 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-1 text-2xl font-extrabold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function LogSummary({
  title,
  description,
  events,
  icon: Icon,
}: {
  title: string;
  description: string;
  events: AuditEvent[];
  icon: typeof Printer;
}) {
  const latest = events[0];
  return (
    <section className="rounded-xl border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold">{title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">{latest?.action ?? "Aucun événement"}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {latest ? `${latest.agency} • ${formatDate(latest.timestamp)}` : "Aucune activité récente"}
          </p>
        </div>
        <Badge className={statusClass[latest?.status ?? "Succès"]}>{latest?.status ?? "À jour"}</Badge>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {events.length} {events.length === 1 ? "entrée" : "entrées"} dans cet aperçu
      </p>
    </section>
  );
}

export default function AuditPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<AuditTab>("Tous");
  const [agency, setAgency] = useState("Toutes les agences");
  const [status, setStatus] = useState("Tous les statuts");
  const [period, setPeriod] = useState("30 derniers jours");
  const [page, setPage] = useState(1);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setNow(Date.now()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr");
    const rangeDays = period === "7 derniers jours" ? 7 : 30;
    const nowDate = now === null ? null : new Date(now);
    const cutoff = nowDate === null
      ? null
      : period === "Aujourd’hui"
        ? new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()).getTime()
        : nowDate.getTime() - rangeDays * 24 * 60 * 60 * 1000;
    return AUDIT_EVENTS.filter((event) => {
      const searchable = `${event.id} ${event.action} ${event.actor} ${event.role} ${event.agency} ${event.resource} ${event.summary}`.toLocaleLowerCase("fr");
      if (query && !searchable.includes(query)) return false;
      if (tab !== "Tous" && event.category !== tab) return false;
      if (agency !== "Toutes les agences" && event.agency !== agency) return false;
      if (status !== "Tous les statuts" && event.status !== status) return false;
      if (cutoff !== null && new Date(event.timestamp).getTime() < cutoff) return false;
      return true;
    });
  }, [agency, now, period, search, status, tab]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleEvents = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const alerts = AUDIT_EVENTS.filter((event) => event.severity !== "Information").length;
  const printEvents = AUDIT_EVENTS.filter((event) => event.category === "Impression");
  const syncEvents = AUDIT_EVENTS.filter((event) => event.category === "Synchronisation");
  const agencies = Array.from(new Set(AUDIT_EVENTS.map((event) => event.agency)));

  const updateFilter = (callback: () => void) => {
    callback();
    setPage(1);
  };

  return (
    <div className="mx-auto space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Traçabilité du réseau</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-[28px]">Audit &amp; logs</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Consultez les actions sensibles, les impressions et les synchronisations des agences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 font-bold"
            onClick={() => exportCsv(filtered)}
            disabled={filtered.length === 0}
          >
            <ArrowDownToLine className="size-3.5" />
            Exporter CSV
          </Button>
          <Button
            size="lg"
            className="gap-1.5 font-bold"
            onClick={() => toast.success("Journal actualisé", { description: "Les données affichées sont à jour." })}
          >
            <RefreshCw className="size-3.5" />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-sky-900">
        <span className="font-bold">Aperçu de démonstration.</span> Les entrées affichées sont des exemples locaux ;
        elles ne proviennent pas encore d’une API d’audit.
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <MetricCard label="Événements suivis" value={String(AUDIT_EVENTS.length)} detail="dans cet aperçu" icon={FileClock} tone="bg-slate-100 text-slate-600" />
        <MetricCard label="À surveiller" value={String(alerts)} detail="attention ou critique" icon={AlertTriangle} tone="bg-amber-50 text-amber-600" />
        <MetricCard label="Actions réussies" value={String(AUDIT_EVENTS.filter((event) => event.status === "Succès").length)} detail="dans cet aperçu" icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" />
        <MetricCard label="Logs d’impression" value={String(printEvents.length)} detail="dernières entrées" icon={Printer} tone="bg-orange-50 text-orange-600" />
        <MetricCard label="Logs hors ligne" value={String(syncEvents.length)} detail="dernières entrées" icon={RefreshCw} tone="bg-sky-50 text-sky-600" />
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5">
          <div>
            <h2 className="text-sm font-bold">Journal de supervision</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Historique des actions et des événements du réseau.</p>
          </div>
          <Badge variant="outline" className="gap-1 border-red-200 bg-red-50 text-red-700">
            <CircleAlert className="size-3" />
            {alerts} alertes à examiner
          </Badge>
        </div>

        <div className="border-b border-border px-4 pt-2 sm:px-5">
          <Tabs value={tab} onValueChange={(value) => updateFilter(() => setTab(value as AuditTab))}>
            <TabsList className="h-8 flex-wrap justify-start gap-1 bg-transparent p-0">
              {(["Tous", "Opérations", "Paiements", "Paramétrage", "Impression", "Synchronisation"] as AuditTab[]).map((value) => (
                <TabsTrigger key={value} value={value} className="h-9 rounded-b-none px-3 text-xs">
                  {value === "Tous" ? "Tous les événements" : value}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 gap-2.5 bg-muted/20 p-3 sm:grid-cols-2 xl:grid-cols-[minmax(210px,1fr)_180px_170px_180px] sm:p-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => updateFilter(() => setSearch(event.target.value))}
              placeholder="Rechercher une action, un acteur, une référence…"
              className="h-9 bg-white pl-9 text-[13px]"
            />
          </div>
          <Select value={agency} onValueChange={(value) => updateFilter(() => setAgency(value ?? "Toutes les agences"))}>
            <SelectTrigger aria-label="Filtrer par agence" className="h-9 w-full bg-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Toutes les agences">Toutes les agences</SelectItem>
              {agencies.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(value) => updateFilter(() => setStatus(value ?? "Tous les statuts"))}>
            <SelectTrigger aria-label="Filtrer par statut" className="h-9 w-full bg-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Tous les statuts", "Succès", "À vérifier", "Échec"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={(value) => updateFilter(() => setPeriod(value ?? "30 derniers jours"))}>
            <SelectTrigger aria-label="Filtrer par période" className="h-9 w-full bg-white text-xs">
              <CalendarDays className="size-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Aujourd’hui", "7 derniers jours", "30 derniers jours"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:col-span-2 xl:col-span-4">
            <SlidersHorizontal className="size-3.5" />
            <span>Filtres appliqués à la période de l’aperçu</span>
            <span className="ml-auto">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-white hover:bg-white">
              <TableHead className="pl-4 text-[11px] font-bold uppercase tracking-wide text-muted-foreground sm:pl-5">Événement</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Acteur</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Agence / ressource</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Catégorie</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Statut</TableHead>
              <TableHead className="pr-4 text-right text-[11px] font-bold uppercase tracking-wide text-muted-foreground sm:pr-5">Détail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleEvents.map((event) => (
              <TableRow key={event.id} className="group">
                <TableCell className="max-w-[240px] pl-4 sm:pl-5">
                  <p className="truncate text-[13px] font-bold">{event.action}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{event.id} · {formatDate(event.timestamp)}</p>
                </TableCell>
                <TableCell className="max-w-[170px]">
                  <p className="truncate text-[13px] font-semibold">{event.actor}</p>
                  <p className="truncate text-xs text-muted-foreground">{event.role}</p>
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <p className="truncate text-xs font-semibold">{event.agency}</p>
                  <p className="truncate text-xs text-muted-foreground">{event.resource}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-border bg-muted/30 text-[11px] font-semibold">{event.category}</Badge>
                  {event.severity !== "Information" && (
                    <Badge className={`ml-1 text-[11px] ${severityClass[event.severity]}`}>{event.severity}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={`${statusClass[event.status]}`}>
                    <span className={`size-1.5 rounded-full ${event.status === "Succès" ? "bg-emerald-500" : event.status === "Échec" ? "bg-red-500" : "bg-amber-500"}`} />
                    {event.status}
                  </Badge>
                </TableCell>
                <TableCell className="pr-4 text-right sm:pr-5">
                  <Link
                    href={`/audit/${encodeURIComponent(event.id)}`}
                    aria-label={`Voir le détail de ${event.action}`}
                    className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1 text-xs" })}
                  >
                    Voir <ArrowRight className="size-3" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {visibleEvents.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                  Aucun événement ne correspond à ces filtres.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 sm:px-5">
          <p className="text-xs text-muted-foreground">
            {filtered.length === 0 ? "0 résultat" : `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} sur ${filtered.length} événements`}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="gap-1 text-xs" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              <ChevronLeft className="size-3.5" /> Précédent
            </Button>
            <span className="px-2 text-xs font-semibold">{currentPage} / {pageCount}</span>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>
              Suivant <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <LogSummary title="Logs d’impression" description="Tickets, reçus et retours des imprimantes." events={printEvents} icon={Printer} />
        <LogSummary title="Synchronisations hors ligne" description="Envois locaux, accusés serveur et rapprochements." events={syncEvents} icon={RefreshCw} />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-xs text-sky-900">
        <ShieldCheck className="size-4 shrink-0 text-sky-700" />
        <p className="flex-1">Les événements sont présentés en lecture seule. La politique de conservation et les paramètres de traçabilité se gèrent séparément.</p>
        <Link
          href="/parametres/audit"
          className={buttonVariants({ variant: "ghost", size: "sm", className: "gap-1 text-xs font-bold text-sky-800 hover:text-sky-900" })}
        >
          Politique d’audit <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}
