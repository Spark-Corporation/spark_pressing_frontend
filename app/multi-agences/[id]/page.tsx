import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AGENCES, getAgencePlaceholder } from "../data";
import AgenceView from "./AgenceView";

export function generateStaticParams() {
  return AGENCES.map((a) => ({ id: String(a.agencyId) }));
}

async function AgenceContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agencyId = Number(id);
  if (!Number.isSafeInteger(agencyId) || agencyId < 1) notFound();

  const found = AGENCES.find((agence) => agence.agencyId === agencyId) ?? getAgencePlaceholder(agencyId);
  return <AgenceView agence={found} agencyId={agencyId} />;
}

function AgenceFallback() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Chargement de l'agence">
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

export default function AgenceRoute({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<AgenceFallback />}>
      <AgenceContent params={params} />
    </Suspense>
  );
}
