"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { AppIcon } from "@/components/ui/app-icon";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { handleApiAction } from "@/functions/handleResponseApi";
import { createDepositAction, getArticlesAction, getClientsAction } from "@/actions/AdminAction";
import type {
  ApiArticle,
  ApiClient,
  ArticlesEnvelope,
  ClientsEnvelope,
  DepositCreatePayload,
  DepositLinePayload,
} from "@/lib/types";
import { formatFCFA } from "../data";

const DELAIS = [
  { label: "Express • 24 h", hours: 24 },
  { label: "Standard • 72 h", hours: 72 },
  { label: "Économique • 5 j", hours: 120 },
];
const DELAI_DEFAUT = "Standard • 72 h";

const MOYENS: { label: string; value: string }[] = [
  { label: "Espèces", value: "cash" },
  { label: "Carte", value: "card" },
  { label: "Mobile Money", value: "mobile_money" },
];

const AVATAR_BGS = [
  "bg-amber-100 text-amber-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
];

const emptySubscribe = () => () => {};

/**
 * Référence locale générée une seule fois côté client (jamais pendant le SSR,
 * d'où useSyncExternalStore : crypto.getRandomValues() est une valeur unstable en rendu).
 */
let cachedLocalRef: string | null = null;
function generateLocalRef(): string {
  if (cachedLocalRef === null) {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    cachedLocalRef = `LOCAL-${[...bytes]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()}`;
  }
  return cachedLocalRef;
}
const getServerLocalRef = () => "";

interface Ligne {
  id: number;
  name: string;
  unite: "piece" | "kilo";
  qte: number;
  classicPrice: number | null;
  expressPrice: number | null;
  unitPrice: number | null;
  total: number;
  acceptedDefects: string[];
}

function fmtQte(q: number): string {
  return (Math.round(q * 10) / 10).toString().replace(".", ",");
}

