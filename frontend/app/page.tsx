import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import ArticleForm from "./components/ArticleForm";

type Article = {
  id: number;
  documentId: string;
  title: string;
  summary: string | null;
};

// URL interne au réseau Docker (nom du service), lue à l'exécution et non au build
async function getArticles(): Promise<Article[]> {
  await connection();
  const baseUrl = process.env.STRAPI_URL ?? "http://localhost:1337";
  const res = await fetch(`${baseUrl}/api/articles`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Strapi a répondu ${res.status}`);
  }
  const json: { data: Article[] } = await res.json();
  return json.data;
}

async function Articles() {
  try {
    const articles = await getArticles();
    if (articles.length === 0) {
      return (
        <div className="empty-state">
          <span className="empty-state__icon" aria-hidden="true">
            ✦
          </span>
          <h2>Aucun article pour le moment</h2>
          <p>Les prochains articles publiés apparaîtront ici.</p>
        </div>
      );
    }

    return (
      <ul className="article-grid">
        {articles.map((article) => (
          <li className="article-card" key={article.documentId}>
            <div className="article-card__accent" aria-hidden="true" />
            <div className="article-card__content">
              <p className="article-card__label">Article</p>
              <h2>{article.title}</h2>
              {article.summary && <p className="article-card__summary">{article.summary}</p>}
              <Link className="article-card__link" href={`/articles/${article.documentId}`}>
                Découvrir <span>→</span>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    );
  } catch (error) {
    const message = String(error);
    const isForbidden = message.includes("403");

    return (
      <div className="error-state" role="alert">
        <span className="error-state__icon" aria-hidden="true">
          !
        </span>
        <div>
          <h2>Les articles sont momentanément indisponibles</h2>
          <p>
            {isForbidden
              ? "L’accès public aux articles doit être activé dans Strapi."
              : "Vérifiez que le service Strapi est démarré, puis réessayez."}
          </p>
        </div>
      </div>
    );
  }
}

export default function Home() {
  return (
    <main className="page-shell">
      <header className="hero">
        <div className="hero__badge">
          <span className="hero__dot" aria-hidden="true" />
          Plateforme éditoriale
        </div>
        <h1>Les idées prennent <em>vie.</em></h1>
        <p className="hero__intro">
          Explorez les dernières publications de notre espace de partage.
        </p>
      </header>

      <section className="articles-section" aria-labelledby="articles-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">À la une</p>
            <h2 id="articles-title">Derniers articles</h2>
          </div>
          <span className="section-heading__line" aria-hidden="true" />
        </div>
        <Suspense
          fallback={
            <div className="loading-state" aria-live="polite">
              <span className="loading-state__spinner" aria-hidden="true" />
              Chargement des articles…
            </div>
          }
        >
          <Articles />
        </Suspense>
      </section>

      <ArticleForm />

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
