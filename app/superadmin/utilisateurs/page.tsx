"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
  MoreHorizontal,
  Plus,
  Search,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 6;

interface PlatformUser {
  id: number;
  name: string;
  initials: string;
  email: string;
  pressing: string;
  role: string;
  lastLogin: string;
  status: "Actif" | "Inactif" | "Suspendu";
}

const USERS: PlatformUser[] = [
  { id: 1, name: "Clarisse Mballa", initials: "CM", email: "clarisse@eclatroyal.cm", pressing: "Éclat Royal", role: "Admin pressing", lastLogin: "Il y a 3 min", status: "Actif" },
  { id: 2, name: "Yvan Tchana", initials: "YT", email: "yvan@eclatroyal.cm", pressing: "Éclat Royal", role: "Manager", lastLogin: "Il y a 18 min", status: "Actif" },
  { id: 3, name: "Nora Moussavou", initials: "NM", email: "nora@lecintredor.ga", pressing: "Le Cintre d'or", role: "Admin pressing", lastLogin: "Il y a 1 h", status: "Actif" },
  { id: 4, name: "Issa Mahamat", initials: "IM", email: "issa@maisonblanche.cm", pressing: "Maison Blanche", role: "Caissier", lastLogin: "Hier, 19:46", status: "Inactif" },
  { id: 5, name: "Solange Ewane", initials: "SE", email: "solange@eclatroyal.cm", pressing: "Éclat Royal", role: "Atelier", lastLogin: "Il y a 2 j", status: "Actif" },
  { id: 6, name: "Merveil Okemba", initials: "MO", email: "merveil@lecintredor.ga", pressing: "Le Cintre d'or", role: "Caissier", lastLogin: "12 sept. 2026", status: "Suspendu" },
];

const statusStyle: Record<PlatformUser["status"], { dot: string; bg: string }> = {
  Actif: { dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700" },
  Inactif: { dot: "bg-muted-foreground/50", bg: "bg-muted text-muted-foreground" },
  Suspendu: { dot: "bg-red-500", bg: "bg-red-50 text-red-600" },
};

const roleBadge: Record<string, string> = {
  "Admin pressing": "bg-amber-100 text-amber-700",
  Manager: "bg-blue-50 text-blue-600",
  Caissier: "bg-muted text-muted-foreground",
  Atelier: "bg-slate-100 text-slate-600",
};

const kpis = [
  { label: "Utilisateurs", value: "1 486", sub: "812 actifs aujourd’hui", subColor: "text-emerald-600", iconBg: "bg-emerald-50 text-emerald-600" },
  { label: "Admins pressing", value: "48", sub: "1 par tenant", subColor: "text-amber-600", iconBg: "bg-amber-50 text-amber-600" },
  { label: "Inactifs > 30 j", value: "62", sub: "à réactiver ou archiver", subColor: "text-amber-600", iconBg: "bg-amber-50 text-amber-600" },
  { label: "Suspendus", value: "7", sub: "2 ce mois-ci", subColor: "text-red-500", iconBg: "bg-red-50 text-red-500" },
];

export default function SuperAdminUtilisateursPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("tous");
  const [statut, setStatut] = useState("tous");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return USERS.filter((u) => {
      if (role !== "tous" && u.role !== role) return false;
      if (statut !== "tous" && u.status !== statut) return false;
      if (q && !`${u.name} ${u.email} ${u.pressing} ${u.role}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, role, statut]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">Superadministration</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Utilisateurs</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Vue transverse des comptes utilisateurs de tous les pressings hébergés.
          </p>
        </div>
        <Button size="lg" className="gap-1.5 px-3 text-xs font-bold">
          <Plus className="size-4" />
          Inviter un utilisateur
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
              <span className={cn("flex size-8 items-center justify-center rounded-lg", k.iconBg)}>
                <UserCheck className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold">{k.value}</p>
            <p className={cn("mt-1 text-[11px] font-medium", k.subColor)}>{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un nom, e-mail, pressing…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-9 bg-muted/40 pl-9 text-[13px]"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Rôle</label>
            <Select value={role} onValueChange={(v) => { setRole(v ?? "tous"); setPage(1); }}>
              <SelectTrigger className="h-9 w-[150px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les rôles</SelectItem>
                <SelectItem value="Admin pressing">Admin pressing</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Caissier">Caissier</SelectItem>
                <SelectItem value="Atelier">Atelier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Statut</label>
            <Select value={statut} onValueChange={(v) => { setStatut(v ?? "tous"); setPage(1); }}>
              <SelectTrigger className="h-9 w-[130px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous</SelectItem>
                <SelectItem value="Actif">Actif</SelectItem>
                <SelectItem value="Inactif">Inactif</SelectItem>
                <SelectItem value="Suspendu">Suspendu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
            <Download className="size-3.5" />
            Exporter
          </Button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">UTILISATEUR</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">E-MAIL</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PRESSING</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">RÔLE</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">DERNIÈRE CONNEXION</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">STATUT</TableHead>
                <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
                        {u.initials}
                      </span>
                      <span className="text-[13px] font-semibold">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="text-xs">{u.pressing}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("border-0 text-[10px] font-semibold", roleBadge[u.role] ?? "bg-muted text-muted-foreground")}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{u.lastLogin}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("gap-1 border-0 text-[10px] font-semibold", statusStyle[u.status].bg)}>
                      <span className={cn("size-1.5 rounded-full", statusStyle[u.status].dot)} />
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions pour ${u.name}`}>
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>Voir le détail</DropdownMenuItem>
                          <DropdownMenuItem>Réinitialiser le mot de passe</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive">Suspendre</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="py-10 text-center text-[13px] text-muted-foreground">
                    Aucun utilisateur ne correspond à ces critères.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            {filtered.length === 0 ? "0" : `${start + 1}–${start + rows.length}`} sur {filtered.length} utilisateurs
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs font-semibold"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
              Précédent
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === safePage ? "default" : "ghost"}
                size="icon-sm"
                onClick={() => setPage(p)}
                className="text-[11px] font-bold"
              >
                {p}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs font-semibold"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Suivant
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="flex items-center gap-2 text-xs text-amber-800">
          <Info className="size-4 shrink-0 text-amber-500" />
          Les suspensions et réinitialisations de mot de passe sont journalisées et notifiées au responsable du pressing.
        </p>
        <button className="text-xs font-bold text-amber-700 hover:underline">Voir le journal</button>
      </div>
    </div>
  );
}
