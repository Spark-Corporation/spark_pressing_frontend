"use client";

import { useEffect, useState } from "react";
import {
  Banknote,
  Check,
  Clock,
  ExternalLink,
  Fingerprint,
  Hash,
  Pause,
  Play,
  Printer,
  RefreshCw,
  ScrollText,
  ShieldCheck,
  TriangleAlert,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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

type OpStatus = "synced" | "reconciled" | "progress" | "conflict" | "waiting" | "resolved";

interface Op {
  id: string;
  title: string;
  sub: string;
  status: OpStatus;
  extra?: string;
  resolvedLabel?: string;
}

const INITIAL_OPS: Op[] = [
  { id: "op1", title: "Dépôt LOCAL-COC-0041 • Fatou Diarra", sub: "UUID 57a2…9fc1 • créé à 16:24 • 8 500 FCFA", status: "synced", extra: "→ DP-2026-2843" },
  { id: "op2", title: "Encaissement LOCAL-PAY-0198", sub: "Espèces • 8 500 FCFA • ticket thermique imprimé", status: "reconciled" },
  { id: "op3", title: "Dépôt LOCAL-COC-0042 • Aminata Koné", sub: "Envoi des 6 articles et du paiement…", status: "progress" },
  { id: "op4", title: "Code promotionnel RENTREE15", sub: "Conflit : code désactivé à 16:29 sur le serveur.", status: "conflict" },
  { id: "op5", title: "Ticket LOCAL-TK-0042", sub: "En attente de la renumérotation du dépôt", status: "waiting" },
];

const JOURNAL = [
  ["16:34:12", "Lot SYNC-0928-16H32 créé — 5 opérations en file"],
  ["16:34:18", "Dépôt LOCAL-COC-0041 accepté → DP-2026-2843"],
  ["16:34:21", "Encaissement LOCAL-PAY-0198 rapproché — 8 500 FCFA"],
  ["16:34:26", "Envoi du dépôt LOCAL-COC-0042 — tentative 1/5"],
  ["16:29:03", "Conflit RENTREE15 — code désactivé sur le serveur"],
  ["16:24:07", "Ticket LOCAL-TK-0042 mis en file — renumérotation requise"],
];

const TOTAL = 5;

function OpIcon({ status }: { status: OpStatus }) {
  if (status === "synced" || status === "reconciled" || status === "resolved") {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <Check className="size-4" />
      </span>
    );
  }
  if (status === "progress") {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
        <RefreshCw className="size-4 animate-spin" />
      </span>
    );
  }
  if (status === "conflict") {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <TriangleAlert className="size-4" />
      </span>
    );
  }
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <Clock className="size-4" />
    </span>
  );
}

