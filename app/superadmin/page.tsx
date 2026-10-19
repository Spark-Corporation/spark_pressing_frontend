"use client";

import { AlertCircle, ArrowUpRight, Building, CheckCircle2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AppIcon } from "@/components/ui/app-icon";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-extrabold">{value}</p>
          {subtitle && <p className="mt-1 text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 p-1">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </div>
      {trend && (
        <p className="mt-2 text-[10px] font-medium text-emerald-600">{trend}</p>
      )}
    </div>
  );
}

const licenseData = [
  { label: "Actives", value: "+ 36", pct: 88, color: "bg-emerald-500/10 text-emerald-600" },
  { label: "À renouveler < 30", value: "+ 4", pct: 54, color: "bg-amber-500/10 text-amber-600" },
  { label: "Suspendues", value: "+ 2", pct: 22, color: "bg-rose-500/10 text-rose-600" },
];

const healthData = [
  { label: "API", status: "Sain", color: "text-emerald-600 bg-emerald-500/10" },
  { label: "SYNC", status: "Sain", color: "text-emerald-600 bg-emerald-500/10" },
  { label: "PRINT", status: "Dégradé", color: "text-amber-600 bg-amber-500/10" },
];

const pressingData = [
  {
    code: "SPARK PRESSING CI",
    city: "Côte d'Ivoire",
    plan: "Business",
    licence: "01 jan. - 31 déc. 2026",
    usage: "4 agences • 58 users",
    activity: "Il y a 2 min",
    health: "Sain",
    statut: "Actif",
    action: "Ouvrir",
  },
  {
    code: "Blanc Premium",
    city: "Sénégal",
    plan: "Enterprise",
    licence: "15 mars 2026 - 2027",
    usage: "8 agences • 124 users",
    activity: "Il y a 35 sec",
    health: "Sain",
    statut: "Actif",
    action: "Ouvrir",
  },
  {
    code: "Net Plus Dakar",
    city: "Sénégal",
    plan: "Growth",
    licence: "01 juin - 30 nov. 2026",
    usage: "6 agences • 93 users",
    activity: "Il y a 18 min",
    health: "Dégradé",
    statut: "Actif",
    action: "Ouvrir",
  },
  {
    code: "Orchid Clean",
    city: "Cameroun",
    plan: "Business",
    licence: "12 févr. 2026 - 2027",
    usage: "5 agences • 67 users",
    activity: "Il y a 4 min",
    health: "Sain",
    statut: "Actif",
    action: "Ouvrir",
  },
  {
    code: "Luxe Press",
    city: "Bénin",
    plan: "Starter",
    licence: "01 août - 31 oct. 2026",
    usage: "1 agence • 9 users",
    activity: "Hors ligne 3 h",
    health: "Incident",
    statut: "À renouveler",
    action: "Ouvrir",
  },
  {
    code: "Kora Cleaning",
    city: "Mali",
    plan: "Growth",
    licence: "20 avril 2026 - 2027",
    usage: "2 agences • 24 users",
    activity: "Il y a 7 min",
    health: "Sain",
    statut: "Suspendu",
    action: "Ouvrir",
  },
];

const incidentData = [
  {
    title: "Luxe Press",
    desc: "Sync indisponible depuis 3 h",
    priority: "P1",
    color: "bg-rose-100 text-rose-600",
  },
  {
    title: "Net Plus Dakar",
    desc: "Latence supérieure à 12 s",
    priority: "P2",
    color: "bg-amber-100 text-amber-600",
  },
  {
    title: "Orchid Clean",
    desc: "Échec sur 2 imprimantes",
    priority: "P3",
    color: "bg-blue-100 text-blue-600",
  },
];

