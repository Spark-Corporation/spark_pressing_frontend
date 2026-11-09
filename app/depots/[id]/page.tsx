import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getDepositDetailAction } from "@/actions/AdminAction";
import DepotDetailView from "./DepotDetailView";

async function DetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await getDepositDetailAction({ id });

  if (!res.success) {
    if (res.error.includes("Non autorisé") || res.error.includes("Not authenticated")) {
      redirect("/login");
    }
    return (
      <div className="rounded-2xl border border-border bg-white p-10 text-center">
        <p className="text-sm font-bold">Impossible d&apos;afficher ce dépôt</p>
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

  return <DepotDetailView deposit={res.data} />;
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

export default function DepotDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<DetailFallback />}>
      {/* `params` est une donnée runtime : on la lit sous la frontière Suspense,
          pas dans le composant de route (pré-rendu impossible sinon). */}
      <DetailContent params={params} />
    </Suspense>
  );
}
