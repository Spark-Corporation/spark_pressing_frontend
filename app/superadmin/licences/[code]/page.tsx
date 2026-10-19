"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Building,
  CheckCircle2,
  Download,
  Paperclip,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PlanDuree = "mensuel" | "trimestriel" | "annuel";
type Moyen = "especes" | "carte" | "flooz" | "tmoney" | "momo";

const plans: { id: PlanDuree; label: string; price: string; sub: string; badge?: string }[] = [
  { id: "mensuel", label: "Mensuel", price: "15 000 FCFA", sub: "30 jours" },
  { id: "trimestriel", label: "Trimestriel", price: "40 000 FCFA", sub: "90 jours · −11%" },
  { id: "annuel", label: "Annuel", price: "150 000 FCFA", sub: "365 jours · 2 mois offerts", badge: "Recommandé" },
];

const moyens: { id: Moyen; label: string; icon: AppIconName }[] = [
  { id: "especes", label: "Espèces", icon: "cash" },
  { id: "carte", label: "Carte", icon: "card" },
  { id: "flooz", label: "Flooz", icon: "mobile-money" },
  { id: "tmoney", label: "T-Money", icon: "mobile-money" },
  { id: "momo", label: "Mobile Money", icon: "mobile-money" },
];

const agences = [
  { name: "Cocody", users: 24 },
  { name: "Plateau", users: 14 },
  { name: "Marcory", users: 12 },
  { name: "Bingerville", users: 8 },
];

const historique = [
  { date: "28 sept. 2026", periode: "Annuel · 2027", montant: "150 000 FCFA", moyen: "Espèces", ref: "TRX-2026-09-2841", facture: "FAC-2026-184", statut: "En attente" as const },
  { date: "02 jan. 2026", periode: "Annuel · 2026", montant: "150 000 FCFA", moyen: "Mobile Money", ref: "MM-4820184", facture: "FAC-2026-012", statut: "Payé" as const },
];

