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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalData } from "@/contexts/GlobalContext";
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
type Periode = "jour" | "semaine" | "mois";

interface Pressing {
  id: number;
  code: string;
  name: string;
  initials: string;
  country: string;
  flag: string;
  responsible: string;
  agencies: number;
  users: number;
  licence: "Essentiel" | "Pro" | "Business" | "Enterprise";
  activity: string;
  sync: "Synchronisé" | "Retard" | "Échec" | "Hors ligne";
  status: "Actif" | "À surveiller" | "Incident" | "Suspendu";
}

const PRESSINGS: Pressing[] = [
  { id: 1, code: "PRS-0018", name: "Éclat Royal", initials: "ER", country: "Cameroun", flag: "🇨🇲", responsible: "Clarisse Mballa", agencies: 8, users: 42, licence: "Enterprise", activity: "Il y a 3 min", sync: "Synchronisé", status: "Actif" },
  { id: 2, code: "PRS-0021", name: "Maison Blanche", initials: "MB", country: "Cameroun", flag: "🇨🇲", responsible: "Yvan Tchana", agencies: 5, users: 27, licence: "Pro", activity: "Il y a 18 min", sync: "Synchronisé", status: "Actif" },
  { id: 3, code: "PRS-0027", name: "Le Cintre d&apos;or", initials: "LC", country: "Gabon", flag: "🇬🇦", responsible: "Nora Moussavou", agencies: 3, users: 19, licence: "Pro", activity: "Il y a 1 h", sync: "Retard", status: "À surveiller" },
  { id: 4, code: "PRS-0032", name: "Prestige Clean", initials: "PC", country: "Congo", flag: "🇨🇬", responsible: "Merveil Okemba", agencies: 2, users: 11, licence: "Essentiel", activity: "Hier, 19:46", sync: "Synchronisé", status: "Actif" },
  { id: 5, code: "PRS-0038", name: "Perle Pressing", initials: "PP", country: "Cameroun", flag: "🇨🇲", responsible: "Solange Ewane", agencies: 4, users: 23, licence: "Pro", activity: "Il y a 2 j", sync: "Échec", status: "Incident" },
  { id: 6, code: "PRS-0044", name: "Velours & Soin", initials: "VS", country: "Tchad", flag: "🇹🇩", responsible: "Issa Mahamat", agencies: 1, users: 6, licence: "Essentiel", activity: "12 sept. 2026", sync: "Hors ligne", status: "Suspendu" },
];

const licenceBadge: Record<Pressing["licence"], string> = {
  Essentiel: "bg-muted text-muted-foreground",
  Pro: "bg-slate-100 text-slate-600",
  Business: "bg-amber-50 text-amber-700",
  Enterprise: "bg-amber-100 text-amber-700",
};

const syncStyle: Record<Pressing["sync"], { dot: string; text: string }> = {
  Synchronisé: { dot: "bg-emerald-500", text: "text-emerald-700" },
  Retard: { dot: "bg-amber-500", text: "text-amber-700" },
  "Échec": { dot: "bg-red-500", text: "text-red-600" },
  "Hors ligne": { dot: "bg-amber-500", text: "text-amber-700" },
};

