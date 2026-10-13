"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Lock,
  Minus,
  Plus,
  Save,
  Search,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MEMBRES, ROLES_PERM } from "../data";

interface Domaine {
  nom: string;
  sub: string;
  actions: string[];
  sensibles: string[];
}

const DOMAINES: Domaine[] = [
  { nom: "Clients", sub: "Fiches et historique client", actions: ["Voir", "Créer", "Modifier", "Supprimer", "Exporter"], sensibles: [] },
  { nom: "Dépôts", sub: "Tickets et commandes", actions: ["Voir", "Créer", "Modifier", "Annuler", "Exporter"], sensibles: [] },
  { nom: "Paiements", sub: "Encaissements et remboursements", actions: ["Voir", "Encaisser", "Ajuster", "Rembourser", "Exporter"], sensibles: ["Encaisser"] },
  { nom: "Atelier", sub: "Traitement et statuts", actions: ["Voir", "Planifier", "Changer le statut", "Annuler"], sensibles: [] },
  { nom: "Retraits", sub: "Remise et suivi des articles", actions: ["Voir", "Remettre", "Modifier", "Annuler"], sensibles: [] },
  { nom: "Caisse", sub: "Sessions et mouvements", actions: ["Voir", "Ouvrir", "Clôturer", "Corriger", "Exporter"], sensibles: ["Clôturer", "Exporter"] },
  { nom: "Rapports", sub: "Indicateurs des agences affectées", actions: ["Voir", "Exporter"], sensibles: ["Exporter"] },
  { nom: "Paramètres", sub: "Catalogue, taxes et reçus", actions: ["Voir", "Modifier"], sensibles: [] },
  { nom: "Agences", sub: "Accès au périmètre autorisé", actions: ["Voir", "Créer", "Modifier", "Supprimer"], sensibles: [] },
  { nom: "Audit", sub: "Journal des actions et accès", actions: ["Consulter", "Exporter"], sensibles: ["Exporter"] },
];

const DEFAULT_ON: Record<string, string[]> = {
  Clients: ["Voir", "Créer", "Modifier"],
  Dépôts: ["Voir", "Créer", "Modifier"],
  Paiements: ["Voir", "Encaisser"],
  Atelier: ["Voir", "Changer le statut"],
  Retraits: ["Voir", "Remettre"],
  Caisse: ["Voir"],
  Rapports: ["Voir", "Exporter"],
  Paramètres: [],
  Agences: ["Voir"],
  Audit: ["Consulter"],
};

const PORTEES = ["Bingerville, Cocody • 2 agences", "Bingerville seule", "Toutes les agences"];
const PERIMETRE_OK = ["Bingerville", "Cocody", "Plateau"];
const AGENCES_CHOIX = ["Bingerville", "Cocody", "Plateau", "Marcory"];

