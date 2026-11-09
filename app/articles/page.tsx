"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
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
import CategoryCreateModal from "@/components/article-category/CategoryCreateModal";
import {
  getArticleCategoriesAction,
  getArticlesAction,
  getArticlesHistoryAction,
} from "@/actions/AdminAction";
import { useAuth } from "@/contexts/AuthContext";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { formatFCFA } from "./data";
import type {
  ApiArticle,
  ApiArticleCategory,
  ArticleHistoryEntry,
  ArticlesKpis,
} from "@/lib/types";

const PAGE_SIZE = 6;
type Periode = "tout" | "jour" | "semaine" | "mois";
type Onglet = "tous" | "categories" | "kilo" | "indisponibles" | "historique";

interface CatalogueArticle {
  id: number;
  categoryId: number | null;
  code: string;
  nom: string;
  categorie: string;
  mode: "Pièce" | "Kilo" | "Mixte";
  classique: number | null;
  express: number | null;
  repassage: number | null;
  classiqueKilo: number | null;
  expressKilo: number | null;
  repassageKilo: number | null;
  statut: "Actif" | "Inactif";
  portee: string;
  daysAgo: number;
}

function mapArticle(article: ApiArticle): CatalogueArticle {
  const billingModes = { piece: "Pièce", kilo: "Kilo", mixed: "Mixte" } as const;
  const mode = billingModes[article.billing_mode];
  if (!mode) {
    throw new Error(`Mode de facturation inconnu pour l'article ${article.code}.`);
  }

  const updatedAt = article.price_updated_at ? new Date(article.price_updated_at) : null;
  const daysAgo =
    updatedAt && !Number.isNaN(updatedAt.getTime())
      ? Math.max(0, Math.floor((Date.now() - updatedAt.getTime()) / 86400000))
      : Number.POSITIVE_INFINITY;
  const scope = article.scope?.label ?? "—";
  const agencyCount = article.scope?.agencies;

  return {
    id: article.id,
    categoryId: article.category_id,
    code: article.code,
    nom: article.name,
    categorie: article.category?.name ?? "Sans catégorie",
    mode,
    classique: article.classic_price,
    express: article.express_price,
    repassage: article.repass_price,
    classiqueKilo: article.classic_price_kilo,
    expressKilo: article.express_price_kilo,
    repassageKilo: article.repass_price_kilo,
    statut: article.status ? "Actif" : "Inactif",
    portee: typeof agencyCount === "number" ? `${scope} • ${agencyCount} agence${agencyCount > 1 ? "s" : ""}` : scope,
    daysAgo,
  };
}

function prix(piece: number | null, kilo: number | null, mode: CatalogueArticle["mode"]): string {
  if (mode === "Pièce") return piece === null ? "—" : formatFCFA(piece);
  if (mode === "Kilo") {
    const value = kilo ?? piece;
    return value === null ? "—" : `${formatFCFA(value)}/kg`;
  }

  const values = [
    piece === null ? null : `${formatFCFA(piece)}/pièce`,
    kilo === null ? null : `${formatFCFA(kilo)}/kg`,
  ].filter((value): value is string => value !== null);
  return values.length ? values.join(" • ") : "—";
}

const HISTORY_CHANGE_LABELS: Record<string, string> = {
  classic_price: "Tarif classique",
  express_price: "Tarif express",
  repass_price: "Tarif repassage",
  classic_price_kilo: "Tarif classique au kilo",
  express_price_kilo: "Tarif express au kilo",
  repass_price_kilo: "Tarif repassage au kilo",
  status: "Disponibilité",
  category_id: "Catégorie",
  billing_mode: "Mode de facturation",
  name: "Nom",
};

function historyChangeLabel(change: string): string {
  return HISTORY_CHANGE_LABELS[change] ?? change.replaceAll("_", " ");
}

function formatHistoryDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export default function ArticlesPage() {
  const { updatePath } = useGlobalData();
  const { logout } = useAuth();
  const [, startTransition] = useTransition();
  const [articles, setArticles] = useState<CatalogueArticle[]>([]);
  const [articleCategories, setArticleCategories] = useState<ApiArticleCategory[] | null>(null);
  const [kpis, setKpis] = useState<ArticlesKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [categoriesAttempt, setCategoriesAttempt] = useState(0);
  const [history, setHistory] = useState<ArticleHistoryEntry[] | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyAttempt, setHistoryAttempt] = useState(0);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [onglet, setOnglet] = useState<Onglet>("tous");
  const [search, setSearch] = useState("");
  const [categorie, setCategorie] = useState("Toutes les catégories");
  const [mode, setMode] = useState("Tous les modes");
  const [periode, setPeriode] = useState<Periode>("tout");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    startTransition(async () => {
      try {
        const result = await getArticlesAction();
        if (cancelled) return;
        if (!result.success) {
          setLoadError(result.error);
          if (result.error.includes("Non autorisé")) logout();
          toast.error("Impossible de charger les articles", { description: result.error });
          setLoading(false);
          return;
        }

        try {
          setArticles(result.data.data.map(mapArticle));
          setKpis(result.data.meta.kpis);
          setLoading(false);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Réponse inattendue du serveur pour les articles.";
          setLoadError(message);
          toast.error("Impossible de charger les articles", { description: message });
          setLoading(false);
        }
      } catch (error: unknown) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "Impossible de charger les articles.";
        setLoadError(message);
        toast.error("Impossible de charger les articles", { description: message });
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loadAttempt, logout, startTransition]);

  useEffect(() => {
    let cancelled = false;
    startTransition(async () => {
      try {
        const result = await getArticleCategoriesAction();
        if (cancelled) return;
        if (!result.success) {
          setCategoriesError(result.error);
          if (result.error.includes("Non autorisé")) logout();
          toast.error("Impossible de charger les catégories", { description: result.error });
          return;
        }
        setArticleCategories(result.data.data);
      } catch (error: unknown) {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : "Impossible de charger les catégories.";
        setCategoriesError(message);
        toast.error("Impossible de charger les catégories", { description: message });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [categoriesAttempt, logout, startTransition]);

  useEffect(() => {
    if (onglet !== "historique" || history !== null || historyError !== null) return;

    let cancelled = false;
    startTransition(async () => {
      try {
        const result = await getArticlesHistoryAction();
        if (cancelled) return;
        if (!result.success) {
          setHistoryError(result.error);
          if (result.error.includes("Non autorisé")) logout();
          toast.error("Impossible de charger l’historique", { description: result.error });
          return;
        }
        setHistory(result.data.data);
      } catch (error: unknown) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "Impossible de charger l’historique.";
        setHistoryError(message);
        toast.error("Impossible de charger l’historique", { description: message });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [history, historyAttempt, historyError, logout, onglet, startTransition]);

  const historyLoading = onglet === "historique" && history === null && historyError === null;
  const retryLoading = () => {
    setLoading(true);
    setLoadError(null);
    setLoadAttempt((attempt) => attempt + 1);
  };

  const retryCategories = () => {
    setCategoriesError(null);
    setCategoriesAttempt((attempt) => attempt + 1);
  };

  const retryHistory = () => {
    setHistoryError(null);
    setHistoryAttempt((attempt) => attempt + 1);
  };

  const handleCategoryCreated = (category: ApiArticleCategory) => {
    setArticleCategories((prev) => (prev ? [...prev, category] : [category]));
  };

  const categories = useMemo(
    () => [...(articleCategories ?? [])].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "fr")),
    [articleCategories],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((a) => {
      if (onglet === "kilo" && !(a.mode === "Kilo" || a.mode === "Mixte")) return false;
      if (onglet === "indisponibles" && a.statut !== "Inactif") return false;
      if (periode === "jour" && a.daysAgo > 1) return false;
      if (periode === "semaine" && a.daysAgo > 7) return false;
      if (periode === "mois" && a.daysAgo > 30) return false;
      if (categorie !== "Toutes les catégories" && a.categoryId !== Number(categorie)) return false;
      if (mode !== "Tous les modes" && a.mode !== mode) return false;
      if (q && !`${a.nom} ${a.code} ${a.categorie}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [articles, onglet, search, categorie, mode, periode]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);
  const resetPage = () => setPage(1);

  const nbFiltres =
    [categorie !== "Toutes les catégories", mode !== "Tous les modes"].filter(Boolean).length +
    (search.trim() ? 1 : 0);

  const categoriesResume = useMemo(
    () =>
      categories.map((category) => {
        const list = articles.filter((article) => article.categoryId === category.id);
        return {
          ...category,
          moyen: list.length
            ? Math.round(
                list.reduce(
                  (sum, article) => sum + (article.classique ?? article.classiqueKilo ?? 0),
                  0,
                ) / list.length,
              )
            : null,
        };
      }),
    [articles, categories],
  );

  const kpiCards = [
    {
      label: "Articles actifs",
      value: kpis ? kpis.active_articles.value.toLocaleString("fr-FR") : "—",
      sub: kpis ? `+${kpis.active_articles.new_this_month} ce mois` : " ",
      icon: Package,
      iconBg: "bg-stone-100 text-stone-500",
    },
    {
      label: "Catégories",
      value: kpis ? kpis.categories.value.toLocaleString("fr-FR") : "—",
      sub: kpis ? `${kpis.categories.shared} partagées` : " ",
      icon: Medal,
      iconBg: "bg-amber-50 text-amber-600",
    },
    {
      label: "Tarif moyen",
      value: kpis ? `${formatFCFA(kpis.average_price.value)} FCFA` : "—",
      sub: kpis ? `${kpis.average_price.delta_percent > 0 ? "+" : ""}${kpis.average_price.delta_percent.toLocaleString("fr-FR")} %` : " ",
      icon: Wallet,
      iconBg: "bg-stone-100 text-stone-500",
    },
    {
      label: "À réviser",
      value: kpis ? kpis.to_review.value.toLocaleString("fr-FR") : "—",
      sub: kpis?.to_review.rule ?? " ",
      icon: CheckCircle2,
      iconBg: "bg-red-50 text-red-500",
    },
  ];

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

      {loadError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{loadError}</p>
          <Button variant="outline" size="sm" onClick={retryLoading}>
            Réessayer
          </Button>
        </div>
      )}

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
            <p className="mt-1.5 text-[11px] text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Catalogue */}
      <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold">Catalogue principal</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {kpis?.updated_at
                ? `Mis à jour le ${new Date(kpis.updated_at).toLocaleDateString("fr-FR")}`
                : "En attente de synchronisation"}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "gap-1 border-0 text-[10px] font-bold",
              loadError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700",
            )}
          >
            <span className={cn("size-1.5 rounded-full", loadError ? "bg-red-500" : "bg-emerald-500")} />
            {loadError ? "Erreur de synchronisation" : loading ? "Chargement…" : "Synchronisé"}
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
              <Select value={categorie} onValueChange={(v) => { setCategorie(v ?? "Toutes les catégories"); resetPage(); }}>
                <SelectTrigger className="w-auto text-xs data-[size=default]:h-9">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Toutes les catégories">Toutes les catégories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={mode} onValueChange={(v) => { setMode(v ?? "Tous les modes"); resetPage(); }}>
                <SelectTrigger className="w-auto text-xs data-[size=default]:h-9">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tous les modes">Tous les modes</SelectItem>
                  {["Pièce", "Kilo", "Mixte"].map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
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
                  <TabsTrigger value="tout" className="px-3 text-[11px]">
                    Tout
                  </TabsTrigger>
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
                  {loading &&
                    Array.from({ length: PAGE_SIZE }, (_, index) => (
                      <TableRow key={`loading-${index}`}>
                        <TableCell colSpan={7}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))}
                  {rows.map((a) => {
                    return (
                      <TableRow key={a.id}>
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
                        <TableCell className="text-xs font-semibold">{prix(a.classique, a.classiqueKilo, a.mode)}</TableCell>
                        <TableCell className="text-xs font-semibold">{prix(a.express, a.expressKilo, a.mode)}</TableCell>
                        <TableCell className="text-xs font-semibold">{prix(a.repassage, a.repassageKilo, a.mode)}</TableCell>
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
                            <Switch
                              checked={a.statut === "Actif"}
                              disabled
                              aria-label={`Statut de ${a.nom} (modification non disponible)`}
                              title="La modification du statut n'est pas disponible avec l'API actuelle."
                              size="sm"
                            />
                            <Button variant="ghost" size="icon-sm" aria-label={`Modifier ${a.nom}`} className="size-6" onClick={() => updatePath(`/articles/${a.id}`)}>
                              <Pencil className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!loading && rows.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={7} className="py-10 text-center text-[13px] text-muted-foreground">
                        {loadError ? "Les articles ne peuvent pas être affichés." : "Aucun article ne correspond à ces critères."}
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
            <div className="mb-3 flex items-center justify-end">
              <Button
                size="sm"
                className="gap-1.5 text-[11px] font-bold"
                onClick={() => setCategoryModalOpen(true)}
              >
                <Plus className="size-3.5" />
                Nouvelle catégorie
              </Button>
            </div>
            {categoriesError && (
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p>{categoriesError}</p>
                <Button variant="outline" size="sm" onClick={retryCategories}>
                  Réessayer
                </Button>
              </div>
            )}
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
                {articleCategories === null && !categoriesError &&
                  Array.from({ length: 3 }, (_, index) => (
                    <TableRow key={`category-loading-${index}`}>
                      <TableCell colSpan={4}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))}
                {categoriesResume.map((c) => (
                  <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs font-bold">
                          {c.name}
                          {c.shared && (
                            <Badge variant="secondary" className="text-[10px] font-medium">
                              Partagée
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    <TableCell className="text-xs">{c.articles_count}</TableCell>
                    <TableCell className="text-xs">{c.active_articles_count}</TableCell>
                    <TableCell className="text-right text-xs font-bold">
                      {c.moyen === null ? "—" : `${formatFCFA(c.moyen)} FCFA`}
                    </TableCell>
                  </TableRow>
                ))}
                {articleCategories?.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={4} className="py-10 text-center text-[13px] text-muted-foreground">
                      Aucune catégorie pour le moment.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {onglet === "historique" && (
          <div className="mt-3 space-y-3">
            {historyError && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p>{historyError}</p>
                <Button variant="outline" size="sm" onClick={retryHistory}>
                  Réessayer
                </Button>
              </div>
            )}

            {historyLoading && (
              <div className="space-y-2" role="status" aria-label="Chargement de l’historique">
                {[0, 1, 2].map((item) => (
                  <Skeleton key={item} className="h-20 rounded-lg" />
                ))}
              </div>
            )}

            {!historyLoading && !historyError && history?.length === 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-border p-4 text-xs text-muted-foreground">
                <History className="size-4 shrink-0" />
                <p>Aucune modification d’article pour le moment.</p>
              </div>
            )}

            {!historyLoading && !historyError && history && history.length > 0 && (
              <div className="divide-y rounded-lg border border-border">
                {history.map((entry, index) => (
                  <div
                    key={`${entry.article_id}-${entry.at}-${index}`}
                    className="flex flex-wrap items-start justify-between gap-3 p-4"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <History className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{entry.label}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {entry.article} · par {entry.by}
                        </p>
                        {entry.changes.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {entry.changes.map((change, changeIndex) => (
                              <Badge
                                key={`${change}-${changeIndex}`}
                                variant="secondary"
                                className="text-[10px] font-medium"
                              >
                                {historyChangeLabel(change)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <time
                      dateTime={entry.at}
                      className="shrink-0 text-[11px] text-muted-foreground"
                    >
                      {formatHistoryDate(entry.at)}
                    </time>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-emerald-50/60 px-4 py-3 text-[11px] text-muted-foreground ring-1 ring-emerald-100">
        <Info className="size-4 shrink-0 text-emerald-600" />
        <p className="min-w-0 flex-1">Tarifs TTC. Pour les articles mixtes, les prix à la pièce et au kilo sont affichés séparément.</p>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-[11px] font-bold text-emerald-700"
          onClick={() => toast.info("Règles tarifaires", { description: "TTC • Mixte pièce/poids • partage par agence." })}
        >
          Voir les règles
        </Button>
      </div>

      <CategoryCreateModal
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
        onCreated={handleCategoryCreated}
      />
    </div>
  );
}
