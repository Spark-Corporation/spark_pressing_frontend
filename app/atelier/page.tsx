"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  History,
  Info,
  MoreHorizontal,
  Move,
  Search,
  ShieldCheck,
  Shirt,
  SlidersHorizontal,
  StickyNote,
  Timer,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  COLONNES,
  NEXT_COLONNE,
  RESPONSABLES,
  TICKETS,
  getApercu,
  type Colonne,
  type Priorite,
  type Ticket,
} from "./data";

type Periode = "jour" | "semaine" | "mois";

const prioriteBadge: Record<Priorite, { cls: string; icon: boolean }> = {
  Urgent: { cls: "bg-red-50 text-red-600", icon: true },
  Haute: { cls: "bg-amber-50 text-amber-700", icon: false },
  Normale: { cls: "bg-muted text-muted-foreground", icon: false },
};

const prestationBadge: Record<Ticket["prestation"], string> = {
  Express: "bg-amber-100 text-amber-700",
  Classique: "bg-slate-200/70 text-slate-600",
  Repassage: "bg-sky-100 text-sky-700",
};

const colAccent: Record<Colonne, string> = {
  attente: "bg-secondary",
  cours: "bg-secondary",
  traites: "bg-emerald-500",
  classes: "bg-primary",
};

const AGENCES = ["Bingerville", "Cocody", "Riviera 3", "Plateau", "Marcory"];

