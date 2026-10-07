"use client";

import { useState } from "react";
import {
  Archive,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Check,
  CircleAlert,
  Clock,
  History,
  Info,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  PackagePlus,
  Pencil,
  Phone,
  Gem,
  ShoppingBag,
  Shirt,
  Sparkles,
  SprayCan,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Client } from "../data";
import type { ClientDetail, ClientNote, PointEvent } from "./detail";

const CONVERT_OPTIONS = [500, 1000, 2000];
const CANAUX = ["WhatsApp", "Appel", "SMS", "E-mail"];

export default function ClientDetailView({ client, detail }: { client: Client; detail: ClientDetail }) {
  const router = useRouter();
  const { updatePath } = useGlobalData();

  const [points, setPoints] = useState(detail.points);
  const [events, setEvents] = useState<PointEvent[]>(detail.pointEvents);
  const [notes, setNotes] = useState<ClientNote[]>(detail.notes);
  const [prefs, setPrefs] = useState(detail.prefs);
  const [noteOpen, setNoteOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [convertAmount, setConvertAmount] = useState("500");
  const [draftPrefs, setDraftPrefs] = useState(detail.prefs);

  const pointValue = `${(points * 5).toLocaleString("fr-FR").replace(/,/g, " ")} FCFA`;

  const todayLabel = () =>
    new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

  const handleAddNote = () => {
    if (noteText.trim() === "") {
      toast.error("Note vide", { description: "Rédigez la note avant de l'enregistrer." });
      return;
    }
    setNotes((n) => [{ text: noteText.trim(), author: "Aïcha Koné", date: todayLabel() }, ...n]);
    setNoteText("");
    setNoteOpen(false);
    toast.success("Note ajoutée", { description: "Elle est visible par les équipes." });
  };

  const handleConvert = () => {
    const amount = Number(convertAmount);
    if (amount > points) {
      toast.error("Points insuffisants", { description: "Choisissez un montant inférieur au solde." });
      return;
    }
    setPoints((p) => p - amount);
    setEvents((e) => [{ label: "Remise fidélité", date: todayLabel(), ref: "CMD-CONV", delta: -amount }, ...e]);
    setConvertOpen(false);
    toast.success("Remise créée", {
      description: `${amount} pts convertis en ${(amount * 5).toLocaleString("fr-FR").replace(/,/g, " ")} FCFA de remise.`,
    });
  };

  const handleSavePrefs = () => {
    setPrefs(draftPrefs);
    setPrefsOpen(false);
    toast.success("Préférences mises à jour");
  };

  const handleArchive = () => {
    setArchiveOpen(false);
    toast.info("Client archivé", { description: "L'historique reste accessible en lecture seule." });
    updatePath("/clients");
  };

  return (
    <div className="space-y-5">
      {/* En-tête identité */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Retour aux clients"
          onClick={() => router.back()}
          className="mt-1 bg-primary text-white hover:bg-primary/90 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-xl font-extrabold text-amber-800">
          {client.initials}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl">
            {client.prenoms} {client.nom}
            <Badge variant="outline" className="gap-1 border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Active
            </Badge>
            <Badge variant="outline" className="border-0 bg-amber-100 text-[10px] font-bold text-amber-700">
              Niveau {client.groupe}
            </Badge>
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="size-3.5" />
              {client.phone}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="size-3.5" />
              {client.prenoms.toLowerCase()}.{client.nom.toLowerCase().replace(/[^a-z]/g, "")}@gmail.com
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
              <MapPin className="size-3.5 text-amber-600" />
              {client.agency}
            </span>
            <span>{client.code}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="lg" className="gap-1.5 px-3 text-xs font-bold">
                  <Phone className="size-3.5" />
                  Contacter
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => toast.success("WhatsApp", { description: `Conversation ouverte avec ${client.prenoms}.` })}>
                <MessageCircle className="size-3.5" /> WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success("Appel", { description: `Appel vers ${client.phone}…` })}>
                <Phone className="size-3.5" /> Appeler
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success("SMS envoyé", { description: "Le client sera notifié." })}>
                <Mail className="size-3.5" /> Envoyer un SMS
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
            <DialogTrigger
              render={
                <Button variant="outline" size="lg" className="gap-1.5 px-3 text-xs font-bold">
                  <StickyNote className="size-3.5" />
                  Ajouter une note
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une note</DialogTitle>
                <DialogDescription>Visible uniquement par les équipes SPARK PRESSING.</DialogDescription>
              </DialogHeader>
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Consigne, préférence de traitement, contexte utile…"
                className="min-h-24 text-[13px]"
              />
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setNoteOpen(false)}>
                  Annuler
                </Button>
                <Button size="sm" onClick={handleAddNote}>
                  Enregistrer la note
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => updatePath("/depots/nouveau")}
          >
            <PackagePlus className="size-4" />
            Nouveau dépôt
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Valeur vie client", value: detail.valeurVie, sub: detail.depuis, icon: Gem, iconBg: "bg-slate-100 text-slate-500", valueClass: "" },
          { label: "Dépôts réalisés", value: String(detail.depots), sub: detail.frequence, icon: Package, iconBg: "bg-slate-100 text-slate-500", valueClass: "" },
          { label: "Panier moyen", value: detail.panier, sub: detail.panierDelta, icon: ShoppingBag, iconBg: "bg-slate-100 text-slate-500", valueClass: "" },
          { label: "Solde à payer", value: detail.solde, sub: "Échéance au prochain retrait", icon: CircleAlert, iconBg: "bg-amber-50 text-amber-600", valueClass: "text-amber-600" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
              <span className={cn("flex size-8 items-center justify-center rounded-lg", k.iconBg)}>
                <k.icon className="size-4" />
              </span>
            </div>
            <p className={cn("mt-2 text-xl font-extrabold tracking-tight", k.valueClass)}>{k.value}</p>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Fidélité + historique points */}
      <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-2xl bg-primary text-white xl:grid-cols-3">
        <div className="border-b border-white/10 p-5 sm:p-6 xl:border-r xl:border-b-0">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] text-secondary">
              <Sparkles className="size-4" />
              FIDÉLITÉ SPARK
            </p>
            <Badge className="border-0 bg-amber-100 text-[10px] font-bold text-amber-800">{client.groupe}</Badge>
          </div>
          <p className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">{points.toLocaleString("fr-FR").replace(/,/g, " ")}</p>
          <p className="mt-1 text-xs text-white/70">points disponibles • valeur {pointValue}</p>
          <div className="mt-4 flex items-center justify-between text-[10px] font-bold">
            <span className="text-white">{client.groupe.toUpperCase()}</span>
            <span className="text-secondary">{detail.nextNiveau} • {detail.nextAt} pts</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-secondary" style={{ width: `${detail.progress}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] text-white/70">{detail.progress} % du parcours accompli</p>

          <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
            <DialogTrigger
              render={
                <Button className="mt-4 bg-white text-xs font-bold text-primary hover:bg-white/90">
                  Convertir en remise
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convertir en remise</DialogTitle>
                <DialogDescription>100 points = 500 FCFA de remise • minimum 500 points.</DialogDescription>
              </DialogHeader>
              <RadioGroup value={convertAmount} onValueChange={setConvertAmount} className="gap-2">
                {CONVERT_OPTIONS.map((opt) => (
                  <Label
                    key={opt}
                    htmlFor={`conv-${opt}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold",
                      convertAmount === String(opt) ? "border-primary bg-primary/5" : "border-border text-muted-foreground",
                      opt > points && "opacity-50",
                    )}
                  >
                    <RadioGroupItem id={`conv-${opt}`} value={String(opt)} disabled={opt > points} />
                    {opt.toLocaleString("fr-FR").replace(/,/g, " ")} pts
                    <span className="ml-auto font-bold text-emerald-600">
                      = {(opt * 5).toLocaleString("fr-FR").replace(/,/g, " ")} FCFA
                    </span>
                  </Label>
                ))}
              </RadioGroup>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setConvertOpen(false)}>
                  Annuler
                </Button>
                <Button size="sm" onClick={handleConvert}>
                  Confirmer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="p-5 sm:p-6 xl:col-span-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Historique des points</h2>
              <p className="mt-0.5 text-xs text-white/70">Gains et consommations récents</p>
            </div>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs font-semibold text-secondary"
              onClick={() => toast.info("Historique complet", { description: "Tous les mouvements de points de ce client." })}
            >
              Voir tout l&apos;historique
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[events.slice(0, 2), events.slice(2, 4)].map((col, i) => (
              <div key={i} className="space-y-3 rounded-xl bg-white p-3 text-foreground">
                {col.map((e, j) => (
                  <div key={j} className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full",
                        e.delta >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500",
                      )}
                    >
                      {e.delta >= 0 ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold">{e.label}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {e.date} • {e.ref}
                      </p>
                    </div>
                    <p className={cn("text-xs font-extrabold", e.delta >= 0 ? "text-foreground" : "text-red-500")}>
                      {e.delta >= 0 ? `+${e.delta}` : e.delta}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-white/70">
            <Info className="size-3.5 shrink-0" />
            100 points = 500 FCFA de remise • conversion minimale : 500 points
          </p>
        </div>
      </div>

      {/* Timeline + latéral */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div className="rounded-xl border border-border bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Dépôts et retraits</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Chronologie des opérations</p>
              </div>
              <Badge variant="outline" className="gap-1 border-sky-200 bg-sky-50 text-[10px] font-semibold text-sky-700">
                <Archive className="size-3" />
                Historique conservé après archivage
              </Badge>
            </div>
            <div className="mt-4 space-y-0">
              {detail.timeline.map((t, i) => (
                <div key={i} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < detail.timeline.length - 1 && <span className="absolute top-9 left-[15px] h-[calc(100%-2rem)] w-px bg-border" />}
                  <span
                    className={cn(
                      "z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
                      t.type === "retrait" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600",
                    )}
                  >
                    {t.type === "retrait" ? <Check className="size-4" /> : <Package className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-1">
                      <p className="text-[13px] font-bold">{t.title}</p>
                      <p className="text-[11px] text-muted-foreground">{t.date}</p>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t.detail}</p>
                    <p className="text-[11px] text-muted-foreground">{t.ref}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commandes récentes */}
          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <div className="flex items-center justify-between p-5 pb-3">
              <h2 className="text-sm font-bold">Commandes récentes</h2>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs font-semibold text-muted-foreground"
                onClick={() => toast.info("Commandes", { description: `Voir les ${detail.totalCommandes} commandes de ce client.` })}
              >
                Voir les {detail.totalCommandes} commandes
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">COMMANDE</TableHead>
                  <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">DATE</TableHead>
                  <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">ARTICLES</TableHead>
                  <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">MONTANT</TableHead>
                  <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">STATUT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.commandes.map((c) => (
                  <TableRow key={c.ref}>
                    <TableCell className="text-xs font-bold">{c.ref}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.date}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.articles}</TableCell>
                    <TableCell className="text-xs font-bold">{c.montant}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-0 text-[10px] font-semibold",
                          c.statut === "Prête au retrait" ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {c.statut}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-bold">Préférences</h2>
              <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
                <DialogTrigger
                  render={
                    <Button variant="ghost" size="icon-sm" aria-label="Modifier les préférences">
                      <Pencil className="size-3.5" />
                    </Button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Modifier les préférences</DialogTitle>
                    <DialogDescription>Personnalisez l&apos;expérience de ce client.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="pref-canal" className="mb-1.5 text-xs font-semibold">
                        Canal préféré
                      </Label>
                      <Select value={draftPrefs.canal} onValueChange={(v) => setDraftPrefs((d) => ({ ...d, canal: v ?? "WhatsApp" }))}>
                        <SelectTrigger id="pref-canal" className="w-full text-[13px] data-[size=default]:h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CANAUX.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {(
                      [
                        ["creneau", "Créneau de retrait"],
                        ["traitement", "Traitement favori"],
                        ["instructions", "Instructions"],
                      ] as const
                    ).map(([key, label]) => (
                      <div key={key}>
                        <Label htmlFor={`pref-${key}`} className="mb-1.5 text-xs font-semibold">
                          {label}
                        </Label>
                        <Input
                          id={`pref-${key}`}
                          value={draftPrefs[key]}
                          onChange={(e) => setDraftPrefs((d) => ({ ...d, [key]: e.target.value }))}
                          className="h-9 text-[13px]"
                        />
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" size="sm" onClick={() => setPrefsOpen(false)}>
                      Annuler
                    </Button>
                    <Button size="sm" onClick={handleSavePrefs}>
                      Enregistrer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="mt-3 space-y-3.5">
              {[
                { icon: MessageCircle, label: "CANAL PRÉFÉRÉ", value: prefs.canal },
                { icon: Clock, label: "CRÉNEAU DE RETRAIT", value: prefs.creneau },
                { icon: SprayCan, label: "TRAITEMENT FAVORI", value: prefs.traitement },
                { icon: Shirt, label: "INSTRUCTIONS", value: prefs.instructions },
              ].map((p) => (
                <div key={p.label} className="flex items-center gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-border/60">
                    <p.icon className="size-4 text-muted-foreground" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">{p.label}</p>
                    <p className="truncate text-[13px] font-semibold">{p.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-bold">Notes internes</h2>
              <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-muted-foreground">
                {notes.length} note{notes.length > 1 ? "s" : ""}
              </Badge>
            </div>
            <div className="mt-3 space-y-2.5">
              {notes.map((n, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-lg p-3 text-xs",
                    n.highlight || i === 0 ? "bg-amber-50 ring-1 ring-amber-100" : "bg-muted/50",
                  )}
                >
                  <p className="leading-snug">{n.text}</p>
                  <p className={cn("mt-1.5 text-[11px] font-semibold", n.highlight || i === 0 ? "text-amber-700" : "text-muted-foreground")}>
                    {n.author} • {n.date}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Informations du compte</h2>
            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cliente depuis</span>
                <span className="font-bold">{detail.depuisLe}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Agence de référence</span>
                <span className="font-bold">{client.agency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Consentement marketing</span>
                <Badge variant="outline" className="border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
                  {detail.consentement}
                </Badge>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <div className="text-xs">
                <p className="font-bold">Archiver le client</p>
                <p className="text-[11px] text-muted-foreground">L&apos;historique restera accessible</p>
              </div>
              <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
                <AlertDialogTrigger
                  render={
                    <Button variant="ghost" size="icon-sm" aria-label="Archiver le client">
                      <Archive className="size-4 text-muted-foreground" />
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Archiver ce client ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {client.prenoms} {client.nom} ne pourra plus effectuer de dépôts. Dépôts, paiements, notes et
                      points resteront accessibles en lecture seule.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 text-white hover:bg-red-700"
                      onClick={handleArchive}
                    >
                      Archiver
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>

      {/* Bandeau bas mobile */}
      <div className="flex items-center gap-2 rounded-xl border border-border bg-white p-3 text-xs text-muted-foreground xl:hidden">
        <History className="size-4 shrink-0 text-emerald-600" />
        {detail.totalCommandes} commandes • {points.toLocaleString("fr-FR").replace(/,/g, " ")} pts fidélité
      </div>
    </div>
  );
}
