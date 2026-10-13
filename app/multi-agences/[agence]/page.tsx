import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AGENCES, getAgence } from "../data";
import AgenceView from "./AgenceView";

export function generateStaticParams() {
  return AGENCES.map((a) => ({ agence: a.slug }));
}

async function AgenceContent({ params }: { params: Promise<{ agence: string }> }) {
  const { agence } = await params;
  const found = getAgence(agence);
  if (!found) notFound();
  return <AgenceView agence={found} />;
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

export default function AgenceRoute({ params }: { params: Promise<{ agence: string }> }) {
  return (
    <Suspense fallback={<AgenceFallback />}>
      <AgenceContent params={params} />
    </Suspense>
  );
}
