"use client";

import {
  ArrowUpRight,
  Banknote,
  Bell,
  CalendarDays,
  CheckCircle2,
  Download,
  GitCompareArrows,
  Heart,
  Inbox,
  RefreshCw,
  Scale,
  Target,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AGENCES } from "./data";

const kpis1 = [
  { label: "Chiffre d'affaires", value: "18 291 000 FCFA", sub: "+10,8 % vs août", icon: Banknote, iconBg: "bg-stone-100 text-stone-500" },
  { label: "Dépôts", value: "1 267", sub: "4 186 pièces reçues", icon: Inbox, iconBg: "bg-stone-100 text-stone-500" },
  { label: "Retraits", value: "1 150", sub: "90,8 % finalisés", icon: CheckCircle2, iconBg: "bg-amber-50 text-amber-600" },
  { label: "Cash-flow net", value: "15 840 500 FCFA", sub: "+9,6 % sur la période", icon: Wallet, iconBg: "bg-stone-100 text-stone-500" },
];

const kpis2 = [
  { label: "Impayés", value: "1 240 000 FCFA", sub: "94 dépôts • 6,8 % du CA", subClass: "text-red-500", icon: TriangleAlert, iconBg: "bg-red-50 text-red-500" },
  { label: "Membres fidélité", value: "2 846", sub: "482 k points attribués", subClass: "text-amber-600", icon: Heart, iconBg: "bg-amber-50 text-amber-600" },
  { label: "Santé synchronisation", value: "99,8 %", sub: "4 agences en ligne", icon: RefreshCw, iconBg: "bg-stone-100 text-stone-500" },
  { label: "Objectif réseau", value: "86 %", sub: "2 agences au-dessus de 85 %", icon: Target, iconBg: "bg-sky-50 text-sky-600" },
];

const CA_BARS = [62, 78, 70, 66, 80, 74, 84, 72, 90, 68, 76, 100];

const alertes = [
  ["Marcory • impayés élevés", "543 750 FCFA • +6 % sur 7 jours", "red"],
  ["Cocody Angré • 12 retards", "6 retraits promis aujourd'hui", "amber"],
  ["Plateau • 2 opérations hors ligne", "Envoi attendu depuis 14 min", "muted"],
  ["Bingerville • objectif proche", "88 % atteint • +12,4 %", "emerald"],
] as const;

