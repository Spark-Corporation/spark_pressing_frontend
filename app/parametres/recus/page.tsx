"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CircleAlert,
  Eye,
  Printer,
  RotateCcw,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldLabel, Section } from "../_components";

const CHAMPS_GAUCHE: [string, string][] = [
  ["pressing", "Pressing / agence"],
  ["contacts", "Contacts"],
  ["rccm", "RCCM / NIF"],
  ["client", "Client et téléphone"],
  ["caissier", "Caissier"],
  ["dates", "Dates dépôt / retrait"],
];

const CHAMPS_DROITE: [string, string][] = [
  ["traitement", "Traitement"],
  ["taxes", "Taxes"],
  ["remises", "Remises & fidélité"],
  ["acompte", "Acompte / avance"],
  ["reste", "Reste à payer"],
  ["pieces", "Nombre de pièces"],
];

const TABLEAU_GAUCHE: [string, string][] = [
  ["quantite", "Quantité"],
  ["designation", "Désignation"],
  ["prix", "Prix unitaire"],
  ["montant", "Montant"],
];

const TABLEAU_DROITE: [string, string][] = [
  ["rangement", "Rangement"],
  ["etat", "État du vêtement"],
  ["reference", "Référence article"],
  ["observation", "Observation publique"],
];

const PIED: [string, string][] = [
  ["qr", "QR code dépôt"],
  ["mentions", "Mentions légales"],
  ["codebarres", "Code-barres"],
  ["garde", "Politique de garde"],
  ["signature", "Signature / cachet"],
  ["message", "Message de pied"],
  ["contacts", "Contacts et agences"],
  ["offline", "Impression offline"],
];

const DEFAULT_CHAMPS = Object.fromEntries([...CHAMPS_GAUCHE, ...CHAMPS_DROITE].map(([k]) => [k, k !== "taxes"]));
const DEFAULT_TABLEAU = Object.fromEntries([...TABLEAU_GAUCHE, ...TABLEAU_DROITE].map(([k]) => [k, !["reference", "observation"].includes(k)]));
const DEFAULT_PIED = Object.fromEntries(PIED.map(([k]) => [k, true]));

