"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Download,
  History,
  Info,
  ListFilter,
  Medal,
  Package,
  Pencil,
  Plus,
  Search,
  Upload,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { ARTICLES, CATEGORIES_ARTICLES, HISTORIQUE_TARIFS, formatFCFA, type Article } from "./data";

const PAGE_SIZE = 6;
type Periode = "jour" | "semaine" | "mois";
type Onglet = "tous" | "categories" | "kilo" | "indisponibles" | "historique";

const kpis = [
  { label: "Articles actifs", value: "84", sub: "+6 ce mois", icon: Package, iconBg: "bg-stone-100 text-stone-500" },
  { label: "Catégories", value: "12", sub: "2 partagées", icon: Medal, iconBg: "bg-amber-50 text-amber-600" },
  { label: "Tarif moyen", value: "3 280 FCFA", sub: "+2,5 % vs juil", icon: Wallet, iconBg: "bg-stone-100 text-stone-500" },
  { label: "À réviser", value: "7", sub: "Tarifs > 12 mois", icon: CheckCircle2, iconBg: "bg-red-50 text-red-500" },
];

const AGENCES = ["Bingerville", "Cocody", "Plateau", "Marcory"];

function prix(v: number | null, kilo: boolean): string {
  if (v === null) return "—";
  return kilo ? `${formatFCFA(v)}/kg` : formatFCFA(v);
}

