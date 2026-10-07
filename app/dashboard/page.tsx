"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileWarning,
  Flame,
  Heart,
  Inbox,
  Layers,
  Plus,
  ReceiptText,
  RefreshCw,
  ScanSearch,
  Shirt,
  Sparkles,
  SprayCan,
  CircleCheck,
  Wallet,
  WashingMachine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGlobalData } from "@/contexts/GlobalContext";

/* ------------------------------- Données mock ------------------------------ */

const kpis = [
  {
    label: "Chiffre d'affaires",
    value: "1 845 500 FCFA",
    badge: "+12,4 %",
    badgeClass: "bg-emerald-50 text-emerald-700",
    sub: "vs. même jour sem. dernière",
    icon: Banknote,
    iconBg: "bg-stone-100 text-stone-500",
  },
  {
    label: "Dépôts du jour",
    value: "126",
    badge: "+6,5 %",
    badgeClass: "bg-amber-50 text-amber-700",
    sub: "418 pièces réceptionnées",
    icon: Inbox,
    iconBg: "bg-slate-100 text-slate-500",
  },
  {
    label: "Retraits effectués",
    value: "94",
    badge: "74,6 %",
    badgeClass: "bg-amber-50 text-amber-700",
    sub: "9 commandes à notifier",
    icon: ReceiptText,
    iconBg: "bg-stone-100 text-stone-500",
  },
  {
    label: "Clients fidélité",
    value: "312",
    badge: "+5,1 %",
    badgeClass: "bg-emerald-50 text-emerald-700",
    sub: "23 nouveaux ce mois",
    icon: Heart,
    iconBg: "bg-stone-100 text-stone-500",
  },
];

const agences = [
  { name: "Plateau", ca: "5 620 000 FCFA", pct: 100, bar: "bg-primary", dot: "bg-primary", delta: "+14,2 %", up: true },
  { name: "Bingerville", ca: "4 965 500 FCFA", pct: 88, bar: "bg-emerald-600", dot: "bg-emerald-600", delta: "+12,4 %", up: true },
  { name: "Cocody Angré", ca: "4 320 000 FCFA", pct: 77, bar: "bg-secondary", dot: "bg-secondary", delta: "+7,8 %", up: true },
  { name: "Marcory", ca: "3 185 500 FCFA", pct: 57, bar: "bg-slate-300", dot: "bg-slate-300", delta: "−2,1 %", up: false },
];

const pipeline = [
  { label: "À trier", count: 14, pieces: "46 pièces", icon: Layers, bg: "bg-slate-100" },
  { label: "Lavage", count: 22, pieces: "78 pièces", icon: WashingMachine, bg: "bg-sky-50" },
  { label: "Repassage", count: 18, pieces: "61 pièces", icon: Flame, bg: "bg-amber-50" },
  { label: "Contrôle", count: 9, pieces: "31 pièces", icon: ScanSearch, bg: "bg-orange-50" },
  { label: "Prêt", count: 35, pieces: "104 pièces", icon: CircleCheck, bg: "bg-emerald-50" },
];

const activites = [
  {
    icon: Inbox,
    iconBg: "bg-sky-50 text-sky-600",
    title: "Dépôt enregistré · BG-02621",
    sub: "Mariam Traoré · 7 pièces · Express",
    amount: "+32 500 FCFA",
    time: "il y a 3 min",
    amountClass: "text-foreground",
  },
  {
    icon: Shirt,
    iconBg: "bg-stone-100 text-stone-600",
    title: "Retrait finalisé · BO-02588",
    sub: "Koffi N'Guessan · paiement Mobile Money",
    amount: "+18 000 FCFA",
    time: "il y a 11 min",
    amountClass: "text-foreground",
  },
  {
    icon: ScanSearch,
    iconBg: "bg-amber-50 text-amber-600",
    title: "Commande passée au contrôle",
    sub: "BO-02602 · 4 costumes · Opératrice : Grâce",
    amount: "Contrôle",
    time: "",
    amountClass: "text-amber-600",
  },
  {
    icon: ReceiptText,
    iconBg: "bg-red-50 text-red-500",
    title: "Dépense de caisse validée",
    sub: "Produits détachants · Fournisseur CleanPro",
    amount: "−45 000 FCFA",
    time: "il y a 26 min",
    amountClass: "text-red-500",
  },
  {
    icon: Sparkles,
    iconBg: "bg-violet-50 text-violet-600",
    title: "Nouveau membre fidélité",
    sub: "Fatou Diabaté · niveau Signature",
    amount: "+120 pts",
    time: "il y a 34 min",
    amountClass: "text-foreground",
  },
];

/* --------------------------------- Graphique ------------------------------- */

