"use client";

import { useState } from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Depot } from "../../data";
import { formatFCFA } from "../../data";
import type { DepotDetail } from "../detail";

/** Faux QR déterministe (visuel uniquement). */
function QrCode({ seed, className }: { seed: string; className?: string }) {
  const N = 16;
  let h = 2166136261;
  for (const ch of seed) h = ((h * 31 + ch.charCodeAt(0)) >>> 0) || 1;
  const rand = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 100) / 100;
  };
  const cells: React.ReactNode[] = [];
  const inFinder = (x: number, y: number) =>
    (x < 5 && y < 5) || (x >= N - 5 && y < 5) || (x < 5 && y >= N - 5);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (!inFinder(x, y) && rand() > 0.52) {
        cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} />);
      }
    }
  }
  const finder = (fx: number, fy: number) => (
    <g key={`${fx}-${fy}`}>
      <rect x={fx} y={fy} width={5} height={5} />
      <rect x={fx + 1} y={fy + 1} width={3} height={3} fill="white" />
      <rect x={fx + 2} y={fy + 2} width={1} height={1} />
    </g>
  );
  return (
    <svg viewBox={`-0.5 -0.5 ${N + 1} ${N + 1}`} shapeRendering="crispEdges" className={className} role="img" aria-label={`QR ${seed}`}>
      {cells}
      {finder(0, 0)}
      {finder(N - 5, 0)}
      {finder(0, N - 5)}
    </svg>
  );
}

function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-lg bg-primary font-extrabold text-secondary",
        size === "lg" ? "size-10 text-xl" : "size-8 text-base",
      )}
    >
      S
    </span>
  );
}

