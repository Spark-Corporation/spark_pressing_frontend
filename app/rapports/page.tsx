"use client";

import { useState } from "react";
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  CircleDollarSign,
  Clock,
  Download,
  FileText,
  Heart,
  ReceiptText,
  Scale,
  ShoppingBag,
  TriangleAlert,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { AGENCES_PERF, CA_JOURS, PANIER_JOURS, VENTES_JOURS } from "./data";

type Metrique = "ca" | "ventes" | "panier";

const kpis = [
  { label: "Chiffre d'affaires", value: "18 642 500 FCFA", sub: "+12,4 % vs août", icon: Banknote, iconBg: "bg-stone-100 text-stone-500" },
  { label: "Ventes", value: "1 284", sub: "+5,7 % • panier 14 519", icon: ShoppingBag, iconBg: "bg-stone-100 text-stone-500" },
  { label: "Remises", value: "428 300 FCFA", sub: "2,3 % du CA", icon: CircleDollarSign, iconBg: "bg-amber-50 text-amber-600" },
  { label: "Impayés", value: "1 176 000 FCFA", sub: "−6,1 % vs août", icon: TriangleAlert, iconBg: "bg-red-50 text-red-500" },
];

const DATASETS: Record<Metrique, { label: string; bars: { v: number; label: string }[] }> = {
  ca: { label: "CA quotidien en milliers de FCFA", bars: CA_JOURS },
  ventes: { label: "Ventes quotidiennes", bars: VENTES_JOURS },
  panier: { label: "Panier moyen en milliers de FCFA", bars: PANIER_JOURS },
};

const DONUT = [
  { label: "Mobile Money", pct: 46, cls: "stroke-emerald-500", dot: "bg-emerald-500", offset: 25 },
  { label: "Espèces", pct: 31, cls: "stroke-secondary", dot: "bg-secondary", offset: -21 },
  { label: "Carte", pct: 18, cls: "stroke-slate-400", dot: "bg-slate-400", offset: -52 },
  { label: "Virement", pct: 5, cls: "stroke-slate-200", dot: "bg-slate-200", offset: -70 },
];

const rapportsDetail = [
  ["Bilan journalier", "Recettes, caisse et écarts", "bilan", FileText],
  ["Performance caissiers", "Productivité et remises", "", Users],
  ["Impayés clients", "Soldes et relances", "", ReceiptText],
  ["Fidélité", "Attention valeur", "", Heart],
  ["Flux de caisse", "Historique et écarts", "", Wallet],
  ["Comparaison agences", "Multi-agences et écarts", "", Scale],
] as const;

