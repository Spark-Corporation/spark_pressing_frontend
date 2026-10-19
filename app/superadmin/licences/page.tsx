"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
  Plus,
  Search,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 6;
type Periode = "jour" | "semaine" | "mois";

interface LicenceRow {
  id: number;
  code: string;
  pressing: string;
  initials: string;
  country: string;
  plan: "Starter" | "Growth" | "Business" | "Enterprise";
  periodicite: "Mensuel" | "Trimestriel" | "Annuel";
  activation: string;
  expiration: string;
  reste: number;
  agences: string;
  users: string;
  usage: number;
  auto: "Activé" | "Désactivé";
  status: "Active" | "À renouveler" | "Suspendue";
  paiement: "Payé" | "À venir" | "Impayé";
}

const LICENCES: LicenceRow[] = [
  { id: 1, code: "LIC-CI-00184", pressing: "SPARK PRESSING CI", initials: "SP", country: "Côte d'Ivoire", plan: "Business", periodicite: "Annuel", activation: "01 jan. 2026", expiration: "31 déc. 2026", reste: 94, agences: "4 ag.", users: "58 users", usage: 74, auto: "Activé", status: "Active", paiement: "Payé" },
  { id: 2, code: "LIC-SN-00088", pressing: "Blanc Premium", initials: "BP", country: "Sénégal", plan: "Enterprise", periodicite: "Trimestriel", activation: "15 mars 2026", expiration: "15 déc. 2026", reste: 78, agences: "8 ag.", users: "124 users", usage: 82, auto: "Activé", status: "Active", paiement: "Payé" },
  { id: 3, code: "LIC-SN-00201", pressing: "Net Plus Dakar", initials: "NP", country: "Sénégal", plan: "Growth", periodicite: "Mensuel", activation: "01 sept. 2026", expiration: "30 oct. 2026", reste: 32, agences: "3 ag.", users: "36 users", usage: 91, auto: "Activé", status: "À renouveler", paiement: "À venir" },
  { id: 4, code: "LIC-CM-00156", pressing: "Orchid Clean", initials: "OC", country: "Cameroun", plan: "Business", periodicite: "Annuel", activation: "12 févr. 2026", expiration: "11 févr. 2027", reste: 136, agences: "5 ag.", users: "67 users", usage: 63, auto: "Activé", status: "Active", paiement: "Payé" },
  { id: 5, code: "LIC-BJ-00072", pressing: "Luxe Press", initials: "LP", country: "Bénin", plan: "Starter", periodicite: "Mensuel", activation: "01 août 2026", expiration: "31 oct. 2026", reste: 12, agences: "1 ag.", users: "9 users", usage: 60, auto: "Désactivé", status: "À renouveler", paiement: "Impayé" },
  { id: 6, code: "LIC-ML-00095", pressing: "Kora Cleaning", initials: "KC", country: "Mali", plan: "Growth", periodicite: "Annuel", activation: "20 avril 2026", expiration: "19 avril 2027", reste: 213, agences: "2 ag.", users: "24 users", usage: 48, auto: "Activé", status: "Suspendue", paiement: "Impayé" },
];

const planBadge: Record<LicenceRow["plan"], string> = {
  Starter: "bg-muted text-muted-foreground",
  Growth: "bg-slate-100 text-slate-600",
  Business: "bg-blue-50 text-blue-600",
  Enterprise: "bg-amber-50 text-amber-700",
};

