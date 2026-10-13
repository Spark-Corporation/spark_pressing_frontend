"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Download,
  Medal,
  Plus,
  Sparkles,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { FieldLabel, Section } from "../_components";
import { useRouter } from "next/navigation";

const kpis = [
  {
    label: "Membres actifs",
    value: "2 846",
    sub: "+8,4 % ce mois",
    icon: Users,
    iconBg: "bg-stone-100 text-stone-500",
  },
  {
    label: "Points émis",
    value: "184 620",
    sub: "64 % consommables",
    icon: Sparkles,
    iconBg: "bg-amber-50 text-amber-600",
  },
  {
    label: "Points consommés",
    value: "72 480",
    sub: "39,3 % du stock",
    icon: Medal,
    iconBg: "bg-stone-100 text-stone-500",
  },
  {
    label: "Remises accordées",
    value: "3,84 M FCFA",
    sub: "ROI campagnes ×3,2",
    icon: Wallet,
    iconBg: "bg-amber-50 text-amber-600",
  },
  {
    label: "Campagnes actives",
    value: "2",
    sub: "422 utilisations",
    icon: Ticket,
    iconBg: "bg-stone-100 text-stone-500",
  },
];

const NIVEAUX = [
  ["E", "Essentiel", "Dès 0 FCFA", "1x", "Aucun bonus"],
  ["A", "Argent", "Dès 100 000 FCFA", "1,1x", "+10 % de points"],
  ["O", "Or", "Dès 300 000 FCFA", "1,25x", "Priorité & retouches"],
  ["P", "Platine", "Dès 700 000 FCFA", "1,5x", "Collecte offerte"],
];

interface Promo {
  code: string;
  remise: string;
  periode: string;
  quota: number;
  utilises: number;
  agences: string;
  statut: "Active" | "Planifiée" | "Terminée";
}

const PROMOS_INIT: Promo[] = [
  {
    code: "BIENVENUE10",
    remise: "10 %",
    periode: "01–30 sept. 2026",
    quota: 500,
    utilises: 328,
    agences: "Toutes",
    statut: "Active",
  },
  {
    code: "COCODYVIP",
    remise: "15 %",
    periode: "15 sept.–15 oct.",
    quota: 150,
    utilises: 94,
    agences: "Cocody",
    statut: "Active",
  },
  {
    code: "PRESSING5K",
    remise: "5 000 F",
    periode: "01–31 oct. 2026",
    quota: 300,
    utilises: 0,
    agences: "2 agences",
    statut: "Planifiée",
  },
  {
    code: "RETOUR20",
    remise: "20 %",
    periode: "01–31 août 2026",
    quota: 200,
    utilises: 187,
    agences: "Toutes",
    statut: "Terminée",
  },
  {
    code: "FIDELITE5",
    remise: "5 %",
    periode: "01–30 nov. 2026",
    quota: 400,
    utilises: 0,
    agences: "Toutes",
    statut: "Planifiée",
  },
  {
    code: "PARRAIN10",
    remise: "10 %",
    periode: "Permanent",
    quota: 1000,
    utilises: 412,
    agences: "Toutes",
    statut: "Active",
  },
];

const PAGE_SIZE = 4;

const statutBadge: Record<Promo["statut"], string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Planifiée: "bg-sky-100 text-sky-700",
  Terminée: "bg-muted text-muted-foreground",
};

