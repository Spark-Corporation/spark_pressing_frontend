import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RETRAITS } from "../data";
import { getRetraitDetail } from "./detail";
import RetraitTraitView from "./RetraitTraitView";

export function generateStaticParams() {
  return RETRAITS.map((r) => ({ code: r.code }));
}

async function TraitContent({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const found = getRetraitDetail(code);
  if (!found) notFound();
  return <RetraitTraitView retrait={found.retrait} detail={found.detail} />;
}

function TraitFallback() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Chargement du retrait">
      <div className="h-8 w-72 animate-pulse rounded bg-muted" />
      <div className="h-24 animate-pulse rounded-xl bg-muted" />
      <div className="h-64 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}

export default function RetraitTraitRoute({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense fallback={<TraitFallback />}>
      <TraitContent params={params} />
    </Suspense>
  );
}
