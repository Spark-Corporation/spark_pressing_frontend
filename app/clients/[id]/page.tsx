import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getClientDetailAction } from "@/actions/AdminAction";
import { mapClientDetail } from "./detail";
import ClientDetailView from "./ClientDetailView";

async function DetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getClientDetailAction(id);
  if (!result.success) {
    if (result.error.includes("Non autorisé")) redirect("/login");
    const message = result.error.toLowerCase();
    if (
      message.includes("404") ||
      message.includes("introuvable") ||
      message.includes("not found") ||
      message.includes("no query results for model")
    ) {
      notFound();
    }
    throw new Error(result.error);
  }
  const mapped = mapClientDetail(result.data.data);
  return <ClientDetailView client={mapped.client} detail={mapped.detail} />;
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

export default function ClientDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<DetailFallback />}>
      <DetailContent params={params} />
    </Suspense>
  );
}
