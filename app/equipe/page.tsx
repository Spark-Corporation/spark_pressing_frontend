"use client";

import { useMemo, useRef, useState } from "react";
import {
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
  ACTIVITES_EQUIPE,
  INVITATIONS_INIT,
  MEMBRES,
  ROLES,
  type Invitation,
  type Membre,
} from "./data";

const PAGE_SIZE = 6;
type Periode = "jour" | "semaine" | "mois";
type Onglet = "utilisateurs" | "invitations" | "activite" | "acces";

const kpis = [
  { label: "Utilisateurs actifs", value: "38", sub: "+4 ce mois", icon: Users, iconBg: "bg-stone-100 text-stone-500" },
  { label: "Managers", value: "6", sub: "4 multi-agences", icon: UserPlus, iconBg: "bg-amber-50 text-amber-600" },
  { label: "Invitations", value: "3", sub: "2 expirent bientôt", icon: Bell, iconBg: "bg-red-50 text-red-500" },
  { label: "Connexions aujourd'hui", value: "29", sub: "76 % de l'équipe", icon: History, iconBg: "bg-stone-100 text-stone-500" },
];

const roleBadge: Record<string, string> = {
  Admin: "bg-amber-100 text-amber-700",
  Manager: "bg-emerald-50 text-emerald-700",
  Caissier: "bg-sky-100 text-sky-700",
  Laveur: "bg-orange-100 text-orange-700",
  Classeur: "bg-slate-200/70 text-slate-600",
};

const AGENCES_INVITE = ["Cocody Angré", "Plateau Centre", "Marcory Zone 4", "Bingerville"];

export default function EquipePage() {
  const { updatePath } = useGlobalData();
  const [membres, setMembres] = useState<Membre[]>(MEMBRES);
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return membres.filter((m) => {
      if (periode === "jour" && m.daysAgo > 1) return false;
      if (periode === "semaine" && m.daysAgo > 7) return false;
      if (agency !== "all" && !m.agency.includes(agency) && m.agency !== "Toutes les agences") return false;
      if (role !== "all" && m.role !== role) return false;
      if (statut !== "all" && m.statut !== statut) return false;
      if (q && !`${m.nom} ${m.email} ${m.agency}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [membres, search, periode, agency, role, statut]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);
  const resetPage = () => setPage(1);

  const toggleInviteAgence = (a: string) =>
    setInviteAgences((l) => (l.includes(a) ? l.filter((x) => x !== a) : [...l, a]));

  const handleInvite = (direct: boolean) => {
    if (!/.+@.+\..+/.test(inviteEmail.trim())) {
      toast.error("E-mail invalide", { description: "Saisissez une adresse professionnelle valide." });
      return;
    }
    if (direct) {
      const nom = inviteEmail.split("@")[0].split(/[._-]/).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
      const initials = nom.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
      setMembres((m) => [
        ...m,
        { id: `m${Date.now()}`, initials, nom, email: inviteEmail.trim(), role: inviteRole, agency: inviteAgences[0] ?? "Bingerville", statut: "Actif", connexion: "Jamais connecté", daysAgo: 99, avatarBg: "bg-slate-200 text-slate-600" },
      ]);
      toast.success("Compte créé", { description: `${nom} • ${inviteRole}.` });
    } else {
      setInvitations((l) => [...l, { id: `i${Date.now()}`, email: inviteEmail.trim(), role: inviteRole, expires: "Expire dans 3 j" }]);
      toast.success("Invitation envoyée", { description: `${inviteEmail.trim()} • lien valable 72 h.` });
    }
    setInviteEmail("");
  };

  return (
    <div className="space-y-5">
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
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-white p-4">
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
                  {(
                    [
                      ["utilisateurs", "Utilisateurs"],
                      ["invitations", "Invitations"],
                      ["activite", "Activité récente"],
                      ["acces", "Accès multi-agence"],
                    ] as [Onglet, string][]
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
              </div>
              <Badge variant="outline" className="gap-1 border-0 bg-amber-100 text-[10px] font-bold text-amber-700">
                MFA • 66%
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
                      {["Cocody", "Plateau", "Marcory", "Bingerville", "Atelier central"].map((a) => (
                        <SelectItem key={a} value={a}>
                          {a}
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
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
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
                      <SelectItem value="Actif">Actif</SelectItem>
                      <SelectItem value="Inactif">Inactif</SelectItem>
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
                            <Badge variant="outline" className={cn("border-0 text-[10px] font-semibold", roleBadge[m.role])}>
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
                          <TableCell className="text-xs text-muted-foreground">{m.connexion}</TableCell>
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
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <Button variant="ghost" size="icon-sm" aria-label={`Actions pour ${m.nom}`} className="size-6">
                                      <MoreHorizontal className="size-4" />
                                    </Button>
                                  }
                                />
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => toast.info(m.nom, { description: `${m.email}.` })}>
                                    Voir la fiche
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setMembres((list) => list.map((x) => (x.id === m.id ? { ...x, statut: x.statut === "Actif" ? "Inactif" : "Actif" } : x)));
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
                            Aucun membre ne correspond à ces critères.
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
                {ACTIVITES_EQUIPE.map(([texte, quand], i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs">
                    <History className="size-3.5 shrink-0 text-muted-foreground" />
                    <p className="min-w-0 flex-1 truncate">{texte}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{quand}</span>
                  </div>
                ))}
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
                    {membres.slice(0, 8).map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="text-xs font-semibold">{m.nom}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(m.agency === "Toutes les agences" ? ["Toutes"] : m.agency.split(" + ")).map((a) => (
                              <Badge key={a} variant="outline" className="border-0 bg-muted text-[10px] font-semibold text-foreground">
                                {a === "Toutes" ? "Toutes les agences" : a}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Activité récente */}
          <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
            <h2 className="text-sm font-bold">Activité récente</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Dernières actions des 24 h</p>
            <div className="mt-3 space-y-2.5">
              {ACTIVITES_EQUIPE.slice(0, 4).map(([texte, quand], i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs">
                  <History className="size-3.5 shrink-0 text-muted-foreground" />
                  <p className="min-w-0 flex-1 truncate">{texte}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{quand}</span>
                </div>
              ))}
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
          <Select value={inviteRole} onValueChange={(v) => setInviteRole(v ?? "Manager")}>
            <SelectTrigger id="inv-role" className="w-full text-[13px] data-[size=default]:h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-3 mb-1.5 text-xs font-semibold">Affectation multi-agence</p>
          <div className="space-y-1.5">
            {AGENCES_INVITE.map((a) => (
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
