import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DEPOTS } from "../data";
import { getDepotDetail } from "./detail";
import DepotDetailView from "./DepotDetailView";

export function generateStaticParams() {
  return DEPOTS.map((d) => ({ code: d.code }));
}

async function DetailContent({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const found = getDepotDetail(code);
  if (!found) notFound();
  return <DepotDetailView depot={found.depot} detail={found.detail} />;
}

function DetailFallback() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Chargement du dépôt">
      <div className="h-8 w-72 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-white" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}

export default function DepotDetailRoute({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense fallback={<DetailFallback />}>
      <DetailContent params={params} />
    </Suspense>
  );
}
