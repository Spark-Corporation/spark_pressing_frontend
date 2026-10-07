"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Columns3,
  Crown,
  Download,
  Gift,
  ListFilter,
  MoreHorizontal,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useGlobalData } from "@/contexts/GlobalContext";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AGENCES, CLIENTS, FIDELITE_TOTAUX, type Client, type FideliteGroupe } from "./data";

const PAGE_SIZE = 8;
type Periode = "jour" | "semaine" | "mois";

const kpis = [
  { label: "Clients actifs", value: "2 846", badge: "+8,2 % ce mois", icon: Users, iconBg: "bg-stone-100 text-stone-500" },
  { label: "Nouveaux clients", value: "184", badge: "+24 cette semaine", icon: UserPlus, iconBg: "bg-stone-100 text-stone-500" },
  { label: "Clients VIP", value: "126", badge: "4,4 % du portefeuille", icon: Crown, iconBg: "bg-amber-50 text-amber-600" },
  { label: "Points attribués", value: "482 k", badge: "+12,5 % ce mois", icon: Gift, iconBg: "bg-amber-50 text-amber-600" },
];

const groupeBadge: Record<FideliteGroupe, string> = {
  Essentiel: "bg-muted text-muted-foreground",
  Argent: "bg-slate-200/70 text-slate-600",
  Or: "bg-amber-100 text-amber-700",
  Platine: "bg-sky-100 text-sky-700",
};

function StatutBadge({ statut }: { statut: Client["statut"] }) {
  if (statut === "VIP") {
    return <Badge className="gap-1 bg-primary text-[10px] font-bold text-white">● VIP</Badge>;
  }
  const styles: Record<string, string> = {
    Actif: "bg-emerald-50 text-emerald-700",
    Inactif: "bg-muted text-muted-foreground",
    Archivé: "bg-red-50 text-red-600",
  };
  const dots: Record<string, string> = {
    Actif: "bg-emerald-500",
    Inactif: "bg-muted-foreground/50",
    Archivé: "bg-red-500",
  };
  return (
    <Badge variant="outline" className={cn("gap-1 border-0 text-[10px] font-semibold", styles[statut])}>
      <span className={cn("size-1.5 rounded-full", dots[statut])} />
      {statut}
    </Badge>
  );
}