const statusStyle: Record<LicenceRow["status"], { dot: string; bg: string }> = {
  Active: { dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700" },
  "À renouveler": { dot: "bg-amber-500", bg: "bg-amber-50 text-amber-700" },
  Suspendue: { dot: "bg-red-500", bg: "bg-red-50 text-red-600" },
};

const paiementStyle: Record<LicenceRow["paiement"], { dot: string; bg: string }> = {
  Payé: { dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700" },
  "À venir": { dot: "bg-amber-500", bg: "bg-amber-50 text-amber-700" },
  Impayé: { dot: "bg-red-500", bg: "bg-red-50 text-red-600" },
};

const kpis = [
  { label: "Licences actives", value: "36", sub: "85,7% du parc", subColor: "text-emerald-600", icon: Wallet, iconBg: "bg-emerald-50 text-emerald-600" },
  { label: "Expirant bientôt", value: "4", sub: "Sous 30 jours", subColor: "text-amber-600", icon: CalendarClock, iconBg: "bg-amber-50 text-amber-600" },
  { label: "Suspendues", value: "2", sub: "1 impayé critique", subColor: "text-red-500", icon: CalendarClock, iconBg: "bg-red-50 text-red-500" },
  { label: "Renouvellements", value: "12", sub: "Ce mois · +20%", subColor: "text-blue-600", icon: CalendarClock, iconBg: "bg-blue-50 text-blue-600" },
  { label: "Revenu licences", value: "4,86 M", sub: "FCFA · +8,4%", subColor: "text-blue-600", icon: Wallet, iconBg: "bg-blue-50 text-blue-600" },
];

export default function SuperAdminLicencesPage() {
  const { updatePath } = useGlobalData();
  const [search, setSearch] = useState("");
  const [periode, setPeriode] = useState<Periode>("mois");
  const [plan, setPlan] = useState("tous");
  const [pays, setPays] = useState("tous");
  const [pressing, setPressing] = useState("tous");
  const [statut, setStatut] = useState("tous");
  const [echeance, setEcheance] = useState("toutes");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return LICENCES.filter((l) => {
      if (plan !== "tous" && l.plan !== plan) return false;
      if (pays !== "tous" && l.country !== pays) return false;
      if (pressing !== "tous" && l.pressing !== pressing) return false;
      if (statut !== "tous" && l.status !== statut) return false;
      if (echeance === "30" && l.reste > 30) return false;
      if (echeance === "90" && l.reste > 90) return false;
      if (q && !`${l.pressing} ${l.code} ${l.country} ${l.plan}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, plan, pays, pressing, statut, echeance]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">Superadministration</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Centre des licences</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Pilotez les abonnements, les échéances, l&apos;usage et les revenus de tous les pressings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
            <Download className="size-3.5" />
            Exporter
          </Button>
          <Button size="sm" className="gap-1.5 text-xs font-bold">
            <Plus className="size-4" />
            Nouvelle licence
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
              <span className={cn("flex size-8 items-center justify-center rounded-lg", k.iconBg)}>
                <k.icon className="size-4" />
              </span>
            </div>
            <p className={cn("mt-2 text-2xl font-extrabold", k.label === "Suspendues" && "text-red-500")}>{k.value}</p>
            <p className={cn("mt-1 text-[11px] font-medium", k.subColor)}>{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pressing, pays, plan ou référence…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-9 bg-muted/40 pl-9 text-[13px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Tabs value={periode} onValueChange={(v) => setPeriode(v as Periode)}>
              <TabsList className="h-7">
                <TabsTrigger value="jour" className="px-3 text-[11px]">Jour</TabsTrigger>
                <TabsTrigger value="semaine" className="px-3 text-[11px]">Semaine</TabsTrigger>
                <TabsTrigger value="mois" className="px-3 text-[11px]">Mois</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Plan</label>
            <Select value={plan} onValueChange={(v) => { setPlan(v ?? "tous"); setPage(1); }}>
              <SelectTrigger className="h-9 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les plans</SelectItem>
                <SelectItem value="Starter">Starter</SelectItem>
                <SelectItem value="Growth">Growth</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Pays</label>
            <Select value={pays} onValueChange={(v) => { setPays(v ?? "tous"); setPage(1); }}>
              <SelectTrigger className="h-9 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les pays</SelectItem>
                <SelectItem value="Côte d'Ivoire">Côte d&apos;Ivoire</SelectItem>
                <SelectItem value="Sénégal">Sénégal</SelectItem>
                <SelectItem value="Cameroun">Cameroun</SelectItem>
                <SelectItem value="Bénin">Bénin</SelectItem>
                <SelectItem value="Mali">Mali</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Pressing</label>
            <Select value={pressing} onValueChange={(v) => { setPressing(v ?? "tous"); setPage(1); }}>
              <SelectTrigger className="h-9 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les pressings</SelectItem>
                {LICENCES.map((l) => (
                  <SelectItem key={l.id} value={l.pressing}>{l.pressing}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Statut</label>
            <Select value={statut} onValueChange={(v) => { setStatut(v ?? "tous"); setPage(1); }}>
              <SelectTrigger className="h-9 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="À renouveler">À renouveler</SelectItem>
                <SelectItem value="Suspendue">Suspendue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Échéance</label>
            <Select value={echeance} onValueChange={(v) => { setEcheance(v ?? "toutes"); setPage(1); }}>
              <SelectTrigger className="h-9 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toutes">Toutes les échéances</SelectItem>
                <SelectItem value="30">Sous 30 jours</SelectItem>
                <SelectItem value="90">Sous 90 jours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold">Licences multi-pressings</h2>
            <p className="text-[11px] text-muted-foreground">
              {LICENCES.length} licences · 5 pays · données mises à jour à 10:34
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground">Dernière synchro il y a 2 min</p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PRESSING</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PLAN</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PÉRIODICITÉ</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">ACTIVATION</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">EXPIRATION</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">RESTE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">AUTORISÉS</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">USAGE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">AUTO.</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">STATUT</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PAIEMENT</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
                        {l.initials}
                      </span>
                      <span>
                        <span className="block text-[13px] font-semibold">{l.pressing}</span>
                        <span className="block text-[11px] text-muted-foreground">{l.country}</span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("border-0 text-[10px] font-semibold", planBadge[l.plan])}>
                      {l.plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{l.periodicite}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{l.activation}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{l.expiration}</TableCell>
                  <TableCell className={cn("text-xs font-bold", l.reste < 30 ? "text-amber-600" : "")}>
                    {l.reste} j
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {l.agences} · {l.users}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[11px] font-bold", l.usage >= 90 ? "text-amber-600" : "text-emerald-600")}>
                        {l.usage}%
                      </span>
                      <Progress value={l.usage} className={cn("h-1 w-16", l.usage >= 90 ? "bg-amber-200" : "bg-emerald-200")} />
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-emerald-600">{l.auto}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("gap-1 border-0 text-[10px] font-semibold", statusStyle[l.status].bg)}>
                      <span className={cn("size-1.5 rounded-full", statusStyle[l.status].dot)} />
                      {l.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("gap-1 border-0 text-[10px] font-semibold", paiementStyle[l.paiement].bg)}>
                      <span className={cn("size-1.5 rounded-full", paiementStyle[l.paiement].dot)} />
                      {l.paiement}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Ouvrir ${l.pressing}`}
                        onClick={() => updatePath(`/superadmin/licences/${l.code}`)}
                      >
                        <ArrowUpRight className="size-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions pour ${l.pressing}`}>
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => updatePath(`/superadmin/licences/${l.code}`)}>
                            Détail et renouvellement
                          </DropdownMenuItem>
                          <DropdownMenuItem>Télécharger la facture</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive">Suspendre</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={12} className="py-10 text-center text-[13px] text-muted-foreground">
                    Aucune licence ne correspond à ces critères.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            {filtered.length === 0 ? "0" : `${start + 1}–${start + rows.length}`} sur {filtered.length} licences
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs font-semibold"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === safePage ? "default" : "ghost"}
                size="icon-sm"
                onClick={() => setPage(p)}
                className="text-[11px] font-bold"
              >
                {p}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs font-semibold"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-bold">Échéances à traiter</h2>
              <p className="text-[11px] text-muted-foreground">Priorités des 30 prochains jours</p>
            </div>
            <button className="text-xs font-bold text-primary hover:underline">Voir le calendrier</button>
          </div>
          <p className="mt-3 text-[13px] text-muted-foreground">
            Luxe Press expire dans 2 jours · Net Plus Dakar dans 32 jours · 2 renouvellements automatiques prêts.
          </p>
        </div>

        <div className="rounded-xl bg-primary p-5 text-white">
          <h2 className="text-sm font-bold">Prévision de revenu · Octobre 2026</h2>
          <p className="mt-2 text-3xl font-extrabold text-secondary">1 245 000 FCFA</p>
          <p className="mt-1 text-[11px] text-white/70">
            17 renouvellements attendus · 82% sécurisés par paiement automatique.
          </p>
        </div>
      </div>
    </div>
  );
}