export default function SynchronisationPage() {
  const [ops, setOps] = useState<Op[]>(INITIAL_OPS);
  const [pct, setPct] = useState(72);
  const [done, setDone] = useState(3);
  const [succes, setSucces] = useState(3);
  const [attention, setAttention] = useState(1);
  const [encours, setEncours] = useState(1);
  const [renum, setRenum] = useState("2 / 3");
  const [suspended, setSuspended] = useState(false);
  const [countdown, setCountdown] = useState(12);
  const [choice, setChoice] = useState("conserver");
  const [conflictDone, setConflictDone] = useState(false);

  const complete = done >= TOTAL;
  const progress = Math.round((done / TOTAL) * 100);

  // Avancement simulé de l'opération en cours
  useEffect(() => {
    if (suspended || complete) return;
    const t = setInterval(() => {
      setPct((p) => {
        const next = p + 7;
        if (next >= 100) {
          clearInterval(t);
          setOps((list) =>
            list.map((o) =>
              o.id === "op3"
                ? { ...o, status: "synced", sub: "6 articles et paiement envoyés • tentative 1/5", extra: "→ DP-2026-2844" }
                : o.id === "op5"
                  ? { ...o, status: "synced", sub: "Renuméroté → TK-2026-2844 • synchronisé" }
                  : o,
            ),
          );
          setDone(4);
          setSucces(4);
          setEncours(0);
          setRenum("3 / 3");
          toast.success("Dépôt synchronisé", { description: "LOCAL-COC-0042 → DP-2026-2844." });
          return 100;
        }
        return next;
      });
    }, 1500);
    return () => clearInterval(t);
  }, [suspended, complete]);

  // Compte à rebours de reprise automatique
  useEffect(() => {
    if (suspended || complete) return;
    const t = setInterval(() => setCountdown((c) => (c <= 0 ? 12 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [suspended, complete]);

  const toggleSuspend = () => {
    setSuspended((s) => {
      toast.info(s ? "Synchronisation reprise" : "Synchronisation suspendue", {
        description: s ? "La file repart dans l'ordre de création." : "Les opérations restent en file locale.",
      });
      return !s;
    });
  };

  const handleResolve = () => {
    if (conflictDone) return;
    if (choice === "attente") {
      toast.info("Confié à un responsable", { description: "Le conflit RENTREE15 reste en attente de décision." });
      return;
    }
    const label = choice === "conserver" ? "Résolu — exception auditée" : "Résolu — 1 845 FCFA à régulariser";
    setOps((list) =>
      list.map((o) => (o.id === "op4" ? { ...o, status: "resolved", resolvedLabel: label } : o)),
    );
    setConflictDone(true);
    setDone(5);
    setSucces(5);
    setAttention(0);
    toast.success("Conflit résolu", {
      description: choice === "conserver" ? "Remise conservée — exception journalisée." : "Remise retirée — 1 845 FCFA à régulariser.",
    });
  };

  const mmss = `00:${String(countdown).padStart(2, "0")}`;

  return (
    <div className="space-y-5">
      {/* Bandeau connexion */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <Wifi className="size-4 text-emerald-600" />
        </span>
        <div className="min-w-0 flex-1 text-xs">
          <p className="font-bold text-emerald-900">
            {complete
              ? "File vide — toutes les opérations sont synchronisées"
              : suspended
                ? "Synchronisation suspendue — les opérations restent en file locale"
                : "Connexion restaurée — synchronisation automatique en cours"}
          </p>
          {!complete && (
            <p className="text-emerald-700">
              Les opérations locales sont envoyées dans leur ordre de création. Vous pouvez continuer à encaisser.
            </p>
          )}
        </div>
        <Badge variant="outline" className="border-0 bg-emerald-100 text-[10px] font-bold text-emerald-800">
          {done} / {TOTAL} traitées
        </Badge>
        <Dialog>
          <DialogTrigger
            render={
              <Button variant="outline" size="sm" className="gap-1.5 border-emerald-200 bg-white text-xs font-bold">
                <ScrollText className="size-3.5" />
                Ouvrir le journal
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Journal de synchronisation</DialogTitle>
              <DialogDescription>Lot SYNC-0928-16H32 • heure locale de l&apos;appareil.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2.5">
              {JOURNAL.map(([heure, texte], i) => (
                <div key={i} className="flex gap-2.5 text-xs">
                  <span className="w-14 shrink-0 font-bold text-muted-foreground">{heure}</span>
                  <p className="min-w-0">{texte}</p>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("Journal exporté", { description: "Le fichier sera archivé avec la caisse." })}
              >
                Exporter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* En-tête */}
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Retour en ligne et synchronisation</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Contrôlez les opérations locales sans quitter le contexte de caisse.
          </p>
        </div>
        <Button variant="outline" size="lg" className="gap-1.5 px-3 text-xs font-bold" onClick={toggleSuspend}>
          {suspended ? <Play className="size-4" /> : <Pause className="size-4" />}
          {suspended ? "Reprendre" : "Suspendre"}
        </Button>
      </div>

      {/* Cartes */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="text-sm font-bold">Progression globale</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{done} opérations terminées sur {TOTAL}</p>
          <Progress value={progress} className="mt-3 [&_[data-slot=progress-indicator]]:bg-emerald-500" />
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-primary">{progress} %</p>
            <p className="text-[11px] text-muted-foreground">
              {complete ? "File vide" : `~ ${(TOTAL - done) * 6} secondes restantes`}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">File locale sécurisée</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Aucune donnée perdue</p>
            </div>
            <ShieldCheck className="size-5 text-muted-foreground" />
          </div>
          <div className="mt-4 grid grid-cols-4 text-center">
            {[
              [TOTAL, "opérations"],
              [succes, "succès"],
              [attention, "attention"],
              [encours, "en cours"],
            ].map(([v, l]) => (
              <div key={l as string}>
                <p className="text-xl font-extrabold">{v}</p>
                <p className="text-[11px] text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold">Reprise automatique</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {complete ? "File à jour" : `Prochaine tentative dans ${mmss}`}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "border-0 text-[10px] font-bold",
                suspended ? "bg-amber-100 text-amber-700" : "bg-muted text-foreground",
              )}
            >
              {suspended ? "Suspendue" : "Active"}
            </Badge>
          </div>
          <p className="mt-4 text-xs leading-snug text-muted-foreground">
            Les erreurs réseau temporaires seront retentées jusqu&apos;à 5 fois avec délai progressif.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {/* Opérations */}
          <div className="rounded-xl border border-border bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Opérations locales en attente</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Ordre chronologique sécurisé par UUID.</p>
              </div>
              <Badge variant="outline" className="border-0 bg-sky-100 text-[10px] font-bold text-sky-700">
                Lot SYNC-0928-16H32
              </Badge>
            </div>
            <div className="mt-2 divide-y divide-border">
              {ops.map((op) => (
                <div
                  key={op.id}
                  className={cn(
                    "flex items-center gap-3 py-3.5",
                    op.status === "progress" && "rounded-xl bg-sky-50/60 px-3 ring-1 ring-sky-100",
                    op.status === "conflict" && "rounded-xl bg-amber-50/70 px-3 ring-1 ring-amber-100",
                  )}
                >
                  <OpIcon status={op.status} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold">{op.title}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{op.sub}</p>
                    {op.status === "progress" && (
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-sky-600 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {op.status === "synced" && (
                      <>
                        <Badge variant="outline" className="border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
                          Synchronisé
                        </Badge>
                        {op.extra && <p className="mt-0.5 text-[11px] text-muted-foreground">{op.extra}</p>}
                      </>
                    )}
                    {op.status === "reconciled" && (
                      <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-foreground">
                        Rapproché
                      </Badge>
                    )}
                    {op.status === "progress" && <p className="text-xs font-extrabold text-sky-700">{pct} %</p>}
                    {op.status === "conflict" && <p className="text-xs font-bold text-amber-700">Décision requise</p>}
                    {op.status === "waiting" && (
                      <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-muted-foreground">
                        En attente
                      </Badge>
                    )}
                    {op.status === "resolved" && (
                      <Badge variant="outline" className="border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
                        {op.resolvedLabel ?? "Résolu"}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Intégrité */}
          <div className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold">Contrôles d&apos;intégrité</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Vérifications appliquées avant écriture serveur.</p>
            <div className="mt-2 divide-y divide-border text-[13px]">
              <div className="flex items-center gap-2.5 py-3">
                <Fingerprint className="size-4 shrink-0 text-muted-foreground" />
                <p className="flex-1">Déduplication UUID — aucune opération en double</p>
                <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-foreground">
                  Validé
                </Badge>
              </div>
              <div className="flex items-center gap-2.5 py-3">
                <Hash className="size-4 shrink-0 text-muted-foreground" />
                <p className="flex-1">Renumérotation locale → serveur</p>
                <Badge variant="outline" className="border-0 bg-sky-100 text-[10px] font-bold text-sky-700">
                  {renum}
                </Badge>
              </div>
              <div className="flex items-center gap-2.5 py-3">
                <Banknote className="size-4 shrink-0 text-muted-foreground" />
                <p className="flex-1">Encaissements rapprochés</p>
                <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-foreground">
                  18 200 FCFA
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Latéral */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-[13px] font-bold">Dépôt en cours</h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Le contexte de caisse est conservé.</p>
              </div>
              <Badge variant="outline" className="border-0 bg-sky-100 text-[10px] font-bold text-sky-700">
                Synchronisation
              </Badge>
            </div>
            <div className="mt-3 flex items-center gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-800">
                AK
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold">Aminata Koné</p>
                <p className="truncate text-[11px] text-muted-foreground">LOCAL-COC-0042 → DP-2026-2844</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">Total encaissé</span>
              <span className="text-lg font-extrabold">12 300 FCFA</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="lg"
                className="gap-1.5 text-xs font-bold"
                onClick={() => toast.success("Ticket réimprimé", { description: "Ticket thermique POS-01." })}
              >
                <Printer className="size-4" />
                Réimprimer
              </Button>
              <Button
                size="lg"
                className="gap-1.5 text-xs font-bold"
                onClick={() => toast.info("Dépôt distant", { description: "DP-2026-2844 s'ouvrira après synchronisation." })}
              >
                <ExternalLink className="size-4" />
                Voir le dépôt
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Résoudre le conflit</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Le code RENTREE15 n&apos;est plus valide.</p>
            {conflictDone ? (
              <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs ring-1 ring-emerald-100">
                <p className="font-bold text-emerald-800">Conflit résolu</p>
                <p className="mt-0.5 text-emerald-700">La file reprend dans l&apos;ordre de création.</p>
              </div>
            ) : (
              <>
                <div className="mt-3 rounded-lg bg-amber-50 p-3 text-[11px] leading-snug text-amber-800 ring-1 ring-amber-100">
                  La remise locale de 1 845 FCFA a déjà été annoncée au client.
                </div>
                <RadioGroup value={choice} onValueChange={setChoice} className="mt-3 gap-2">
                  {[
                    ["conserver", "Conserver la remise", "Créer une exception auditée"],
                    ["retirer", "Retirer la remise", "Ajouter 1 845 FCFA à régulariser"],
                    ["attente", "Mettre en attente", "Décision d'un responsable requise"],
                  ].map(([value, title, sub]) => (
                    <Label
                      key={value}
                      htmlFor={`sync-${value}`}
                      className={cn(
                        "flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-xs",
                        choice === value ? "border-emerald-500 bg-emerald-50/40" : "border-border",
                      )}
                    >
                      <RadioGroupItem id={`sync-${value}`} value={value} className="mt-0.5" />
                      <span>
                        <span className="block font-bold">{title}</span>
                        <span className="block font-normal text-muted-foreground">{sub}</span>
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
                <Button size="lg" className="mt-3 w-full justify-center gap-1.5 text-xs font-bold" onClick={handleResolve}>
                  <Play className="size-4" />
                  Appliquer et reprendre
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