export default function SuperAdminOverviewPage() {
  const activityData = [
    { day: "15", value: 74 },
    { day: "16", value: 86 },
    { day: "17", value: 91 },
    { day: "18", value: 102 },
    { day: "19", value: 97 },
    { day: "20", value: 118 },
    { day: "21", value: 126 },
    { day: "22", value: 112 },
    { day: "23", value: 131 },
    { day: "24", value: 143 },
    { day: "25", value: 136 },
    { day: "26", value: 151 },
    { day: "27", value: 145 },
    { day: "28", value: 195 },
  ];

  return (
    <div className="space-y-5">
      {/* Titre de page */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium text-muted-foreground">
            Pilotez la santé, les licences et l’activité de tous les pressings hébergés.
          </p>
        </div>
        <Button size="sm">
          <span className="flex items-center gap-1.5">
            <AppIcon name="plus" className="size-4" />
            Nouveau pressing
          </span>
        </Button>
      </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard
            label="Tenants actifs"
            value="42"
            icon={Building}
            trend="+3 ce trimestre"
          />
          <StatCard
            label="Agences"
            value="126"
            subtitle="Dans 7 jours"
            icon={Users}
          />
          <StatCard
            label="Utilisateurs"
            value="1 486"
            subtitle="812 actifs aujourd’hui"
            icon={Users}
          />
          <StatCard
            label="Incidents ouverts"
            value="4"
            icon={AlertCircle}
            trend="1 priorité élevée"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 mb-6">
          {/* Activité plateforme + État des licences */}
          <div className="lg:col-span-8">
            <div className="rounded-xl border border-border bg-white p-5 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold">Activité plateforme</h2>
                  <p className="text-[11px] text-muted-foreground">
                    Opérations synchronisées sur 14 jours
                  </p>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px]">
                  <CheckCircle2 className="mr-1 size-3" />
                  99,94% disponibilité
                </Badge>
              </div>
              <div className="h-48 w-full flex items-end gap-1 px-2 pt-2">
                {activityData.map((d, i) => {
                  const max = Math.max(...activityData.map((x) => x.value));
                  const pct = (d.value / max) * 100;
                  const isLast = i === activityData.length - 1;
                  return (
                    <div key={i} className="flex h-full w-full flex-col items-center">
                      <div className="flex w-full flex-1 flex-col justify-end">
                        <span className="mb-0.5 text-center text-[9px] font-medium text-muted-foreground">{d.value}k</span>
                        <div
                          className={cn(
                            "w-full rounded-t-[6px] transition-all",
                            isLast ? "bg-[#c4b45a]" : "bg-[#c4b45a]/30 hover:bg-[#c4b45a]/60",
                          )}
                          style={{ height: `${pct}%` }}
                        />
                      </div>
                      <span className="mt-1 text-[10px] text-muted-foreground">{d.day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-[11px] text-muted-foreground">
                2,84 M opérations • 0,06% d’échec • 84 ms de latence médiane
              </div>
            </div>

            {/* Pressings clients */}
            <div className="rounded-xl border border-border bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold">Pressings clients</h2>
                  <p className="text-[11px] text-muted-foreground">
                    42 tenants • 126 agences • données isolées
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="xs" variant="outline">
                    <AppIcon name="download" className="size-3.5" />
                    Exporter
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                <Button size="xs" variant="default" className="px-2">
                  Tous les pressings
                </Button>
                <Button size="xs" variant="outline" className="px-2">
                  Actifs (36)
                </Button>
                <Button size="xs" variant="outline" className="px-2">
                  À renouveler (4)
                </Button>
                <Button size="xs" variant="outline" className="px-2">
                  Suspendus (2)
                </Button>
                <Button size="xs" variant="outline" className="px-2">
                  Incidents
                </Button>
              </div>

              <div className="relative w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-[10px] font-medium text-muted-foreground">PRESSING / PAYS</TableHead>
                      <TableHead className="text-[10px] font-medium text-muted-foreground">PLAN</TableHead>
                      <TableHead className="text-[10px] font-medium text-muted-foreground">LICENCE / USAGE</TableHead>
                      <TableHead className="text-[10px] font-medium text-muted-foreground">ACTIVITÉ / SYNC</TableHead>
                      <TableHead className="text-[10px] font-medium text-muted-foreground">SANTÉ</TableHead>
                      <TableHead className="text-[10px] font-medium text-muted-foreground">STATUT</TableHead>
                      <TableHead className="text-[10px] font-medium text-muted-foreground text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pressingData.map((p, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                              {p.code.split(" ").map((w) => w[0]).join("")}
                            </span>
                            <div>
                              <span className="block text-xs font-semibold">{p.code}</span>
                              <span className="block text-[10px] text-muted-foreground">{p.city}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className="text-[10px] border-transparent bg-blue-50 text-blue-600">
                            {p.plan}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <span className="block">{p.licence}</span>
                          <span className="block text-[10px]">{p.usage}</span>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-2">
                            <Progress value={50} className="h-1 w-16 bg-[#94a3b8]" />
                            <span className="text-[10px]">{p.activity}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] border-transparent",
                              p.health === "Sain" ? "bg-emerald-50 text-emerald-600" : p.health === "Dégradé" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600",
                            )}
                          >
                            {p.health}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] border-transparent",
                              p.statut === "Actif" ? "bg-emerald-50 text-emerald-600" : p.statut === "À renouveler" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600",
                            )}
                          >
                            {p.statut}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          <Button size="xs" variant="outline" className="gap-1 px-2">
                            <ArrowUpRight className="size-3" />
                            {p.action}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-2 flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                  <span>6 résultats</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((pg) => (
                      <Button key={pg} size="xs" variant={pg === 1 ? "default" : "outline"} className="h-5 w-5 p-0">
                        {pg}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Incidents récents */}
            <div className="rounded-xl border border-border bg-white p-5 mt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold">Incidents récents</h2>
                  <p className="text-[11px] text-muted-foreground">
                    Attention de l’équipe plateforme
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {incidentData.map((inc, idx) => (
                  <div key={idx} className="rounded-lg border border-border bg-muted/50 p-3">
                    <div className="flex items-start justify-between mb-2">
                      <span className="block text-[10px] font-bold">{inc.title}</span>
                      <Badge variant="outline" className={cn("text-[9px]", inc.color)}>
                        {inc.priority}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{inc.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* État des licences + Santé technique */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-white p-4">
              <h2 className="text-sm font-bold mb-4">État des licences</h2>
              {licenseData.map((l, idx) => (
                <div key={idx} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium">{l.label}</span>
                    <span className="text-[11px] font-bold">{l.value}</span>
                  </div>
                  <Progress value={l.pct} className="h-1" />
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-white p-4">
              <h2 className="text-sm font-bold mb-4">Santé technique</h2>
              {healthData.map((h, idx) => (
                <div key={idx} className="flex items-center justify-between mb-3 last:mb-0">
                  <div>
                    <span className="block text-[11px] font-medium">{h.label}</span>
                    <span className="block text-[10px] text-muted-foreground">
                      {h.label === "API" ? "api.sparkpressing.com" : h.label === "SYNC" ? "sync.platform" : "print.queue"}
                    </span>
                  </div>
                  <span className={cn("text-[10px] font-bold", h.color)}>{h.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
    </div>
  );
}
