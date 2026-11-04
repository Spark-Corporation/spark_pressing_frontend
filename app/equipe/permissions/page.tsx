"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Copy,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useGlobalData } from "@/contexts/GlobalContext";
import { useAuth } from "@/contexts/AuthContext";
import { getRolesAction } from "@/actions/AdminAction";
import { handleApiAction } from "@/functions/handleResponseApi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MATRICE,
  MEMBRES,
  PERM_HISTORIQUE,
  ROLES_PERM,
} from "../data";
import type { RoleColumn, RolesData } from "../types";

type OngletPerm = "matrice" | "utilisateurs" | "historique";

interface MatrixDomain {
  code: string;
  label: string;
  sub: string;
  sensibles: string[];
}

interface MatrixRole {
  id: number | null;
  label: string;
  system: boolean;
  /** code de domaine -> état (activé/désactivé) de chaque colonne de permission */
  cells: Record<string, boolean[]>;
  /** Résumé renvoyé par l'API ; null pour les données mock. */
  summary: { permissions: number; domains: number } | null;
  /** Nombre d'utilisateurs connu uniquement côté mock. */
  mockUsers?: number;
}

interface MatrixModel {
  columns: RoleColumn[];
  domains: MatrixDomain[];
  roles: MatrixRole[];
  source: "api" | "mock";
}

/** Convertit la valeur `cells[domain]` de l'API en états de cases :
 * "all" -> tout coché ; sinon liste de codes/labels de colonnes séparés par `,` `;` ou `|`. */
const cellToBooleans = (
  val: string | undefined,
  columns: RoleColumn[],
): boolean[] => {
  const s = (val ?? "").trim();
  if (!s) return columns.map(() => false);
  const l = s.toLowerCase();
  if (l === "all" || l === "*") return columns.map(() => true);
  const parts = l.split(/[,;|]/).map((p) => p.trim()).filter(Boolean);
  return columns.map(
    (c) => parts.includes(c.code.toLowerCase()) || parts.includes(c.label.toLowerCase()),
  );
};

/** Modèle de secours construit depuis les mocks locaux (API indisponible). */
const buildMockModel = (): MatrixModel => {
  const actions = Array.from(new Set(MATRICE.flatMap((d) => d.actions)));
  const columns: RoleColumn[] = actions.map((a) => ({ code: a.toLowerCase(), label: a }));
  const domains: MatrixDomain[] = MATRICE.map((d) => ({
    code: d.domaine.toLowerCase(),
    label: d.domaine,
    sub: d.sub,
    sensibles: d.sensibles,
  }));
  const roles: MatrixRole[] = ROLES_PERM.map((r) => ({
    id: null,
    label: r.role,
    system: r.systeme,
    summary: null,
    mockUsers: r.utilisateurs,
    cells: Object.fromEntries(
      MATRICE.map((d) => [
        d.domaine.toLowerCase(),
        columns.map((c) => {
          const i = d.actions.findIndex((a) => a.toLowerCase() === c.code);
          return i >= 0 ? Boolean(d.droits[r.role]?.[i]) : false;
        }),
      ]),
    ),
  }));
  return { columns, domains, roles, source: "mock" };
};

