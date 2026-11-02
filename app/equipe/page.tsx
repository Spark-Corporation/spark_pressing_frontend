"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Check,
  Download,
  History,
  MoreHorizontal,
  Pencil,
  Phone,
  Search,
  ShieldCheck,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useGlobalData } from "@/contexts/GlobalContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  getTeamOverviewAction,
  getTeamUsersAction,
} from "@/actions/AdminAction";
import { handleApiAction } from "@/functions/handleResponseApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  INVITATIONS_INIT,
  ROLES,
  type Invitation,
} from "./data";
import type {
  TeamActivityItem,
  TeamFilterOption,
  TeamOverviewData,
  TeamUser,
  TeamUsersParams,
} from "./types";

const PAGE_SIZE = 6;
type Periode = "jour" | "semaine" | "mois";
type Onglet = "utilisateurs" | "invitations" | "activite" | "acces";

const AGENCES_INVITE = ["Cocody Angré", "Plateau Centre", "Marcory Zone 4", "Bingerville"];

const roleBadge: Record<string, string> = {
  Admin: "bg-amber-100 text-amber-700",
  Manager: "bg-emerald-50 text-emerald-700",
  Caissier: "bg-sky-100 text-sky-700",
  Laveur: "bg-orange-100 text-orange-700",
  Classeur: "bg-slate-200/70 text-slate-600",
  "—": "bg-muted text-muted-foreground",
};

const AVATAR_BGS = [
  "bg-amber-100 text-amber-700",
  "bg-slate-200 text-slate-600",
  "bg-stone-200 text-stone-600",
  "bg-orange-100 text-orange-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
];

/** Lit la valeur d'identification d'une option de filtre API. */
const optionKey = (o: TeamFilterOption, i: number): string =>
  typeof o === "string"
    ? o
    : String(o.value ?? o.code ?? o.id ?? o.key ?? o.name ?? o.label ?? `opt-${i}`);

/** Lit le libellé affichable d'une option de filtre API. */
const optionLabel = (o: TeamFilterOption, i: number): string =>
  typeof o === "string" ? o : String(o.label ?? o.name ?? o.value ?? o.code ?? optionKey(o, i));

const activityText = (a: TeamActivityItem): string =>
  String(a.description ?? a.message ?? a.action ?? a.label ?? a.actor ?? a.user ?? "Activité");

const activityTime = (a: TeamActivityItem): string =>
  String(a.time ?? a.at ?? a.when ?? a.ago ?? "");

const initialsFor = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??";

const KPI_META = [
  { key: "active_users", label: "Utilisateurs actifs", icon: Users, iconBg: "bg-stone-100 text-stone-500" },
  { key: "managers", label: "Managers", icon: UserPlus, iconBg: "bg-amber-50 text-amber-600" },
  { key: "invitations", label: "Invitations", icon: Bell, iconBg: "bg-red-50 text-red-500" },
  { key: "connections_today", label: "Connexions aujourd'hui", icon: History, iconBg: "bg-stone-100 text-stone-500" },
] as const;

/** Onglets locaux ; apiCodes relie le code renvoyé par l'API à l'onglet affiché. */
const TAB_CODES: { onglet: Onglet; fallbackLabel: string; apiCodes: string[] }[] = [
  { onglet: "utilisateurs", fallbackLabel: "Utilisateurs", apiCodes: ["users"] },
  { onglet: "invitations", fallbackLabel: "Invitations", apiCodes: ["invitations"] },
  { onglet: "activite", fallbackLabel: "Activité récente", apiCodes: ["activite", "activity", "recent_activity"] },
  { onglet: "acces", fallbackLabel: "Accès multi-agence", apiCodes: ["acces", "access", "multi_agency"] },
];

interface Row {
  id: number;
  initials: string;
  avatarBg: string;
  nom: string;
  email: string;
  phone: string | null;
  role: string;
  rolesLower: string[];
  agencyId: number | null;
  agency: string;
  statut: "Actif" | "Inactif";
  actif: boolean;
}

