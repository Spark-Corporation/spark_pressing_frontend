"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Building,
  Clock,
  Download,
  Eye,
  Headphones,
  Heart,
  RefreshCw,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const auditLogs = [
  { action: "Tarif modifié", actor: "Nadie Assi", role: "Manager", agency: "SPARK CI / Cocody", ressource: "COS-002", date: "28 sept. • 10:42", ip: "196.201.82.14", result: "Succès" },
  { action: "Caisse clôturée", actor: "Koffi Mensah", role: "Caissier", agency: "SPARK CI / Cocody", ressource: "CS-1842", date: "28 sept. • 10:31", ip: "196.201.82.51", result: "Succès" },
  { action: "Connexion refusée", actor: "Mariam Traoré", role: "Représentant", agency: "SPARK CI / Plateau", ressource: "Compte", date: "28 sept. • 09:58", ip: "154.72.164.8", result: "Échec" },
  { action: "Paiement annulé", actor: "Awa Koné", role: "Admin", agency: "SPARK CI / Marcory", ressource: "PAY-728184", date: "28 sept. • 09:44", ip: "41.202.124.92", result: "Succès" },
  { action: "Dépôt renuméroté", actor: "Système", role: "Service sync", agency: "SPARK CI / Cocody", ressource: "DEP-COC-0929", date: "28 sept. • 09:16", ip: "10.24.8.3", result: "Succès" },
];

const agences = [
  { name: "Cocody", users: 24, health: "Sain" },
  { name: "Plateau", users: 14, health: "Sain" },
  { name: "Marcory", users: 12, health: "Dégradé" },
  { name: "Bingerville", users: 8, health: "Sain" },
];

const vestiaires = [
  { tranches: "30–60 jours", badge: "Relance client", badgeColor: "bg-amber-50 text-amber-700", depot: 18, pieces: 42, valeur: "1 240 000 FCFA", decision: "relance client par SMS et e-mail" },
  { tranches: "61–90 jours", badge: "Frais de garde", badgeColor: "bg-blue-50 text-blue-600", depot: 9, pieces: 21, valeur: "840 000 FCFA", decision: "appliquer frais de garde et relancer le client" },
  { tranches: "90+ jours", badge: "Escalade", badgeColor: "bg-red-50 text-red-600", depot: 7, pieces: 14, valeur: "1 280 000 FCFA", decision: "escalade vers le manager et archivage sécurisé" },
];

