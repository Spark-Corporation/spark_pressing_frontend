"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Package,
  Phone,
  Printer,
  Receipt,
  ScanLine,
  Search,
  TriangleAlert,
  Wallet,
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ANCIENS, RETRAITS, formatFCFA, type Retrait } from "./data";

const PAGE_SIZE = 6;
type Periode = "jour" | "semaine" | "mois";

const kpis = [
  { label: "Prêts aujourd'hui", value: "18", sub: "47 pièces disponibles", icon: Package, iconBg: "bg-stone-100 text-stone-500" },
  { label: "En attente de notification", value: "5", sub: "3 SMS • 2 WhatsApp", icon: Bell, iconBg: "bg-amber-50 text-amber-600" },
  { label: "Retraits effectués", value: "27", sub: "+12 % vs lundi dernier", icon: CheckCircle2, iconBg: "bg-slate-100 text-slate-500" },
  { label: "Soldes impayés", value: "86 500 FCFA", sub: "7 dépôts concernés", icon: Wallet, iconBg: "bg-red-50 text-red-500" },
];

const AGENCES = ["Bingerville", "Cocody", "Riviera 3", "Plateau", "Marcory"];

const notifClass: Record<Retrait["notifTone"], string> = {
  ok: "text-muted-foreground",
  warn: "font-semibold text-amber-600",
  muted: "text-muted-foreground",
};

