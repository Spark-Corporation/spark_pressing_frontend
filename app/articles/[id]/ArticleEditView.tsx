"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, CircleAlert, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useGlobalData } from "@/contexts/GlobalContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getArticleCategoriesAction,
  getArticleOptionsAction,
  getNetworkOverviewAction,
  updateArticleAction,
} from "@/actions/AdminAction";
import { handleApiAction } from "@/functions/handleResponseApi";
import type {
  ApiArticleCategory,
  ApiArticleDetail,
  ArticleAvailabilityPayload,
  ArticleCreatePayload,
  ArticleKiloTierPayload,
  ArticleOptionsCatalog,
} from "@/lib/types";
import type { NetworkOverviewData } from "../../multi-agences/types";
import { formatFCFA } from "../data";
import { cn } from "@/lib/utils";

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

const BILLING_MODES = {
  piece: "Pièce",
  kilo: "Kilo",
  mixed: "Mixte",
} as const;

const num = (value: string) => Number(value) || 0;
const poids = (value: string) => {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};
const priceOrNull = (value: string): number | null => {
  const amount = num(value);
  return amount > 0 ? amount : null;
};
const libreToList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
const grilleComplete = (grille: GrilleKilo) =>
  poids(grille.maxKg) > poids(grille.minKg) &&
  num(grille.classic) > 0 &&
  num(grille.express) > 0;

const initialAgencyAvailability = (article: ApiArticleDetail) =>
  Object.fromEntries(
    (article.availability?.agencies ?? []).map((agency) => [
      agency.agency_id,
      {
        available: agency.available,
        adjust: agency.price_adjust_percent
          ? String(agency.price_adjust_percent)
          : "",
        note: agency.note ?? "",
      },
    ]),
  ) as Record<number, DispoEtat>;