export default function PermissionsPage() {
  const router = useRouter();
  const { updatePath } = useGlobalData();
  const { logout } = useAuth();

  // ------------------------- Données API (GET /roles) -------------------------
  const [rolesData, setRolesData] = useState<RolesData | null>(null);
  const [loading, setLoadingState] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadRoles = useCallback(() => {
    void handleApiAction({
      action: getRolesAction,
      setLoading: setLoadingState,
      showErrorToast: false,
      logout,
      onSuccess: (res) => {
        setRolesData(res as RolesData);
        setLoadError(null);
      },
      onError: setLoadError,
    });
  }, [logout]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // ------------------------- Modèle matrice -------------------------
  /**
   * Columns / domains / roles viennent de GET /roles.
   * Les `sub` et marqueurs « Sensible » ne sont pas fournis par l'API :
   * ils sont enrichis depuis les mocks par correspondance de libellé de domaine.
   */
  const apiModel = useMemo<MatrixModel | null>(() => {
    if (!rolesData?.roles?.length) return null;
    const columns = rolesData.columns ?? [];
    const domains: MatrixDomain[] = (rolesData.domains ?? []).map((d) => {
      const mock = MATRICE.find((m) => m.domaine.toLowerCase() === d.label.toLowerCase());
      return {
        code: d.code,
        label: d.label,
        sub: mock?.sub ?? "",
        sensibles: mock?.sensibles ?? [],
      };
    });
    const roles: MatrixRole[] = rolesData.roles.map((r) => ({
      id: r.id,
      label: r.label ?? r.name,
      system: Boolean(r.system),
      summary: r.summary ? { permissions: r.summary.permissions, domains: r.summary.domains } : null,
      cells: Object.fromEntries(
        domains.map((d) => [d.code, cellToBooleans(r.cells?.[d.code], columns)]),
      ),
    }));
    return { columns, domains, roles, source: "api" };
  }, [rolesData]);

  const model = useMemo(() => apiModel ?? buildMockModel(), [apiModel]);

  // ------------------------- État local UI -------------------------
  const [selectedRole, setSelectedRole] = useState("Manager");
  const [onglet, setOnglet] = useState<OngletPerm>("matrice");
  const [portee, setPortee] = useState("Agences affectées");
  const [niveau, setNiveau] = useState("Données de l'agence");
  const [heritage, setHeritage] = useState("Limité par Admin");
  const [droits, setDroits] = useState<Record<string, Record<string, boolean[]>>>({});
  const [dirty, setDirty] = useState(false);
  const [modele, setModele] = useState("Manager");
  const [copyPerms, setCopyPerms] = useState(true);
  const [copyRestr, setCopyRestr] = useState(true);

  // Initialise l'état des cases depuis le modèle (API ou mock).
  useEffect(() => {
    setDroits(Object.fromEntries(model.roles.map((r) => [r.label, { ...r.cells }])));
    setDirty(false);
  }, [model]);

  // Synchronise le rôle sélectionné avec les libellés réellement disponibles.
  useEffect(() => {
    const labels = model.roles.map((r) => r.label);
    if (labels.length && !labels.includes(selectedRole)) {
      setSelectedRole(labels[0]);
    }
  }, [model, selectedRole]);

  const roleCards = model.roles.map((r) => ({
    label: r.label,
    system: r.system,
    sub:
      r.summary
        ? `${r.summary.permissions} permissions • ${r.summary.domains} domaines`
        : `${r.mockUsers ?? ROLES_PERM.find((p) => p.role === r.label)?.utilisateurs ?? 0} utilisateurs`,
  }));

  const selectedRoleCard = roleCards.find((r) => r.label === selectedRole);

  const toggleDroit = (domainCode: string, idx: number) => {
    setDroits((d) => ({
      ...d,
      [selectedRole]: {
        ...d[selectedRole],
        [domainCode]: d[selectedRole][domainCode].map((v, i) => (i === idx ? !v : v)),
      },
    }));
    setDirty(true);
  };

  const users = MEMBRES.filter((m) => m.role === selectedRole);

  return (
    <div className="space-y-5">
      {loadError && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          <AlertTriangle className="size-4 shrink-0" />
          <p className="flex-1">{loadError}</p>
          <Button size="sm" variant="outline" className="text-[11px] font-bold" onClick={loadRoles}>
            Réessayer
          </Button>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-wrap items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Retour à l'équipe"
          onClick={() => router.back()}
          className="mt-1 bg-primary text-white hover:bg-primary/90 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Rôles et permissions</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Définissez précisément les droits de chaque rôle dans la plateforme.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.success("Rôle dupliqué", { description: `Copie de ${selectedRole} créée en brouillon.` })}
          >
            <Copy className="size-3.5" />
            Dupliquer
          </Button>
          <Button size="lg" className="gap-1.5 px-3 text-xs font-bold" onClick={() => updatePath("/equipe/nouveau-role")}>
            <Plus className="size-4" />
            Créer un rôle
          </Button>
        </div>
      </div>

      {/* Cartes rôles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {roleCards.map((r) => {
          const active = selectedRole === r.label;
          return (
            <button
              key={r.label}
              type="button"
              onClick={() => setSelectedRole(r.label)}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors",
                active ? "border-primary/50 bg-primary/5" : "border-border bg-white hover:border-primary/40",
              )}
            >
              <Badge variant="outline" className="border-0 bg-muted px-1.5 text-[10px] font-bold text-muted-foreground">
                {r.system ? "Système" : "Personnalisé"}
              </Badge>
              <p className="mt-1.5 text-[13px] font-extrabold">{r.label}</p>
              <p className="text-[11px] text-muted-foreground">
                {loading && !rolesData ? "Chargement…" : r.sub}
              </p>
              {active && <p className="mt-1 text-[10px] font-bold text-primary">Sélectionné</p>}
            </button>
          );
        })}
      </div>

      {/* Détail rôle */}
      <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold">{selectedRole}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {selectedRoleCard?.system === false
                ? "Rôle personnalisé de l'organisation"
                : "Pilotage de plusieurs agences"}
            </p>
          </div>
          <Button
            size="sm"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => {
              setDirty(false);
              toast.success("Permissions enregistrées", { description: `Rôle ${selectedRole} mis à jour.` });
            }}
          >
            <Check className="size-3.5" />
            Enregistrer{dirty ? " *" : ""}
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {(
            [
              ["matrice", "Matrice des permissions"],
              ["utilisateurs", "Utilisateurs concernés"],
              ["historique", "Historique"],
            ] as [OngletPerm, string][]
          ).map(([v, label]) => (
            <Button
              key={v}
              variant={onglet === v ? "default" : "ghost"}
              size="sm"
              onClick={() => setOnglet(v)}
              className="h-7 rounded-full px-3 text-[11px] font-bold"
            >
              {label}
            </Button>
          ))}
        </div>

        {onglet === "matrice" && (
          <>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(
                [
                  ["Portée par défaut", portee, setPortee, ["Agences affectées", "Toutes les agences", "Agence principale"]],
                  ["Niveau de données", niveau, setNiveau, ["Données de l'agence", "Données consolidées", "Données personnelles"]],
                  ["Héritage", heritage, setHeritage, ["Limité par Admin", "Hérite du Manager", "Aucun"]],
                ] as [string, string, (v: string) => void, string[]][]
              ).map(([label, value, set, options]) => (
                <div key={label}>
                  <Label className="mb-1.5 text-xs font-semibold">{label}</Label>
                  <Select value={value} onValueChange={(v) => set(v ?? "")}>
                    <SelectTrigger className="w-full text-[13px] data-[size=default]:h-9">
                      <SelectValue>{value}</SelectValue>
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

            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-800 ring-1 ring-amber-100">
              <span className="font-bold">Permissions sensibles activées</span>
              <br />
              Clôture de caisse, annulation de paiement et exports financiers sont journalisés.
            </p>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-150 text-xs">
                <thead>
                  <tr className="text-left text-[10px] font-bold tracking-wide text-muted-foreground">
                    <th className="pb-2">DOMAINE ET ACTIONS</th>
                    {model.columns.map((c) => (
                      <th key={c.code} className="pb-2 text-center">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {model.domains.map((d) => (
                    <tr key={d.code}>
                      <td className="py-2.5 pr-2">
                        <p className="font-bold">{d.label}</p>
                        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          {d.sub}
                          {d.sensibles.length > 0 && (
                            <Badge variant="outline" className="border-amber-200 bg-amber-50 px-1 py-0 text-[9px] font-bold text-amber-700">
                              Sensible
                            </Badge>
                          )}
                        </p>
                      </td>
                      {model.columns.map((c, idx) => {
                        const on = droits[selectedRole]?.[d.code]?.[idx];
                        const sensible = d.sensibles
                          .map((s) => s.toLowerCase())
                          .includes(c.label.toLowerCase());
                        return (
                          <td key={c.code} className="py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => toggleDroit(d.code, idx)}
                              title={`${selectedRole} • ${d.label} • ${c.label}${sensible ? " (sensible)" : ""}`}
                              aria-label={`${selectedRole} ${d.label} ${c.label} ${on ? "activé" : "désactivé"}`}
                              className={cn(
                                "flex size-5 items-center justify-center rounded border transition-colors",
                                on
                                  ? sensible
                                    ? "border-amber-400 bg-amber-100 text-amber-700"
                                    : "border-primary bg-primary text-primary-foreground"
                                  : "border-border text-transparent hover:border-primary",
                              )}
                            >
                              <Check className="size-3" />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {model.domains.length === 0 && (
                <p className="py-6 text-center text-[13px] text-muted-foreground">
                  Aucun domaine de permissions disponible.
                </p>
              )}
            </div>
          </>
        )}

        {onglet === "utilisateurs" && (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {users.length === 0 && (
              <p className="py-6 text-center text-[13px] text-muted-foreground sm:col-span-2 xl:col-span-4">
                Aucun utilisateur avec le rôle {selectedRole}.
              </p>
            )}
            {users.map((m) => (
              <div key={m.id} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5">
                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold", m.avatarBg)}>
                  {m.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold">{m.nom}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{m.agency}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {onglet === "historique" && (
          <div className="mt-3 space-y-2.5">
            {PERM_HISTORIQUE.map(([texte, sub], i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs">
                <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
                <p className="min-w-0 flex-1">
                  <span className="font-bold">{texte}</span>
                  <span className="block text-[11px] text-muted-foreground">{sub}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bas */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-4 xl:col-span-2">
          <h2 className="text-[13px] font-bold">{users.length} utilisateurs concernés</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Mise à jour de l&apos;affectation</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {users.slice(0, 4).map((m) => (
              <div key={m.id} className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", m.avatarBg)}>
                  {m.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold">{m.nom}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{m.agency}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-4">
          <h2 className="text-[13px] font-bold">Nouveau rôle personnalisé</h2>
          <Label htmlFor="perm-modele" className="mt-3 mb-1.5 text-xs font-semibold">
            Modèle
          </Label>
          <div className="flex gap-2">
            <Select value={modele} onValueChange={(v) => setModele(v ?? roleCards[0]?.label ?? "Manager")}>
              <SelectTrigger id="perm-modele" className="w-full text-[13px] data-[size=default]:h-9">
                <SelectValue>
                  {roleCards.find((r) => r.label === modele)?.label ?? roleCards[0]?.label ?? "Modèle"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {roleCards.map((r) => (
                  <SelectItem key={r.label} value={r.label}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="shrink-0 gap-1 bg-secondary px-3 text-xs font-bold text-secondary-foreground hover:bg-secondary/90"
              onClick={() => {
                toast.success("Rôle dupliqué", { description: `Modèle ${modele} copié en brouillon.` });
                updatePath("/equipe/nouveau-role");
              }}
            >
              <Copy className="size-3.5" />
              Dupliquer
            </Button>
          </div>
          <div className="mt-2 space-y-1.5">
            <Label htmlFor="perm-cp" className="flex cursor-pointer items-center gap-2 text-xs font-medium">
              <Checkbox id="perm-cp" checked={copyPerms} onCheckedChange={(v) => setCopyPerms(v === true)} />
              Copier les permissions
            </Label>
            <Label htmlFor="perm-cr" className="flex cursor-pointer items-center gap-2 text-xs font-medium">
              <Checkbox id="perm-cr" checked={copyRestr} onCheckedChange={(v) => setCopyRestr(v === true)} />
              Copier les restrictions
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
