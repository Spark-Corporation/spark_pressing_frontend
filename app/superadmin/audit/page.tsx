"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  Info,
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

const PAGE_SIZE = 8;
type Periode = "jour" | "semaine" | "mois";

interface AuditEntry {
  id: number;
  action: string;
  actor: string;
  role: string;
  tenant: string;
  agency: string;
  ressource: string;
  date: string;
  ip: string;
  result: "Succès" | "Échec" | "Avertissement";
  details?: string;
}

const AUDIT: AuditEntry[] = [
  { id: 1, action: "Tarif modifié", actor: "Nadie Assi", role: "Manager", tenant: "Éclat Royal", agency: "Cocody", ressource: "COS-002", date: "28 sept. • 10:42", ip: "196.201.82.14", result: "Succès", details: "Prix passé de 1 200 à 1 500 FCFA" },
  { id: 2, action: "Caisse clôturée", actor: "Koffi Mensah", role: "Caissier", tenant: "Éclat Royal", agency: "Cocody", ressource: "CS-1842", date: "28 sept. • 10:31", ip: "196.201.82.51", result: "Succès", details: "Total : 245 000 FCFA" },
  { id: 3, action: "Connexion refusée", actor: "Mariam Traoré", role: "Représentant", tenant: "Éclat Royal", agency: "Plateau", ressource: "Compte", date: "28 sept. • 09:58", ip: "154.72.164.8", result: "Échec", details: "3 tentatives échouées" },
  { id: 4, action: "Paiement annulé", actor: "Awa Koné", role: "Admin", tenant: "Éclat Royal", agency: "Marcory", ressource: "PAY-728184", date: "28 sept. • 09:44", ip: "41.202.124.92", result: "Succès", details: "Remboursement de 18 000 FCFA" },
  { id: 5, action: "Dépôt renuméroté", actor: "Système", role: "Service sync", tenant: "Éclat Royal", agency: "Cocody", ressource: "DEP-COC-0929", date: "28 sept. • 09:16", ip: "10.24.8.3", result: "Succès" },
  { id: 6, action: "Utilisateur suspendu", actor: "Awa Koné", role: "Admin", tenant: "Le Cintre d'or", agency: "Libreville", ressource: "USR-0089", date: "28 sept. • 08:52", ip: "41.202.124.92", result: "Avertissement", details: "Suspendu pour inactivité > 60 j" },
  { id: 7, action: "Licence renouvelée", actor: "Awa Koné", role: "Superadmin", tenant: "Blanc Premium", agency: "—", ressource: "LIC-2026-088", date: "27 sept. • 16:20", ip: "41.202.124.92", result: "Succès", details: "Plan Enterprise, +12 mois" },
  { id: 8, action: "Sauvegarde forcée", actor: "Système", role: "Service infra", tenant: "Orchid Clean", agency: "Douala", ressource: "BAK-20260927", date: "27 sept. • 03:00", ip: "10.24.8.7", result: "Succès", details: "Taille : 2,4 Go" },
];

