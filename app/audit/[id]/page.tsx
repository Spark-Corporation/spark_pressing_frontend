import { Suspense } from "react";
import AuditEventDetailClient from "./AuditEventDetailClient";

async function AuditEventRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AuditEventDetailClient id={id} />;
}

function AuditEventFallback() {
  return (
    <div className="mx-auto space-y-4" aria-label="Chargement du détail de l’événement">
      <div className="h-16 animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.9fr)]">
        <div className="h-80 animate-pulse rounded-xl bg-muted" />
        <div className="h-56 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}

export default function AuditEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<AuditEventFallback />}>
      <AuditEventRoute params={params} />
    </Suspense>
  );
}