export default function EquipePage() {
  const { updatePath, setProfileUser } = useGlobalData();
  const { logout } = useAuth();

  // ------------------------- Données API -------------------------
  const [data, setData] = useState<TeamOverviewData | null>(null);
  const [loading, setLoadingState] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  const loadOverview = useCallback(() => {
    void handleApiAction({
      action: getTeamOverviewAction,
      setLoading: setLoadingState,
      showErrorToast: false,
      logout,
      onSuccess: (res) => {
        setData(res as TeamOverviewData);
        setLoadError(null);
      },
      onError: setLoadError,
    });
  }, [logout]);

  const loadUsers = useCallback(() => {
    void handleApiAction({
      action: (p?: TeamUsersParams) => getTeamUsersAction(p),
      params: { page: 1, per_page: 200 } as TeamUsersParams,
      setLoading: setLoadingUsers,
      showErrorToast: false,
      logout,
      onSuccess: (res) => {
        setUsers(res.data);
        setUsersError(null);
      },
      onError: setUsersError,
    });
  }, [logout]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ------------------------- Filtres depuis l'API -------------------------
  const agencyItems = useMemo<{ value: string; label: string }[]>(
    () =>
      (data?.filters?.agencies ?? []).map((o, i) => ({
        value:
          typeof o === "string"
            ? o
            : String(o.id ?? o.value ?? o.code ?? o.key ?? o.name ?? o.label ?? `opt-${i}`),
        label: optionLabel(o, i),
      })),
    [data],
  );

  const roleItems = useMemo<{ value: string; label: string }[]>(
    () =>
      data?.filters?.roles?.length
        ? data.filters.roles.map((o, i) => ({
            value:
              typeof o === "string"
                ? o
                : String(o.code ?? o.value ?? o.key ?? o.id ?? o.name ?? o.label ?? `opt-${i}`),
            label: optionLabel(o, i),
          }))
        : ROLES.map((r) => ({ value: r, label: r })),
    [data],
  );

  const statutItems = useMemo<{ value: string; label: string }[]>(
    () =>
      data?.filters?.statuses?.length
        ? data.filters.statuses.map((o, i) => ({ value: optionKey(o, i), label: optionLabel(o, i) }))
        : [
            { value: "Actif", label: "Actif" },
            { value: "Inactif", label: "Inactif" },
          ],
    [data],
  );

  /** id d'agence -> libellé réel (ex. 1 -> "Cocody Angré"). */
  const agencyLabels = useMemo(() => {
    const map = new Map<string, string>();
    (data?.filters?.agencies ?? []).forEach((o) => {
      if (typeof o !== "string") {
        const label = o.name ?? o.label;
        if (label) {
          [o.id, o.value, o.code, o.key].forEach((key) => {
            if (key != null) map.set(String(key), String(label));
          });
        }
      }
    });
    return map;
  }, [data]);

  /** code de rôle (ex. "caissier") -> libellé réel (ex. "Caissier"). */
  const roleLabels = useMemo(() => {
    const map = new Map<string, string>();
    (data?.filters?.roles ?? []).forEach((o, i) => {
      if (typeof o !== "string") {
        const k = String(o.code ?? o.value ?? o.key ?? o.id ?? "").toLowerCase();
        const l = optionLabel(o, i);
        if (k && l) map.set(k, l);
      }
    });
    return map;
  }, [data]);

  const roleLabelFor = useCallback(
    (code: string) =>
      roleLabels.get(code.toLowerCase()) ??
      (code ? code.charAt(0).toUpperCase() + code.slice(1) : "—"),
    [roleLabels],
  );

  // ------------------------- Onglets -------------------------
  const tabItems = useMemo(() => {
    const base = TAB_CODES.map((t) => {
      const api = data?.tabs?.find((x) => t.apiCodes.includes(x.code));
      return { onglet: t.onglet as Onglet | null, label: api?.label ?? t.fallbackLabel, count: api?.count };
    });
    (data?.tabs ?? []).forEach((t) => {
      if (!TAB_CODES.some((b) => b.apiCodes.includes(t.code))) {
        base.push({ onglet: null, label: t.label, count: t.count });
      }
    });
    return base;
  }, [data]);

  // ------------------------- KPIs -------------------------
  const kpiCards = useMemo(() => {
    const kpisData = data?.kpis;
    return KPI_META.map((k) => {
      if (loading) return { ...k, value: "Chargement…", sub: " " };
      let value = "—";
      let sub = loadError ? "Données indisponibles" : " ";
      if (kpisData) {
        switch (k.key) {
          case "active_users": {
            const d = kpisData.active_users;
            value = String(d?.value ?? "—");
            sub = d?.new_this_month ? `+${d.new_this_month} ce mois` : "—";
            break;
          }
          case "managers": {
            const d = kpisData.managers;
            value = String(d?.value ?? "—");
            sub = d?.multi_agency
              ? `${d.multi_agency} multi-agence${d.multi_agency > 1 ? "s" : ""}`
              : "—";
            break;
          }
          case "invitations": {
            const d = kpisData.invitations;
            value = String(d?.value ?? "—");
            sub = `${d?.expiring_soon ?? 0} expirent bientôt`;
            break;
          }
          case "connections_today": {
            const d = kpisData.connections_today;
            value = String(d?.value ?? "—");
            sub = `${d?.team_percent ?? 0} % de l'équipe`;
            break;
          }
        }
      }
      return { ...k, value, sub };
    });
  }, [data, loading, loadError]);

  // ------------------------- Activité récente -------------------------
  const activites = useMemo<[string, string][]>(() => {
    const items = data?.recent_activity ?? [];
    return items.map((a) => [activityText(a), activityTime(a)]);
  }, [data]);

  // ============================================================
  // Annuaire : lignes construites depuis GET /team/users
  // ============================================================
  const rowsAll = useMemo<Row[]>(
    () =>
      users.map((u, idx) => {
        return {
          id: u.id,
          initials: initialsFor(u.fullname ?? ""),
          avatarBg: AVATAR_BGS[Number(u.id) % AVATAR_BGS.length] ?? AVATAR_BGS[idx % AVATAR_BGS.length],
          nom: u.fullname ?? "Sans nom",
          email: u.email ?? "—",
          phone: u.phone_number,
          role: u.roles?.length ? roleLabelFor(u.roles[0]) : "—",
          rolesLower: (u.roles ?? []).map((r) => r.toLowerCase()),
          agencyId: u.agency_id,
          agency:
            u.agency_id != null
              ? agencyLabels.get(String(u.agency_id)) ?? `Agence ${u.agency_id}`
              : "Toutes les agences",
          statut: u.status ? "Actif" : "Inactif",
          actif: Boolean(u.status),
        };
      }),
    [users, agencyLabels, roleLabelFor],
  );

  // ------------------------- État local UI -------------------------
  const [invitations, setInvitations] = useState<Invitation[]>(INVITATIONS_INIT);
  const [onglet, setOnglet] = useState<Onglet>("utilisateurs");
  const [search, setSearch] = useState("");
  const [periode, setPeriode] = useState<Periode>("mois");
  const [agency, setAgency] = useState("all");
  const [role, setRole] = useState("all");
  const [statut, setStatut] = useState("all");
  const [page, setPage] = useState(1);
  const [inviteEmail, setInviteEmail] = useState("mariam.traore@spark.ci");
  const [inviteRole, setInviteRole] = useState("Manager");
  const [inviteAgences, setInviteAgences] = useState<string[]>(["Cocody Angré", "Plateau Centre"]);
  const [inviteMfa, setInviteMfa] = useState(false);
  const inviteRef = useRef<HTMLDivElement>(null);

  const inviteRoleOption =
    roleItems.find((r) => r.value === inviteRole) ??
    roleItems.find((r) => r.value.toLowerCase() === "manager" || r.label.toLowerCase() === "manager") ??
    roleItems[0];
  const selectedInviteRole = inviteRoleOption?.value ?? inviteRole;
  const selectedInviteRoleLabel = inviteRoleOption?.label ?? selectedInviteRole;

  // Le endpoint ne documente pas les filtres : filtrage appliqué côté client,
  // avec les valeurs réelles renvoyées par /team/overview.filters.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rowsAll.filter((m) => {
      if (agency !== "all" && String(m.agencyId) !== agency && m.agency !== agency) return false;
      if (role !== "all" && !m.rolesLower.includes(role.toLowerCase()) && m.role !== role) return false;
      if (statut !== "all") {
        const s = statut.toLowerCase();
        const expected = s.startsWith("in") ? false : s.startsWith("act") ? true : null;
        if (expected !== null && m.actif !== expected) return false;
        if (expected === null && m.statut.toLowerCase() !== s) return false;
      }
      if (q && !`${m.nom} ${m.email} ${m.agency}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rowsAll, search, agency, role, statut]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);
  const resetPage = () => setPage(1);

  const toggleInviteAgence = (a: string) =>
    setInviteAgences((l) => (l.includes(a) ? l.filter((x) => x !== a) : [...l, a]));

  const agenciesForInvite: string[] = agencyItems.length
    ? agencyItems.map((a) => a.label)
    : AGENCES_INVITE;

  const handleInvite = (direct: boolean) => {
    if (!/.+@.+\..+/.test(inviteEmail.trim())) {
      toast.error("E-mail invalide", { description: "Saisissez une adresse professionnelle valide." });
      return;
    }
    if (direct) {
      const nom = inviteEmail.split("@")[0].split(/[._-]/).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
      setUsers((l) => [
        ...l,
        {
          id: Date.now(),
          fullname: nom,
          email: inviteEmail.trim(),
          phone_number: null,
          pressing_id: null,
          agency_id: null,
          status: true,
          roles: [selectedInviteRole.toLowerCase() || "caissier"],
        },
      ]);
      toast.success("Compte créé", { description: `${nom} • ${selectedInviteRoleLabel}.` });
    } else {
      setInvitations((l) => [...l, { id: `i${Date.now()}`, email: inviteEmail.trim(), role: selectedInviteRoleLabel, expires: "Expire dans 3 j" }]);
      toast.success("Invitation envoyée", { description: `${inviteEmail.trim()} • lien valable 72 h.` });
    }
    setInviteEmail("");
  };

  return (
    <div className="space-y-5">
      {loadError && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          <AlertTriangle className="size-4 shrink-0" />
          <p className="flex-1">{loadError}</p>
          <Button size="sm" variant="outline" className="text-[11px] font-bold" onClick={loadOverview}>
            Réessayer
          </Button>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-xl text-[13px] text-muted-foreground">
          Gérez les membres, leurs rôles et leurs affectations aux agences.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => updatePath("/equipe/permissions")}
          >
            <ShieldCheck className="size-4" />
            Rôles et permissions
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.info("Import", { description: "Importez des membres depuis un fichier CSV." })}
          >
            <Download className="size-3.5" />
            Importer
          </Button>
          <Button
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => inviteRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
          >
            <User className="size-4" />
            Inviter
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((k) => (
          <div key={k.key} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
              <span className={cn("flex size-8 items-center justify-center rounded-lg", k.iconBg)}>
                <k.icon className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-xl font-extrabold tracking-tight">{k.value}</p>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {/* Annuaire */}
          <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Annuaire de l&apos;équipe</h2>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {tabItems.map((t) => (
                    <Button
                      key={t.label}
                      variant={t.onglet === onglet ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        if (t.onglet) {
                          setOnglet(t.onglet);
                        } else {
                          toast.info("Prochainement", {
                            description: `L'onglet « ${t.label} » sera disponible prochainement.`,
                          });
                        }
                      }}
                      className="h-7 rounded-full px-3 text-[11px] font-bold"
                    >
                      {t.label}
                      {t.count !== undefined && (
                        <span
                          className={cn(
                            "ml-1 text-[10px] font-semibold",
                            t.onglet === onglet ? "opacity-70" : "text-muted-foreground",
                          )}
                        >
                          {t.count}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
              <Badge variant="outline" className="gap-1 border-0 bg-amber-100 text-[10px] font-bold text-amber-700">
                MFA • {data ? `${data.mfa.percent}%` : "…"}
              </Badge>
            </div>

            {onglet === "utilisateurs" && (
              <>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div className="relative min-w-52 flex-1">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Nom, e-mail ou agence…"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        resetPage();
                      }}
                      className="h-9 bg-muted/40 pl-9 text-[13px]"
                    />
                  </div>
                  <Select value={agency} onValueChange={(v) => { setAgency(v ?? "all"); resetPage(); }}>
                    <SelectTrigger className="w-auto text-xs data-[size=default]:h-9">
                      <SelectValue placeholder="Agence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les agences</SelectItem>
                      {agencyItems.map((a) => (
                        <SelectItem key={a.value} value={a.value}>
                          {a.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={role} onValueChange={(v) => { setRole(v ?? "all"); resetPage(); }}>
                    <SelectTrigger className="w-auto text-xs data-[size=default]:h-9">
                      <SelectValue placeholder="Rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les rôles</SelectItem>
                      {roleItems.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statut} onValueChange={(v) => { setStatut(v ?? "all"); resetPage(); }}>
                    <SelectTrigger className="w-auto text-xs data-[size=default]:h-9">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      {statutItems.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                  <span className="font-medium text-muted-foreground">Résultats :</span>
                  <Tabs
                    value={periode}
                    onValueChange={(v) => {
                      setPeriode(v as Periode);
                      resetPage();
                    }}
                  >
                    <TabsList className="h-7">
                      <TabsTrigger value="jour" className="px-3 text-[11px]">
                        Jour
                      </TabsTrigger>
                      <TabsTrigger value="semaine" className="px-3 text-[11px]">
                        Semaine
                      </TabsTrigger>
                      <TabsTrigger value="mois" className="px-3 text-[11px]">
                        Mois
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="mt-3">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        {["UTILISATEUR", "RÔLE", "AGENCE", "STATUT", "DERNIÈRE CONNEXION"].map((h) => (
                          <TableHead key={h} className="text-[10px] font-bold tracking-wide text-muted-foreground">
                            {h}
                          </TableHead>
                        ))}
                        <TableHead className="w-20 text-[10px] font-bold tracking-wide text-muted-foreground">ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", m.avatarBg)}>
                                {m.initials}
                              </span>
                              <span>
                                <span className="block text-[13px] font-semibold">{m.nom}</span>
                                <span className="block text-[11px] text-muted-foreground">{m.email}</span>
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("border-0 text-[10px] font-semibold", roleBadge[m.role] ?? "bg-muted text-muted-foreground")}>
                              {m.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{m.agency}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "gap-1 border-0 text-[10px] font-semibold",
                                m.statut === "Actif" ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground",
                              )}
                            >
                              <span className={cn("size-1.5 rounded-full", m.statut === "Actif" ? "bg-emerald-500" : "bg-muted-foreground/50")} />
                              {m.statut}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            —
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Modifier ${m.nom}`}
                                className="size-6"
                                onClick={() => toast.info(m.nom, { description: `${m.role} • ${m.agency}.` })}
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                title="Profil et sécurité"
                                aria-label={`Profil et sécurité de ${m.nom}`}
                                className="size-6"
                                onClick={() => {
                                  setProfileUser({ nom: m.nom, email: m.email, role: m.role, agency: m.agency });
                                  updatePath("/parametres/profil");
                                }}
                              >
                                <ShieldCheck className="size-3.5" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <Button variant="ghost" size="icon-sm" aria-label={`Actions pour ${m.nom}`} className="size-6">
                                      <MoreHorizontal className="size-4" />
                                    </Button>
                                  }
                                />
                                <DropdownMenuContent align="end" className="w-48">
                                  {(m.email !== "—" || m.phone) && (
                                    <DropdownMenuItem onClick={() => toast.info(m.nom, { description: `${m.email !== "—" ? m.email : m.phone ?? ""}.` })}>
                                      Voir la fiche
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setUsers((list) =>
                                        list.map((x) => (x.id === m.id ? { ...x, status: !x.status } : x)),
                                      );
                                      toast.success(m.statut === "Actif" ? "Compte désactivé" : "Compte réactivé", { description: m.nom });
                                    }}
                                  >
                                    {m.statut === "Actif" ? "Désactiver" : "Réactiver"}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {rows.length === 0 && (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={6} className="py-10 text-center text-[13px] text-muted-foreground">
                            {loadingUsers ? "Chargement des utilisateurs…" : usersError ?? "Aucun membre ne correspond à ces critères."}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] text-muted-foreground">
                    {filtered.length === 0 ? "0" : `${start + 1}–${start + rows.length}`} sur {filtered.length} résultats
                  </p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Button
                        key={p}
                        variant={p === safePage ? "default" : "outline"}
                        size="icon-sm"
                        onClick={() => setPage(p)}
                        className="text-[11px] font-bold"
                      >
                        {p}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {onglet === "invitations" && (
              <div className="mt-3 space-y-2">
                {invitations.map((inv) => (
                  <div key={inv.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2.5 text-xs">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{inv.email}</p>
                      <p className="text-[11px] text-muted-foreground">{inv.role} • {inv.expires}</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-6 px-2 text-[11px] font-bold" onClick={() => toast.success("Invitation renvoyée", { description: inv.email })}>
                      Renvoyer
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] font-bold text-red-600" onClick={() => { setInvitations((l) => l.filter((x) => x.id !== inv.id)); toast.info("Invitation révoquée", { description: inv.email }); }}>
                      Révoquer
                    </Button>
                  </div>
                ))}
                {invitations.length === 0 && <p className="py-6 text-center text-[13px] text-muted-foreground">Aucune invitation en attente.</p>}
              </div>
            )}

            {onglet === "activite" && (
              <div className="mt-3 space-y-2.5">
                {activites.map(([texte, quand], i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs">
                    <History className="size-3.5 shrink-0 text-muted-foreground" />
                    <p className="min-w-0 flex-1 truncate">{texte}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{quand}</span>
                  </div>
                ))}
                {activites.length === 0 && (
                  <p className="py-6 text-center text-[13px] text-muted-foreground">
                    Aucune activité récente.
                  </p>
                )}
              </div>
            )}

            {onglet === "acces" && (
              <div className="mt-3">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">UTILISATEUR</TableHead>
                      <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">AGENCES AUTORISÉES</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rowsAll.slice(0, 8).map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="text-xs font-semibold">{m.nom}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="border-0 bg-muted text-[10px] font-semibold text-foreground">
                              {m.agency}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {rowsAll.length === 0 && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={2} className="py-10 text-center text-[13px] text-muted-foreground">
                          {loadingUsers ? "Chargement des utilisateurs…" : usersError ?? "Aucun utilisateur."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Activité récente */}
          <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
            <h2 className="text-sm font-bold">Activité sensible</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Dernières actions des 24 h</p>
            <div className="mt-3 space-y-2.5">
              {activites.slice(0, 4).map(([texte, quand], i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs">
                  <History className="size-3.5 shrink-0 text-muted-foreground" />
                  <p className="min-w-0 flex-1 truncate">{texte}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{quand}</span>
                </div>
              ))}
              {activites.length === 0 && (
                <p className="py-4 text-center text-[13px] text-muted-foreground">
                  Aucune activité sensible sur les dernières 24 h.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Invitation */}
        <div ref={inviteRef} className="h-fit rounded-xl border border-border bg-white p-4 sm:p-5 xl:sticky xl:top-20">
          <h2 className="text-sm font-bold">Inviter un membre</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Lien valable 72 heures</p>
          <Label htmlFor="inv-email" className="mt-3 mb-1.5 text-xs font-semibold">
            E-mail
          </Label>
          <Input id="inv-email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="mariam.traore@spark.ci" className="h-9 text-[13px]" />
          <Label htmlFor="inv-role" className="mt-3 mb-1.5 text-xs font-semibold">
            Rôle
          </Label>
          <Select value={selectedInviteRole} onValueChange={(v) => setInviteRole(v ?? "Manager")}>
            <SelectTrigger id="inv-role" className="w-full text-[13px] data-[size=default]:h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roleItems.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-3 mb-1.5 text-xs font-semibold">Affectation multi-agence</p>
          <div className="space-y-1.5">
            {agenciesForInvite.map((a) => (
              <Label key={a} htmlFor={`inv-${a}`} className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                <Checkbox id={`inv-${a}`} checked={inviteAgences.includes(a)} onCheckedChange={() => toggleInviteAgence(a)} />
                {a}
              </Label>
            ))}
            <Label htmlFor="inv-mfa" className="flex cursor-pointer items-center gap-2 text-xs font-medium">
              <Checkbox id="inv-mfa" checked={inviteMfa} onCheckedChange={(v) => setInviteMfa(v === true)} />
              Exiger l&apos;authentification renforcée
            </Label>
          </div>
          <p className="mt-3 rounded-lg bg-amber-50 p-2.5 text-[11px] leading-snug text-amber-800 ring-1 ring-amber-100">
            <span className="font-bold">2 permissions sensibles</span>
            <br />
            Clôture de caisse et remises supérieures à 10%.
          </p>
          <Button size="lg" className="mt-3 w-full justify-center gap-1.5 text-xs font-bold" onClick={() => handleInvite(false)}>
            <Phone className="size-4" />
            Envoyer l&apos;invitation
          </Button>
          <Button variant="outline" size="lg" className="mt-2 w-full justify-center gap-1.5 text-xs font-bold" onClick={() => handleInvite(true)}>
            <Check className="size-4" />
            Créer sans invitation
          </Button>
        </div>
      </div>
    </div>
  );
}
