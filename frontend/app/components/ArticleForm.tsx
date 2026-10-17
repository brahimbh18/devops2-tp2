"use client";

import { FormEvent, useState } from "react";

type ApiResponse = {
  error?: string;
  data?: {
    title?: string;
  };
};

export default function ArticleForm() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, summary }),
      });
      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "La création de l’article a échoué.");
      }

      setTitle("");
      setSummary("");
      setStatus("success");
      setMessage(`« ${result.data?.title ?? "Article"} » a été créé.`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    }
  }

  return (
    <section className="article-form-section" aria-labelledby="new-article-title">
      <div className="article-form-section__heading">
        <p className="eyebrow">Partager une idée</p>
        <h2 id="new-article-title">Écrire un article</h2>
        <p>Ajoutez une publication à la plateforme éditoriale.</p>
      </div>

      <form className="article-form" onSubmit={handleSubmit}>
        <div className="article-form__fields">
          <label>
            Titre
            <input
              required
              maxLength={120}
              name="title"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Le titre de votre article"
              value={title}
            />
          </label>
          <label>
            Résumé <span>(facultatif)</span>
            <textarea
              maxLength={500}
              name="summary"
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Présentez brièvement votre sujet..."
              rows={4}
              value={summary}
            />
          </label>
        </div>
        <div className="article-form__footer">
          <button disabled={status === "submitting"} type="submit">
            {status === "submitting" ? "Publication..." : "Publier l’article"}
            {status !== "submitting" && <span aria-hidden="true">→</span>}
          </button>
          {message && (
            <p className={`form-message form-message--${status}`} role={status === "error" ? "alert" : "status"}>
              {message}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