export default function RecusPage() {
  const router = useRouter();
  const [modele, setModele] = useState<"ticket" | "facture">("ticket");
  const [format, setFormat] = useState("80 mm");
  const [copies, setCopies] = useState("1 exemplaire");
  const [defaut, setDefaut] = useState("Ticket");
  const [logo, setLogo] = useState(true);
  const [monogramme, setMonogramme] = useState("SP");
  const [alignement, setAlignement] = useState("Centré");
  const [taille, setTaille] = useState("10 pt");
  const [densite, setDensite] = useState("Compacte");
  const [largeur, setLargeur] = useState("80 mm");
  const [marges, setMarges] = useState("4 mm");
  const [interligne, setInterligne] = useState("x2");
  const [champs, setChamps] = useState<Record<string, boolean>>(DEFAULT_CHAMPS);
  const [tableau, setTableau] = useState<Record<string, boolean>>(DEFAULT_TABLEAU);
  const [pied, setPied] = useState<Record<string, boolean>>(DEFAULT_PIED);
  const [messagePied, setMessagePied] = useState("Merci pour votre confiance. Conservez ce reçu.");
  const [modeles, setModeles] = useState<Record<string, string>>({
    depot: "Ticket 58/80 mm",
    paiement: "Reçu de paiement",
    retrait: "Bon de retrait/livraison",
    atelier: "Étiquette atelier",
    proforma: "Devis/Facture proforma",
    facture: "Facture A4",
  });

  const toggleIn = (
    setter: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  ) => (k: string) => setter((s) => ({ ...s, [k]: !s[k] }));
  const toggleChamp = toggleIn(setChamps);
  const toggleTableau = toggleIn(setTableau);
  const togglePied = toggleIn(setPied);

  const resetAll = () => {
    setModele("ticket");
    setChamps(DEFAULT_CHAMPS);
    setTableau(DEFAULT_TABLEAU);
    setPied(DEFAULT_PIED);
    setMessagePied("Merci pour votre confiance. Conservez ce reçu.");
    toast.info("Brouillon restauré", { description: "Modèle 58/80 mm par défaut." });
  };

  const miniSelect = (value: string, onChange: (v: string) => void, options: string[], label: string) => (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <Select value={value} onValueChange={(v) => onChange(v ?? value)}>
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
    </div>
  );

  const toggleList = (rows: [string, string][], state: Record<string, boolean>, toggle: (k: string) => void) => (
    <div className="space-y-1">
      {rows.map(([k, label]) => (
        <button
          key={k}
          type="button"
          onClick={() => toggle(k)}
          className="flex w-full items-center justify-between gap-2 py-0.5 text-xs"
        >
          <span className={state[k] ? "font-semibold" : "text-muted-foreground"}>{label}</span>
          <Switch checked={!!state[k]} onCheckedChange={() => toggle(k)} aria-label={label} size="sm" />
        </button>
      ))}
    </div>
  );

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
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl">
            Configuration des reçus
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700">
              Brouillon
            </Badge>
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Personnalisez les tickets thermiques et factures A4 de toutes les agences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="lg" className="gap-1.5 px-3 text-xs font-bold" onClick={resetAll}>
            <RotateCcw className="size-3.5" />
            Restaurer
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.success("Brouillon enregistré", { description: "Reçu 58/80 mm." })}
          >
            <Save className="size-3.5" />
            Enregistrer le brouillon
          </Button>
          <Button
            size="lg"
            className="gap-1.5 px-4 text-xs font-bold"
            onClick={() => toast.success("Modèles publiés", { description: "4 agences • tickets et factures." })}
          >
            <Printer className="size-4" />
            Publier
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs ring-1 ring-emerald-100">
        <Eye className="size-4 shrink-0 text-emerald-600" />
        <p className="min-w-0 flex-1 font-medium text-emerald-800">
          Aperçu en direct actif — les changements restent en brouillon jusqu&apos;à publication.
        </p>
        <span className="text-[11px] text-emerald-700">Enregistré à 16:28</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-xs ring-1 ring-red-100">
        <CircleAlert className="size-4 shrink-0 text-red-500" />
        <p className="min-w-0 flex-1 font-medium text-red-700">
          Règle absolue : les notes internes et les détails confidentiels du vêtement ne doivent jamais apparaître sur le reçu.
        </p>
        <span className="text-[11px] font-bold text-red-600">Protection active</span>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Section
            title="Modèles et format"
            sub="Choisissez le document utilisé par défaut pour chaque événement."
            right={
              <Badge variant="outline" className="gap-1 border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Actif
              </Badge>
            }
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(
                [
                  ["ticket", "Ticket 58/80 mm", "Thermique • compact", "Par défaut"],
                  ["facture", "Facture A4", "Portrait • structurée", "Disponible"],
                ] as const
              ).map(([v, title, sub, badge]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setModele(v)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-colors",
                    modele === v ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                  )}
                >
                  <p className="flex items-center justify-between text-xs font-bold">
                    {title}
                    <Badge variant="outline" className={cn("border-0 text-[10px] font-bold", modele === v ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>
                      {badge}
                    </Badge>
                  </p>
                  <p className="text-[11px] text-muted-foreground">{sub}</p>
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {miniSelect(format, setFormat, ["80 mm", "58 mm"], "Format papier")}
              {miniSelect(copies, setCopies, ["1 exemplaire", "2 exemplaires"], "Copies")}
              {miniSelect(defaut, setDefaut, ["Ticket", "Facture A4"], "Modèle par défaut")}
            </div>
          </Section>

          <Section title="Identité et mise en page" sub="Logo, marges et densité communes aux deux modèles.">
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="rc-logo" className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                <Checkbox id="rc-logo" checked={logo} onCheckedChange={(v) => setLogo(v === true)} />
                Logo principal
              </Label>
              <span className="text-[11px] text-muted-foreground">logo-spark.svg • 24 ko</span>
              <div className="ml-2 flex items-center gap-1.5">
                <FieldLabel>Monogramme</FieldLabel>
                <Input value={monogramme} onChange={(e) => setMonogramme(e.target.value.slice(0, 2))} className="h-8 w-16 text-center text-xs font-bold" aria-label="Monogramme" />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {miniSelect(alignement, setAlignement, ["Centré", "Gauche"], "Alignement")}
              {miniSelect(taille, setTaille, ["10 pt", "12 pt"], "Taille de police")}
              {miniSelect(densite, setDensite, ["Compacte", "Aérée"], "Densité")}
              {miniSelect(largeur, setLargeur, ["80 mm", "58 mm"], "Largeur")}
              {miniSelect(marges, setMarges, ["4 mm", "6 mm"], "Marges")}
              {miniSelect(interligne, setInterligne, ["x2", "x1,5"], "Interligne")}
            </div>
          </Section>

          <Section title="Champs visibles et ordre des blocs" sub="Glissez les blocs pour les réordonner.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-[10px] font-bold tracking-wide text-muted-foreground">EN-TÊTE & CLIENT</p>
                {toggleList(CHAMPS_GAUCHE, champs, toggleChamp)}
              </div>
              <div>
                <p className="mb-1 text-[10px] font-bold tracking-wide text-muted-foreground">PAIEMENT & SUIVI</p>
                {toggleList(CHAMPS_DROITE, champs, toggleChamp)}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["01 En-tête", "02 Dépôt", "03 Articles", "04 Totaux"].map((b) => (
                <Badge key={b} variant="outline" className="border-0 bg-muted text-[10px] font-semibold text-foreground">
                  {b}
                </Badge>
              ))}
            </div>
          </Section>

          <Section title="Tableau, états et rangement" sub="Colonnes propres au modèle A4.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>{toggleList(TABLEAU_GAUCHE, tableau, toggleTableau)}</div>
              <div>{toggleList(TABLEAU_DROITE, tableau, toggleTableau)}</div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["États : Bon • Taché • Fragile", "Rangement : Zone • Portant • Casse"].map((b) => (
                <Badge key={b} variant="outline" className="border-0 bg-muted text-[10px] font-semibold text-foreground">
                  {b}
                </Badge>
              ))}
            </div>
          </Section>

          <Section title="Pied de page, codes et impression" sub="Éléments de bas de page et disponibilité locale.">
            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              <div>{toggleList(PIED.slice(0, 4), pied, togglePied)}</div>
              <div>{toggleList(PIED.slice(4), pied, togglePied)}</div>
            </div>
            <div className="mt-3">
              <FieldLabel>Message de pied de page</FieldLabel>
              <Input value={messagePied} onChange={(e) => setMessagePied(e.target.value)} className="h-9 text-[13px]" />
            </div>
            <p className="mt-2 rounded-lg bg-amber-50 p-2 text-[11px] text-amber-800 ring-1 ring-amber-100">
              POS-01 prêt • numérotation locale LOCAL-BGV active hors connexion.
            </p>
          </Section>

          <Section title="Modèles supplémentaires" sub="Choisissez un modèle par défaut pour chaque événement.">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(
                [
                  ["depot", "Dépôt", ["Ticket 58/80 mm", "Facture A4"]],
                  ["paiement", "Paiement", ["Reçu de paiement", "Ticket 58/80 mm"]],
                  ["retrait", "Retrait", ["Bon de retrait/livraison", "Ticket 58/80 mm"]],
                  ["atelier", "Atelier", ["Étiquette atelier", "Ticket 58/80 mm"]],
                  ["proforma", "Proforma", ["Devis/Facture proforma", "Facture A4"]],
                  ["facture", "Facture A4", ["Facture A4", "Ticket 58/80 mm"]],
                ] as const
              ).map(([k, label, options]) => (
                <div key={k}>
                  <FieldLabel>{label}</FieldLabel>
                  <Select value={modeles[k]} onValueChange={(v) => setModeles((m) => ({ ...m, [k]: v ?? options[0] }))}>
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
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                ["Ticket 58/80 mm", "Format conseillé • 80 mm", "Usage : dépôt, retrait, suivi rapide", "Par défaut"],
                ["Facture A4", "Format conseillé • A4 portrait", "Usage : facturation détaillée, archivage", "Disponible"],
                ["Bon de dépôt", "Format conseillé • 80 mm", "Usage : remise en main propre, inventaire", "Disponible"],
                ["Reçu de paiement", "Format conseillé • 80 mm", "Usage : validation paiement, justificatif", "Disponible"],
                ["Bon de retrait/livraison", "Format conseillé • 80 mm", "Usage : remise au client, livraison", "Disponible"],
                ["Étiquette atelier", "Format conseillé • étiquette 38 mm", "Usage : suivi atelier, code-barres ou QR", "Disponible"],
                ["Devis/Facture proforma", "Format conseillé • A4 portrait", "Usage : devis, estimation, commande", "Disponible"],
              ].map(([t, f, u, b]) => (
                <div key={t} className="rounded-lg border border-border p-2.5 text-[11px]">
                  <p className="flex items-center justify-between text-xs font-bold">
                    {t}
                    <Badge variant="outline" className={cn("border-0 text-[10px] font-bold", b === "Par défaut" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>
                      {b}
                    </Badge>
                  </p>
                  <p className="mt-0.5 text-muted-foreground">{f}</p>
                  <p className="text-muted-foreground">{u}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Aperçu */}
        <div className="xl:sticky xl:top-20 xl:self-start">
          <Section
            title="Aperçu en direct"
            sub="Données de démonstration • mise à jour instantanée"
            right={
              <Button variant="outline" size="sm" className="gap-1 text-[11px] font-bold" onClick={() => toast.success("Impression testée", { description: `Ticket ${largeur} • POS-01.` })}>
                <Eye className="size-3.5" />
                Tester l&apos;impression
              </Button>
            }
          >
            <div className="mx-auto max-w-56 bg-white px-4 py-5 text-center shadow-md" style={{ textAlign: alignement === "Centré" ? "center" : "left" }}>
              {logo && (
                <span className="mx-auto flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-extrabold text-secondary" style={{ marginInline: alignement === "Centré" ? "auto" : undefined }}>
                  {monogramme || "SP"}
                </span>
              )}
              {champs.pressing && <p className="mt-1 text-[11px] font-extrabold">SPARK PRESSING</p>}
              {champs.contacts && <p className="text-[9px] text-muted-foreground">Carrefour Feh Kessé • +225 27 22 40 14 07</p>}
              {champs.rccm && <p className="text-[9px] text-muted-foreground">RCCM CI-ABJ-2024-B-01842</p>}
              <div className="my-2 border-t border-dashed border-border" />
              {champs.client && (
                <p className="text-[10px]">
                  <span className="font-bold">DEP-240928</span>
                  <br />
                  Aminata Diarra • 07 48 22 19 03
                </p>
              )}
              {champs.caissier && <p className="text-[9px] text-muted-foreground">Caissière : Grâce A.</p>}
              {champs.dates && <p className="text-[9px] text-muted-foreground">Dépôt 28/09 • Retrait 30/09</p>}
              <div className="mt-2 text-left text-[9px]">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 font-bold">
                  <span>DÉSIGNATION</span>
                  {tableau.quantite && <span>QTÉ</span>}
                  {tableau.prix && <span>P.U.</span>}
                  {tableau.montant && <span>TOTAL</span>}
                </div>
                {[
                  ["Chemise homme", "2", "1 500", "3 000"],
                  ["Pantalon costume", "2", "2 000", "4 000"],
                  ["Costume 2 pièces", "1", "6 500", "6 500"],
                ].map(([d, q, p, t]) => (
                  <div key={d} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 py-0.5">
                    <span>
                      {d}
                      {tableau.etat && <span className="block text-muted-foreground">Bon état</span>}
                      {tableau.rangement && <span className="block text-muted-foreground">Zone A</span>}
                      {tableau.reference && <span className="block text-muted-foreground">Réf. ART-001</span>}
                    </span>
                    {tableau.quantite && <span className="text-center">{q}</span>}
                    {tableau.prix && <span className="text-right">{p}</span>}
                    {tableau.montant && <span className="text-right font-bold">{t}</span>}
                  </div>
                ))}
                {tableau.observation && <p className="mt-1 text-muted-foreground">Sans observation.</p>}
              </div>
              <div className="my-2 border-t border-dashed border-border" />
              <div className="text-[10px]">
                {champs.traitement && <p className="flex justify-between"><span>Traitement</span><span>Express</span></p>}
                {champs.remises && <p className="flex justify-between"><span>Remise fidélité</span><span>−1 000 FCFA</span></p>}
                {champs.acompte && <p className="flex justify-between"><span>Acompte</span><span>15 000 FCFA</span></p>}
                {champs.reste && <p className="flex justify-between font-extrabold"><span>RESTE À PAYER</span><span>5 500 FCFA</span></p>}
                {champs.pieces && <p className="flex justify-between text-muted-foreground"><span>7 pièces</span><span>Aujourd&apos;hui à 17h00</span></p>}
              </div>
              {pied.qr && (
                <div className="mx-auto mt-2 size-12 rounded bg-[repeating-linear-gradient(45deg,#0c2b23_0_2px,transparent_2px_4px)]" role="img" aria-label="QR DEP-240928" />
              )}
              {pied.codebarres && <div className="mx-auto mt-1 h-4 w-24 rounded-sm bg-[repeating-linear-gradient(90deg,#111_0_2px,transparent_2px_5px)]" role="img" aria-label="Code-barres" />}
              {pied.message && <p className="mt-1 text-[9px]">{messagePied}</p>}
              {pied.mentions && <p className="text-[8px] text-muted-foreground">SPARK PRESSING SARL • RCCM CI-ABJ-2024-B-01842</p>}
              {pied.signature && <p className="mt-1 border-t border-border pt-1 text-[9px] text-muted-foreground">Signature / cachet : ___________</p>}
              {pied.garde && <p className="text-[8px] text-muted-foreground">Retrait sous 30 jours maximum.</p>}
              {pied.contacts && <p className="text-[8px] text-muted-foreground">Carrefour Feh Kessé • +225 27 22 40 14 07</p>}
              {pied.offline && <p className="text-[8px] font-bold">LOCAL-BGV • hors connexion OK</p>}
            </div>
            <p className="mt-2 rounded-lg bg-emerald-50 p-2 text-[11px] text-emerald-800 ring-1 ring-emerald-100">
              Prêt à publier dans 4 agences
              <span className="block font-normal">Contraste WCAG AA validé • version restaurable créée automatiquement.</span>
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
