"use client";

import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  agence: "Bingerville",
  poste: "CAISSE-BG-01",
  portee: "caisse",
  activerPos: true,
  confirmerPortee: false,
  securiteAppareils: "CAISSE-BG-01, CAISSE-COC-03",
  majAuto: true,
  exclureSensibles: true,
  reserve: "100 codes",
  seuil: "20 codes restants",
  prefixe: "TMP-BG-CAISSE01",
  purgeInutiles: true,
};

const POSTES = [
  ["CAISSE-BG-01 • Bingerville • Autorisé", "POS caisse • cache chiffré • Moussa Kouassi"],
  ["CAISSE-COC-03 • Cocody Angré • Autorisé", "POS caisse • cache chiffré • Nadia Assi"],
  ["TABLETTE-BG-02 • Bingerville • Non autorisée", "Mode offline désactivé • approbation sécurité requise."],
  ["ATELIER-BG-01 • Bingerville • Hors périmètre", "Atelier non activé dans le choix Caisse uniquement."],
];

export default function HorsLignePage() {
  const router = useRouter();
  const { updatePath } = useGlobalData();
  const [base, setBase] = useState(INITIAL);
  const [form, setForm] = useState(INITIAL);
  const dirty = dirtyCount(base, form);
  const set = (k: keyof typeof INITIAL, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.confirmerPortee) {
      toast.error("Portée non confirmée", { description: "Confirmez la portée choisie avant d'enregistrer." });
      return;
    }
    setBase(form);
    toast.success("Mode hors ligne enregistré", { description: "CAISSE-BG-01 • portée Caisse uniquement." });
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
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Mode hors ligne</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Continuité du POS, cache minimal et synchronisation contrôlée des opérations.
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
        <span className="text-muted-foreground">Pressing • Postes explicitement autorisés • Périmètre à valider</span>
      </div>

      {dirty > 0 && (
        <div className="rounded-xl bg-amber-50 px-4 py-2.5 text-xs ring-1 ring-amber-100">
          <p className="font-bold text-amber-800">{dirty} changements non enregistrés</p>
          <p className="text-amber-700">Dernière sauvegarde aujourd&apos;hui à 09:14 • Vérifiez les règles avant d&apos;enregistrer.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Section title="Activation et périmètre" sub="Choisir les agences et postes lorsque la connexion est perdue.">
            <p className="text-[11px] font-bold">Périmètre à valider</p>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel required>Agence du poste</FieldLabel>
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
                <FieldLabel required>Poste autorisé</FieldLabel>
                <Select value={form.poste as string} onValueChange={(v) => set("poste", v ?? "CAISSE-BG-01")}>
                  <SelectTrigger className="w-full text-[13px] data-[size=default]:h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["CAISSE-BG-01", "CAISSE-COC-03", "TABLETTE-BG-02"].map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Label className="mt-3 mb-1.5 text-xs font-semibold">Portée du mode hors ligne <span className="text-red-500">*</span></Label>
            <RadioGroup value={form.portee as string} onValueChange={(v) => set("portee", v)} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(["caisse", "caisse-atelier"] as const).map((v) => (
                <Label
                  key={v}
                  htmlFor={`hl-portee-${v}`}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
                >
                  <RadioGroupItem id={`hl-portee-${v}`} value={v} />
                  {v === "caisse" ? "Caisse uniquement" : "Caisse et atelier"}
                </Label>
              ))}
            </RadioGroup>
            <p className="mt-1 text-[11px] text-muted-foreground">Caisse uniquement : encaissements autonomes et reçus provisoires. Atelier : tâches déjà chargées, si ce périmètre est validé.</p>
            <div className="mt-1 divide-y divide-border">
              <CheckRow label="Activer le POS hors ligne - Activé" sub="Uniquement avec les postes disponibles et cache à jour." checked={form.activerPos as boolean} onChange={(v) => set("activerPos", v)} id="hl-activer" />
              <CheckRow label="Confirmer la portée choisie - Désactivé" sub="Décision du pressing à valider ; aucune extension automatique à l'atelier." checked={form.confirmerPortee as boolean} onChange={(v) => set("confirmerPortee", v)} id="hl-confirmer" />
            </div>
            <div className="mt-2 space-y-1.5">
              {POSTES.map(([t, s]) => (
                <p key={t} className="rounded-lg border border-border p-2 text-xs">
                  <span className="font-extrabold">{t}</span>
                  <br />
                  <span className="text-[11px] text-muted-foreground">{s}</span>
                </p>
              ))}
            </div>
            <div className="mt-3">
              <FieldLabel>Sécurité - autorisation des appareils</FieldLabel>
              <Input value={form.securiteAppareils as string} onChange={(e) => set("securiteAppareils", e.target.value)} className="h-9 text-[13px]" />
            </div>
          </Section>

          <Section title="Cache et limites locales" sub="Préparer les données nécessaires à l'activité du poste.">
            <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              {(
                [
                  ["Catalogue en cache", "86 articles actifs • agence du poste"],
                  ["Clients récents", "30 derniers jours • 500 maximum"],
                  ["Données client minimales", "Nom, code, téléphone masqué"],
                  ["Dernière mise à jour", "07/10/2026 • 10:31 locale"],
                  ["Durée offline maximale", "72 heures"],
                  ["Volume maximal", "200 opérations en attente"],
                  ["Taille du cache", "50 Mo maximum"],
                  ["Rafraîchissement en ligne", "Toutes les 5 minutes"],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="text-xs">
                  <p className="text-muted-foreground">{k}</p>
                  <p className="font-bold">{v}</p>
                </div>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Au-delà : création de nouvelles opérations bloquée. Au-delà : consultation seule, file conservée.</p>
            <div className="mt-1 divide-y divide-border">
              <CheckRow label="Mettre à jour automatiquement le cache - Activé" sub="Seulement avec les postes disponibles et cache à jour." checked={form.majAuto as boolean} onChange={(v) => set("majAuto", v)} id="hl-maj" />
              <CheckRow label="Exclure les pièces sensibles - Activé" sub="Pas de justificatifs complets, de secrets de paiement ni de données clients non nécessaires." checked={form.exclureSensibles as boolean} onChange={(v) => set("exclureSensibles", v)} id="hl-exclure" />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Limites obligatoires : Durée et volume doivent être positifs. Un cache expiré ne doit pas servir à appliquer un nouveau tarif sans confirmation ; les opérations déjà enregistrées restent conservées.</p>
          </Section>

          <Section title="Réserve de codes temporaires" sub="Éviter les collisions avant attribution d'un numéro définitif.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <FieldLabel required>Réserve par poste</FieldLabel>
                <Input value={form.reserve as string} onChange={(e) => set("reserve", e.target.value)} className="h-9 text-[13px]" />
              </div>
              <div>
                <FieldLabel required>Seuil de réapprovisionnement</FieldLabel>
                <Input value={form.seuil as string} onChange={(e) => set("seuil", e.target.value)} className="h-9 text-[13px]" />
              </div>
              <div>
                <FieldLabel required>Préfixe local</FieldLabel>
                <Input value={form.prefixe as string} onChange={(e) => set("prefixe", e.target.value)} className="h-9 text-[13px]" />
              </div>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Réserve actuelle : 64 codes disponibles - lot validé</p>
            <div className="mt-2 rounded-lg bg-muted/50 p-3 text-xs">
              <p className="text-[10px] font-bold tracking-wide text-muted-foreground">EXEMPLE DE RÉFÉRENCE</p>
              <p className="mt-1">Code temporaire<br /><span className="font-extrabold">TMP-BG-CAISSE01-0064</span></p>
              <p className="mt-1">Identifiant anti-doublon<br /><span className="font-bold">UUID indépendant du code</span></p>
              <p className="mt-1">Après synchronisation<br /><span className="font-bold">BG-02684-26</span></p>
              <p className="mt-1 text-[11px] text-muted-foreground">Le reçu renvoie de la correspondance vers le numéro définitif restant dans l&apos;historique.</p>
            </div>
            <p className="mt-2 rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-800 ring-1 ring-amber-100">
              <span className="font-bold">Réserve épuisée</span>
              <br />
              La création d&apos;un nouveau dépôt est suspendue si aucun code n&apos;est disponible. Ne réutilisez jamais un code ; demandez le réapprovisionnement en ligne.
            </p>
          </Section>

          <Section title="Synchronisation ordonnée" sub="Envoi automatique au retour du réseau, sans double enregistrement.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(
                [
                  ["Politique d'envoi", "Ordre de création + dépendances"],
                  ["Tentatives avant revue", "5 tentatives"],
                  ["Accusé de réception", "Traitement des conflits"],
                  ["Requis avant purge locale", "Revue humaine habilitée"],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="text-xs">
                  <p className="text-muted-foreground">{k}</p>
                  <p className="font-bold">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-2 space-y-1.5">
              <CheckRow label="Synchroniser automatiquement - Activé" sub="Déclencher au retour du réseau puis ressayer toutes les 5 minutes." checked onChange={() => toast.info("Toujours actif", { description: "La synchronisation automatique ne se désactive pas." })} id="hl-sync" />
              <CheckRow label="Conserver la clé UUID lors des retries - Activé" sub="Un accusé déjà reçu ne crée pas une deuxième transaction." checked onChange={() => toast.info("Toujours actif", { description: "Anti-doublon permanent." })} id="hl-uuid" />
            </div>
            <div className="mt-2 space-y-1 text-xs">
              <p><span className="font-bold">1 - Client et dépôt</span><br /><span className="text-[11px] text-muted-foreground">Créer les références nécessaires avant leurs paiements et leurs retraits.</span></p>
              <p><span className="font-bold">2 - Paiements et retraits</span><br /><span className="text-[11px] text-muted-foreground">Envoyer dans l&apos;ordre, avec le dépôt ; protection par UUID et invariants financiers.</span></p>
              <p><span className="font-bold">3 - Impression et logs</span><br /><span className="text-[11px] text-muted-foreground">Transmettre les traces avec référence locale et référence serveur.</span></p>
            </div>
            <p className="mt-2 rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-800 ring-1 ring-amber-100">
              <span className="font-bold">Aucun écrasement financier automatique</span>
              <br />
              Un conflit de montant, un solde suspect (répétition concernée et ses dépendances. Conserver les deux versions ; examen humain, justification et écriture compensatoire si nécessaire. Jamais « dernière modification gagnante ».
            </p>
          </Section>

          <Section title="Purge et protection du poste" sub="Maintenance du cache et politique Sécurité.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel>Protection locale</FieldLabel>
                <p className="rounded-md bg-muted/60 px-2 py-2 text-xs font-bold">Cache chiffré • appareil approuvé</p>
              </div>
              <div>
                <FieldLabel>Purge du cache clients</FieldLabel>
                <p className="rounded-md bg-muted/60 px-2 py-2 text-xs font-bold">À la déconnexion</p>
              </div>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Après accusé serveur uniquement.</p>
            <CheckRow label="Purger les données devenues inutiles - Activé" sub="Retirer les clients hors fenêtre et les articles inactifs au prochain rafraîchissement." checked={form.purgeInutiles as boolean} onChange={(v) => set("purgeInutiles", v)} id="hl-purge" />
            <p className="mt-1 text-[11px] text-muted-foreground">Déconnexion sans perte : Les opérations non synchronisées sont isolées et protégées, jamais effacées avec le cache client. Un poste révoqué suit une procédure de récupération supervisée.</p>
          </Section>

          <Section title="Vérification avant enregistrement" sub="Champs * requis • périmètre à confirmer • limites de réserve cohérentes • cache minimal • revue humaine des conflits financiers.">
            <p className="text-[11px] text-muted-foreground">Les modifications sont attribuées à Aïcha Koné et consignées dans le journal de l&apos;enseigne.</p>
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Exemple d'état dégradé" sub="Simulation • CAISSE-BG-01">
            <p className="text-[11px] font-bold">Hors ligne depuis 2 h</p>
            <div className="mt-2 rounded-lg bg-muted/50 p-3 text-xs">
              <p className="text-[10px] font-bold tracking-wide text-muted-foreground">POS • CONTINUITÉ LIMITÉE</p>
              <p className="mt-1">Cache catalogue<br /><span className="font-bold">À jour • 10:31</span></p>
              <p className="mt-1">File locale<br /><span className="font-bold">12 / 200 opérations</span></p>
              <p className="mt-1">70 / 72 heures</p>
              <p className="mt-1">Codes temporaires<br /><span className="font-bold">64 disponibles</span></p>
              <p className="mt-1">Conflit au retour réseau<br /><span className="font-bold">1 paiement à revoir</span></p>
              <p className="mt-1">Reçus marqués « hors-ligne » + synchroniser +<br /><span className="text-[11px] text-muted-foreground">L&apos;en-tête ne change pas l&apos;état réseau courant du header</span></p>
            </div>
            <Button variant="outline" size="sm" className="mt-2 w-full justify-start text-[11px] font-bold" onClick={() => updatePath("/synchronisation")}>
              Centre de synchronisation existant →
            </Button>
          </Section>

          <Section title="Indisponible hors ligne" sub="Limites affichées au staff, sans promesse de service complet.">
            <div className="space-y-2 text-xs">
              <div>
                <p className="font-bold">Finance sensible</p>
                <p className="text-[11px] text-muted-foreground">Rapprochement temps réel, remboursement, double validation d&apos;une sortie et clôture consolidée.</p>
              </div>
              <div>
                <p className="font-bold">Réglages et administration</p>
                <p className="text-[11px] text-muted-foreground">Changement des tarifs, rôles, politiques, export global et recherche de clients non mis en cache.</p>
              </div>
              <div>
                <p className="font-bold">Atelier</p>
                <p className="text-[11px] text-muted-foreground">Non disponible avec la portée Caisse uniquement ; extension soumise à validation.</p>
              </div>
              <div>
                <p className="font-bold text-amber-700">Retour en ligne nécessaire</p>
                <p className="text-[11px] text-muted-foreground">En cas de doute, garder la file et passer en consultation seule.</p>
              </div>
            </div>
          </Section>

          <Section title="Revue des conflits" sub="Exemple de divergence de paiement.">
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-2.5 text-xs">
              <p className="font-extrabold">PAY-728184 • À EXAMINER</p>
              <p className="mt-1">Version locale<br /><span className="font-bold">6 450 FCFA • 10:42:22</span></p>
              <p className="mt-1">Version serveur<br /><span className="font-bold">5 000 FCFA • 10:42:35</span></p>
              <p className="mt-1">Décision attendue<br /><span className="font-bold">Responsable habilité</span></p>
              <p className="mt-1">Traçabilité<br /><span className="text-[11px] text-muted-foreground">Versions + motif + validateur</span></p>
              <p className="mt-1 text-[11px] text-muted-foreground">Aucune fusion automatique des montants. L&apos;opération liée reste en attente.</p>
            </div>
            <Button variant="outline" size="sm" className="mt-2 w-full justify-start text-[11px] font-bold" onClick={() => updatePath("/synchronisation")}>
              Centre de synchronisation - revue humaine →
            </Button>
          </Section>

          <Section title="Validation du mode offline" sub="Checklist avant activation.">
            <div className="space-y-1.5 text-xs">
              <p><span className="font-bold">Postes</span><br /><span className="text-[11px] text-muted-foreground">2 caisses approuvées, cache protégé et horodatage connu.</span></p>
              <p><span className="font-bold">Codes et seuils</span><br /><span className="text-[11px] text-muted-foreground">Réserve 100 • alerte 20 • limite temps/volume positives.</span></p>
              <p><span className="font-bold">Périmètre</span><br /><span className="text-[11px] text-muted-foreground">Caisse uniquement : confirmation administrateur requise.</span></p>
            </div>
            <div className="mt-2 space-y-1.5">
              <Button variant="outline" size="sm" className="w-full justify-start text-[11px] font-bold" onClick={() => updatePath("/parametres/securite")}>
                Sécurité - cache local →
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-[11px] font-bold" onClick={() => updatePath("/parametres/audit")}>
                Audit & logs - synchronisations →
              </Button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