export default function MultiAgencesPage() {
  const { updatePath } = useGlobalData();

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Vue consolidée multi-agences</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Performance du réseau SPARK PRESSING • données synchronisées à 10:42
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.info("Période", { description: "1–28 septembre 2026 sélectionnée." })}
          >
            <CalendarDays className="size-3.5" />
            1–28 septembre 2026
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.success("Export lancé", { description: "Rapport consolidé en cours de génération." })}
          >
            <Download className="size-3.5" />
            Exporter
          </Button>
          <Button
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.info("Comparaison", { description: "Sélectionnez 2 agences à comparer." })}
          >
            <GitCompareArrows className="size-4" />
            Comparer
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...kpis1, ...kpis2].map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
              <span className={cn("flex size-8 items-center justify-center rounded-lg", k.iconBg)}>
                <k.icon className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-xl font-extrabold tracking-tight">{k.value}</p>
            <p className={cn("mt-1.5 text-[11px] text-muted-foreground", "subClass" in k && (k.subClass as string))}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* CA + classement */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Chiffre d&apos;affaires réseau</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">18 291 000 FCFA • évolution journalière</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs font-semibold text-muted-foreground"
              onClick={() => toast.info("Rapport financier", { description: "Septembre 2026 • toutes agences." })}
            >
              Rapport financier <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <div className="mt-4 flex h-44 items-end gap-1.5">
            {CA_BARS.map((v, i) => (
              <div
                key={i}
                title={`${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12][i]} sept.`}
                className={cn("min-w-0 flex-1 rounded-sm", i === CA_BARS.length - 1 ? "bg-secondary" : "bg-emerald-500")}
                style={{ height: `${v}%` }}
              />
            ))}
          </div>
          <div className="mt-1 flex gap-1.5">
            {CA_BARS.map((_, i) => (
              <span key={i} className="min-w-0 flex-1 text-center text-[10px] text-muted-foreground">
                {[0, 2, 4, 6, 8, 10].includes(i) ? `${[1, 3, 5, 7, 9, 11][[0, 2, 4, 6, 8, 10].indexOf(i)]} sept.` : ""}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Classement des agences</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">CA cumulé et tendance</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs font-semibold text-muted-foreground"
              onClick={() => toast.info("Drill-down", { description: "Détail par agence et par semaine." })}
            >
              Drill-down <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <div className="mt-4 space-y-4">
            {AGENCES.map((a, i) => (
              <button key={a.slug} type="button" onClick={() => updatePath(`/multi-agences/${a.slug}`)} className="block w-full text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold">{i + 1}</span>
                    {a.nom}
                  </span>
                  <span className="text-right">
                    <span className="block font-bold">{a.ca}</span>
                    <span className={cn("block text-[11px] font-bold", a.caDelta.startsWith("−") ? "text-red-500" : "text-emerald-600")}>
                      {a.caDelta}
                    </span>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", i === 2 ? "bg-secondary" : i === 3 ? "bg-slate-300" : "bg-emerald-600")}
                    style={{ width: `${a.objectif}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comparaison + alertes */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Comparaison inter-agences</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Activité, recouvrement et objectifs</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs font-semibold text-muted-foreground"
              onClick={() => toast.info("Analyse", { description: "Comparaison détaillée des 4 agences." })}
            >
              Ouvrir l&apos;analyse <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] font-bold tracking-wide text-muted-foreground">
                  <th className="pb-2">AGENCE</th>
                  <th className="pb-2">DÉPÔTS</th>
                  <th className="pb-2">RETRAITS</th>
                  <th className="pb-2">IMPAYÉS</th>
                  <th className="pb-2">OBJECTIF MENSUEL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {AGENCES.map((a) => (
                  <tr key={a.slug}>
                    <td className="py-2.5 font-bold">{a.nom}</td>
                    <td className="py-2.5 text-muted-foreground">{a.depots}</td>
                    <td className="py-2.5 text-muted-foreground">{a.retraits}</td>
                    <td className={cn("py-2.5 font-semibold", a.slug === "marcory" && "text-red-500")}>{a.impayes}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn("h-full rounded-full", a.objectif >= 85 ? "bg-emerald-500" : a.objectif >= 75 ? "bg-secondary" : "bg-red-400")}
                            style={{ width: `${a.objectif}%` }}
                          />
                        </div>
                        <span className="font-bold">{a.objectif} %</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="text-sm font-bold">Alertes opérationnelles</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">5 éléments à traiter</p>
          <div className="mt-3 space-y-2.5">
            {alertes.map(([title, sub, tone]) => (
              <div key={title} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    tone === "red" && "bg-red-50 text-red-500",
                    tone === "amber" && "bg-amber-50 text-amber-600",
                    tone === "emerald" && "bg-emerald-50 text-emerald-600",
                    tone === "muted" && "bg-muted text-muted-foreground",
                  )}
                >
                  {tone === "red" ? <TriangleAlert className="size-4" /> : tone === "amber" ? <Bell className="size-4" /> : tone === "emerald" ? <CheckCircle2 className="size-4" /> : <RefreshCw className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">{title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{sub}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto shrink-0 p-0 text-[11px] font-bold"
                  onClick={() => toast.info(title, { description: sub })}
                >
                  Voir →
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Réseau */}
      <div className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold">Réseau d&apos;agences</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Abidjan • état de service en temps réel</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs font-semibold text-muted-foreground"
            onClick={() => toast.info("Gestion", { description: "Ajoutez ou configurez une agence." })}
          >
            Gérer les agences <ArrowUpRight className="size-3.5" />
          </Button>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {AGENCES.map((a) => (
            <button
              key={a.slug}
              type="button"
              onClick={() => updatePath(`/multi-agences/${a.slug}`)}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors hover:border-primary",
                a.slug === "bingerville" ? "border-emerald-300 bg-emerald-50/40" : "border-border",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">{a.adresse}</p>
                <Badge variant="outline" className="gap-1 border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  En ligne
                </Badge>
              </div>
              <p className="mt-1 text-[13px] font-extrabold">{a.nom}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {a.depots} dépôts • objectif {a.objectif} %
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Lien discret vers les écrans restants */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
        <Scale className="size-4 shrink-0" />
        <p className="flex-1">Écrans restants du sidebar : Rapports, Équipe & rôles, Paramètres, Audit & logs.</p>
      </div>
    </div>
  );
}
