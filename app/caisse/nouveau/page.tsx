"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Check,
  CircleAlert,
  Hash,
  Save,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES_ENTREE, CATEGORIES_SORTIE, formatFCFA } from "../data";

const SOLDE_ESPECES = 983500;
const SEUIL_DOUBLE_CONTROLE = 250000;
const EXT_OK = ["pdf", "jpg", "jpeg", "png"];

const MOTIFS_SORTIE = [
  "Achat urgent de produits détachants",
  "Carburant groupe électrogène",
  "Petite maintenance machine",
  "Avance salaire",
  "Autre motif",
];

const MOTIFS_ENTREE = [
  "Apport monnaie du coffre",
  "Remboursement fournisseur",
  "Avance associée",
  "Autre motif",
];

export default function NouveauMouvementPage() {
  const router = useRouter();
  const { updatePath } = useGlobalData();
  const fileRef = useRef<HTMLInputElement>(null);

  const [nature, setNature] = useState<"entree" | "sortie">("sortie");
  const [categorie, setCategorie] = useState("");
  const [montant, setMontant] = useState("350000");
  const [mode, setMode] = useState("Espèces");
  const [beneficiaire, setBeneficiaire] = useState("CleanPro Côte d'Ivoire");
  const [motif, setMotif] = useState(MOTIFS_SORTIE[0]);
  const [reference, setReference] = useState("# BC-2026-0928-18");
  const [commentaire, setCommentaire] = useState(
    "Commande exceptionnelle pour réapprovisionner l'atelier avant le pic de fin de semaine. Livraison prévue demain à 08:00.",
  );
  const [fichier, setFichier] = useState<string | null>(null);
  const [fichierErreur, setFichierErreur] = useState<string | null>(null);

  const montantValue = Number(montant.replace(/[^0-9]/g, "")) || 0;
  const doubleControle = nature === "sortie" && montantValue > SEUIL_DOUBLE_CONTROLE;

  const categories = nature === "sortie" ? CATEGORIES_SORTIE : CATEGORIES_ENTREE;
  const motifs = nature === "sortie" ? MOTIFS_SORTIE : MOTIFS_ENTREE;

  const checks = useMemo(
    () => [
      { ok: categorie !== "", label: "Sélectionnez une catégorie obligatoire." },
      { ok: fichier !== null && fichierErreur === null, label: "Ajoutez une pièce justificative valide." },
      { ok: nature === "entree" || montantValue <= SOLDE_ESPECES, label: "Le solde espèces disponible est suffisant." },
    ],
    [categorie, fichier, fichierErreur, nature, montantValue],
  );
  const bloquants = checks.filter((c) => !c.ok).length;

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!EXT_OK.includes(ext)) {
      setFichier(null);
      setFichierErreur(f.name);
      return;
    }
    setFichierErreur(null);
    setFichier(f.name);
    toast.success("Justificatif ajouté", { description: f.name });
  };

  const handleSave = () => {
    if (categorie === "") {
      toast.error("Catégorie obligatoire", { description: "Sélectionnez une catégorie." });
      return;
    }
    if (fichier === null || fichierErreur !== null) {
      toast.error("Pièce justificative requise", { description: "Ajoutez un fichier PDF, JPG ou PNG." });
      return;
    }
    if (nature === "sortie" && montantValue > SOLDE_ESPECES) {
      toast.error("Solde insuffisant", { description: `Disponible : ${formatFCFA(SOLDE_ESPECES)} FCFA.` });
      return;
    }
    toast.success(doubleControle ? "Soumis au double contrôle" : "Mouvement enregistré", {
      description: `${nature === "sortie" ? "Sortie" : "Entrée"} de ${formatFCFA(montantValue)} FCFA${doubleControle ? " • validation Yann M'Bala requise." : "."}`,
    });
    updatePath("/caisse");
  };

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Retour au journal"
          onClick={() => router.back()}
          className="mt-1 bg-primary text-white hover:bg-primary/90 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl">
            Nouveau mouvement de caisse
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700">
              Brouillon
            </Badge>
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Enregistrez rapidement une entrée ou une sortie indépendante d&apos;un dépôt.
          </p>
        </div>
        <Button variant="outline" size="lg" className="gap-1.5 px-3 text-xs font-bold" onClick={() => router.back()}>
          <ArrowLeft className="size-3.5" />
          Retour au journal
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {/* Nature */}
          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold">Nature du mouvement</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Choisissez une entrée ou une sortie hors dépôt.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setNature("entree");
                  setCategorie("");
                  setMotif(MOTIFS_ENTREE[0]);
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-bold transition-colors",
                  nature === "entree" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                <ArrowDownLeft className="size-4" />
                Entrée de caisse
              </button>
              <button
                type="button"
                onClick={() => {
                  setNature("sortie");
                  setCategorie("");
                  setMotif(MOTIFS_SORTIE[0]);
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-bold transition-colors",
                  nature === "sortie" ? "border-red-300 bg-red-50 text-red-600" : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                <ArrowUpRight className="size-4" />
                Sortie de caisse
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="mv-cat" className="mb-1.5 text-xs font-semibold">
                  Catégorie <span className="text-red-500">*</span>
                </Label>
                <Select value={categorie} onValueChange={(v) => setCategorie(v ?? "")}>
                  <SelectTrigger
                    id="mv-cat"
                    aria-invalid={categorie === ""}
                    className="w-full text-[13px] data-[size=default]:h-9"
                  >
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categorie === "" && <p className="mt-1 text-[11px] font-medium text-red-500">La catégorie est obligatoire.</p>}
              </div>
              <div>
                <Label htmlFor="mv-montant" className="mb-1.5 text-xs font-semibold">
                  Montant (FCFA) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="mv-montant"
                    inputMode="numeric"
                    value={montant}
                    onChange={(e) => setMontant(e.target.value.replace(/[^0-9]/g, ""))}
                    className="h-9 pr-9 text-[13px]"
                  />
                  <span className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">◉</span>
                </div>
              </div>
            </div>
          </section>

          {/* Détails */}
          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold">Détails de l&apos;opération</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Décrivez précisément l&apos;objet de cette sortie.</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="mv-mode" className="mb-1.5 text-xs font-semibold">
                  Mode de paiement <span className="text-red-500">*</span>
                </Label>
                <Select value={mode} onValueChange={(v) => setMode(v ?? "Espèces")}>
                  <SelectTrigger id="mv-mode" className="w-full text-[13px] data-[size=default]:h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Espèces", "Mobile Money", "Carte", "Virement"].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="mv-ben" className="mb-1.5 text-xs font-semibold">
                  Bénéficiaire ou fournisseur <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Building2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="mv-ben" value={beneficiaire} onChange={(e) => setBeneficiaire(e.target.value)} className="h-9 pl-9 text-[13px]" />
                </div>
              </div>
              <div>
                <Label htmlFor="mv-motif" className="mb-1.5 text-xs font-semibold">
                  Motif <span className="text-red-500">*</span>
                </Label>
                <Select value={motif} onValueChange={(v) => setMotif(v ?? motifs[0])}>
                  <SelectTrigger id="mv-motif" className="w-full text-[13px] data-[size=default]:h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {motifs.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="mv-ref" className="mb-1.5 text-xs font-semibold">
                  Référence interne
                </Label>
                <div className="relative">
                  <Hash className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="mv-ref" value={reference} onChange={(e) => setReference(e.target.value)} className="h-9 pl-9 text-[13px]" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="mv-com" className="mb-1.5 text-xs font-semibold">
                  Commentaire
                </Label>
                <Textarea id="mv-com" value={commentaire} onChange={(e) => setCommentaire(e.target.value)} className="min-h-20 text-[13px]" />
              </div>
            </div>
          </section>

          {/* Justificatif */}
          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold">Pièce justificative</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Facture, bon de commande ou reçu • PDF, JPG ou PNG • 10 Mo maximum.</p>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFiles(e.dataTransfer.files);
              }}
              className="mt-3 flex w-full flex-col items-center gap-1 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors hover:bg-muted/50"
            >
              <Upload className="size-5 text-muted-foreground" />
              <p className="text-xs font-bold">Déposer un justificatif ou parcourir</p>
              <p className="text-[11px] text-muted-foreground">Le document sera daté et joint au journal d&apos;audit.</p>
            </button>
            {fichier && !fichierErreur && (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs ring-1 ring-emerald-100">
                <p className="flex min-w-0 items-center gap-1.5 font-semibold text-emerald-800">
                  <Check className="size-4 shrink-0" />
                  <span className="truncate">{fichier}</span>
                </p>
                <Button variant="ghost" size="sm" className="h-auto shrink-0 p-1 text-[11px] font-bold text-emerald-700" onClick={() => setFichier(null)}>
                  Retirer
                </Button>
              </div>
            )}
            {fichierErreur && (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-red-50 p-2.5 text-xs ring-1 ring-red-100">
                <p className="min-w-0">
                  <span className="flex items-center gap-1.5 font-bold text-red-600">
                    <CircleAlert className="size-4 shrink-0" />
                    <span className="truncate">{fichierErreur} n&apos;a pas été ajoutée</span>
                  </span>
                  <span className="mt-0.5 block text-[11px] text-red-600/80">Format non accepté. Ajoutez un fichier PDF, JPG ou PNG.</span>
                </p>
                <Button variant="ghost" size="sm" className="h-auto shrink-0 p-1 text-[11px] font-bold text-red-600" onClick={() => setFichierErreur(null)}>
                  Retirer
                </Button>
              </div>
            )}
          </section>
        </div>

        {/* Latéral */}
        <div className="space-y-4">
          {doubleControle ? (
            <section className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-100">
              <h2 className="flex items-center gap-1.5 text-[13px] font-bold text-amber-800">
                <ShieldCheck className="size-4" />
                Double contrôle requis
              </h2>
              <p className="mt-0.5 text-[11px] font-semibold text-amber-700">Sortie supérieure à 250 000 FCFA</p>
              <p className="mt-1.5 text-[11px] leading-snug text-amber-800">
                Une seconde validation par un manager habilité est obligatoire avant décaissement. Le mouvement restera « En attente » jusque-là.
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 rounded-lg bg-white/70 p-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">AK</span>
                  <div className="min-w-0 flex-1 text-[11px]">
                    <p className="font-bold">Aïcha Koné</p>
                    <p className="text-muted-foreground">Initiatrice • Directrice réseau</p>
                  </div>
                  <Badge className="border-0 bg-emerald-100 text-[10px] font-bold text-emerald-700">Signé</Badge>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/70 p-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-200 text-[10px] font-bold text-amber-800">YM</span>
                  <div className="min-w-0 flex-1 text-[11px]">
                    <p className="font-bold">Yann M&apos;Bala</p>
                    <p className="text-muted-foreground">Contrôleur financier</p>
                  </div>
                  <Badge variant="outline" className="border-amber-200 bg-white text-[10px] font-bold text-amber-700">À notifier</Badge>
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
              <h2 className="flex items-center gap-1.5 text-[13px] font-bold text-emerald-800">
                <Check className="size-4" />
                Contrôle simple
              </h2>
              <p className="mt-1 text-[11px] leading-snug text-emerald-700">
                Montant sous le seuil de 250 000 FCFA — validation unique suffisante.
              </p>
            </section>
          )}

          <section className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Validation avant enregistrement</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{bloquants} point{bloquants > 1 ? "s" : ""} bloquant{bloquants > 1 ? "s" : ""} détecté{bloquants > 1 ? "s" : ""}</p>
            <div className="mt-3 space-y-2">
              {checks.map((c, i) => (
                <p
                  key={i}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg p-2.5 text-[11px] font-medium",
                    c.ok ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-red-50 text-red-600 ring-1 ring-red-100",
                  )}
                >
                  {c.ok ? <Check className="size-4 shrink-0" /> : <CircleAlert className="size-4 shrink-0" />}
                  {c.label}
                </p>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-bold">Traçabilité</h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-[11px] font-semibold text-muted-foreground"
                onClick={() => toast.info("Journal complet", { description: "Chaque étape est horodatée et non modifiable." })}
              >
                Journal complet
              </Button>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Chaque étape est horodatée et non modifiable.</p>
            <div className="mt-3">
              {[
                ["Brouillon créé", "Aïcha Koné • POS-02 • Bingerville", "16:44", true],
                ["Montant sensible détecté", "Règle DC-250 appliquée automatiquement", "16:47", true],
                ["Seconde validation", "Yann M'Bala recevra une demande sécurisée", "À venir", false],
              ].map(([title, sub, heure, done], i, arr) => (
                <div key={i} className="relative flex gap-2.5 pb-3 last:pb-0">
                  {i < arr.length - 1 && <span className="absolute top-4 left-[3px] h-[calc(100%-0.75rem)] w-px bg-border" />}
                  <span className={cn("z-10 mt-1.5 size-1.5 shrink-0 rounded-full", done ? "bg-emerald-500" : "bg-amber-500")} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold">{title}</p>
                    <p className="text-[11px] text-muted-foreground">{sub}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{heure}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-bold">Caisse concernée</h2>
              <Badge variant="outline" className="gap-1 border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Ouverte
              </Badge>
            </div>
            <p className="mt-2 text-[13px] font-extrabold">Bingerville • CAI-BG-0928</p>
            <p className="text-[11px] text-muted-foreground">Solde espèces disponible : {formatFCFA(SOLDE_ESPECES)} FCFA</p>
          </section>
        </div>
      </div>

      {/* Barre d'action */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-primary p-4 text-white">
        <p className="min-w-0 flex-1 text-xs">
          <span className="block text-[13px] font-extrabold">
            {nature === "sortie" ? "Sortie" : "Entrée"} de caisse • {formatFCFA(montantValue)} FCFA
          </span>
          <span className="text-white/70">
            {doubleControle ? "Le mouvement sera soumis au double contrôle puis ajouté au journal." : "Le mouvement sera ajouté au journal après validation."}
          </span>
        </p>
        <Button variant="outline" size="lg" className="border-white/20 bg-white px-4 text-xs font-bold text-foreground" onClick={() => updatePath("/caisse")}>
          Annuler
        </Button>
        <Button
          size="lg"
          className="gap-1.5 bg-secondary px-4 text-xs font-bold text-secondary-foreground hover:bg-secondary/90"
          onClick={handleSave}
        >
          <Save className="size-4" />
          Enregistrer le mouvement
        </Button>
      </div>
    </div>
  );
}
