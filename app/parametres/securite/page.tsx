"use client";

import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldLabel, Section, CheckRow, dirtyCount } from "../_components";

const INITIAL = {
  delai: "7 jours",
  recuperation: "Codes de secours + admin habilité",
  mfaAdmin: true,
  mfaDirectrice: true,
  mfaRespAgence: true,
  mfaCaissier: false,
  mfaRespAtelier: false,
  mfaAgent: false,
  longueur: "12 caractères",
  historique: "5 derniers mots de passe",
  dureeSession: "8 heures",
  inactivite: "15 minutes",
  echecs: "5 tentatives",
  dureeVerrou: "15 minutes",
  refuserCompromis: true,
  reauthensible: true,
  renouvellement: false,
  agencePoste: "Bingerville",
  appareil: "CAISSE-BG-01",
  responsablePoste: "Moussa Kouassi",
  validite: "90 jours",
  exigerApprouve: true,
  modifierPolitiques: "Administrateur habilité",
  validerExceptions: "Directrice réseau + admin",
  exporterClients: "Admin habilité uniquement",
  revoquer: "Admin + confirmation MFA",
  validerPermissions: true,
  protegerRemises: true,
  journaliser: true,
  cacheDonnees: "Nom, téléphone partiel, code client",
  cacheProtection: "Cache chiffré sur poste approuvé",
  retention: "72 heures",
  piecesSensibles: "Non mis en cache",
  purger: true,
  masquer: true,
};

const MFA_ROLES: [string, string, keyof typeof INITIAL][] = [
  ["Administrateur habilité - Activé", "MFA exigé pour 2 comptes : accès aux politiques et exports sensibles.", "mfaAdmin"],
  ["Directrice réseau - Activé", "MFA exigé pour 1 compte ; validation des réglages de l'enseigne.", "mfaDirectrice"],
  ["Responsable agence - Activé", "MFA exigé pour 5 comptes ; autorisations sensibles en caisse.", "mfaRespAgence"],
  ["Caissier - Désactivé", "MFA facultatif pour 12 comptes ; appareils de caisse approuvés obligatoires.", "mfaCaissier"],
  ["Responsable atelier - Désactivé", "MFA facultatif pour 4 comptes ; accès limité à l'atelier.", "mfaRespAtelier"],
  ["Agent atelier - Désactivé", "MFA facultatif pour 4 comptes ; aucune autorisation financière.", "mfaAgent"],
];