export default function SuperAdminPressingDetailPage() {
  const { updatePath } = useGlobalData();
  const [tab, setTab] = useState("apercu");

  return (
    <div className="space-y-5">
      {/* Titre + actions */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            className="mt-1 bg-primary text-white hover:bg-primary/80"
            onClick={() => updatePath("/superadmin/pressings")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              Superadmin détail pressing et audit
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
            <Headphones className="size-3.5" />
            Support
          </Button>
          <Button size="sm" className="gap-1.5 text-xs font-semibold">
            Actions
          </Button>
        </div>
      </div>

      <p className="text-[13px] text-muted-foreground">
        Organisation, licence, configuration, santé technique et traçabilité du tenant.
      </p>

      {/* Carte tenant */}
      <div className="rounded-xl border border-border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-[13px] font-extrabold text-white">
              SP
            </span>
            <div>
              <h2 className="text-base font-extrabold">SPARK PRESSING Côte d&apos;Ivoire</h2>
              <p className="text-[11px] text-muted-foreground">
                ep-ci-001 • Abidjan • Créé le 6 janvier 2024
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-transparent bg-amber-50 text-[10px] font-semibold text-amber-700">
              Business
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              Awa Koné · admin@sparkpressing.ci
            </span>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="mt-4">
          <TabsList variant="line" className="w-full justify-start border-b border-border">
            <TabsTrigger value="apercu">Vue d&apos;ensemble</TabsTrigger>
            <TabsTrigger value="agences">Agences (4)</TabsTrigger>
            <TabsTrigger value="utilisateurs">Utilisateurs (58)</TabsTrigger>
            <TabsTrigger value="licence">Licence</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="audit">Audit & logs</TabsTrigger>
          </TabsList>

          {/* ── Vue d&apos;ensemble ── */}
          <TabsContent value="apercu" className="mt-4 space-y-5">
            {/* KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Agences actives", value: "4", sub: "Toutes opérationnelles", icon: Building, iconBg: "bg-emerald-50 text-emerald-600" },
                { label: "Utilisateurs", value: "58", sub: "42 actifs sur 30 jours", icon: Users, iconBg: "bg-blue-50 text-blue-600" },
                { label: "Licence", value: "94 jours", sub: "Expire le 31 déc. 2026", icon: Clock, iconBg: "bg-amber-50 text-amber-600" },
                { label: "Santé tenant", value: "98,7%", sub: "1 incident mineur", icon: Heart, iconBg: "bg-red-50 text-red-500" },
              ].map((k) => (
                <div key={k.label} className="rounded-xl border border-border bg-white p-4">
                  <div className="flex items-start justify-between">
                    <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
                    <span className={cn("flex size-8 items-center justify-center rounded-lg", k.iconBg)}>
                      <k.icon className="size-4" />
                    </span>
                  </div>
                  <p className="mt-2 text-xl font-extrabold">{k.value}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{k.sub}</p>
                </div>
              ))}
            </div>

            {/* Indicateurs + Agences + Utilisateurs + Licence */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
              {/* Indicateurs financiers */}
              <div className="rounded-xl border border-border bg-white p-4">
                <h3 className="text-[13px] font-bold">Indicateurs financiers</h3>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Vue synthétique des flux et des restes à payer</p>
                <div className="mt-3 space-y-2.5">
                  {[
                    { label: "Dépôts", count: "128", amount: "12 480 000 FCFA" },
                    { label: "Retraits", count: "94", amount: "9 120 000 FCFA" },
                    { label: "Reste à payer", count: "34 dépôts", amount: "3 360 000 FCFA", bold: true },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className="flex items-center gap-2">
                        <span className={cn("font-bold", r.bold && "text-primary")}>{r.count}</span>
                        <span className="text-muted-foreground">{r.amount}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agences */}
              <div className="rounded-xl border border-border bg-white p-4">
                <h3 className="text-[13px] font-bold">Agences</h3>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Isolation contrôlée</p>
                <div className="mt-3 space-y-2.5">
                  {agences.map((a) => (
                    <div key={a.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <Building className="size-3.5 text-muted-foreground" />
                        {a.name} • {a.users} users
                      </span>
                      <Badge variant="outline" className={cn("border-0 text-[10px] font-semibold", a.health === "Sain" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
                        {a.health}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Utilisateurs transverses */}
              <div className="rounded-xl border border-border bg-white p-4">
                <h3 className="text-[13px] font-bold">Utilisateurs transverses</h3>
                <p className="mt-0.5 text-[10px] text-muted-foreground">7 comptes multi-agences</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[
                    { initials: "AK", role: "Admin", count: 4 },
                    { initials: "NA", role: "Manager", count: 3 },
                    { initials: "EB", role: "Manager", count: 2 },
                    { initials: "MT", role: "Manager", count: 2 },
                  ].map((u) => (
                    <div key={u.initials} className="flex items-center gap-2">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[9px] font-bold text-stone-600">
                        {u.initials}
                      </span>
                      <span className="text-[11px]">
                        <span className="block font-medium">{u.role}</span>
                        <span className="text-muted-foreground">+ {u.count}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Licence Business */}
              <div className="rounded-xl border border-border bg-white p-4">
                <h3 className="text-[13px] font-bold">Licence Business</h3>
                <p className="mt-0.5 text-[10px] text-muted-foreground">1 jan. – 31 déc. 2026</p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Période consommée</span>
                    <span className="font-bold">74%</span>
                  </div>
                  <Progress value={74} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground">4/6 agences • 58/100 users • 2,8/5 Go</p>
                  <div className="flex gap-1.5">
                    <div className="h-6 flex-1 rounded bg-primary" />
                    <div className="h-6 flex-1 rounded bg-[#c4b45a]" />
                    <div className="h-6 flex-1 rounded bg-emerald-500" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">app.sparkpressing.ci</p>
                </div>
              </div>
            </div>

            {/* Configuration + Santé + Isolation */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Configuration tenant */}
              <div className="rounded-xl border border-border bg-white p-4">
                <h3 className="text-[13px] font-bold">Configuration tenant</h3>
                <div className="mt-3 space-y-3">
                  {[
                    { label: "Devise", value: "FCFA • fr-CI" },
                    { label: "Fuseau", value: "Afrique/Abidjan" },
                    { label: "Numérotation", value: "DEP-(AGENCE)-(SEQ)" },
                    { label: "Offline", value: "Activé • 7 jours" },
                  ].map((c) => (
                    <div key={c.label} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{c.label}</span>
                      <span className="font-medium">{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Santé technique */}
              <div className="rounded-xl border border-border bg-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-bold">Santé technique</h3>
                  <Badge variant="outline" className="border-transparent bg-emerald-50 text-[10px] font-semibold text-emerald-700">
                    Sain
                  </Badge>
                </div>
                <div className="mt-3 space-y-3">
                  {[
                    { label: "API", value: 100, color: "bg-emerald-500" },
                    { label: "Sync", value: 99, color: "bg-emerald-500" },
                    { label: "Impression", value: 96, color: "bg-amber-500" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="font-bold">{s.value}%</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                        <div className={cn("h-full rounded-full", s.color)} style={{ width: `${s.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Isolation tenant */}
              <div className="rounded-xl bg-primary p-4 text-white">
                <Shield className="size-5 text-white/70" />
                <h3 className="mt-2 text-[13px] font-bold">Isolation tenant vérifiée</h3>
                <p className="mt-1 text-[11px] text-white/70">
                  Base, stockage, secrets et clés isolés. Contrôlé 06:00.
                </p>
                <Badge variant="outline" className="mt-3 border-transparent bg-emerald-400/20 text-[10px] font-semibold text-emerald-300">
                  Conforme
                </Badge>
              </div>
            </div>

            {/* Vêtements classés */}
            <div className="rounded-xl border border-border bg-white p-5">
              <h3 className="text-sm font-bold">Vêtements classés en attente de retrait</h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Vue décisionnelle par tranche d&apos;âge pour relance, frais de garde et escalade
              </p>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                {vestiaires.map((v) => (
                  <div key={v.tranches} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{v.tranches}</span>
                      <Badge variant="outline" className={cn("border-0 text-[10px] font-semibold", v.badgeColor)}>
                        {v.badge}
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dépôts</span>
                        <span className="font-bold">{v.depot}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pièces</span>
                        <span className="font-bold">{v.pieces}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valeur</span>
                        <span className="font-bold">{v.valeur}</span>
                      </div>
                    </div>
                    <p className="mt-3 text-[10px] text-muted-foreground">
                      Décision recommandée : {v.decision}.
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Journal d&apos;audit */}
            <div className="rounded-xl border border-border bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold">Journal d&apos;audit</h3>
                  <p className="text-[11px] text-muted-foreground">Actions, impressions et synchronisations</p>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                  <Download className="size-3.5" />
                  Exporter CSV / PDF
                </Button>
              </div>

              <Tabs defaultValue="toutes" className="mt-3">
                <TabsList variant="line" className="border-b border-border">
                  <TabsTrigger value="toutes">Toutes les actions</TabsTrigger>
                  <TabsTrigger value="securite">Sécurité</TabsTrigger>
                  <TabsTrigger value="impressions">Impressions</TabsTrigger>
                  <TabsTrigger value="sync">Synchronisation offline</TabsTrigger>
                  <TabsTrigger value="config">Configuration</TabsTrigger>
                </TabsList>

                <TabsContent value="toutes" className="mt-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative min-w-[200px] flex-1">
                      <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Action, acteur, ressource ou IP…"
                        className="h-8 bg-muted/40 pl-9 text-xs"
                      />
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">Toutes les agences</Button>
                    <Button variant="outline" size="sm" className="text-xs">Tous les résultats</Button>
                    <Button variant="outline" size="sm" className="text-xs">28 sept. 2026</Button>
                  </div>

                  <div className="mt-3 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-[10px] font-bold text-muted-foreground">ACTION</TableHead>
                          <TableHead className="text-[10px] font-bold text-muted-foreground">ACTEUR / RÔLE</TableHead>
                          <TableHead className="text-[10px] font-bold text-muted-foreground">PRESSING / AGENCE</TableHead>
                          <TableHead className="text-[10px] font-bold text-muted-foreground">RESSOURCE</TableHead>
                          <TableHead className="text-[10px] font-bold text-muted-foreground">DATE</TableHead>
                          <TableHead className="text-[10px] font-bold text-muted-foreground">ADRESSE IP</TableHead>
                          <TableHead className="text-[10px] font-bold text-muted-foreground">RÉSULTAT</TableHead>
                          <TableHead className="text-[10px] font-bold text-muted-foreground">DÉTAILS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditLogs.map((log, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-xs font-medium">{log.action}</TableCell>
                            <TableCell className="text-xs">
                              <span className="block">{log.actor}</span>
                              <span className="block text-[10px] text-muted-foreground">{log.role}</span>
                            </TableCell>
                            <TableCell className="text-xs">
                              <span className="block">{log.agency.split(" / ")[0]}</span>
                              <span className="block text-[10px] text-muted-foreground">{log.agency.split(" / ")[1]}</span>
                            </TableCell>
                            <TableCell className="text-xs">{log.ressource}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{log.date}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{log.ip}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn("border-0 text-[10px] font-semibold", log.result === "Succès" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600")}>
                                {log.result}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="xs" className="gap-1">
                                <Eye className="size-3" />
                                Voir
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>5 résultats</span>
                      <span>‹ 1 2 3 ›</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="securite">
                  <p className="py-6 text-center text-[13px] text-muted-foreground">Aucune action de sécurité sur la période.</p>
                </TabsContent>
                <TabsContent value="impressions">
                  <p className="py-6 text-center text-[13px] text-muted-foreground">Aucune impression sur la période.</p>
                </TabsContent>
                <TabsContent value="sync">
                  <p className="py-6 text-center text-[13px] text-muted-foreground">Aucune synchronisation offline sur la période.</p>
                </TabsContent>
                <TabsContent value="config">
                  <p className="py-6 text-center text-[13px] text-muted-foreground">Aucune modification de configuration.</p>
                </TabsContent>
              </Tabs>
            </div>

            {/* Logs impression + Sync offline */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[13px] font-bold">Logs d&apos;impression</h3>
                    <p className="text-[10px] text-muted-foreground">52 aujourd&apos;hui</p>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  {[
                    { name: "Reçu DEP-COC-0029", meta: "CAISSE-03 • 10:45", status: "En attente", color: "bg-amber-50 text-amber-700" },
                    { name: "Ticket #88192", meta: "ATELIER-02 • 10:41", status: "Imprimé", color: "bg-emerald-50 text-emerald-700" },
                  ].map((l) => (
                    <div key={l.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Download className="size-3.5 text-muted-foreground" />
                        <div>
                          <span className="block font-medium">{l.name}</span>
                          <span className="block text-[10px] text-muted-foreground">{l.meta}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn("border-0 text-[10px] font-semibold", l.color)}>
                        {l.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[13px] font-bold">Synchronisation offline</h3>
                    <p className="text-[10px] text-muted-foreground">1 542 aujourd&apos;hui</p>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  {[
                    { name: "DEP-COC-0929", meta: "Renuméroté DEP-COC-0931", status: "Résolu", color: "bg-emerald-50 text-emerald-700" },
                    { name: "PAY-728184", meta: "Envoyé en 942 ms", status: "Succès", color: "bg-emerald-50 text-emerald-700" },
                  ].map((l) => (
                    <div key={l.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="size-3.5 text-muted-foreground" />
                        <div>
                          <span className="block font-medium">{l.name}</span>
                          <span className="block text-[10px] text-muted-foreground">{l.meta}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn("border-0 text-[10px] font-semibold", l.color)}>
                        {l.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rétention */}
            <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
              <Shield className="size-4 shrink-0 text-blue-500" />
              <div>
                <p className="text-xs font-bold text-blue-800">Rétention et intégrité</p>
                <p className="text-[11px] text-blue-600">Audit conservé 24 mois, signé et non modifiable.</p>
              </div>
            </div>
          </TabsContent>

          {/* ── Autres onglets ── */}
          <TabsContent value="agences" className="mt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {agences.map((a) => (
                <div key={a.name} className="rounded-xl border border-border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[13px] font-bold">{a.name}</h3>
                    <Badge variant="outline" className={cn("border-0 text-[10px] font-semibold", a.health === "Sain" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
                      {a.health}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{a.users} utilisateurs</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="utilisateurs" className="mt-4">
            <p className="py-6 text-center text-[13px] text-muted-foreground">
              58 utilisateurs — 42 actifs sur 30 jours.
            </p>
          </TabsContent>

          <TabsContent value="licence" className="mt-4">
            <div className="rounded-xl border border-border bg-white p-5">
              <h3 className="text-sm font-bold">Licence Business</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">1 jan. – 31 déc. 2026 • 94 jours restants</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Période consommée</span>
                  <span className="font-bold">74%</span>
                </div>
                <Progress value={74} className="h-2" />
                <p className="text-[11px] text-muted-foreground">4/6 agences • 58/100 users • 2,8/5 Go</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="configuration" className="mt-4">
            <div className="rounded-xl border border-border bg-white p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  { label: "Devise", value: "FCFA • fr-CI" },
                  { label: "Fuseau", value: "Afrique/Abidjan" },
                  { label: "Numérotation", value: "DEP-(AGENCE)-(SEQ)" },
                  { label: "Offline", value: "Activé • 7 jours" },
                ].map((c) => (
                  <div key={c.label} className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-xs">
                    <span className="text-muted-foreground">{c.label}</span>
                    <span className="font-medium">{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            <div className="rounded-xl border border-border bg-white p-5">
              <h3 className="text-sm font-bold">Journal d&apos;audit complet</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Consultez toutes les actions enregistrées pour ce tenant.
              </p>
              <Button variant="outline" size="sm" className="mt-3 gap-1.5 text-xs font-semibold">
                <Download className="size-3.5" />
                Exporter CSV / PDF
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