function RevenueChart() {
  // Courbe lissée (7 points Lun 21 → Dim 27)
  const path =
    "M 20 190 C 60 185, 80 150, 120 145 C 160 140, 170 100, 210 95 C 250 90, 260 110, 300 85 C 340 60, 360 95, 400 80 C 440 65, 460 50, 500 48 C 530 46, 555 40, 580 35";
  const points = [
    { x: 20, y: 190 },
    { x: 120, y: 145 },
    { x: 210, y: 95 },
    { x: 300, y: 85 },
    { x: 400, y: 80 },
    { x: 500, y: 48 },
  ];
  return (
    <div className="relative mt-2">
      <svg viewBox="0 0 600 220" className="h-52 w-full sm:h-60" role="img" aria-label="Revenu du réseau">
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <line x1="0" x2="600" y1={20 + i * 55} y2={20 + i * 55} stroke="#eef0ee" strokeWidth="1" />
            <text x="0" y={14 + i * 55} fontSize="11" fill="#9aa39e">
              {["3 M", "2 M", "1 M", "0"][i]}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="7" fill="#15803d" opacity="0.12" />
            <circle cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke="#15803d" strokeWidth="2" />
          </g>
        ))}
      </svg>
      <div className="pointer-events-none absolute top-1/2 left-1/2 hidden -translate-x-6 -translate-y-16 rounded-md bg-primary px-2.5 py-1.5 text-center shadow-lg sm:block">
        <p className="text-[11px] font-bold text-secondary">2 860 000 FCFA</p>
        <p className="text-[10px] text-white/70">Dim 27 sept.</p>
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
        {["Lun 21", "Mar 22", "Mer 23", "Jeu 24", "Ven 25", "Sam 26", "Dim 27"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------- Page ---------------------------------- */

export default function DashboardPage() {
  const { updatePath } = useGlobalData();
  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Bonjour Aïcha,</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Voici les performances du réseau au lundi 28 septembre 2026.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="lg" className="gap-1.5 px-3 text-xs font-semibold">
            <CalendarDays className="size-3.5 text-muted-foreground" />
            Aujourd&apos;hui
          </Button>
          <Button variant="outline" size="lg" className="gap-1.5 px-3 text-xs font-semibold">
            <Download className="size-3.5 text-muted-foreground" />
            Exporter
          </Button>
          <Button size="lg" className="gap-1.5 px-3 text-xs font-bold" onClick={() => updatePath("/depots/nouveau")}>
            <Plus className="size-4" />
            Nouveau dépôt
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
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", k.badgeClass)}>{k.badge}</span>
              {k.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Revenus + comparaison */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 xl:col-span-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Revenu du réseau</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                18 291 000 FCFA cumul sur 7 jours · <span className="font-semibold text-emerald-600">+10,8 %</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="px-2.5 text-[11px] font-semibold">
                Toutes les agences
              </Button>
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground" aria-label="Options du graphique">
                ···
              </Button>
            </div>
          </div>
          <RevenueChart />
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Comparaison agences</h2>
            <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold text-muted-foreground">
              Rapport <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">CA cumulé · 21–27 septembre</p>
          <div className="mt-4 space-y-4">
            {agences.map((a) => (
              <div key={a.name}>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span className={cn("size-1.5 rounded-full", a.dot)} />
                    {a.name}
                  </span>
                  <span className="font-bold">{a.ca}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full", a.bar)} style={{ width: `${a.pct}%` }} />
                </div>
                <p className={cn("mt-1 text-right text-[11px] font-bold", a.up ? "text-emerald-600" : "text-red-500")}>
                  {a.delta}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline + caisse */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold">Pipeline atelier</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">98 commandes en cours · 320 pièces</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold text-muted-foreground">
              Ouvrir l&apos;atelier <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {pipeline.map((s) => (
              <div key={s.label} className={cn("rounded-xl p-3", s.bg)}>
                <div className="flex items-center justify-between">
                  <s.icon className="size-4 text-muted-foreground" />
                  <span className="text-lg font-extrabold">{s.count}</span>
                </div>
                <p className="mt-2 text-xs font-bold">{s.label}</p>
                <p className="text-[11px] text-muted-foreground">{s.pieces}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs ring-1 ring-amber-100">
            <Clock3 className="size-4 shrink-0 text-amber-600" />
            <p className="flex-1 text-amber-900">
              <span className="font-bold">8 commandes approchent leur délai promis</span>
              <br />
              <span className="text-amber-700">Priorité aux tickets BO-02614, BO-02636 et BO-02597</span>
            </p>
            <Button variant="link" size="sm" className="font-bold text-amber-700">
              À traiter
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold">Flux de caisse</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Bingerville · aujourd&apos;hui</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold text-muted-foreground">
              Détails <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Solde net</p>
          <div className="flex items-center justify-between">
            <p className="text-xl font-extrabold">1 845 500 FCFA</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Caisse ouverte
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-emerald-50/70 p-2.5">
              <p className="text-[11px] text-muted-foreground">Encaissements</p>
              <p className="font-extrabold text-emerald-700">+1 845 500</p>
            </div>
            <div className="rounded-lg bg-red-50/70 p-2.5">
              <p className="text-[11px] text-muted-foreground">Décaissements</p>
              <p className="font-extrabold text-red-500">−100 000</p>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-xs">
            {[
              { label: "Espèces", value: "742 500 FCFA", pct: 42, bar: "bg-primary" },
              { label: "Mobile Money", value: "935 000 FCFA", pct: 55, bar: "bg-emerald-600" },
              { label: "Carte / Virement", value: "268 000 FCFA", pct: 18, bar: "bg-secondary" },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">{r.label}</span>
                  <span className="font-bold">{r.value}</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full", r.bar)} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Impayés */}
      <div className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold">Impayés et ancienneté des dépôts</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Solde total impayé et répartition par tranche d&apos;ancienneté</p>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold text-muted-foreground">
            Détail <ArrowUpRight className="size-3.5" />
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-[11px] text-muted-foreground">Solde total impayé</p>
            <p className="text-lg font-extrabold">1 240 000 FCFA</p>
            <p className="text-[11px] text-muted-foreground">94 dépôts en retard</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-[11px] text-muted-foreground">Dépôts en retard</p>
            <p className="text-lg font-extrabold">94</p>
            <p className="text-[11px] text-muted-foreground">18 à traiter aujourd&apos;hui</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { tranche: "0–30 jours", montant: "420 000 FCFA", count: "32 dépôts" },
            { tranche: "31–89 jours", montant: "540 000 FCFA", count: "41 dépôts" },
            { tranche: "90+ jours", montant: "280 000 FCFA", count: "21 dépôts" },
          ].map((t) => (
            <div key={t.tranche} className="rounded-xl bg-slate-50 p-4">
              <p className="text-[11px] text-muted-foreground">{t.tranche}</p>
              <p className="font-extrabold">{t.montant}</p>
              <p className="text-[11px] text-muted-foreground">{t.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activité + synchro */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold">Activité récente</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Transactions et mouvements · réseau en direct</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold text-muted-foreground">
              Toute l&apos;activité <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <div className="mt-4 divide-y divide-border">
            {activites.map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", a.iconBg)}>
                  <a.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{a.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.sub}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={cn("text-xs font-bold", a.amountClass)}>{a.amount}</p>
                  {a.time ? <p className="text-[11px] text-muted-foreground">{a.time}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="text-sm font-bold">Synchronisation</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Continuité hors-ligne · Bingerville</p>

          <div className="mt-4 flex items-center gap-3 rounded-xl bg-stone-50 p-3 ring-1 ring-border/60">
            <span className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
              <Wallet className="size-5 text-muted-foreground" />
            </span>
            <div>
              <p className="flex items-center gap-1.5 text-[13px] font-bold text-emerald-700">
                En ligne <span className="size-1.5 rounded-full bg-emerald-500" />
              </p>
              <p className="text-[11px] text-muted-foreground">Dernière synchronisation à 10:19</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs font-bold">Opérations en attente</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
              <FileWarning className="size-3.5" /> 4 à envoyer
            </span>
          </div>

          <div className="mt-3 space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5 rounded-lg border border-border p-2.5">
              <Banknote className="size-4 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-bold">2 dépôts</p>
                <p className="text-muted-foreground">BG-02619, BG-02620</p>
              </div>
              <span className="text-[11px] text-muted-foreground">il y a 16 min</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border border-border p-2.5">
              <BadgeCheck className="size-4 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-bold">1 encaissement</p>
                <p className="text-muted-foreground">18 500 · Orange Money</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border border-border p-2.5">
              <Bell className="size-4 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-bold">1 mise à jour client</p>
                <p className="text-muted-foreground">Téléphone et consentement SMS</p>
              </div>
              <span className="text-[11px] text-muted-foreground">il y a 27 min</span>
            </div>
          </div>

          <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
            Envoi automatique dès que la connexion est stable.
          </p>
          <Button variant="outline" size="lg" className="mt-2 w-full gap-1.5 text-xs font-bold sm:w-auto sm:px-4">
            <RefreshCw className="size-3.5" />
            Synchroniser
          </Button>
        </div>
      </div>

      {/* Bandeau bas mobile : rappels */}
      <div className="flex items-center gap-2 rounded-xl border border-border bg-white p-3 text-xs text-muted-foreground xl:hidden">
        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
        Données à jour · 4 agences synchronisées il y a 2 min
        <span className="ml-auto inline-flex items-center gap-1 font-semibold text-foreground">
          <Eye className="size-3.5" /> Réseau
        </span>
      </div>
    </div>
  );
}

// Exports inutilisés volontairement gardés pour usages futurs (évite les imports morts)
export const __dashboardIcons = {
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  Wallet,
  Layers,
  SprayCan,
};
