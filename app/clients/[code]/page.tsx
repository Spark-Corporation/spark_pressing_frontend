import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CLIENTS } from "../data";
import { getClientDetail } from "./detail";
import ClientDetailView from "./ClientDetailView";

export function generateStaticParams() {
  return CLIENTS.map((c) => ({ code: c.code }));
}

async function DetailContent({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const found = getClientDetail(code);
  if (!found) notFound();
  return <ClientDetailView client={found.client} detail={found.detail} />;
}

function DetailFallback() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Chargement de la fiche client">
      <div className="flex items-center gap-3">
        <div className="size-8 animate-pulse rounded-lg bg-muted" />
        <div className="size-14 animate-pulse rounded-2xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-white" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}

export default function ClientDetailRoute({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense fallback={<DetailFallback />}>
      <DetailContent params={params} />
    </Suspense>
  );
}
