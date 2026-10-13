"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  Clock,
  History,
  Phone,
  RefreshCw,
  Target,
  Wallet,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Agence } from "../data";

const PERF_BARS = [55, 62, 58, 70, 66, 74, 60, 68, 72, 78, 84, 100];

export default function AgenceView({ agence }: { agence: Agence }) {
  const router = useRouter();
  const { updatePath } = useGlobalData();

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Retour aux agences"
          onClick={() => router.back()}
          className="mt-1 bg-primary text-white hover:bg-primary/90 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">{agence.nom}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Agence {agence.code} • {agence.adresse} • ouverte aujourd&apos;hui de 08:00 à 19:00
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.success("Appel lancé", { description: `Agence ${agence.nom} • POS-01.` })}
          >
            <Phone className="size-3.5" />
            Contacter
          </Button>
          <Button
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.info("Gestion", { description: `Paramètres de l'agence ${agence.nom}.` })}
          >
            Gérer l&apos;agence
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Chiffre d'affaires", value: agence.ca, sub: `${agence.caDelta} • 2e du réseau`, icon: Banknote, iconBg: "bg-stone-100 text-stone-500" },
          { label: "Caisse aujourd'hui", value: agence.caisse, sub: "Écart 0 FCFA", icon: Wallet, iconBg: "bg-stone-100 text-stone-500" },
          { label: "Dépôts / retraits", value: `${agence.depots} / ${agence.retraits}`, sub: agence.tauxRetrait, subClass: "text-amber-600", icon: RefreshCw, iconBg: "bg-amber-50 text-amber-600" },
          { label: "Objectif mensuel", value: `${agence.objectif} %`, sub: agence.objectifReste, subClass: "text-sky-600", icon: Target, iconBg: "bg-sky-50 text-sky-600" },
        ].map((k) => (
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

      {/* Perf + comparaison */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Performance financière</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Septembre 2026 • progression cumulée</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs font-semibold text-muted-foreground"
              onClick={() => toast.info("Transactions", { description: `Journal de l'agence ${agence.nom}.` })}
            >
              Voir les transactions <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <div className="mt-4 flex h-40 items-end gap-1.5">
            {PERF_BARS.map((v, i) => (
              <div
                key={i}
                className={cn("min-w-0 flex-1 rounded-sm", i === PERF_BARS.length - 1 ? "bg-secondary" : "bg-emerald-500")}
                style={{ height: `${v}%` }}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>1 sept.</span><span>3 sept.</span><span>5 sept.</span><span>7 sept.</span><span>9 sept.</span><span>11 sept.</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="text-sm font-bold">Comparaison au réseau</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Rang et écarts clés</p>
          <div className="mt-3 divide-y divide-border text-xs">
            {[
              ["Chiffre d'affaires", "+8,6 %", ""],
              ["Panier moyen", agence.panier, ""],
              ["Impayés", agence.impayesPct, ""],
              ["Retards atelier", agence.retardsPct, "text-red-500"],
              ["Satisfaction", agence.satisfaction, ""],
            ].map(([label, v, cls]) => (
              <div key={label as string} className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">{label}</span>
                <span className={cn("font-bold", cls as string)}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Atelier + fidélité */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Activité atelier</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{agence.atelierTotal}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs font-semibold text-muted-foreground"
              onClick={() => updatePath("/atelier")}
            >
              Ouvrir l&apos;atelier <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {agence.atelier.map((s, i) => (
              <div key={s.label} className={cn("rounded-xl p-3", i % 2 === 0 ? "bg-slate-100" : "bg-sky-50")}>
                <p className="text-lg font-extrabold">{s.value}</p>
                <p className="text-xs font-bold">{s.label}</p>
                <p className="text-[11px] text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs ring-1 ring-amber-100">
            <Clock className="size-4 shrink-0 text-amber-600" />
            <p className="flex-1 text-amber-900">
              <span className="font-bold">6 commandes approchent leur délai promis</span>
              <span className="text-amber-700"> • 2 retards à prioriser</span>
            </p>
            <Button variant="ghost" size="sm" className="h-auto p-0 text-[11px] font-bold text-amber-700" onClick={() => updatePath("/atelier")}>
              Traiter →
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="text-sm font-bold">Clients & fidélité</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Portefeuille {agence.nom}</p>
          <div className="mt-3 divide-y divide-border text-xs">
            {[
              ["Clients actifs", agence.clientsActifs],
              ["Membres fidélité", agence.membresFidelite],
              ["Points attribués", agence.points],
              ["Nouveaux VIP", agence.nouveauxVip],
            ].map(([label, v]) => (
              <div key={label as string} className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-bold">{v}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Répartition fidélité</p>
          <div className="mt-1 flex h-1.5 overflow-hidden rounded-full">
            <div className="bg-slate-300" style={{ width: `${agence.repartition[0]}%` }} />
            <div className="bg-emerald-500" style={{ width: `${agence.repartition[1]}%` }} />
            <div className="bg-secondary" style={{ width: `${agence.repartition[2]}%` }} />
          </div>
        </div>
      </div>

      {/* Retards + équipe */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Retards & impayés</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{agence.impayes} à recouvrer • 14 dépôts</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs font-semibold text-muted-foreground"
              onClick={() => toast.success("Plan de relance", { description: "SMS + appels programmés sur 7 jours." })}
            >
              Plan de relance <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-amber-50/60 p-3 ring-1 ring-amber-100">
              <p className="text-[11px] font-bold text-amber-700">Retards atelier</p>
              <p className="text-lg font-extrabold">{agence.retards.length} dépôts</p>
              <p className="text-[11px] text-muted-foreground">{agence.retardsNote}</p>
            </div>
            <div className="rounded-xl bg-red-50/60 p-3 ring-1 ring-red-100">
              <p className="text-[11px] font-bold text-red-600">Impayés à relancer</p>
              <p className="text-lg font-extrabold">{agence.impayesClients}</p>
              <p className="text-[11px] text-muted-foreground">{agence.impayesNote}</p>
            </div>
          </div>
          <div className="mt-3 divide-y divide-border">
            {agence.retards.map((r) => (
              <div key={r.code} className="flex items-center gap-2 py-2 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{r.code}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{r.client}</p>
                </div>
                <Badge variant="outline" className="shrink-0 border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700">
                  {r.duree}
                </Badge>
                <span className="w-20 shrink-0 text-right font-bold">{r.montant}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Équipe</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{agence.equipe.length} membres • 6 présents</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs font-semibold text-muted-foreground"
              onClick={() => toast.info("Planning", { description: `Semaine de l'équipe ${agence.nom}.` })}
            >
              Planning <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <div className="mt-3 space-y-2.5">
            {agence.equipe.map((m) => (
              <div key={m.nom} className="flex items-center gap-2.5">
                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold", m.bg)}>
                  {m.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">{m.nom}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{m.role}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 border-0 text-[10px] font-bold",
                    m.statut === "Présent" ? "bg-muted text-foreground" : "bg-amber-100 text-amber-700",
                  )}
                >
                  {m.statut}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historique + synchro */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Historique récent</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Activité de gestion et événements majeurs</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs font-semibold text-muted-foreground"
              onClick={() => toast.info("Historique", { description: `Journal complet de ${agence.nom}.` })}
            >
              Tout l&apos;historique <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <div className="mt-3">
            {agence.historique.map((h, i) => (
              <div key={i} className="relative flex gap-2.5 pb-3 last:pb-0">
                {i < agence.historique.length - 1 && <span className="absolute top-4 left-[3px] h-[calc(100%-0.75rem)] w-px bg-border" />}
                <span className="z-10 mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                <p className="w-10 shrink-0 text-[11px] text-muted-foreground">{h.heure}</p>
                <div className="min-w-0">
                  <p className="text-xs font-bold">{h.title}</p>
                  <p className="text-[11px] text-muted-foreground">{h.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="text-sm font-bold">Synchronisation</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Continuité de service</p>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50/60 p-2.5 ring-1 ring-emerald-100">
            <Wifi className="size-4 shrink-0 text-emerald-600" />
            <div className="min-w-0 flex-1 text-[11px]">
              <p className="font-bold text-emerald-800">En ligne • synchronisée</p>
              <p className="text-emerald-700">Dernière synchro à 10:42:08</p>
            </div>
            <History className="size-3.5 shrink-0 text-muted-foreground" />
          </div>
          <div className="mt-3 space-y-1.5 text-xs">
            {[
              ["Disponibilité 30 jours", "99,8 %"],
              ["Opérations en attente", "0"],
              ["Dernier test hors ligne", "Réussi"],
            ].map(([label, v]) => (
              <p key={label as string} className="flex justify-between">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-bold">{v}</span>
              </p>
            ))}
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0" />
            Aujourd&apos;hui • 08:02
          </p>
        </div>
      </div>
    </div>
  );
}
