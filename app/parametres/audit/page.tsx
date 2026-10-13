"use client";

import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldLabel, Section, CheckRow, dirtyCount } from "../_components";

const INITIAL = {
  perimetre: "toutes",
  depots: true,
  paiements: true,
  annulations: true,
  remises: true,
  retraits: true,
  caisse: true,
  permissions: true,
  logsImpression: true,
  logsOffline: true,
  conservation: "24 mois",
  impressions: "24 mois",
  syncOffline: "24 mois",
  archivageApres: "12 mois",
  conservationArchives: "Jusqu'à la fin des 24 mois",
  frequence: "Mensuelle",
  archiverAuto: true,
  suspendreLitige: true,
  consultToutes: "Directrice réseau, admin habilité",
  consultAgence: "Responsable agence habilité",
  exporterClients: "Administrateur habilité",
  donneesRapport: "Références pseudonymisées",
  anonymiser: true,
  journaliserConsult: true,
  protection: "Journal append-only • empreinte signée",
  modifier: "Interdit - ajout rectificatif seulement",
  suppression: "Demande motivée + double validation",
  validations: "Admin habilité + directrice réseau",
  manifeste: true,
  verifierGels: true,
  fuseau: "Fuseau de l'agence",
  seuilHorloge: "5 minutes",
};

const EVENTS: [string, string, keyof typeof INITIAL][] = [
  ["Dépôts - Activé", "Création, changement de statut et modification d'un dépôt.", "depots"],
  ["Paiements - Activé", "Encaissements, fractions, annulations et remboursements.", "paiements"],
  ["Annulations - Activé", "Motif, auteur et validation de l'annulation.", "annulations"],
  ["Remises - Activé", "Montant, taux, règne et approbateur.", "remises"],
  ["Retraits - Activé", "Articles remis, solde et éventuelle exception autorisée.", "retraits"],
  ["Caisse - Activé", "Ouverture, fermeture, entrées, sorties et double contrôle.", "caisse"],
  ["Permissions - Activé", "Rôles, habilitations et changements de sécurité.", "permissions"],
  ["Logs d'impression - Activé", "Reçus, tickets, impressions, poste et résultat.", "logsImpression"],
  ["Logs offline - Activé", "Envoi, accusé, renumérotation et résolution des conflits.", "logsOffline"],
];

