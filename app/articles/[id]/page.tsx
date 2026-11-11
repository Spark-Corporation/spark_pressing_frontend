import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getArticleDetailAction } from "@/actions/AdminAction";
import ArticleEditView from "./ArticleEditView";

async function EditContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const result = await getArticleDetailAction(id);
  if (!result.success) {
    if (result.error.includes("Non autorisé")) redirect("/login");
    notFound();
  }
  return <ArticleEditView article={result.data.data} />;
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