export default function TicketView({ depot, detail }: { depot: Depot; detail: DepotDetail }) {
  const router = useRouter();
  const [format, setFormat] = useState<"ticket" | "facture">("ticket");
  const [copies, setCopies] = useState(1);
  const [sendOpen, setSendOpen] = useState(false);
  const [channel, setChannel] = useState("whatsapp");

  const paye = depot.paye;
  const reste = Math.max(0, detail.total - paye);
  const statut = reste <= 0 ? "Payée" : paye > 0 ? "Partiellement payée" : "Non payée";
  const moyen = detail.acomptes[0]?.moyen ?? "Espèces";
  const factureNo = `FAC-BGV-${depot.code.slice(4)}-0142`;
  const retraitCourt = depot.retrait.includes(",")
    ? depot.retrait.replace(", ", " à ").replace(/(\d{1,2}h)$/, "$100")
    : depot.retrait;
  const remisesPoints = detail.remise + detail.pointsMontant;

  const handlePrint = () => {
    if (format === "ticket") {
      toast.success("Impression lancée", { description: `Ticket 80 mm × ${copies} exemplaire${copies > 1 ? "s" : ""} • POS-01.` });
    } else {
      toast.success("Impression lancée", { description: `Facture A4 × ${copies} exemplaire${copies > 1 ? "s" : ""} • PDF archivé.` });
    }
  };

  const handleDownload = () => {
    toast.success("PDF généré", {
      description: format === "ticket" ? `Ticket ${depot.code} archivé en PDF.` : `Facture ${factureNo} archivée en PDF.`,
    });
  };

  const handleSend = () => {
    setSendOpen(false);
    toast.success("Document envoyé", {
      description: `${channel === "whatsapp" ? "WhatsApp" : "SMS"} • ${depot.phone ?? depot.client}.`,
    });
  };

  const sendDialog = (
    <Dialog open={sendOpen} onOpenChange={setSendOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="lg" className="gap-1.5 px-3 text-xs font-bold">
            <AppIcon name="forward" className="size-3.5" />
            Envoyer
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Envoyer au client</DialogTitle>
          <DialogDescription>
            {depot.client} • {depot.phone ?? "téléphone non renseigné"}
          </DialogDescription>
        </DialogHeader>
        <RadioGroup value={channel} onValueChange={setChannel} className="gap-2">
          {[
            ["whatsapp", `WhatsApp • ${depot.phone ?? "—"}`],
            ["sms", `SMS • ${depot.phone ?? "—"}`],
          ].map(([value, label]) => (
            <Label
              key={value}
              htmlFor={`send-${value}`}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold",
                channel === value ? "border-primary bg-primary/5" : "border-border text-muted-foreground",
              )}
            >
              <RadioGroupItem id={`send-${value}`} value={value} />
              {label}
            </Label>
          ))}
        </RadioGroup>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setSendOpen(false)}>
            Annuler
          </Button>
          <Button size="sm" onClick={handleSend}>
            Envoyer le document
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
          aria-label="Retour au dépôt"
          onClick={() => router.back()}
          className="mt-1 bg-primary text-white hover:bg-primary/90 hover:text-white"
        >
          <AppIcon name="back" className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl">
            Ticket et facture
            <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-muted-foreground">
              {depot.code}
            </Badge>
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Prévisualisez, imprimez ou partagez les documents du dépôt d&apos;{depot.client}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="lg" className="gap-1.5 px-3 text-xs font-bold" onClick={handleDownload}>
            <AppIcon name="download" className="size-3.5" />
            Télécharger PDF
          </Button>
          {sendDialog}
          <Button size="lg" className="gap-1.5 px-3 text-xs font-bold" onClick={handlePrint}>
                <AppIcon name="print" className="size-4" />
            Imprimer
          </Button>
        </div>
      </div>

      {/* Bandeau hors connexion */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-100">
        <AppIcon name="wifi" className="size-4 text-amber-600" />
        <p className="min-w-0 flex-1 text-xs text-amber-800">
          Impression disponible hors connexion • en cas de coupure, le numéro temporaire LOCAL-BGV-0042 sera utilisé puis synchronisé.
        </p>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700">
          <span className="size-1.5 rounded-full bg-amber-500" />
          POS-01 prêt
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Aperçus */}
        <div className="rounded-2xl border border-border bg-slate-100/70 p-4 sm:p-6 xl:col-span-2">
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            {/* Ticket 80 mm */}
            <div className={cn("mx-auto w-full max-w-72 bg-white px-5 py-6 shadow-md", format === "ticket" && "ring-2 ring-primary")}>
              <div className="flex flex-col items-center text-center">
                <Logo size="lg" />
                <p className="mt-2 text-sm font-extrabold tracking-wide">SPARK PRESSING</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Agence {depot.agency} • RCCM CI-ABJ-2024-B-01842</p>
                <p className="text-[10px] text-muted-foreground">Carrefour Feh Kessé • +225 27 22 40 14 07</p>
              </div>
              <div className="my-3 border-t border-dashed border-border" />
              <div className="space-y-1 text-xs">
                <p className="flex justify-between"><span className="text-muted-foreground">TICKET</span><span className="font-bold">{depot.code}</span></p>
                <p className="flex justify-between"><span className="text-muted-foreground">Date</span><span>28/09/2026 • 10:21</span></p>
                <p className="flex justify-between"><span className="text-muted-foreground">Client</span><span className="font-semibold">{depot.client}</span></p>
                <p className="flex justify-between"><span className="text-muted-foreground">Téléphone</span><span>{depot.phone ?? "—"}</span></p>
              </div>
              <div className="my-3 border-t border-dashed border-border" />
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 text-[11px] font-bold">
                <span>ARTICLE</span><span>QTÉ</span><span>P.U.</span><span className="text-right">TOTAL</span>
              </div>
              <div className="mt-1 space-y-1.5 text-[11px]">
                {detail.articles.map((a, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3">
                    <span>{a.label}</span>
                    <span className="text-center">{a.qte}</span>
                    <span className="text-right">{formatFCFA(a.prix)}</span>
                    <span className="text-right font-bold">{formatFCFA(a.qte * a.prix)}</span>
                  </div>
                ))}
              </div>
              <div className="my-3 border-t border-dashed border-border" />
              <div className="space-y-1 text-xs">
                <p className="flex justify-between text-muted-foreground"><span>Sous-total</span><span className="text-foreground">{formatFCFA(detail.sousTotal)}</span></p>
                {detail.express > 0 && (
                  <p className="flex justify-between text-muted-foreground"><span>Express +30 %</span><span className="text-foreground">{formatFCFA(detail.express)}</span></p>
                )}
                {remisesPoints > 0 && (
                  <p className="flex justify-between text-muted-foreground"><span>Remises / points</span><span className="text-foreground">−{formatFCFA(remisesPoints)}</span></p>
                )}
                <p className="flex justify-between text-sm"><span className="font-bold">TOTAL TTC</span><span className="font-extrabold">{formatFCFA(detail.total)} FCFA</span></p>
                <p className="flex justify-between text-muted-foreground"><span>Payé • {moyen}</span><span className="text-foreground">{formatFCFA(paye)} FCFA</span></p>
                <p className="flex justify-between font-extrabold text-red-600"><span>RESTE</span><span>{formatFCFA(reste)} FCFA</span></p>
              </div>
              <div className="mt-3 rounded bg-amber-50 px-3 py-2 text-center">
                <p className="text-[10px] font-bold tracking-wide text-amber-700">RETRAIT PRÉVU</p>
                <p className="text-[13px] font-extrabold">{retraitCourt}</p>
              </div>
              <QrCode seed={depot.code} className="mx-auto mt-3 size-16 text-foreground" />
              <p className="mt-1 text-center text-[10px] font-bold">{depot.code}</p>
              <p className="mt-2 text-center text-[10px] leading-snug text-muted-foreground">
                Merci pour votre confiance. Conservez ce ticket pour le retrait.
              </p>
            </div>

            {/* Facture A4 */}
            <div className={cn("bg-white p-6 shadow-md sm:p-8", format === "facture" && "ring-2 ring-primary")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Logo />
                  <div>
                    <p className="text-sm font-extrabold">SPARK PRESSING</p>
                    <p className="text-[10px] font-semibold text-amber-600">SOIN TEXTILE PREMIUM</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold tracking-wide">FACTURE</p>
                  <p className="mt-0.5 text-xs font-bold">{factureNo}</p>
                  <p className="text-[11px] text-muted-foreground">Émise le 28 septembre 2026</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "mt-1 border-0 text-[10px] font-bold",
                      statut === "Payée" ? "bg-emerald-50 text-emerald-700" : statut === "Non payée" ? "bg-red-50 text-red-600" : "bg-amber-100 text-amber-700",
                    )}
                  >
                    {statut}
                  </Badge>
                </div>
              </div>
              <p className="mt-2 text-[10px] leading-snug text-muted-foreground">
                Agence {depot.agency} • Carrefour Feh Kessé<br />
                +225 27 22 40 14 07 • contact@spark.ci<br />
                RCCM CI-ABJ-2024-B-01842 • CC 2418596 X
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] font-bold tracking-wide text-muted-foreground">FACTURÉ À</p>
                  <p className="mt-1 text-[13px] font-bold">{depot.client}</p>
                  <p className="text-[11px] text-muted-foreground">{depot.phone ?? "—"}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] font-bold tracking-wide text-muted-foreground">RÉFÉRENCE DÉPÔT</p>
                  <p className="mt-1 text-[13px] font-bold">{depot.code}</p>
                  <p className="text-[11px] text-muted-foreground">Retrait {retraitCourt.toLowerCase()}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-[1fr_auto_auto_auto] gap-x-4 bg-muted/50 px-3 py-2 text-[10px] font-bold text-muted-foreground">
                <span>DÉSIGNATION</span><span>Qté</span><span>P.U.</span><span className="text-right">Total</span>
              </div>
              <div className="divide-y divide-border text-xs">
                {detail.articles.map((a, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-3 py-2">
                    <span>{a.label}</span>
                    <span className="text-center">{a.qte}</span>
                    <span className="text-right text-muted-foreground">{formatFCFA(a.prix)}</span>
                    <span className="text-right font-semibold">{formatFCFA(a.qte * a.prix)}</span>
                  </div>
                ))}
                {detail.express > 0 && (
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-3 py-2">
                    <span>Majoration Express 8 h</span>
                    <span className="text-center">1</span>
                    <span className="text-right text-muted-foreground">{formatFCFA(detail.express)}</span>
                    <span className="text-right font-semibold">{formatFCFA(detail.express)}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold">Conditions et règlement</p>
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                    TVA non applicable — régime simplifié. Paiement reçu en espèces. Le solde est dû au retrait des articles.
                  </p>
                  {paye > 0 && (
                    <Badge variant="outline" className="mt-2 gap-1 border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
                      {moyen} • {formatFCFA(paye)} FCFA
                    </Badge>
                  )}
                </div>
                <div className="space-y-1 text-xs">
                  <p className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span>{formatFCFA(detail.sousTotal + detail.express)}</span></p>
                  {detail.remise > 0 && (
                    <p className="flex justify-between"><span className="text-muted-foreground">Remise</span><span>−{formatFCFA(detail.remise)}</span></p>
                  )}
                  {detail.pointsMontant > 0 && (
                    <p className="flex justify-between"><span className="text-muted-foreground">Points utilisés</span><span>−{formatFCFA(detail.pointsMontant)}</span></p>
                  )}
                  <p className="flex justify-between"><span className="text-muted-foreground">TVA</span><span>0 FCFA</span></p>
                  <p className="flex justify-between text-[13px]"><span className="font-bold">Total TTC</span><span className="font-extrabold">{formatFCFA(detail.total)} FCFA</span></p>
                  <p className="flex justify-between"><span className="text-muted-foreground">Payé</span><span>{formatFCFA(paye)} FCFA</span></p>
                  <p className="flex justify-between rounded bg-amber-50 px-2 py-1 font-bold text-amber-700"><span>Reste</span><span>{formatFCFA(reste)} FCFA</span></p>
                </div>
              </div>
              <div className="mt-6 flex items-end justify-between gap-3 border-t border-border pt-4">
                <p className="max-w-xs text-[10px] leading-snug text-muted-foreground">
                  Merci pour votre confiance. Document généré par SPARK Cloud. Pour suivre votre dépôt, scannez le QR code.
                </p>
                <div className="text-center">
                  <QrCode seed={factureNo} className="mx-auto size-14 text-foreground" />
                  <p className="mt-1 text-[9px] font-bold">{depot.code}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barre latérale */}
        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Format du document</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Choisissez le rendu avant impression</p>
            <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              {(["ticket", "facture"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-bold transition-colors",
                    format === f ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f === "ticket" ? "Ticket" : "Facture A4"}
                </button>
              ))}
            </div>
            <div className="mt-3 space-y-1.5 text-xs">
              <p className="flex justify-between"><span className="text-muted-foreground">Imprimante</span><span className="font-semibold">POS-01 • thermique 80 mm</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Copies</span>
                <span className="flex items-center gap-1.5">
                  <button type="button" aria-label="Moins de copies" onClick={() => setCopies((c) => Math.max(1, c - 1))} className="flex size-5 items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground">
                    <AppIcon name="minus" className="size-3" />
                  </button>
                  <span className="font-bold">{copies} exemplaire{copies > 1 ? "s" : ""}</span>
                  <button type="button" aria-label="Plus de copies" onClick={() => setCopies((c) => Math.min(5, c + 1))} className="flex size-5 items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground">
                    <AppIcon name="plus" className="size-3" />
                  </button>
                </span>
              </p>
              <p className="flex justify-between"><span className="text-muted-foreground">Facture</span><span className="font-semibold">A4 • PDF archivé</span></p>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Actions</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Ticket {depot.code}</p>
            <div className="mt-3 space-y-2">
              <Button size="lg" className="w-full justify-center gap-1.5 text-xs font-bold" onClick={handlePrint}>
            <AppIcon name="print" className="size-4" />
                Imprimer maintenant
              </Button>
              <Button variant="outline" size="lg" className="w-full justify-center gap-1.5 text-xs font-bold" onClick={handleDownload}>
                <AppIcon name="download" className="size-4" />
                Télécharger le PDF
              </Button>
              <Button variant="outline" size="lg" className="w-full justify-center gap-1.5 text-xs font-bold" onClick={() => setSendOpen(true)}>
                <AppIcon name="forward" className="size-4" />
                Envoyer au client
              </Button>
            </div>
            <div className="mt-3 rounded-lg bg-muted/50 p-3 text-xs">
              <p className="text-[10px] font-bold tracking-wide text-muted-foreground">ENVOI CLIENT</p>
              <p className="mt-1 font-bold">{depot.client}</p>
              <p className="text-muted-foreground">WhatsApp • {depot.phone ?? "—"}</p>
            </div>
          </section>

          <section className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-100">
            <div className="flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                <AppIcon name="print" className="size-4 text-amber-600" />
              </span>
              <div>
                <h2 className="text-[13px] font-bold">Impression hors connexion</h2>
                <p className="text-[11px] font-semibold text-amber-700">Toujours disponible sur POS-01</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-snug text-amber-800">
              Si le cloud est indisponible, un numéro local temporaire est imprimé puis remplacé à la prochaine synchronisation.
            </p>
            <div className="mt-2 rounded-lg bg-white/70 p-2.5 text-[11px]">
              <p className="flex justify-between"><span className="text-muted-foreground">Numéro temporaire</span><span className="font-bold text-amber-700">LOCAL-BGV-0042</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">File locale</span><span className="font-semibold">0 document en attente</span></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
