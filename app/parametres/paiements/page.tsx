"use client";

import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldLabel, Section, CheckRow, dirtyCount } from "../_components";

const INITIAL = {
  agence: "Bingerville",
  defaut: "Espèces",
  ordre: "Espèces → Flooz → Carte → Autre",
  libelleAutre: "Virement bancaire",
  especes: true,
  flooz: true,
  carte: true,
  autre: false,
  acompteMin: "30 %",
  montantRef: "3 000 FCFA",
  fractionsMax: "3 paiements",
  echeance: "Avant le retrait",
  acompteMode: "pourcentage",
  fractionne: true,
  plusieursMoyens: true,
  remiseMax: "5 % maximum",
  seuilValidation: "Validation responsable agence",
  droitRembourser: "Administrateur habilité",
  montantEncaisse: "Référence obligatoire",
  justif: "Carte, Flooz, Autre, remboursement",
  operateur: "Référence unique par transaction et par agence",
  motifRemise: true,
  validerRemboursement: true,
  recuPaiement: true,
  doubleSeuil: "50 000 FCFA",
  second: "Responsable + administrateur",
  pieceSorties: true,
  antiAuto: true,
};

const AGENCES_PAIE = [
  ["Bingerville", "Espèces, Flooz / Mobile Money, carte actifs • Autre inactif", "Défaut : espèces • ordre : espèces / Flooz / carte / autre"],
  ["Plateau", "Espèces, carte actifs • Flooz / Mobile Money et Autre inactifs", "Défaut : carte • ordre : carte / espèces / Flooz / autre"],
  ["Cocody Angré", "Espèces, Flooz / Mobile Money, carte actifs • Autre inactif", "Défaut : espèces • ordre : espèces / Flooz / carte / autre"],
  ["Marcory", "Espèces et Flooz / Mobile Money actifs • carte et Autre inactifs", "Défaut : espèces • ordre : espèces / Flooz / carte / autre"],
];

