import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

type Article = {
  documentId: string;
  title: string;
  summary: string | null;
};

type ArticleResponse = {
  data: Article | null;
};

async function getArticle(documentId: string): Promise<Article> {
  await connection();
  const baseUrl = process.env.STRAPI_URL ?? "http://localhost:1337";
  const response = await fetch(`${baseUrl}/api/articles/${encodeURIComponent(documentId)}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(`Strapi a répondu ${response.status}`);
  }

  const json: ArticleResponse = await response.json();
  if (!json.data) {
    notFound();
  }

  return json.data;
}

async function ArticleContent({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const article = await getArticle((await params).documentId);

  return (
    <main className="page-shell article-page">
      <nav className="article-page__navigation" aria-label="Navigation de l’article">
        <Link className="back-link" href="/">
          <span aria-hidden="true">←</span> Retour aux articles
        </Link>
      </nav>

      <article className="article-detail">
        <p className="article-card__label">Article</p>
        <h1>{article.title}</h1>
        <div className="article-detail__rule" aria-hidden="true" />
        {article.summary ? (
          <p className="article-detail__summary">{article.summary}</p>
        ) : (
          <p className="article-detail__summary article-detail__summary--empty">
            Cet article ne contient pas encore de résumé.
          </p>
        )}
      </article>

      <footer className="footer">
        <span>TP2 DevOps 2</span>
        <span className="footer__separator" aria-hidden="true">
          /
        </span>
        <span>Next.js · Strapi · PostgreSQL</span>
      </footer>
    </main>
  );
}

export default function ArticlePage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="page-shell article-page">
          <div className="loading-state" aria-live="polite">
            <span className="loading-state__spinner" aria-hidden="true" />
            Chargement de l’article…
          </div>
        </main>
      }
    >
      <ArticleContent params={params} />
    </Suspense>
  );
}
