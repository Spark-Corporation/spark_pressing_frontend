"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Eye,
  Globe,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FieldLabel, Section } from "../_components";

function luminance(hex: string): number {
  const c = hex.replace("#", "");
  const full = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
  const rgb = [0, 2, 4].map((i) => {
    const v = parseInt(full.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrast(a: string, b: string): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

const DEFAULTS = {
  nom: "SPARK PRESSING",
  monogramme: "ÉP",
  primaire: "#24483F",
  secondaire: "#C8A54B",
  domaine: "www.sparkpressing.ci",
  telephone: "+225 27 22 18 18 90",
  email: "contact@sparkpressing.ci",
  adresse: "Boulevard Latrille, Cocody, Abidjan",
  mentions: "SPARK PRESSING SARL • RCCM CI-ABJ-2024-B-01842 • Capital 10 000 000 FCFA",
  pied: "Merci pour votre confiance.",
  conditions: "Retrait sous 30 jours maximum.",
  document: "ticket",
};

export default function BrandingPage() {
  const router = useRouter();
  const [base, setBase] = useState(DEFAULTS);
  const [form, setForm] = useState(DEFAULTS);
  const dirty = JSON.stringify(base) !== JSON.stringify(form);
  const set = (k: keyof typeof DEFAULTS, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const ratio = useMemo(() => contrast(form.primaire, "#ffffff"), [form.primaire]);
  const aa = ratio >= 4.5;

  const handlePublish = () => {
    setBase(form);
    toast.success("Branding publié", { description: "4 agences mises à jour • version archivée." });
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
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Branding du pressing</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Personnalisez l&apos;identité visible sur tous les points de contact.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => {
              setForm(DEFAULTS);
              toast.info("Valeurs restaurées", { description: "Identité SPARK PRESSING par défaut." });
            }}
          >
            <RotateCcw className="size-3.5" />
            Restaurer par défaut
          </Button>
          <Button size="lg" className="gap-1.5 px-4 text-xs font-bold" onClick={handlePublish}>
            <Eye className="size-4" />
            Publier les changements
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs ring-1 ring-emerald-100">
        <Eye className="size-4 shrink-0 text-emerald-600" />
        <p className="min-w-0 flex-1 font-medium text-emerald-800">
          Aperçu en direct actif — vos changements restent en brouillon jusqu&apos;à publication.
        </p>
        <span className="text-[11px] text-emerald-700">{dirty ? "Brouillon modifié" : "Brouillon enregistré à 16:28"}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Section title="Identité de marque" sub="Nom et symboles principaux.">
            <FieldLabel>Nom du pressing</FieldLabel>
            <Input value={form.nom} onChange={(e) => set("nom", e.target.value)} className="h-9 text-[13px] font-bold" />
            <p className="mt-1 text-[11px] text-muted-foreground">Affiché dans la sidebar, les tickets et les e-mails.</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel>Logo principal</FieldLabel>
                <div className="flex items-center gap-2 rounded-lg border border-border p-2">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-extrabold text-secondary">
                    {form.monogramme.slice(0, 2).toUpperCase() || "ÉP"}
                  </span>
                  <div className="min-w-0 flex-1 text-[11px]">
                    <p className="font-bold">logo-spark.svg</p>
                    <p className="text-muted-foreground">SVG • 24 ko • fond transparent</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 shrink-0 text-[11px] font-bold" onClick={() => toast.info("Logo", { description: "Déposez un SVG sur fond transparent." })}>
                    Remplacer
                  </Button>
                </div>
              </div>
              <div>
                <FieldLabel>Monogramme</FieldLabel>
                <Input value={form.monogramme} onChange={(e) => set("monogramme", e.target.value.slice(0, 2))} className="h-9 text-[13px] font-bold" />
                <p className="mt-1 text-[11px] text-muted-foreground">2 caractères maximum</p>
              </div>
              <div>
                <FieldLabel>Couleur primaire</FieldLabel>
                <div className="flex gap-2">
                  <Input type="color" value={form.primaire} onChange={(e) => set("primaire", e.target.value)} className="h-9 w-12 shrink-0 cursor-pointer p-1" aria-label="Couleur primaire" />
                  <Input value={form.primaire} onChange={(e) => set("primaire", e.target.value)} className="h-9 font-mono text-[13px]" />
                </div>
              </div>
              <div>
                <FieldLabel>Couleur secondaire</FieldLabel>
                <div className="flex gap-2">
                  <Input type="color" value={form.secondaire} onChange={(e) => set("secondaire", e.target.value)} className="h-9 w-12 shrink-0 cursor-pointer p-1" aria-label="Couleur secondaire" />
                  <Input value={form.secondaire} onChange={(e) => set("secondaire", e.target.value)} className="h-9 font-mono text-[13px]" />
                </div>
              </div>
            </div>
            <p className={cn("mt-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold", aa ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600")}>
              <Check className="size-3.5" />
              {aa ? "AA validé" : "Contraste insuffisant"} — Contraste texte/fond • {ratio.toFixed(1)}:1 • actions : 4,7:1
            </p>
          </Section>

          <Section title="Présence numérique et contacts">
            <FieldLabel>Domaine public</FieldLabel>
            <div className="relative">
              <Globe className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={form.domaine} onChange={(e) => set("domaine", e.target.value)} className="h-9 pl-9 text-[13px]" />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">DNS vérifié • certificat SSL actif</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel>Téléphone</FieldLabel>
                <div className="relative">
                  <Phone className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={form.telephone} onChange={(e) => set("telephone", e.target.value)} className="h-9 pl-9 text-[13px]" />
                </div>
              </div>
              <div>
                <FieldLabel>E-mail</FieldLabel>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={form.email} onChange={(e) => set("email", e.target.value)} className="h-9 pl-9 text-[13px]" />
                </div>
              </div>
            </div>
            <div className="mt-3">
              <FieldLabel>Adresse du siège</FieldLabel>
              <div className="relative">
                <MapPin className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={form.adresse} onChange={(e) => set("adresse", e.target.value)} className="h-9 pl-9 text-[13px]" />
              </div>
            </div>
            <div className="mt-3">
              <FieldLabel>Mentions légales courtes</FieldLabel>
              <Textarea value={form.mentions} onChange={(e) => set("mentions", e.target.value)} className="min-h-16 text-[13px]" />
            </div>
          </Section>

          <Section title="Documents commerciaux" sub="Choisissez les modèles appliqués par défaut.">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(
                [
                  ["ticket", "Ticket thermique", "80 mm • compact", "Par défaut"],
                  ["facture", "Facture A4", "Portrait • détaillée", "Disponible"],
                ] as const
              ).map(([v, title, sub, badge]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set("document", v)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-colors",
                    form.document === v ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                  )}
                >
                  <p className="flex items-center justify-between text-xs font-bold">
                    {title}
                    <Badge variant="outline" className={cn("border-0 text-[10px] font-bold", form.document === v ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>
                      {badge}
                    </Badge>
                  </p>
                  <p className="text-[11px] text-muted-foreground">{sub}</p>
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel>Pied de ticket</FieldLabel>
                <Input value={form.pied} onChange={(e) => set("pied", e.target.value)} className="h-9 text-[13px]" />
              </div>
              <div>
                <FieldLabel>Conditions</FieldLabel>
                <Input value={form.conditions} onChange={(e) => set("conditions", e.target.value)} className="h-9 text-[13px]" />
              </div>
            </div>
          </Section>
        </div>

        <div className="space-y-4">
          <Section
            title="Aperçu en direct"
            sub="Desktop, mobile et documents"
            right={
              <Badge variant="outline" className="gap-1 border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Temps réel
              </Badge>
            }
          >
            <div className="flex gap-2">
              <div className="flex w-16 shrink-0 flex-col gap-1 rounded-lg p-1.5 text-white" style={{ backgroundColor: form.primaire }}>
                <p className="text-[8px] font-extrabold" style={{ color: form.secondaire }}>
                  {form.monogramme.slice(0, 2).toUpperCase() || "ÉP"} <span className="text-white">SPARK</span>
                </p>
                {["Accueil", "Dépôts", "Clients", "Paramètres"].map((l) => (
                  <span key={l} className="rounded bg-white/10 px-1 py-0.5 text-[7px] text-white/80">
                    {l}
                  </span>
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold">Tableau de bord</p>
                <div className="mt-1 grid grid-cols-3 gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-8 rounded bg-muted" />
                  ))}
                </div>
                <div className="mt-1 h-14 rounded bg-muted" />
              </div>
            </div>
            <div className="mt-2 rounded-lg border border-border p-2.5 text-[10px]">
              <p className="font-extrabold" style={{ color: form.primaire }}>
                {form.nom || "SPARK PRESSING"}
              </p>
              <p className="text-muted-foreground">Ticket OP-2026-2844</p>
              <p className="mt-1 flex justify-between font-bold">
                <span>TOTAL 12 300 FCFA</span>
                <span style={{ color: form.secondaire }}>Mes dépôts</span>
              </p>
              <p className="text-muted-foreground">{form.pied}</p>
            </div>
          </Section>

          <Section title="Avant publication" sub="Les changements toucheront 4 agences.">
            <div className="space-y-1.5 text-xs">
              {["Navigation staff et portail client", "Tickets thermiques et factures", "E-mails et SMS transactionnels", "Domaine public et pages légales"].map((t) => (
                <p key={t} className="flex items-center gap-1.5">
                  <Check className="size-3.5 shrink-0 text-emerald-600" />
                  {t}
                </p>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              La publication crée automatiquement une version restaurable de l&apos;identité actuelle.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
