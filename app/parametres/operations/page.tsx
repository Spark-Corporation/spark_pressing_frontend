"use client";

import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { FieldLabel, Section, ToggleRow, dirtyCount } from "../_components";

const INITIAL = {
  plPrefix: "PL",
  plSuffix: "-26",
  bgPrefix: "BG",
  bgSuffix: "-26",
  caPrefix: "CA",
  caSuffix: "-26",
  mcPrefix: "MC",
  mcSuffix: "-26",
  delaiClassique: "48",
  delaiExpress: "8",
  delaiRepassage: "24",
  retraitImmediat: true,
  bloquerImpaye: true,
  laveur: true,
  classeur: true,
  mode: "Mixte",
  prixKilo: "1 200",
  fraisCollecte: "1 500",
  fraisLivraison: "2 000",
  tauxFidelite: "5",
  seuilFidelite: "500",
  cumulPromo: false,
  horsLigne: true,
  intervalle: "5",
  retention: "72",
  autoResolve: false,
};

const AGENCES_CODES = [
  ["Plateau", "plPrefix", "plSuffix"],
  ["Bingerville", "bgPrefix", "bgSuffix"],
  ["Cocody Angré", "caPrefix", "caSuffix"],
  ["Marcory", "mcPrefix", "mcSuffix"],
] as const;