export default function AtelierPage() {
  const [tickets, setTickets] = useState<Ticket[]>(TICKETS);
  const [selectedId, setSelectedId] = useState<string | null>("DEP-240928-047");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<Colonne | null>(null);
  const [search, setSearch] = useState("");
  const [periode, setPeriode] = useState<Periode>("mois");
  const [dateSel, setDateSel] = useState("all");
  const [agency, setAgency] = useState("all");
  const [prestation, setPrestation] = useState("all");
  const [responsable, setResponsable] = useState("all");
  const [compact, setCompact] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((t) => {
      if (periode === "jour" && t.daysAgo > 1) return false;
      if (periode === "semaine" && t.daysAgo > 7) return false;
      if (dateSel !== "all" && t.jour !== dateSel) return false;
      if (agency !== "all" && t.agency !== agency) return false;
      if (prestation !== "all" && t.prestation !== prestation) return false;
      if (responsable === "Non affectée") {
        if (t.responsable !== null) return false;
      } else if (responsable !== "all" && t.responsable?.nom !== responsable) {
        return false;
      }
      if (q && !`${t.id} ${t.client}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tickets, search, periode, dateSel, agency, prestation, responsable]);

  const byCol = (col: Colonne) => filtered.filter((t) => t.colonne === col);
  const selected = tickets.find((t) => t.id === selectedId) ?? null;
  const apercu = selected ? getApercu(selected) : null;
  const nextCol = selected ? NEXT_COLONNE[selected.colonne] : null;
  const nextLabel = nextCol ? COLONNES.find((c) => c.key === nextCol)?.label : null;

  const moveTicket = (id: string, col: Colonne) => {
    setTickets((list) => {
      const t = list.find((x) => x.id === id);
      if (!t || t.colonne === col) return list;
      const label = COLONNES.find((c) => c.key === col)?.label;
      toast.success(`${id} → ${label}`, { description: "Action horodatée et ajoutée au journal d'audit." });
      return list.map((x) => (x.id === id ? { ...x, colonne: col } : x));
    });
    setDragId(null);
    setDragOver(null);
  };

  return (
    <div className="space-y-4">
      {/* Configurer */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="lg"
          className="gap-1.5 px-3 text-xs font-bold"
          onClick={() => toast.info("Étapes configurables", { description: "Lavage et classement : par agence, depuis les paramètres." })}
        >
          <SlidersHorizontal className="size-4" />
          Configurer les étapes
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Code dépôt, client…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 bg-white pr-12 pl-9 text-[13px]"
          />
          <kbd className="absolute top-1/2 right-3 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
            ⌘K
          </kbd>
        </div>
        <Select value={dateSel} onValueChange={(v) => setDateSel(v ?? "all")}>
          <SelectTrigger className="w-auto bg-white text-xs data-[size=default]:h-9">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes dates</SelectItem>
            <SelectItem value="today">Aujourd&apos;hui • 28 sept.</SelectItem>
            <SelectItem value="tomorrow">Demain</SelectItem>
            <SelectItem value="week">Cette semaine</SelectItem>
          </SelectContent>
        </Select>
        <Select value={agency} onValueChange={(v) => setAgency(v ?? "all")}>
          <SelectTrigger className="w-auto bg-white text-xs data-[size=default]:h-9">
            <SelectValue placeholder="Agence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes agences</SelectItem>
            {AGENCES.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={prestation} onValueChange={(v) => setPrestation(v ?? "all")}>
          <SelectTrigger className="w-auto bg-white text-xs data-[size=default]:h-9">
            <SelectValue placeholder="Prestation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes prestations</SelectItem>
            {["Express", "Classique", "Repassage"].map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={responsable} onValueChange={(v) => setResponsable(v ?? "all")}>
          <SelectTrigger className="w-auto bg-white text-xs data-[size=default]:h-9">
            <SelectValue placeholder="Responsable" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous responsables</SelectItem>
            {RESPONSABLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Label htmlFor="atelier-compact" className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border bg-white px-3 text-xs font-semibold">
          Vue compacte
          <Switch id="atelier-compact" checked={compact} onCheckedChange={setCompact} size="sm" />
        </Label>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <span className="font-medium text-muted-foreground">Résultats :</span>
        <Tabs value={periode} onValueChange={(v) => setPeriode(v as Periode)}>
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

      {/* Capacité */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-white px-4 py-3">
        <div className="min-w-44">
          <p className="text-[13px] font-bold">Capacité atelier • 18 / 24</p>
          <p className="text-[11px] text-muted-foreground">Charge maîtrisée • 6 créneaux libres</p>
        </div>
        <div className="h-1.5 min-w-40 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-secondary" style={{ width: "75%" }} />
        </div>
        <span className="text-[13px] font-extrabold text-secondary">75 %</span>
        <p className="flex items-center gap-1.5 border-l border-border pl-4 text-[11px] text-muted-foreground">
          <Info className="size-3.5 shrink-0" />
          Les étapes lavage et classer sont configurables par agence.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        {/* Kanban */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
          {COLONNES.map((col) => {
            const list = byCol(col.key);
            return (
              <div
                key={col.key}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(col.key);
                }}
                onDragLeave={() => setDragOver((d) => (d === col.key ? null : d))}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragId) moveTicket(dragId, col.key);
                }}
                className={cn(
                  "flex flex-col gap-2.5 rounded-2xl border border-border bg-white/60 p-2.5",
                  dragOver === col.key && "border-primary bg-primary/5",
                )}
              >
                <div className="flex items-center gap-2 px-1 pt-1">
                  <span className={cn("h-5 w-1 rounded-full", colAccent[col.key])} />
                  <p className="flex-1 text-[13px] font-bold">{col.label}</p>
                  <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-muted-foreground">
                    {list.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 px-1">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full", col.bar)} style={{ width: col.fill }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{col.sub}</span>
                </div>

                {list.map((t) => {
                  const pb = prioriteBadge[t.priorite];
                  const isSel = selectedId === t.id;
                  return (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={() => setDragId(t.id)}
                      onDragEnd={() => {
                        setDragId(null);
                        setDragOver(null);
                      }}
                      onClick={() => setSelectedId(t.id)}
                      className={cn(
                        "cursor-grab rounded-xl border border-border bg-white p-3 active:cursor-grabbing",
                        isSel && "border-secondary ring-1 ring-secondary",
                        dragId === t.id && "opacity-50",
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <p className="flex-1 truncate text-xs font-bold">{t.id}</p>
                        <Badge variant="outline" className={cn("gap-0.5 border-0 px-1.5 text-[10px] font-bold", pb.cls)}>
                          {pb.icon && <TriangleAlert className="size-3" />}
                          {t.priorite}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Actions pour ${t.id}`}
                                className="-mr-1 size-6"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => setSelectedId(t.id)}>Voir l&apos;aperçu</DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const next = NEXT_COLONNE[t.colonne];
                                if (next) moveTicket(t.id, next);
                                else toast.info("Dépôt classé", { description: "Ce ticket est à sa dernière étape." });
                              }}
                            >
                              Avancer l&apos;étape
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success("Ticket envoyé à l'impression")}>
                              Imprimer le ticket
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="mt-1 truncate text-[13px] font-bold">{t.client}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Badge variant="outline" className={cn("border-0 px-1.5 text-[10px] font-semibold", prestationBadge[t.prestation])}>
                          {t.prestation}
                        </Badge>
                        • {t.volume}
                      </p>
                      {!compact && (
                        <>
                          <div className="mt-2 space-y-1 border-t border-border pt-2 text-[11px] text-muted-foreground">
                            <p className="flex items-center gap-1.5">
                              <Calendar className="size-3.5 shrink-0" />
                              {t.echeance}
                            </p>
                            <p className="flex items-center gap-1.5">
                              <Timer className="size-3.5 shrink-0" />
                              {t.elapsed}
                            </p>
                            {t.retard && (
                              <p className="flex items-center gap-1.5 font-bold text-red-600">
                                <TriangleAlert className="size-3.5 shrink-0" />
                                {t.retard}
                              </p>
                            )}
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-1 border-t border-border pt-2 text-[11px]">
                            <span className="flex min-w-0 items-center gap-1 text-muted-foreground">
                              <CheckCircle2 className="size-3.5 shrink-0" />
                              <span className="truncate">{t.taches ?? t.etape}</span>
                            </span>
                            {t.responsable ? (
                              <span className="flex shrink-0 items-center gap-1 font-semibold">
                                <span className={cn("flex size-5 items-center justify-center rounded-full text-[8px] font-bold", t.responsable.bg)}>
                                  {t.responsable.initials}
                                </span>
                                <span className="max-w-20 truncate">{t.responsable.nom}</span>
                              </span>
                            ) : (
                              <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
                                <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[8px] font-bold">—</span>
                                Non affectée
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                {list.length === 0 && (
                  <p className="rounded-xl border border-dashed border-border p-4 text-center text-[11px] text-muted-foreground">
                    Aucun dépôt ici.
                  </p>
                )}

                <div className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-[11px] text-muted-foreground">
                  <Move className="size-3.5" />
                  Glisser un dépôt ici
                </div>
              </div>
            );
          })}
        </div>

        {/* Aperçu */}
        <div>
          {selected && apercu ? (
            <div className="space-y-0 overflow-hidden rounded-2xl border border-border xl:sticky xl:top-20">
              <div className="bg-primary p-4 text-white">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold tracking-[0.12em] text-white/70">APERÇU DU DÉPÔT</p>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Fermer l'aperçu"
                    onClick={() => setSelectedId(null)}
                    className="size-6 text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-lg font-extrabold">{selected.id}</p>
                  {selected.priorite === "Urgent" && (
                    <Badge className="gap-1 border-0 bg-red-500 text-[10px] font-bold text-white">
                      <TriangleAlert className="size-3" />
                      Urgent
                    </Badge>
                  )}
                </div>
                <p className="text-[13px] font-semibold">{selected.client}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-white/80">
                  <Badge variant="outline" className={cn("border-0 px-1.5 text-[10px] font-semibold", prestationBadge[selected.prestation])}>
                    {selected.prestation}
                  </Badge>
                  {selected.volume} • retrait {selected.echeance.split("•")[1]?.trim() ?? ""}
                </p>
                {selected.retard && (
                  <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-bold">
                    <TriangleAlert className="size-3.5 shrink-0 text-secondary" />
                    {selected.retard} • prévenir le comptoir
                  </p>
                )}
              </div>

              <div className="space-y-4 bg-white p-4">
                <div>
                  <p className="flex items-center justify-between text-[13px] font-bold">
                    <span className="flex items-center gap-1.5">
                      <Shirt className="size-4 text-muted-foreground" />
                      Articles
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground">{apercu.totalArticles}</span>
                  </p>
                  <div className="mt-2 divide-y divide-border rounded-lg border border-border">
                    {apercu.articles.map((a, i) => (
                      <div key={i} className="flex items-center gap-2.5 px-3 py-2">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-bold">
                          {a.qte}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold">{a.label}</p>
                          <p className="truncate text-[11px] text-muted-foreground">{a.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="flex items-center gap-1.5 text-[13px] font-bold">
                    <StickyNote className="size-4 text-muted-foreground" />
                    Remarques
                  </p>
                  <p className="mt-2 rounded-lg bg-amber-50 p-2.5 text-[11px] leading-snug text-amber-900 ring-1 ring-amber-100">
                    {apercu.remarques}
                  </p>
                </div>

                <div>
                  <p className="flex items-center justify-between text-[13px] font-bold">
                    <span className="flex items-center gap-1.5">
                      <Users className="size-4 text-muted-foreground" />
                      Responsables
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-[11px] font-semibold text-muted-foreground"
                      onClick={() => toast.info("Responsables", { description: "Affectation depuis l'équipe d'astreinte." })}
                    >
                      Modifier
                    </Button>
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {[
                      ["Laveur", apercu.laveur],
                      ["Classeur", apercu.classeur],
                    ].map(([role, r]) => (
                      <div key={role as string} className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                        <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", (r as { bg: string }).bg)}>
                          {(r as { initials: string }).initials}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground">{role as string}</p>
                          <p className="truncate text-xs font-bold">{(r as { nom: string }).nom}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="flex items-center justify-between text-[13px] font-bold">
                    <span className="flex items-center gap-1.5">
                      <History className="size-4 text-muted-foreground" />
                      Chronologie
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground">Traçabilité complète</span>
                  </p>
                  <div className="mt-2">
                    {apercu.chrono.map((c, i) => (
                      <div key={i} className="relative flex gap-2.5 pb-3 last:pb-0">
                        {i < apercu.chrono.length - 1 && <span className="absolute top-4 left-[3px] h-[calc(100%-0.75rem)] w-px bg-border" />}
                        <span className="z-10 mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold">{c.title}</p>
                          <p className="text-[11px] text-muted-foreground">{c.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {nextLabel ? (
                  <Button size="lg" className="w-full justify-between text-xs font-bold" onClick={() => moveTicket(selected.id, nextCol!)}>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="size-4" />
                      Passer à « {nextLabel} »
                    </span>
                    <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button size="lg" variant="outline" disabled className="w-full text-xs font-bold">
                    Dépôt classé
                  </Button>
                )}
                <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                  <ShieldCheck className="size-3.5" />
                  Action horodatée et ajoutée au journal d&apos;audit
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center text-xs text-muted-foreground xl:sticky xl:top-20">
              Sélectionnez un dépôt pour voir son aperçu.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