function initialsOf(fullname: string): string {
  return (
    fullname
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export default function NouveauDepotPage() {
  const router = useRouter();
  const { updatePath } = useGlobalData();
  const { logout } = useAuth();

  // Données réelles chargées depuis l'API
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError, setArticlesError] = useState<string | null>(null);

  // Formulaire
  const [clientSearch, setClientSearch] = useState("");
  const [client, setClient] = useState<ApiClient | null>(null);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogTab, setCatalogTab] = useState<"piece" | "kilo">("piece");
  const [qtes, setQtes] = useState<Record<number, number>>({});
  const [activeKilo, setActiveKilo] = useState<number | null>(null);
  const [delai, setDelai] = useState(DELAI_DEFAUT);
  const [defauts, setDefauts] = useState<string[]>([]);
  const [detailsVetement, setDetailsVetement] = useState("");
  const [express, setExpress] = useState(false);
  const [moyen, setMoyen] = useState("cash");
  const [promo, setPromo] = useState("");
  const [remise, setRemise] = useState("");
  const [remiseMode, setRemiseMode] = useState<"FCFA" | "%">("FCFA");
  const [autorisation, setAutorisation] = useState("");
  const [acompte, setAcompte] = useState("");

  // Collecte / livraison
  const [withCollection, setWithCollection] = useState(false);
  const [withDelivery, setWithDelivery] = useState(false);
  const [collectionFee, setCollectionFee] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [deliveryZoneId, setDeliveryZoneId] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const [saving, setSaving] = useState(false);

  // Référence locale transmise au backend (local_ref) — générée côté client uniquement
  const localRef = useSyncExternalStore(emptySubscribe, generateLocalRef, getServerLocalRef);

  const fetchClients = () =>
    handleApiAction({
      action: getClientsAction,
      logout,
      onSuccess: (res) => {
        const envelope = res as ClientsEnvelope;
        setClients(Array.isArray(envelope?.data) ? envelope.data : []);
        setClientsLoading(false);
      },
      onError: (e) => {
        setClientsError(e);
        setClientsLoading(false);
      },
    });

  const retryClients = () => {
    setClientsLoading(true);
    setClientsError(null);
    void fetchClients();
  };

  const fetchArticles = () =>
    handleApiAction({
      action: getArticlesAction,
      logout,
      onSuccess: (res) => {
        const envelope = res as ArticlesEnvelope;
        setArticles(Array.isArray(envelope?.data) ? envelope.data : []);
        setArticlesLoading(false);
      },
      onError: (e) => {
        setArticlesError(e);
        setArticlesLoading(false);
      },
    });

  const retryArticles = () => {
    setArticlesLoading(true);
    setArticlesError(null);
    void fetchArticles();
  };

  // Chargement des clients et du catalogue au montage
  useEffect(() => {
    void fetchClients();
    void fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const matches = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (q === "") return [];
    return clients
      .filter((c) => `${c.fullname} ${c.phone_number} ${c.code}`.toLowerCase().includes(q))
      .slice(0, 4);
  }, [clientSearch, clients]);

  const lignes = useMemo<Ligne[]>(
    () =>
      articles
        .map((a) => {
          const qte = qtes[a.id] ?? 0;
          const unite: "piece" | "kilo" = a.billing_mode === "kilo" ? "kilo" : "piece";
          const classic = unite === "kilo" ? a.classic_price_kilo : a.classic_price;
          const expr = unite === "kilo" ? a.express_price_kilo : a.express_price;
          const unitPrice = express ? (expr ?? classic) : classic;
          return {
            id: a.id,
            name: a.name,
            unite,
            qte,
            classicPrice: classic,
            expressPrice: expr,
            unitPrice,
            total: unitPrice != null ? Math.round(qte * unitPrice) : 0,
            acceptedDefects: a.accepted_defects ?? [],
          };
        })
        .filter((l) => l.qte > 0),
    [articles, qtes, express],
  );

  const nbArticles = useMemo(
    () => lignes.reduce((n, l) => n + (l.unite === "piece" ? l.qte : Math.round(l.qte)), 0),
    [lignes],
  );

  const sousTotal = lignes.reduce((n, l) => n + l.total, 0);
  const remiseValue = useMemo(() => {
    const v = Number(remise) || 0;
    if (remiseMode === "%") return Math.round((sousTotal * Math.min(v, 100)) / 100);
    return Math.min(v, sousTotal);
  }, [remise, remiseMode, sousTotal]);
  const supplement = express
    ? lignes.reduce(
        (n, l) =>
          n +
          (l.expressPrice != null && l.classicPrice != null
            ? Math.round(l.qte * Math.max(0, l.expressPrice - l.classicPrice))
            : 0),
        0,
      )
    : 0;
  const collectionFeeValue = withCollection ? Number(collectionFee) || 0 : 0;
  const deliveryFeeValue = withDelivery ? Number(deliveryFee) || 0 : 0;
  const acompteValue = Number(acompte.replace(/[^0-9]/g, "")) || 0;
  const total = Math.max(0, sousTotal + supplement + collectionFeeValue + deliveryFeeValue - remiseValue);
  const reste = Math.max(0, total - acompteValue);

  const poids = activeKilo != null ? (qtes[activeKilo] ?? 0) : 0;
  const delaiHours = DELAIS.find((d) => d.label === delai)?.hours ?? 72;

  const defautsOptions = useMemo(() => {
    const set = new Set<string>();
    lignes.forEach((l) => l.acceptedDefects.forEach((d) => set.add(d)));
    return [...set];
  }, [lignes]);

  const bump = (id: number, delta: number, kilo = false) => {
    setQtes((q) => {
      const next = Math.round(((q[id] ?? 0) + delta) * 10) / 10;
      return { ...q, [id]: Math.max(0, next) };
    });
    if (kilo) setActiveKilo(id);
  };

  const setPoids = (delta: number) => {
    if (activeKilo == null) return;
    setQtes((q) => {
      const next = Math.round(((q[activeKilo] ?? 0) + delta) * 10) / 10;
      return { ...q, [activeKilo]: Math.max(0, next) };
    });
  };

  const toggleDefaut = (d: string) =>
    setDefauts((list) => (list.includes(d) ? list.filter((x) => x !== d) : [...list, d]));

  const stepDone = (n: number) => {
    if (n === 1) return client !== null;
    if (n === 2) return lignes.length > 0;
    if (n === 3) return acompteValue > 0;
    return false;
  };

  const handleAddPanier = () => {
    if (!client) {
      toast.error("Client requis", { description: "Recherchez et sélectionnez un client." });
      return;
    }
    if (lignes.length === 0) {
      toast.error("Panier vide", { description: "Ajoutez au moins une prestation." });
      return;
    }
    toast.success("Panier confirmé", {
      description: `${lignes.length} lignes • ${nbArticles} articles • ${formatFCFA(total)} FCFA.`,
    });
  };

  const handleSave = async () => {
    if (!client) {
      toast.error("Client requis", { description: "Recherchez et sélectionnez un client." });
      return;
    }
    if (lignes.length === 0) {
      toast.error("Panier vide", { description: "Ajoutez au moins une prestation." });
      return;
    }
    const sansPrix = lignes.filter((l) => l.unitPrice == null);
    if (sansPrix.length > 0) {
      toast.error("Prix manquant", {
        description: `Aucun tarif défini pour : ${sansPrix.map((l) => l.name).join(", ")}.`,
      });
      return;
    }

    setSaving(true);
    try {
      const now = new Date();
      const retrieve = new Date(now.getTime() + delaiHours * 3_600_000);
      const pct = Math.min(Number(remise) || 0, 100);

      const lines: DepositLinePayload[] = lignes.map((l) => {
        const defs = l.acceptedDefects.filter((d) => defauts.includes(d));
        return {
          article_id: l.id,
          quantity: l.unite === "piece" ? Math.round(l.qte) : l.qte,
          pricing_type: l.unite,
          ...(l.unite === "kilo" ? { weight_kg: l.qte } : {}),
          unit_price: l.unitPrice as number,
          designation: l.name,
          express,
          ...(defs.length > 0 ? { defects: defs } : {}),
          ...(detailsVetement.trim() ? { internal_notes: detailsVetement.trim() } : {}),
        };
      });

      const payload: DepositCreatePayload = {
        client_id: client.id,
        ...(remiseMode === "FCFA" && remiseValue > 0 ? { discount: remiseValue } : {}),
        ...(remiseMode === "%" && pct > 0 ? { discount_percent: pct } : {}),
        ...(promo.trim() ? { promo_code: promo.trim() } : {}),
        ...(withCollection
          ? {
              with_collection: true,
              ...(collectionFeeValue > 0 ? { collection_fee: collectionFeeValue } : {}),
            }
          : {}),
        ...(withDelivery
          ? {
              with_delivery: true,
              ...(deliveryFeeValue > 0 ? { delivery_fee: deliveryFeeValue } : {}),
              ...(Number(deliveryZoneId) > 0 ? { delivery_zone_id: Number(deliveryZoneId) } : {}),
              ...(deliveryAddress.trim() ? { delivery_address: deliveryAddress.trim() } : {}),
            }
          : {}),
        ...(acompteValue > 0 ? { advanced: acompteValue } : {}),
        payment_method: moyen,
        deposit_date: now.toISOString(),
        retrieve_date: retrieve.toISOString(),
        local_ref: localRef || generateLocalRef(),
        ...(autorisation.trim() ? { discount_reason: autorisation.trim() } : {}),
        lines,
      };

      await handleApiAction({
        action: createDepositAction,
        params: payload,
        logout,
        onSuccess: (data) => {
          toast.success(`Dépôt ${data.code ?? localRef} enregistré`, {
            description: `${client.fullname} • ${formatFCFA(total)} FCFA.`,
          });
          updatePath("/depots");
        },
      });
    } finally {
      setSaving(false);
    }
  };

  const visibles = articles
    .filter((a) => (catalogTab === "kilo" ? a.billing_mode !== "piece" : a.billing_mode !== "kilo"))
    .filter((a) => a.name.toLowerCase().includes(catalogSearch.trim().toLowerCase()));

  const priceOf = (a: ApiArticle) =>
    express
      ? ((catalogTab === "kilo" ? a.express_price_kilo : a.express_price) ??
        (catalogTab === "kilo" ? a.classic_price_kilo : a.classic_price))
      : catalogTab === "kilo"
        ? a.classic_price_kilo
        : a.classic_price;

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Retour aux dépôts"
          onClick={() => router.back()}
          className="mt-1 bg-primary text-white hover:bg-primary/90 hover:text-white"
        >
          <AppIcon name="back" className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Nouveau dépôt</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Sélectionnez le client, composez la commande et encaissez l&apos;acompte.
          </p>
        </div>
        <div className="text-right">
          <Badge variant="outline" className="text-[10px] font-bold">
            {localRef || "LOCAL-…"}
          </Badge>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Référence locale</p>
        </div>
      </div>

      {/* Étapes */}
      <div className="grid grid-cols-3 gap-2">
        {["1 • Client", "2 • Articles", "3 • Paiement"].map((s, i) => {
          const done = stepDone(i + 1);
          return (
            <div
              key={s}
              className={cn(
                "rounded-lg border px-3 py-2 text-center text-xs font-bold",
                done ? "border-primary bg-primary/5 text-foreground" : "border-border bg-white text-muted-foreground",
              )}
            >
              {s}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-4 xl:col-span-2">
          {/* Client */}
          <section className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Client</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Recherchez par nom, téléphone ou code client.
                </p>
              </div>
              <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-muted-foreground">
                {clientsLoading ? "Chargement…" : `${clients.length} fiches`}
              </Badge>
            </div>
            <Label htmlFor="nd-search" className="mt-4 mb-1.5 text-xs font-semibold">
              Rechercher
            </Label>
            <div className="relative">
              <AppIcon name="search" className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="nd-search"
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setClient(null);
                }}
                placeholder="Nom, téléphone ou code…"
                className="h-9 pl-9 text-[13px]"
              />
            </div>

            {clientsError && (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                <span>Impossible de charger les clients.</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryClients}
                  className="gap-1.5 border-red-200 bg-white text-xs font-bold"
                >
                  <AppIcon name="refresh" className="size-3.5" />
                  Réessayer
                </Button>
              </div>
            )}

            {clientsLoading && !client && (
              <p className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                Chargement des clients…
              </p>
            )}

            {matches.length > 0 && !client && (
              <div className="mt-2 divide-y divide-border overflow-hidden rounded-lg border border-border">
                {matches.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setClient(c);
                      setClientSearch("");
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-muted/50"
                  >
                    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", AVATAR_BGS[c.id % AVATAR_BGS.length])}>
                      {initialsOf(c.fullname)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold">{c.fullname}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {c.phone_number} • {c.code}
                      </span>
                    </span>
                    {c.loyalty_points > 0 && (
                      <Badge variant="outline" className="border-0 bg-amber-50 text-[10px] font-bold text-amber-700">
                        {c.loyalty_points} pts
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}

            {client && (
              <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-primary/40 bg-primary/[0.03] p-3">
                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold", AVATAR_BGS[client.id % AVATAR_BGS.length])}>
                  {initialsOf(client.fullname)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold">{client.fullname}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {client.phone_number} • {client.code}
                    {client.loyalty_points > 0
                      ? ` • ${client.loyalty_points.toLocaleString("fr-FR").replace(/,/g, " ")} pts`
                      : ""}
                  </p>
                </div>
                <Button variant="ghost" size="icon-sm" aria-label="Changer de client" onClick={() => setClient(null)}>
                  <AppIcon name="close" className="size-4" />
                </Button>
              </div>
            )}

            <div className="mt-2 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
              <span>Client introuvable ?</span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 border-primary/40 text-[11px] font-bold text-primary"
                onClick={() => updatePath("/clients/nouveau")}
              >
                <AppIcon name="plus" className="size-3" />
                Créer une fiche
              </Button>
            </div>
          </section>

          {/* Catalogue */}
          <section className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Catalogue</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Prestations et tarifs de l&apos;établissement.</p>
              </div>
              <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-muted-foreground">
                {articlesLoading ? "Chargement…" : `${articles.length} prestations`}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <AppIcon name="search" className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Rechercher une prestation"
                  className="h-9 bg-muted/40 pl-9 text-[13px]"
                />
              </div>
              <Tabs value={catalogTab} onValueChange={(v) => setCatalogTab(v as "piece" | "kilo")}>
                <TabsList className="h-7">
                  <TabsTrigger value="piece" className="px-3 text-[11px]">
                    À la pièce
                  </TabsTrigger>
                  <TabsTrigger value="kilo" className="px-3 text-[11px]">
                    Au kilo
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {articlesError && (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                <span>Impossible de charger le catalogue.</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryArticles}
                  className="gap-1.5 border-red-200 bg-white text-xs font-bold"
                >
                  <AppIcon name="refresh" className="size-3.5" />
                  Réessayer
                </Button>
              </div>
            )}

            {articlesLoading && (
              <p className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                Chargement du catalogue…
              </p>
            )}

            <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {!articlesLoading &&
                visibles.map((a) => {
                  const q = qtes[a.id] ?? 0;
                  const selected = q > 0;
                  const price = priceOf(a);
                  const kilo = a.billing_mode === "kilo";
                  const expressPrice = kilo ? a.express_price_kilo : a.express_price;
                  const classicPrice = kilo ? a.classic_price_kilo : a.classic_price;
                  return (
                    <div
                      key={a.id}
                      className={cn(
                        "relative rounded-xl border p-3",
                        selected ? "border-primary bg-primary/[0.03]" : "border-border bg-white",
                      )}
                    >
                      {selected && (
                        <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                          {kilo ? fmtQte(q) : q}
                        </span>
                      )}
                      <span className={cn("flex size-9 items-center justify-center rounded-lg", kilo ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500")}>
                        <AppIcon name={kilo ? "box" : "hanger"} className="size-4" />
                      </span>
                      <p className="mt-2 truncate text-[13px] font-semibold" title={a.name}>{a.name}</p>
                      <p className="text-xs font-bold">
                        {price != null ? (
                          <>
                            {formatFCFA(express ? (expressPrice ?? price) : price)} FCFA{kilo ? "/kg" : ""}
                          </>
                        ) : (
                          <span className="text-muted-foreground">Prix non défini</span>
                        )}
                      </p>
                      {express && expressPrice != null && classicPrice != null && expressPrice !== classicPrice && (
                        <p className="text-[11px] text-muted-foreground line-through">{formatFCFA(classicPrice)} FCFA</p>
                      )}
                      <div className="mt-2 flex items-center gap-1">
                        <div className="flex items-center rounded-md border border-border">
                          <button
                            type="button"
                            aria-label={`Retirer ${a.name}`}
                            disabled={price == null}
                            onClick={() => bump(a.id, kilo ? -0.1 : -1, kilo)}
                            className="flex size-6 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                          >
                            <AppIcon name="minus" className="size-3" />
                          </button>
                          <span className="min-w-6 text-center text-xs font-bold">{kilo ? fmtQte(q) : q}</span>
                          <button
                            type="button"
                            aria-label={`Ajouter ${a.name}`}
                            disabled={price == null}
                            onClick={() => bump(a.id, kilo ? 0.1 : 1, kilo)}
                            className="flex size-6 items-center justify-center rounded-r-md bg-primary text-[11px] font-bold text-white disabled:opacity-40"
                          >
                            <AppIcon name="plus" className="size-3" />
                          </button>
                        </div>
                      </div>
                      <Badge variant="outline" className="mt-2 border-0 bg-muted text-[10px] font-semibold text-muted-foreground">
                        {a.billing_mode_label}
                      </Badge>
                    </div>
                  );
                })}
            </div>

            {!articlesLoading && visibles.length === 0 && (
              <p className="mt-3 rounded-lg bg-muted/50 p-3 text-center text-xs text-muted-foreground">
                Aucune prestation {catalogTab === "kilo" ? "au kilo" : "à la pièce"} ne correspond à la recherche.
              </p>
            )}

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label htmlFor="nd-delai" className="mb-1.5 text-xs font-semibold">
                  Délai de restitution
                </Label>
                <Select value={delai} onValueChange={(v) => setDelai(v ?? DELAI_DEFAUT)}>
                  <SelectTrigger id="nd-delai" className="w-full text-[13px] data-[size=default]:h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DELAIS.map((d) => (
                      <SelectItem key={d.label} value={d.label}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 text-xs font-semibold">Poids du linge (kg)</Label>
                <div className="flex items-stretch overflow-hidden rounded-md border border-border">
                  <button
                    type="button"
                    aria-label="Réduire le poids"
                    disabled={activeKilo == null}
                    onClick={() => setPoids(-0.1)}
                    className="flex w-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                  >
                    <AppIcon name="minus" className="size-3.5" />
                  </button>
                  <span className="flex-1 py-2 text-center text-[13px] font-bold">{fmtQte(poids)} kg</span>
                  <button
                    type="button"
                    aria-label="Augmenter le poids"
                    disabled={activeKilo == null}
                    onClick={() => setPoids(0.1)}
                    className="flex w-9 items-center justify-center bg-primary text-white disabled:opacity-40"
                  >
                    <AppIcon name="plus" className="size-3.5" />
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Ajuste la quantité du dernier article au kilo sélectionné
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-[13px] font-bold">État du vêtement</h3>
                <p className="text-[11px] text-muted-foreground">Cochez les défauts constatés à réception</p>
              </div>
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700">
                Usage interne
              </Badge>
            </div>
            {defautsOptions.length > 0 ? (
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                {defautsOptions.map((d) => (
                  <Label key={d} htmlFor={`nd-def-${d}`} className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                    <Checkbox id={`nd-def-${d}`} checked={defauts.includes(d)} onCheckedChange={() => toggleDefaut(d)} />
                    {d}
                  </Label>
                ))}
              </div>
            ) : (
              <p className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground">
                Sélectionnez au moins une prestation pour voir les défauts disponibles.
              </p>
            )}
            <Label htmlFor="nd-details" className="mt-3 mb-1.5 text-xs font-semibold">
              Détails internes du vêtement
            </Label>
            <Textarea
              id="nd-details"
              value={detailsVetement}
              onChange={(e) => setDetailsVetement(e.target.value)}
              placeholder="Commentaires"
              className="min-h-16 text-[13px]"
            />
            <p className="mt-1.5 rounded-md bg-muted/60 px-2.5 py-1.5 text-[11px] text-muted-foreground">
              Visible uniquement par les réceptionnistes — non imprimé sur le ticket
            </p>

            <div className="mt-4 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-[13px] font-bold">Commande express</h3>
              </div>
              <Switch checked={express} onCheckedChange={setExpress} aria-label="Commande express" />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Applique le tarif express du catalogue sur toutes les lignes • Délai conseillé : 24 h
            </p>

            <Button size="lg" className="mt-3 w-full justify-center gap-1.5 text-xs font-bold" onClick={handleAddPanier}>
              <AppIcon name="plus" className="size-4" />
              Ajouter au panier
            </Button>
          </section>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[13px] font-bold">Panier</h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {lignes.length} lignes • {nbArticles} articles
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-3">
              {lignes.map((l) => {
                const delta =
                  express && l.expressPrice != null && l.classicPrice != null
                    ? Math.round(l.qte * Math.max(0, l.expressPrice - l.classicPrice))
                    : 0;
                return (
                  <div key={l.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold">{l.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {l.unite === "piece"
                            ? `Pièce • ${l.qte} × ${formatFCFA(l.unitPrice ?? 0)}`
                            : `Kilo • ${fmtQte(l.qte)} kg × ${formatFCFA(l.unitPrice ?? 0)}`}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <div className="flex items-center rounded-md border border-border">
                          <button
                            type="button"
                            aria-label={`Retirer ${l.name}`}
                            onClick={() => bump(l.id, l.unite === "kilo" ? -0.1 : -1, l.unite === "kilo")}
                            className="flex size-6 items-center justify-center text-muted-foreground hover:text-foreground"
                          >
                            <AppIcon name="minus" className="size-3" />
                          </button>
                          <span className="min-w-6 text-center text-xs font-bold">{l.unite === "kilo" ? fmtQte(l.qte) : l.qte}</span>
                          <button
                            type="button"
                            aria-label={`Ajouter ${l.name}`}
                            onClick={() => bump(l.id, l.unite === "kilo" ? 0.1 : 1, l.unite === "kilo")}
                            className="flex size-6 items-center justify-center text-muted-foreground hover:text-foreground"
                          >
                            <AppIcon name="plus" className="size-3" />
                          </button>
                        </div>
                        <span className="w-16 text-right text-xs font-bold">{formatFCFA(l.total)} F</span>
                      </div>
                    </div>
                    {delta > 0 && (
                      <p className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                        <span>Express</span>
                        <span className="font-bold">+ {formatFCFA(delta)} F</span>
                      </p>
                    )}
                  </div>
                );
              })}
              {lignes.length === 0 && (
                <p className="rounded-lg bg-muted/50 p-3 text-center text-xs text-muted-foreground">
                  Panier vide — sélectionnez des prestations dans le catalogue.
                </p>
              )}
            </div>
            <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs">
              <p className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span className="font-semibold">{formatFCFA(sousTotal)} FCFA</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Remise</span><span className="font-semibold">− {formatFCFA(remiseValue)} FCFA</span></p>
              {collectionFeeValue > 0 && (
                <p className="flex justify-between"><span className="text-muted-foreground">Frais de collecte</span><span className="font-semibold">+ {formatFCFA(collectionFeeValue)} FCFA</span></p>
              )}
              {deliveryFeeValue > 0 && (
                <p className="flex justify-between"><span className="text-muted-foreground">Frais de livraison</span><span className="font-semibold">+ {formatFCFA(deliveryFeeValue)} FCFA</span></p>
              )}
              {express && supplement > 0 && (
                <p className="flex justify-between"><span className="text-muted-foreground">Dont supplément express</span><span className="font-bold">+ {formatFCFA(supplement)} FCFA</span></p>
              )}
              <p className="flex justify-between"><span className="text-muted-foreground">Avance / acompte</span><span className="font-semibold">− {formatFCFA(acompteValue)} FCFA</span></p>
              <p className="flex justify-between pt-1 text-base"><span className="font-bold">Total</span><span className="font-extrabold text-primary">{formatFCFA(total)} FCFA</span></p>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Paiement</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">L&apos;encaissement est enregistré avec le dépôt.</p>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {MOYENS.map((m) => (
                <Button
                  key={m.value}
                  variant={moyen === m.value ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => setMoyen(m.value)}
                  className={cn("h-8 text-[11px] font-semibold", moyen === m.value && "border-primary bg-primary/5 text-foreground")}
                >
                  {m.label}
                </Button>
              ))}
            </div>
            <Label htmlFor="nd-promo" className="mt-3 mb-1.5 text-xs font-semibold">
              Code promo
            </Label>
            <div className="flex gap-2">
              <Input id="nd-promo" value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Ex. RENTREE15" className="h-9 text-[13px]" />
              <Button
                size="lg"
                className="shrink-0 px-4 text-xs font-bold"
                onClick={() =>
                  promo.trim()
                    ? toast.info("Code promo ajouté", { description: `« ${promo.trim()} » sera joint au dépôt.` })
                    : toast.error("Code vide", { description: "Saisissez un code promo." })
                }
              >
                Appliquer
              </Button>
            </div>
            <Label htmlFor="nd-remise" className="mt-3 mb-1.5 text-xs font-semibold">
              Remise
            </Label>
            <div className="flex gap-2">
              <Input
                id="nd-remise"
                inputMode="decimal"
                value={remise}
                onChange={(e) => setRemise(e.target.value.replace(/[^0-9]/g, ""))}
                className="h-9 text-[13px]"
              />
              <div className="flex shrink-0 overflow-hidden rounded-md border border-border">
                {(["FCFA", "%"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setRemiseMode(m)}
                    className={cn(
                      "px-3 text-[11px] font-bold",
                      remiseMode === m ? "bg-primary/10 text-primary" : "text-muted-foreground",
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <Label htmlFor="nd-autorisation" className="mt-3 mb-1.5 text-xs font-semibold">
              Motif / autorisation de la remise
            </Label>
            <Textarea
              id="nd-autorisation"
              value={autorisation}
              onChange={(e) => setAutorisation(e.target.value)}
              placeholder="ex. Remise accordée par la gérante"
              className="min-h-16 text-[13px]"
            />
            <Label htmlFor="nd-acompte" className="mt-3 mb-1.5 text-xs font-semibold">
              Avance / acompte
            </Label>
            <Input
              id="nd-acompte"
              inputMode="numeric"
              value={acompte}
              onChange={(e) => setAcompte(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="15 000 FCFA"
              className="h-9 text-[13px]"
            />
            <p className="mt-3 flex justify-between text-xs">
              <span className="text-muted-foreground">Reste à payer</span>
              <span className="text-[13px] font-extrabold">{formatFCFA(reste)} FCFA</span>
            </p>
            <Button
              size="lg"
              className="mt-3 w-full justify-center gap-1.5 text-xs font-bold"
              onClick={() => void handleSave()}
              disabled={saving}
            >
              <AppIcon name="print" className="size-4" />
              {saving ? "Enregistrement…" : "Enregistrer le dépôt"}
            </Button>
          </section>

          <section className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Collecte et livraison</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Frais ajoutés au total lorsqu&apos;ils sont activés.
            </p>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="nd-collecte" className="flex items-center gap-2 text-xs font-semibold">
                  <AppIcon name="motorbike" className="size-4 text-muted-foreground" />
                  Collecte à domicile
                </Label>
                <Switch id="nd-collecte" checked={withCollection} onCheckedChange={setWithCollection} aria-label="Collecte à domicile" />
              </div>
              {withCollection && (
                <div>
                  <Label htmlFor="nd-collection-fee" className="mb-1.5 text-xs font-semibold">
                    Frais de collecte (FCFA)
                  </Label>
                  <Input
                    id="nd-collection-fee"
                    inputMode="numeric"
                    value={collectionFee}
                    onChange={(e) => setCollectionFee(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="0"
                    className="h-9 text-[13px]"
                  />
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="nd-livraison" className="flex items-center gap-2 text-xs font-semibold">
                  <AppIcon name="truck" className="size-4 text-muted-foreground" />
                  Livraison à domicile
                </Label>
                <Switch id="nd-livraison" checked={withDelivery} onCheckedChange={setWithDelivery} aria-label="Livraison à domicile" />
              </div>
              {withDelivery && (
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="nd-delivery-fee" className="mb-1.5 text-xs font-semibold">
                      Frais de livraison (FCFA)
                    </Label>
                    <Input
                      id="nd-delivery-fee"
                      inputMode="numeric"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="0"
                      className="h-9 text-[13px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nd-zone" className="mb-1.5 text-xs font-semibold">
                      Zone de livraison (ID)
                    </Label>
                    <Input
                      id="nd-zone"
                      inputMode="numeric"
                      value={deliveryZoneId}
                      onChange={(e) => setDeliveryZoneId(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="ex. 1"
                      className="h-9 text-[13px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nd-adresse" className="mb-1.5 text-xs font-semibold">
                      Adresse de livraison
                    </Label>
                    <Input
                      id="nd-adresse"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="ex. Cocody, Riviera 3, rue L112"
                      className="h-9 text-[13px]"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