export default function OperationsPage() {
  const router = useRouter();
  const [base, setBase] = useState(INITIAL);
  const [form, setForm] = useState(INITIAL);
  const dirty = dirtyCount(base, form);
  const set = (k: keyof typeof INITIAL, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    setBase(form);
    toast.success("Réglages enregistrés", { description: "Agence Bingerville • appliqués immédiatement." });
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
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Paramètres opérationnels</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Règles appliquées au point de vente et à l&apos;atelier • Agence Bingerville
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

      {dirty > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-xs ring-1 ring-amber-100">
          <p className="flex-1 font-bold text-amber-800">{dirty} changement{dirty > 1 ? "s" : ""} non enregistré{dirty > 1 ? "s" : ""}</p>
          <span className="text-amber-700">Dernière sauvegarde aujourd&apos;hui à 09:14</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Section title="Codes dépôt par agence" sub="Préfixes et suffixes garantissant l'unicité des tickets">
            <div className="space-y-3">
              {AGENCES_CODES.map(([label, pk, sk]) => (
                <div key={label} className="grid grid-cols-[1fr_1fr_1fr_1.2fr] items-end gap-2">
                  <p className="pb-2 text-xs font-bold">{label}</p>
                  <div>
                    <FieldLabel>Préfixe</FieldLabel>
                    <Input value={form[pk] as string} onChange={(e) => set(pk, e.target.value.toUpperCase().slice(0, 4))} className="h-9 text-[13px]" />
                  </div>
                  <div>
                    <FieldLabel>Suffixe</FieldLabel>
                    <Input value={form[sk] as string} onChange={(e) => set(sk, e.target.value.slice(0, 4))} className="h-9 text-[13px]" />
                  </div>
                  <div>
                    <FieldLabel>Aperçu</FieldLabel>
                    <p className="rounded-md bg-muted/60 px-2 py-2 text-center text-xs font-bold">
                      {form[pk]}-02684{form[sk]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Délais et retrait" sub="Promesses calculées automatiquement sur le ticket">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(
                [
                  ["Classique", "delaiClassique"],
                  ["Express", "delaiExpress"],
                  ["Repassage", "delaiRepassage"],
                ] as const
              ).map(([label, k]) => (
                <div key={k}>
                  <FieldLabel>{label}</FieldLabel>
                  <div className="relative">
                    <Input inputMode="numeric" value={form[k] as string} onChange={(e) => set(k, e.target.value.replace(/[^0-9]/g, ""))} className="h-9 pr-14 text-[13px]" />
                    <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[11px] text-muted-foreground">heures</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 divide-y divide-border">
              <ToggleRow label="Autoriser le retrait immédiat" sub="Disponible lorsque le dépôt est déjà traité au comptoir." checked={form.retraitImmediat} onChange={(v) => set("retraitImmediat", v)} />
              <ToggleRow label="Bloquer le retrait en cas d'impayé" sub="Le solde doit être réglé avant clôture du retrait." checked={form.bloquerImpaye} onChange={(v) => set("bloquerImpaye", v)} />
            </div>
          </Section>

          <Section title="Cycle atelier" sub="Activez indépendamment les responsabilités Laveur et Classeur">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
                <div className="text-xs">
                  <p className="font-bold">Étape Laveur</p>
                  <p className="text-[11px] text-muted-foreground">Affectation et traçabilité du lavage</p>
                </div>
                <Switch checked={form.laveur} onCheckedChange={(v) => set("laveur", v)} aria-label="Étape Laveur" />
              </div>
              <div className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
                <div className="text-xs">
                  <p className="font-bold">Étape Classeur</p>
                  <p className="text-[11px] text-muted-foreground">Rangement et localisation avant retrait</p>
                </div>
                <Switch checked={form.classeur} onCheckedChange={(v) => set("classeur", v)} aria-label="Étape Classeur" />
              </div>
            </div>
            <p className="mt-3 text-[10px] font-bold tracking-wide text-muted-foreground">APERÇU DU WORKFLOW RÉSULTANT</p>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
              {["En attente", "Laveur", "En cours", "Traité", "Classeur", "Classé"].map((s) => {
                const active = (s === "Laveur" && form.laveur) || (s === "Classeur" && form.classeur) || ["En attente", "En cours", "Traité", "Classé"].includes(s);
                return (
                  <div key={s} className={cn("rounded-lg border p-2 text-center text-[11px] font-bold", active ? "border-emerald-200 bg-emerald-50/60 text-emerald-800" : "border-border bg-muted/40 text-muted-foreground")}>
                    <span className={cn("mx-auto mb-1 block size-1.5 rounded-full", active ? "bg-emerald-500" : "bg-muted-foreground/40")} />
                    {active && (s === "Laveur" || s === "Classeur") && (
                      <Badge variant="outline" className="mb-1 border-0 bg-emerald-100 px-1 py-0 text-[9px] font-bold text-emerald-700">
                        Active
                      </Badge>
                    )}
                    {s}
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="Tarification et services" sub="Modes et frais appliqués à Bingerville">
            <div className="flex gap-1.5">
              {(["Pièce", "Kilo", "Mixte"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set("mode", m)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors",
                    form.mode === m ? "border-primary bg-primary/5" : "border-border text-muted-foreground",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(
                [
                  ["Prix au kilo", "prixKilo", "FCFA / kg"],
                  ["Frais de collecte", "fraisCollecte", "FCFA"],
                  ["Frais de livraison", "fraisLivraison", "FCFA"],
                ] as const
              ).map(([label, k, unit]) => (
                <div key={k}>
                  <FieldLabel>{label}</FieldLabel>
                  <div className="relative">
                    <Input inputMode="numeric" value={form[k] as string} onChange={(e) => set(k, e.target.value.replace(/[^0-9]/g, ""))} className="h-9 pr-16 text-[13px]" />
                    <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[11px] text-muted-foreground">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Fidélité" sub="Points attribués après paiement">
            <FieldLabel>Taux de fidélité</FieldLabel>
            <div className="relative">
              <Input inputMode="numeric" value={form.tauxFidelite as string} onChange={(e) => set("tauxFidelite", e.target.value.replace(/[^0-9]/g, ""))} className="h-9 pr-24 text-[13px]" />
              <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[11px] text-muted-foreground">% du montant</span>
            </div>
            <div className="mt-3">
              <FieldLabel>Seuil d&apos;utilisation</FieldLabel>
              <div className="relative">
                <Input inputMode="numeric" value={form.seuilFidelite as string} onChange={(e) => set("seuilFidelite", e.target.value.replace(/[^0-9]/g, ""))} className="h-9 pr-16 text-[13px]" />
                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[11px] text-muted-foreground">points</span>
              </div>
            </div>
            <div className="mt-2">
              <ToggleRow label="Cumuler sur les promotions" sub="Les promotions génèrent aussi des points." checked={form.cumulPromo} onChange={(v) => set("cumulPromo", v)} />
            </div>
          </Section>

          <Section title="Synchronisation hors ligne" sub="Résilience du point de vente">
            <ToggleRow label="Activer le mode hors ligne" sub="Autoriser dépôts et encaissements sans réseau." checked={form.horsLigne} onChange={(v) => set("horsLigne", v)} />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <FieldLabel>Intervalle de synchronisation</FieldLabel>
                <div className="relative">
                  <Input inputMode="numeric" value={form.intervalle as string} onChange={(e) => set("intervalle", e.target.value.replace(/[^0-9]/g, ""))} className="h-9 pr-14 text-[13px]" />
                  <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[11px] text-muted-foreground">minutes</span>
                </div>
              </div>
              <div>
                <FieldLabel>Rétention locale</FieldLabel>
                <div className="relative">
                  <Input inputMode="numeric" value={form.retention as string} onChange={(e) => set("retention", e.target.value.replace(/[^0-9]/g, ""))} className="h-9 pr-14 text-[13px]" />
                  <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[11px] text-muted-foreground">heures</span>
                </div>
              </div>
            </div>
            <ToggleRow label="Résoudre automatiquement" sub="Le réseau conserve la version la plus récente." checked={form.autoResolve} onChange={(v) => set("autoResolve", v)} />
            <p className="mt-1 rounded-lg bg-emerald-50 p-2 text-[11px] text-emerald-800 ring-1 ring-emerald-100">
              <span className="font-bold">Synchronisation saine</span>
              <br />
              0 conflit • test réussi à 10:31
            </p>
          </Section>

          <Section title="Journal des modifications" sub="Bingerville">
            <div className="space-y-2.5 text-xs">
              {[
                ["10:28", "Étape Classeur activée", "Aïcha K."],
                ["09:14", "Frais de livraison : 1 500 → 2 000", "Moussa K."],
                ["Hier", "Délai Express : 12 h → 8 h", "Aïcha K."],
                ["25 sept.", "Mode Mixte activé", "Admin réseau"],
              ].map(([h, q, qui]) => (
                <div key={q} className="flex gap-2">
                  <span className="w-14 shrink-0 text-[11px] text-muted-foreground">{h}</span>
                  <div className="min-w-0">
                    <p className="font-bold">{q}</p>
                    <p className="text-[11px] text-muted-foreground">{qui}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
