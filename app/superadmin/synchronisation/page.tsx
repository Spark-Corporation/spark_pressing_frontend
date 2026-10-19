"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Search,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
const PAGE_SIZE = 6;
type Etat = "tous" | "ok" | "retard" | "echec" | "hors_ligne";

interface SyncRow {
  id: number;
  pressing: string;
  city: string;
  lastSync: string;
  latency: string;
  queue: number;
  successRate: string;
  status: "Synchronisé" | "Retard" | "Échec" | "Hors ligne";
}

const SYNC_ROWS: SyncRow[] = [
  { id: 1, pressing: "Éclat Royal", city: "Cameroun", lastSync: "Il y a 2 min", latency: "84 ms", queue: 0, successRate: "100 %", status: "Synchronisé" },
  { id: 2, pressing: "Blanc Premium", city: "Sénégal", lastSync: "Il y a 35 sec", latency: "92 ms", queue: 0, successRate: "100 %", status: "Synchronisé" },
  { id: 3, pressing: "Net Plus Dakar", city: "Sénégal", lastSync: "Il y a 18 min", latency: "12 s", queue: 23, successRate: "94 %", status: "Retard" },
  { id: 4, pressing: "Orchid Clean", city: "Cameroun", lastSync: "Il y a 4 min", latency: "78 ms", queue: 2, successRate: "99 %", status: "Synchronisé" },
  { id: 5, pressing: "Luxe Press", city: "Bénin", lastSync: "Hors ligne 3 h", latency: "—", queue: 118, successRate: "0 %", status: "Hors ligne" },
  { id: 6, pressing: "Kora Cleaning", city: "Mali", lastSync: "Il y a 7 min", latency: "1,2 s", queue: 5, successRate: "97 %", status: "Synchronisé" },
];

const statusStyle: Record<SyncRow["status"], { dot: string; text: string; bg: string }> = {
  Synchronisé: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50 text-emerald-700" },
  Retard: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50 text-amber-700" },
  "Échec": { dot: "bg-red-500", text: "text-red-600", bg: "bg-red-50 text-red-600" },
  "Hors ligne": { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50 text-amber-700" },
};

const kpis = [
  { label: "Disponibilité", value: "99,94 %", sub: "sur les 30 derniers jours", subColor: "text-emerald-600", iconBg: "bg-emerald-50 text-emerald-600" },
  { label: "Latence médiane", value: "84 ms", sub: "objectif < 200 ms", subColor: "text-muted-foreground", iconBg: "bg-muted/50 text-muted-foreground" },
  { label: "Files d&apos;attente", value: "148", sub: "3 pressings avec backlog", subColor: "text-amber-600", iconBg: "bg-amber-50 text-amber-600" },
  { label: "Hors ligne", value: "1", sub: "Luxe Press depuis 3 h", subColor: "text-red-500", iconBg: "bg-red-50 text-red-500" },
];

export default function SuperAdminSynchronisationPage() {
  const [search, setSearch] = useState("");
  const [etat, setEtat] = useState<Etat>("tous");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SYNC_ROWS.filter((r) => {
      if (etat === "ok" && r.status !== "Synchronisé") return false;
      if (etat === "retard" && r.status !== "Retard") return false;
      if (etat === "echec" && r.status !== "Échec") return false;
      if (etat === "hors_ligne" && r.status !== "Hors ligne") return false;
      if (q && !`${r.pressing} ${r.city}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, etat]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">Superadministration</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Synchronisation</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Surveillez l&apos;état de synchronisation de tous les pressings hébergés.
          </p>
        </div>
        <Button size="lg" className="gap-1.5 px-3 text-xs font-bold">
          <RefreshCw className="size-4" />
          Forcer une resynchronisation
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
              <span className={cn("flex size-8 items-center justify-center rounded-lg", k.iconBg)}>
                <Zap className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold">{k.value}</p>
            <p className={cn("mt-1 text-[11px] font-medium", k.subColor)}>{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un pressing…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-9 bg-muted/40 pl-9 text-[13px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">État :</span>
            <Tabs value={etat} onValueChange={(v) => { setEtat(v as Etat); setPage(1); }}>
              <TabsList className="h-7">
                <TabsTrigger value="tous" className="px-3 text-[11px]">Tous</TabsTrigger>
                <TabsTrigger value="ok" className="px-3 text-[11px]">OK</TabsTrigger>
                <TabsTrigger value="retard" className="px-3 text-[11px]">Retard</TabsTrigger>
                <TabsTrigger value="echec" className="px-3 text-[11px]">Échec</TabsTrigger>
                <TabsTrigger value="hors_ligne" className="px-3 text-[11px]">Hors ligne</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
            <Download className="size-3.5" />
            Exporter
          </Button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PRESSING</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PAYS</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">DERNIÈRE SYNC</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">LATENCE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">FILE D&apos;ATTENTE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">TAUX RÉUSSITE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">ÉTAT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-[13px] font-semibold">{r.pressing}</TableCell>
                  <TableCell className="text-xs">{r.city}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.lastSync}</TableCell>
                  <TableCell className="text-xs">{r.latency}</TableCell>
                  <TableCell className="text-xs font-semibold">{r.queue}</TableCell>
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-2">
                      <Progress value={parseInt(r.successRate)} className="h-1 w-16 bg-[#94a3b8]" />
                      <span className="text-[11px]">{r.successRate}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("gap-1 border-0 text-[10px] font-semibold", statusStyle[r.status].bg)}>
                      <span className={cn("size-1.5 rounded-full", statusStyle[r.status].dot)} />
                      {r.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="py-10 text-center text-[13px] text-muted-foreground">
                    Aucun pressing ne correspond à ces critères.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            {filtered.length === 0 ? "0" : `${start + 1}–${start + rows.length}`} sur {filtered.length} pressings
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs font-semibold"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
              Précédent
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === safePage ? "default" : "ghost"}
                size="icon-sm"
                onClick={() => setPage(p)}
                className="text-[11px] font-bold"
              >
                {p}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs font-semibold"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Suivant
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
