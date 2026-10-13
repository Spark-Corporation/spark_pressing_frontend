import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ARTICLES } from "../data";
import ArticleEditView from "./ArticleEditView";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ code: a.code }));
}

async function EditContent({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (code === "nouveau") return <ArticleEditView article={null} />;
  const article = ARTICLES.find((a) => a.code.toLowerCase() === code.toLowerCase());
  if (!article) notFound();
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

export default function ArticleEditRoute({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense fallback={<EditFallback />}>
      <EditContent params={params} />
    </Suspense>
  );
}
