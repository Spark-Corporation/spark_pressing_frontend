"use client";

import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldLabel, Section, dirtyCount } from "../_components";

const INITIAL = {
  raison: "SPARK PRESSING SARL",
  commercial: "SPARK PRESSING",
  pays: "Côte d'Ivoire",
  devise: "FCFA / XAF",
  fuseau: "Afrique/Abidjan • UTC+00",
  tel: "+225 27 22 00 45 80",
  email: "contact@sparkpressing.ci",
  adresse: "Boulevard François Mitterrand, Cocody, Abidjan",
  fiches: "globales",
  catalogue: "partage",
  confirmClients: false,
  confirmCatalogue: false,
  agenceDefaut: "Bingerville",
  regNom: "Bingerville",
  regStatut: "Active dans l'enseigne",
  regAdresse: "Route d'Eloka, quartier Résidentiel",
  regVille: "Bingerville",
  regTel: "+225 07 08 24 10 10",
  regEmail: "bingerville@sparkpressing.ci",
  regResp: "Moussa Kouassi",
  regSuppleant: "Aïcha Koné",
  defautActive: true,
};

const AGENCES_LIST = [
  ["Bingerville - Par défaut", "Adresse : route d'Eloka, quartier Résidentiel", "Contacts : +225 07 08 24 10 10 • bingerville@sparkpressing.ci", "Horaires : lun–sam 08:00–18:00 • dim fermé", "Responsable : Moussa Kouassi"],
  ["Plateau - Autorisée", "Adresse : avenue Noguès, Immeuble Horizon", "Contacts : +225 27 20 24 10 11 • plateau@sparkpressing.ci", "Horaires : lun–sam 07:30–18:30 • dim fermé", "Responsable : Mariam Traoré"],
  ["Cocody Angré - Autorisée", "Adresse : Angré 8e tranche, voie principale", "Contacts : +225 07 08 24 10 12 • cocody@sparkpressing.ci", "Horaires : lun–sam 08:00–19:00 • dim fermé", "Responsable : Nadia Assi"],
  ["Marcory - Autorisée", "Adresse : boulevard VGE, Zone 4", "Contacts : +225 07 08 24 10 13 • marcory@sparkpressing.ci", "Horaires : lun–sam 08:00–18:00 • dim fermé", "Responsable : Awa Koné"],
];