export default function NouveauRolePage() {
  const router = useRouter();
  const { updatePath } = useGlobalData();
  const [step, setStep] = useState(1);
  const [nom, setNom] = useState("Responsable d'agence");
  const [description, setDescription] = useState("Supervise les dépôts, les encaissements et le suivi opérationnel des agences affectées.");
  const [base, setBase] = useState("zero");
  const [copyRole, setCopyRole] = useState("Manager");
  const [pressing, setPressing] = useState("SPARK PRESSING");
  const [portee, setPortee] = useState(PORTEES[0]);
  const [niveau, setNiveau] = useState("Données des agences affectées");
  const [perms, setPerms] = useState<Record<string, string[]>>(() => Object.fromEntries(Object.entries(DEFAULT_ON).map(([k, v]) => [k, [...v]])));
  const [permSearch, setPermSearch] = useState("");
  const [agences, setAgences] = useState<string[]>(["Bingerville", "Cocody"]);
  const [userSearch, setUserSearch] = useState("");
  const [users, setUsers] = useState<string[]>(["Nadia Assi", "Eric Boli"]);
  const [confirmCaisse, setConfirmCaisse] = useState(false);

  const totalDroits = useMemo(() => Object.values(perms).reduce((n, l) => n + l.length, 0), [perms]);
  const domainesActifs = useMemo(() => DOMAINES.filter((d) => (perms[d.nom] ?? []).length > 0).length, [perms]);
  const sensiblesCount = useMemo(
    () => DOMAINES.reduce((n, d) => n + d.sensibles.filter((a) => (perms[d.nom] ?? []).includes(a)).length, 0),
    [perms],
  );
  const perimetreOk = agences.every((a) => PERIMETRE_OK.includes(a));
  const nomOk = nom.trim() !== "";
  const checks = [
    { ok: nomOk, label: "Nom unique validé" },
    { ok: perimetreOk && agences.length > 0, label: "Périmètre autorisé respecté" },
    { ok: confirmCaisse, label: "Droits sensibles confirmés" },
  ];

  const togglePerm = (domaine: string, action: string) =>
    setPerms((p) => {
      const list = p[domaine] ?? [];
      return { ...p, [domaine]: list.includes(action) ? list.filter((x) => x !== action) : [...list, action] };
    });

  const toggleAgence = (a: string) =>
    setAgences((l) => (l.includes(a) ? l.filter((x) => x !== a) : [...l, a]));

  const candidats = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return [];
    return MEMBRES.filter((m) => !users.includes(m.nom) && `${m.nom} ${m.email}`.toLowerCase().includes(q)).slice(0, 3);
  }, [userSearch, users]);

  const handleCreate = () => {
    if (!nomOk) {
      toast.error("Nom requis", { description: "Donnez un nom unique au rôle." });
      setStep(1);
      return;
    }
    if (agences.length === 0) {
      toast.error("Périmètre vide", { description: "Sélectionnez au moins une agence." });
      setStep(3);
      return;
    }
    if (!perimetreOk) {
      toast.error("Hors périmètre", { description: "Marcory est hors de votre périmètre d'administration." });
      return;
    }
    if (!confirmCaisse) {
      toast.error("Confirmation requise", { description: "Confirmez l'autorisation d'encaisser et d'exporter." });
      return;
    }
    toast.success("Rôle créé", { description: `${nom} • ${totalDroits} droits • ${users.length} utilisateurs.` });
    updatePath("/equipe");
  };

  const domainesFiltres = DOMAINES.filter((d) => {
    const q = permSearch.trim().toLowerCase();
    if (!q) return true;
    return d.nom.toLowerCase().includes(q) || d.actions.some((a) => a.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Retour à l'équipe"
          onClick={() => router.back()}
          className="mt-1 bg-primary text-white hover:bg-primary/90 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl">
            Créer un rôle
            <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-muted-foreground">
              Rôle personnalisé
            </Badge>
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Définissez un rôle sur mesure, limitez son périmètre et vérifiez les droits avant de le créer.
          </p>
        </div>
      </div>

      {/* Étapes */}
      <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-white p-2">
        {[
          [1, "Définition", "Identité et périmètre", true],
          [2, "Permissions", `${totalDroits} droits sélectionnés`, true],
          [3, "Vérification", "Prêt à créer", totalDroits > 0],
        ].map(([n, title, sub, done]) => (
          <button
            key={n as number}
            type="button"
            onClick={() => setStep(n as number)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors",
              step === n ? "bg-primary/5 ring-1 ring-primary/30" : "hover:bg-muted/50",
            )}
          >
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                step === n ? "bg-secondary text-secondary-foreground" : done ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground",
              )}
            >
              {done && step !== n ? <Check className="size-3.5" /> : n}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-bold">
                {n}. {title as string}
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">{sub as string}</span>
            </span>
          </button>
        ))}
      </div>

      {step === 1 && (
        <section className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[11px] font-bold">1</span>
              Définition du rôle
            </h2>
            <Badge variant="outline" className="border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
              Informations complètes
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">Donnez une identité claire au rôle et définissez les données accessibles.</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="nr-nom" className="mb-1.5 text-xs font-semibold">
                Nom du rôle <span className="text-red-500">*</span>
              </Label>
              <Input id="nr-nom" value={nom} onChange={(e) => setNom(e.target.value)} aria-invalid={!nomOk} className="h-9 text-[13px]" />
              <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                <Check className="size-3.5" /> Nom unique et disponible dans ce pressing
              </p>
            </div>
            <div>
              <Label htmlFor="nr-desc" className="mb-1.5 text-xs font-semibold">
                Description
              </Label>
              <Textarea
                id="nr-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 250))}
                className="min-h-9 text-[13px]"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">Visible par les administrateurs • 250 caractères maximum</p>
            </div>
          </div>

          <Label className="mt-3 mb-1.5 text-xs font-semibold">Créer à partir de</Label>
          <RadioGroup value={base} onValueChange={setBase} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Label
              htmlFor="nr-zero"
              className={cn(
                "flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-xs",
                base === "zero" ? "border-primary bg-primary/5" : "border-border",
              )}
            >
              <RadioGroupItem id="nr-zero" value="zero" className="mt-0.5" />
              <span>
                <span className="block font-bold">Depuis zéro</span>
                <span className="block font-normal text-muted-foreground">Choisissez uniquement les droits nécessaires.</span>
              </span>
            </Label>
            <div
              className={cn(
                "flex items-start gap-2.5 rounded-lg border p-3 text-xs",
                base === "copy" ? "border-primary bg-primary/5" : "border-border",
              )}
            >
              <RadioGroupItem id="nr-copy" value="copy" aria-label="Copier un rôle existant" className="mt-0.5" />
              <div className="min-w-0 flex-1">
                <Label htmlFor="nr-copy" className="block cursor-pointer font-bold">
                  Copier un rôle existant
                </Label>
                <p className="font-normal text-muted-foreground">Reprenez ses droits sans modifier l&apos;original.</p>
                <Select value={copyRole} onValueChange={(v) => setCopyRole(v ?? "Manager")}>
                  <SelectTrigger className="mt-1.5 w-full text-xs data-[size=default]:h-8" aria-label="Choisir un rôle">
                    <SelectValue placeholder="Choisir un rôle…" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES_PERM.map((r) => (
                      <SelectItem key={r.role} value={r.role}>
                        {r.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </RadioGroup>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Admin, Manager, Caissier, Laveur et Classeur sont des rôles système : ils ne peuvent pas être modifiés par ce formulaire.
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="nr-pressing" className="mb-1.5 text-xs font-semibold">
                Pressing <span className="text-red-500">*</span>
              </Label>
              <Select value={pressing} onValueChange={(v) => setPressing(v ?? "SPARK PRESSING")}>
                <SelectTrigger id="nr-pressing" className="w-full text-[13px] data-[size=default]:h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SPARK PRESSING">SPARK PRESSING</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-[11px] text-muted-foreground">Pressing administré par Aïcha Koné</p>
            </div>
            <div>
              <Label htmlFor="nr-portee" className="mb-1.5 text-xs font-semibold">
                Portée / agences affectées <span className="text-red-500">*</span>
              </Label>
              <Select value={portee} onValueChange={(v) => setPortee(v ?? PORTEES[0])}>
                <SelectTrigger id="nr-portee" className="w-full text-[13px] data-[size=default]:h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PORTEES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-[11px] text-muted-foreground">Accès limité aux agences sélectionnées</p>
            </div>
            <div>
              <Label htmlFor="nr-niveau" className="mb-1.5 text-xs font-semibold">
                Niveau de données <span className="text-red-500">*</span>
              </Label>
              <Select value={niveau} onValueChange={(v) => setNiveau(v ?? niveau)}>
                <SelectTrigger id="nr-niveau" className="w-full text-[13px] data-[size=default]:h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Données des agences affectées", "Données consolidées", "Données personnelles"].map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-[11px] text-muted-foreground">Aucune visibilité sur les autres agences</p>
            </div>
          </div>
          <p className="mt-3 flex gap-1.5 rounded-lg bg-muted/50 p-2.5 text-[11px] leading-snug text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
            <span>
              <span className="font-bold text-foreground">Un périmètre limité à vos propres droits</span>
              <br />
              Vous administrez Bingerville, Cocody et Plateau. Marcory et les droits hors de votre périmètre restent verrouillés. Par défaut, aucun droit n&apos;est accordé : appliquez le principe du moindre privilège.
            </span>
          </p>
        </section>
      )}

      {step === 2 && (
        <section className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[11px] font-bold">2</span>
              Permissions par domaine
            </h2>
            <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-foreground">
              {totalDroits} / 38 droits
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Chaque case autorise une action. La sélection d&apos;un domaine inclut uniquement les droits que vous pouvez déléguer.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="relative min-w-52 flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un domaine ou une action…"
                value={permSearch}
                onChange={(e) => setPermSearch(e.target.value)}
                className="h-9 bg-muted/40 pl-9 text-[13px]"
              />
            </div>
            <span className="text-[11px] text-muted-foreground">{domainesActifs} domaines avec au moins un droit</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-[11px] font-bold text-muted-foreground"
              onClick={() => setPerms(Object.fromEntries(DOMAINES.map((d) => [d.nom, []])))}
            >
              Tout désélectionner
            </Button>
          </div>

          {sensiblesCount > 0 && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800 ring-1 ring-amber-100">
              {sensiblesCount} permission{sensiblesCount > 1 ? "s" : ""} sensible{sensiblesCount > 1 ? "s" : ""} sélectionnée{sensiblesCount > 1 ? "s" : ""}
            </p>
          )}

          <div className="mt-3 space-y-2">
            {domainesFiltres.map((d) => {
              const list = perms[d.nom] ?? [];
              return (
                <div key={d.nom} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-md bg-secondary text-[10px] font-bold text-white">
                        {d.nom.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-xs font-bold">{d.nom}</p>
                        <p className="text-[11px] text-muted-foreground">{d.sub}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-muted-foreground">
                      {list.length} / {d.actions.length}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {d.actions.map((a) => {
                      const on = list.includes(a);
                      const sensible = d.sensibles.includes(a);
                      return (
                        <button
                          key={a}
                          type="button"
                          onClick={() => togglePerm(d.nom, a)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                            on
                              ? sensible
                                ? "border-amber-400 bg-amber-100 text-amber-800"
                                : "border-primary bg-primary text-primary-foreground"
                              : "border-border text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {on && <Check className="size-3" />}
                          {a}
                          {sensible && <Lock className="size-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Check className="size-3 text-primary" /> Autorisé</span>
            <span className="inline-flex items-center gap-1"><Lock className="size-3 text-amber-600" /> Droit sensible</span>
            <span className="inline-flex items-center gap-1"><Minus className="size-3" /> Hors de vos droits • non délégable</span>
            <span>— Non applicable</span>
          </div>
        </section>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-bold">
                <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[11px] font-bold">3</span>
                Vérification avant création
              </h2>
              <Badge variant="outline" className="border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
                Prêt à créer
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">Relisez le rôle, préparez les affectations et confirmez les droits sensibles.</p>

            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[13px] font-bold">Affectation initiale</h3>
                  <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-muted-foreground">
                    Facultatif
                  </Badge>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Le rôle peut être créé sans utilisateur, puis affecté ultérieurement.</p>
                <p className="mt-2 text-xs font-semibold">Agences affectées • {agences.length} sélectionnées</p>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5">
                  {AGENCES_CHOIX.map((a) => (
                    <Label key={a} htmlFor={`nr-ag-${a}`} className="flex cursor-pointer items-center gap-1.5 text-xs font-medium">
                      <Checkbox id={`nr-ag-${a}`} checked={agences.includes(a)} onCheckedChange={() => toggleAgence(a)} />
                      {a}
                    </Label>
                  ))}
                </div>
                {!perimetreOk && (
                  <p className="mt-1.5 text-[11px] font-bold text-red-500">Marcory est hors de votre périmètre d&apos;administration.</p>
                )}
                <div className="relative mt-2">
                  <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Ajouter un utilisateur autorisé…"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="h-9 bg-muted/40 pl-9 text-[13px]"
                  />
                </div>
                {candidats.length > 0 && (
                  <div className="mt-1.5 divide-y divide-border overflow-hidden rounded-lg border border-border">
                    {candidats.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setUsers((u) => [...u, m.nom]);
                          setUserSearch("");
                        }}
                        className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs hover:bg-muted/50"
                      >
                        <Plus className="size-3.5 text-muted-foreground" />
                        <span className="font-bold">{m.nom}</span>
                        <span className="text-[11px] text-muted-foreground">{m.agency}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {users.map((u) => {
                    const m = MEMBRES.find((x) => x.nom === u);
                    return (
                      <span key={u} className="inline-flex items-center gap-1.5 rounded-full bg-muted py-1 pr-1.5 pl-2.5 text-[11px] font-semibold">
                        {m && (
                          <span className={cn("flex size-5 items-center justify-center rounded-full text-[8px] font-bold", m.avatarBg)}>
                            {m.initials}
                          </span>
                        )}
                        {u}
                        <button type="button" aria-label={`Retirer ${u}`} onClick={() => setUsers((l) => l.filter((x) => x !== u))} className="font-bold text-muted-foreground hover:text-foreground">
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {users.length} utilisateur{users.length > 1 ? "s" : ""} recevront ce rôle dès la création, uniquement dans les agences autorisées.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[13px] font-bold">{nom || "Nouveau rôle"}</h3>
                  <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-foreground">
                    Personnalisé
                  </Badge>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  SPARK PRESSING • Depuis zéro • {agences.join(" et ") || "aucune agence"}
                </p>
                <p className="mt-2 text-xs font-bold">
                  {totalDroits} permissions • {domainesActifs} domaines • {sensiblesCount} droits sensibles
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {DOMAINES.filter((d) => (perms[d.nom] ?? []).length > 0)
                    .map((d) => `${d.nom} ${(perms[d.nom] ?? []).length}`)
                    .join(" • ") || "Aucun droit sélectionné"}
                </p>
                <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
                  Aucune suppression, annulation, clôture de caisse ni modification des paramètres sans validation dédiée.
                </p>
              </div>
            </div>

            <Label
              htmlFor="nr-confirm"
              className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-lg bg-amber-50 p-3 text-[11px] ring-1 ring-amber-100"
            >
              <Checkbox id="nr-confirm" checked={confirmCaisse} onCheckedChange={(v) => setConfirmCaisse(v === true)} className="mt-0.5" />
              <span className="text-amber-900">
                Je confirme l&apos;autorisation d&apos;encaisser les paiements et d&apos;exporter les rapports financiers. <span className="text-red-500">*</span>
                <span className="block font-normal text-amber-700">Ces actions seront journalisées dans Audit & logs. Les exports restent limités aux agences affectées.</span>
              </span>
            </Label>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
              {checks.map((c) => (
                <span key={c.label} className={cn("inline-flex items-center gap-1 font-semibold", c.ok ? "text-emerald-600" : "text-muted-foreground")}>
                  <Check className="size-3.5" /> {c.label}
                </span>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Barre d'action */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white p-4">
        <p className="min-w-0 flex-1 text-xs">
          <span className="block text-[13px] font-bold">Tout est prêt pour créer ce rôle</span>
          <span className="text-muted-foreground">Le brouillon ne donne aucun droit aux utilisateurs.</span>
        </p>
        <Button variant="outline" size="lg" className="px-4 text-xs font-bold" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="gap-1.5 px-4 text-xs font-bold"
          onClick={() => toast.success("Brouillon enregistré", { description: `${nom || "Rôle"} • ${totalDroits} droits.` })}
        >
          <Save className="size-4" />
          Enregistrer le brouillon
        </Button>
        <Button size="lg" className="gap-1.5 px-4 text-xs font-bold" onClick={handleCreate}>
          <Plus className="size-4" />
          Créer le rôle
        </Button>
      </div>
    </div>
  );
}