export default function ArticlesPage() {
  const { updatePath } = useGlobalData();
  const [articles, setArticles] = useState<Article[]>(ARTICLES);
  const [onglet, setOnglet] = useState<Onglet>("tous");
  const [search, setSearch] = useState("");
  const [categorie, setCategorie] = useState("all");
  const [mode, setMode] = useState("all");
  const [agency, setAgency] = useState("all");
  const [periode, setPeriode] = useState<Periode>("mois");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((a) => {
      if (onglet === "kilo" && !(a.mode === "Kilo" || a.mode === "Mixte")) return false;
      if (onglet === "indisponibles" && a.statut !== "Inactif") return false;
      if (periode === "jour" && a.daysAgo > 1) return false;
      if (periode === "semaine" && a.daysAgo > 7) return false;
      if (categorie !== "all" && a.categorie !== categorie) return false;
      if (mode !== "all" && a.mode !== mode) return false;
      if (agency !== "all" && !a.agences.includes(agency)) return false;
      if (q && !`${a.nom} ${a.code} ${a.categorie}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [articles, onglet, search, categorie, mode, agency, periode]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);
  const resetPage = () => setPage(1);

  const nbFiltres = [categorie, mode, agency].filter((v) => v !== "all").length + (search.trim() ? 1 : 0);

  const toggleStatut = (code: string, actif: boolean) => {
    setArticles((list) => list.map((a) => (a.code === code ? { ...a, statut: actif ? "Actif" : "Inactif" } : a)));
    toast.success(actif ? "Article activé" : "Article désactivé", { description: code });
  };

  const categoriesResume = useMemo(
    () =>
      CATEGORIES_ARTICLES.map((c) => {
        const list = articles.filter((a) => a.categorie === c);
        if (list.length === 0) return null;
        return {
          cat: c,
          n: list.length,
          actifs: list.filter((a) => a.statut === "Actif").length,
          moyen: Math.round(list.reduce((s, a) => s + a.classique, 0) / list.length),
        };
      }).filter((x): x is NonNullable<typeof x> => x !== null),
    [articles],
  );

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mt-0.5 max-w-xl text-[13px] text-muted-foreground">
            Centralisez les prestations, les modes de facturation et la disponibilité par agence.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.success("Export lancé", { description: "Catalogue exporté en CSV." })}
          >
            <Download className="size-3.5" />
            Exporter
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.info("Import Excel", { description: "Déposez un fichier .xlsx pour mettre à jour les tarifs." })}
          >
            <Upload className="size-3.5" />
            Importer Excel
          </Button>
          <Button size="lg" className="gap-1.5 px-3 text-xs font-bold" onClick={() => updatePath("/articles/nouveau")}>
            <Plus className="size-4" />
            Nouvel article
          </Button>
        </div>
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
            <p className="mt-2 text-xl font-extrabold tracking-tight">{k.value}</p>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Catalogue */}
      <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold">Catalogue principal</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">M2 en vigueur</p>
          </div>
          <Badge variant="outline" className="gap-1 border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Synchronisé
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {(
            [
              ["tous", "Tous les articles"],
              ["categories", "Catégories"],
              ["kilo", "Tarifs au kilo"],
              ["indisponibles", "Indisponibles"],
              ["historique", "Historique"],
            ] as [Onglet, string][]
          ).map(([v, label]) => (
            <Button
              key={v}
              variant={onglet === v ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setOnglet(v);
                resetPage();
              }}
              className="h-7 rounded-full px-3 text-[11px] font-bold"
            >
              {label}
            </Button>
          ))}
        </div>

        {onglet !== "categories" && onglet !== "historique" && (
          <>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="relative min-w-52 flex-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Article, code ou catégorie…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    resetPage();
                  }}
                  className="h-9 bg-muted/40 pl-9 text-[13px]"
                />
              </div>
              <Select value={categorie} onValueChange={(v) => { setCategorie(v ?? "all"); resetPage(); }}>
                <SelectTrigger className="w-auto text-xs data-[size=default]:h-9">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {CATEGORIES_ARTICLES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={mode} onValueChange={(v) => { setMode(v ?? "all"); resetPage(); }}>
                <SelectTrigger className="w-auto text-xs data-[size=default]:h-9">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Pièce et Kilo</SelectItem>
                  {["Pièce", "Kilo", "Mixte"].map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={agency} onValueChange={(v) => { setAgency(v ?? "all"); resetPage(); }}>
                <SelectTrigger className="w-auto text-xs data-[size=default]:h-9">
                  <SelectValue placeholder="Agence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les agences</SelectItem>
                  {AGENCES.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs font-semibold"
                onClick={() => toast.info("Filtres", { description: `${nbFiltres} filtre${nbFiltres > 1 ? "s" : ""} actif${nbFiltres > 1 ? "s" : ""} • ${filtered.length} résultats.` })}
              >
                <ListFilter className="size-3.5" />
                Filtres
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
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

            <div className="mt-3">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">ARTICLE</TableHead>
                    <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">CATÉGORIE / MODE</TableHead>
                    <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">CLASSIQUE</TableHead>
                    <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">EXPRESS</TableHead>
                    <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">REPASSAGE</TableHead>
                    <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">STATUT / PORTÉE</TableHead>
                    <TableHead className="w-20 text-[10px] font-bold tracking-wide text-muted-foreground">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((a) => {
                    const kilo = a.mode !== "Pièce";
                    return (
                      <TableRow key={a.code}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                              <Package className="size-4" />
                            </span>
                            <span>
                              <span className="block text-[13px] font-semibold">{a.nom}</span>
                              <span className="block text-[11px] text-muted-foreground">{a.code}</span>
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs">{a.categorie}</p>
                          <p className="text-[11px] text-muted-foreground">{a.mode}</p>
                        </TableCell>
                        <TableCell className="text-xs font-semibold">{prix(a.classique, kilo)}</TableCell>
                        <TableCell className="text-xs font-semibold">{prix(a.express, kilo)}</TableCell>
                        <TableCell className="text-xs font-semibold">{prix(a.repassage, kilo)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "border-0 text-[10px] font-semibold",
                              a.statut === "Actif" ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground",
                            )}
                          >
                            {a.statut}
                          </Badge>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">{a.portee}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Switch checked={a.statut === "Actif"} onCheckedChange={(v) => toggleStatut(a.code, v)} aria-label={`Activer ${a.nom}`} size="sm" />
                            <Button variant="ghost" size="icon-sm" aria-label={`Modifier ${a.nom}`} className="size-6" onClick={() => updatePath(`/articles/${a.code}`)}>
                              <Pencil className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {rows.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={7} className="py-10 text-center text-[13px] text-muted-foreground">
                        Aucun article ne correspond à ces critères.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-muted-foreground">
                {filtered.length === 0 ? "0" : `${start + 1}–${start + rows.length}`} sur {filtered.length} résultats
              </p>
              <div className="flex items-center gap-1">
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
              </div>
            </div>
          </>
        )}

        {onglet === "categories" && (
          <div className="mt-3">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">CATÉGORIE</TableHead>
                  <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">ARTICLES</TableHead>
                  <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">ACTIFS</TableHead>
                  <TableHead className="text-right text-[10px] font-bold tracking-wide text-muted-foreground">TARIF MOYEN</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoriesResume.map((c) => (
                  <TableRow key={c.cat}>
                    <TableCell className="text-xs font-bold">{c.cat}</TableCell>
                    <TableCell className="text-xs">{c.n}</TableCell>
                    <TableCell className="text-xs">{c.actifs}</TableCell>
                    <TableCell className="text-right text-xs font-bold">{formatFCFA(c.moyen)} FCFA</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {onglet === "historique" && (
          <div className="mt-3 space-y-2">
            {HISTORIQUE_TARIFS.map(([article, modif, auteur], i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5 text-xs">
                <History className="size-4 shrink-0 text-muted-foreground" />
                <p className="min-w-0 flex-1">
                  <span className="font-bold">{article}</span>
                  <span className="block text-[11px] text-muted-foreground">{modif}</span>
                </p>
                <span className="shrink-0 text-[11px] text-muted-foreground">{auteur}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-emerald-50/60 px-4 py-3 text-[11px] text-muted-foreground ring-1 ring-emerald-100">
        <Info className="size-4 shrink-0 text-emerald-600" />
        <p className="min-w-0 flex-1">Tarifs TTC. Le mode Mixte permet la pièce ou le poids. Les modifications partagées s&apos;appliquent aux agences sélectionnées.</p>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-[11px] font-bold text-emerald-700"
          onClick={() => toast.info("Règles tarifaires", { description: "TTC • Mixte pièce/poids • partage par agence." })}
        >
          Voir les règles
        </Button>
      </div>
    </div>
  );
}
