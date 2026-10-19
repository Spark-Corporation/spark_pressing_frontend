"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 6;

interface Agence {
  id: number;
  name: string;
  pressing: string;
  city: string;
  country: string;
  manager: string;
  users: number;
  activity: string;
  sync: "Synchronisé" | "Retard" | "Échec" | "Hors ligne";
  status: "Active" | "Inactive";
}

const AGENCES: Agence[] = [
  { id: 1, name: "SPARK CI / Cocody", pressing: "Éclat Royal", city: "Cocody", country: "Cameroun", manager: "Clarisse Mballa", users: 24, activity: "Il y a 3 min", sync: "Synchronisé", status: "Active" },
  { id: 2, name: "SPARK CI / Plateau", pressing: "Éclat Royal", city: "Plateau", country: "Cameroun", manager: "Yvan Tchana", users: 14, activity: "Il y a 18 min", sync: "Synchronisé", status: "Active" },
  { id: 3, name: "SPARK CI / Marcory", pressing: "Éclat Royal", city: "Marcory", country: "Cameroun", manager: "Nora Moussavou", users: 12, activity: "Il y a 1 h", sync: "Retard", status: "Active" },
  { id: 4, name: "SPARK CI / Bingerville", pressing: "Éclat Royal", city: "Bingerville", country: "Cameroun", manager: "Solange Ewane", users: 8, activity: "Hier, 19:46", sync: "Synchronisé", status: "Active" },
  { id: 5, name: "Maison Blanche / Douala", pressing: "Maison Blanche", city: "Douala", country: "Cameroun", manager: "Issa Mahamat", users: 6, activity: "Il y a 2 j", sync: "Échec", status: "Inactive" },
  { id: 6, name: "Le Cintre d'or / Libreville", pressing: "Le Cintre d'or", city: "Libreville", country: "Gabon", manager: "Merveil Okemba", users: 5, activity: "12 sept. 2026", sync: "Hors ligne", status: "Inactive" },
];

const syncStyle: Record<Agence["sync"], { dot: string; text: string }> = {
  Synchronisé: { dot: "bg-emerald-500", text: "text-emerald-700" },
  Retard: { dot: "bg-amber-500", text: "text-amber-700" },
  "Échec": { dot: "bg-red-500", text: "text-red-600" },
  "Hors ligne": { dot: "bg-amber-500", text: "text-amber-700" },
};

const statusStyle: Record<Agence["status"], { dot: string; bg: string }> = {
  Active: { dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700" },
  Inactive: { dot: "bg-muted-foreground/50", bg: "bg-muted text-muted-foreground" },
};

const kpis = [
  { label: "Agences totales", value: "127", sub: "93 % connectées", subColor: "text-blue-600", iconBg: "bg-blue-50 text-blue-600" },
  { label: "Actives", value: "118", sub: "+4 ce mois", subColor: "text-emerald-600", iconBg: "bg-emerald-50 text-emerald-600" },
  { label: "Inactives", value: "9", sub: "3 hors ligne > 24 h", subColor: "text-amber-600", iconBg: "bg-amber-50 text-amber-600" },
  { label: "Utilisateurs rattachés", value: "1 486", sub: "en moyenne 12 par agence", subColor: "text-muted-foreground", iconBg: "bg-muted/50 text-muted-foreground" },
];

export default function SuperAdminAgencesPage() {
  const { updatePath } = useGlobalData();
  const [search, setSearch] = useState("");
  const [pays, setPays] = useState("tous");
  const [statut, setStatut] = useState("tous");
  const [sync, setSync] = useState("tous");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return AGENCES.filter((a) => {
      if (pays !== "tous" && a.country !== pays) return false;
      if (statut !== "tous" && a.status !== statut) return false;
      if (sync !== "tous" && a.sync !== sync) return false;
      if (q && !`${a.name} ${a.pressing} ${a.city} ${a.manager}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, pays, statut, sync]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">Superadministration</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Agences</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Consultez et gérez les agences de tous les pressings hébergés sur la plateforme.
          </p>
        </div>
        <Button size="lg" className="gap-1.5 px-3 text-xs font-bold">
          <Plus className="size-4" />
          Nouvelle agence
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
              <span className={cn("flex size-8 items-center justify-center rounded-lg", k.iconBg)}>
                <Users className="size-4" />
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
              placeholder="Rechercher une agence, pressing, ville…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-9 bg-muted/40 pl-9 text-[13px]"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Pays</label>
            <Select value={pays} onValueChange={(v) => { setPays(v ?? "tous"); setPage(1); }}>
              <SelectTrigger className="h-9 w-[140px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les pays</SelectItem>
                <SelectItem value="Cameroun">Cameroun</SelectItem>
                <SelectItem value="Gabon">Gabon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Synchronisation</label>
            <Select value={sync} onValueChange={(v) => { setSync(v ?? "tous"); setPage(1); }}>
              <SelectTrigger className="h-9 w-[150px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Toutes</SelectItem>
                <SelectItem value="Synchronisé">Synchronisé</SelectItem>
                <SelectItem value="Retard">Retard</SelectItem>
                <SelectItem value="Échec">Échec</SelectItem>
                <SelectItem value="Hors ligne">Hors ligne</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Statut</label>
            <Select value={statut} onValueChange={(v) => { setStatut(v ?? "tous"); setPage(1); }}>
              <SelectTrigger className="h-9 w-[130px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
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
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">AGENCE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PRESSING</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PAYS</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">RESPONSABLE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">UTIL.</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">ACTIVITÉ</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">SYNCHRONISATION</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">STATUT</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <span className="block text-[13px] font-semibold">{a.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{a.city}</span>
                  </TableCell>
                  <TableCell className="text-xs">{a.pressing}</TableCell>
                  <TableCell className="text-xs">{a.country}</TableCell>
                  <TableCell className="text-xs">{a.manager}</TableCell>
                  <TableCell className="text-xs font-semibold">{a.users}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.activity}</TableCell>
                  <TableCell className="text-xs">
                    <span className={cn("flex items-center gap-1.5", syncStyle[a.sync].text)}>
                      <span className={cn("size-1.5 rounded-full", syncStyle[a.sync].dot)} />
                      {a.sync}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("gap-1 border-0 text-[10px] font-semibold", statusStyle[a.status].bg)}>
                      <span className={cn("size-1.5 rounded-full", statusStyle[a.status].dot)} />
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm" aria-label={`Modifier ${a.name}`}>
                        <Pencil className="size-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions pour ${a.name}`}>
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>Voir le détail</DropdownMenuItem>
                          <DropdownMenuItem>Utilisateurs de l&apos;agence</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive">Désactiver</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={9} className="py-10 text-center text-[13px] text-muted-foreground">
                    Aucune agence ne correspond à ces critères.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            {filtered.length === 0 ? "0" : `${start + 1}–${start + rows.length}`} sur {filtered.length} agences
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

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="flex items-center gap-2 text-xs text-amber-800">
          <Info className="size-4 shrink-0 text-amber-500" />
          Les créations, transferts et désactivations d&apos;agences sont journalisés dans l&apos;audit global.
        </p>
        <button
          className="text-xs font-bold text-amber-700 hover:underline"
          onClick={() => updatePath("/superadmin/audit")}
        >
          Voir le journal
        </button>
      </div>
    </div>
  );
}