export default function ClientsPage() {
  const { updatePath } = useGlobalData();
  const [search, setSearch] = useState("");
  const [periode, setPeriode] = useState<Periode>("mois");
  const [fidelite, setFidelite] = useState<FideliteGroupe | "Tous">("Tous");
  const [agency, setAgency] = useState<string>("Toutes");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [columns, setColumns] = useState({ frequence: true, valeur: true, points: true, groupe: true });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CLIENTS.filter((c) => {
      if (periode === "jour" && c.daysAgo > 2) return false;
      if (periode === "semaine" && c.daysAgo > 7) return false;
      if (fidelite !== "Tous" && c.groupe !== fidelite) return false;
      if (agency !== "Toutes" && c.agency !== agency) return false;
      if (q && !`${c.prenoms} ${c.nom} ${c.phone} ${c.code}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, periode, fidelite, agency]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Clients</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Pilotez la relation client et la fidélité de toutes vos agences.
          </p>
        </div>
        <Button size="lg" className="gap-1.5 px-3 text-xs font-bold" onClick={() => updatePath("/clients/nouveau")}>
          <UserPlus className="size-4" />
          Nouveau client
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
              <span className={cn("flex size-8 items-center justify-center rounded-lg", k.iconBg)}>
                <k.icon className="size-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-2">
              <p className="text-xl font-extrabold tracking-tight">{k.value}</p>
              <p className="text-[11px] text-muted-foreground">{k.badge}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres + répartition */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-3 rounded-xl border border-border bg-white p-4 xl:col-span-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, téléphone ou code client…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              className="h-9 bg-muted/40 pr-12 pl-9 text-[13px]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <span className="font-medium text-muted-foreground">Résultats :</span>
            <Tabs
              value={periode}
              onValueChange={(v) => {
                setPeriode(v as Periode);
                resetPage();
              }}
            >
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

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="mr-1 font-medium text-muted-foreground">Fidélité</span>
            {FIDELITE_TOTAUX.map((f) => {
              const active = fidelite === f.key;
              return (
                <Button
                  key={f.key}
                  variant={active ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setFidelite(f.key);
                    resetPage();
                  }}
                  className={cn(
                    "h-6 gap-1 rounded-full px-2.5 text-[11px] font-semibold",
                    !active && f.key === "Or" && "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
                    !active && f.key === "Platine" && "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100",
                  )}
                >
                  {f.label} <span className={cn(active ? "opacity-80" : "opacity-70")}>{f.total}</span>
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters((v) => !v)}
              className={cn("h-6 gap-1 rounded-full px-2.5 text-[11px] font-semibold", showFilters && "border-primary text-primary")}
            >
              <ListFilter className="size-3" />
              Filtres
            </Button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-3 text-xs">
              <span className="mr-1 font-medium text-muted-foreground">Agence</span>
              {["Toutes", ...AGENCES].map((a) => (
                <Button
                  key={a}
                  variant={agency === a ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setAgency(a);
                    resetPage();
                  }}
                  className="h-6 rounded-full px-2.5 text-[11px] font-semibold"
                >
                  {a}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Répartition fidélité */}
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[13px] font-bold">Répartition fidélité</h2>
            <p className="text-sm font-extrabold">2 846</p>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Portefeuille actif</p>
          <div className="mt-3 space-y-3 text-xs">
            {[
              { label: "Essentiel", pct: 57, bar: "[&_[data-slot=progress-indicator]]:bg-slate-400", dot: "bg-slate-400" },
              { label: "Argent", pct: 26, bar: "[&_[data-slot=progress-indicator]]:bg-emerald-500", dot: "bg-emerald-500" },
              { label: "Or & Platine", pct: 17, bar: "[&_[data-slot=progress-indicator]]:bg-amber-500", dot: "bg-amber-500" },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                    <span className={cn("size-1.5 rounded-full", r.dot)} />
                    {r.label}
                  </span>
                  <span className="font-bold">{r.pct} %</span>
                </div>
                <Progress value={r.pct} className={cn("mt-1.5", r.bar)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Répertoire */}
      <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold">Répertoire clients</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">2 846 clients • synchronisé à 10:38</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={() => toast.success("Export CSV lancé", { description: "Le fichier sera téléchargé dans quelques secondes." })}
            >
              <Download className="size-3.5" />
              Exporter
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                    <Columns3 className="size-3.5" />
                    Colonnes
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-44">
                {(
                  [
                    ["frequence", "Fréquence"],
                    ["valeur", "Valeur client"],
                    ["points", "Points"],
                    ["groupe", "Groupe"],
                  ] as const
                ).map(([key, label]) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={columns[key]}
                    onCheckedChange={(v) => setColumns((c) => ({ ...c, [key]: v === true }))}
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-3">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">CLIENT</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">TÉLÉPHONE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">AGENCE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">DERNIER DÉPÔT</TableHead>
                {columns.frequence && <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">FRÉQUENCE</TableHead>}
                {columns.valeur && <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">VALEUR CLIENT</TableHead>}
                {columns.points && <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">POINTS</TableHead>}
                {columns.groupe && <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">GROUPE</TableHead>}
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">STATUT</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", c.avatarBg)}>
                        {c.initials}
                      </span>
                      <span>
                        <span className="block text-[13px] font-semibold">
                          {c.prenoms} {c.nom}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">{c.code}</span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{c.phone}</TableCell>
                  <TableCell className="text-xs">{c.agency}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.lastDeposit}</TableCell>
                  {columns.frequence && <TableCell className="text-xs text-muted-foreground">{c.frequence}</TableCell>}
                  {columns.valeur && <TableCell className="text-xs font-bold">{c.valeur}</TableCell>}
                  {columns.points && <TableCell className="text-xs font-bold text-amber-600">{c.points.toLocaleString("fr-FR").replace(/,/g, " ")}</TableCell>}
                  {columns.groupe && (
                    <TableCell>
                      <Badge variant="outline" className={cn("border-0 text-[10px] font-semibold", groupeBadge[c.groupe])}>
                        {c.groupe}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>
                    <StatutBadge statut={c.statut} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm" aria-label={`Actions pour ${c.prenoms} ${c.nom}`}>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => updatePath(`/clients/${c.code}`)}>
                          Voir la fiche
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updatePath("/depots/nouveau")}>
                          Nouveau dépôt
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => toast.info("Archivage", { description: `${c.prenoms} ${c.nom} sera archivé.` })}
                        >
                          Archiver
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={10} className="py-10 text-center text-[13px] text-muted-foreground">
                    Aucun client ne correspond à ces critères.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            {filtered.length === 0 ? "0" : `${start + 1}–${start + rows.length}`} sur 2 846 clients
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Page précédente"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === safePage ? "default" : "outline"}
                size="icon-sm"
                onClick={() => setPage(p)}
                className="text-[11px] font-bold"
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Page suivante"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
