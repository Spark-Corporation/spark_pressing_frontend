"use client";

import { useMemo, useState } from "react";
import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useGlobalData } from "@/contexts/GlobalContext";
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
import { CLIENTS, type Client } from "@/app/clients/data";
import { formatFCFA } from "../data";

interface Prestation {
  id: string;
  label: string;
  panierLabel: string;
  prix: number;
  unite: "piece" | "kilo";
  icon: AppIconName;
  iconBg: string;
}

const CATALOGUE: Prestation[] = [
  { id: "chemise", label: "Chemise", panierLabel: "Chemise blanche", prix: 2000, unite: "piece", icon: "shirt", iconBg: "bg-slate-100 text-slate-500" },
  { id: "pantalon", label: "Pantalon", panierLabel: "Pantalon laine", prix: 2500, unite: "piece", icon: "trousers", iconBg: "bg-slate-100 text-slate-500" },
  { id: "robe", label: "Robe", panierLabel: "Robe soie", prix: 3500, unite: "piece", icon: "dress", iconBg: "bg-amber-50 text-amber-600" },
  { id: "costume", label: "Costume 2 p.", panierLabel: "Costume 2 pièces", prix: 6000, unite: "piece", icon: "fold", iconBg: "bg-amber-50 text-amber-700" },
  { id: "couette", label: "Couette", panierLabel: "Couette 2 places", prix: 4500, unite: "kilo", icon: "box", iconBg: "bg-amber-50 text-amber-600" },
  { id: "linge", label: "Linge au kilo", panierLabel: "Linge courant", prix: 2000, unite: "kilo", icon: "bag", iconBg: "bg-slate-100 text-slate-500" },
];

const DEFAUTS = ["Taché", "Troué", "Déchiré", "Décoloré", "Bouton cassé", "Autre"];
const MOYENS = ["Espèces", "Carte", "Mobile Money"];

function fmtQte(q: number): string {
  return (Math.round(q * 10) / 10).toString().replace(".", ",");
}