export default function PromotionsPage() {
  const [taux, setTaux] = useState("1 point / 100 FCFA");
  const [conversion, setConversion] = useState("200 points = 1 000 FCFA");
  const [seuil, setSeuil] = useState("1 000 points");
  const [expiration, setExpiration] = useState("12 mois après acquisition");
  const [creditApres, setCreditApres] = useState(true);
  const [nom, setNom] = useState("Offre rentrée Cocody");
  const [code, setCode] = useState("RENTREE15");
  const [type, setType] = useState("Pourcentage");
  const [remise, setRemise] = useState("15 %");
  const [debut, setDebut] = useState("01/10/2026");
  const [fin, setFin] = useState("31/10/2026");
  const [quota, setQuota] = useState("250");
  const [parClient, setParClient] = useState("1 utilisation");
  const [agencesEligibles, setAgencesEligibles] = useState("Cocody, Marcory");
  const [montantMin, setMontantMin] = useState("10 000 FCFA");
  const [cumul, setCumul] = useState(false);
  const [promos, setPromos] = useState<Promo[]>(PROMOS_INIT);
  const [page, setPage] = useState(1);
  const router = useRouter();

  const totalPages = Math.max(1, Math.ceil(promos.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = promos.slice(start, start + PAGE_SIZE);

  const handlePublish = () => {
    if (!nom.trim() || !code.trim()) {
      toast.error("Campagne incomplète", {
        description: "Nom et code promotionnel requis.",
      });
      return;
    }
    setPromos((p) => [
      {
        code: code.toUpperCase(),
        remise,
        periode: `${debut} – ${fin}`,
        quota: Number(quota) || 0,
        utilises: 0,
        agences: agencesEligibles || "Toutes",
        statut: "Planifiée",
      },
      ...p,
    ]);
    setPage(1);
    toast.success("Campagne publiée", {
      description: `${code.toUpperCase()} • ${agencesEligibles}.`,
    });
  };

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Retour aux paramètres"
            onClick={() => router.back()}
            className="mt-1 bg-primary text-white hover:bg-primary/90 hover:text-white"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              Promotions et fidélité
            </h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Pilotez les règles de récompense et vos campagnes commerciales.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() =>
              toast.success("Export lancé", {
                description: "Campagnes et règles en CSV.",
              })
            }
          >
            <Download className="size-3.5" />
            Exporter
          </Button>
          <Button
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={handlePublish}
          >
            <Plus className="size-4" />
            Nouvelle promotion
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-border bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                {k.label}
              </p>
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg",
                  k.iconBg,
                )}
              >
                <k.icon className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-xl font-extrabold tracking-tight">
              {k.value}
            </p>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Section
            title="Règles du programme"
            sub="Les changements s'appliquent aux prochains dépôts."
            right={
              <Badge
                variant="outline"
                className="border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700"
              >
                Actif
              </Badge>
            }
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel>Taux de gain</FieldLabel>
                <Input
                  value={taux}
                  onChange={(e) => setTaux(e.target.value)}
                  className="h-9 text-[13px]"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Sur montant net payé
                </p>
              </div>
              <div>
                <FieldLabel>Conversion</FieldLabel>
                <Input
                  value={conversion}
                  onChange={(e) => setConversion(e.target.value)}
                  className="h-9 text-[13px]"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Valeur d&apos;un point : 5 FCFA
                </p>
              </div>
              <div>
                <FieldLabel>Seuil minimum</FieldLabel>
                <Input
                  value={seuil}
                  onChange={(e) => setSeuil(e.target.value)}
                  className="h-9 text-[13px]"
                />
              </div>
              <div>
                <FieldLabel>Expiration</FieldLabel>
                <Input
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  className="h-9 text-[13px]"
                />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2">
              <div className="text-xs">
                <p className="font-bold">Créditer après encaissement</p>
                <p className="text-[11px] text-muted-foreground">
                  Les points sont crédités sur les dépôts soldés ou impayés.
                </p>
              </div>
              <Switch
                checked={creditApres}
                onCheckedChange={setCreditApres}
                aria-label="Créditer après encaissement"
              />
            </div>
          </Section>

          <Section
            title="Niveaux de fidélité"
            sub="Progression calculée sur les dépenses des 12 derniers mois."
          >
            <div className="space-y-2.5">
              {NIVEAUX.map(([init, nom, seuil, mult, bonus]) => (
                <div
                  key={nom}
                  className="flex flex-wrap items-center gap-2 text-xs"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-700">
                    {init}
                  </span>
                  <p className="w-24 shrink-0 font-bold">{nom}</p>
                  <p className="min-w-28 flex-1 text-muted-foreground">
                    {seuil}
                  </p>
                  <Badge
                    variant="outline"
                    className="border-0 bg-amber-50 text-[10px] font-bold text-amber-700"
                  >
                    {mult}
                  </Badge>
                  <p className="w-32 text-right text-muted-foreground">
                    {bonus}
                  </p>
                </div>
              ))}
            </div>
            <Button
              size="lg"
              className="mt-3 w-full justify-center gap-1.5 text-xs font-bold sm:w-auto"
              onClick={() =>
                toast.success("Règles enregistrées", {
                  description: "Programme fidélité mis à jour.",
                })
              }
            >
              <Check className="size-4" />
              Enregistrer les règles
            </Button>
          </Section>
        </div>

        {/* Créer promo */}
        <Section
          title="Créer une promotion"
          sub="La campagne sera publiée après validation."
          right={
            <Badge
              variant="outline"
              className="border-0 bg-muted text-[10px] font-bold text-muted-foreground"
            >
              Brouillon
            </Badge>
          }
        >
          <FieldLabel>Nom de la campagne</FieldLabel>
          <Input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="h-9 text-[13px]"
          />
          <div className="mt-3">
            <FieldLabel>Code promotionnel</FieldLabel>
            <Input
              value={code}
              onChange={(e) =>
                setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
              }
              className="h-9 text-[13px] font-bold"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Code disponible • 8 caractères
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <FieldLabel>Type</FieldLabel>
              <Select
                value={type}
                onValueChange={(v) => setType(v ?? "Pourcentage")}
              >
                <SelectTrigger className="w-full text-[13px] data-[size=default]:h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Pourcentage", "Montant fixe"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel>Remise</FieldLabel>
              <Input
                value={remise}
                onChange={(e) => setRemise(e.target.value)}
                className="h-9 text-[13px]"
              />
            </div>
            <div>
              <FieldLabel>Début</FieldLabel>
              <Input
                value={debut}
                onChange={(e) => setDebut(e.target.value)}
                className="h-9 text-[13px]"
              />
            </div>
            <div>
              <FieldLabel>Fin</FieldLabel>
              <Input
                value={fin}
                onChange={(e) => setFin(e.target.value)}
                className="h-9 text-[13px]"
              />
            </div>
            <div>
              <FieldLabel>Quota total</FieldLabel>
              <Input
                inputMode="numeric"
                value={quota}
                onChange={(e) =>
                  setQuota(e.target.value.replace(/[^0-9]/g, ""))
                }
                className="h-9 text-[13px]"
              />
            </div>
            <div>
              <FieldLabel>Par client</FieldLabel>
              <Input
                value={parClient}
                onChange={(e) => setParClient(e.target.value)}
                className="h-9 text-[13px]"
              />
            </div>
          </div>
          <div className="mt-3">
            <FieldLabel>Agences éligibles</FieldLabel>
            <Input
              value={agencesEligibles}
              onChange={(e) => setAgencesEligibles(e.target.value)}
              className="h-9 text-[13px]"
            />
          </div>
          <div className="mt-3">
            <FieldLabel>Montant minimum</FieldLabel>
            <Input
              value={montantMin}
              onChange={(e) => setMontantMin(e.target.value)}
              className="h-9 text-[13px]"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              La remise maximale sera plafonnée à 12 000 FCFA.
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 text-xs">
            <p className="font-bold">Cumul avec points fidélité</p>
            <Switch
              checked={cumul}
              onCheckedChange={setCumul}
              aria-label="Cumul avec points fidélité"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 text-xs font-bold"
              onClick={() =>
                toast.success("Brouillon enregistré", { description: nom })
              }
            >
              Enregistrer le brouillon
            </Button>
            <Button
              size="lg"
              className="flex-1 gap-1.5 text-xs font-bold"
              onClick={handlePublish}
            >
              <Check className="size-4" />
              Valider et publier
            </Button>
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Section
          title="Historique des mouvements"
          sub="Dernières opérations de points."
          right={
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-[11px] font-bold text-muted-foreground"
              onClick={() =>
                toast.info("Historique complet", {
                  description: "Tous les mouvements de points.",
                })
              }
            >
              Voir tout
            </Button>
          }
          className="xl:col-span-2"
        >
          <div className="space-y-2.5">
            {[
              [
                "AK",
                "Aminata Koné",
                "Dépôt #DP-2841",
                "+ 460 pts",
                "28 sept. • 15:42",
                "bg-amber-100 text-amber-700",
                "text-foreground",
              ],
              [
                "JM",
                "Jean M'Bayo",
                "Remise 5 000 FCFA",
                "− 1 000 pts",
                "28 sept. • 14:18",
                "bg-slate-200 text-slate-600",
                "text-red-500",
              ],
              [
                "FD",
                "Fatou Diarra",
                "Bonus niveau Argent",
                "+ 250 pts",
                "28 sept. • 11:06",
                "bg-emerald-100 text-emerald-700",
                "text-foreground",
              ],
              [
                "SK",
                "Souleymane K.",
                "Expiration annuelle",
                "− 180 pts",
                "27 sept. • 18:31",
                "bg-stone-200 text-stone-600",
                "text-amber-600",
              ],
            ].map(([init, nom, quoi, pts, quand, bg, cls]) => (
              <div key={nom} className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    bg as string,
                  )}
                >
                  {init}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">{nom}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {quoi}
                  </p>
                </div>
                <p
                  className={cn(
                    "shrink-0 text-xs font-extrabold",
                    cls as string,
                  )}
                >
                  {pts}
                </p>
                <span className="hidden w-24 shrink-0 text-right text-[11px] text-muted-foreground sm:block">
                  {quand}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Groupes de fidélité"
          sub="Segments mis à jour automatiquement."
        >
          <div className="space-y-3 text-xs">
            {[
              ["Clients Or & Platine", "486 membres", 72],
              ["À réactiver • 90 jours", "214 membres", 34],
              ["Proches d'une récompense", "167 membres", 52],
              ["Nouveaux membres", "342 membres", 64],
            ].map(([label, sub, pct]) => (
              <div key={label as string}>
                <div className="flex justify-between">
                  <span className="font-bold">{label}</span>
                  <span className="text-muted-foreground">{sub}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      (pct as number) > 60 ? "bg-emerald-500" : "bg-secondary",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Table promos */}
      <Section
        title="Promotions"
        sub="Codes, utilisation et périmètre des campagnes."
        right={
          <span className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-[11px] font-semibold text-muted-foreground"
              onClick={() =>
                toast.info("Agences", { description: "Filtrer par périmètre." })
              }
            >
              Toutes les agences
            </Button>
            <Badge
              variant="outline"
              className="border-0 bg-sky-100 text-[10px] font-bold text-sky-700"
            >
              {promos.length} campagnes
            </Badge>
          </span>
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {[
                "CODE",
                "REMISE",
                "PÉRIODE",
                "QUOTA",
                "UTILISATION",
                "AGENCES",
                "STATUT",
              ].map((h) => (
                <TableHead
                  key={h}
                  className="text-[10px] font-bold tracking-wide text-muted-foreground"
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.code}>
                <TableCell className="text-xs font-bold">{p.code}</TableCell>
                <TableCell className="text-xs">{p.remise}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {p.periode}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {p.quota}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${p.quota ? Math.round((p.utilises / p.quota) * 100) : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {p.utilises} / {p.quota}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {p.agences}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-0 text-[10px] font-bold",
                      statutBadge[p.statut],
                    )}
                  >
                    {p.statut}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            {start + 1}–{start + rows.length} sur {promos.length} • Page{" "}
            {safePage} / {totalPages}
          </p>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === safePage ? "default" : "outline"}
                size="icon-sm"
                onClick={() => setPage(p)}
                className="text-[11px] font-bold"
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