const statusStyle: Record<Pressing["status"], { dot: string; bg: string }> = {
  Actif: { dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700" },
  "À surveiller": { dot: "bg-amber-500", bg: "bg-amber-50 text-amber-700" },
  Incident: { dot: "bg-red-500", bg: "bg-red-50 text-red-600" },
  Suspendu: { dot: "bg-muted-foreground/50", bg: "bg-muted text-muted-foreground" },
};

const kpis = [
  { label: "Tenants actifs", value: "48", sub: "+4 ce trimestre", subColor: "text-emerald-600", iconBg: "bg-emerald-50 text-emerald-600" },
  { label: "Agences", value: "127", sub: "93 % connectées", subColor: "text-blue-600", iconBg: "bg-blue-50 text-blue-600" },
  { label: "Licences", value: "52", sub: "4 renouvellements proches", subColor: "text-amber-600", iconBg: "bg-amber-50 text-amber-600" },
  { label: "Incidents ouverts", value: "3", sub: "1 priorité élevée", subColor: "text-red-500", iconBg: "bg-red-50 text-red-500" },
];

export default function SuperAdminPressingsPage() {
  const { updatePath } = useGlobalData();
  const [search, setSearch] = useState("");
  const [periode, setPeriode] = useState<Periode>("jour");
  const [pays, setPays] = useState("tous");
  const [licence, setLicence] = useState("toutes");
  const [statut, setStatut] = useState("tous");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PRESSINGS.filter((p) => {
      if (pays !== "tous" && p.country !== pays) return false;
      if (licence !== "toutes" && p.licence !== licence) return false;
      if (statut !== "tous" && p.status !== statut) return false;
      if (q && !`${p.name} ${p.code} ${p.responsible} ${p.country}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, pays, licence, statut]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">Superadministration</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Pressings</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Gérez l&apos;ensemble des organisations clientes, leurs licences et la santé de leurs synchronisations.
          </p>
        </div>
        <Button size="lg" className="gap-1.5 px-3 text-xs font-bold">
          <Plus className="size-4" />
          Nouveau pressing
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
              <span className={cn("flex size-8 items-center justify-center rounded-lg", k.iconBg)}>
                <Info className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold">{k.value}</p>
            <p className={cn("mt-1 text-[11px] font-medium", k.subColor)}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Filtres + tableau */}
      <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un pressing, responsable…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-9 bg-muted/40 pl-9 text-[13px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Résultats :</span>
            <Tabs value={periode} onValueChange={(v) => setPeriode(v as Periode)}>
              <TabsList className="h-7">
                <TabsTrigger value="jour" className="px-3 text-[11px]">Jour</TabsTrigger>
                <TabsTrigger value="semaine" className="px-3 text-[11px]">Semaine</TabsTrigger>
                <TabsTrigger value="mois" className="px-3 text-[11px]">Mois</TabsTrigger>
              </TabsList>
            </Tabs>
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
                <SelectItem value="Congo">Congo</SelectItem>
                <SelectItem value="Tchad">Tchad</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Licence</label>
            <Select value={licence} onValueChange={(v) => { setLicence(v ?? "toutes"); setPage(1); }}>
              <SelectTrigger className="h-9 w-[130px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toutes">Toutes</SelectItem>
                <SelectItem value="Essentiel">Essentiel</SelectItem>
                <SelectItem value="Pro">Pro</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Statut</label>
            <Select value={statut} onValueChange={(v) => { setStatut(v ?? "tous"); setPage(1); }}>
              <SelectTrigger className="h-9 w-[140px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous</SelectItem>
                <SelectItem value="Actif">Actif</SelectItem>
                <SelectItem value="À surveiller">À surveiller</SelectItem>
                <SelectItem value="Incident">Incident</SelectItem>
                <SelectItem value="Suspendu">Suspendu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
            <Download className="size-3.5" />
            Exporter
          </Button>
        </div>

        {/* Tableau */}
        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PRESSING</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PAYS</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">RESPONSABLE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">AGENCES</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">UTIL.</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">LICENCE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">ACTIVITÉ</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">SYNCHRONISATION</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">STATUT</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
                        {p.initials}
                      </span>
                      <span>
                        <span className="block text-[13px] font-semibold">{p.name}</span>
                        <span className="block text-[11px] text-muted-foreground">{p.code}</span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="flex items-center gap-1.5">{p.flag} {p.country}</span>
                  </TableCell>
                  <TableCell className="text-xs">{p.responsible}</TableCell>
                  <TableCell className="text-xs font-semibold">{p.agencies}</TableCell>
                  <TableCell className="text-xs font-semibold">{p.users}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("border-0 text-[10px] font-semibold", licenceBadge[p.licence])}>
                      {p.licence}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.activity}</TableCell>
                  <TableCell className="text-xs">
                    <span className={cn("flex items-center gap-1.5", syncStyle[p.sync].text)}>
                      <span className={cn("size-1.5 rounded-full", syncStyle[p.sync].dot)} />
                      {p.sync}
                      {p.sync === "Retard" && " 12 min"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("gap-1 border-0 text-[10px] font-semibold", statusStyle[p.status].bg)}>
                      <span className={cn("size-1.5 rounded-full", statusStyle[p.status].dot)} />
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm" aria-label={`Modifier ${p.name}`}>
                        <Pencil className="size-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions pour ${p.name}`}>
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => updatePath(`/superadmin/pressings/${p.code}`)}>
                            Voir le détail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updatePath(`/superadmin/pressings/${p.code}`)}>
                            Journal d&apos;audit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive">Suspendre</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={10} className="py-10 text-center text-[13px] text-muted-foreground">
                    Aucun pressing ne correspond à ces critères.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
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

      {/* Bandeau info */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="flex items-center gap-2 text-xs text-amber-800">
          <Info className="size-4 shrink-0 text-amber-500" />
          Les suspensions et changements de licence sont journalisés et notifiés au responsable du pressing.
        </p>
        <button className="text-xs font-bold text-amber-700 hover:underline">
          Voir le journal
        </button>
      </div>
    </div>
  );
}