export default function RetraitsPage() {
  const { updatePath } = useGlobalData();
  const [search, setSearch] = useState("");
  const [periode, setPeriode] = useState<Periode>("mois");
  const [dateSel, setDateSel] = useState("all");
  const [agency, setAgency] = useState("all");
  const [paiement, setPaiement] = useState("all");
  const [etat, setEtat] = useState("all");
  const [page, setPage] = useState(1);
  const [pageAnciens, setPageAnciens] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return RETRAITS.filter((r) => {
      if (periode === "jour" && r.daysAgo > 1) return false;
      if (periode === "semaine" && r.daysAgo > 7) return false;
      if (dateSel !== "all" && r.jour !== dateSel) return false;
      if (agency !== "all" && r.agency !== agency) return false;
      if (paiement !== "all" && r.paiement !== paiement) return false;
      if (etat !== "all" && r.atelier !== etat) return false;
      if (q && !`${r.code} ${r.client} ${r.phone}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, periode, dateSel, agency, paiement, etat]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);
  const resetPage = () => setPage(1);

  const resetAll = () => {
    setSearch("");
    setPeriode("mois");
    setDateSel("all");
    setAgency("all");
    setPaiement("all");
    setEtat("all");
    resetPage();
  };

  const openTraitement = (code: string) => updatePath(`/retraits/${code}`);

  const totalPagesAnciens = Math.max(1, Math.ceil(ANCIENS.length / PAGE_SIZE));
  const safeAnciens = Math.min(pageAnciens, totalPagesAnciens);
  const startAnciens = (safeAnciens - 1) * PAGE_SIZE;
  const rowsAnciens = ANCIENS.slice(startAnciens, startAnciens + PAGE_SIZE);

  const prochains = RETRAITS.filter((r) => r.jour === "today").slice(0, 2);

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl">
            Centre de retrait
            <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-muted-foreground">
              9 prêts
            </Badge>
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Priorisez les dépôts prêts, vérifiez les soldes et remettez chaque pièce en toute sécurité.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.success("Liste envoyée à l'impression")}
          >
            <Printer className="size-3.5" />
            Imprimer la liste
          </Button>
          <Button
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => {
              if (filtered.length === 0) {
                toast.error("File vide", { description: "Aucun dépôt à traiter avec ces filtres." });
                return;
              }
              openTraitement(filtered[0].code);
            }}
          >
            Traiter le retrait
            <ArrowRight className="size-4" />
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

      {/* Recherche instantanée + retraits du jour */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl bg-primary p-4 sm:p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-white">Retrouver un dépôt instantanément</h2>
            <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-white/70">
              ⌘K
            </kbd>
          </div>
          <div className="mt-3 flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ex. BG-02641, 07 48 22 19 03 ou Aminata…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  resetPage();
                }}
                className="h-10 border-0 bg-white pl-9 text-[13px]"
              />
            </div>
            <Button
              className="h-10 shrink-0 gap-1.5 bg-secondary px-4 text-xs font-bold text-secondary-foreground hover:bg-secondary/90"
              onClick={() => toast.info("Scanner", { description: "Présentez le ticket devant la douchette." })}
            >
              <ScanLine className="size-4" />
              Scanner
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <span className="font-medium text-white/70">Résultats :</span>
            <Tabs
              value={periode}
              onValueChange={(v) => {
                setPeriode(v as Periode);
                resetPage();
              }}
            >
              <TabsList className="h-7 bg-white/10">
                <TabsTrigger value="jour" className="px-3 text-[11px] text-white/70 data-active:bg-white data-active:text-foreground">
                  Jour
                </TabsTrigger>
                <TabsTrigger value="semaine" className="px-3 text-[11px] text-white/70 data-active:bg-white data-active:text-foreground">
                  Semaine
                </TabsTrigger>
                <TabsTrigger value="mois" className="px-3 text-[11px] text-white/70 data-active:bg-white data-active:text-foreground">
                  Mois
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[13px] font-bold">Retraits du jour</h2>
              <p className="text-[11px] text-muted-foreground">6 prochains rendez-vous</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-[11px] font-semibold text-muted-foreground"
              onClick={() => toast.info("Planning", { description: "Les 6 prochains rendez-vous du jour." })}
            >
              Voir le planning
            </Button>
          </div>
          <div className="mt-3 space-y-2.5">
            {prochains.map((r) => (
              <button
                key={r.code}
                type="button"
                onClick={() => openTraitement(r.code)}
                className="flex w-full items-center gap-2.5 rounded-lg border border-border p-2.5 text-left hover:bg-muted/40"
              >
                <span className="text-xs font-extrabold">{r.retrait.split("•")[1]?.trim() ?? ""}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold">{r.client}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{r.code} • {r.articles}</span>
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 border-0 text-[10px] font-bold",
                    r.reste > 0 ? "bg-red-50 text-red-600" : "bg-muted text-muted-foreground",
                  )}
                >
                  {r.reste > 0 ? "À encaisser" : "Soldé"}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="mr-1 text-xs font-semibold">Affiner la file de retrait</p>
          <Select value={dateSel} onValueChange={(v) => { setDateSel(v ?? "all"); resetPage(); }}>
            <SelectTrigger className="w-auto text-xs data-[size=default]:h-9">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes dates</SelectItem>
              <SelectItem value="today">Aujourd&apos;hui • 28 sept. 2026</SelectItem>
              <SelectItem value="tomorrow">Demain</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
            </SelectContent>
          </Select>
          <Select value={agency} onValueChange={(v) => { setAgency(v ?? "all"); resetPage(); }}>
            <SelectTrigger className="w-auto text-xs data-[size=default]:h-9">
              <SelectValue placeholder="Agence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes agences</SelectItem>
              {AGENCES.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
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
          <Select value={etat} onValueChange={(v) => { setEtat(v ?? "all"); resetPage(); }}>
            <SelectTrigger className="w-auto text-xs data-[size=default]:h-9">
              <SelectValue placeholder="État" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Prêt & contrôlé</SelectItem>
              <SelectItem value="Prêt">Prêt</SelectItem>
              <SelectItem value="Contrôle">Contrôle</SelectItem>
            </SelectContent>
          </Select>
          <span className="ml-auto text-[11px] text-muted-foreground">{filtered.length} résultats</span>
          <Button variant="ghost" size="sm" onClick={resetAll} className="text-xs font-semibold text-muted-foreground">
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Table file */}
      <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold">Dépôts prêts au retrait</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Triés par horaire prévu puis par ancienneté</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-500" /> Prêt</span>
            <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-red-500" /> Impayé</span>
            <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-amber-500" /> Sync en attente</span>
          </div>
        </div>
        <div className="mt-3">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {["CODE", "CLIENT", "TÉLÉPHONE", "ARTICLES", "RETRAIT PRÉVU", "ATELIER", "TOTAL", "RESTE", "NOTIFICATION", "SYNC."].map((h) => (
                  <TableHead key={h} className="text-[10px] font-bold tracking-wide text-muted-foreground">
                    {h}
                  </TableHead>
                ))}
                <TableHead className="w-24 text-[10px] font-bold tracking-wide text-muted-foreground">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.code} className={cn(r.reste > 0 && "bg-amber-50/40 hover:bg-amber-50/70")}>
                  <TableCell className="text-xs font-bold">{r.code}</TableCell>
                  <TableCell className="text-xs font-semibold">{r.client}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.phone}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.articles}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.retrait}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1 border-0 bg-muted text-[10px] font-semibold text-foreground">
                      <span className={cn("size-1.5 rounded-full", r.atelier === "Prêt" ? "bg-emerald-500" : "bg-sky-500")} />
                      {r.atelier}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-bold">{formatFCFA(r.total)}</TableCell>
                  <TableCell className={cn("text-xs font-bold", r.reste > 0 ? "text-red-500" : "text-muted-foreground")}>
                    {formatFCFA(r.reste)} FCFA
                  </TableCell>
                  <TableCell className={cn("text-[11px]", notifClass[r.notifTone])}>{r.notif}</TableCell>
                  <TableCell>
                    <span className={cn("size-1.5 rounded-full", r.sync === "ok" ? "bg-emerald-500" : "bg-amber-500")} />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <Button size="sm" className="h-6 px-2.5 text-[11px] font-bold" onClick={() => openTraitement(r.code)}>
                        Traiter
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions pour ${r.code}`} className="size-6">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => openTraitement(r.code)}>Traiter le retrait</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success("Bon envoyé à l'impression")}>
                            Imprimer le bon
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success("Client notifié", { description: `${r.client} • ${r.phone}.` })}>
                            Notifier le client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={11} className="py-10 text-center text-[13px] text-muted-foreground">
                    Aucun dépôt ne correspond à ces critères.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            {filtered.length === 0 ? "0" : `${start + 1}–${start + rows.length}`} sur {filtered.length} dépôts prêts
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

      {/* Bandeau procédure */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-100">
        <Check className="size-4 shrink-0 text-amber-600" />
        <p className="min-w-0 flex-1 text-xs text-amber-800">
          La remise exige la vérification des pièces et l&apos;identité du réceptionnaire. Les opérations hors ligne sont horodatées puis synchronisées automatiquement.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-[11px] font-bold text-amber-700"
          onClick={() => toast.info("Procédure sécurisée", { description: "Vérification pièces + identité obligatoires." })}
        >
          Procédure sécurisée
        </Button>
      </div>

      {/* Anciens */}
      <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold">Vêtements classés depuis 30+ jours</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Suivi prioritaire des dépôts anciens, frais de garde et escalades</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-[11px] font-bold text-amber-700"
            onClick={() => toast.info("12 dépôts à traiter", { description: "File des dépôts anciens." })}
          >
            12 dépôts à traiter
          </Button>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            ["30–60 jours", "4 dépôts", "18 pièces • 64 500 FCFA"],
            ["61–90 jours", "5 dépôts", "27 pièces • 93 000 FCFA"],
            ["90+ jours", "3 dépôts", "12 pièces • 41 000 FCFA"],
          ].map(([tranche, n, sub]) => (
            <div key={tranche} className="rounded-xl bg-slate-50 p-4 border-2">
              <p className="text-[11px] text-muted-foreground">{tranche}</p>
              <p className="font-extrabold">{n}</p>
              <p className="text-[11px] text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {["CLIENT", "TÉLÉPHONE", "CLASSÉ", "ATTENTE", "PIÈCES", "VALEUR", "DÉCISION"].map((h) => (
                  <TableHead key={h} className="text-[10px] font-bold tracking-wide text-muted-foreground">
                    {h}
                  </TableHead>
                ))}
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground text-end">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowsAnciens.map((a, i) => (
                <TableRow key={i} className={cn(i === 0 && safeAnciens === 1 && "bg-amber-50/40 hover:bg-amber-50/70")}>
                  <TableCell className="text-xs font-semibold">{a.client}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.phone}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.classe}</TableCell>
                  <TableCell className="text-xs font-bold text-amber-600">{a.attente}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.pieces}</TableCell>
                  <TableCell className="text-xs font-bold">{formatFCFA(a.valeur)}</TableCell>
                  <TableCell className="text-[11px] font-semibold text-amber-700">{a.decision}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="outline" size="sm" className="h-6 gap-1 px-2 text-[10px] font-bold" onClick={() => toast.success("Relance envoyée", { description: `${a.client} • ${a.phone}.` })}>
                        <Phone className="size-3" />
                        Relancer
                      </Button>
                      <Button variant="outline" size="sm" className="h-6 gap-1 px-2 text-[10px] font-bold" onClick={() => toast.success("Frais de garde appliqués", { description: `${a.client} • ${formatFCFA(a.valeur)} FCFA.` })}>
                        <Receipt className="size-3" />
                        Frais
                      </Button>
                      <Button variant="outline" size="sm" className="h-6 gap-1 px-2 text-[10px] font-bold" onClick={() => toast.info("Escalade créée", { description: `Dossier ${a.client} transmis au responsable.` })}>
                        <TriangleAlert className="size-3" />
                        Escalade
                      </Button>
                      <Button size="sm" className="h-6 gap-1 px-2 text-[10px] font-bold" onClick={() => toast.success("Dépôt traité", { description: `${a.client} • dossier clôturé.` })}>
                        <Check className="size-3" />
                        Traité
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            {startAnciens + 1}–{startAnciens + rowsAnciens.length} sur {ANCIENS.length} dépôts anciens
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={safeAnciens <= 1} onClick={() => setPageAnciens((p) => Math.max(1, p - 1))} className="gap-1 px-2.5 text-[11px] font-semibold">
              <ChevronLeft className="size-3.5" />
              Précédent
            </Button>
            <Button variant="default" size="icon-sm" className="text-[11px] font-bold">
              {safeAnciens}
            </Button>
            <Button variant="outline" size="sm" disabled={safeAnciens >= totalPagesAnciens} onClick={() => setPageAnciens((p) => Math.min(totalPagesAnciens, p + 1))} className="gap-1 px-2.5 text-[11px] font-semibold">
              Suivant
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