export default function ArticleEditView({
  article,
}: {
  article: ApiArticleDetail;
}) {
  const router = useRouter();
  const { updatePath } = useGlobalData();
  const { logout } = useAuth();

  const [categories, setCategories] = useState<ApiArticleCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [agences, setAgences] = useState<AgenceOption[]>(() =>
    (article.availability?.agencies ?? []).map((agency) => ({
      id: agency.agency_id,
      name: agency.agency,
    })),
  );
  const [agencesLoading, setAgencesLoading] = useState(true);
  const [agencesError, setAgencesError] = useState<string | null>(null);
  const [options, setOptions] = useState<ArticleOptionsCatalog | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nom, setNom] = useState(article.name);
  const [code, setCode] = useState(article.code);
  const [description, setDescription] = useState(article.description ?? "");
  const [icone, setIcone] = useState(article.icon ?? "");
  const [actif, setActif] = useState(article.status);
  const [categoryId, setCategoryId] = useState(
    article.category_id === null ? "" : String(article.category_id),
  );
  const [mode, setMode] = useState<"Pièce" | "Kilo" | "Mixte">(
    BILLING_MODES[article.billing_mode],
  );
  const [classique, setClassique] = useState(
    String(article.classic_price ?? ""),
  );
  const [express, setExpress] = useState(String(article.express_price ?? ""));
  const [repassage, setRepassage] = useState(
    String(article.repass_price ?? ""),
  );
  const [classiqueKilo, setClassiqueKilo] = useState(
    String(article.classic_price_kilo ?? ""),
  );
  const [expressKilo, setExpressKilo] = useState(
    String(article.express_price_kilo ?? ""),
  );
  const [repassageKilo, setRepassageKilo] = useState(
    String(article.repass_price_kilo ?? ""),
  );
  const [optRemise, setOptRemise] = useState(article.allow_discount);
  const [optArrondi, setOptArrondi] = useState(article.round_to !== null);
  const [optModifiable, setOptModifiable] = useState(article.price_editable);
  const [grilles, setGrilles] = useState<GrilleKilo[]>(
    article.kilo_tiers.length
      ? article.kilo_tiers.map((tier) => ({
          minKg: String(tier.min_kg),
          maxKg: String(tier.max_kg),
          classic: String(tier.classic),
          express: String(tier.express),
        }))
      : [{ minKg: "0", maxKg: "3", classic: "", express: "" }],
  );
  const [heuresClassique, setHeuresClassique] = useState(
    String(article.delays.classic ?? ""),
  );
  const [heuresExpress, setHeuresExpress] = useState(
    String(article.delays.express ?? ""),
  );
  const [heuresRepass, setHeuresRepass] = useState(
    String(article.delays.repass ?? ""),
  );
  const [priorite, setPriorite] = useState(article.priority);
  const [defauts, setDefauts] = useState<string[]>(
    article.accepted_defects ?? [],
  );
  const [defautsLibre, setDefautsLibre] = useState(
    (article.accepted_defects ?? []).join(", "),
  );
  const [rendusIds, setRendusIds] = useState<number[]>(
    article.compatible_renders ?? [],
  );
  const [services, setServices] = useState<string[]>(article.services ?? []);
  const [servicesLibre, setServicesLibre] = useState(
    (article.services ?? []).join(", "),
  );
  const [dispo, setDispo] = useState<Record<number, DispoEtat>>(() =>
    initialAgencyAvailability(article),
  );
  const [dispoInitial, setDispoInitial] = useState<Record<number, DispoEtat>>(
    () => initialAgencyAvailability(article),
  );

  const priorites = useMemo(() => {
    const catalog = options?.priorities ?? [];
    if (catalog.some((option) => option.code === priorite)) return catalog;
    return [...catalog, { code: priorite, label: priorite || "Standard" }];
  }, [options, priorite]);
  const defautsOptions = useMemo(() => {
    const catalog = options?.defects ?? [];
    const missing = defauts
      .filter(
        (codeDefaut) => !catalog.some((option) => option.code === codeDefaut),
      )
      .map((codeDefaut) => ({
        code: codeDefaut,
        label:
          article.options?.defects.find((option) => option.code === codeDefaut)
            ?.label ?? `${codeDefaut} (inactif)`,
      }));
    return [...catalog, ...missing];
  }, [article.options?.defects, defauts, options]);
  const rendusOptions = useMemo(() => {
    const catalog = options?.renders ?? [];
    const missing = rendusIds
      .filter((id) => !catalog.some((option) => option.id === id))
      .map((id) => ({
        id,
        title:
          article.options?.renders.find((option) => option.id === id)?.title ??
          `Rendu ${id} (inactif)`,
      }));
    return [...catalog, ...missing];
  }, [article.options?.renders, options, rendusIds]);
  const servicesOptions = options?.services ?? [];

  const fetchCategories = () =>
    handleApiAction({
      action: getArticleCategoriesAction,
      logout,
      onSuccess: (result) => {
        setCategories(
          [...result.data].sort(
            (a, b) =>
              a.sort_order - b.sort_order || a.name.localeCompare(b.name, "fr"),
          ),
        );
        setCategoriesLoading(false);
      },
      onError: (error) => {
        setCategoriesError(error);
        setCategoriesLoading(false);
      },
    });

  const fetchAgences = () =>
    handleApiAction({
      action: getNetworkOverviewAction,
      logout,
      onSuccess: (result) => {
        const data = result as NetworkOverviewData;
        const agencyMap = new Map<number, string>(
          (data.agencies ?? []).map((agency) => [
            agency.agency_id,
            agency.name,
          ]),
        );
        for (const agency of article.availability?.agencies ?? []) {
          if (!agencyMap.has(agency.agency_id)) {
            agencyMap.set(agency.agency_id, agency.agency);
          }
        }
        const list = [...agencyMap].map(([id, name]) => ({ id, name }));
        setAgences(list);
        const initialAvailability = initialAgencyAvailability(article);
        const agencyAvailability = Object.fromEntries(
          list.map((agency) => [
            agency.id,
            initialAvailability[agency.id] ?? {
              available: false,
              adjust: "",
              note: "",
            },
          ]),
        );
        setDispo(agencyAvailability);
        setDispoInitial(agencyAvailability);
        setAgencesLoading(false);
      },
      onError: (error) => {
        setAgencesError(error);
        setAgencesLoading(false);
      },
    });

  const fetchOptions = () =>
    handleApiAction({
      action: getArticleOptionsAction,
      logout,
      onSuccess: (result) => {
        setOptions(result as ArticleOptionsCatalog);
        setOptionsLoading(false);
      },
      onError: () => {
        setOptions(null);
        setOptionsLoading(false);
      },
    });

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
  const nbAgencesActives = agences.filter(
    (agency) => dispo[agency.id]?.available,
  ).length;
  const checks = [
    {
      ok: nom.trim() !== "" && code.trim() !== "",
      label: "Informations obligatoires",
    },
    {
      ok:
        (mode === "Kilo" || classiqueN > 0) &&
        (mode === "Kilo" || expressN === 0 || expressN >= classiqueN) &&
        (mode === "Pièce" || classiqueKiloN > 0),
      label: "Tarifs cohérents",
    },
    {
      ok:
        mode === "Pièce" ||
        (grilles.length > 0 && grilles.every(grilleComplete)),
      label: "Grilles kilo valides",
    },
    { ok: nbAgencesActives > 0, label: "Une agence active" },
  ];
  const reco = expressN > classiqueN * 1.4 && expressN > 0 && classiqueN > 0;
  const toggleList = <T,>(list: T[], value: T, set: (next: T[]) => void) =>
    set(
      list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value],
    );

  const initialValues = useMemo(
    () =>
      JSON.stringify({
        name: article.name,
        code: article.code,
        description: article.description ?? "",
        icon: article.icon ?? "",
        status: article.status,
        categoryId:
          article.category_id === null ? "" : String(article.category_id),
        mode: article.billing_mode,
        prices: [
          article.classic_price,
          article.express_price,
          article.repass_price,
          article.classic_price_kilo,
          article.express_price_kilo,
          article.repass_price_kilo,
        ],
        settings: [
          article.allow_discount,
          article.round_to,
          article.price_editable,
        ],
        tiers: article.kilo_tiers,
        delays: article.delays,
        priority: article.priority,
        defects: article.accepted_defects,
        renders: article.compatible_renders,
        services: article.services,
      }),
    [article],
  );
  const availabilityDirty =
    JSON.stringify(dispo) !== JSON.stringify(dispoInitial);
  const formDirty =
    initialValues !==
    JSON.stringify({
      name: nom,
      code: code.toUpperCase(),
      description,
      icon: icone,
      status: actif,
      categoryId,
      mode: mode === "Pièce" ? "piece" : mode === "Kilo" ? "kilo" : "mixed",
      prices: [
        priceOrNull(classique),
        priceOrNull(express),
        priceOrNull(repassage),
        priceOrNull(classiqueKilo),
        priceOrNull(expressKilo),
        priceOrNull(repassageKilo),
      ],
      settings: [
        optRemise,
        optArrondi ? (article.round_to ?? 100) : null,
        optModifiable,
      ],
      tiers: grilles.filter(grilleComplete).map((grille) => ({
        min_kg: poids(grille.minKg),
        max_kg: poids(grille.maxKg),
        classic: num(grille.classic),
        express: num(grille.express),
      })),
      delays: {
        classic: num(heuresClassique) || null,
        express: num(heuresExpress) || null,
        repass: num(heuresRepass) || null,
      },
      priority: priorite,
      defects: defauts,
      renders: rendusIds,
      services,
    });
  const dirty = formDirty || availabilityDirty;

  const handlePublish = async () => {
    const missing = checks.filter((check) => !check.ok);
    if (missing.length > 0) {
      toast.error("Modification impossible", {
        description: missing.map((check) => check.label).join(" • "),
      });
      return;
    }

    const billingMode: ArticleCreatePayload["billing_mode"] =
      mode === "Pièce" ? "piece" : mode === "Kilo" ? "kilo" : "mixed";
    const kiloTiers: ArticleKiloTierPayload[] = grilles
      .filter(grilleComplete)
      .map((grille) => ({
        min_kg: poids(grille.minKg),
        max_kg: poids(grille.maxKg),
        classic: num(grille.classic),
        express: num(grille.express),
      }));
    const availability: ArticleAvailabilityPayload[] = agences.map((agency) => {
      const state = dispo[agency.id] ?? {
        available: false,
        adjust: "",
        note: "",
      };
      const adjust = num(state.adjust);
      return {
        agency_id: agency.id,
        available: state.available,
        ...(state.available && adjust !== 0
          ? { price_adjust_percent: adjust }
          : {}),
        ...(state.note.trim() ? { note: state.note.trim() } : {}),
      };
    });
    const payload: ArticleCreatePayload = {
      name: nom.trim(),
      description: description.trim(),
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
      icon: icone.trim(),
      allow_discount: optRemise,
      round_to: optArrondi ? (article.round_to ?? 100) : null,
      price_editable: optModifiable,
      classic_hours: num(heuresClassique) || null,
      express_hours: num(heuresExpress) || null,
      repass_hours: num(heuresRepass) || null,
      ...(priorite.trim() ? { priority: priorite.trim() } : {}),
      accepted_defects: options?.defects.length
        ? defauts
        : libreToList(defautsLibre),
      compatible_renders: rendusIds,
      services: servicesOptions.length ? services : libreToList(servicesLibre),
      kilo_tiers: billingMode === "piece" ? [] : kiloTiers,
      availability,
    };

    await handleApiAction({
      action: updateArticleAction,
      params: { id: article.id, payload },
      logout,
      setLoading: setSaving,
      onSuccess: (result) => {
        toast.success(`Article « ${result.name} » modifié`, {
          description:
            "Les informations et disponibilités ont été enregistrées.",
        });
        updatePath("/articles");
      },
    });
  };

  const retryCategories = () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    void fetchCategories();
  };
  const retryAgences = () => {
    setAgencesLoading(true);
    setAgencesError(null);
    void fetchAgences();
  };
  const delaiResume = `${num(heuresClassique) || 72} h`;

  return (
    <div className="space-y-5">
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
            Modifier l&apos;article
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Modifiez les tarifs, traitements et disponibilités de cet article.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="px-4 text-xs font-bold"
            onClick={() => router.back()}
          >
            Annuler
          </Button>
          <Button
            size="lg"
            className="gap-1.5 px-4 text-xs font-bold"
            onClick={handlePublish}
            disabled={saving}
          >
            <Check className="size-4" />
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </div>

      {dirty && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-xs ring-1 ring-amber-100">
          <CircleAlert className="size-4 shrink-0 text-amber-600" />
          <p className="font-bold text-amber-800">
            Modifications non enregistrées.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <section className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Informations générales</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Données de l&apos;article sélectionné.
                </p>
              </div>
              <Label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                <Switch
                  checked={actif}
                  onCheckedChange={setActif}
                  aria-label="Article actif"
                />
                {actif ? "Actif" : "Inactif"}
              </Label>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label
                  htmlFor="ar-nom"
                  className="mb-1.5 text-xs font-semibold"
                >
                  Nom
                </Label>
                <Input
                  id="ar-nom"
                  value={nom}
                  onChange={(event) => setNom(event.target.value)}
                  className="h-9 text-[13px]"
                />
              </div>
              <div>
                <Label
                  htmlFor="ar-cat"
                  className="mb-1.5 text-xs font-semibold"
                >
                  Catégorie
                </Label>
                <Select
                  value={categoryId || "__aucune__"}
                  onValueChange={(value) =>
                    setCategoryId(value === "__aucune__" ? "" : (value ?? ""))
                  }
                >
                  <SelectTrigger
                    id="ar-cat"
                    className="w-full text-[13px] data-[size=default]:h-9"
                  >
                    <SelectValue
                      placeholder={
                        categoriesLoading ? "Chargement…" : "Aucune catégorie"
                      }
                    >
                      {(value) => {
                        if (value === "__aucune__") return "Aucune catégorie";
                        const category = categories.find(
                          (cat) => String(cat.id) === value,
                        );
                        return category ? category.name : "Catégorie inconnue";
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__aucune__">Aucune catégorie</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categoriesError && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={retryCategories}
                    className="h-auto p-0 text-[11px]"
                  >
                    Catégories indisponibles — réessayer
                  </Button>
                )}
              </div>
              <div>
                <Label
                  htmlFor="ar-code"
                  className="mb-1.5 text-xs font-semibold"
                >
                  Code
                </Label>
                <Input
                  id="ar-code"
                  value={code}
                  onChange={(event) =>
                    setCode(event.target.value.toUpperCase())
                  }
                  className="h-9 text-[13px]"
                />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label
                  htmlFor="ar-description"
                  className="mb-1.5 text-xs font-semibold"
                >
                  Description
                </Label>
                <Textarea
                  id="ar-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-16 text-xs"
                />
              </div>
              <div>
                <Label
                  htmlFor="ar-icone"
                  className="mb-1.5 text-xs font-semibold"
                >
                  Icône
                </Label>
                <Input
                  id="ar-icone"
                  value={icone}
                  onChange={(event) => setIcone(event.target.value)}
                  className="h-9 text-[13px]"
                />
              </div>
            </div>
            <Label className="mt-3 mb-1.5 text-xs font-semibold">
              Mode de facturation
            </Label>
            <RadioGroup
              value={mode}
              onValueChange={(value) =>
                setMode(value as "Pièce" | "Kilo" | "Mixte")
              }
              className="flex flex-wrap gap-2"
            >
              {(["Pièce", "Kilo", "Mixte"] as const).map((value) => (
                <Label
                  key={value}
                  htmlFor={`ar-mode-${value}`}
                  className={cn(
                    "inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors",
                    mode === value
                      ? "border-primary bg-primary/5"
                      : "border-border text-muted-foreground",
                  )}
                >
                  <RadioGroupItem id={`ar-mode-${value}`} value={value} />
                  {value}
                </Label>
              ))}
            </RadioGroup>
          </section>

          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold">Tarification</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tarifs TTC de l&apos;article.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(
                [
                  ["Classique", classique, setClassique],
                  ["Express", express, setExpress],
                  ["Repassage", repassage, setRepassage],
                ] as const
              ).map(([label, value, set]) => (
                <div key={label}>
                  <Label className="mb-1.5 text-xs font-semibold">
                    {label} • pièce
                  </Label>
                  <Input
                    inputMode="numeric"
                    value={value}
                    onChange={(event) =>
                      set(event.target.value.replace(/[^0-9]/g, ""))
                    }
                    placeholder="0"
                    className="h-9 text-[13px]"
                  />
                </div>
              ))}
              {mode !== "Pièce" &&
                (
                  [
                    ["Classique", classiqueKilo, setClassiqueKilo],
                    ["Express", expressKilo, setExpressKilo],
                    ["Repassage", repassageKilo, setRepassageKilo],
                  ] as const
                ).map(([label, value, set]) => (
                  <div key={`${label}-kilo`}>
                    <Label className="mb-1.5 text-xs font-semibold">
                      {label} • kilo
                    </Label>
                    <Input
                      inputMode="numeric"
                      value={value}
                      onChange={(event) =>
                        set(event.target.value.replace(/[^0-9]/g, ""))
                      }
                      placeholder="0"
                      className="h-9 text-[13px]"
                    />
                  </div>
                ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {(
                [
                  ["Autoriser une remise", optRemise, setOptRemise],
                  ["Arrondi à 100 FCFA", optArrondi, setOptArrondi],
                  ["Prix modifiable", optModifiable, setOptModifiable],
                ] as const
              ).map(([label, value, set]) => (
                <Label
                  key={label}
                  htmlFor={`ar-opt-${label}`}
                  className="flex cursor-pointer items-center gap-2 text-xs font-medium"
                >
                  <Checkbox
                    id={`ar-opt-${label}`}
                    checked={value}
                    onCheckedChange={(checked) => set(checked === true)}
                  />
                  {label}
                </Label>
              ))}
            </div>
          </section>

          {mode !== "Pièce" && (
            <section className="rounded-xl border border-border bg-white p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold">Grilles au kilo</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Tranches tarifaires chargées depuis l&apos;article.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-[11px] font-bold"
                  onClick={() =>
                    setGrilles((current) => [
                      ...current,
                      { minKg: "", maxKg: "", classic: "", express: "" },
                    ])
                  }
                >
                  <Plus className="size-3.5" /> Ajouter
                </Button>
              </div>
              <div className="mt-3 space-y-2">
                {grilles.map((grille, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-center gap-2"
                  >
                    <Input
                      inputMode="decimal"
                      value={grille.minKg}
                      onChange={(event) =>
                        setGrilles((current) =>
                          current.map((item, i) =>
                            i === index
                              ? {
                                  ...item,
                                  minKg: event.target.value.replace(
                                    /[^0-9.,]/g,
                                    "",
                                  ),
                                }
                              : item,
                          ),
                        )
                      }
                      placeholder="Min (kg)"
                      aria-label="Poids minimum"
                      className="h-8 text-xs"
                    />
                    <Input
                      inputMode="decimal"
                      value={grille.maxKg}
                      onChange={(event) =>
                        setGrilles((current) =>
                          current.map((item, i) =>
                            i === index
                              ? {
                                  ...item,
                                  maxKg: event.target.value.replace(
                                    /[^0-9.,]/g,
                                    "",
                                  ),
                                }
                              : item,
                          ),
                        )
                      }
                      placeholder="Max (kg)"
                      aria-label="Poids maximum"
                      className="h-8 text-xs"
                    />
                    <Input
                      inputMode="numeric"
                      value={grille.classic}
                      onChange={(event) =>
                        setGrilles((current) =>
                          current.map((item, i) =>
                            i === index
                              ? {
                                  ...item,
                                  classic: event.target.value.replace(
                                    /[^0-9]/g,
                                    "",
                                  ),
                                }
                              : item,
                          ),
                        )
                      }
                      placeholder="Classique"
                      aria-label="Tarif classique"
                      className="h-8 text-xs"
                    />
                    <Input
                      inputMode="numeric"
                      value={grille.express}
                      onChange={(event) =>
                        setGrilles((current) =>
                          current.map((item, i) =>
                            i === index
                              ? {
                                  ...item,
                                  express: event.target.value.replace(
                                    /[^0-9]/g,
                                    "",
                                  ),
                                }
                              : item,
                          ),
                        )
                      }
                      placeholder="Express"
                      aria-label="Tarif express"
                      className="h-8 text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Supprimer la tranche"
                      onClick={() =>
                        setGrilles((current) =>
                          current.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <Trash2 className="size-3.5 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold">Traitement et compatibilités</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Valeurs existantes et catalogues de l&apos;API.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
              {(
                [
                  ["Classique (h)", heuresClassique, setHeuresClassique],
                  ["Express (h)", heuresExpress, setHeuresExpress],
                  ["Repassage (h)", heuresRepass, setHeuresRepass],
                ] as const
              ).map(([label, value, set]) => (
                <div key={label}>
                  <Label className="mb-1.5 text-xs font-semibold">
                    {label}
                  </Label>
                  <Input
                    inputMode="numeric"
                    value={value}
                    onChange={(event) =>
                      set(event.target.value.replace(/[^0-9]/g, ""))
                    }
                    className="h-9 text-[13px]"
                  />
                </div>
              ))}
              <div>
                <Label
                  htmlFor="ar-prio"
                  className="mb-1.5 text-xs font-semibold"
                >
                  Priorité
                </Label>
                <Select
                  value={priorite}
                  onValueChange={(value) => setPriorite(value ?? "")}
                >
                  <SelectTrigger
                    id="ar-prio"
                    className="w-full text-[13px] data-[size=default]:h-9"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorites.map((priority) => (
                      <SelectItem key={priority.code} value={priority.code}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {optionsLoading ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Chargement des options…
              </p>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="mb-1.5 text-xs font-semibold">États acceptés</p>
                  {defautsOptions.length ? (
                    <div className="space-y-1.5">
                      {defautsOptions.map((defect) => (
                        <Label
                          key={defect.code}
                          htmlFor={`ar-defaut-${defect.code}`}
                          className="flex cursor-pointer items-center gap-2 text-xs font-medium"
                        >
                          <Checkbox
                            id={`ar-defaut-${defect.code}`}
                            checked={defauts.includes(defect.code)}
                            onCheckedChange={() =>
                              toggleList(defauts, defect.code, setDefauts)
                            }
                          />
                          {defect.label}
                        </Label>
                      ))}
                    </div>
                  ) : (
                    <Textarea
                      value={defautsLibre}
                      onChange={(event) => setDefautsLibre(event.target.value)}
                      placeholder="Codes séparés par des virgules"
                      className="min-h-16 text-xs"
                      aria-label="États acceptés"
                    />
                  )}
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-semibold">
                    Rendus compatibles
                  </p>
                  {rendusOptions.length ? (
                    <div className="space-y-1.5">
                      {rendusOptions.map((render) => (
                        <Label
                          key={render.id}
                          htmlFor={`ar-rendu-${render.id}`}
                          className="flex cursor-pointer items-center gap-2 text-xs font-medium"
                        >
                          <Checkbox
                            id={`ar-rendu-${render.id}`}
                            checked={rendusIds.includes(render.id)}
                            onCheckedChange={() =>
                              toggleList(rendusIds, render.id, setRendusIds)
                            }
                          />
                          {render.title}
                        </Label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      Aucun rendu disponible.
                    </p>
                  )}
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-semibold">
                    Services associés
                  </p>
                  {servicesOptions.length ? (
                    <div className="space-y-1.5">
                      {servicesOptions.map((service) => (
                        <Label
                          key={service.code}
                          htmlFor={`ar-service-${service.code}`}
                          className="flex cursor-pointer items-center gap-2 text-xs font-medium"
                        >
                          <Checkbox
                            id={`ar-service-${service.code}`}
                            checked={services.includes(service.label)}
                            onCheckedChange={() =>
                              toggleList(services, service.label, setServices)
                            }
                          />
                          {service.label}
                        </Label>
                      ))}
                    </div>
                  ) : (
                    <Textarea
                      value={servicesLibre}
                      onChange={(event) => setServicesLibre(event.target.value)}
                      placeholder="Services séparés par des virgules"
                      className="min-h-16 text-xs"
                      aria-label="Services associés"
                    />
                  )}
                </div>
              </div>
            )}
            {!optionsLoading && !options && (
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-700">
                <CircleAlert className="size-3.5 shrink-0" />
                Catalogue indisponible : vérifiez les listes saisies avant
                l&apos;enregistrement.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Disponibilité par agence</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Disponibilités, ajustements et notes actuels.
                </p>
              </div>
              {agencesError && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryAgences}
                  className="text-[11px] font-bold"
                >
                  Réessayer
                </Button>
              )}
            </div>
            {agencesLoading && (
              <p className="mt-3 text-xs text-muted-foreground">
                Chargement des agences…
              </p>
            )}
            {agencesError && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-red-600">
                <CircleAlert className="size-3.5 shrink-0" />
                {agencesError}
              </p>
            )}
            <div className="mt-3 divide-y divide-border">
              {agences.map((agency) => {
                const state = dispo[agency.id] ?? {
                  available: false,
                  adjust: "",
                  note: "",
                };
                return (
                  <div key={agency.id} className="py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-bold">{agency.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "gap-1 border-0 text-[10px] font-bold",
                            state.available
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              state.available
                                ? "bg-emerald-500"
                                : "bg-muted-foreground/50",
                            )}
                          />
                          {state.available ? "Disponible" : "Indisponible"}
                        </Badge>
                        <Switch
                          checked={state.available}
                          onCheckedChange={(value) =>
                            setDispo((current) => ({
                              ...current,
                              [agency.id]: { ...state, available: value },
                            }))
                          }
                          aria-label={`Disponible à ${agency.name}`}
                        />
                      </div>
                    </div>
                    {state.available && (
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[160px_1fr]">
                        <div className="relative">
                          <Input
                            inputMode="numeric"
                            value={state.adjust}
                            onChange={(event) =>
                              setDispo((current) => ({
                                ...current,
                                [agency.id]: {
                                  ...state,
                                  adjust: event.target.value.replace(
                                    /[^0-9-]/g,
                                    "",
                                  ),
                                },
                              }))
                            }
                            placeholder="0"
                            className="h-8 pr-8 text-xs"
                            aria-label={`Ajustement de prix pour ${agency.name} (%)`}
                          />
                          <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">
                            %
                          </span>
                        </div>
                        <Input
                          value={state.note}
                          onChange={(event) =>
                            setDispo((current) => ({
                              ...current,
                              [agency.id]: {
                                ...state,
                                note: event.target.value,
                              },
                            }))
                          }
                          placeholder="Note pour cette agence (optionnel)"
                          className="h-8 text-xs"
                          aria-label={`Note pour ${agency.name}`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              {!agencesLoading && !agencesError && agences.length === 0 && (
                <p className="py-2 text-xs text-muted-foreground">
                  Aucune agence trouvée pour votre réseau.
                </p>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl bg-primary p-4 text-white">
            <Badge className="border-0 bg-secondary/20 text-[10px] font-bold tracking-wide text-secondary">
              {categories.find((category) => String(category.id) === categoryId)
                ?.name ??
                article.category?.name ??
                "Sans catégorie"}{" "}
              • {mode}
            </Badge>
            <p className="mt-2 text-lg font-extrabold">{nom || "Article"}</p>
            <p className="text-[11px] text-white/60">
              {code || "—"} • Délai {delaiResume}
            </p>
            <div className="mt-3 space-y-1 text-xs">
              <p className="flex justify-between">
                <span className="text-white/70">Classique</span>
                <span className="font-bold">{formatFCFA(classiqueN)} FCFA</span>
              </p>
              <p className="flex justify-between">
                <span className="text-secondary">Express</span>
                <span className="font-bold text-secondary">
                  {formatFCFA(expressN)} FCFA
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-white/70">Repassage</span>
                <span className="font-bold">{formatFCFA(repassageN)} FCFA</span>
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">
              Contrôle avant enregistrement
            </h2>
            <div className="mt-3 space-y-2">
              {checks.map((check) => (
                <p
                  key={check.label}
                  className="flex items-center gap-2 text-xs"
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border",
                      check.ok
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-border text-transparent",
                    )}
                  >
                    <Check className="size-3" />
                  </span>
                  <span className={check.ok ? "" : "text-muted-foreground"}>
                    {check.label}
                  </span>
                </p>
              ))}
            </div>
            {reco && (
              <p className="mt-3 rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-800 ring-1 ring-amber-100">
                Le tarif Express dépasse de 40 % le tarif classique.
              </p>
            )}
          </div>
          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Dernière modification</h2>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {article.last_modification.by ?? "—"}
              {article.last_modification.at
                ? ` • ${new Date(article.last_modification.at).toLocaleString("fr-FR")}`
                : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
