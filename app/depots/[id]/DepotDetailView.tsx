"use client";

import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
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
import { formatFCFA, formatDateTimeFr, formatMonthYearFr } from "../data";
import type { ApiDepositDetail } from "@/lib/types";

const paymentStatusBadge: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  soldé: "bg-emerald-50 text-emerald-700",
  partial: "bg-amber-100 text-amber-700",
  unpaid: "bg-red-50 text-red-600",
  open: "bg-amber-100 text-amber-700",
};

/** Détail descriptif d'une ligne d'article (couleur • défauts • note interne). */
function unitDetail(u: ApiDepositDetail["units"][number]): string {
  return [
    u.color,
    u.defects?.map((d) => d.label).join(", "),
    u.internal_notes,
    u.is_express ? "Express" : null,
  ]
    .filter(Boolean)
    .join(" • ");
}

export default function DepotDetailView({ deposit }: { deposit: ApiDepositDetail }) {
  const router = useRouter();
  const { updatePath } = useGlobalData();

  const actions = deposit.actions;
  const totals = deposit.totals;
  const leftToPay = totals?.left_to_pay ?? deposit.left_to_pay;
  const advanced = totals?.paid ?? deposit.advanced;
  const sousTotal = totals?.subtotal ?? deposit.subtotal;
  const expressSupplement = totals?.express_supplement ?? deposit.express_supplement;
  const remise = totals?.discount ?? deposit.discount;
  const pointsUtilises = totals?.points_used ?? deposit.points_redeemed;
  const pointsMontant = totals?.points_discount ?? 0;
  const frais = totals?.fees ?? deposit.collection_fee + deposit.delivery_fee;
  const tax = totals?.tax ?? 0;

  const paymentLabel = deposit.payment_status?.label ?? (leftToPay <= 0 ? "Soldé" : advanced > 0 ? "Partiellement payé" : "Non payé");
  const etatAtelier = deposit.workshop_status?.label ?? deposit.etat_label;
  const retraitIso = deposit.pickup?.retrieve_date ?? deposit.retrieve_date;
  const syncLabel = deposit.sync_status?.label ?? "—";
  const initials = (deposit.client_name || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const tags = [
    deposit.service?.label ?? (deposit.is_express ? "Express" : "Classique"),
    deposit.is_express && deposit.treatment?.express_hours
      ? `Express • ${deposit.treatment.express_hours} h`
      : null,
    deposit.treatment?.defects_reported ? "Taches signalées" : null,
    deposit.treatment?.pieces_counted
      ? `${deposit.treatment.pieces_counted} pièces comptées`
      : null,
    deposit.treatment?.renders?.length ? `Rendu • ${deposit.treatment.renders.join(", ")}` : null,
  ].filter(Boolean) as string[];

  const fonctionNonDisponible = (titre: string) =>
    toast.info(`${titre} — bientôt disponible`, {
      description: `L'action sur le dépôt ${deposit.code} n'est pas encore connectée au serveur.`,
    });

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
            Dépôt {deposit.code}
            <Badge
              variant="outline"
              className={cn(
                "gap-1 border-0 text-[10px] font-bold",
                paymentStatusBadge[deposit.payment_status?.code ?? ""] ??
                  (leftToPay <= 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-100 text-amber-700"),
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  leftToPay <= 0 ? "bg-emerald-500" : advanced > 0 ? "bg-amber-500" : "bg-red-500",
                )}
              />
              {paymentLabel}
            </Badge>
            <Badge variant="outline" className="gap-1 border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {deposit.etat_label}
            </Badge>
            {deposit.local_ref && (
              <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-muted-foreground">
                {deposit.local_ref}
              </Badge>
            )}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Déposé le {formatDateTimeFr(deposit.deposit_date)} • Agence {deposit.agency?.name ?? "—"} •{" "}
            {deposit.quantity_label ?? deposit.articles_label ?? "—"}
            {deposit.terminal ? ` • ${deposit.terminal}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {actions?.can_print && (
            <Button
              variant="outline"
              size="lg"
              className="gap-1.5 px-3 text-xs font-bold"
              onClick={() => updatePath(`/depots/${deposit.id}/ticket`)}
            >
              <AppIcon name="print" className="size-3.5" />
              Imprimer
            </Button>
          )}
          {actions?.can_edit && (
            <Button
              variant="outline"
              size="lg"
              className="gap-1.5 px-3 text-xs font-bold"
              onClick={() => fonctionNonDisponible("Modification")}
            >
              <AppIcon name="edit" className="size-3.5" />
              Modifier
            </Button>
          )}
          {actions?.can_add_payment && (
            <Button
              size="lg"
              className="gap-1.5 px-3 text-xs font-bold"
              onClick={() => fonctionNonDisponible("Acompte")}
            >
              <AppIcon name="plus" className="size-4" />
              Ajouter un acompte
            </Button>
          )}
        </div>
      </div>

      {/* Statuts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Statut commercial",
            value: paymentLabel,
            sub: `Retrait prévu ${formatDateTimeFr(deposit.commercial_status?.retrieve_date ?? retraitIso)}`,
            icon: "receipt",
            iconBg: "bg-slate-100 text-slate-500",
            valueClass: "",
          },
          {
            label: "État atelier",
            value: etatAtelier,
            sub: deposit.workshop_detail?.updated_at
              ? `Mise à jour ${formatDateTimeFr(deposit.workshop_detail.updated_at)}`
              : "Suivi atelier en temps réel",
            icon: "shirt",
            iconBg: "bg-slate-100 text-slate-500",
            valueClass: "",
          },
          {
            label: "Synchronisation",
            value: syncLabel,
            sub: deposit.sync_status?.synced_at
              ? `Cloud confirmé ${formatDateTimeFr(deposit.sync_status.synced_at)}`
              : "En attente de connexion",
            icon: "refresh",
            iconBg: "bg-slate-100 text-slate-500",
            valueClass: "",
          },
          {
            label: "Reste à payer",
            value: `${formatFCFA(leftToPay)} FCFA`,
            sub: advanced > 0 ? `Acompte de ${formatFCFA(advanced)} FCFA` : "Aucun acompte versé",
            icon: "wallet",
            iconBg: "bg-amber-50 text-amber-600",
            valueClass: leftToPay > 0 ? "text-amber-600" : "",
          },
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
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {deposit.quantity_label ?? `${deposit.items_count} ligne(s)`} •{" "}
                  Tarification {deposit.pricing_mode === "kilo" ? "au kilo" : "à la pièce"}
                </p>
              </div>
              {deposit.invoice_number && (
                <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-muted-foreground">
                  {deposit.invoice_number}
                </Badge>
              )}
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
                {deposit.units.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <p className="text-[13px] font-semibold">{u.designation}</p>
                      <p className="text-[11px] text-muted-foreground">{unitDetail(u) || "—"}</p>
                    </TableCell>
                    <TableCell className="text-xs">
                      {u.pricing_type === "kilo" ? `${u.quantity} kg` : u.quantity}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatFCFA(u.unit_price)}</TableCell>
                    <TableCell className="text-right text-xs font-bold">{formatFCFA(u.line_total)}</TableCell>
                  </TableRow>
                ))}
                {deposit.units.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={4} className="py-8 text-center text-[13px] text-muted-foreground">
                      Aucun article détaillé sur ce dépôt.
                    </TableCell>
                  </TableRow>
                )}
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableCell colSpan={3} className="text-xs font-semibold text-muted-foreground">
                    Sous-total articles
                  </TableCell>
                  <TableCell className="text-right text-xs font-extrabold">{formatFCFA(sousTotal)} FCFA</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Traitement */}
          <div className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold">Traitement, rendu et remise</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Consignes transmises à l&apos;atelier</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((t, i) => (
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
                  <p className="flex justify-between"><span className="text-muted-foreground">Mode</span><span className="font-semibold">{deposit.pickup?.label ?? "Retrait en agence"}</span></p>
                  <p className="flex justify-between"><span className="text-muted-foreground">Agence</span><span className="font-semibold">{deposit.pickup?.agency ?? deposit.agency?.name ?? "—"}</span></p>
                  <p className="flex justify-between"><span className="text-muted-foreground">Retrait prévu</span><span className="font-semibold">{formatDateTimeFr(retraitIso)}</span></p>
                  {deposit.pickup?.address && (
                    <p className="flex justify-between"><span className="text-muted-foreground">Adresse</span><span className="font-semibold">{deposit.pickup.address}</span></p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wide text-muted-foreground">REMARQUES</p>
                <p className="mt-2 text-xs leading-snug">
                  {deposit.notes || "Aucune consigne particulière pour ce dépôt."}
                </p>
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
                {actions?.can_follow_workshop && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-xs font-semibold text-muted-foreground"
                    onClick={() => fonctionNonDisponible("Suivi atelier")}
                  >
                    Ouvrir l&apos;atelier
                  </Button>
                )}
              </div>
              <div className="mt-4">
                {deposit.timeline.map((c, i) => (
                  <div key={`${c.code}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
                    {i < deposit.timeline.length - 1 && <span className="absolute top-5 left-[3px] h-[calc(100%-1rem)] w-px bg-border" />}
                    <span className="z-10 mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-muted-foreground">{formatDateTimeFr(c.at)}</p>
                      <p className="text-[13px] font-bold">{c.title}</p>
                      <p className="text-[11px] text-muted-foreground">{c.detail}</p>
                    </div>
                  </div>
                ))}
                {deposit.timeline.length === 0 && (
                  <p className="text-xs text-muted-foreground">Aucun événement enregistré.</p>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-white p-5">
              <h2 className="text-sm font-bold">Journal d&apos;audit</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Traçabilité des opérations sensibles</p>
              <div className="mt-4 space-y-3">
                {deposit.audit.map((a, i) => (
                  <div key={i} className="flex gap-2.5 text-xs">
                    <span className="w-14 shrink-0 text-[11px] text-muted-foreground">{formatDateTimeFr(a.at)}</span>
                    <div className="min-w-0">
                      <p className="font-bold">{a.actor}</p>
                      <p className="text-muted-foreground">{a.message}</p>
                    </div>
                  </div>
                ))}
                {deposit.audit.length === 0 && (
                  <p className="text-xs text-muted-foreground">Aucune entrée d&apos;audit.</p>
                )}
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
                <p className="truncate text-[13px] font-bold">{deposit.client_summary?.fullname ?? deposit.client_name}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {(deposit.client_summary?.phone_number ?? deposit.client_phone) ? `${deposit.client_summary?.phone_number ?? deposit.client_phone} • ` : ""}
                  {deposit.client_summary?.client_since
                    ? `Client depuis ${formatMonthYearFr(deposit.client_summary.client_since)}`
                    : deposit.client?.code ?? ""}
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-1.5 text-xs">
              <p className="flex justify-between">
                <span className="text-muted-foreground">Fidélité</span>
                <span className="font-semibold">
                  {deposit.client_summary?.loyalty_points ?? deposit.client?.loyalty_points ?? 0} points disponibles
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">Impayé client</span>
                <span className="font-semibold">
                  {deposit.client_summary && deposit.client_summary.previous_unpaid_count > 0
                    ? `${deposit.client_summary.previous_unpaid_count} • ${formatFCFA(deposit.client_summary.previous_unpaid_amount)} FCFA`
                    : "Aucun impayé antérieur"}
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Total et paiements</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Montants TTC • {deposit.currency}</p>
            <div className="mt-3 space-y-1.5 text-xs">
              <p className="flex justify-between"><span className="text-muted-foreground">Sous-total articles</span><span className="font-semibold">{formatFCFA(sousTotal)}</span></p>
              {expressSupplement > 0 && (
                <p className="flex justify-between"><span className="text-muted-foreground">Supplément express</span><span className="font-semibold">+{formatFCFA(expressSupplement)}</span></p>
              )}
              {frais > 0 && (
                <p className="flex justify-between"><span className="text-muted-foreground">Frais collecte / livraison</span><span className="font-semibold">+{formatFCFA(frais)}</span></p>
              )}
              {remise > 0 && (
                <p className="flex justify-between"><span className="text-muted-foreground">Remise{deposit.discount_percent ? ` (${deposit.discount_percent} %)` : ""}</span><span className="font-semibold">−{formatFCFA(remise)}</span></p>
              )}
              {pointsUtilises > 0 && (
                <p className="flex justify-between"><span className="text-muted-foreground">{pointsUtilises} points utilisés</span><span className="font-semibold">−{formatFCFA(pointsMontant)}</span></p>
              )}
              {tax > 0 && (
                <p className="flex justify-between"><span className="text-muted-foreground">TVA</span><span className="font-semibold">{formatFCFA(tax)}</span></p>
              )}
              <p className="flex justify-between border-t border-border pt-2 text-[13px]"><span className="font-bold">Total</span><span className="font-extrabold">{formatFCFA(deposit.total)} FCFA</span></p>
            </div>
            {deposit.payments.map((p) => (
              <div key={p.id} className="mt-2 rounded-lg bg-emerald-50/60 p-2.5 text-xs ring-1 ring-emerald-100">
                <p className="flex justify-between font-bold text-emerald-800">
                  <span>{p.label} • {p.payment_method?.label ?? "—"}</span>
                  <span>{formatFCFA(p.amount)} FCFA</span>
                </p>
                <p className="mt-0.5 text-[11px] text-emerald-700">
                  {formatDateTimeFr(p.at)}{p.received_by ? ` • reçu par ${p.received_by}` : ""}
                </p>
              </div>
            ))}
            <div className="mt-2 rounded-lg bg-amber-50 p-2.5 ring-1 ring-amber-100">
              <p className="flex justify-between text-[13px] font-extrabold text-amber-700">
                <span>Reste à payer</span>
                <span>{formatFCFA(leftToPay)} FCFA</span>
              </p>
            </div>
            {actions?.can_add_payment && (
              <Button
                variant="outline"
                size="lg"
                className="mt-3 w-full justify-center gap-1.5 text-xs font-bold"
                onClick={() => fonctionNonDisponible("Acompte")}
              >
                <AppIcon name="plus" className="size-3.5" />
                Ajouter un acompte
              </Button>
            )}
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Actions</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Selon vos permissions d&apos;agence</p>
            <div className="mt-3 space-y-2">
              {actions?.can_print && (
                <Button variant="outline" size="lg" className="w-full justify-start gap-2 text-xs font-bold" onClick={() => updatePath(`/depots/${deposit.id}/ticket`)}>
                  <AppIcon name="print" className="size-4" />
                  Imprimer le ticket
                </Button>
              )}
              {actions?.can_edit && (
                <Button variant="outline" size="lg" className="w-full justify-start gap-2 text-xs font-bold" onClick={() => fonctionNonDisponible("Modification")}>
                  <AppIcon name="edit" className="size-4" />
                  Modifier le dépôt
                </Button>
              )}
              {actions?.can_follow_workshop && (
                <Button variant="outline" size="lg" className="w-full justify-start gap-2 text-xs font-bold" onClick={() => fonctionNonDisponible("Suivi atelier")}>
                  <AppIcon name="box" className="size-4" />
                  Suivre l&apos;atelier
                </Button>
              )}
              {actions?.can_cancel && (
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button variant="outline" size="lg" className="w-full justify-start gap-2 border-red-200 bg-red-50 text-xs font-bold text-red-600 hover:bg-red-100 hover:text-red-700">
                        <AppIcon name="delete" className="size-4" />
                        Annuler le dépôt
                      </Button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Annuler ce dépôt ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {deposit.code} ({formatFCFA(deposit.total)} FCFA) sera annulé. Cette action est journalisée et
                        visible dans l&apos;audit.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Conserver</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 text-white hover:bg-red-700"
                        onClick={() => fonctionNonDisponible("Annulation")}
                      >
                        Annuler le dépôt
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
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
        {deposit.etat_label} • Reste {formatFCFA(leftToPay)} FCFA
        <span className="ml-auto inline-flex items-center gap-1 font-semibold text-foreground">
          <AppIcon name="check" className="size-3.5" /> {syncLabel}
        </span>
      </div>
    </div>
  );
}