export default function OrganisationPage() {
  const router = useRouter();
  const { updatePath } = useGlobalData();
  const [base, setBase] = useState(INITIAL);
  const [form, setForm] = useState(INITIAL);
  const dirty = dirtyCount(base, form);
  const set = (k: keyof typeof INITIAL, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    setBase(form);
    toast.success("Organisation enregistrée", { description: "4 agences • identité et périmètres mis à jour." });
  };

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Retour aux paramètres"
          onClick={() => router.back()}
          className="mt-1 bg-primary text-white hover:bg-primary/90 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Organisation & agences</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Identité de l&apos;enseigne, périmètres partagés et réglages des agences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="lg" className="px-4 text-xs font-bold" onClick={() => { setForm(base); toast.info("Modifications annulées"); }}>
            Annuler
          </Button>
          <Button size="lg" className="gap-1.5 px-4 text-xs font-bold" onClick={handleSave}>
            <Save className="size-4" />
            Enregistrer
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 text-[11px]">
        <Badge variant="outline" className="border-0 bg-muted font-semibold text-foreground">
          Paramètres de l&apos;enseigne
        </Badge>
        <span className="text-muted-foreground">SPARK PRESSING • 4 agences autorisées • Accès directrice réseau</span>
      </div>

      {dirty > 0 && (
        <div className="rounded-xl bg-amber-50 px-4 py-2.5 text-xs ring-1 ring-amber-100">
          <p className="font-bold text-amber-800">{dirty} changements non enregistrés</p>
          <p className="text-amber-700">Dernière sauvegarde aujourd&apos;hui à 09:14 • Vérifiez les règles avant d&apos;enregistrer. Les réglages ne sont pas encore appliqués.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Section title="Identité de l'enseigne" sub="Informations utilisées sur les documents et au point de vente.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel required>Raison sociale</FieldLabel>
                <Input value={form.raison} onChange={(e) => set("raison", e.target.value)} className="h-9 text-[13px] font-bold" />
              </div>
              <div>
                <FieldLabel required>Nom commercial</FieldLabel>
                <Input value={form.commercial} onChange={(e) => set("commercial", e.target.value)} className="h-9 text-[13px] font-bold" />
              </div>
              <div>
                <FieldLabel>Pays</FieldLabel>
                <Select value={form.pays} onValueChange={(v) => set("pays", v ?? form.pays)}>
                  <SelectTrigger className="w-full text-[13px] data-[size=default]:h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Côte d'Ivoire", "Cameroun", "Sénégal"].map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel required>Devise de l&apos;enseigne</FieldLabel>
                <Select value={form.devise} onValueChange={(v) => set("devise", v ?? form.devise)}>
                  <SelectTrigger className="w-full text-[13px] data-[size=default]:h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["FCFA / XAF", "FCFA / XOF", "GHS", "NGN"].map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1 text-[11px] text-muted-foreground">Devise affichée dans les montants et reçus.</p>
              </div>
              <div>
                <FieldLabel>Fuseau horaire</FieldLabel>
                <Input value={form.fuseau} onChange={(e) => set("fuseau", e.target.value)} className="h-9 text-[13px]" />
              </div>
              <div>
                <FieldLabel>Téléphone principal</FieldLabel>
                <Input value={form.tel} onChange={(e) => set("tel", e.target.value)} className="h-9 text-[13px]" />
              </div>
              <div>
                <FieldLabel>E-mail de contact</FieldLabel>
                <Input value={form.email} onChange={(e) => set("email", e.target.value)} className="h-9 text-[13px]" />
              </div>
              <div>
                <FieldLabel>Adresse du siège</FieldLabel>
                <Input value={form.adresse} onChange={(e) => set("adresse", e.target.value)} className="h-9 text-[13px]" />
              </div>
            </div>
            <p className="mt-2 rounded-lg bg-amber-50 p-2.5 text-[11px] leading-snug text-amber-800 ring-1 ring-amber-100">
              <span className="font-bold">Pays et devise à confirmer</span>
              <br />
              FCFA / XAF est sélectionné. La Côte d&apos;Ivoire utilise habituellement le XOF : validez la cohérence avant publication. Aucune conversion des montants existants n&apos;est réalisée.
            </p>
          </Section>

          <Section title="Portée des clients et du catalogue" sub="Deux décisions d'organisation indépendantes, à valider explicitement.">
            <p className="text-xs font-semibold">Fiches clients</p>
            <RadioGroup
              value={form.fiches as string}
              onValueChange={(v) => set("fiches", v)}
              className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-2"
            >
              {(["globales", "propres"] as const).map((v) => (
                <Label
                  key={v}
                  htmlFor={`org-fiches-${v}`}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
                >
                  <RadioGroupItem id={`org-fiches-${v}`} value={v} />
                  {v === "globales" ? "Globaux à l'enseigne" : "Propres à chaque agence"}
                </Label>
              ))}
            </RadioGroup>
            <p className="mt-1 text-[11px] text-muted-foreground">Globaux : une fiche partagée, avec accès selon les autorisations du staff.</p>
            <p className="mt-3 text-xs font-semibold">Catalogue et articles</p>
            <RadioGroup
              value={form.catalogue as string}
              onValueChange={(v) => set("catalogue", v)}
              className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-2"
            >
              {(["partage", "paragence"] as const).map((v) => (
                <Label
                  key={v}
                  htmlFor={`org-cat-${v}`}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
                >
                  <RadioGroupItem id={`org-cat-${v}`} value={v} />
                  {v === "partage" ? "Catalogue partagé" : "Catalogue par agence"}
                </Label>
              ))}
            </RadioGroup>
            <p className="mt-1 text-[11px] text-muted-foreground">Les tarifs et exceptions restent gérés dans les réglages opérationnels existants.</p>
            <div className="mt-2 space-y-1.5">
              <Label htmlFor="org-cc" className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                <Checkbox id="org-cc" checked={form.confirmClients as boolean} onCheckedChange={(v) => set("confirmClients", v === true)} />
                Confirmer le périmètre clients - Désactivé
              </Label>
              <Label htmlFor="org-ck" className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                <Checkbox id="org-ck" checked={form.confirmCatalogue as boolean} onCheckedChange={(v) => set("confirmCatalogue", v === true)} />
                Confirmer le périmètre catalogue - Désactivé
              </Label>
            </div>
            <p className="mt-2 rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-800 ring-1 ring-amber-100">
              <span className="font-bold">Aucune migration implicite</span>
              <br />
              Tout changement de portée ouvre une revue des impacts et un plan de migration séparé.
            </p>
          </Section>

          <Section title="Agences autorisées" sub="Les agences de cette enseigne uniquement ; aucun tenant à créer ici.">
            <p className="text-[11px] font-bold">4 agences actives</p>
            <div className="mt-2">
              <FieldLabel>Agence par défaut</FieldLabel>
              <Select value={form.agenceDefaut as string} onValueChange={(v) => set("agenceDefaut", v ?? "Bingerville")}>
                <SelectTrigger className="w-full text-[13px] data-[size=default]:h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Bingerville", "Plateau", "Cocody Angré", "Marcory"].map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-[11px] text-muted-foreground">Doit apparaître à la liste des agences autorisées.</p>
            </div>
            <div className="mt-3 space-y-2">
              {AGENCES_LIST.map(([title, ...lignes]) => (
                <div key={title} className="rounded-lg border border-border p-3">
                  <p className="text-xs font-extrabold">{title}</p>
                  {lignes.map((l) => (
                    <p key={l} className="text-[11px] text-muted-foreground">{l}</p>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-auto p-0 text-[11px] font-bold"
                    onClick={() => toast.info(title, { description: "Réglages de l'agence sélectionnée." })}
                  >
                    {title.startsWith("Bingerville") ? "Régler l'agence sélectionnée →" : "Configurer →"}
                  </Button>
                </div>
              ))}
            </div>
          </Section>

          <Section
            title="Réglages de l'agence - Bingerville"
            sub="Formulaire de configuration de l'agence sélectionnée"
            right={
              <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-muted-foreground">
                Brouillon
              </Badge>
            }
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel required>Nom de l&apos;agence</FieldLabel>
                <Input value={form.regNom as string} onChange={(e) => set("regNom", e.target.value)} className="h-9 text-[13px]" />
              </div>
              <div>
                <FieldLabel required>Statut autorisé</FieldLabel>
                <Select value={form.regStatut as string} onValueChange={(v) => set("regStatut", v ?? "")}>
                  <SelectTrigger className="w-full text-[13px] data-[size=default]:h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Active dans l'enseigne", "Suspendue", "Fermée"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>Adresse</FieldLabel>
                <Input value={form.regAdresse as string} onChange={(e) => set("regAdresse", e.target.value)} className="h-9 text-[13px]" />
              </div>
              <div>
                <FieldLabel>Ville</FieldLabel>
                <Input value={form.regVille as string} onChange={(e) => set("regVille", e.target.value)} className="h-9 text-[13px]" />
              </div>
              <div>
                <FieldLabel>Téléphone agence</FieldLabel>
                <Input value={form.regTel as string} onChange={(e) => set("regTel", e.target.value)} className="h-9 text-[13px]" />
              </div>
              <div>
                <FieldLabel>E-mail agence</FieldLabel>
                <Input value={form.regEmail as string} onChange={(e) => set("regEmail", e.target.value)} className="h-9 text-[13px]" />
              </div>
              <div>
                <FieldLabel>Responsable principal</FieldLabel>
                <Input value={form.regResp as string} onChange={(e) => set("regResp", e.target.value)} className="h-9 text-[13px]" />
              </div>
              <div>
                <FieldLabel>Responsable suppléant</FieldLabel>
                <Input value={form.regSuppleant as string} onChange={(e) => set("regSuppleant", e.target.value)} className="h-9 text-[13px]" />
              </div>
            </div>
            <Label htmlFor="org-def" className="mt-3 flex cursor-pointer items-start gap-2 text-xs">
              <Checkbox id="org-def" checked={form.defautActive as boolean} onCheckedChange={(v) => set("defautActive", v === true)} className="mt-0.5" />
              <span>
                <span className="block font-bold">Utiliser cette agence par défaut - Activé</span>
                <span className="block font-normal text-muted-foreground">Bingerville sera proposée à l&apos;ouverture du POS, selon les droits du staff.</span>
              </span>
            </Label>
            <div className="mt-3 space-y-2 text-xs">
              <div>
                <p className="font-bold">Lundi à vendredi</p>
                <p className="text-muted-foreground">Ouverture 08:00 • fermeture 18:00 • pause 12:30-13:30</p>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-[11px] font-bold" onClick={() => toast.info("Horaires", { description: "Lundi à vendredi • Bingerville." })}>Modifier les horaires →</Button>
              </div>
              <div>
                <p className="font-bold">Samedi</p>
                <p className="text-muted-foreground">Ouverture 08:00 • fermeture 18:00 • sans pause</p>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-[11px] font-bold" onClick={() => toast.info("Horaires", { description: "Samedi • Bingerville." })}>Modifier les horaires →</Button>
              </div>
              <div>
                <p className="font-bold">Dimanche et jours exceptionnels</p>
                <p className="text-muted-foreground">Dimanche fermé • jours fériés sur calendrier de l&apos;agence</p>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-[11px] font-bold" onClick={() => toast.info("Exception", { description: "Ajouter un jour exceptionnel." })}>Ajouter une exception →</Button>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Validation de l&apos;agence : Nom, adresse, téléphone et responsable sont requis. La fermeture doit suivre l&apos;ouverture : aucune plage ne peut se chevaucher. Le responsable doit être habilité dans cette agence.
            </p>
          </Section>

          <Section title="Vérification avant enregistrement" sub="Champs * requis • 4 agences vérifiées • pays/devise et décisions de portée à valider. Aucune migration ne sera déclenchée par la sauvegarde.">
            <p className="text-[11px] text-muted-foreground">Les modifications sont attribuées à Aïcha Koné et consignées dans le journal de l&apos;enseigne.</p>
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Aperçu de l'organisation" sub="Impact des réglages proposés.">
            <div className="rounded-lg bg-muted/50 p-3 text-xs">
              <p className="font-extrabold">{form.commercial || "SPARK PRESSING"}</p>
              <div className="mt-2 space-y-1.5">
                {[
                  ["Agences autorisées", "4 actives"],
                  ["Agence par défaut", form.agenceDefaut],
                  ["Clients", form.fiches === "globales" ? "Globaux - à valider" : "Par agence - à valider"],
                  ["Catalogue", form.catalogue === "partage" ? "Partagé - à valider" : "Par agence - à valider"],
                  ["Montants", `${form.devise} - à vérifier`],
                  ["Heure locale", "10:34 - UTC+00"],
                ].map(([k, v]) => (
                  <p key={k as string} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="text-right font-bold">{v as string}</span>
                  </p>
                ))}
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Ces valeurs restent en brouillon jusqu&apos;à leur validation.</p>
          </Section>

          <Section title="Modules associés" sub="Poursuivre dans les configurations existantes.">
            <p className="text-[11px] text-muted-foreground">Une seule source de réglage</p>
            <div className="mt-2 space-y-1.5">
              {(
                [
                  ["Utilisateurs & rôles", "/equipe"],
                  ["Branding - logo et tickets", "/parametres/branding"],
                  ["Configuration opérationnelle", "/parametres/operations"],
                  ["Catalogue - articles & tarifs", "/articles"],
                ] as const
              ).map(([label, route]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => updatePath(route)}
                  className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-xs font-semibold transition-colors hover:border-primary/40"
                >
                  {label}
                  <span aria-hidden>→</span>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Avant de publier" sub="Les décisions sensibles ne sont pas automatiques.">
            <div className="space-y-2 text-xs">
              <div>
                <p className="font-bold">Identité et contacts</p>
                <p className="text-[11px] text-muted-foreground">4 agences recevront la nouvelle identité sur les prochains documents.</p>
              </div>
              <div>
                <p className="font-bold">Clients et catalogue</p>
                <p className="text-[11px] text-muted-foreground">Revue d&apos;accès requise. Les fiches et dépôts existants restent rattachés à leur historique.</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] font-bold text-amber-700">2 validations en attente</p>
            <p className="text-[11px] text-muted-foreground">Confirmez les périmètres clients/catalogue et vérifiez la devise avant l&apos;application de ces changements.</p>
          </Section>

          <Section title="Journal des modifications" sub="Historique de l'enseigne.">
            <div className="space-y-2.5 text-xs">
              {[
                ["Aujourd'hui • 09:14", "Moussa K. • Bingerville", "Téléphone agence mis à jour."],
                ["Hier • 17:52", "Aïcha Koné • Toutes agences", "Agence par défaut : Plateau → Bingerville."],
              ].map(([h, qui, quoi]) => (
                <div key={quoi}>
                  <p className="font-bold">{h}</p>
                  <p className="text-[11px] text-muted-foreground">{qui}</p>
                  <p className="text-[11px]">{quoi}</p>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full text-[11px] font-bold"
              onClick={() => toast.info("Journal complet", { description: "Toutes les modifications de l'enseigne." })}
            >
              Voir le journal des modifications →
            </Button>
          </Section>
        </div>
      </div>
    </div>
  );
}
