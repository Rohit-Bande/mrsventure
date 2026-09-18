import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Seo from "@/components/Seo";
import { getKnowledgeArticle } from "@/lib/api";

export default function KnowledgeArticle() {
  const { id } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;

    setResult(null);

    getKnowledgeArticle(id)
      .then((article) => {
        if (active) setResult({ id, article });
      })
      .catch((error) => {
        if (active) {
          setResult({
            id,
            error:
              error.response?.status === 404
                ? "Article not found or not published."
                : "Unable to load the article. Please refresh.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  const current = result?.id === id ? result : null;
  const article = current?.article;

  return (
    <main className="bg-cream">
      <Seo
        title={
          article ? `${article.title} | MRS Ventures` : "Article | MRS Ventures"
        }
        description={article?.summary || "MRS Ventures Knowledge Centre"}
        canonical={`https://mrsventures.co.in/knowledge-centre/${id}`}
      />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <Link
          to="/knowledge-centre"
          className="text-forest-deep underline"
        >
          ← Back to Knowledge Centre
        </Link>

        {!current ? (
          <p role="status" className="mt-8">Loading article...</p>
        ) : current.error ? (
          <p role="alert" className="mt-8 text-red-600">
            {current.error}
          </p>
        ) : (
          <article>
            <h1 className="mt-8 font-serif text-4xl sm:text-5xl text-forest-deep">
              {article.title}
            </h1>

            <p className="mt-5 text-lg text-slate-600">
              {article.summary}
            </p>

            <div className="mt-10 whitespace-pre-line break-words text-slate-600 leading-relaxed">
              {article.body}
            </div>
          </article>
        )}
      </section>
    </main>
  );
}