const statutStyle: Record<(typeof historique)[number]["statut"], { dot: string; bg: string }> = {
  "En attente": { dot: "bg-amber-500", bg: "bg-amber-50 text-amber-700" },
  Payé: { dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700" },
};

const priceByPlan: Record<PlanDuree, number> = { mensuel: 15000, trimestriel: 40000, annuel: 150000 };

export default function SuperAdminLicenceDetailPage() {
  const { updatePath } = useGlobalData();
  const [plan, setPlan] = useState<PlanDuree>("annuel");
  const [moyen, setMoyen] = useState<Moyen>("especes");
  const [auto, setAuto] = useState(true);
  const [saved, setSaved] = useState(false);

  const total = priceByPlan[plan];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            className="mt-1 bg-primary text-white hover:bg-primary/80"
            onClick={() => updatePath("/superadmin/licences")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">Superadministration</p>
            <h1 className="mt-1 text-xl font-extrabold tracking-tight sm:text-2xl">Détail et renouvellement</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              SPARK PRESSING Côte d&apos;Ivoire · plan Business · suivi financier et administratif.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
            <Download className="size-3.5" />
            Télécharger facture
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700">
            Suspendre
          </Button>
          <Button size="sm" className="gap-1.5 text-xs font-bold">
            Renouveler
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-bold">Licence actuelle</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                SPARK PRESSING Côte d&apos;Ivoire · LIC-CI-00184
              </p>
            </div>
            <Badge variant="outline" className="gap-1 border-0 bg-emerald-50 text-[10px] font-semibold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Active
            </Badge>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-6">
            <div className="relative size-28 shrink-0">
              <svg className="size-28 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-muted" />
                <circle
                  cx="50" cy="50" r="42" fill="none" strokeWidth="8"
                  stroke="var(--color-primary)"
                  strokeLinecap="round"
                  strokeDasharray={`${(74 / 100) * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold">94</span>
                <span className="text-[10px] font-medium text-muted-foreground">JOURS</span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Plan actuel", value: "Business" },
                  { label: "Périodicité", value: "Annuel" },
                  { label: "Expiration", value: "31 déc. 2026" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    <p className="text-[13px] font-bold">{s.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Période consommée</span>
                  <span className="font-bold">74%</span>
                </div>
                <Progress value={74} className="h-1.5" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                4/6 agences · 58/100 utilisateurs · 2,8/5 Go de stockage
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="text-sm font-bold">Renouveler la licence</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Choisissez la durée et enregistrez le règlement.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {plans.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlan(p.id)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors",
                  plan === p.id
                    ? "border-secondary bg-amber-50/60 ring-1 ring-secondary"
                    : "border-border bg-white hover:border-muted-foreground/30",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-bold">{p.label}</p>
                  {p.badge && (
                    <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-[9px] font-bold text-amber-700">
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-lg font-extrabold">{p.price}</p>
                <p className="text-[10px] text-muted-foreground">{p.sub}</p>
              </button>
            ))}
          </div>

          <p className="mt-4 text-[12px] font-bold">Moyen de paiement</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {moyens.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMoyen(m.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-[11px] font-medium transition-colors",
                  moyen === m.id
                    ? "border-muted-foreground/40 bg-muted/60"
                    : "border-border bg-white hover:bg-muted/40",
                )}
              >
                <AppIcon name={m.icon} className="size-5 text-muted-foreground" />
                {m.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Référence de transaction</label>
              <Select defaultValue="TRX-2026-09-2841">
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRX-2026-09-2841">TRX-2026-09-2841</SelectItem>
                  <SelectItem value="TRX-2026-09-2842">TRX-2026-09-2842</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Date d&apos;effet</label>
              <Select defaultValue="2027-01-01">
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2027-01-01">01 jan. 2027</SelectItem>
                  <SelectItem value="2027-02-01">01 févr. 2027</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-[13px] font-semibold">Renouvellement automatique</p>
            <Switch checked={auto} onCheckedChange={(v) => setAuto(!!v)} aria-label="Renouvellement automatique" />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Paperclip className="size-4 text-muted-foreground" />
              <div>
                <p className="text-[12px] font-semibold">Justificatif de paiement</p>
                <p className="text-[10px] text-muted-foreground">PDF, JPG ou PNG · 10 Mo maximum</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-xs font-semibold">
              Ajouter
            </Button>
          </div>

          <div className="mt-4 rounded-xl bg-primary p-4 text-white">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-white/80">Plan Business · {plans.find((p) => p.id === plan)?.label}</span>
              <span>{total.toLocaleString("fr-FR")} FCFA</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[12px]">
              <span className="text-white/80">Taxes</span>
              <span>0 FCFA</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-white/15 pt-2">
              <span className="text-[13px] font-bold">Montant total</span>
              <span className="text-lg font-extrabold text-secondary">{total.toLocaleString("fr-FR")} FCFA</span>
            </div>
          </div>

          <Button
            className="mt-3 w-full text-xs font-bold"
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
          >
            Valider et renouveler
          </Button>
          {saved && (
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-medium text-emerald-600">
              <CheckCircle2 className="size-3.5" />
              Renouvellement enregistré.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-bold">Agences et utilisateurs couverts</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">4 agences · 58 utilisateurs actifs</p>
            </div>
            <button className="text-xs font-bold text-primary hover:underline">Gérer</button>
          </div>
          <div className="mt-4 space-y-3">
            {agences.map((a) => (
              <div key={a.name} className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2">
                  <Building className="size-4 text-muted-foreground" />
                  {a.name} · {a.users} utilisateurs
                </span>
                <Badge variant="outline" className="border-0 bg-muted text-[10px] font-semibold text-muted-foreground">
                  Couverte
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-bold">Limites du plan Business</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Capacité et consommation</p>
            </div>
            <button className="text-xs font-bold text-primary hover:underline">Changer de plan</button>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { label: "Agences", used: 4, max: 6, display: "4 / 6" },
              { label: "Utilisateurs", used: 58, max: 100, display: "58 / 100" },
              { label: "Stockage", used: 2.8, max: 5, display: "2,8 / 5 Go" },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="font-bold">{r.display}</span>
                </div>
                <Progress value={(r.used / r.max) * 100} className="mt-1 h-1.5" />
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Multi-agences · Rapports avancés · Offline 7 jours · API · Support prioritaire
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-sm font-bold">Historique des renouvellements et paiements</h2>
            <p className="text-[11px] text-muted-foreground">Traçabilité financière de la licence</p>
          </div>
          <button className="text-xs font-bold text-primary hover:underline">Exporter</button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">DATE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PÉRIODE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">MONTANT</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">MOYEN</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">RÉFÉRENCE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">FACTURE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">STATUT</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historique.map((h) => (
                <TableRow key={h.ref}>
                  <TableCell className="text-xs text-muted-foreground">{h.date}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{h.periode}</TableCell>
                  <TableCell className="text-xs font-bold">{h.montant}</TableCell>
                  <TableCell className="text-xs">{h.moyen}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{h.ref}</TableCell>
                  <TableCell className="text-xs font-semibold text-blue-600">{h.facture}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("gap-1 border-0 text-[10px] font-semibold", statutStyle[h.statut].bg)}>
                      <span className={cn("size-1.5 rounded-full", statutStyle[h.statut].dot)} />
                      {h.statut}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon-sm" aria-label={`Télécharger ${h.facture}`}>
                      <Download className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="text-sm font-bold">Gestion de la licence</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Actions sensibles et changement de plan</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" className="gap-1.5 bg-secondary text-xs font-bold text-primary hover:bg-secondary/90">
              Changer de plan
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700">
              Suspendre
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              Réactiver
            </Button>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Toute suspension bloque les nouvelles opérations mais conserve les données et l&apos;accès Superadmin.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-emerald-600" />
              <h2 className="text-sm font-bold">Audit et conformité</h2>
            </div>
            <Badge variant="outline" className="border-0 bg-emerald-50 text-[10px] font-semibold text-emerald-700">
              Conforme
            </Badge>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Dernière action : préparation du renouvellement par Aïcha N. · 28 sept. 2026 à 10:42.
          </p>
          <div className="mt-3 space-y-2">
            {[
              "Référence TRX-2026-09-2841 enregistrée",
              "Justificatif en attente de validation",
            ].map((item) => (
              <p key={item} className="flex items-center gap-2 text-[12px]">
                <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