export default function PaiementsPage() {
  const router = useRouter();
  const { updatePath } = useGlobalData();
  const [base, setBase] = useState(INITIAL);
  const [form, setForm] = useState(INITIAL);
  const dirty = dirtyCount(base, form);
  const set = (k: keyof typeof INITIAL, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    setBase(form);
    toast.success("Paiements enregistrés", { description: "Agence Bingerville • moyens et plafonds." });
  };

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
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Paiements</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Moyens d&apos;encaissement, autorisations et contrôles de caisse du pressing.
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
        <span className="text-muted-foreground">Agence Bingerville • Enregistrement manuel MVP • Devise FCFA / XAF</span>
      </div>

      {dirty > 0 && (
        <div className="rounded-xl bg-amber-50 px-4 py-2.5 text-xs ring-1 ring-amber-100">
          <p className="font-bold text-amber-800">{dirty} changements non enregistrés</p>
          <p className="text-amber-700">Dernière sauvegarde aujourd&apos;hui à 09:14 • Vérifiez les règles avant d&apos;enregistrer.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Section title="Moyens de paiement par agence" sub="Activez chaque moyen indépendamment, choisissez un ordre au POS. MVP : saisie manuelle.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel>Agence à régler</FieldLabel>
                <Select value={form.agence as string} onValueChange={(v) => set("agence", v ?? "Bingerville")}>
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
              </div>
              <div>
                <FieldLabel required>Moyen par défaut</FieldLabel>
                <Select value={form.defaut as string} onValueChange={(v) => set("defaut", v ?? "Espèces")}>
                  <SelectTrigger className="w-full text-[13px] data-[size=default]:h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Espèces", "Flooz / Mobile Money", "Carte", "Autre"].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1 text-[11px] text-muted-foreground">Doit être actif dans cette agence.</p>
              </div>
              <div>
                <FieldLabel>Ordre d&apos;affichage</FieldLabel>
                <Input value={form.ordre as string} onChange={(e) => set("ordre", e.target.value)} className="h-9 text-[13px]" />
                <p className="mt-1 text-[11px] text-muted-foreground">Modifier l&apos;ordre sans changer les historiques.</p>
              </div>
              <div>
                <FieldLabel>Libellé du moyen « Autre »</FieldLabel>
                <Input value={form.libelleAutre as string} onChange={(e) => set("libelleAutre", e.target.value)} className="h-9 text-[13px]" />
                <p className="mt-1 text-[11px] text-muted-foreground">Virement bancaire</p>
              </div>
            </div>
            <div className="mt-2 divide-y divide-border">
              <CheckRow label="Espèces - ordre 1 - Activé" sub="Enregistré en caisse sans référence du justificatif." checked={form.especes as boolean} onChange={(v) => set("especes", v)} id="pay-especes" />
              <CheckRow label="Flooz / Mobile Money - ordre 2 - Activé" sub="Confirmer sur le téléphone opérateur puis saisir la référence." checked={form.flooz as boolean} onChange={(v) => set("flooz", v)} id="pay-flooz" />
              <CheckRow label="Carte - ordre 3 - Activé" sub="Saisie sur le terminal externe ; saisir la référence du justificatif." checked={form.carte as boolean} onChange={(v) => set("carte", v)} id="pay-carte" />
              <CheckRow label="Autre - ordre 4 - Désactivé" sub="Libellé et justificatifs obligatoires si ce moyen est activé." checked={form.autre as boolean} onChange={(v) => set("autre", v)} id="pay-autre" />
            </div>
            <div className="mt-3 space-y-2">
              {AGENCES_PAIE.map(([nom, moyens, defaut]) => (
                <div key={nom} className="rounded-lg border border-border p-2.5 text-xs">
                  <p className="font-extrabold">{nom}</p>
                  <p className="text-[11px] text-muted-foreground">{moyens}</p>
                  <p className="text-[11px] text-muted-foreground">{defaut}</p>
                  <Button variant="ghost" size="sm" className="mt-0.5 h-auto p-0 text-[11px] font-bold" onClick={() => toast.info(nom, { description: defaut })}>
                    Configurer l&apos;agence →
                  </Button>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Acompte et paiement fractionné" sub="Règles appliquées aux nouveaux dépôts.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel required>Acompte minimum</FieldLabel>
                <Input value={form.acompteMin as string} onChange={(e) => set("acompteMin", e.target.value)} className="h-9 text-[13px]" />
                <p className="mt-1 text-[11px] text-muted-foreground">Calculé sur le total du dépôt, frais compris.</p>
              </div>
              <div>
                <FieldLabel>Montant fixe de référence</FieldLabel>
                <Input value={form.montantRef as string} onChange={(e) => set("montantRef", e.target.value)} className="h-9 text-[13px]" />
              </div>
              <div>
                <FieldLabel required>Nombre maximal de fractions</FieldLabel>
                <Input value={form.fractionsMax as string} onChange={(e) => set("fractionsMax", e.target.value)} className="h-9 text-[13px]" />
              </div>
              <div>
                <FieldLabel required>Échéance du solde</FieldLabel>
                <Input value={form.echeance as string} onChange={(e) => set("echeance", e.target.value)} className="h-9 text-[13px]" />
              </div>
            </div>
            <Label className="mt-3 mb-1.5 text-xs font-semibold">Acompte minimum</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["pourcentage", "fixe"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set("acompteMode", v)}
                  className={`rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${form.acompteMode === v ? "border-primary bg-primary/5" : "border-border text-muted-foreground"}`}
                >
                  {v === "pourcentage" ? "Pourcentage du dépôt" : "Montant fixe"}
                </button>
              ))}
            </div>
            <div className="mt-1 divide-y divide-border">
              <CheckRow label="Autoriser le paiement fractionné - Activé" sub="Chaque fraction conserve sa date, son moyen, son montant et sa référence." checked={form.fractionne as boolean} onChange={(v) => set("fractionne", v)} id="pay-frac" />
              <CheckRow label="Autoriser plusieurs moyens - Activé" sub="Les montants cumulés ne peuvent pas dépasser le solde du dépôt." checked={form.plusieursMoyens as boolean} onChange={(v) => set("plusieursMoyens", v)} id="pay-multi" />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Règle de retrait existante : le blocage du retrait en cas d&apos;impayé est réglé dans la configuration opérationnelle.</p>
            <Button variant="outline" size="sm" className="mt-1.5 w-full justify-start text-[11px] font-bold" onClick={() => updatePath("/parametres/operations")}>
              Configuration opérationnelle - retrait impayé →
            </Button>
          </Section>

          <Section title="Remises, remboursements et preuves" sub="Séparer le droit de saisir et le droit de valider.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(
                [
                  ["Remise caissier sans validation", "remiseMax", "5 % maximum", "Droit de rembourser"],
                  ["Au-delà du seuil", "seuilValidation", "Validation responsable agence", "Plafond remboursement"],
                  ["Droit de rembourser", "droitRembourser", "Administrateur habilité", "Montant réellement encaissé"],
                  ["Montant réellement encaissé", "montantEncaisse", "Référence obligatoire", ""],
                  ["Justificatifs requis", "justif", "Carte, Flooz, Autre, remboursement", ""],
                  ["Opérateur ou terminal externe", "operateur", "Référence unique par transaction et par agence", ""],
                ] as const
              ).map(([label, k, ph, sub]) => (
                <div key={k}>
                  <FieldLabel>{label}</FieldLabel>
                  <Input value={form[k] as string} onChange={(e) => set(k, e.target.value)} placeholder={ph} className="h-9 text-[13px]" />
                  {sub ? <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p> : null}
                </div>
              ))}
            </div>
            <div className="mt-2 divide-y divide-border">
              <CheckRow label="Exiger le motif des remises - Activé" sub="Le motif et le validateur sont conservés dans l'audit." checked={form.motifRemise as boolean} onChange={(v) => set("motifRemise", v)} id="pay-motif" />
              <CheckRow label="Valider tout remboursement - Activé" sub="Une seconde personne distincte doit approuver le remboursement." checked={form.validerRemboursement as boolean} onChange={(v) => set("validerRemboursement", v)} id="pay-valremb" />
              <CheckRow label="Émettre un reçu pour chaque paiement - Activé" sub="Reçu avec fraction, moyen, montant et solde restant." checked={form.recuPaiement as boolean} onChange={(v) => set("recuPaiement", v)} id="pay-recu" />
            </div>
          </Section>

          <Section title="Mouvements hors dépôt" sub="Catégories séparées de l'encaissement d'une commande.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel required>Double contrôle à partir de</FieldLabel>
                <Input value={form.doubleSeuil as string} onChange={(e) => set("doubleSeuil", e.target.value)} className="h-9 text-[13px]" />
              </div>
              <div>
                <FieldLabel required>Second approbateur</FieldLabel>
                <Input value={form.second as string} onChange={(e) => set("second", e.target.value)} className="h-9 text-[13px]" />
              </div>
            </div>
            <div className="mt-1 divide-y divide-border">
              <CheckRow label="Exiger une pièce pour les sorties - Activé" sub="Catégorie, motif, montant et pièce liés à chaque sortie." checked={form.pieceSorties as boolean} onChange={(v) => set("pieceSorties", v)} id="pay-piece" />
              <CheckRow label="Interdire l'auto-approbation - Activé" sub="L'auteur de la sortie ne peut pas en être le second validateur." checked={form.antiAuto as boolean} onChange={(v) => set("antiAuto", v)} id="pay-anti" />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Validation obligatoire en ligne : une sortie au-dessus du seuil reste en attente tant que le second contrôle n&apos;a pas été effectué.</p>
          </Section>

          <Section title="Vérification avant enregistrement" sub="Champs requis • acompte entre 0 et 100 % • moyen par défaut défini.">
            <p className="text-[11px] text-muted-foreground">Les modifications sont attribuées à Aïcha Koné et consignées dans le journal de l&apos;enseigne.</p>
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Manuel aujourd'hui" sub="Mode de connexion automatique à un opérateur.">
            <p className="text-xs font-bold">Passerelles temps réel : Futur</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Autorisation, confirmation opérateur et rapprochement automatique • intégration future, non active.</p>
            <p className="mt-2 rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-800 ring-1 ring-amber-100">
              <span className="font-bold">Flooz n&apos;est pas connecté</span>
              <br />
              Le staff vérifie le transfert dans l&apos;appli opérateur, puis la saisie reflète le débit.
            </p>
          </Section>

          <Section title="Aperçu d'encaissement" sub="Dépôt BG-02884-26 • total 21 500 FCFA.">
            <div className="rounded-lg bg-emerald-50/60 p-3 text-xs ring-1 ring-emerald-100">
              <p className="text-[10px] font-bold tracking-wide text-muted-foreground">PAIEMENT FRACTIONNÉ • POS</p>
              <p className="mt-1.5 flex justify-between"><span className="text-muted-foreground">Acompte requis • 30 % :</span><span className="font-bold">6 450 FCFA</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Moyen sélectionné</span><span className="font-bold">Flooz / Mobile Money</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Montant saisi</span><span className="font-bold">6 450 FCFA</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Référence opérateur</span><span className="font-bold">FLZ-728184</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Solde après saisie</span><span className="font-bold">15 050 FCFA</span></p>
            </div>
          </Section>

          <Section title="État hors ligne et limites" sub="Exemple : saisie manuelle sans connexion.">
            <div className="space-y-1.5 text-xs">
              <p><span className="font-bold">Autorisé</span><br /><span className="text-[11px] text-muted-foreground">Espèces : reçu local provisoire.</span></p>
              <p><span className="font-bold">Indisponible</span><br /><span className="text-[11px] text-muted-foreground">Vérification opérateur, remboursements et exports.</span></p>
            </div>
            <Button variant="outline" size="sm" className="mt-2 w-full justify-start text-[11px] font-bold" onClick={() => updatePath("/parametres/hors-ligne")}>
              Mode hors ligne - règles du POS →
            </Button>
          </Section>

          <Section title="Aide et validation" sub="Contrôles avant sauvegarde.">
            <div className="space-y-1.5 text-xs">
              <p><span className="font-bold">Moyen par défaut</span><br /><span className="text-[11px] text-muted-foreground">Actif et unique par agence.</span></p>
              <p><span className="font-bold">Acompte et plafonds</span><br /><span className="text-[11px] text-muted-foreground">Pourcentage entre 0 et 100 ; seuil de sortie strictement positif.</span></p>
              <p><span className="font-bold">Autorisations</span><br /><span className="text-[11px] text-muted-foreground">Validateur distinct pour remboursement et sortie importante.</span></p>
            </div>
            <div className="mt-2 space-y-1.5">
              <Button variant="outline" size="sm" className="w-full justify-start text-[11px] font-bold" onClick={() => updatePath("/equipe/permissions")}>
                Utilisateurs & rôles - droits sensibles →
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-[11px] font-bold" onClick={() => updatePath("/parametres/audit")}>
                Audit & logs - paiements →
              </Button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
