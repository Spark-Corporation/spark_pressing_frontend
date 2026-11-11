"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ArrowLeft,
  CheckCircle,
  CircleAlert,
  ExternalLink,
  FileText,
  Heart,
  History,
  Loader2,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  Plus,
  Save,
  ScanSearch,
  ShieldCheck,
  User,
  UserSearch,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useGlobalData } from "@/contexts/GlobalContext";
import { useAuth } from "@/contexts/AuthContext";
import { handleApiAction } from "@/functions/handleResponseApi";
import {
  checkClientDuplicatesAction,
  createClientAction,
  getNetworkOverviewAction,
} from "@/actions/AdminAction";
import type { NetworkOverviewData } from "@/app/multi-agences/types";
import type { ClientCreatePayload, ClientDuplicateMatch } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const GROUPES = ["Essentiel", "Argent", "Or", "Platine"];

const CONTACTS = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "appel", label: "Appel", icon: Phone },
  { value: "sms", label: "SMS", icon: MessageSquare },
  { value: "email", label: "E-mail", icon: Mail },
];

/** Chiffres uniquement, sans l'indicatif 225 (format attendu par l'API). */
function normalizePhoneValue(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("225") && digits.length > 10) digits = digits.slice(3);
  return digits;
}

/** Mot de passe aléatoire pour le compte client (réinitialisable par le client). */
function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const random = new Uint32Array(12);
  crypto.getRandomValues(random);
  return Array.from(random, (n) => chars[n % chars.length]).join("");
}

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
  const { logout } = useAuth();

  const [nom, setNom] = useState("");
  const [prenoms, setPrenoms] = useState("");
  const [tel1, setTel1] = useState("");
  const [tel2, setTel2] = useState("");
  const [email, setEmail] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ville, setVille] = useState("");
  const [agenceId, setAgenceId] = useState<string | null>(null);
  const [contact, setContact] = useState("whatsapp");
  const [groupe, setGroupe] = useState("Essentiel");
  const [parrainage, setParrainage] = useState("");
  const [note, setNote] = useState("");
  const [actif, setActif] = useState(true);
  const [consentSms, setConsentSms] = useState(true);
  const [consentEmails, setConsentEmails] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Agences chargées depuis l'API (agency_id réel requis par POST /clients)
  const [agences, setAgences] = useState<{ id: number; name: string }[]>([]);
  const [agencesLoading, setAgencesLoading] = useState(true);

  // Contrôle des doublons côté serveur (GET /clients/duplicates)
  const [dupState, setDupState] = useState<"idle" | "checking" | "checked">("idle");
  const [duplicates, setDuplicates] = useState<ClientDuplicateMatch[]>([]);
  const [dupError, setDupError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const dupReqRef = useRef(0);

  const fullname = `${prenoms} ${nom}`.trim();
  const emailInvalid = email.trim() !== "" && !/.+@.+\..+/.test(email.trim());

  const phoneDup = useMemo(() => {
    const typed = normalizePhoneValue(tel1);
    if (typed.length < 6) return undefined;
    return duplicates.find((d) => {
      const known = normalizePhoneValue(d.phone_number);
      return known.endsWith(typed) || typed.endsWith(known);
    });
  }, [duplicates, tel1]);

  const missing = {
    nom: nom.trim() === "",
    prenoms: prenoms.trim() === "",
    tel1: tel1.trim() === "",
    ville: ville.trim() === "",
    agence: agenceId === null,
  };
  const hasMissing = Object.values(missing).some(Boolean);

  /** Interroge l'API sur le téléphone (principal/secondaire) et l'e-mail saisis. */
  const runDuplicateCheck = async (): Promise<ClientDuplicateMatch[]> => {
    const phone1 = normalizePhoneValue(tel1);
    const phone2 = normalizePhoneValue(tel2);
    const mail = email.trim();
    const checks: { phone?: string; email?: string }[] = [];
    if (phone1) checks.push({ phone: phone1 });
    if (phone2 && phone2 !== phone1) checks.push({ phone: phone2 });
    if (mail) checks.push({ email: mail });

    if (checks.length === 0) {
      dupReqRef.current += 1;
      setDupState("idle");
      setDuplicates([]);
      setDupError(null);
      return [];
    }

    const reqId = (dupReqRef.current += 1);
    setDupState("checking");

    const results = await Promise.allSettled(
      checks.map((c) => checkClientDuplicatesAction(c)),
    );
    if (reqId !== dupReqRef.current) return []; // réponse périmée, on ignore

    const matches: ClientDuplicateMatch[] = [];
    let failed = false;
    for (const r of results) {
      const v = r.status === "fulfilled" ? r.value : null;
      if (v?.success) {
        for (const m of v.data.matches) {
          if (!matches.some((x) => x.id === m.id)) matches.push(m);
        }
      } else {
        failed = true;
      }
    }

    if (failed && matches.length === 0) {
      setDupState("checked");
      setDuplicates([]);
      setDupError(
        "Le serveur n'a pas répondu. La vérification sera refaite à l'enregistrement.",
      );
      return [];
    }

    setDupError(null);
    setDuplicates(matches);
    setDupState("checked");
    return matches;
  };

  // Chargement des agences au montage
  useEffect(() => {
    handleApiAction({
      action: getNetworkOverviewAction,
      logout,
      onSuccess: (res) => {
        const data = res as NetworkOverviewData;
        setAgences((data.agencies ?? []).map((a) => ({ id: a.agency_id, name: a.name })));
        setAgencesLoading(false);
      },
      onError: () => setAgencesLoading(false),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Vérification des doublons avec rebond (600 ms) à chaque frappe
  useEffect(() => {
    const timer = setTimeout(() => {
      void runDuplicateCheck();
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tel1, tel2, email]);

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
    return true;
  };

  const handleSave = async (withDepot: boolean) => {
    if (saving || !validate()) return;
    setSaving(true);
    try {
      // Dernière vérification des doublons juste avant l'enregistrement.
      const matches = await runDuplicateCheck();
      if (matches.length > 0) {
        toast.error("Doublon détecté", {
          description: `${matches[0].fullname} • ${matches[0].code} utilise déjà ce téléphone ou cet e-mail.`,
        });
        return;
      }

      const payload: ClientCreatePayload = {
        fullname,
        last_name: nom.trim(),
        first_name: prenoms.trim(),
        phone_number: normalizePhoneValue(tel1),
        ...(email.trim() ? { email: email.trim() } : {}),
        ...(adresse.trim() ? { address: adresse.trim() } : {}),
        ...(ville ? { city: ville } : {}),
        password: generatePassword(),
        ...(parrainage.trim() ? { sponsor_code: parrainage.trim() } : {}),
        ...(tel2.trim() ? { phone_secondary: normalizePhoneValue(tel2) } : {}),
        ...(agenceId ? { agency_id: Number(agenceId) } : {}),
        contact_preference: contact,
        loyalty_tier: groupe,
        consent_sms: consentSms,
        consent_email: consentEmails,
        status: actif,
        ...(note.trim() ? { note: note.trim() } : {}),
      };

      await handleApiAction({
        action: createClientAction,
        params: payload,
        logout,
        onSuccess: () => {
          toast.success("Client enregistré", {
            description: withDepot
              ? `${fullname} — création du dépôt…`
              : `${fullname} a été ajouté au répertoire.`,
          });
          if (withDepot) {
            updatePath("/depots/nouveau");
          } else {
            updatePath("/clients");
          }
        },
      });
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
            Nouveau client
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Créez une fiche complète en moins d&apos;une minute. Le téléphone et
            l&apos;e-mail sont vérifiés automatiquement.
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
                {dupState === "checking" ? (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-sky-600">
                    <Loader2 className="size-3 animate-spin" />
                    Vérification des doublons…
                  </p>
                ) : phoneDup ? (
                  <p className="mt-1 text-[11px] font-medium text-red-500">
                    Numéro déjà associé à {phoneDup.fullname} • {phoneDup.code}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Contrôle automatique des doublons (téléphone et e-mail)
                  </p>
                )}
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
                <Input
                  id="nc-ville"
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  aria-invalid={submitted && missing.ville}
                  placeholder="ex. Bingerville — Faya"
                  className="h-9 text-[13px]"
                />
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
                  value={agenceId}
                  onValueChange={(v) => setAgenceId((v as string) ?? null)}
                >
                  <SelectTrigger
                    id="nc-agence"
                    className="w-full text-[13px] data-[size=default]:h-9"
                  >
                    {/* Affiche le nom de l'agence ; la valeur reste l'id envoyé au backend. */}
                    <SelectValue placeholder="Sélectionner…">
                      {(value: string | null) => {
                        if (!value) return "Sélectionner…";
                        return (
                          agences.find((a) => String(a.id) === String(value))
                            ?.name ?? String(value)
                        );
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {agencesLoading ? (
                      <SelectItem value="__loading" disabled>
                        Chargement des agences…
                      </SelectItem>
                    ) : agences.length === 0 ? (
                      <SelectItem value="__empty" disabled>
                        Aucune agence disponible
                      </SelectItem>
                    ) : (
                      agences.map((a) => (
                        <SelectItem key={a.id} value={String(a.id)}>
                          {a.name}
                        </SelectItem>
                      ))
                    )}
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
              Basé sur le téléphone (principal ou secondaire) et
              l&apos;e-mail.
            </p>
            {dupState === "idle" && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/50 p-3 ring-1 ring-border">
                <ScanSearch className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="text-[11px] leading-snug text-muted-foreground">
                  <span className="font-bold text-foreground">
                    En attente de saisie
                  </span>
                  <br />
                  Renseignez un numéro ou un e-mail pour lancer la vérification
                  dans le portefeuille client.
                </p>
              </div>
            )}
            {dupState === "checking" && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-sky-50 p-3 ring-1 ring-sky-100">
                <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-sky-600" />
                <p className="text-[11px] leading-snug text-sky-800">
                  <span className="font-bold">Vérification en cours…</span>
                  <br />
                  Contrôle des numéros et de l&apos;e-mail côté serveur.
                </p>
              </div>
            )}
            {dupState === "checked" && dupError && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 ring-1 ring-amber-100">
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <p className="text-[11px] leading-snug text-amber-800">
                  <span className="font-bold">Vérification impossible</span>
                  <br />
                  {dupError}
                </p>
              </div>
            )}
            {dupState === "checked" && !dupError && duplicates.length === 0 && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-green-50 p-3 ring-1 ring-green-100">
                <CheckCircle className="mt-0.5 size-4 shrink-0 text-green-800" />
                <p className="text-[11px] leading-snug text-green-900">
                  <span className="font-bold">Aucun doublon détecté</span>
                  <br />
                  Les numéros et l&apos;e-mail sont uniques dans le portefeuille
                  client.
                </p>
              </div>
            )}
            {dupState === "checked" && !dupError && duplicates.length > 0 && (
              <>
                <div className="mt-3 space-y-2">
                  {duplicates.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-start gap-2 rounded-lg bg-red-50 p-3 ring-1 ring-red-100"
                    >
                      <UserSearch className="mt-0.5 size-4 shrink-0 text-red-500" />
                      <div className="min-w-0 flex-1 text-[11px] leading-snug text-red-700">
                        <p className="font-bold">{d.fullname}</p>
                        <p>
                          {d.phone_number} • {d.code} • {d.agency}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-[11px] font-bold"
                        onClick={() => updatePath(`/clients/${d.id}`)}
                      >
                        <ExternalLink className="size-3.5" />
                        Fiche
                      </Button>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Ce téléphone ou cet e-mail existe déjà. Évitez une seconde
                  fiche.
                </p>
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
        </div>
      </div>

      {/* Pied de formulaire */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Save className="size-3.5" />
          {saving
            ? "Enregistrement en cours…"
            : "La fiche sera ajoutée au répertoire client partagé."}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="lg"
            className="px-4 text-xs font-bold"
            disabled={saving}
            onClick={() => updatePath("/clients")}
          >
            Annuler
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-4 text-xs font-bold"
            disabled={saving}
            onClick={() => void handleSave(false)}
          >
            <Save className="size-3.5" />
            Enregistrer
          </Button>
          <Button
            size="lg"
            className="gap-1.5 px-4 text-xs font-bold"
            disabled={saving}
            onClick={() => void handleSave(true)}
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            {saving ? "Enregistrement…" : "Enregistrer et créer un dépôt"}
          </Button>
        </div>
      </div>
    </div>
  );
}