export default function NouveauDepotPage() {
  const router = useRouter();
  const { updatePath } = useGlobalData();

  const [clientSearch, setClientSearch] = useState("");
  const [client, setClient] = useState<Client | null>(CLIENTS[0] ?? null);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogTab, setCatalogTab] = useState<"piece" | "kilo">("piece");
  const [qtes, setQtes] = useState<Record<string, number>>({ chemise: 2, pantalon: 1, linge: 3.4 });
  const [activeKilo, setActiveKilo] = useState("linge");
  const [traitement, setTraitement] = useState("Nettoyage standard");
  const [delai, setDelai] = useState("Standard • 72 h");
  const [defauts, setDefauts] = useState<string[]>(["Taché"]);
  const [detailsVetement, setDetailsVetement] = useState("");
  const [express, setExpress] = useState(true);
  const [moyen, setMoyen] = useState("Espèces");
  const [promo, setPromo] = useState("");
  const [remise, setRemise] = useState("1000");
  const [remiseMode, setRemiseMode] = useState<"FCFA" | "%">("FCFA");
  const [autorisation, setAutorisation] = useState("Autorisation : Aïcha Koné • Client fidèle");
  const [acompte, setAcompte] = useState("15000");

  const matches = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (q === "") return [];
    return CLIENTS.filter((c) =>
      `${c.prenoms} ${c.nom} ${c.phone} ${c.code}`.toLowerCase().includes(q),
    ).slice(0, 4);
  }, [clientSearch]);

  const lignes = useMemo(
    () =>
      CATALOGUE.filter((p) => (qtes[p.id] ?? 0) > 0).map((p) => ({
        ...p,
        qte: qtes[p.id] ?? 0,
        total: Math.round((qtes[p.id] ?? 0) * p.prix),
      })),
    [qtes],
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
  const supplement = express ? sousTotal : 0;
  const acompteValue = Number(acompte.replace(/[^0-9]/g, "")) || 0;
  const total = sousTotal - remiseValue + supplement;
  const reste = Math.max(0, total - acompteValue);

  const poids = qtes[activeKilo] ?? 0;

  const bump = (id: string, delta: number, kilo = false) => {
    setQtes((q) => {
      const next = Math.round(((q[id] ?? 0) + delta) * 10) / 10;
      return { ...q, [id]: Math.max(0, next) };
    });
    if (kilo) setActiveKilo(id);
  };

  const setPoids = (delta: number) => {
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

  const handleSave = () => {
    if (!client) {
      toast.error("Client requis", { description: "Recherchez et sélectionnez un client." });
      return;
    }
    if (lignes.length === 0) {
      toast.error("Panier vide", { description: "Ajoutez au moins une prestation." });
      return;
    }
    toast.success("Dépôt LOCAL-COC-0042 enregistré", {
      description: "File locale chiffrée • synchronisation au retour du réseau.",
    });
    updatePath("/depots");
  };

  return (
    <div className="space-y-5">
      {/* Bandeau hors ligne */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-100">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <AppIcon name="wifi" className="size-4 text-amber-600" />
        </span>
        <div className="min-w-0 flex-1 text-xs">
          <p className="font-bold text-amber-800">Mode hors ligne — le réseau est indisponible</p>
          <p className="text-amber-700">Dernière mise à jour du cache : 28 sept. à 16:21 • Les dépôts sont conservés dans une file locale chiffrée.</p>
        </div>
        <span className="text-[11px] font-bold text-amber-700">3 opérations en file</span>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-amber-200 bg-white text-xs font-bold"
          onClick={() => toast.info("Toujours hors ligne", { description: "La file sera envoyée dès le retour du réseau." })}
        >
          <AppIcon name="refresh" className="size-3.5" />
          Réessayer
        </Button>
      </div>

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
            Continuez la prise en charge avec les données disponibles localement.
          </p>
        </div>
        <div className="text-right">
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700">
            LOCAL-COC-0042
          </Badge>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Numéro temporaire</p>
        </div>
      </div>

      {/* Étapes */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {["1 • Client", "2 • Articles", "3 • Paiement", "4 • Ticket"].map((s, i) => {
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
                <h2 className="text-sm font-bold">Client depuis le cache</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">12 486 fiches disponibles localement.</p>
              </div>
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700">
                Données au 16:21
              </Badge>
            </div>
            <Label htmlFor="nc-search" className="mt-4 mb-1.5 text-xs font-semibold">
              Rechercher
            </Label>
            <div className="relative">
              <AppIcon name="search" className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="nc-search"
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setClient(null);
                }}
                placeholder="+225 07 08 42 16 90"
                className="h-9 pl-9 text-[13px]"
              />
            </div>

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
                    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", c.avatarBg)}>
                      {c.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold">
                        {c.prenoms} {c.nom}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">{c.phone} • {c.code}</span>
                    </span>
                    <Badge variant="outline" className="border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
                      En cache
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {client && (
              <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-primary/40 bg-primary/[0.03] p-3">
                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold", client.avatarBg)}>
                  {client.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold">
                    {client.prenoms} {client.nom}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    Niveau {client.groupe} • {client.points.toLocaleString("fr-FR").replace(/,/g, " ")} pts • {client.agency}
                  </p>
                </div>
                <Badge variant="outline" className="border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
                  En cache
                </Badge>
                <Button variant="ghost" size="icon-sm" aria-label="Changer de client" onClick={() => setClient(null)}>
                  <AppIcon name="close" className="size-4" />
                </Button>
              </div>
            )}

            <div className="mt-2 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
              <span>Créer ou fusionner une fiche client</span>
              <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-muted-foreground">
                Connexion requise
              </Badge>
            </div>
          </section>

          {/* Catalogue */}
          <section className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Catalogue local</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Tarifs validés pour l&apos;agence Cocody.</p>
              </div>
              <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-muted-foreground">
                48 prestations
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

            <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {CATALOGUE.filter((p) => p.unite === catalogTab)
                .filter((p) => p.label.toLowerCase().includes(catalogSearch.trim().toLowerCase()))
                .map((p) => {
                  const q = qtes[p.id] ?? 0;
                  const selected = q > 0;
                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "relative rounded-xl border p-3",
                        selected ? "border-primary bg-primary/[0.03]" : "border-border bg-white",
                      )}
                    >
                      {selected && (
                        <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                          {p.unite === "kilo" ? fmtQte(q) : q}
                        </span>
                      )}
                      <span className={cn("flex size-9 items-center justify-center rounded-lg", p.iconBg)}>
                        <AppIcon name={p.icon} className="size-4" />
                      </span>
                      <p className="mt-2 text-[13px] font-semibold">{p.label}</p>
                      <p className="text-xs font-bold">
                        {formatFCFA(p.prix)} FCFA{p.unite === "kilo" ? "/kg" : ""}
                      </p>
                      {p.unite === "kilo" && selected && (
                        <p className="text-[11px] text-muted-foreground">
                          {fmtQte(q)} × {formatFCFA(p.prix)} = {formatFCFA(Math.round(q * p.prix))} FCFA
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-1">
                        <div className="flex items-center rounded-md border border-border">
                          <button
                            type="button"
                            aria-label={`Retirer ${p.label}`}
                            onClick={() => bump(p.id, p.unite === "kilo" ? -0.1 : -1, p.unite === "kilo")}
                            className="flex size-6 items-center justify-center text-muted-foreground hover:text-foreground"
                          >
                            <AppIcon name="minus" className="size-3" />
                          </button>
                          <span className="min-w-6 text-center text-xs font-bold">{p.unite === "kilo" ? fmtQte(q) : q}</span>
                          <button
                            type="button"
                            aria-label={`Ajouter ${p.label}`}
                            onClick={() => bump(p.id, p.unite === "kilo" ? 0.1 : 1, p.unite === "kilo")}
                            className="flex size-6 items-center justify-center rounded-r-md bg-primary text-[11px] font-bold text-white"
                          >
                            <AppIcon name="plus" className="size-3" />
                          </button>
                        </div>
                      </div>
                      <Badge variant="outline" className="mt-2 border-0 bg-muted text-[10px] font-semibold text-muted-foreground">
                        Express
                      </Badge>
                    </div>
                  );
                })}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label htmlFor="nd-traitement" className="mb-1.5 text-xs font-semibold">
                  Traitement
                </Label>
                <Select value={traitement} onValueChange={(v) => setTraitement(v ?? "Nettoyage standard")}>
                  <SelectTrigger id="nd-traitement" className="w-full text-[13px] data-[size=default]:h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Nettoyage standard", "Soin premium", "Détachage intensif", "Blanchisserie"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nd-delai" className="mb-1.5 text-xs font-semibold">
                  Délai
                </Label>
                <Select value={delai} onValueChange={(v) => setDelai(v ?? "Standard • 72 h")}>
                  <SelectTrigger id="nd-delai" className="w-full text-[13px] data-[size=default]:h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Standard • 72 h", "Express • 24 h", "Économique • 5 j"].map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
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
                    onClick={() => setPoids(-0.1)}
                    className="flex w-9 items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <AppIcon name="minus" className="size-3.5" />
                  </button>
                  <span className="flex-1 py-2 text-center text-[13px] font-bold">{fmtQte(poids)} kg</span>
                  <button
                    type="button"
                    aria-label="Augmenter le poids"
                    onClick={() => setPoids(0.1)}
                    className="flex w-9 items-center justify-center bg-primary text-white"
                  >
                    <AppIcon name="plus" className="size-3.5" />
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Visible uniquement pour un service au kilo</p>
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
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
              {DEFAUTS.map((d) => (
                <Label key={d} htmlFor={`nd-def-${d}`} className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                  <Checkbox id={`nd-def-${d}`} checked={defauts.includes(d)} onCheckedChange={() => toggleDefaut(d)} />
                  {d}
                </Label>
              ))}
            </div>
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
            <p className="mt-1 text-[11px] text-muted-foreground">Tarif ×2 selon la politique du pressing • Délai express : 24 h</p>

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
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700">
                Local
              </Badge>
            </div>
            <div className="mt-3 space-y-3">
              {lignes.map((l) => (
                <div key={l.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold">{l.panierLabel}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {l.unite === "piece" ? `Pièce • ${l.qte} × ${formatFCFA(l.prix)}` : `Kilo • ${fmtQte(l.qte)} kg × ${formatFCFA(l.prix)}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <div className="flex items-center rounded-md border border-border">
                        <button
                          type="button"
                          aria-label={`Retirer ${l.label}`}
                          onClick={() => bump(l.id, l.unite === "kilo" ? -0.1 : -1, l.unite === "kilo")}
                          className="flex size-6 items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <AppIcon name="minus" className="size-3" />
                        </button>
                        <span className="min-w-6 text-center text-xs font-bold">{l.unite === "kilo" ? fmtQte(l.qte) : l.qte}</span>
                        <button
                          type="button"
                          aria-label={`Ajouter ${l.label}`}
                          onClick={() => bump(l.id, l.unite === "kilo" ? 0.1 : 1, l.unite === "kilo")}
                          className="flex size-6 items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <AppIcon name="plus" className="size-3" />
                        </button>
                      </div>
                      <span className="w-16 text-right text-xs font-bold">{formatFCFA(l.total)} F</span>
                    </div>
                  </div>
                  {express && (
                    <p className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                      <span>Express (×2)</span>
                      <span className="font-bold">+ {formatFCFA(l.total)} F</span>
                    </p>
                  )}
                </div>
              ))}
              {lignes.length === 0 && (
                <p className="rounded-lg bg-muted/50 p-3 text-center text-xs text-muted-foreground">
                  Panier vide — sélectionnez des prestations dans le catalogue.
                </p>
              )}
            </div>
            <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs">
              <p className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span className="font-semibold">{formatFCFA(sousTotal)} FCFA</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Remise</span><span className="font-semibold">− {formatFCFA(remiseValue)} FCFA</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Code promo</span><span className="font-semibold">{promo ? "En attente de synchro" : "Non appliqué"}</span></p>
              {express && (
                <p className="flex justify-between"><span className="text-muted-foreground">Supplément express</span><span className="font-bold">+ {formatFCFA(supplement)} FCFA</span></p>
              )}
              <p className="flex justify-between"><span className="text-muted-foreground">Avance / acompte</span><span className="font-semibold">− {formatFCFA(acompteValue)} FCFA</span></p>
              <p className="flex justify-between pt-1 text-base"><span className="font-bold">Total</span><span className="font-extrabold text-primary">{formatFCFA(total)} FCFA</span></p>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Paiement et ticket</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">L&apos;encaissement sera synchronisé au retour du réseau.</p>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {MOYENS.map((m) => (
                <Button
                  key={m}
                  variant={moyen === m ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => setMoyen(m)}
                  className={cn("h-8 text-[11px] font-semibold", moyen === m && "border-primary bg-primary/5 text-foreground")}
                >
                  {m}
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
                    ? toast.info("Code promo en attente", { description: "Vérifié à la synchronisation du ticket." })
                    : toast.error("Code vide", { description: "Saisissez un code promo." })
                }
              >
                Appliquer
              </Button>
            </div>
            <p className="mt-1.5 rounded-md bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-700">
              Code promo vérifié à la synchronisation du ticket.
            </p>
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
            <Textarea
              value={autorisation}
              onChange={(e) => setAutorisation(e.target.value)}
              className="mt-2 min-h-16 text-[13px]"
              aria-label="Autorisation de remise"
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
            <Button size="lg" className="mt-3 w-full justify-center gap-1.5 text-xs font-bold" onClick={handleSave}>
              <AppIcon name="print" className="size-4" />
              Enregistrer et imprimer
            </Button>
            <p className="mt-2 rounded-lg bg-slate-100 p-2.5 text-[11px] leading-snug text-muted-foreground">
              Enregistrement chiffré sur cet appareil. Synchronisation automatique dès reconnexion.
            </p>
            <div className="mt-2 space-y-2">
              <Button variant="outline" size="sm" disabled className="w-full text-[11px] font-semibold" title="Connexion requise">
                Consulter le solde fidélité
              </Button>
              <Button variant="outline" size="sm" disabled className="w-full text-[11px] font-semibold" title="Connexion requise">
                Valider un code promotionnel
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