export default function SecuritePage() {
  const router = useRouter();
  const { updatePath } = useGlobalData();
  const [base, setBase] = useState(INITIAL);
  const [form, setForm] = useState(INITIAL);
  const dirty = dirtyCount(base, form);
  const set = (k: keyof typeof INITIAL, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    setBase(form);
    toast.success("Politiques enregistrées", { description: "Sécurité • toutes les agences." });
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
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Sécurité</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Politiques d&apos;accès, appareils de caisse et protection des données locales.
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
        <span className="text-muted-foreground">Politiques du pressing • Toutes les agences • Pas de profil individuel</span>
      </div>

      {dirty > 0 && (
        <div className="rounded-xl bg-amber-50 px-4 py-2.5 text-xs ring-1 ring-amber-100">
          <p className="font-bold text-amber-800">{dirty} changements non enregistrés</p>
          <p className="text-amber-700">Dernière sauvegarde aujourd&apos;hui à 09:14 • Vérifiez les règles avant d&apos;enregistrer.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Section title="MFA obligatoire par rôle" sub="Définir une politique commune, puis activer la MFA d'un profil personnel.">
            <p className="text-[11px] font-bold">8 utilisateurs concernés</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel required>Délai d&apos;enrôlement</FieldLabel>
                {miniSelect("delai", ["7 jours", "14 jours", "30 jours"])}
                <p className="mt-1 text-[11px] text-muted-foreground">Avec notification à chaque utilisateur concerné.</p>
              </div>
              <div>
                <FieldLabel required>Récupération d&apos;accès</FieldLabel>
                {miniSelect("recuperation", ["Codes de secours + admin habilité", "Admin habilité uniquement"])}
              </div>
            </div>
            <div className="mt-2 divide-y divide-border">
              {MFA_ROLES.map(([label, sub, k]) => (
                <CheckRow key={k} label={label} sub={sub} checked={form[k] as boolean} onChange={(v) => set(k, v)} id={`sec-${k}`} />
              ))}
            </div>
            <p className="mt-2 rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-800 ring-1 ring-amber-100">
              <span className="font-bold">Prévenir le verrouillage du réseau</span>
              <br />
              Conservez au moins deux administrateurs habilités avec MFA fonctionnel et codes de secours. Vérifiez leur accès avant de rendre cette politique obligatoire.
            </p>
          </Section>

          <Section title="Mot de passe et sessions" sub="Deux politiques appliquées aux comptes staff de l'enseigne.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel required>Longueur minimale</FieldLabel>
                {miniSelect("longueur", ["12 caractères", "10 caractères", "8 caractères"])}
              </div>
              <div>
                <FieldLabel>5 derniers mots de passe</FieldLabel>
                {miniSelect("historique", ["5 derniers mots de passe", "3 derniers mots de passe"])}
              </div>
              <div>
                <FieldLabel required>Durée maximale de session</FieldLabel>
                {miniSelect("dureeSession", ["8 heures", "12 heures", "4 heures"])}
              </div>
              <div>
                <FieldLabel required>Verrouillage après inactivité</FieldLabel>
                {miniSelect("inactivite", ["15 minutes", "30 minutes", "5 minutes"])}
              </div>
              <div>
                <FieldLabel required>Échecs avant verrouillage</FieldLabel>
                {miniSelect("echecs", ["5 tentatives", "3 tentatives", "10 tentatives"])}
              </div>
              <div>
                <FieldLabel required>Durée de verrouillage</FieldLabel>
                {miniSelect("dureeVerrou", ["15 minutes", "30 minutes", "1 heure"])}
              </div>
            </div>
            <div className="mt-2 divide-y divide-border">
              <CheckRow label="Refuser les mots de passe compromis - Activé" sub="Vérification lors de la création et du changement de mot de passe." checked={form.refuserCompromis as boolean} onChange={(v) => set("refuserCompromis", v)} id="sec-compromis" />
              <CheckRow label="Réauthentifier les actions sensibles - Activé" sub="Demander une confirmation récente (export, remboursement ou changement de droits)." checked={form.reauthensible as boolean} onChange={(v) => set("reauthensible", v)} id="sec-reauth" />
              <CheckRow label="Forcer un renouvellement périodique - Désactivé" sub="Désactivé ; changement exigé en cas de compromission ou de récupération." checked={form.renouvellement as boolean} onChange={(v) => set("renouvellement", v)} id="sec-renouv" />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Session et inactivité : L&apos;utilisateur doit être inférieur à la durée maximale. Un verrouillage de session ne clôture pas la caisse et ne supprime pas les opérations en attente.</p>
          </Section>

          <Section title="Appareils de caisse autorisés" sub="Seuls les postes non approuvés ne peuvent pas ouvrir une caisse.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel required>Agence du poste</FieldLabel>
                {miniSelect("agencePoste", ["Bingerville", "Plateau", "Cocody Angré", "Marcory"])}
              </div>
              <div>
                <FieldLabel required>Appareil à approuver</FieldLabel>
                {miniSelect("appareil", ["CAISSE-BG-01", "CAISSE-COC-03", "TABLETTE-BG-02"])}
              </div>
              <div>
                <FieldLabel>Responsable du poste</FieldLabel>
                {miniSelect("responsablePoste", ["Moussa Kouassi", "Nadia Assi", "Aïcha Koné"])}
              </div>
              <div>
                <FieldLabel required>Validité de l&apos;autorisation</FieldLabel>
                {miniSelect("validite", ["90 jours", "30 jours", "1 an"])}
              </div>
            </div>
            <CheckRow label="Exiger un appareil approuvé - Activé" sub="Applicable à toute ouverture de caisse ; les appareils révoqués sont bloqués." checked={form.exigerApprouve as boolean} onChange={(v) => set("exigerApprouve", v)} id="sec-exiger" />
            <div className="mt-2 space-y-2 text-xs">
              {(
                [
                  ["CAISSE-BG-01 • Bingerville • Autorisé", "Moussa K. • caisse principale", "Vérifié aujourd'hui à 10:31 • expire le 05/01/2027"],
                  ["CAISSE-COC-03 • Cocody Angré • Autorisé", "Nadia Assi • caisse secondaire", "Vérifié aujourd'hui à 10:30 • expire le 05/01/2027"],
                  ["TABLETTE-BG-02 • Bingerville • À approuver", "Nouvel appareil • caisse inaccessible tant que la validation n'est pas obtenue.", ""],
                ] as const
              ).map(([t, s1, s2]) => (
                <div key={t} className="rounded-lg border border-border p-2.5">
                  <p className="font-extrabold">{t}</p>
                  <p className="text-[11px] text-muted-foreground">{s1}</p>
                  {s2 ? <p className="text-[11px] text-muted-foreground">{s2}</p> : null}
                  <Button variant="ghost" size="sm" className="mt-0.5 h-auto p-0 text-[11px] font-bold" onClick={() => toast.info(t, { description: "Examiner l'autorisation." })}>
                    {t.includes("À approuver") ? "Demander une validation administrateur →" : "Examiner l'autorisation →"}
                  </Button>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Permissions et validation administrateur" sub="Encadrement des actions sensibles, par module.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel required>Modifier les politiques</FieldLabel>
                {miniSelect("modifierPolitiques", ["Administrateur habilité", "Directrice réseau"])}
              </div>
              <div>
                <FieldLabel required>Valider les exceptions</FieldLabel>
                {miniSelect("validerExceptions", ["Directrice réseau + admin", "Administrateur habilité"])}
              </div>
              <div>
                <FieldLabel required>Exporter les données clients</FieldLabel>
                {miniSelect("exporterClients", ["Admin habilité uniquement", "Directrice réseau + admin"])}
              </div>
              <div>
                <FieldLabel required>Révoquer un appareil</FieldLabel>
                {miniSelect("revoquer", ["Admin + confirmation MFA", "Administrateur habilité"])}
              </div>
            </div>
            <div className="mt-2 divide-y divide-border">
              <CheckRow label="Valider les changements de permissions - Activé" sub="Une seconde personne approuve ; l'auteur ne peut pas s'auto-valider." checked={form.validerPermissions as boolean} onChange={(v) => set("validerPermissions", v)} id="sec-valperm" />
              <CheckRow label="Protéger remises et remboursements - Activé" sub="Les montants atténués et plafonds restent dans Paiements." checked={form.protegerRemises as boolean} onChange={(v) => set("protegerRemises", v)} id="sec-prot" />
              <CheckRow label="Journaliser toutes les exceptions - Activé" sub="Motif, demandeur, validateur et horodatage sont obligatoires." checked={form.journaliser as boolean} onChange={(v) => set("journaliser", v)} id="sec-journ" />
            </div>
            <div className="mt-2 space-y-1.5">
              <Button variant="outline" size="sm" className="w-full justify-start text-[11px] font-bold" onClick={() => updatePath("/equipe/permissions")}>
                Utilisateurs & rôles - permissions →
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-[11px] font-bold" onClick={() => updatePath("/parametres/paiements")}>
                Paiements - plafonds et remboursements →
              </Button>
            </div>
          </Section>

          <Section title="Cache local et déconnexion" sub="Données et durées disponibles sur les postes partagés.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel>Données clientes en cache</FieldLabel>
                {miniSelect("cacheDonnees", ["Nom, téléphone partiel, code client", "Nom et code client uniquement"])}
              </div>
              <div>
                <FieldLabel>Protection locale</FieldLabel>
                {miniSelect("cacheProtection", ["Cache chiffré sur poste approuvé", "Cache standard"])}
              </div>
              <div>
                <FieldLabel>Rétention locale maximale</FieldLabel>
                {miniSelect("retention", ["72 heures", "24 heures", "7 jours"])}
              </div>
              <div>
                <FieldLabel>Pièces et justificatifs sensibles</FieldLabel>
                {miniSelect("piecesSensibles", ["Non mis en cache", "Mis en cache chiffré"])}
              </div>
            </div>
            <div className="mt-2 divide-y divide-border">
              <CheckRow label="Purger à la déconnexion - Activé" sub="Effacer les clients et le catalogue en cache après synchronisation de la file locale." checked={form.purger as boolean} onChange={(v) => set("purger", v)} id="sec-purger" />
              <CheckRow label="Masquer les données sur session verrouillée - Activé" sub="L'accès est rétabli après authentiﬁcation." checked={form.masquer as boolean} onChange={(v) => set("masquer", v)} id="sec-masquer" />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Préserver les opérations non synchronisées : Ne pas effacer une file financière en attente. La déconnexion protège et isole cette file ; la purge intervient après accusé serveur ou procédure de récupération autorisée.</p>
          </Section>

          <Section title="Vérification avant enregistrement" sub="Champs * requis • 2 accès administrateur de secours vérifiés • 2 utilisateurs à accompagner • durée d'inactivité inférieure à la session.">
            <p className="text-[11px] text-muted-foreground">Les modifications sont attribuées à Aïcha Koné et consignées dans le journal de l&apos;enseigne.</p>
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Impact utilisateurs" sub="Appliquer avec application des politiques.">
            <div className="space-y-1.5 text-xs">
              <p className="font-extrabold">28 COMPTES STAFF • 4 AGENCES</p>
              <p className="flex justify-between"><span className="text-muted-foreground">MFA obligatoire</span><span className="font-bold">8 utilisateurs</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Déjà enrôlés</span><span className="font-bold">6 sur 8</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">À accompagner</span><span className="font-bold">2 responsables agence</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Sessions concernées</span><span className="font-bold">Toutes • prochaine connexion</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Appareils à approuver</span><span className="font-bold">1 tablette</span></p>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Les comptes non enrôlés reçoivent un délai de 7 jours. Aucune coupure immédiate de toutes les sessions.</p>
          </Section>

          <Section title="Contrôle anti-verrouillage" sub="Éviter les interruptions de production.">
            <div className="space-y-1.5 text-xs">
              <p><span className="font-bold">Administrateurs de secours - 2 vérifiés</span><br /><span className="text-[11px] text-muted-foreground">Aïcha Koné et Awa Koné • MFA confirmé • codes conservés.</span></p>
              <p><span className="font-bold">Enrôlement restant - À accompagner</span><br /><span className="text-[11px] text-muted-foreground">2 responsables doivent terminer l&apos;enrôlement avant le 14/10/2026.</span></p>
              <p><span className="font-bold">Publication sécurisée</span><br /><span className="text-[11px] text-muted-foreground">Ne révoquez pas le dernier poste de caisse utilisable pendant une session ouverte.</span></p>
            </div>
          </Section>

          <Section title="Aide à la validation" sub="Politique strictement conforme aux modules.">
            <div className="space-y-1.5 text-xs">
              <p><span className="font-bold">Sessions</span><br /><span className="text-[11px] text-muted-foreground">Inactivité 15 min + durée maximale 8 h.</span></p>
              <p><span className="font-bold">Verrouillage</span><br /><span className="text-[11px] text-muted-foreground">Au moins 1 tentative ; délai positif ; récupération adminis. disponible.</span></p>
              <p><span className="font-bold">Appareils et cache</span><br /><span className="text-[11px] text-muted-foreground">Protection locale vérifiée ; aucune pièce sensible en cache.</span></p>
            </div>
            <div className="mt-2 rounded-lg border border-border p-2.5 text-[11px]">
              <p className="font-bold">Mode hors ligne - cache et postes autorisés</p>
              <p className="text-muted-foreground">2 postes • file chiffrée • purge à la déconnexion.</p>
            </div>
          </Section>

          <Section title="Journal de modification" sub="Chaque évolution de politique est traçable.">
            <div className="space-y-2.5 text-xs">
              <div>
                <p className="font-bold">Aujourd&apos;hui - 09:14</p>
                <p className="text-[11px] text-muted-foreground">Aïcha Koné • Toutes agences</p>
                <p className="text-[11px]">Inactivité : 30 → 15 minutes. Validateur: Awa Koné</p>
              </div>
              <div>
                <p className="font-bold">Hier - 17:52</p>
                <p className="text-[11px] text-muted-foreground">Awa Koné • Cocody Angré</p>
                <p className="text-[11px]">CAISSE-COC-03 autorisée • durée 90 jours</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-2 w-full text-[11px] font-bold" onClick={() => updatePath("/parametres/audit")}>
              Audit & logs - consulter le journal →
            </Button>
          </Section>
        </div>
      </div>
    </div>
  );
}
