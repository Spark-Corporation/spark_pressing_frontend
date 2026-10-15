"use client";

import { useState } from "react";
import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import type { Depot } from "../data";
import { formatFCFA } from "../data";
import type { Acompte, DepotDetail } from "./detail";

const MOYENS = ["Espèces", "Mobile Money", "Carte", "Virement"];

export default function DepotDetailView({ depot, detail }: { depot: Depot; detail: DepotDetail }) {
  const router = useRouter();
  const { updatePath } = useGlobalData();

  const [paye, setPaye] = useState(depot.paye);
  const [acomptes, setAcomptes] = useState<Acompte[]>(detail.acomptes);
  const [audit, setAudit] = useState(detail.audit);
  const [retraitPrevu, setRetraitPrevu] = useState(detail.retraitPrevu);
  const [remarques, setRemarques] = useState(detail.remarques);
  const [acompteOpen, setAcompteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [montant, setMontant] = useState("");
  const [moyen, setMoyen] = useState("Espèces");
  const [draftRetrait, setDraftRetrait] = useState(detail.retraitPrevu);
  const [draftRemarques, setDraftRemarques] = useState(detail.remarques);

  const reste = detail.total - paye;
  const statut = reste <= 0 ? "Soldé" : paye > 0 ? "Partiellement payé" : "Non payé";
  const initials = depot.client
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleAcompte = () => {
    const value = Number(montant);
    if (!montant || Number.isNaN(value) || value <= 0) {
      toast.error("Montant invalide", { description: "Saisissez un montant supérieur à 0." });
      return;
    }
    if (value > reste) {
      toast.error("Montant trop élevé", { description: `Le reste à payer est de ${formatFCFA(reste)} FCFA.` });
      return;
    }
    setPaye((p) => p + value);
    setAcomptes((a) => [{ moyen, date: "À l'instant", recuPar: "Awa N.", montant: value }, ...a]);
    setAudit((a) => [{ heure: "À l'instant", auteur: "Awa N.", action: `Acompte ${moyen.toLowerCase()} de ${formatFCFA(value)} FCFA enregistré` }, ...a]);
    setMontant("");
    setAcompteOpen(false);
    if (value >= reste) {
      toast.success("Dépôt soldé", { description: `${depot.code} est entièrement payé.` });
    } else {
      toast.success("Acompte enregistré", { description: `${formatFCFA(value)} FCFA • ${moyen}.` });
    }
  };

  const handleEdit = () => {
    setRetraitPrevu(draftRetrait);
    setRemarques(draftRemarques);
    setEditOpen(false);
    toast.success("Dépôt modifié", { description: "Les informations ont été mises à jour." });
  };

  const acompteDialog = (
    <Dialog open={acompteOpen} onOpenChange={setAcompteOpen}>
      <DialogTrigger
        render={
          <Button size="lg" className="gap-1.5 px-3 text-xs font-bold">
            <AppIcon name="plus" className="size-4" />
            Ajouter un acompte
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un acompte</DialogTitle>
          <DialogDescription>
            Reste à payer : <span className="font-bold text-foreground">{formatFCFA(reste)} FCFA</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="ac-montant" className="mb-1.5 text-xs font-semibold">
              Montant (FCFA)
            </Label>
            <Input
              id="ac-montant"
              inputMode="numeric"
              value={montant}
              onChange={(e) => setMontant(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder={`Ex. ${formatFCFA(reste)}`}
              className="h-9 text-[13px]"
            />
          </div>
          <div>
            <Label htmlFor="ac-moyen" className="mb-1.5 text-xs font-semibold">
              Moyen de paiement
            </Label>
            <Select value={moyen} onValueChange={(v) => setMoyen(v ?? "Espèces")}>
              <SelectTrigger id="ac-moyen" className="w-full text-[13px] data-[size=default]:h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOYENS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setAcompteOpen(false)}>
            Annuler
          </Button>
          <Button size="sm" onClick={handleAcompte}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

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
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl">
            Dépôt {depot.code}
            <Badge
              variant="outline"
              className={cn(
                "gap-1 border-0 text-[10px] font-bold",
                statut === "Soldé" ? "bg-emerald-50 text-emerald-700" : "bg-amber-100 text-amber-700",
              )}
            >
              <span className={cn("size-1.5 rounded-full", statut === "Soldé" ? "bg-emerald-500" : "bg-amber-500")} />
              {statut}
            </Badge>
            <Badge variant="outline" className="gap-1 border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {depot.etat}
            </Badge>
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {detail.createdAt} • Agence {depot.agency} • {detail.ticket}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => updatePath(`/depots/${depot.code}/ticket`)}
          >
            <AppIcon name="print" className="size-3.5" />
            Imprimer
          </Button>
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger
              render={
                <Button variant="outline" size="lg" className="gap-1.5 px-3 text-xs font-bold">
                  <AppIcon name="edit" className="size-3.5" />
                  Modifier
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifier le dépôt</DialogTitle>
                <DialogDescription>Disponible jusqu&apos;au retrait du client.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="ed-retrait" className="mb-1.5 text-xs font-semibold">
                    Retrait prévu
                  </Label>
                  <Input id="ed-retrait" value={draftRetrait} onChange={(e) => setDraftRetrait(e.target.value)} className="h-9 text-[13px]" />
                </div>
                <div>
                  <Label htmlFor="ed-remarques" className="mb-1.5 text-xs font-semibold">
                    Remarques atelier
                  </Label>
                  <Textarea id="ed-remarques" value={draftRemarques} onChange={(e) => setDraftRemarques(e.target.value)} className="min-h-20 text-[13px]" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setEditOpen(false)}>
                  Annuler
                </Button>
                <Button size="sm" onClick={handleEdit}>
                  Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {acompteDialog}
        </div>
      </div>

      {/* Statuts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Statut commercial", value: statut, sub: detail.statutDetail, icon: "receipt", iconBg: "bg-slate-100 text-slate-500", valueClass: "" },
          { label: "État atelier", value: depot.etat, sub: detail.etatDetail, icon: "shirt", iconBg: "bg-slate-100 text-slate-500", valueClass: "" },
          { label: "Synchronisation", value: detail.synchro, sub: detail.synchroDetail, icon: "refresh", iconBg: "bg-slate-100 text-slate-500", valueClass: "" },
          { label: "Reste à payer", value: `${formatFCFA(reste)} FCFA`, sub: paye > 0 ? `Acompte de ${formatFCFA(paye)} FCFA` : "Aucun acompte versé", icon: "wallet", iconBg: "bg-amber-50 text-amber-600", valueClass: reste > 0 ? "text-amber-600" : "" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
              <span className={cn("flex size-8 items-center justify-center rounded-lg", k.iconBg)}>
                <AppIcon name={k.icon as AppIconName} className="size-4" />
              </span>
            </div>
            <p className={cn("mt-2 text-xl font-extrabold tracking-tight", k.valueClass)}>{k.value}</p>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Colonne centrale */}
        <div className="space-y-4 xl:col-span-2">
          {/* Articles */}
          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <div className="flex items-start justify-between p-5 pb-3">
              <div>
                <h2 className="text-sm font-bold">Articles du dépôt</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{depot.articles} • Tarification à la pièce</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs font-semibold text-muted-foreground"
                onClick={() => updatePath(`/depots/${depot.code}/ticket`)}
              >
                Voir le ticket
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">ARTICLE / ÉTAT</TableHead>
                  <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">QTE</TableHead>
                  <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PRIX UNIT.</TableHead>
                  <TableHead className="text-right text-[10px] font-bold tracking-wide text-muted-foreground">TOTAL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.articles.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <p className="text-[13px] font-semibold">{a.label}</p>
                      <p className="text-[11px] text-muted-foreground">{a.detail}</p>
                    </TableCell>
                    <TableCell className="text-xs">{a.qte}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatFCFA(a.prix)}</TableCell>
                    <TableCell className="text-right text-xs font-bold">{formatFCFA(a.qte * a.prix)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableCell colSpan={3} className="text-xs font-semibold text-muted-foreground">
                    Sous-total articles
                  </TableCell>
                  <TableCell className="text-right text-xs font-extrabold">{formatFCFA(detail.sousTotal)} FCFA</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Traitement */}
          <div className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold">Traitement, rendu et remise</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Consignes transmises à l&apos;atelier</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {detail.tags.map((t, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className={cn(
                    "border-0 text-[10px] font-semibold",
                    i === 0 ? "bg-primary text-white" : t.includes("comptées") ? "bg-sky-100 text-sky-700" : "bg-muted text-foreground",
                  )}
                >
                  {t}
                </Badge>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold tracking-wide text-muted-foreground">COLLECTE / LIVRAISON</p>
                <div className="mt-2 space-y-1.5 text-xs">
                  <p className="flex justify-between"><span className="text-muted-foreground">Mode</span><span className="font-semibold">{detail.mode}</span></p>
                  <p className="flex justify-between"><span className="text-muted-foreground">Agence</span><span className="font-semibold">{detail.agenceRetrait}</span></p>
                  <p className="flex justify-between"><span className="text-muted-foreground">Retrait prévu</span><span className="font-semibold">{retraitPrevu}</span></p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wide text-muted-foreground">REMARQUES</p>
                <p className="mt-2 text-xs leading-snug">{remarques}</p>
              </div>
            </div>
          </div>

          {/* Chrono + audit */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold">Chronologie atelier</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">Suivi temps réel</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs font-semibold text-muted-foreground"
                  onClick={() => toast.info("Atelier", { description: `Suivi du lot ${depot.code}.` })}
                >
                  Ouvrir l&apos;atelier
                </Button>
              </div>
              <div className="mt-4">
                {detail.chrono.map((c, i) => (
                  <div key={i} className="relative flex gap-3 pb-4 last:pb-0">
                    {i < detail.chrono.length - 1 && <span className="absolute top-5 left-[3px] h-[calc(100%-1rem)] w-px bg-border" />}
                    <span className="z-10 mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-muted-foreground">{c.heure}</p>
                      <p className="text-[13px] font-bold">{c.title}</p>
                      <p className="text-[11px] text-muted-foreground">{c.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-white p-5">
              <h2 className="text-sm font-bold">Journal d&apos;audit</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Traçabilité des opérations sensibles</p>
              <div className="mt-4 space-y-3">
                {audit.map((a, i) => (
                  <div key={i} className="flex gap-2.5 text-xs">
                    <span className="w-14 shrink-0 text-[11px] text-muted-foreground">{a.heure}</span>
                    <div className="min-w-0">
                      <p className="font-bold">{a.auteur}</p>
                      <p className="text-muted-foreground">{a.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-bold">Client</h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-[11px] font-semibold text-muted-foreground"
                onClick={() => updatePath("/clients")}
              >
                Ouvrir le client
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-800">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold">{depot.client}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {depot.phone ? `${depot.phone} • ` : ""}Cliente depuis {detail.clientSince}
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-1.5 text-xs">
              <p className="flex justify-between"><span className="text-muted-foreground">Fidélité</span><span className="font-semibold">{detail.fidelite}</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Impayé client</span><span className="font-semibold">{detail.impaye}</span></p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Total et paiements</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Montants TTC • FCFA</p>
            <div className="mt-3 space-y-1.5 text-xs">
              <p className="flex justify-between"><span className="text-muted-foreground">Sous-total articles</span><span className="font-semibold">{formatFCFA(detail.sousTotal)}</span></p>
              {detail.express > 0 && (
                <p className="flex justify-between"><span className="text-muted-foreground">Express +30 %</span><span className="font-semibold">+{formatFCFA(detail.express)}</span></p>
              )}
              {detail.remise > 0 && (
                <p className="flex justify-between"><span className="text-muted-foreground">Remise commerciale</span><span className="font-semibold">−{formatFCFA(detail.remise)}</span></p>
              )}
              {detail.pointsUtilises > 0 && (
                <p className="flex justify-between"><span className="text-muted-foreground">{detail.pointsUtilises} points utilisés</span><span className="font-semibold">−{formatFCFA(detail.pointsMontant)}</span></p>
              )}
              <p className="flex justify-between border-t border-border pt-2 text-[13px]"><span className="font-bold">Total</span><span className="font-extrabold">{formatFCFA(detail.total)} FCFA</span></p>
            </div>
            {acomptes.map((a, i) => (
              <div key={i} className="mt-2 rounded-lg bg-emerald-50/60 p-2.5 text-xs ring-1 ring-emerald-100">
                <p className="flex justify-between font-bold text-emerald-800">
                  <span>Acompte • {a.moyen}</span>
                  <span>{formatFCFA(a.montant)} FCFA</span>
                </p>
                <p className="mt-0.5 text-[11px] text-emerald-700">{a.date} • reçu par {a.recuPar}</p>
              </div>
            ))}
            <div className="mt-2 rounded-lg bg-amber-50 p-2.5 ring-1 ring-amber-100">
              <p className="flex justify-between text-[13px] font-extrabold text-amber-700">
                <span>Reste à payer</span>
                <span>{formatFCFA(reste)} FCFA</span>
              </p>
            </div>
            <div className="[&_button]:w-full [&_button]:justify-center">
              {acompteDialog}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Actions</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Selon vos permissions d&apos;agence</p>
            <div className="mt-3 space-y-2">
              <Button variant="outline" size="lg" className="w-full justify-start gap-2 text-xs font-bold" onClick={() => updatePath(`/depots/${depot.code}/ticket`)}>
                <AppIcon name="print" className="size-4" />
                Imprimer le ticket
              </Button>
              <Button variant="outline" size="lg" className="w-full justify-start gap-2 text-xs font-bold" onClick={() => setEditOpen(true)}>
                <AppIcon name="edit" className="size-4" />
                Modifier le dépôt
              </Button>
              <Button variant="outline" size="lg" className="w-full justify-start gap-2 text-xs font-bold" onClick={() => toast.info("Atelier", { description: `Suivi du lot ${depot.code}.` })}>
                <AppIcon name="box" className="size-4" />
                Suivre l&apos;atelier
              </Button>
              <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <AlertDialogTrigger
                  render={
                    <Button variant="outline" size="lg" className="w-full justify-start gap-2 border-red-200 bg-red-50 text-xs font-bold text-red-600 hover:bg-red-100 hover:text-red-700">
                      <AppIcon name="box" className="size-4" />
                      Annuler le dépôt
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Annuler ce dépôt ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {depot.code} ({formatFCFA(detail.total)} FCFA) sera annulé. Cette action est journalisée et
                      visible dans l&apos;audit.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Conserver</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 text-white hover:bg-red-700"
                      onClick={() => {
                        setCancelOpen(false);
                        toast.info("Dépôt annulé", { description: `${depot.code} a été annulé.` });
                        updatePath("/depots");
                      }}
                    >
                      Annuler le dépôt
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <p className="mt-3 flex gap-1.5 text-[11px] leading-snug text-muted-foreground">
              <AppIcon name="info" className="size-3.5" />
              La modification reste disponible jusqu&apos;au retrait. Toute annulation est journalisée.
            </p>
          </div>
        </div>
      </div>

      {/* Bandeau bas mobile */}
      <div className="flex items-center gap-2 rounded-xl border border-border bg-white p-3 text-xs text-muted-foreground xl:hidden">
        <AppIcon name="clock" className="size-4 text-emerald-600" />
        {depot.etat} • Reste {formatFCFA(reste)} FCFA
        <span className="ml-auto inline-flex items-center gap-1 font-semibold text-foreground">
          <AppIcon name="check" className="size-3.5" /> {depot.synchro}
        </span>
      </div>
    </div>
  );
}
