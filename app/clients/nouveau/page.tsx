"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  ArrowLeft,
  CheckCircle,
  CircleAlert,
  CloudOff,
  ExternalLink,
  FileText,
  Heart,
  History,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  Plus,
  Save,
  ScanSearch,
  ShieldCheck,
  User,
  UserCheck,
  UserSearch,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AGENCES, findDuplicateByPhone } from "../data";

const VILLES = [
  "Bingerville — Faya",
  "Bingerville — Cité",
  "Cocody — Angré",
  "Cocody — Riviera 3",
  "Plateau",
  "Marcory",
];

const GROUPES = ["Essentiel", "Argent", "Or", "Platine"];

const CONTACTS = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "appel", label: "Appel", icon: Phone },
  { value: "sms", label: "SMS", icon: MessageSquare },
  { value: "email", label: "E-mail", icon: Mail },
];

function CardIcon({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
      <Icon className="size-3.5 text-muted-foreground" />
    </span>
  );
}

function Required({ children }: { children: React.ReactNode }) {
  return (
    <span>
      {children} <span className="text-red-500">*</span>
    </span>
  );
}

export default function NouveauClientPage() {
  const router = useRouter();
  const { updatePath } = useGlobalData();

  const [nom, setNom] = useState("Koné");
  const [prenoms, setPrenoms] = useState("Aminata");
  const [tel1, setTel1] = useState("+225 07 48 22 16 03");
  const [tel2, setTel2] = useState("+225 00 00 00 00 00");
  const [email, setEmail] = useState("aminata.kone@gmail");
  const [adresse, setAdresse] = useState(
    "Rue des Jardins, résidence Les Lauriers",
  );
  const [ville, setVille] = useState("Bingerville — Faya");
  const [agence, setAgence] = useState("Bingerville");
  const [contact, setContact] = useState("whatsapp");
  const [groupe, setGroupe] = useState("Essentiel");
  const [parrainage, setParrainage] = useState("");
  const [note, setNote] = useState("");
  const [actif, setActif] = useState(true);
  const [consentSms, setConsentSms] = useState(true);
  const [consentEmails, setConsentEmails] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const emailInvalid = email.trim() !== "" && !/.+@.+\..+/.test(email.trim());
  const duplicate = useMemo(() => findDuplicateByPhone(tel1), [tel1]);

  const missing = {
    nom: nom.trim() === "",
    prenoms: prenoms.trim() === "",
    tel1: tel1.trim() === "",
    ville: ville === "",
    agence: agence === "",
  };
  const hasMissing = Object.values(missing).some(Boolean);

  const validate = (): boolean => {
    setSubmitted(true);
    if (hasMissing) {
      toast.error("Champs obligatoires manquants", {
        description: "Nom, prénoms, téléphone, ville et agence sont requis.",
      });
      return false;
    }
    if (emailInvalid) {
      toast.error("E-mail invalide", {
        description: "Ajoutez un domaine valide, par ex. .com",
      });
      return false;
    }
    if (duplicate) {
      toast.error("Doublon détecté", {
        description: `${duplicate.prenoms} ${duplicate.nom} • ${duplicate.code} existe déjà.`,
      });
      return false;
    }
    return true;
  };

  const handleSave = (withDepot: boolean) => {
    if (!validate()) return;
    if (withDepot) {
      toast.success("Client enregistré", {
        description: `${prenoms} ${nom} — création du dépôt…`,
      });
    } else {
      toast.success("Client enregistré", {
        description: `${prenoms} ${nom} a été ajouté au répertoire.`,
      });
    }
    updatePath("/clients");
  };

  const err = (invalid: boolean) =>
    submitted && invalid ? (
      <p className="mt-1 text-[11px] font-medium text-red-500">
        Ce champ est obligatoire.
      </p>
    ) : null;

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-start gap-2.5">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Retour aux clients"
          onClick={() => router.back()}
          className="mt-0.5 bg-primary text-white hover:bg-primary/90 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl">
            Nouveau client
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700"
            >
              ● Brouillon local
            </Badge>
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Créez une fiche complète en moins d&apos;une minute, même sans
            connexion.
          </p>
        </div>
      </div>

      {/* Bandeau hors ligne */}
      <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-100">
        <WifiOff className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <div className="text-xs">
          <p className="font-bold text-amber-800">Saisie hors ligne active</p>
          <p className="mt-0.5 text-amber-700">
            Le brouillon est enregistré sur cet appareil. Il sera synchronisé
            automatiquement dès le retour du réseau.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Colonne formulaire */}
        <div className="space-y-4 xl:col-span-2">
          {/* Identité */}
          <section className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Identité et coordonnées</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Les champs marqués d&apos;un astérisque sont obligatoires.
                </p>
              </div>
              <CardIcon icon={User} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label
                  htmlFor="nc-nom"
                  className="mb-1.5 text-xs font-semibold"
                >
                  <Required>Nom</Required>
                </Label>
                <Input
                  id="nc-nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  aria-invalid={submitted && missing.nom}
                  className="h-9 text-[13px]"
                />
                {err(missing.nom)}
              </div>
              <div>
                <Label
                  htmlFor="nc-prenoms"
                  className="mb-1.5 text-xs font-semibold"
                >
                  <Required>Prénoms</Required>
                </Label>
                <Input
                  id="nc-prenoms"
                  value={prenoms}
                  onChange={(e) => setPrenoms(e.target.value)}
                  aria-invalid={submitted && missing.prenoms}
                  className="h-9 text-[13px]"
                />
                {err(missing.prenoms)}
              </div>
              <div>
                <Label
                  htmlFor="nc-tel1"
                  className="mb-1.5 text-xs font-semibold"
                >
                  <Required>Téléphone principal</Required>
                </Label>
                <Input
                  id="nc-tel1"
                  value={tel1}
                  onChange={(e) => setTel1(e.target.value)}
                  aria-invalid={submitted && missing.tel1}
                  className="h-9 text-[13px]"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Vérification automatique des doublons
                </p>
                {err(missing.tel1)}
              </div>
              <div>
                <Label
                  htmlFor="nc-tel2"
                  className="mb-1.5 text-xs font-semibold"
                >
                  Téléphone secondaire
                </Label>
                <Input
                  id="nc-tel2"
                  value={tel2}
                  onChange={(e) => setTel2(e.target.value)}
                  placeholder="+225 00 00 00 00 00"
                  className="h-9 text-[13px]"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Facultatif
                </p>
              </div>
              <div className="sm:col-span-2">
                <Label
                  htmlFor="nc-email"
                  className="mb-1.5 text-xs font-semibold"
                >
                  E-mail
                </Label>
                <div className="relative">
                  <Input
                    id="nc-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={emailInvalid}
                    placeholder="ex. aminata.kone@gmail.com"
                    className="h-9 pr-9 text-[13px]"
                  />
                  {emailInvalid && (
                    <CircleAlert className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-red-500" />
                  )}
                </div>
                {emailInvalid && (
                  <p className="mt-1 text-[11px] font-medium text-red-500">
                    Adresse incomplète : ajoutez un domaine valide, par ex. .com
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Label
                  htmlFor="nc-adresse"
                  className="mb-1.5 text-xs font-semibold"
                >
                  Adresse
                </Label>
                <Input
                  id="nc-adresse"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  className="h-9 text-[13px]"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Précisez un repère pour faciliter les livraisons.
                </p>
              </div>
              <div>
                <Label
                  htmlFor="nc-ville"
                  className="mb-1.5 text-xs font-semibold"
                >
                  <Required>Ville / quartier</Required>
                </Label>
                <Select value={ville} onValueChange={(v) => setVille(v ?? "")}>
                  <SelectTrigger
                    id="nc-ville"
                    className="w-full text-[13px] data-[size=default]:h-9"
                  >
                    <SelectValue placeholder="Sélectionner…" />
                  </SelectTrigger>
                  <SelectContent>
                    {VILLES.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {err(missing.ville)}
              </div>
              <div>
                <Label
                  htmlFor="nc-agence"
                  className="mb-1.5 text-xs font-semibold"
                >
                  <Required>Agence de référence</Required>
                </Label>
                <Select
                  value={agence}
                  onValueChange={(v) => setAgence(v ?? "")}
                >
                  <SelectTrigger
                    id="nc-agence"
                    className="w-full text-[13px] data-[size=default]:h-9"
                  >
                    <SelectValue placeholder="Sélectionner…" />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENCES.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Agence utilisée par défaut pour les dépôts.
                </p>
                {err(missing.agence)}
              </div>
            </div>
          </section>

          {/* Relation client */}
          <section className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Relation client</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Personnalisez les échanges et le programme de fidélité.
                </p>
              </div>
              <CardIcon icon={Heart} />
            </div>

            <p className="mt-4 mb-1.5 text-xs font-semibold">
              Préférence de contact
            </p>
            <RadioGroup
              value={contact}
              onValueChange={setContact}
              className="flex flex-wrap gap-2"
            >
              {CONTACTS.map((c) => {
                const selected = contact === c.value;
                return (
                  <Label
                    key={c.value}
                    htmlFor={`nc-contact-${c.value}`}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                      selected
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <RadioGroupItem
                      id={`nc-contact-${c.value}`}
                      value={c.value}
                    />
                    <c.icon className="size-3.5" />
                    {c.label}
                  </Label>
                );
              })}
            </RadioGroup>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label
                  htmlFor="nc-groupe"
                  className="mb-1.5 text-xs font-semibold"
                >
                  Groupe de fidélité
                </Label>
                <Select
                  value={groupe}
                  onValueChange={(v) => setGroupe(v ?? "Essentiel")}
                >
                  <SelectTrigger
                    id="nc-groupe"
                    className="w-full text-[13px] data-[size=default]:h-9"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUPES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Le niveau évolue selon les dépenses.
                </p>
              </div>
              <div>
                <Label
                  htmlFor="nc-parrainage"
                  className="mb-1.5 text-xs font-semibold"
                >
                  Code de parrainage
                </Label>
                <Input
                  id="nc-parrainage"
                  value={parrainage}
                  onChange={(e) => setParrainage(e.target.value)}
                  placeholder="Ex. AK-2026"
                  className="h-9 text-[13px]"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Facultatif - attribue le bonus au parrain.
                </p>
              </div>
            </div>
          </section>

          {/* Notes internes */}
          <section className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Notes internes</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Visibles uniquement par les équipes SPARK PRESSING.
                </p>
              </div>
              <CardIcon icon={FileText} />
            </div>
            <Label
              htmlFor="nc-note"
              className="mt-4 mb-1.5 text-xs font-semibold"
            >
              Note
            </Label>
            <Textarea
              id="nc-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ajoutez une consigne, une préférence de traitement ou un contexte utile…"
              className="min-h-20 text-[13px]"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Évitez d&apos;inscrire des données sensibles ou bancaires.
            </p>
          </section>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Statut du client</h2>
            <div className="mt-2 flex items-start justify-between gap-2">
              <div className="text-xs">
                <p className="font-semibold">Client actif</p>
                <p className="mt-0.5 text-muted-foreground">
                  Peut effectuer des dépôts et recevoir des messages.
                </p>
              </div>
              <Switch
                checked={actif}
                onCheckedChange={setActif}
                aria-label="Client actif"
              />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[13px] font-bold">Contrôle des doublons</h2>
              <CardIcon icon={ScanSearch} />
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Recherche basée sur les numéros de téléphone.
            </p>
            {duplicate ? (
              <>
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 ring-1 ring-red-100">
                  <UserSearch className="mt-0.5 size-4 shrink-0 text-red-500" />
                  <p className="text-[11px] leading-snug text-red-700">
                    <span className="font-bold">Client existant détecté</span>
                    <br />
                    Le {duplicate.phone.replace("+225 ", "")} est déjà associé à{" "}
                    {duplicate.prenoms} {duplicate.nom} • {duplicate.code} •{" "}
                    {duplicate.agency}.
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-[11px] text-muted-foreground">
                    Évitez une seconde fiche.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-[11px] font-bold"
                    onClick={() => updatePath(`/clients/${duplicate.code}`)}
                  >
                    <ExternalLink className="size-3.5" />
                    Ouvrir la fiche
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-green-50 p-3 ring-1 ring-green-100">
                  <CheckCircle className="mt-0.5 size-4 shrink-0 text-green-800" />
                  <p className="text-[11px] leading-snug text-green-900">
                    <span className="font-bold">Aucun doublon détecté</span>
                    <br />
                    Les deux numéros sont uniques dans le portefeuille client.
                  </p>
                </div>
              </>
            )}
          </section>

          <section className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[13px] font-bold">Consentements</h2>
              <CardIcon icon={ShieldCheck} />
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Conservez une preuve claire du choix du client.
            </p>
            <div className="mt-3 space-y-3">
              <Label
                htmlFor="nc-sms"
                className="flex cursor-pointer items-start gap-2.5 text-xs"
              >
                <Checkbox
                  id="nc-sms"
                  checked={consentSms}
                  onCheckedChange={(v) => setConsentSms(v === true)}
                  className="mt-0.5"
                />
                <span>
                  <span className="block font-semibold">Autoriser les SMS</span>
                  <span className="block font-normal text-muted-foreground">
                    Suivi des dépôts, retraits et offres ponctuelles.
                  </span>
                </span>
              </Label>
              <Label
                htmlFor="nc-emails"
                className="flex cursor-pointer items-start gap-2.5 text-xs"
              >
                <Checkbox
                  id="nc-emails"
                  checked={consentEmails}
                  onCheckedChange={(v) => setConsentEmails(v === true)}
                  className="mt-0.5"
                />
                <span>
                  <span className="block font-semibold">
                    Autoriser les e-mails
                  </span>
                  <span className="block font-normal text-muted-foreground">
                    Reçus, actualités et avantages fidélité.
                  </span>
                </span>
              </Label>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Le client peut modifier ses choix à tout moment depuis sa fiche.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[13px] font-bold">Archivage et historique</h2>
              <CardIcon icon={Archive} />
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-sky-50 p-3 ring-1 ring-sky-100">
              <History className="mt-0.5 size-4 shrink-0 text-sky-600" />
              <p className="text-[11px] leading-snug text-sky-800">
                <span className="font-bold">Historique conservé</span>
                <br />
                En cas d&apos;archivage, les dépôts, paiements, notes et points
                de fidélité restent accessibles en lecture seule.
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[13px] font-bold">Synchronisation</h2>
              <CardIcon icon={CloudOff} />
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Ce brouillon est stocké localement.
            </p>
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 ring-1 ring-amber-100">
              <UserCheck className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <p className="text-[11px] leading-snug text-amber-800">
                <span className="font-bold">En attente du réseau</span>
                <br />
                La fiche sera envoyée sans ressaisie.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Pied de formulaire */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Save className="size-3.5" />
          Brouillon local enregistré il y a quelques secondes
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="lg"
            className="px-4 text-xs font-bold"
            onClick={() => updatePath("/clients")}
          >
            Annuler
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-4 text-xs font-bold"
            onClick={() => handleSave(false)}
          >
            <Save className="size-3.5" />
            Enregistrer
          </Button>
          <Button
            size="lg"
            className="gap-1.5 px-4 text-xs font-bold"
            onClick={() => handleSave(true)}
          >
            <Plus className="size-4" />
            Enregistrer et créer un dépôt
          </Button>
        </div>
      </div>
    </div>
  );
}
