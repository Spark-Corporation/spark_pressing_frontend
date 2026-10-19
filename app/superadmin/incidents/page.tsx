"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 6;
type Statut = "tous" | "ouverts" | "en_cours" | "resolus";

interface Incident {
  id: number;
  ref: string;
  title: string;
  pressing: string;
  priority: "P1" | "P2" | "P3";
  category: string;
  opened: string;
  resolved?: string;
  duration: string;
  impact: string;
  status: "Ouvert" | "En cours" | "Résolu";
}

const INCIDENTS: Incident[] = [
  { id: 1, ref: "INC-2401", title: "Sync indisponible depuis 3 h", pressing: "Luxe Press", priority: "P1", category: "Synchronisation", opened: "28 sept. 07:12", duration: "3 h 14 min", impact: "12 commandes en attente", status: "En cours" },
  { id: 2, ref: "INC-2402", title: "Latence supérieure à 12 s", pressing: "Net Plus Dakar", priority: "P2", category: "Performance", opened: "28 sept. 09:45", duration: "45 min", impact: "Ralentissement caisse", status: "Ouvert" },
  { id: 3, ref: "INC-2403", title: "Échec sur 2 imprimantes", pressing: "Orchid Clean", priority: "P3", category: "Impression", opened: "28 sept. 11:20", duration: "2 h 05 min", impact: "Reçus non imprimés", status: "Ouvert" },
  { id: 4, ref: "INC-2398", title: "Certificat TLS expiré", pressing: "Éclat Royal", priority: "P1", category: "Sécurité", opened: "27 sept. 18:02", resolved: "27 sept. 19:30", duration: "1 h 28 min", impact: "Blocage HTTPS", status: "Résolu" },
  { id: 5, ref: "INC-2399", title: "Échec paiement mobile money", pressing: "Blanc Premium", priority: "P2", category: "Paiement", opened: "27 sept. 21:14", resolved: "27 sept. 22:05", duration: "51 min", impact: "18 paiements échoués", status: "Résolu" },
  { id: 6, ref: "INC-2400", title: "Backup nocturne incomplet", pressing: "Kora Cleaning", priority: "P2", category: "Infrastructure", opened: "26 sept. 02:00", resolved: "26 sept. 04:30", duration: "2 h 30 min", impact: "Backup partiel", status: "Résolu" },
];

const priorityStyle: Record<Incident["priority"], string> = {
  P1: "bg-red-50 text-red-600",
  P2: "bg-amber-50 text-amber-600",
  P3: "bg-blue-50 text-blue-600",
};

const statusStyle: Record<Incident["status"], { dot: string; bg: string }> = {
  Ouvert: { dot: "bg-red-500", bg: "bg-red-50 text-red-600" },
  "En cours": { dot: "bg-amber-500", bg: "bg-amber-50 text-amber-700" },
  Résolu: { dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700" },
};

const kpis = [
  { label: "Incidents ouverts", value: "4", sub: "1 priorité élevée", subColor: "text-red-500", iconBg: "bg-red-50 text-red-500" },
  { label: "En cours de traitement", value: "2", sub: "SLA respecté à 92 %", subColor: "text-amber-600", iconBg: "bg-amber-50 text-amber-600" },
  { label: "Résolus (30 j)", value: "38", sub: "temps moyen 1 h 42", subColor: "text-emerald-600", iconBg: "bg-emerald-50 text-emerald-600" },
  { label: "Disponibilité", value: "99,94 %", sub: "sur les 30 derniers jours", subColor: "text-muted-foreground", iconBg: "bg-muted/50 text-muted-foreground" },
];

export default function SuperAdminIncidentsPage() {
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState<Statut>("tous");
  const [priorite, setPriorite] = useState("tous");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return INCIDENTS.filter((i) => {
      if (statut === "ouverts" && i.status !== "Ouvert") return false;
      if (statut === "en_cours" && i.status !== "En cours") return false;
      if (statut === "resolus" && i.status !== "Résolu") return false;
      if (priorite !== "tous" && i.priority !== priorite) return false;
      if (q && !`${i.ref} ${i.title} ${i.pressing} ${i.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, statut, priorite]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">Superadministration</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Incidents</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Suivez les incidents techniques signalés par les pressings hébergés.
          </p>
        </div>
        <Button size="lg" className="gap-1.5 px-3 text-xs font-bold">
          <AlertCircle className="size-4" />
          Déclarer un incident
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
              <span className={cn("flex size-8 items-center justify-center rounded-lg", k.iconBg)}>
                <AlertCircle className="size-4" />
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
              placeholder="Rechercher un incident, pressing…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-9 bg-muted/40 pl-9 text-[13px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Résultats :</span>
            <Tabs value={statut} onValueChange={(v) => { setStatut(v as Statut); setPage(1); }}>
              <TabsList className="h-7">
                <TabsTrigger value="tous" className="px-3 text-[11px]">Tous</TabsTrigger>
                <TabsTrigger value="ouverts" className="px-3 text-[11px]">Ouverts</TabsTrigger>
                <TabsTrigger value="en_cours" className="px-3 text-[11px]">En cours</TabsTrigger>
                <TabsTrigger value="resolus" className="px-3 text-[11px]">Résolus</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Priorité</label>
            <Select value={priorite} onValueChange={(v) => { setPriorite(v ?? "tous"); setPage(1); }}>
              <SelectTrigger className="h-9 w-[130px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Toutes</SelectItem>
                <SelectItem value="P1">P1 — Critique</SelectItem>
                <SelectItem value="P2">P2 — Majeur</SelectItem>
                <SelectItem value="P3">P3 — Mineur</SelectItem>
              </SelectContent>
            </Select>
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
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">RÉF.</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">INCIDENT</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PRESSING</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PRIORITÉ</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">CATÉGORIE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">OUVERT LE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">DURÉE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">STATUT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="text-xs font-semibold">{i.ref}</TableCell>
                  <TableCell>
                    <span className="block text-[13px] font-semibold">{i.title}</span>
                    <span className="block text-[11px] text-muted-foreground">{i.impact}</span>
                  </TableCell>
                  <TableCell className="text-xs">{i.pressing}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("border-0 text-[10px] font-bold", priorityStyle[i.priority])}>
                      {i.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{i.category}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{i.opened}</TableCell>
                  <TableCell className="text-xs">{i.duration}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("gap-1 border-0 text-[10px] font-semibold", statusStyle[i.status].bg)}>
                      <span className={cn("size-1.5 rounded-full", statusStyle[i.status].dot)} />
                      {i.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={8} className="py-10 text-center text-[13px] text-muted-foreground">
                    Aucun incident ne correspond à ces critères.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            {filtered.length === 0 ? "0" : `${start + 1}–${start + rows.length}`} sur {filtered.length} incidents
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

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
        <p className="flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          Disponibilité plateforme supérieure à 99,9 % sur les 30 derniers jours.
        </p>
        <button className="text-xs font-bold text-emerald-700 hover:underline">Voir le rapport</button>
      </div>
    </div>
  );
}