const resultStyle: Record<AuditEntry["result"], { dot: string; bg: string }> = {
  Succès: { dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700" },
  Échec: { dot: "bg-red-500", bg: "bg-red-50 text-red-600" },
  Avertissement: { dot: "bg-amber-500", bg: "bg-amber-50 text-amber-700" },
};

const kpis = [
  { label: "Événements (30 j)", value: "48 213", sub: "dans tous les tenants", subColor: "text-muted-foreground", iconBg: "bg-muted/50 text-muted-foreground" },
  { label: "Échecs", value: "312", sub: "0,65 % du total", subColor: "text-red-500", iconBg: "bg-red-50 text-red-500" },
  { label: "Avertissements", value: "89", sub: "dont 24 suspensions", subColor: "text-amber-600", iconBg: "bg-amber-50 text-amber-600" },
  { label: "Rétention", value: "12 mois", sub: "conformité configurée", subColor: "text-muted-foreground", iconBg: "bg-muted/50 text-muted-foreground" },
];

export default function SuperAdminAuditPage() {
  const [search, setSearch] = useState("");
  const [periode, setPeriode] = useState<Periode>("jour");
  const [resultat, setResultat] = useState("tous");
  const [tenant, setTenant] = useState("tous");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return AUDIT.filter((e) => {
      if (resultat !== "tous" && e.result !== resultat) return false;
      if (tenant !== "tous" && e.tenant !== tenant) return false;
      if (q && !`${e.action} ${e.actor} ${e.tenant} ${e.agency} ${e.ressource}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, resultat, tenant]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">Superadministration</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Audit global</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Journal des événements critiques de tous les tenants, centralisé et consultable.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
          <Download className="size-3.5" />
          Exporter (CSV)
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
              <span className={cn("flex size-8 items-center justify-center rounded-lg", k.iconBg)}>
                <Database className="size-4" />
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
              placeholder="Rechercher une action, un acteur, une ressource…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-9 bg-muted/40 pl-9 text-[13px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Période :</span>
            <Tabs value={periode} onValueChange={(v) => setPeriode(v as Periode)}>
              <TabsList className="h-7">
                <TabsTrigger value="jour" className="px-3 text-[11px]">Jour</TabsTrigger>
                <TabsTrigger value="semaine" className="px-3 text-[11px]">Semaine</TabsTrigger>
                <TabsTrigger value="mois" className="px-3 text-[11px]">Mois</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Résultat</label>
            <Select value={resultat} onValueChange={(v) => { setResultat(v ?? "tous"); setPage(1); }}>
              <SelectTrigger className="h-9 w-[150px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous</SelectItem>
                <SelectItem value="Succès">Succès</SelectItem>
                <SelectItem value="Échec">Échec</SelectItem>
                <SelectItem value="Avertissement">Avertissement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Tenant</label>
            <Select value={tenant} onValueChange={(v) => { setTenant(v ?? "tous"); setPage(1); }}>
              <SelectTrigger className="h-9 w-[170px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les tenants</SelectItem>
                <SelectItem value="Éclat Royal">Éclat Royal</SelectItem>
                <SelectItem value="Le Cintre d'or">Le Cintre d&apos;or</SelectItem>
                <SelectItem value="Blanc Premium">Blanc Premium</SelectItem>
                <SelectItem value="Orchid Clean">Orchid Clean</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">DATE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">ACTION</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">ACTEUR</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">TENANT / AGENCE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">RESSOURCE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">IP</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">RÉSULTAT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs text-muted-foreground">{e.date}</TableCell>
                  <TableCell>
                    <span className="block text-[13px] font-semibold">{e.action}</span>
                    {e.details && <span className="block text-[11px] text-muted-foreground">{e.details}</span>}
                  </TableCell>
                  <TableCell>
                    <span className="block text-xs font-medium">{e.actor}</span>
                    <span className="block text-[11px] text-muted-foreground">{e.role}</span>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="block">{e.tenant}</span>
                    <span className="block text-[11px] text-muted-foreground">{e.agency}</span>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{e.ressource}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{e.ip}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("gap-1 border-0 text-[10px] font-semibold", resultStyle[e.result].bg)}>
                      <span className={cn("size-1.5 rounded-full", resultStyle[e.result].dot)} />
                      {e.result}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="py-10 text-center text-[13px] text-muted-foreground">
                    Aucun événement ne correspond à ces critères.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            {filtered.length === 0 ? "0" : `${start + 1}–${start + rows.length}`} sur {filtered.length} événements
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

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <p className="flex items-center gap-2 text-xs text-blue-800">
          <Info className="size-4 shrink-0 text-blue-500" />
          Les journaux d&apos;audit sont conservés 12 mois puis archivés conformément à la politique de rétention.
        </p>
        <button className="text-xs font-bold text-blue-700 hover:underline">Politique de rétention</button>
      </div>
    </div>
  );
}
