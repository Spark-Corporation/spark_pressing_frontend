import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DEPOTS } from "../../data";
import { getDepotDetail } from "../detail";
import TicketView from "./TicketView";

export function generateStaticParams() {
  return DEPOTS.map((d) => ({ code: d.code }));
}

async function TicketContent({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const found = getDepotDetail(code);
  if (!found) notFound();
  return <TicketView depot={found.depot} detail={found.detail} />;
}

function TicketFallback() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Chargement du document">
      <div className="h-8 w-72 animate-pulse rounded bg-muted" />
      <div className="h-96 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}

export default function TicketRoute({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense fallback={<TicketFallback />}>
      <TicketContent params={params} />
    </Suspense>
  );
}
