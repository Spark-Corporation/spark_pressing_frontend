"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Check, CircleAlert, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useGlobalData } from "@/contexts/GlobalContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { handleApiAction } from "@/functions/handleResponseApi";
import CategoryCreateModal from "@/components/article-category/CategoryCreateModal";
import {
  createArticleAction,
  getArticleCategoriesAction,
  getArticleOptionsAction,
  getNetworkOverviewAction,
} from "@/actions/AdminAction";
import type {
  ApiArticleCategory,
  ArticleAvailabilityPayload,
  ArticleCreatePayload,
  ArticleKiloTierPayload,
  ArticleOptionsCatalog,
} from "@/lib/types";
import type { NetworkOverviewData } from "../../multi-agences/types";
import { formatFCFA } from "../data";

interface AgenceOption {
  id: number;
  name: string;
}

interface DispoEtat {
  available: boolean;
  adjust: string;
  note: string;
}

interface GrilleKilo {
  minKg: string;
  maxKg: string;
  classic: string;
  express: string;
}

const PRIORITES_RECHANGE = [{ code: "standard", label: "Standard" }];

/** Montant entier saisi (les champs tarifaires sont limités aux chiffres). */
const num = (s: string) => Number(s) || 0;

/** Prix en centimes de saisie → number | null (null si vide ou nul). */
const priceOrNull = (s: string): number | null => {
  const n = num(s);
  return n > 0 ? n : null;
};