export default function AuditPage() {
  const router = useRouter();
  const [base, setBase] = useState(INITIAL);
  const [form, setForm] = useState(INITIAL);
  const dirty = dirtyCount(base, form);
  const set = (k: keyof typeof INITIAL, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    setBase(form);
    toast.success("Politique d'audit enregistrée", { description: "Toutes agences • conservation 24 mois." });
  };

  const miniSelect = (k: keyof typeof INITIAL, options: string[]) => (
    <Select value={form[k] as string} onValueChange={(v) => set(k, v ?? (form[k] as string))}>
      <SelectTrigger className="w-full text-xs data-[size=default]:h-8">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-5">
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
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Audit & conservation</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Événements tracés, droits d&apos;accès et cycle de conservation des journaux.
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
        <span className="rounded bg-muted px-2 py-0.5 font-semibold">Paramètres de l&apos;enseigne</span>
        <span className="text-muted-foreground">Politique du pressing • Périmètre par agence • Paramètres, pas un moniteur</span>
      </div>

      {dirty > 0 && (
        <div className="rounded-xl bg-amber-50 px-4 py-2.5 text-xs ring-1 ring-amber-100">
          <p className="font-bold text-amber-800">{dirty} changements non enregistrés</p>
          <p className="text-amber-700">Dernière sauvegarde aujourd&apos;hui à 09:14 • Vérifiez les règles avant d&apos;enregistrer.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Section title="Périmètre et événements à tracer" sub="Choisissez les agences et les traces à conserver dans l'audit.">
            <p className="text-xs font-semibold">Agences incluses</p>
            <p className="text-[11px] text-muted-foreground">Bingerville, Plateau, Cocody Angré, Marcory • Choix individuel disponible avec le périmètre Agences sélectionnées.</p>
            <Label className="mt-2 mb-1.5 text-xs font-semibold">Périmètre de la politique <span className="text-red-500">*</span></Label>
            <RadioGroup value={form.perimetre as string} onValueChange={(v) => set("perimetre", v)} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(["toutes", "selection"] as const).map((v) => (
                <Label
                  key={v}
                  htmlFor={`au-perim-${v}`}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
                >
                  <RadioGroupItem id={`au-perim-${v}`} value={v} />
                  {v === "toutes" ? "Toutes les agences" : "Agences sélectionnées"}
                </Label>
              ))}
            </RadioGroup>
            <div className="mt-2 divide-y divide-border">
              {EVENTS.map(([label, sub, k]) => (
                <CheckRow key={k} label={label} sub={sub} checked={form[k] as boolean} onChange={(v) => set(k, v)} id={`au-${k}`} />
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Traces financières protégées : Détacher une catégorie sensible demande une validation administrateur motivée. Les journaux déjà conservés ne sont pas effacés par un changement de périmètre.</p>
          </Section>

          <Section title="Durée et archivage" sub="Durées choisies de la politique, à vérifier selon son contexte.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel>Conservation active</FieldLabel>
                {miniSelect("conservation", ["24 mois", "12 mois", "36 mois"])}
                <p className="mt-1 text-[11px] text-muted-foreground">Exemple de configuration, pas une obligation légale.</p>
              </div>
              <div>
                <FieldLabel>Impressions</FieldLabel>
                {miniSelect("impressions", ["24 mois", "12 mois"])}
              </div>
              <div>
                <FieldLabel>Synchronisations offline</FieldLabel>
                {miniSelect("syncOffline", ["24 mois", "12 mois"])}
              </div>
              <div>
                <FieldLabel>Archivage après</FieldLabel>
                {miniSelect("archivageApres", ["12 mois", "6 mois", "24 mois"])}
              </div>
              <div>
                <FieldLabel>Conservation des archives</FieldLabel>
                {miniSelect("conservationArchives", ["Jusqu'à la fin des 24 mois", "Jusqu'à la fin des 12 mois"])}
              </div>
              <div>
                <FieldLabel>Fréquence d&apos;archivage</FieldLabel>
                {miniSelect("frequence", ["Mensuelle", "Trimestrielle"])}
              </div>
            </div>
            <div className="mt-2 divide-y divide-border">
              <CheckRow label="Archiver automatiquement - Activé" sub="Les événements résidents restent consultables sans les droits." checked={form.archiverAuto as boolean} onChange={(v) => set("archiverAuto", v)} id="au-archauto" />
              <CheckRow label="Suspendre la suppression en cas de litige - Activé" sub="Un gel de conservation prévaut sur la durée configurée." checked={form.suspendreLitige as boolean} onChange={(v) => set("suspendreLitige", v)} id="au-suspend" />
            </div>
            <p className="mt-2 rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-800 ring-1 ring-amber-100">
              <span className="font-bold">Valider la politique de conservation</span>
              <br />
              24 mois est une valeur d&apos;exemple paramétrable. Faites valider les durées selon vos besoins, les données traitées et les exigences applicables ; ce réglage ne constitue pas un avis juridique.
            </p>
          </Section>

          <Section title="Droits de consultation et d'export" sub="Permissions propres à la sensibilité et au périmètre d'agence.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel>Consulter toutes les agences</FieldLabel>
                {miniSelect("consultToutes", ["Directrice réseau, admin habilité", "Administrateur habilité"])}
              </div>
              <div>
                <FieldLabel>Consulter son agence</FieldLabel>
                {miniSelect("consultAgence", ["Responsable agence habilité", "Tout staff de l'agence"])}
              </div>
              <div>
                <FieldLabel>Exporter les données clients</FieldLabel>
                {miniSelect("exporterClients", ["Administrateur habilité", "Directrice réseau + admin"])}
              </div>
              <div>
                <FieldLabel>Données retirées du rapport</FieldLabel>
                {miniSelect("donneesRapport", ["Références pseudonymisées", "Noms, téléphones, e-mails et IP complètes"])}
              </div>
            </div>
            <div className="mt-2 divide-y divide-border">
              <CheckRow label="Anonymiser les exports par défaut - Activé" sub="Un export nominatif reste une exception motivée et approuvée." checked={form.anonymiser as boolean} onChange={(v) => set("anonymiser", v)} id="au-anon" />
              <CheckRow label="Journaliser les consultations et exports - Activé" sub="Auteur, périmètre, filtre, date et résultat." checked={form.journaliserConsult as boolean} onChange={(v) => set("journaliserConsult", v)} id="au-journ" />
            </div>
            <Button variant="outline" size="sm" className="mt-2 w-full justify-start text-[11px] font-bold" onClick={() => toast.info("Habilitations", { description: "Utilisateurs & rôles." })}>
              Utilisateurs & rôles - habilitations →
            </Button>
          </Section>

          <Section title="Intégrité et suppression contrôlée" sub="Empêcher la réécriture des événements et encadrer leur fin de vie.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel>Protection d&apos;intégrité</FieldLabel>
                {miniSelect("protection", ["Journal append-only • empreinte signée", "Journal standard"])}
              </div>
              <div>
                <FieldLabel>Modifier un événement</FieldLabel>
                {miniSelect("modifier", ["Interdit - ajout rectificatif seulement", "Autorisé avec motif"])}
              </div>
              <div>
                <FieldLabel>Suppression d&apos;un événement</FieldLabel>
                {miniSelect("suppression", ["Demande motivée + double validation", "Admin habilité uniquement"])}
              </div>
              <div>
                <FieldLabel>Validations requises</FieldLabel>
                {miniSelect("validations", ["Admin habilité + directrice réseau", "Administrateur habilité"])}
              </div>
            </div>
            <div className="mt-2 divide-y divide-border">
              <CheckRow label="Exiger un manifeste de suppression - Activé" sub="Périmètre, durée, références, motif et approbateurs conservés." checked={form.manifeste as boolean} onChange={(v) => set("manifeste", v)} id="au-manif" />
              <CheckRow label="Vérifier les gels avant suppression - Activé" sub="Les dossiers en litige exclus du traitement." checked={form.verifierGels as boolean} onChange={(v) => set("verifierGels", v)} id="au-gels" />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Jamais d&apos;effacement direct dans le journal : Un utilisateur ne peut ni réécrire ni supprimer une ligne d&apos;audit. La purge en fin de conservation suit un processus contrôlé ; une trace de la décision subsiste.</p>
          </Section>

          <Section title="Structure d'un événement" sub="Champs nécessaires pour comprendre et rapprocher chaque changement.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel>Fuseau d&apos;affichage</FieldLabel>
                {miniSelect("fuseau", ["Fuseau de l'agence", "UTC"])}
              </div>
              <div>
                <FieldLabel>Seuil d&apos;alerte écart d&apos;horloge</FieldLabel>
                {miniSelect("seuilHorloge", ["5 minutes", "1 minute", "15 minutes"])}
              </div>
            </div>
            <div className="mt-2 space-y-1 text-xs">
              <p><span className="font-bold">Contexte</span><br /><span className="text-[11px] text-muted-foreground">Acteur, rôle, agence, appareil, action, ressource, référence et motif.</span></p>
              <p><span className="font-bold">Avant / après</span><br /><span className="text-[11px] text-muted-foreground">Valeurs précédentes et nouvelles, limitées aux champs utiles ; pas de secret, mot de passe ni jeton.</span></p>
              <p><span className="font-bold">Temps local / serveur</span><br /><span className="text-[11px] text-muted-foreground">Horodatage local avec fuseau, heure de réception serveur et éventuel écart d&apos;horloge.</span></p>
              <p><span className="font-bold">Référence offline</span><br /><span className="text-[11px] text-muted-foreground">UUID stable, référence temporaire, référence définitive et lien de la résolution.</span></p>
            </div>
          </Section>

          <Section title="Vérification avant enregistrement" sub="Champs * requis • archivage inférieur à la conservation • droits distincts • aucun effacement immédiat • 24 mois reste une valeur d'exemple.">
            <p className="text-[11px] text-muted-foreground">Les modifications sont attribuées à Aïcha Koné et consignées dans le journal de l&apos;enseigne.</p>
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Aperçu d'impact" sub="Estimation des réglages proposés.">
            <div className="rounded-lg bg-muted/50 p-3 text-xs">
              <p className="text-[10px] font-bold tracking-wide text-muted-foreground">POLITIQUE : TOUTES AGENCES</p>
              <div className="mt-1.5 space-y-1">
                {[
                  ["Périmètre", "4 agences"],
                  ["Catégories actives", "9 catégories"],
                  ["Événements actuels", "1 829"],
                  ["Conservation", "24 mois - exemple"],
                  ["Archivage", "Après 12 mois"],
                  ["Export standard", "CSV anonymisé"],
                ].map(([k, v]) => (
                  <p key={k} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="text-right font-bold">{v}</span>
                  </p>
                ))}
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Aucune suppression immédiate. Les données existantes suivent une revue avant toute réduction de durée.</p>
          </Section>

          <Section title="Aperçu avant / après" sub="Évolution si version consultée.">
            <div className="rounded-lg border border-border p-2.5 text-xs">
              <p className="text-[10px] font-bold tracking-wide text-muted-foreground">FRAIS LIVRAISON MODIFIÉS</p>
              <p className="mt-1 flex justify-between"><span className="text-muted-foreground">Avant</span><span className="font-bold">1 500 FCFA</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Après</span><span className="font-bold">2 000 FCFA</span></p>
              <p className="mt-1 flex justify-between"><span className="text-muted-foreground">Agence / auteur</span><span className="font-bold">Bingerville - Moussa K.</span></p>
              <p className="mt-1">Heure locale<br /><span className="font-bold">07/10/2026 - 09:14:02 UTC+00</span></p>
              <p className="mt-1">Réception serveur<br /><span className="font-bold">07/10/2026 - 09:14:04 UTC</span></p>
              <p className="mt-1">Validation<br /><span className="font-bold">Aïcha Koné - motif saisi</span></p>
              <p className="mt-1 text-[11px] text-muted-foreground">Valeurs d&apos;origine conservées ; aucune modification de l&apos;événement après sa création.</p>
            </div>
          </Section>

          <Section title="Centre Audit & logs" sub="Configuration et consultation séparées.">
            <p className="text-[11px] text-muted-foreground">Cette page règle la politique. La centrale permet de filtrer les événements, examiner les détails et lancer les exports autorisés.</p>
            <div className="mt-2 space-y-1.5">
              {["Journal des encaissements", "Logs d'impression", "Synchronisations offline"].map((l) => (
                <Button key={l} variant="outline" size="sm" className="w-full justify-start text-[11px] font-bold" onClick={() => toast.info(l, { description: "Centre Audit & logs." })}>
                  {l} →
                </Button>
              ))}
            </div>
          </Section>

          <Section title="Validation et historique" sub="Contrôles de cohérence et traçabilité.">
            <div className="space-y-1.5 text-xs">
              <p><span className="font-bold">Durées</span><br /><span className="text-[11px] text-muted-foreground">Conservation positive ; archivage 12 mois s 24 mois.</span></p>
              <p><span className="font-bold">Droits</span><br /><span className="text-[11px] text-muted-foreground">Consultation limitée à l&apos;agence ; export restreint.</span></p>
              <p><span className="font-bold">Hier - 17:52</span><br /><span className="text-[11px] text-muted-foreground">Export par défaut : nominatif → anonymisé.</span></p>
            </div>
            <p className="mt-2 text-[11px] text-amber-700">Réduction de durée : Une réduction exige une revue d&apos;impact et une validation distincte avant toute suppression.</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
