"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Download,
  Eye,
  MoreHorizontal,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  TrendingUp,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CATEGORIES, FLUX_HEURES, JOURNAL, formatFCFA, type JournalOp } from "./data";

const PAGE_SIZE = 7;
type Periode = "jour" | "semaine" | "mois";

const kpis = [
  { label: "Recettes du jour", value: "895 500 FCFA", sub: "+12,4 % vs lundi dernier", icon: TrendingUp, iconBg: "bg-stone-100 text-stone-500" },
  { label: "Dépenses", value: "92 000 FCFA", sub: "4 sorties validées", icon: ArrowUpRight, iconBg: "bg-red-50 text-red-500" },
  { label: "Impayés", value: "186 750 FCFA", sub: "14 dépôts concernés", icon: ReceiptText, iconBg: "bg-amber-50 text-amber-600" },
  { label: "Écart de caisse", value: "0 FCFA", sub: "Comptage conforme", icon: CheckCircle2, iconBg: "bg-emerald-50 text-emerald-600" },
];

const statutBadge: Record<JournalOp["statut"], string> = {
  Synchronisé: "bg-emerald-50 text-emerald-700",
  Validé: "bg-muted text-muted-foreground",
  "Hors ligne": "bg-amber-100 text-amber-700",
};

export default function CaissePage() {
  const { updatePath } = useGlobalData();
  const [search, setSearch] = useState("");
  const [periode, setPeriode] = useState<Periode>("mois");
  const [dateSel, setDateSel] = useState("today");
  const [categorie, setCategorie] = useState("all");
  const [paiement, setPaiement] = useState("all");
  const [statut, setStatut] = useState("all");
  const [page, setPage] = useState(1);
  const [columns, setColumns] = useState({ categorie: true, operateur: true, paiement: true, flux: true });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return JOURNAL.filter((o) => {
      if (periode === "jour" && o.daysAgo > 1) return false;
      if (periode === "semaine" && o.daysAgo > 7) return false;
      if (dateSel === "today" && o.daysAgo > 0) return false;
      if (dateSel === "yesterday" && o.daysAgo !== 1) return false;
      if (categorie !== "all" && o.categorie !== categorie) return false;
      if (paiement !== "all" && o.paiement !== paiement) return false;
      if (statut !== "all" && o.statut !== statut) return false;
      if (q && !`${o.ref} ${o.categorie} ${o.operateur}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, periode, dateSel, categorie, paiement, statut]);

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
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl">
            Centre de caisse
            <Badge variant="outline" className="border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
              Bingerville • ouverte
            </Badge>
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Suivez les flux, rapprochez les moyens de paiement et auditez chaque mouvement de Bingerville.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.info("Journal du 28 septembre 2026", { description: "Période journalière sélectionnée." })}
          >
            <CalendarDays className="size-3.5" />
            28 sept. 2026
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.success("Export CSV lancé", { description: "Le journal sera téléchargé dans quelques secondes." })}
          >
            <Download className="size-3.5" />
            Exporter
          </Button>
          <Button size="lg" className="gap-1.5 px-3 text-xs font-bold" onClick={() => updatePath("/caisse/nouveau")}>
            <Plus className="size-4" />
            Nouveau mouvement
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

      {/* Situation + solde + compté */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold">Situation de caisse</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Lundi 28 septembre 2026</p>
            </div>
            <Badge variant="outline" className="gap-1 border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Caisse ouverte
            </Badge>
          </div>
          <div className="mt-3 space-y-2.5 text-xs">
            {[
              ["Solde d'ouverture", "180 000 FCFA", "08:02 • Grâce A.", false],
              ["Encaissements dépôts", "+612 500 FCFA", "31 transactions", false],
              ["Paiements de soldes", "+248 000 FCFA", "18 retraits", false],
              ["Entrées hors dépôt", "+35 000 FCFA", "2 mouvements", false],
              ["Sorties hors dépôt", "−92 000 FCFA", "4 mouvements", true],
            ].map(([label, v, sub, neg]) => (
              <div key={label as string} className="flex items-baseline justify-between gap-2">
                <div>
                  <p className="font-semibold">{label}</p>
                  <p className="text-[11px] text-muted-foreground">{sub}</p>
                </div>
                <p className={cn("font-extrabold", neg ? "text-red-500" : "")}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-primary p-4 text-white">
            <p className="text-xs text-white/70">Solde théorique</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight">983 500 FCFA</p>
            <p className="mt-1 text-[11px] text-white/60">Calculé à 16:42</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-sm font-bold">Ventilation des encaissements</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">895 500 FCFA encaissés aujourd&apos;hui</p>
            <div className="mt-3 space-y-2.5 text-xs">
              {[
                ["Espèces", "420 000 FCFA • 46,9 %", 47, "bg-primary"],
                ["Mobile Money", "375 500 FCFA • 41,9 %", 42, "bg-emerald-500"],
                ["Carte / Virement", "100 000 FCFA • 11,2 %", 11, "bg-amber-500"],
              ].map(([label, v, pct, bar]) => (
                <div key={label as string}>
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">{label}</span>
                    <span className="font-bold">{v}</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full", bar as string)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <h2 className="text-sm font-bold">Montant réellement compté</h2>
          <p className="mt-2 text-2xl font-extrabold tracking-tight">983 500 FCFA</p>
          <Badge variant="outline" className="mt-2 gap-1 border-0 bg-emerald-100 text-[10px] font-bold text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Écart 0 FCFA
          </Badge>
          <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
            Comptage saisi par Grâce Adjoua à 17:56 • contrôle Aïcha Koné à 17:58.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full border-emerald-200 bg-white text-xs font-bold"
            onClick={() => updatePath("/caisse/cloture")}
          >
            Clôturer la journée
          </Button>
        </div>
      </div>

      {/* Flux + synchro */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-4 sm:p-5 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Flux de caisse</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Entrées et sorties cumulées • tranche de 60 minutes</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-[11px] font-semibold text-muted-foreground"
              onClick={() => updatePath("/caisse/cloture")}
            >
              Voir le rapport
            </Button>
          </div>
          <p className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-500" /> Entrées</span>
            <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-red-400" /> Sorties</span>
            <span className="ml-auto font-bold text-foreground">Solde net +803 500 FCFA</span>
          </p>
          <div className="mt-3 flex h-40 items-end gap-2">
            {FLUX_HEURES.map((f) => (
              <div key={f.h} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <div className="flex h-32 w-full items-end justify-center gap-1">
                  <div className="w-2.5 rounded-sm bg-emerald-500" style={{ height: `${f.entrees}%` }} title={`Entrées ${f.h}`} />
                  <div className="w-2.5 rounded-sm bg-red-400" style={{ height: `${Math.max(4, f.sorties * 0.6)}%` }} title={`Sorties ${f.h}`} />
                </div>
                <span className="text-[10px] text-muted-foreground">{f.h}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
          <h2 className="text-sm font-bold">Synchronisation hors ligne</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Continuité de service Bingerville</p>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50/60 p-2.5 ring-1 ring-emerald-100">
            <Wifi className="size-4 shrink-0 text-emerald-600" />
            <div className="min-w-0 flex-1 text-[11px]">
              <p className="font-bold text-emerald-800">En ligne • synchronisé</p>
              <p className="text-emerald-700">Dernière synchronisation à 16:42:08</p>
            </div>
            <RefreshCw className="size-3.5 shrink-0 text-muted-foreground" />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <p className="font-bold">Opérations en attente</p>
            <span className="text-[11px] font-bold text-amber-600">1 à envoyer</span>
          </div>
          <div className="mt-2 rounded-lg border border-border p-2.5 text-xs">
            <p className="font-bold">MVT-00417 • Entrée</p>
            <p className="text-[11px] text-muted-foreground">25 000 FCFA, créée à 16:31</p>
            <p className="mt-1 text-right text-[11px] font-semibold text-amber-600">En attente</p>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Envoi automatique dès que la connexion est stable.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full gap-1.5 text-xs font-bold"
            onClick={() => toast.success("File synchronisée", { description: "MVT-00417 envoyée au cloud." })}
          >
            <RefreshCw className="size-3.5" />
            Synchroniser
          </Button>
        </div>
      </div>

      {/* Journal */}
      <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold">Journal de caisse</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">57 opérations • total entrées 895 500 FCFA • total sorties 92 000 FCFA</p>
          </div>
          <div className="flex items-center gap-2">
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
                    ["categorie", "Catégorie"],
                    ["operateur", "Opérateur"],
                    ["paiement", "Paiement"],
                    ["flux", "Flux"],
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
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={() => toast.success("Export CSV lancé", { description: "Le journal sera téléchargé dans quelques secondes." })}
            >
              <Download className="size-3.5" />
              Exporter
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="relative min-w-52 flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher une référence, catégorie ou opérateur…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              className="h-9 bg-muted/40 pl-9 text-[13px]"
            />
          </div>
          <Select value={dateSel} onValueChange={(v) => { setDateSel(v ?? "today"); resetPage(); }}>
            <SelectTrigger className="w-auto text-xs data-[size=default]:h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd&apos;hui • 28 sept.</SelectItem>
              <SelectItem value="yesterday">Hier</SelectItem>
              <SelectItem value="all">Toutes dates</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categorie} onValueChange={(v) => { setCategorie(v ?? "all"); resetPage(); }}>
            <SelectTrigger className="w-auto text-xs data-[size=default]:h-9">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={paiement} onValueChange={(v) => { setPaiement(v ?? "all"); resetPage(); }}>
            <SelectTrigger className="w-auto text-xs data-[size=default]:h-9">
              <SelectValue placeholder="Paiement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les paiements</SelectItem>
              {["Espèces", "Mobile Money", "Carte"].map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statut} onValueChange={(v) => { setStatut(v ?? "all"); resetPage(); }}>
            <SelectTrigger className="w-auto text-xs data-[size=default]:h-9">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {["Synchronisé", "Validé", "Hors ligne"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">DATE / HEURE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">RÉFÉRENCE</TableHead>
                {columns.categorie && <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">CATÉGORIE</TableHead>}
                {columns.operateur && <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">OPÉRATEUR</TableHead>}
                {columns.paiement && <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PAIEMENT</TableHead>}
                {columns.flux && <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">FLUX</TableHead>}
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">MONTANT</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">STATUT</TableHead>
                <TableHead className="w-20 text-[10px] font-bold tracking-wide text-muted-foreground">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((o) => (
                <TableRow key={o.ref} className={cn(o.statut === "Hors ligne" && "bg-amber-50/50 hover:bg-amber-50")}>
                  <TableCell className="text-xs text-muted-foreground">{o.date}</TableCell>
                  <TableCell className="text-xs font-bold">{o.ref}</TableCell>
                  {columns.categorie && <TableCell className="text-xs">{o.categorie}</TableCell>}
                  {columns.operateur && <TableCell className="text-xs">{o.operateur}</TableCell>}
                  {columns.paiement && <TableCell className="text-xs text-muted-foreground">{o.paiement}</TableCell>}
                  {columns.flux && (
                    <TableCell className={cn("text-xs font-semibold", o.flux === "Sortie" ? "text-red-500" : "")}>
                      {o.flux}
                    </TableCell>
                  )}
                  <TableCell className="text-xs font-bold">{formatFCFA(o.montant)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("border-0 text-[10px] font-semibold", statutBadge[o.statut])}>
                      {o.statut}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Voir ${o.ref}`}
                        className="size-6"
                        onClick={() => toast.info(o.ref, { description: `${o.categorie} • ${formatFCFA(o.montant)} FCFA • ${o.operateur}.` })}
                      >
                        <Eye className="size-3.5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions pour ${o.ref}`} className="size-6">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => toast.info(o.ref, { description: `${formatFCFA(o.montant)} FCFA • ${o.operateur}.` })}>
                            Voir le détail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success("Reçu envoyé à l'impression")}>
                            Imprimer le reçu
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={9} className="py-10 text-center text-[13px] text-muted-foreground">
                    Aucune opération ne correspond à ces critères.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            {filtered.length === 0 ? "0" : `${start + 1}–${start + rows.length}`} sur 57 opérations
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="gap-1 px-2.5 text-[11px] font-semibold">
              <ChevronLeft className="size-3.5" />
              Précédent
            </Button>
            <Button variant="default" size="icon-sm" className="text-[11px] font-bold">
              {safePage}
            </Button>
            <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="gap-1 px-2.5 text-[11px] font-semibold">
              Suivant
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
