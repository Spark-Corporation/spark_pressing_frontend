"use client";

import { useMemo, useState } from "react";
import {
  Banknote,
  Bell,
  Building2,
  Clock,
  FileText,
  Hash,
  Heart,
  Megaphone,
  Package,
  Palette,
  ReceiptText,
  RefreshCw,
  ScrollText,
  Search,
  ShieldCheck,
  Shirt,
  Tags,
  Truck,
  Users,
  Wallet,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Categorie {
  groupe: "STRUCTURE" | "OPÉRATIONS" | "FINANCE & SERVICES" | "PLATEFORME";
  icon: React.ElementType;
  title: string;
  sub: string;
  updated: string;
  statut: "À jour" | "Action requise" | "Modifié";
  route: string;
}

const CATEGORIES: Categorie[] = [
  { groupe: "STRUCTURE", icon: Building2, title: "Organisation & agences", sub: "4 agences actives", updated: "Modifié il y a 2 h", statut: "À jour", route: "/parametres/organisation" },
  { groupe: "STRUCTURE", icon: Users, title: "Utilisateurs & rôles", sub: "28 utilisateurs • 6 rôles", updated: "Modifié il y a 3 jours", statut: "Action requise", route: "/equipe" },
  { groupe: "STRUCTURE", icon: Package, title: "Catalogue", sub: "86 articles • 12 catégories", updated: "Modifié il y a 2 h", statut: "À jour", route: "/articles" },
  { groupe: "STRUCTURE", icon: Hash, title: "Codes dépôt", sub: "4 modèles par agence", updated: "Modifié il y a 2 h", statut: "Modifié", route: "/parametres/operations" },
  { groupe: "OPÉRATIONS", icon: Clock, title: "Délais de traitement", sub: "Classique, Express, Repassage", updated: "Modifié il y a 2 h", statut: "À jour", route: "/parametres/operations" },
  { groupe: "OPÉRATIONS", icon: Megaphone, title: "Promotions", sub: "3 campagnes actives", updated: "Modifié il y a 2 h", statut: "À jour", route: "/parametres/promotions" },
  { groupe: "OPÉRATIONS", icon: Heart, title: "Fidélité", sub: "5 % • 1 000 pts disponibles", updated: "Modifié il y a 2 h", statut: "À jour", route: "/parametres/promotions" },
  { groupe: "OPÉRATIONS", icon: Shirt, title: "Cycle atelier", sub: "Laveur et Classeur actifs", updated: "Modifié il y a 2 h", statut: "Modifié", route: "/parametres/operations" },
  { groupe: "FINANCE & SERVICES", icon: Banknote, title: "Tarification", sub: "Pièce + kilo • 1 200 FCFA/kg", updated: "Modifié il y a 2 h", statut: "À jour", route: "/parametres/operations" },
  { groupe: "FINANCE & SERVICES", icon: Truck, title: "Collecte & livraison", sub: "2 zones • frais configurés", updated: "Modifié il y a 3 jours", statut: "Action requise", route: "/parametres/collecte" },
  { groupe: "FINANCE & SERVICES", icon: Wallet, title: "Paiements", sub: "Espèces, carte, Mobile Money", updated: "Modifié il y a 2 h", statut: "À jour", route: "/parametres/paiements" },
  { groupe: "FINANCE & SERVICES", icon: Bell, title: "Notifications", sub: "SMS et e-mail automatiques", updated: "Modifié il y a 2 h", statut: "À jour", route: "/parametres/notifications" },
  { groupe: "PLATEFORME", icon: Palette, title: "Branding", sub: "Logo et ticket personnalisés", updated: "Modifié il y a 2 h", statut: "À jour", route: "/parametres/branding" },
  { groupe: "PLATEFORME", icon: ReceiptText, title: "Reçus & tickets", sub: "Tickets 58/80 mm • Facture A4", updated: "Modifié il y a 2 h", statut: "À jour", route: "/parametres/recus" },
  { groupe: "PLATEFORME", icon: ShieldCheck, title: "Sécurité", sub: "MFA requis pour 8 admins", updated: "Modifié il y a 2 h", statut: "À jour", route: "/parametres/securite" },
  { groupe: "PLATEFORME", icon: WifiOff, title: "Mode hors ligne", sub: "File locale • synchro auto", updated: "Modifié il y a 2 h", statut: "À jour", route: "/parametres/hors-ligne" },
  { groupe: "PLATEFORME", icon: ScrollText, title: "Audit", sub: "Conservation 24 mois", updated: "Modifié il y a 2 h", statut: "À jour", route: "/parametres/audit" },
];

const GROUPES = ["Tous", "Organisation", "Opérations", "Finance", "Plateforme"] as const;

const statutBadge: Record<Categorie["statut"], string> = {
  "À jour": "bg-emerald-50 text-emerald-700",
  "Action requise": "bg-amber-100 text-amber-700",
  Modifié: "bg-sky-100 text-sky-700",
};

const MODIFS = [
  ["Aujourd'hui • 10:28", "Cycle atelier • étape Classeur activée", "Aïcha Koné", "Toutes agences"],
  ["Aujourd'hui • 09:14", "Frais de livraison Bingerville mis à 2 000 FCFA", "Moussa K.", "Bingerville"],
  ["Hier • 17:52", "Rôle Responsable atelier mis à jour", "Aïcha Koné", "Réseau"],
];

export default function ParametresHub() {
  const { updatePath } = useGlobalData();
  const [search, setSearch] = useState("");
  const [groupe, setGroupe] = useState<(typeof GROUPES)[number]>("Tous");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CATEGORIES.filter((c) => {
      if (groupe !== "Tous") {
        const map: Record<string, string> = { Organisation: "STRUCTURE", Opérations: "OPÉRATIONS", Finance: "FINANCE & SERVICES", Plateforme: "PLATEFORME" };
        if (c.groupe !== map[groupe]) return false;
      }
      if (q && !`${c.title} ${c.sub}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, groupe]);

  const groupesAffiches = (["STRUCTURE", "OPÉRATIONS", "FINANCE & SERVICES", "PLATEFORME"] as const).filter((g) =>
    filtered.some((c) => c.groupe === g),
  );

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Paramètres</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Configurez le réseau, les opérations et la continuité de service depuis un espace unique.
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="gap-1.5 px-3 text-xs font-bold"
          onClick={() => toast.info("Journal des modifications", { description: "Historique complet des réglages." })}
        >
          <FileText className="size-3.5" />
          Journal des modifications
        </Button>
      </div>

      {/* Recherche + état */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-4 xl:col-span-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un paramètre, une règle ou une agence…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 bg-muted/40 pr-12 pl-9 text-[13px]"
            />
            <kbd className="absolute top-1/2 right-3 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              ⌘K
            </kbd>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {GROUPES.map((g) => (
              <Button
                key={g}
                variant={groupe === g ? "default" : "ghost"}
                size="sm"
                onClick={() => setGroupe(g)}
                className="h-7 rounded-full px-3 text-[11px] font-bold"
              >
                {g}
              </Button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <h2 className="text-sm font-bold">État global</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">17 catégories contrôlées</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[87%] rounded-full bg-emerald-500" />
          </div>
          <p className="mt-1.5 flex justify-between text-[11px]">
            <span className="text-muted-foreground">14 à jour</span>
            <span className="font-bold text-amber-600">2 à vérifier</span>
          </p>
        </div>
      </div>

      {/* Catégories */}
      {groupesAffiches.map((g) => (
        <div key={g}>
          <p className="mb-2 flex items-center justify-between px-1 text-[10px] font-bold tracking-[0.14em] text-muted-foreground">
            {g}
            <span className="font-semibold normal-case tracking-normal">
              {filtered.filter((c) => c.groupe === g).length} catégories
            </span>
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {filtered
              .filter((c) => c.groupe === g)
              .map((c) => (
                <button
                  key={c.title}
                  type="button"
                  onClick={() => updatePath(c.route)}
                  className="rounded-xl border border-border bg-white p-4 text-left transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-muted/60">
                      <c.icon className="size-4 text-muted-foreground" />
                    </span>
                    <Badge variant="outline" className={cn("border-0 text-[10px] font-bold", statutBadge[c.statut])}>
                      {c.statut}
                    </Badge>
                  </div>
                  <p className="mt-2.5 text-[13px] font-extrabold">{c.title}</p>
                  <p className="text-[11px] text-muted-foreground">{c.sub}</p>
                  <p className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">{c.updated}</span>
                    <span className="font-bold text-primary">Configurer →</span>
                  </p>
                </button>
              ))}
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <p className="rounded-xl border border-border bg-white p-8 text-center text-[13px] text-muted-foreground">
          Aucune catégorie ne correspond à « {search} ».
        </p>
      )}

      {/* Dernières modifications */}
      <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold">Dernières modifications</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Traçabilité des changements sensibles</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs font-semibold text-muted-foreground"
            onClick={() => toast.info("Journal complet", { description: "Toutes les modifications de réglages." })}
          >
            Voir tout le journal →
          </Button>
        </div>
        <div className="mt-3 divide-y divide-border">
          {MODIFS.map(([quand, quoi, qui, ou], i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 py-2.5 text-xs">
              <span className="w-32 shrink-0 text-muted-foreground">{quand}</span>
              <p className="min-w-0 flex-1 font-semibold">{quoi}</p>
              <span className="text-muted-foreground">{qui}</span>
              <Badge variant="outline" className="border-0 bg-muted text-[10px] font-semibold text-foreground">
                {ou}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Lien profil */}
      <button
        type="button"
        onClick={() => updatePath("/parametres/profil")}
        className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border p-3 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40"
      >
        <Tags className="size-4 shrink-0" />
        <p className="flex-1">
          <span className="font-bold text-foreground">Profil et sécurité staff</span> — identité, mot de passe, sessions et préférences du compte connecté.
        </p>
        <RefreshCw className="size-4 shrink-0" />
      </button>
    </div>
  );
}
