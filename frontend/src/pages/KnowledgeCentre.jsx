import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { getKnowledgeArticles } from "@/lib/api";

export default function KnowledgeCentre() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    getKnowledgeArticles()
      .then((data) => {
        if (active) setArticles(data);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="bg-cream">
      <Seo
        title="Knowledge Centre | MRS Ventures"
        description="Honey education, harvesting stories, and product knowledge from MRS Ventures."
        canonical="https://mrsventures.co.in/knowledge-centre"
      />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <p className="text-amber-brand uppercase tracking-widest text-sm">
          Learn with MADHULOGY™
        </p>

        <h1 className="mt-5 font-serif text-4xl sm:text-5xl text-forest-deep">
          Knowledge Centre
        </h1>

        <p className="mt-6 max-w-3xl text-slate-600 leading-relaxed">
          Explore honey education, harvesting stories, and information
          from our journey.
        </p>

        {loading ? (
          <p role="status" className="mt-10">Loading articles...</p>
        ) : error ? (
          <p role="alert" className="mt-10 text-red-600">
            Unable to load articles. Please refresh.
          </p>
        ) : articles.length === 0 ? (
          <p className="mt-10 text-slate-600">
            Our first articles are being prepared. Check back soon.
          </p>
        ) : (
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article) => (
              <article
                key={article.id}
                className="rounded-2xl border border-forest/10 bg-white p-6"
              >
                <h2 className="font-serif text-2xl text-forest-deep">
                  <Link
                    to={`/knowledge-centre/${article.id}`}
                    className="hover:text-amber-brand"
                  >
                    {article.title}
                  </Link>
                </h2>

                <p className="mt-3 text-slate-600 leading-relaxed">
                  {article.summary}
                </p>

                <Link
                  to={`/knowledge-centre/${article.id}`}
                  className="inline-block mt-5 text-forest-deep underline"
                >
                  Read Article
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}