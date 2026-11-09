import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getArticleDetailAction } from "@/actions/AdminAction";
import type { ApiArticleDetail } from "@/lib/types";
import ArticleEditView from "./ArticleEditView";
import type { Article, Facturation } from "../data";

const BILLING_MODES: Record<string, Facturation> = {
  "Pièce": "Pièce",
  "Kilo": "Kilo",
  "Mixte": "Mixte",
};

function mapArticleDetail(detail: ApiArticleDetail): Article {
  const mode = BILLING_MODES[detail.billing_mode_label];
  if (!mode) {
    throw new Error(`Mode de facturation inconnu pour l'article ${detail.code}.`);
  }

  const updatedAt = detail.price_updated_at ? new Date(detail.price_updated_at) : null;
  const daysAgo =
    updatedAt && !Number.isNaN(updatedAt.getTime())
      ? Math.max(0, Math.floor((Date.now() - updatedAt.getTime()) / 86400000))
      : 0;

  return {
    code: detail.code,
    nom: detail.name,
    categorie: detail.category?.name ?? "Sans catégorie",
    mode,
    classique: detail.classic_price ?? 0,
    express: detail.express_price,
    repassage: detail.repass_price ?? 0,
    statut: detail.status ? "Actif" : "Inactif",
    portee: detail.scope?.label ?? "—",
    daysAgo,
    agences: (detail.availability?.agencies ?? [])
      .filter((agency) => agency.available)
      .map((agency) => agency.agency),
  };
}

async function EditContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const result = await getArticleDetailAction(id);
  if (!result.success) {
    if (result.error.includes("Non autorisé")) redirect("/login");
    notFound();
  }
  const article = mapArticleDetail(result.data.data);
  return <ArticleEditView article={article} />;
}

function EditFallback() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Chargement de l'article">
      <div className="h-8 w-72 animate-pulse rounded bg-muted" />
      <div className="h-64 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}

export default function ArticleEditRoute({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<EditFallback />}>
      <EditContent params={params} />
    </Suspense>
  );
}
