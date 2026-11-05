"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  Check,
  CheckCircle2,
  CircleHelp,
  Copy,
  Fingerprint,
  Link2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { AUDIT_EVENTS, type AuditEvent } from "../data";

const statusClass: Record<AuditEvent["status"], string> = {
  Succès: "bg-emerald-50 text-emerald-700",
  Échec: "bg-red-50 text-red-700",
  "À vérifier": "bg-amber-50 text-amber-700",
};

// figé sur UTC : `timeZoneName` rend "UTC" sur le serveur et "UTC+0" dans le navigateur (mismatch d'hydratation)
const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "UTC",
});

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "UTC",
});

function formatDate(value: string) {
  return `${dateTimeFormatter.format(new Date(value))} UTC`;
}

function formatTime(value: string) {
  return timeFormatter.format(new Date(value));
}

function downloadEvidence(event: AuditEvent) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(event, null, 2)], { type: "application/json;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `evenement-audit-${event.id}.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function DetailCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-border bg-white p-4 sm:p-5 ${className}`}>
      <h2 className="text-sm font-bold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 border-b border-border py-2 last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="max-w-[65%] break-words text-right text-xs font-semibold">{value}</span>
    </div>
  );
}

export default function AuditEventDetailPage({ id }: { id: string }) {
  const event = AUDIT_EVENTS.find((entry) => entry.id === id);
  const [read, setRead] = useState(false);

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-white p-8 text-center">
        <CircleHelp className="mx-auto size-8 text-muted-foreground" />
        <h1 className="mt-3 text-lg font-bold">Événement introuvable</h1>
        <p className="mt-1 text-sm text-muted-foreground">Cette référence n’existe pas dans les données de démonstration.</p>
        <Link href="/audit" className={buttonVariants({ className: "mt-4" })}>Retour au journal</Link>
      </div>
    );
  }

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(event.id);
      toast.success("Référence copiée");
    } catch {
      toast.error("Impossible de copier la référence");
    }
  };

  return (
    <div className="mx-auto space-y-4">
      <div className="flex flex-wrap items-start gap-3">
        <Link
          href="/audit"
          aria-label="Retour au journal"
          className={buttonVariants({ variant: "ghost", size: "icon", className: "mt-1 bg-primary text-white hover:bg-primary/90 hover:text-white" })}
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Journal de supervision</p>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight sm:text-2xl">Détail d’un événement d’audit</h1>
          <p className="mt-1 text-xs text-muted-foreground">{event.id} · {formatDate(event.timestamp)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="lg" className="gap-1.5 font-bold" onClick={() => setRead(true)}>
            {read ? <Check className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
            {read ? "Consulté" : "Marquer comme consulté"}
          </Button>
          <Button variant="outline" size="lg" className="gap-1.5 font-bold" onClick={() => downloadEvidence(event)}>
            <ArrowDownToLine className="size-3.5" />
            Exporter la fiche JSON
          </Button>
          <Button size="lg" className="gap-1.5 font-bold" onClick={() => toast.info("Vérification non connectée", { description: "La vérification cryptographique sera disponible une fois l’API d’audit raccordée." })}>
            <ShieldCheck className="size-3.5" />
            Vérifier l’intégrité
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.9fr)]">
        <div className="space-y-4">
          <DetailCard title="Identité de l’événement">
            <DetailRow label="Référence" value={event.id} />
            <DetailRow label="Action" value={event.action} />
            <DetailRow label="Horodatage" value={formatDate(event.timestamp)} />
            <DetailRow label="Acteur" value={`${event.actor} • ${event.role}`} />
            <DetailRow label="Agence" value={event.agency} />
            <DetailRow label="Ressource" value={event.resource} />
            <DetailRow label="Origine" value={event.source} />
            <DetailRow label="Adresse réseau (exemple)" value={event.ipAddress} />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge className={statusClass[event.status]}>{event.status}</Badge>
              <Badge variant="outline">{event.category}</Badge>
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">{event.severity}</Badge>
              <Button variant="ghost" size="sm" className="ml-auto gap-1 text-xs" onClick={copyReference}>
                <Copy className="size-3" /> Copier la référence
              </Button>
            </div>
            <p className="mt-3 rounded-lg bg-muted/40 px-3 py-2.5 text-[13px] leading-relaxed text-muted-foreground">{event.summary}</p>
            {event.reason && <DetailRow label="Motif / contexte" value={event.reason} />}
          </DetailCard>

          <DetailCard title="Données avant / après">
            {event.before || event.after ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Avant</p>
                  <p className="mt-1.5 text-sm font-bold">{event.before ?? "Aucune valeur précédente"}</p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">Après</p>
                  <p className="mt-1.5 text-sm font-bold">{event.after ?? "Aucune nouvelle valeur"}</p>
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-muted-foreground">Cet événement ne comporte pas de changement de valeur.</p>
            )}
            <div className="mt-3 rounded-lg border border-border">
              {event.relatedRecords.map((record) => <DetailRow key={record.label} label={record.label} value={record.value} />)}
            </div>
          </DetailCard>

          <DetailCard title="Chronologie et preuves">
            <ol className="space-y-0">
              {event.timeline.map((item, index) => (
                <li key={`${item.title}-${item.timestamp}`} className="relative flex gap-3 pb-4 last:pb-0">
                  <span className="relative z-10 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                    <Check className="size-3" />
                  </span>
                  {index < event.timeline.length - 1 && <span className="absolute top-5 bottom-0 left-2.5 w-px bg-border" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[13px] font-bold">{item.title}</p>
                      <time className="text-xs text-muted-foreground">{formatTime(item.timestamp)}</time>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </DetailCard>

          <div className="flex items-start gap-2.5 rounded-xl bg-primary px-4 py-3.5 text-white">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-300" />
            <div>
              <p className="text-[13px] font-bold">Empreinte d’audit de démonstration</p>
              <p className="mt-0.5 text-xs leading-relaxed text-white/70">Les données affichées sont un exemple d’interface ; la vérification cryptographique réelle dépendra de l’API d’audit.</p>
            </div>
            <Fingerprint className="ml-auto size-4 shrink-0 text-secondary" />
          </div>
        </div>

        <aside className="space-y-3">
          <DetailCard title="Pistes liées">
            <div className="space-y-2">
              {event.relatedRecords.map((record) => (
                <div key={record.label} className="rounded-lg border border-border px-3 py-2.5">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    <Link2 className="size-3" /> {record.label}
                  </p>
                  <p className="mt-1 break-words text-xs font-semibold">{record.value}</p>
                </div>
              ))}
            </div>
          </DetailCard>

          <DetailCard title="Empreinte d’intégrité">
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-amber-800">
              <ShieldCheck className="size-4 shrink-0" />
              <div>
                <p className="text-xs font-bold">Empreinte de démonstration</p>
                <p className="text-xs">{event.integrity.algorithm} • non vérifiée par le serveur</p>
              </div>
            </div>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Empreinte présentée (exemple)</p>
            <p className="mt-1 break-all rounded bg-muted/40 p-2 font-mono text-[11px] leading-relaxed">{event.integrity.hash}</p>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Événement précédent</p>
            <p className="mt-1 break-all rounded bg-muted/40 p-2 font-mono text-[11px] leading-relaxed">{event.integrity.previousHash}</p>
          </DetailCard>
        </aside>
      </div>
    </div>
  );
}
