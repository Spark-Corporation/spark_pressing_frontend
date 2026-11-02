"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CircleAlert,
  History,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES_ARTICLES, formatFCFA, type Article } from "../data";

const AGENCES_DISPO = [
  { name: "Cocody Angré", note: "Catalogue principal" },
  { name: "Plateau Centre", note: "Prix local +5%" },
  { name: "Marcory Zone 4", note: "Catalogue principal" },
  { name: "Bingerville", note: "Ouverture prochaine" },
];

const ETATS = ["Taches importantes", "Déchirure légère", "Bouton manquant"];
const RENDUS = ["Sur cintre", "Plié premium", "Sous housse"];
const SERVICES = ["Collecte", "Livraison", "Traitement anti-odeur"];

interface Grille {
  tranche: string;
  t1: string;
  t2: string;
}

const num = (s: string) => Number(s.replace(/[^0-9]/g, "")) || 0;

export default function ArticleEditView({ article }: { article: Article | null }) {
  const router = useRouter();
  const { updatePath } = useGlobalData();
  const isNew = article === null;

  const [nom, setNom] = useState(article?.nom ?? "");
  const [categorie, setCategorie] = useState(article?.categorie ?? "Hauts");
  const [code, setCode] = useState(article?.code ?? "");
  const [mode, setMode] = useState<"Pièce" | "Kilo" | "Mixte">(article?.mode ?? "Pièce");
  const [classique, setClassique] = useState(article ? String(article.classique) : "");
  const [express, setExpress] = useState(article?.express ? String(article.express) : "");
  const [repassage, setRepassage] = useState(article ? String(article.repassage) : "");
  const [optRemise, setOptRemise] = useState(true);
  const [optArrondi, setOptArrondi] = useState(true);
  const [optModifiable, setOptModifiable] = useState(false);
  const [grilles, setGrilles] = useState<Grille[]>([
    { tranche: "0 – 3 kg", t1: "2 800 / kg", t2: "4 100 / kg" },
    { tranche: "3,01 – 8 kg", t1: "2 500 / kg", t2: "3 700 / kg" },
    { tranche: "8,01 kg et +", t1: "2 200 / kg", t2: "3 300 / kg" },
  ]);
  const [delaiClassique, setDelaiClassique] = useState("72 heures");
  const [delaiExpress, setDelaiExpress] = useState("24 heures");
  const [priorite, setPriorite] = useState("Standard");
  const [etats, setEtats] = useState<string[]>(ETATS);
  const [rendus, setRendus] = useState<string[]>(RENDUS);
  const [services, setServices] = useState<string[]>(SERVICES);
  const [dispo, setDispo] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(AGENCES_DISPO.map((a) => [a.name, isNew ? true : a.name !== "Bingerville"])),
  );

  const initial = useMemo(
    () =>
      JSON.stringify({
        nom: article?.nom ?? "",
        categorie: article?.categorie ?? "Hauts",
        code: article?.code ?? "",
        mode: article?.mode ?? "Pièce",
      }),
    [article],
  );
  const dirty =
    initial !== JSON.stringify({ nom, categorie, code, mode }) ||
    classique !== (article ? String(article.classique) : "") ||
    express !== (article?.express ? String(article.express) : "") ||
    repassage !== (article ? String(article.repassage) : "");

  const classiqueN = num(classique);
  const expressN = num(express);
  const repassageN = num(repassage);

  const checks = [
    { ok: nom.trim() !== "" && code.trim() !== "", label: "Informations obligatoires" },
    { ok: classiqueN > 0 && repassageN > 0 && (expressN === 0 || expressN > classiqueN), label: "Tarifs cohérents" },
    { ok: etats.length > 0 && rendus.length > 0, label: "Détails renseignés" },
    { ok: Object.values(dispo).some(Boolean), label: "Une agence active" },
  ];
  const reco = expressN > 0 && classiqueN > 0 && expressN > classiqueN * 1.4;

  const toggleList = (list: string[], v: string, set: (l: string[]) => void) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const handlePublish = () => {
    const missing = checks.filter((c) => !c.ok);
    if (missing.length > 0) {
      toast.error("Publication impossible", { description: missing.map((m) => m.label).join(" • ") });
      return;
    }
    toast.success(isNew ? "Article publié" : "Article mis à jour", {
      description: `${nom} (${code}) • ${Object.values(dispo).filter(Boolean).length} agences.`,
    });
    updatePath("/articles");
  };

  const delaiCourt = delaiClassique.replace(" heures", " h").replace(" heure", " h");

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Retour au catalogue"
          onClick={() => router.back()}
          className="mt-1 bg-primary text-white hover:bg-primary/90 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
            {isNew ? "Création d'article" : "Création et édition d'article"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Définissez les règles de facturation, de traitement et de disponibilité de cet article.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="lg" className="px-4 text-xs font-bold" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button size="lg" className="gap-1.5 px-4 text-xs font-bold" onClick={handlePublish}>
            <Check className="size-4" />
            Publier
          </Button>
        </div>
      </div>

      {dirty && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-xs ring-1 ring-amber-100">
          <CircleAlert className="size-4 shrink-0 text-amber-600" />
          <p className="font-bold text-amber-800">
            Modifications non enregistrées
            <span className="block font-normal text-amber-700">Vos changements concernent 2 agences. Enregistrez-les avant de quitter.</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {/* Infos générales */}
          <section className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Informations générales</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Les paramètres s&apos;appliquent à vos 2 agences.</p>
              </div>
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700">
                Requis
              </Badge>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <Label htmlFor="ar-nom" className="mb-1.5 text-xs font-semibold">
                  Nom
                </Label>
                <Input id="ar-nom" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex. Costume 2 pièces" aria-invalid={nom.trim() === ""} className="h-9 text-[13px]" />
              </div>
              <div>
                <Label htmlFor="ar-cat" className="mb-1.5 text-xs font-semibold">
                  Catégorie
                </Label>
                <Select value={categorie} onValueChange={(v) => setCategorie(v ?? "Hauts")}>
                  <SelectTrigger id="ar-cat" className="w-full text-[13px] data-[size=default]:h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES_ARTICLES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ar-code" className="mb-1.5 text-xs font-semibold">
                  Code
                </Label>
                <Input id="ar-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="COS-002" aria-invalid={code.trim() === ""} className="h-9 text-[13px]" />
              </div>
            </div>
            <Label className="mt-3 mb-1.5 text-xs font-semibold">Mode de facturation</Label>
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as "Pièce" | "Kilo" | "Mixte")} className="flex flex-wrap gap-2">
              {(["Pièce", "Kilo", "Mixte"] as const).map((m) => (
                <Label
                  key={m}
                  htmlFor={`ar-mode-${m}`}
                  className={cn(
                    "inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors",
                    mode === m ? "border-primary bg-primary/5" : "border-border text-muted-foreground",
                  )}
                >
                  <RadioGroupItem id={`ar-mode-${m}`} value={m} />
                  {m}
                </Label>
              ))}
            </RadioGroup>
          </section>

          {/* Tarification */}
          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold">Tarification à la pièce</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Tarifs TTC par niveau de service.</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(
                [
                  ["Classique • 72 h", classique, setClassique, false],
                  ["Express • 24 h", express, setExpress, true],
                  ["Repassage • 12 h", repassage, setRepassage, false],
                ] as [string, string, (v: string) => void, boolean][]
              ).map(([label, value, set, hl]) => (
                <div key={label}>
                  <Label className="mb-1.5 text-xs font-semibold">{label}</Label>
                  <div className="relative">
                    <Input
                      inputMode="numeric"
                      value={value}
                      onChange={(e) => set(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="0"
                      className={cn("h-9 pr-12 text-[13px] font-bold", hl && "border-amber-300 bg-amber-50")}
                    />
                    <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">FCFA</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {[
                ["Autoriser une remise", optRemise, setOptRemise],
                ["Arrondi à 100 FCFA", optArrondi, setOptArrondi],
                ["Prix modifiable", optModifiable, setOptModifiable],
              ].map(([label, v, set]) => (
                <Label key={label as string} htmlFor={`ar-opt-${label}`} className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                  <Checkbox id={`ar-opt-${label}`} checked={v as boolean} onCheckedChange={(c) => (set as (b: boolean) => void)(c === true)} />
                  {label as string}
                </Label>
              ))}
            </div>
          </section>

          {/* Grilles kilo */}
          {mode !== "Pièce" && (
            <section className="rounded-xl border border-border bg-white p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold">Grilles au kilo</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">Tranches progressives du mode Mixte.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-[11px] font-bold"
                  onClick={() => setGrilles((g) => [...g, { tranche: "Nouvelle tranche", t1: "0 / kg", t2: "0 / kg" }])}
                >
                  <Plus className="size-3.5" />
                  Ajouter
                </Button>
              </div>
              <div className="mt-3 space-y-2">
                {grilles.map((gr, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2">
                    <Input value={gr.tranche} onChange={(e) => setGrilles((g) => g.map((x, j) => (j === i ? { ...x, tranche: e.target.value } : x)))} className="h-8 text-xs" aria-label="Tranche de poids" />
                    <Input value={gr.t1} onChange={(e) => setGrilles((g) => g.map((x, j) => (j === i ? { ...x, t1: e.target.value } : x)))} className="h-8 text-xs" aria-label="Tarif 1" />
                    <Input value={gr.t2} onChange={(e) => setGrilles((g) => g.map((x, j) => (j === i ? { ...x, t2: e.target.value } : x)))} className="h-8 text-xs" aria-label="Tarif 2" />
                    <Button variant="ghost" size="icon-sm" aria-label="Supprimer la tranche" onClick={() => setGrilles((g) => g.filter((_, j) => j !== i))}>
                      <Trash2 className="size-3.5 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Traitement */}
          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold">Traitement et compatibilités</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Contraintes de production.</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label htmlFor="ar-dc" className="mb-1.5 text-xs font-semibold">
                  Délai classique
                </Label>
                <Input id="ar-dc" value={delaiClassique} onChange={(e) => setDelaiClassique(e.target.value)} className="h-9 text-[13px]" />
              </div>
              <div>
                <Label htmlFor="ar-de" className="mb-1.5 text-xs font-semibold">
                  Délai express
                </Label>
                <Input id="ar-de" value={delaiExpress} onChange={(e) => setDelaiExpress(e.target.value)} className="h-9 text-[13px]" />
              </div>
              <div>
                <Label htmlFor="ar-prio" className="mb-1.5 text-xs font-semibold">
                  Priorité
                </Label>
                <Select value={priorite} onValueChange={(v) => setPriorite(v ?? "Standard")}>
                  <SelectTrigger id="ar-prio" className="w-full text-[13px] data-[size=default]:h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Standard", "Prioritaire", "Express"].map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(
                [
                  ["États acceptés", ETATS, etats, setEtats],
                  ["Rendus compatibles", RENDUS, rendus, setRendus],
                  ["Services associés", SERVICES, services, setServices],
                ] as const
              ).map(([title, list, values, set]) => (
                <div key={title}>
                  <p className="mb-1.5 text-xs font-semibold">{title}</p>
                  <div className="space-y-1.5">
                    {list.map((item) => (
                      <Label key={item} htmlFor={`ar-${title}-${item}`} className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                        <Checkbox
                          id={`ar-${title}-${item}`}
                          checked={values.includes(item)}
                          onCheckedChange={() => toggleList(values, item, set as (l: string[]) => void)}
                        />
                        {item}
                      </Label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Dispo */}
          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold">Disponibilité par agence</h2>
            <div className="mt-3 divide-y divide-border">
              {AGENCES_DISPO.map((a) => (
                <div key={a.name} className="flex items-center justify-between gap-2 py-2.5">
                  <div>
                    <p className="text-[13px] font-bold">{a.name}</p>
                    <p className="text-[11px] text-muted-foreground">{a.note}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "gap-1 border-0 text-[10px] font-bold",
                        dispo[a.name] ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <span className={cn("size-1.5 rounded-full", dispo[a.name] ? "bg-emerald-500" : "bg-muted-foreground/50")} />
                      {dispo[a.name] ? "Disponible" : "Indisponible"}
                    </Badge>
                    <Switch
                      checked={!!dispo[a.name]}
                      onCheckedChange={(v) => setDispo((d) => ({ ...d, [a.name]: v }))}
                      aria-label={`Disponible à ${a.name}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Latéral */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl bg-primary p-4 text-white">
            <Badge className="border-0 bg-secondary/20 text-[10px] font-bold tracking-wide text-secondary">
              {categorie} • {mode}
            </Badge>
            <p className="mt-2 text-lg font-extrabold">{nom || "Nouvel article"}</p>
            <p className="text-[11px] text-white/60">{code || "—"} • Délai {delaiCourt}</p>
            <div className="mt-3 space-y-1 text-xs">
              <p className="flex justify-between"><span className="text-white/70">Classique</span><span className="font-bold">{formatFCFA(classiqueN)} FCFA</span></p>
              <p className="flex justify-between"><span className="text-secondary">Express</span><span className="font-bold text-secondary">{formatFCFA(expressN)} FCFA</span></p>
              <p className="flex justify-between"><span className="text-white/70">Repassage</span><span className="font-bold">{formatFCFA(repassageN)} FCFA</span></p>
            </div>
            <p className="mt-3 text-[10px] leading-snug text-white/50">Prix hors fin de polissage, tissus et options.</p>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Contrôle avant publication</h2>
            <div className="mt-3 space-y-2">
              {checks.map((c, i) => (
                <p key={i} className="flex items-center gap-2 text-xs">
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border",
                      c.ok ? "border-emerald-500 bg-emerald-500 text-white" : "border-border text-transparent",
                    )}
                  >
                    <Check className="size-3" />
                  </span>
                  <span className={c.ok ? "" : "text-muted-foreground"}>{c.label}</span>
                </p>
              ))}
            </div>
            {reco && (
              <p className="mt-3 rounded-lg bg-amber-50 p-2.5 text-[11px] leading-snug text-amber-800 ring-1 ring-amber-100">
                <span className="font-bold">Recommandation</span>
                <br />
                Le tarif Express est supérieur de 46%. Vérifiez le catalogue partagé.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Dernière modification</h2>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {isNew ? "Nouvel article — non publié." : "Nadia Assi • 18 septembre 2026 à 16:24"}
            </p>
            {!isNew && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 gap-1 text-[11px] font-bold"
                onClick={() => toast.info("Historique", { description: `Modifications de ${code}.` })}
              >
                <History className="size-3.5" />
                Voir l&apos;historique
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
