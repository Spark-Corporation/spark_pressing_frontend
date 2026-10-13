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
  minimum: "5 000 FCFA",
  collecte: true,
  livraison: true,
  calcul: "zone",
  offrir: true,
  fraisCollecte: "1 500",
  fraisLivraison: "2 000",
};

export default function CollectePage() {
  const router = useRouter();
  const { updatePath } = useGlobalData();
  const [base, setBase] = useState(INITIAL);
  const [form, setForm] = useState(INITIAL);
  const dirty = dirtyCount(base, form);
  const set = (k: keyof typeof INITIAL, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const collecteN = Number(String(form.fraisCollecte).replace(/[^0-9]/g, "")) || 0;
  const livraisonN = Number(String(form.fraisLivraison).replace(/[^0-9]/g, "")) || 0;
  const totalEstime = 18000 + collecteN + livraisonN;
  const fmt = (n: number) => n.toLocaleString("fr-FR").replace(/,/g, " ");

  const handleSave = () => {
    setBase(form);
    toast.success("Règles enregistrées", { description: "Collecte et livraison • Bingerville." });
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
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Collecte & livraison</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Zones, créneaux et frais de service appliqués à chaque dépôt.
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
        <span className="text-muted-foreground">Agence Bingerville • Règles locales • 2 zones desservies</span>
      </div>

      {dirty > 0 && (
        <div className="rounded-xl bg-amber-50 px-4 py-2.5 text-xs ring-1 ring-amber-100">
          <p className="font-bold text-amber-800">{dirty} changements non enregistrés</p>
          <p className="text-amber-700">Dernière sauvegarde aujourd&apos;hui à 09:14 • Vérifiez les règles avant d&apos;enregistrer. Les réglages ne sont pas encore appliqués.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Section title="Services et couverture" sub="La collecte et la livraison peuvent être activées séparément.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel required>Agence à configurer</FieldLabel>
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
                <FieldLabel required>Minimum de commande</FieldLabel>
                <Input value={form.minimum as string} onChange={(e) => set("minimum", e.target.value)} className="h-9 text-[13px]" />
                <p className="mt-1 text-[11px] text-muted-foreground">Montant net des articles, hors frais de service.</p>
              </div>
            </div>
            <CheckRow label="Activer la collecte - Activé" sub="Enlèvement du dépôt à une adresse client desservie." checked={form.collecte as boolean} onChange={(v) => set("collecte", v)} id="col-collecte" />
            <CheckRow label="Activer la livraison - Activé" sub="Retour du dépôt à une adresse client desservie." checked={form.livraison as boolean} onChange={(v) => set("livraison", v)} id="col-livraison" />
            <div className="mt-2 space-y-2 text-xs">
              {[
                ["Bingerville - Collecte + livraison", "Zone Centre et zone Résidentiel • départ depuis route d'Eloka"],
                ["Cocody Angré - Collecte + livraison", "Angré et Deux Plateaux • réglages propres à l'agence"],
                ["Plateau - Livraison seule", "Plateau Centre • collecte désactivée"],
                ["Marcory - Désactivée", "Aucune zone publiée • service au comptoir uniquement"],
              ].map(([t, s]) => (
                <div key={t} className="rounded-lg border border-border p-2.5">
                  <p className="font-bold">{t}</p>
                  <p className="text-[11px] text-muted-foreground">{s}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Couverture par agence : Une adresse hors zone ne peut pas être sélectionnée au POS. Les règles de Bingerville ne s&apos;appliquent pas aux autres agences.</p>
          </Section>

          <Section title="Zones et adresses desservies" sub="Définissez des limites précises et non une simple ville.">
            <p className="text-[11px] font-bold">2 zones • 1 à vérifier</p>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-3 text-xs">
                <p className="font-extrabold">Résidentiel - Z-BG-02</p>
                <div className="mt-1.5 space-y-1">
                  <p><span className="text-muted-foreground">Quartiers inclus : </span><span className="font-semibold">Résidentiel, route d&apos;Eloka</span></p>
                  <p><span className="text-muted-foreground">Agence de couverture : </span><span className="font-semibold">Bingerville</span></p>
                  <p><span className="text-muted-foreground">Adresse de départ : </span><span className="font-semibold">Route d&apos;Eloka, agence Bingerville</span></p>
                  <p><span className="text-muted-foreground">Limite géographique : </span><span className="font-semibold">5 km depuis l&apos;agence</span></p>
                  <p className="text-muted-foreground">À confirmer avec les adresses limites de la zone.</p>
                  <p><span className="text-muted-foreground">Adresse test : </span><span className="font-semibold">Villa 24, quartier Résidentiel, Bingerville</span></p>
                  <p className="text-muted-foreground">Téléphone et point de repère requis lors de la réservation.</p>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="rounded-lg bg-emerald-50/60 p-2.5 ring-1 ring-emerald-100">
                  <p className="font-extrabold">Centre - Z-BG-01 - Validée</p>
                  <p className="text-[11px] text-muted-foreground">Bingerville Centre, mairie et marché central. Agence : Bingerville • rayon maximal 3 km. Collecte : 1 500 FCFA • livraison : 2 000 FCFA.</p>
                  <Button variant="ghost" size="sm" className="mt-1 h-auto p-0 text-[11px] font-bold" onClick={() => toast.info("Zone Centre", { description: "Modifier la zone validée." })}>Modifier la zone →</Button>
                </div>
                <div className="rounded-lg bg-amber-50/60 p-2.5 ring-1 ring-amber-100">
                  <p className="font-extrabold">Résidentiel - Z-BG-02 - À vérifier</p>
                  <p className="text-[11px] text-muted-foreground">Quartier Résidentiel et route d&apos;Eloka. Agence : Bingerville • rayon maximal 5 km. Collecte : 2 000 FCFA • livraison : 2 500 FCFA.</p>
                  <Button variant="ghost" size="sm" className="mt-1 h-auto p-0 text-[11px] font-bold text-amber-700" onClick={() => toast.info("Zone Résidentiel", { description: "Confirmez la couverture et l'adresse test." })}>Vérifier la limite →</Button>
                </div>
              </div>
            </div>
            <p className="mt-2 text-[11px] font-bold text-amber-700">Vérification de zone requise</p>
            <p className="text-[11px] text-muted-foreground">Confirmez la couverture de l&apos;adresse test et l&apos;absence de chevauchement ambigu avant de publier la zone Résidentiel.</p>
          </Section>

          <Section title="Frais et gratuité" sub="Le supplément porte sur le dépôt, jamais sur chaque vêtement.">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              {[
                ["Collecte - frais fixes de référence", `${fmt(collecteN)} FCFA`, "Zone Centre - collecte"],
                ["Livraison - frais fixes de référence", `${fmt(livraisonN)} FCFA`, "Zone Centre - livraison"],
                ["Zone Résidentiel - collecte", "2 000 FCFA", ""],
                ["Zone Résidentiel - livraison", "2 500 FCFA", ""],
                ["Seuil de gratuité", "25 000 FCFA", "Montant net des articles du dépôt."],
                ["Zones éligibles", "Centre uniquement", "Cumul promotionnel"],
                ["Clients éligibles", "Tous les clients", "Non cumulable"],
              ].map(([k, v, s]) => (
                <div key={k}>
                  <p className="text-muted-foreground">{k}</p>
                  <p className="font-extrabold">{v}</p>
                  {s ? <p className="text-[11px] text-muted-foreground">{s}</p> : null}
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel>Collecte (FCFA)</FieldLabel>
                <Input inputMode="numeric" value={form.fraisCollecte as string} onChange={(e) => set("fraisCollecte", e.target.value.replace(/[^0-9]/g, ""))} className="h-9 text-[13px]" />
              </div>
              <div>
                <FieldLabel>Livraison (FCFA)</FieldLabel>
                <Input inputMode="numeric" value={form.fraisLivraison as string} onChange={(e) => set("fraisLivraison", e.target.value.replace(/[^0-9]/g, ""))} className="h-9 text-[13px]" />
              </div>
            </div>
            <Label className="mt-3 mb-1.5 text-xs font-semibold">Calcul des frais</Label>
            <RadioGroup value={form.calcul as string} onValueChange={(v) => set("calcul", v)} className="grid grid-cols-2 gap-2">
              {(["fixes", "zone"] as const).map((v) => (
                <Label
                  key={v}
                  htmlFor={`col-calcul-${v}`}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
                >
                  <RadioGroupItem id={`col-calcul-${v}`} value={v} />
                  {v === "fixes" ? "Frais fixes" : "Selon la zone"}
                </Label>
              ))}
            </RadioGroup>
            <p className="mt-1 text-[11px] text-muted-foreground">Frais fixes : le même montant dans les zones actives. Selon la zone : grille ci-dessous.</p>
            <CheckRow label="Offrir la livraison sous conditions - Activé" sub="La collecte reste facturée. Une ligne livraison à 0 FCFA est conservée sur le dépôt." checked={form.offrir as boolean} onChange={(v) => set("offrir", v)} id="col-offrir" />
            <p className="mt-1 text-[11px] text-muted-foreground">Supplément unique au dépôt : Un dépôt de 6 vêtements paie une seule collecte et une seule livraison. Les frais sont affichés séparément du prix des articles ; aucune multiplication par quantité.</p>
          </Section>

          <Section title="Horaires et créneaux" sub="Créneaux proposés en caisse, selon les horaires de l'agence.">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              {[
                ["Jours de service", "Lundi à samedi"],
                ["Horaires du service", "09:00–17:00"],
                ["Durée d'un créneau", "2 heures"],
                ["Capacité par créneau", "8 dépôts"],
                ["Délai de réservation", "4 heures avant le créneau"],
                ["Heure limite du jour", "13:00"],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-muted-foreground">{k}</p>
                  <p className="font-bold">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-2 space-y-1 text-xs">
              <p><span className="font-bold">Collecte</span><br /><span className="text-muted-foreground">09:00–11:00 • 11:00–13:00 • 15:00–17:00</span></p>
              <p><span className="font-bold">Livraison</span><br /><span className="text-muted-foreground">09:00–11:00 • 11:00–13:00 • 15:00–17:00</span></p>
              <p><span className="font-bold">Indisponibilités</span><br /><span className="text-muted-foreground">Dimanche fermé • pause 13:00–15:00 • jours exceptionnels du calendrier agence</span></p>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Contrôles avant publication : Un créneau doit avoir un début antérieur à sa fin, sans chevauchement, avec une capacité positive. Adresse, zone, téléphone, minimum de commande et créneaux sont requis au POS.</p>
          </Section>

          <Section title="Vérification avant enregistrement" sub="Champs * requis • minimum et créneaux vérifiés • zone Résidentiel à valider avant publication. Les suppléments s'appliquent une fois par dépôt.">
            <p className="text-[11px] text-muted-foreground">Les modifications sont attribuées à Aïcha Koné et consignées dans le journal de l&apos;enseigne.</p>
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Estimation du tarif" sub="Simulation non facturable • dépôt exemple.">
            <div className="rounded-lg border border-border p-3 text-xs">
              <p className="text-[11px] text-muted-foreground">Zone test</p>
              <p className="font-bold">Centre</p>
              <p className="mt-1.5 text-[11px] text-muted-foreground">Adresse client</p>
              <p className="font-bold">Rue de la mairie, Bingerville</p>
              <p className="mt-1.5 text-[11px] text-muted-foreground">Montant des articles</p>
              <p className="font-bold">18 000 FCFA</p>
              <p className="mt-1.5 text-[11px] text-muted-foreground">Services choisis</p>
              <p className="font-bold">Collecte + livraison</p>
            </div>
            <div className="mt-2 rounded-lg bg-emerald-50/60 p-3 text-xs ring-1 ring-emerald-100">
              <p className="text-[10px] font-bold tracking-wide text-muted-foreground">ESTIMATION AU DÉPÔT</p>
              <p className="mt-1 flex justify-between"><span className="text-muted-foreground">Articles • 6 vêtements</span><span className="font-bold">18 000 FCFA</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Collecte • une fois</span><span className="font-bold">{fmt(collecteN)} FCFA</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Livraison • une fois</span><span className="font-bold">{fmt(livraisonN)} FCFA</span></p>
              <p className="mt-1 flex justify-between border-t border-emerald-100 pt-1"><span className="font-bold">Total estimé</span><span className="font-extrabold">{fmt(totalEstime)} FCFA</span></p>
              <p className="mt-1 text-[11px] text-muted-foreground">Gratuité non atteinte : seuil de 25 000 FCFA. Estimation à confirmer au POS.</p>
            </div>
          </Section>

          <Section title="Aperçu du POS" sub="Ce que verra le staff au dépôt.">
            <div className="rounded-lg bg-muted/50 p-3 text-xs">
              <p className="text-[10px] font-bold tracking-wide text-muted-foreground">NOUVEAU DÉPÔT • BINGERVILLE</p>
              <p className="mt-1.5 text-[11px] text-muted-foreground">Client</p>
              <p className="font-bold">Aminata Koné</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Collecte</p>
              <p className="font-bold">Centre • 09:00–11:00</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Adresse de livraison</p>
              <p className="font-bold">Rue de la mairie, Bingerville</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Livraison</p>
              <p className="font-bold">Centre • 15:00–17:00</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Frais de service au dépôt</p>
              <p className="font-bold">{fmt(collecteN + livraisonN)} FCFA</p>
              <p className="mt-1 text-[11px] text-muted-foreground">À encaisser</p>
              <p className="font-extrabold">{fmt(totalEstime)} FCFA</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Les adresses non disponibles sont exclues ; aucun frais n&apos;est ajouté à chaque article.</p>
            </div>
          </Section>

          <Section title="Validation de publication" sub="État des règles proposées.">
            <div className="space-y-1.5 text-xs">
              <p><span className="font-bold">Tarifs et minimum</span> <span className="text-emerald-600">• Vérifiés</span><br /><span className="text-[11px] text-muted-foreground">Frais positifs • seuil de gratuité supérieur au minimum.</span></p>
              <p><span className="font-bold">Créneaux</span> <span className="text-emerald-600">• Vérifiés</span><br /><span className="text-[11px] text-muted-foreground">Plages incluses dans les horaires d&apos;ouverture de Bingerville.</span></p>
              <p><span className="font-bold">Zone Résidentiel</span> <span className="text-amber-600">• À vérifier</span><br /><span className="text-[11px] text-muted-foreground">Adresse limite et couverture de la zone à confirmer.</span></p>
            </div>
            <div className="mt-2 space-y-1.5">
              <Button variant="outline" size="sm" className="w-full justify-start text-[11px] font-bold" onClick={() => updatePath("/parametres/organisation")}>
                Organisation & agences • horaires →
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-[11px] font-bold" onClick={() => updatePath("/parametres/operations")}>
                Configuration opérationnelle • tarifs →
              </Button>
            </div>
          </Section>

          <Section title="Dernière modification">
            <p className="text-xs font-bold">Aujourd&apos;hui • 09:14</p>
            <p className="text-[11px] text-muted-foreground">Moussa K. • Bingerville</p>
            <p className="text-[11px] text-muted-foreground">Livraison Centre : 1 500 → 2 000 FCFA</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Application aux prochains dépôts : Les frais déjà acceptés sur les dépôts existants restent inchangés.</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
