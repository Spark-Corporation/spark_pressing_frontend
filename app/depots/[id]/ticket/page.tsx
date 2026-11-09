import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getDepositDetailAction } from "@/actions/AdminAction";
import { formatDateTimeFr, formatMonthYearFr, type Depot } from "../../data";
import type { DepotDetail } from "../detail";
import type { ApiDepositDetail } from "@/lib/types";
import TicketView from "./TicketView";

/**
 * Adapte le détail API au format attendu par TicketView
 * (les types Depot / DepotDetail restent partagés avec les données de démo).
 */
function buildTicketProps(api: ApiDepositDetail): { depot: Depot; detail: DepotDetail } {
  const retraitIso = api.pickup?.retrieve_date ?? api.retrieve_date;
  const retrait = retraitIso ? formatDateTimeFr(retraitIso) : "—";
  const totals = api.totals;

  const depot: Depot = {
    id: api.id,
    code: api.code,
    client: api.client_name || "—",
    phone: api.client_phone ?? undefined,
    prestation: api.is_express ? "Express" : "Classique",
    articles: api.quantity_label ?? api.articles_label ?? "—",
    total: api.total,
    paye: api.advanced,
    retrait,
    etat: (api.etat_label || "À trier") as Depot["etat"],
    synchro: (api.sync_status?.label ?? "À jour") as Depot["synchro"],
    daysAgo: 0,
    agency: api.agency?.name ?? "—",
  };

  const detail: DepotDetail = {
    statutCommercial: api.payment_status?.label ?? (api.left_to_pay <= 0 ? "Soldé" : "En cours"),
    statutDetail: `Retrait prévu ${retrait}`,
    etatAtelier: api.workshop_status?.label ?? api.etat_label,
    etatDetail: api.workshop_detail?.updated_at
      ? `Mise à jour ${formatDateTimeFr(api.workshop_detail.updated_at)}`
      : "Suivi atelier en temps réel",
    synchro: api.sync_status?.label ?? "À jour",
    synchroDetail: api.sync_status?.synced_at
      ? `Cloud confirmé ${formatDateTimeFr(api.sync_status.synced_at)}`
      : "En attente de connexion",
    createdAt: `Déposé le ${formatDateTimeFr(api.deposit_date)}`,
    ticket: api.terminal ? `Ticket ${api.terminal}` : "—",
    articles: api.units.map((u) => ({
      label: u.designation,
      detail: [u.color, u.defects?.map((d) => d.label).join(", "), u.internal_notes]
        .filter(Boolean)
        .join(" • "),
      qte: u.quantity,
      prix: u.unit_price,
    })),
    sousTotal: totals?.subtotal ?? api.subtotal,
    express: totals?.express_supplement ?? api.express_supplement,
    remise: totals?.discount ?? api.discount,
    pointsUtilises: totals?.points_used ?? api.points_redeemed,
    pointsMontant: totals?.points_discount ?? 0,
    total: api.total,
    acomptes: api.payments.map((p) => ({
      moyen: p.payment_method?.label ?? "—",
      date: formatDateTimeFr(p.at),
      recuPar: p.received_by ?? "—",
      montant: p.amount,
    })),
    tags: [
      api.service?.label ?? (api.is_express ? "Express" : "Classique"),
      api.treatment?.defects_reported ? "Taches signalées" : null,
      api.treatment?.pieces_counted ? `${api.treatment.pieces_counted} pièces comptées` : null,
    ].filter(Boolean) as string[],
    mode: api.pickup?.label ?? "Retrait en agence",
    agenceRetrait: api.pickup?.agency ?? api.agency?.name ?? "—",
    retraitPrevu: retrait,
    remarques: api.notes || "Aucune consigne particulière pour ce dépôt.",
    chrono: api.timeline.map((t) => ({
      heure: formatDateTimeFr(t.at),
      title: t.title,
      detail: t.detail ?? "",
    })),
    audit: api.audit.map((a) => ({
      heure: formatDateTimeFr(a.at),
      auteur: a.actor,
      action: a.message,
    })),
    clientSince: api.client_summary?.client_since
      ? formatMonthYearFr(api.client_summary.client_since)
      : "—",
    fidelite: `${api.client_summary?.loyalty_points ?? api.client?.loyalty_points ?? 0} points disponibles`,
    impaye:
      api.client_summary && api.client_summary.previous_unpaid_count > 0
        ? `${api.client_summary.previous_unpaid_count} impayé(s) • ${api.client_summary.previous_unpaid_amount} FCFA`
        : "Aucun impayé antérieur",
  };

  return { depot, detail };
}

async function TicketContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await getDepositDetailAction({ id });

  if (!res.success) {
    if (res.error.includes("Non autorisé") || res.error.includes("Not authenticated")) {
      redirect("/login");
    }
    return (
      <div className="rounded-2xl border border-border bg-white p-10 text-center">
        <p className="text-sm font-bold">Impossible d&apos;afficher le ticket</p>
        <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">{res.error}</p>
        <Link
          href="/depots"
          className="mt-4 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90"
        >
          Retour aux dépôts
        </Link>
      </div>
    );
  }

  const { depot, detail } = buildTicketProps(res.data);
  return <TicketView depot={depot} detail={detail} />;
}

function TicketFallback() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Chargement du document">
      <div className="h-8 w-72 animate-pulse rounded bg-muted" />
      <div className="h-96 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}

export default function TicketRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<TicketFallback />}>
      {/* `params` est une donnée runtime : lecture sous la frontière Suspense. */}
      <TicketContent params={params} />
    </Suspense>
  );
}