export default function RapportsPage() {
  const { updatePath } = useGlobalData();
  const [periode, setPeriode] = useState("01 – 28 septembre 2026");
  const [agence, setAgence] = useState("all");
  const [comparaison, setComparaison] = useState("vs période précédente");
  const [plage, setPlage] = useState("30 jours");
  const [metrique, setMetrique] = useState<Metrique>("ca");

  const bars = DATASETS[metrique].bars;

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-xl text-[13px] text-muted-foreground">
          Analysez l&apos;activité commerciale, les encaissements et la qualité opérationnelle.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.info("Programmation", { description: "Rapport mensuel envoyé le 1er à 08:00." })}
          >
            <Clock className="size-3.5" />
            Programmer
          </Button>
          <Button
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.success("Export lancé", { description: "CSV / Excel / PDF en cours de génération." })}
          >
            <Download className="size-4" />
            Exporter CSV / Excel / PDF
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-white p-3">
        <div className="min-w-40 flex-1">
          <p className="mb-1 text-[10px] font-bold text-muted-foreground">Période</p>
          <Select value={periode} onValueChange={(v) => setPeriode(v ?? periode)}>
            <SelectTrigger className="w-full text-xs data-[size=default]:h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="01 – 28 septembre 2026">01 – 28 septembre 2026</SelectItem>
              <SelectItem value="01 – 31 août 2026">01 – 31 août 2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-40 flex-1">
          <p className="mb-1 text-[10px] font-bold text-muted-foreground">Agence</p>
          <Select value={agence} onValueChange={(v) => setAgence(v ?? "all")}>
            <SelectTrigger className="w-full text-xs data-[size=default]:h-9">
              <SelectValue placeholder="Agence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les agences</SelectItem>
              {["Bingerville", "Cocody", "Plateau", "Marcory"].map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-40 flex-1">
          <p className="mb-1 text-[10px] font-bold text-muted-foreground">Comparaison</p>
          <Select value={comparaison} onValueChange={(v) => setComparaison(v ?? comparaison)}>
            <SelectTrigger className="w-full text-xs data-[size=default]:h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vs période précédente">vs période précédente</SelectItem>
              <SelectItem value="vs même mois N-1">vs même mois N-1</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-1.5 pt-5">
          {["Aujourd'hui", "7 jours", "30 jours"].map((p) => (
            <Button
              key={p}
              variant={plage === p ? "default" : "outline"}
              size="sm"
              onClick={() => setPlage(p)}
              className="h-9 px-3 text-[11px] font-bold"
            >
              {p}
            </Button>
          ))}
          <Button
            size="sm"
            className="h-9 px-4 text-[11px] font-bold"
            onClick={() => toast.success("Filtres appliqués", { description: `${periode} • ${plage}.` })}
          >
            Appliquer
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

      {/* Évolution + donut */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Évolution du chiffre d&apos;affaires</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{DATASETS[metrique].label}</p>
            </div>
            <Badge variant="outline" className="border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
              Objectif 84%
            </Badge>
          </div>
          <div className="mt-3 flex gap-1.5">
            {(
              [
                ["ca", "Chiffre d'affaires"],
                ["ventes", "Ventes"],
                ["panier", "Panier moyen"],
              ] as [Metrique, string][]
            ).map(([v, label]) => (
              <Button
                key={v}
                variant={metrique === v ? "default" : "ghost"}
                size="sm"
                onClick={() => setMetrique(v)}
                className="h-7 rounded-full px-3 text-[11px] font-bold"
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="mt-3 flex h-44 items-end gap-1.5">
            {bars.map((b, i) => (
              <div key={i} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1 self-stretch">
                <span className="text-[10px] font-bold text-muted-foreground">{b.label}</span>
                <div
                  className={cn("w-full rounded-sm", i === bars.length - 1 ? "bg-secondary" : "bg-emerald-500/70")}
                  style={{ height: `${b.v}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-500" /> Période actuelle</span>
            <span className="font-bold text-foreground">18,64 M</span>
            <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-muted-foreground/40" /> Précédente</span>
            <span className="font-bold text-foreground">16,58 M</span>
            <span className="ml-auto">Projection <span className="font-bold text-foreground">20,1 M</span></span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold">Recettes par paiement</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">17,47 M FCFA encaissés</p>
            <div className="mt-3 flex items-center gap-4">
              <svg viewBox="0 0 36 36" className="size-28 shrink-0" role="img" aria-label="Répartition des paiements">
                <circle cx="18" cy="18" r="15.9155" fill="none" strokeWidth="4.5" className="stroke-muted" />
                {DONUT.map((s) => (
                  <circle
                    key={s.label}
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    strokeWidth="4.5"
                    strokeDasharray={`${s.pct} ${100 - s.pct}`}
                    strokeDashoffset={s.offset}
                    strokeLinecap="butt"
                    className={s.cls}
                  />
                ))}
              </svg>
              <div className="min-w-0 flex-1 space-y-1.5 text-xs">
                {DONUT.map((s) => (
                  <p key={s.label} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className={cn("size-1.5 rounded-full", s.dot)} />
                      {s.label}
                    </span>
                    <span className="font-bold">{s.pct}%</span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold">Mouvements hors vente</h2>
            <div className="mt-2 space-y-1.5 text-xs">
              <p className="flex justify-between"><span className="text-muted-foreground">Dépôts</span><span className="font-bold">+940 000</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Retraits</span><span className="font-bold text-red-500">−612 500</span></p>
              <p className="flex justify-between border-t border-border pt-1.5"><span className="font-bold">Solde théorique</span><span className="font-extrabold">2 847 300</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Agences + fidélité */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 xl:col-span-2">
          <h2 className="text-sm font-bold">Performance des agences</h2>
          <div className="mt-3">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {["AGENCE", "CA", "VENTES", "PANIER", "ÉVOLUTION"].map((h) => (
                    <TableHead key={h} className="text-[10px] font-bold tracking-wide text-muted-foreground">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {AGENCES_PERF.map((a) => (
                  <TableRow key={a.nom}>
                    <TableCell className="text-xs font-bold">{a.nom}</TableCell>
                    <TableCell className="text-xs">{a.ca}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{a.ventes}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{a.panier}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border-0 text-[10px] font-bold", a.up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-500")}>
                        {a.evolution}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>4 résultats</span>
            <span className="flex items-center gap-1">
              <Button variant="default" size="icon-sm" className="text-[11px] font-bold">1</Button>
              <Button variant="outline" size="icon-sm" className="text-[11px] font-bold" onClick={() => toast.info("Page 2", { description: "Données consolidées suivantes." })}>2</Button>
              <Button variant="outline" size="icon-sm" className="text-[11px] font-bold" onClick={() => toast.info("Page 3", { description: "Données consolidées suivantes." })}>3</Button>
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="text-sm font-bold">Programme fidélité</h2>
          <p className="mt-2 text-2xl font-extrabold">2 468</p>
          <p className="text-[11px] text-muted-foreground">membres actifs</p>
          <div className="mt-3 space-y-1.5 text-xs">
            <p className="flex justify-between"><span className="text-muted-foreground">Points émis</span><span className="font-bold">184 200</span></p>
            <p className="flex justify-between"><span className="text-muted-foreground">Points utilisés</span><span className="font-bold">96 450</span></p>
            <p className="flex justify-between"><span className="text-muted-foreground">CA membres</span><span className="font-bold">61%</span></p>
          </div>
        </div>
      </div>

      {/* Rapports détaillés */}
      <div className="rounded-xl border border-border bg-white p-5">
        <h2 className="text-sm font-bold">Rapports détaillés</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Accès rapide et exportable</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {rapportsDetail.map(([title, sub, href, Icon]) => (
            <button
              key={title}
              type="button"
              onClick={() =>
                href
                  ? updatePath(`/rapports/${href}`)
                  : toast.info(title, { description: "Rapport disponible prochainement en export." })
              }
              className="flex items-center gap-2.5 rounded-xl border border-border p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                <Icon className="size-4 text-muted-foreground" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold">{title}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{sub}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Lien écrans restants */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
        <CalendarDays className="size-4 shrink-0" />
        <p className="flex-1">Dernier écran restant du sidebar : Audit & logs.</p>
      </div>
    </div>
  );
}