/** Poids décimal saisi (virgule acceptée). */
const poids = (s: string) => {
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

/** Liste libre saisie en texte (« a, b, c ») → chaînes propres. */
const libreToList = (s: string) =>
  s
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const grilleComplete = (g: GrilleKilo) =>
  poids(g.maxKg) > 0 && poids(g.maxKg) > poids(g.minKg) && num(g.classic) > 0 && num(g.express) > 0;

export default function NouvelArticlePage() {
  const router = useRouter();
  const { updatePath } = useGlobalData();
  const { logout } = useAuth();

  // Données réelles chargées depuis l'API
  const [categories, setCategories] = useState<ApiArticleCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [agences, setAgences] = useState<AgenceOption[]>([]);
  const [agencesLoading, setAgencesLoading] = useState(true);
  const [agencesError, setAgencesError] = useState<string | null>(null);
  const [options, setOptions] = useState<ArticleOptionsCatalog | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(true);

  // Informations générales
  const [nom, setNom] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [icone, setIcone] = useState("");
  const [actif, setActif] = useState(true);
  const [categoryId, setCategoryId] = useState("");
  const [mode, setMode] = useState<"Pièce" | "Kilo" | "Mixte">("Pièce");

  // Tarification
  const [classique, setClassique] = useState("");
  const [express, setExpress] = useState("");
  const [repassage, setRepassage] = useState("");
  const [classiqueKilo, setClassiqueKilo] = useState("");
  const [expressKilo, setExpressKilo] = useState("");
  const [repassageKilo, setRepassageKilo] = useState("");
  const [optRemise, setOptRemise] = useState(true);
  const [optArrondi, setOptArrondi] = useState(false);
  const [optModifiable, setOptModifiable] = useState(false);
  const [grilles, setGrilles] = useState<GrilleKilo[]>([
    { minKg: "0", maxKg: "3", classic: "", express: "" },
  ]);

  // Traitement
  const [heuresClassique, setHeuresClassique] = useState("72");
  const [heuresExpress, setHeuresExpress] = useState("24");
  const [heuresRepass, setHeuresRepass] = useState("48");
  const [priorite, setPriorite] = useState("standard");
  const [defauts, setDefauts] = useState<string[]>([]);
  const [defautsLibre, setDefautsLibre] = useState("");
  const [rendusIds, setRendusIds] = useState<number[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [servicesLibre, setServicesLibre] = useState("");

  // Disponibilité par agence
  const [dispo, setDispo] = useState<Record<number, DispoEtat>>({});

  const [saving, setSaving] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  /** Catégorie créée via la modale : ajoutée au select et présélectionnée. */
  const handleCategoryCreated = (category: ApiArticleCategory) => {
    setCategories((prev) =>
      [...prev, category].sort(
        (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "fr"),
      ),
    );
    setCategoryId(String(category.id));
  };

  const priorites = options?.priorities?.length ? options.priorities : PRIORITES_RECHANGE;
  const defautsOptions = options?.defects ?? [];
  const rendusOptions = options?.renders ?? [];
  const servicesOptions = options?.services ?? [];

  const fetchCategories = () =>
    handleApiAction({
      action: getArticleCategoriesAction,
      logout,
      onSuccess: (res) => {
        // Ordre d'affichage : sort_order de l'API, puis ordre alphabétique.
        const sorted = [...res.data].sort(
          (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "fr"),
        );
        setCategories(sorted);
        setCategoriesLoading(false);
      },
      onError: (e) => {
        setCategoriesError(e);
        setCategoriesLoading(false);
      },
    });

  const retryCategories = () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    void fetchCategories();
  };

  const fetchAgences = () =>
    handleApiAction({
      action: getNetworkOverviewAction,
      logout,
      onSuccess: (res) => {
        const data = res as NetworkOverviewData;
        const list = (data.agencies ?? []).map((a) => ({ id: a.agency_id, name: a.name }));
        setAgences(list);
        setDispo(Object.fromEntries(list.map((a) => [a.id, { available: true, adjust: "", note: "" }])));
        setAgencesLoading(false);
      },
      onError: (e) => {
        setAgencesError(e);
        setAgencesLoading(false);
      },
    });

  const retryAgences = () => {
    setAgencesLoading(true);
    setAgencesError(null);
    void fetchAgences();
  };

  const fetchOptions = () =>
    handleApiAction({
      action: getArticleOptionsAction,
      logout,
      onSuccess: (res) => {
        const catalog = res as ArticleOptionsCatalog;
        setOptions(catalog);
        if (catalog?.priorities?.length && !catalog.priorities.some((p) => p.code === priorite)) {
          setPriorite(catalog.priorities[0].code);
        }
        setOptionsLoading(false);
      },
      onError: () => {
        // Catalogue indisponible : champs libres et listes vides (dégradation prévue).
        setOptions(null);
        setOptionsLoading(false);
      },
    });

  // Chargement des catégories, agences et options au montage
  useEffect(() => {
    void fetchCategories();
    void fetchAgences();
    void fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const classiqueN = num(classique);
  const expressN = num(express);
  const repassageN = num(repassage);
  const classiqueKiloN = num(classiqueKilo);
  const heuresClassiqueN = num(heuresClassique);
  const heuresExpressN = num(heuresExpress);
  const heuresRepassN = num(heuresRepass);

  const nbAgencesActives = agences.filter((a) => dispo[a.id]?.available).length;

  const checks = [
    {
      ok: nom.trim() !== "" && code.trim() !== "",
      label: "Informations obligatoires",
    },
    {
      ok:
        (mode !== "Kilo" ? classiqueN > 0 && (expressN === 0 || expressN >= classiqueN) : true) &&
        (mode !== "Pièce" ? classiqueKiloN > 0 : true),
      label: "Tarifs cohérents",
    },
    {
      ok: mode === "Pièce" || grilles.every(grilleComplete),
      label: "Grilles kilo valides",
    },
    {
      ok: nbAgencesActives > 0,
      label: "Une agence active",
    },
  ];

  const toggleList = <T,>(list: T[], v: T, set: (l: T[]) => void) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const handlePublish = async () => {
    const missing = checks.filter((c) => !c.ok);
    if (missing.length > 0) {
      toast.error("Publication impossible", { description: missing.map((m) => m.label).join(" • ") });
      return;
    }

    const billingMode: ArticleCreatePayload["billing_mode"] =
      mode === "Pièce" ? "piece" : mode === "Kilo" ? "kilo" : "mixed";

    const kiloTiers: ArticleKiloTierPayload[] = grilles
      .filter(grilleComplete)
      .map((g) => ({
        min_kg: poids(g.minKg),
        max_kg: poids(g.maxKg),
        classic: num(g.classic),
        express: num(g.express),
      }));

    const availability: ArticleAvailabilityPayload[] = agences.map((a) => {
      const etat = dispo[a.id] ?? { available: false, adjust: "", note: "" };
      const adjustN = num(etat.adjust);
      return {
        agency_id: a.id,
        available: etat.available,
        ...(etat.available && adjustN !== 0 ? { price_adjust_percent: adjustN } : {}),
        ...(etat.note.trim() ? { note: etat.note.trim() } : {}),
      };
    });

    const payload: ArticleCreatePayload = {
      name: nom.trim(),
      ...(description.trim() ? { description: description.trim() } : {}),
      classic_price: priceOrNull(classique),
      express_price: priceOrNull(express),
      repass_price: priceOrNull(repassage),
      classic_price_kilo: priceOrNull(classiqueKilo),
      express_price_kilo: priceOrNull(expressKilo),
      repass_price_kilo: priceOrNull(repassageKilo),
      status: actif,
      code: code.trim().toUpperCase(),
      category_id: categoryId ? Number(categoryId) : null,
      billing_mode: billingMode,
      ...(icone.trim() ? { icon: icone.trim() } : {}),
      allow_discount: optRemise,
      ...(optArrondi ? { round_to: 100 } : {}),
      price_editable: optModifiable,
      ...(heuresClassiqueN > 0 ? { classic_hours: heuresClassiqueN } : {}),
      ...(heuresExpressN > 0 ? { express_hours: heuresExpressN } : {}),
      ...(heuresRepassN > 0 ? { repass_hours: heuresRepassN } : {}),
      ...(priorite.trim() ? { priority: priorite.trim() } : {}),
      accepted_defects: options ? defauts : libreToList(defautsLibre),
      compatible_renders: rendusIds,
      services: options ? services : libreToList(servicesLibre),
      ...(billingMode !== "piece" && kiloTiers.length > 0 ? { kilo_tiers: kiloTiers } : {}),
      ...(availability.length > 0 ? { availability } : {}),
    };

    setSaving(true);
    try {
      await handleApiAction({
        action: createArticleAction,
        params: payload,
        logout,
        onSuccess: (data) => {
          toast.success(`Article « ${data.name} » créé`, {
            description: `Code ${data.code} • ${nbAgencesActives} agence${nbAgencesActives > 1 ? "s" : ""}.`,
          });
          updatePath("/articles");
        },
      });
    } finally {
      setSaving(false);
    }
  };

  const delaiResume = `${heuresClassiqueN || 72} h`;

  const prixKiloAffiche =
    mode === "Pièce" ? null : classiqueKiloN > 0 ? classiqueKiloN : null;

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
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Nouvel article</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Définissez les règles de facturation, de traitement et de disponibilité de cet article.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="lg" className="px-4 text-xs font-bold" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button size="lg" className="gap-1.5 px-4 text-xs font-bold" onClick={handlePublish} disabled={saving}>
            <Check className="size-4" />
            {saving ? "Publication…" : "Publier"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {/* Infos générales */}
          <section className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Informations générales</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Ces informations identifient l&apos;article dans le catalogue.
                </p>
              </div>
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700">
                Requis
              </Badge>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label htmlFor="ar-nom" className="mb-1.5 text-xs font-semibold">
                  Nom
                </Label>
                <Input id="ar-nom" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex. Costume 2 pièces" aria-invalid={nom.trim() === ""} className="h-9 text-[13px]" />
              </div>
              <div>
                <Label htmlFor="ar-cat" className="mb-1.5 text-xs font-semibold">
                  Catégorie <span className="font-normal text-muted-foreground">(facultative)</span>
                </Label>
                <div className="flex items-center gap-1.5">
                  <Select
                    value={categoryId || "__aucune__"}
                    onValueChange={(v) => setCategoryId(v === "__aucune__" ? "" : v ?? "")}
                  >
                    <SelectTrigger id="ar-cat" className="w-full text-[13px] data-[size=default]:h-9">
                      <SelectValue placeholder={categoriesLoading ? "Chargement…" : "Aucune catégorie"}>
                        {(value) =>
                          value === "__aucune__"
                            ? "Aucune catégorie"
                            : categories.find((category) => String(category.id) === value)?.name ?? ""
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__aucune__">Aucune catégorie</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                      {!categoriesLoading && !categoriesError && categories.length === 0 && (
                        <SelectItem value="__vide__" disabled>
                          Aucune catégorie disponible
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="size-9 shrink-0"
                    aria-label="Créer une nouvelle catégorie"
                    title="Créer une nouvelle catégorie"
                    onClick={() => setCategoryModalOpen(true)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                {categoriesError && (
                  <p className="mt-1 flex items-center justify-between gap-2 text-[11px] text-red-600">
                    <span className="truncate">Catégories indisponibles</span>
                    <button type="button" onClick={retryCategories} className="shrink-0 font-bold underline">
                      Réessayer
                    </button>
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="ar-code" className="mb-1.5 text-xs font-semibold">
                  Code
                </Label>
                <Input id="ar-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="COS-002" aria-invalid={code.trim() === ""} className="h-9 text-[13px]" />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="ar-desc" className="mb-1.5 text-xs font-semibold">
                  Description
                </Label>
                <Textarea id="ar-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Détaillez la prestation (optionnel)" className="min-h-16 text-[13px]" />
              </div>
              <div>
                <Label htmlFor="ar-icone" className="mb-1.5 text-xs font-semibold">
                  Icône
                </Label>
                <Input id="ar-icone" value={icone} onChange={(e) => setIcone(e.target.value)} placeholder="Ex. shirt (optionnel)" className="h-9 text-[13px]" />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <Label htmlFor="ar-actif" className="flex cursor-pointer items-center gap-2 text-xs font-semibold">
                <Switch id="ar-actif" checked={actif} onCheckedChange={(v) => setActif(v)} />
                Article actif dès publication
              </Label>
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

          {/* Tarification à la pièce */}
          {mode !== "Kilo" && (
            <section className="rounded-xl border border-border bg-white p-5">
              <h2 className="text-sm font-bold">Tarification à la pièce</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Tarifs TTC par niveau de service.</p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(
                  [
                    ["Classique", classique, setClassique, false],
                    ["Express", express, setExpress, true],
                    ["Repassage", repassage, setRepassage, false],
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
                {(
                  [
                    ["Autoriser une remise", optRemise, setOptRemise],
                    ["Arrondi à 100 FCFA", optArrondi, setOptArrondi],
                    ["Prix modifiable en caisse", optModifiable, setOptModifiable],
                  ] as [string, boolean, (v: boolean) => void][]
                ).map(([label, v, set]) => (
                  <Label key={label} htmlFor={`ar-opt-${label}`} className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                    <Checkbox id={`ar-opt-${label}`} checked={v} onCheckedChange={(c) => set(c === true)} />
                    {label}
                  </Label>
                ))}
              </div>
            </section>
          )}

          {/* Tarification au kilo */}
          {mode !== "Pièce" && (
            <section className="rounded-xl border border-border bg-white p-5">
              <h2 className="text-sm font-bold">Tarification au kilo</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Tarifs TTC par niveau de service.</p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(
                  [
                    ["Classique", classiqueKilo, setClassiqueKilo, false],
                    ["Express", expressKilo, setExpressKilo, true],
                    ["Repassage", repassageKilo, setRepassageKilo, false],
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
                      <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">FCFA/kg</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold">Grilles par tranche de poids</h3>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Optionnelles — tarifs progressifs au kilo.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-[11px] font-bold"
                  onClick={() => setGrilles((g) => [...g, { minKg: "", maxKg: "", classic: "", express: "" }])}
                >
                  <Plus className="size-3.5" />
                  Ajouter
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                {grilles.map((gr, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-center gap-2">
                    <div className="relative">
                      <Input
                        inputMode="decimal"
                        value={gr.minKg}
                        onChange={(e) => setGrilles((g) => g.map((x, j) => (j === i ? { ...x, minKg: e.target.value.replace(/[^0-9.,]/g, "") } : x)))}
                        placeholder="Min"
                        className="h-8 pr-7 text-xs"
                        aria-label="Poids minimum (kg)"
                      />
                      <span className="absolute top-1/2 right-2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">kg</span>
                    </div>
                    <div className="relative">
                      <Input
                        inputMode="decimal"
                        value={gr.maxKg}
                        onChange={(e) => setGrilles((g) => g.map((x, j) => (j === i ? { ...x, maxKg: e.target.value.replace(/[^0-9.,]/g, "") } : x)))}
                        placeholder="Max"
                        className="h-8 pr-7 text-xs"
                        aria-label="Poids maximum (kg)"
                      />
                      <span className="absolute top-1/2 right-2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">kg</span>
                    </div>
                    <Input
                      inputMode="numeric"
                      value={gr.classic}
                      onChange={(e) => setGrilles((g) => g.map((x, j) => (j === i ? { ...x, classic: e.target.value.replace(/[^0-9]/g, "") } : x)))}
                      placeholder="Classique"
                      className="h-8 text-xs"
                      aria-label="Tarif classique de la tranche"
                    />
                    <Input
                      inputMode="numeric"
                      value={gr.express}
                      onChange={(e) => setGrilles((g) => g.map((x, j) => (j === i ? { ...x, express: e.target.value.replace(/[^0-9]/g, "") } : x)))}
                      placeholder="Express"
                      className="h-8 text-xs"
                      aria-label="Tarif express de la tranche"
                    />
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
            <p className="mt-0.5 text-xs text-muted-foreground">Délais de production et options acceptées.</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div>
                <Label htmlFor="ar-dc" className="mb-1.5 text-xs font-semibold">
                  Délai classique (h)
                </Label>
                <Input id="ar-dc" inputMode="numeric" value={heuresClassique} onChange={(e) => setHeuresClassique(e.target.value.replace(/[^0-9]/g, ""))} className="h-9 text-[13px]" />
              </div>
              <div>
                <Label htmlFor="ar-de" className="mb-1.5 text-xs font-semibold">
                  Délai express (h)
                </Label>
                <Input id="ar-de" inputMode="numeric" value={heuresExpress} onChange={(e) => setHeuresExpress(e.target.value.replace(/[^0-9]/g, ""))} className="h-9 text-[13px]" />
              </div>
              <div>
                <Label htmlFor="ar-dr" className="mb-1.5 text-xs font-semibold">
                  Délai repassage (h)
                </Label>
                <Input id="ar-dr" inputMode="numeric" value={heuresRepass} onChange={(e) => setHeuresRepass(e.target.value.replace(/[^0-9]/g, ""))} className="h-9 text-[13px]" />
              </div>
              <div>
                <Label htmlFor="ar-prio" className="mb-1.5 text-xs font-semibold">
                  Priorité
                </Label>
                <Select value={priorite} onValueChange={(v) => setPriorite(v ?? "standard")}>
                  <SelectTrigger id="ar-prio" className="w-full text-[13px] data-[size=default]:h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorites.map((p) => (
                      <SelectItem key={p.code} value={p.code}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* États acceptés */}
              <div>
                <p className="mb-1.5 text-xs font-semibold">États acceptés</p>
                {optionsLoading ? (
                  <p className="text-[11px] text-muted-foreground">Chargement…</p>
                ) : defautsOptions.length > 0 ? (
                  <div className="space-y-1.5">
                    {defautsOptions.map((d) => (
                      <Label key={d.code} htmlFor={`ar-defaut-${d.code}`} className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                        <Checkbox
                          id={`ar-defaut-${d.code}`}
                          checked={defauts.includes(d.code)}
                          onCheckedChange={() => toggleList(defauts, d.code, setDefauts)}
                        />
                        {d.label}
                      </Label>
                    ))}
                  </div>
                ) : (
                  <Textarea
                    value={defautsLibre}
                    onChange={(e) => setDefautsLibre(e.target.value)}
                    placeholder="Séparés par des virgules, ex. Taches, Déchirure"
                    className="min-h-16 text-xs"
                    aria-label="États acceptés (texte libre)"
                  />
                )}
              </div>

              {/* Rendus compatibles */}
              <div>
                <p className="mb-1.5 text-xs font-semibold">Rendus compatibles</p>
                {optionsLoading ? (
                  <p className="text-[11px] text-muted-foreground">Chargement…</p>
                ) : rendusOptions.length > 0 ? (
                  <div className="space-y-1.5">
                    {rendusOptions.map((r) => (
                      <Label key={r.id} htmlFor={`ar-rendu-${r.id}`} className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                        <Checkbox
                          id={`ar-rendu-${r.id}`}
                          checked={rendusIds.includes(r.id)}
                          onCheckedChange={() => toggleList(rendusIds, r.id, setRendusIds)}
                        />
                        {r.title}
                      </Label>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    Liste indisponible — aucun rendu ne sera associé à cet article.
                  </p>
                )}
              </div>

              {/* Services associés */}
              <div>
                <p className="mb-1.5 text-xs font-semibold">Services associés</p>
                {optionsLoading ? (
                  <p className="text-[11px] text-muted-foreground">Chargement…</p>
                ) : servicesOptions.length > 0 ? (
                  <div className="space-y-1.5">
                    {servicesOptions.map((s) => (
                      <Label key={s.code} htmlFor={`ar-service-${s.code}`} className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                        <Checkbox
                          id={`ar-service-${s.code}`}
                          checked={services.includes(s.label)}
                          onCheckedChange={() => toggleList(services, s.label, setServices)}
                        />
                        {s.label}
                      </Label>
                    ))}
                  </div>
                ) : (
                  <Textarea
                    value={servicesLibre}
                    onChange={(e) => setServicesLibre(e.target.value)}
                    placeholder="Séparés par des virgules, ex. Collecte, Livraison"
                    className="min-h-16 text-xs"
                    aria-label="Services associés (texte libre)"
                  />
                )}
              </div>
            </div>
            {!optionsLoading && !options && (
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <CircleAlert className="size-3.5 shrink-0" />
                Catalogue d&apos;options indisponible : saisissez les états et services en texte libre.
              </p>
            )}
          </section>

          {/* Dispo */}
          <section className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Disponibilité par agence</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Activez l&apos;article et, si besoin, un ajustement de prix local.
                </p>
              </div>
              {agencesError && (
                <Button variant="outline" size="sm" onClick={retryAgences} className="text-[11px] font-bold">
                  Réessayer
                </Button>
              )}
            </div>
            {agencesLoading && <p className="mt-3 text-xs text-muted-foreground">Chargement des agences…</p>}
            {agencesError && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-red-600">
                <CircleAlert className="size-3.5 shrink-0" />
                {agencesError}
              </p>
            )}
            <div className="mt-3 divide-y divide-border">
              {agences.map((a) => {
                const etat = dispo[a.id] ?? { available: false, adjust: "", note: "" };
                return (
                  <div key={a.id} className="py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-bold">{a.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "gap-1 border-0 text-[10px] font-bold",
                            etat.available ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground",
                          )}
                        >
                          <span className={cn("size-1.5 rounded-full", etat.available ? "bg-emerald-500" : "bg-muted-foreground/50")} />
                          {etat.available ? "Disponible" : "Indisponible"}
                        </Badge>
                        <Switch
                          checked={etat.available}
                          onCheckedChange={(v) => setDispo((d) => ({ ...d, [a.id]: { ...etat, available: v } }))}
                          aria-label={`Disponible à ${a.name}`}
                        />
                      </div>
                    </div>
                    {etat.available && (
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[160px_1fr]">
                        <div className="relative">
                          <Input
                            inputMode="numeric"
                            value={etat.adjust}
                            onChange={(e) => setDispo((d) => ({ ...d, [a.id]: { ...etat, adjust: e.target.value.replace(/[^0-9-]/g, "") } }))}
                            placeholder="0"
                            className="h-8 pr-8 text-xs"
                            aria-label={`Ajustement de prix pour ${a.name} (%)`}
                          />
                          <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">%</span>
                        </div>
                        <Input
                          value={etat.note}
                          onChange={(e) => setDispo((d) => ({ ...d, [a.id]: { ...etat, note: e.target.value } }))}
                          placeholder="Note pour cette agence (optionnel)"
                          className="h-8 text-xs"
                          aria-label={`Note pour ${a.name}`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              {!agencesLoading && !agencesError && agences.length === 0 && (
                <p className="py-2 text-xs text-muted-foreground">Aucune agence trouvée pour votre réseau.</p>
              )}
            </div>
          </section>
        </div>

        {/* Latéral */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl bg-primary p-4 text-white">
            <Badge className="border-0 bg-secondary/20 text-[10px] font-bold tracking-wide text-secondary">
              {categories.find((c) => String(c.id) === categoryId)?.name ?? "Aucune catégorie"} • {mode}
            </Badge>
            <p className="mt-2 text-lg font-extrabold">{nom || "Nouvel article"}</p>
            <p className="text-[11px] text-white/60">{code || "—"} • Délai {delaiResume}</p>
            <div className="mt-3 space-y-1 text-xs">
              {mode !== "Kilo" && (
                <>
                  <p className="flex justify-between"><span className="text-white/70">Classique</span><span className="font-bold">{formatFCFA(classiqueN)} FCFA</span></p>
                  <p className="flex justify-between"><span className="text-secondary">Express</span><span className="font-bold text-secondary">{formatFCFA(expressN)} FCFA</span></p>
                  <p className="flex justify-between"><span className="text-white/70">Repassage</span><span className="font-bold">{formatFCFA(repassageN)} FCFA</span></p>
                </>
              )}
              {mode === "Kilo" && (
                <p className="flex justify-between"><span className="text-white/70">Classique</span><span className="font-bold">{classiqueKiloN > 0 ? `${formatFCFA(classiqueKiloN)} FCFA/kg` : "—"}</span></p>
              )}
              {mode === "Mixte" && prixKiloAffiche !== null && (
                <p className="flex justify-between"><span className="text-white/70">Au kilo</span><span className="font-bold">{formatFCFA(prixKiloAffiche)} FCFA/kg</span></p>
              )}
            </div>
            <p className="mt-3 text-[10px] leading-snug text-white/50">
              {nbAgencesActives} agence{nbAgencesActives > 1 ? "s" : ""} active{nbAgencesActives > 1 ? "s" : ""} • {actif ? "Publié actif" : "Publié inactif"}
            </p>
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
                  <span className={cn(c.ok ? "text-foreground" : "text-muted-foreground")}>{c.label}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CategoryCreateModal
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
        onCreated={handleCategoryCreated}
      />
    </div>
  );
}
