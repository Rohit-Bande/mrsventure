import { useEffect, useState } from "react";
import {
  adminGetKnowledgeArticles,
  adminCreateKnowledgeArticle,
  adminUpdateKnowledgeArticle,
  adminDeleteKnowledgeArticle,
} from "@/lib/api";

const emptyArticle = {
  title: "",
  summary: "",
  body: "",
  published: false,
};

export default function KnowledgeAdmin({ token }) {
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState({ ...emptyArticle });
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const busy = loading || saving || Boolean(deleting);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    adminGetKnowledgeArticles(token)
      .then((data) => {
        if (active) setArticles(data);
      })
      .catch(() => {
        if (active) setError("Could not load articles. Check your login.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  function reset() {
    setEditingId("");
    setForm({ ...emptyArticle });
  }

  function edit(article) {
    setEditingId(article.id);
    setForm({
      title: article.title,
      summary: article.summary,
      body: article.body,
      published: article.published,
    });
    setError("");
    setMessage("");
  }

  async function save(event) {
    event.preventDefault();
    if (busy) return;

    if (!form.title.trim() || !form.summary.trim() || !form.body.trim()) {
      setError("Enter a title, summary, and article text.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim(),
      body: form.body.trim(),
      published: form.published,
    };

    try {
      const saved = editingId
        ? await adminUpdateKnowledgeArticle(token, editingId, payload)
        : await adminCreateKnowledgeArticle(token, payload);

      setArticles((previous) =>
        editingId
          ? previous.map((article) =>
              article.id === saved.id ? saved : article
            )
          : [saved, ...previous]
      );

      reset();
      setMessage(
        saved.published ? "Article published." : "Article saved as a draft."
      );
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Your session expired. Please log in again."
          : "Could not save the article."
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (busy) return;

    setDeleting(id);
    setError("");
    setMessage("");

    try {
      await adminDeleteKnowledgeArticle(token, id);
      setArticles((previous) =>
        previous.filter((article) => article.id !== id)
      );
      if (editingId === id) reset();
      setMessage("Article deleted.");
    } catch {
      setError("Could not delete the article.");
    } finally {
      setDeleting("");
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-forest/20 bg-white p-3";

  return (
    <section className="max-w-4xl">
      <h2 className="font-serif text-3xl text-forest-deep">
        Knowledge Centre
      </h2>

      {error && (
        <p role="alert" className="mt-5 text-red-600">{error}</p>
      )}

      {message && (
        <p role="status" className="mt-5 text-green-700">{message}</p>
      )}

      <form onSubmit={save} className="mt-6">
        <fieldset
          disabled={busy}
          className="space-y-5 rounded-2xl border border-forest/10 bg-white p-6"
        >
          <h3 className="font-serif text-2xl">
            {editingId ? "Edit Article" : "New Article"}
          </h3>

          <label htmlFor="article-title" className="block">
            Title *
            <input
              id="article-title"
              required
              maxLength={200}
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              className={inputClass}
            />
          </label>

          <label htmlFor="article-summary" className="block">
            Summary *
            <textarea
              id="article-summary"
              required
              rows={3}
              maxLength={1000}
              value={form.summary}
              onChange={(event) =>
                setForm({ ...form, summary: event.target.value })
              }
              className={inputClass}
            />
          </label>

          <label htmlFor="article-body" className="block">
            Article Text *
            <textarea
              id="article-body"
              required
              rows={12}
              maxLength={50000}
              value={form.body}
              onChange={(event) =>
                setForm({ ...form, body: event.target.value })
              }
              className={inputClass}
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(event) =>
                setForm({ ...form, published: event.target.checked })
              }
            />
            Publish on the website
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-forest text-white px-6 py-3"
            >
              {saving ? "Saving..." : "Save Article"}
            </button>

            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-forest/20 px-6 py-3"
            >
              Clear / New Article
            </button>
          </div>
        </fieldset>
      </form>

      {loading ? (
        <p className="mt-6">Loading articles...</p>
      ) : articles.length === 0 ? (
        <p className="mt-6 text-slate-600">No articles yet.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {articles.map((article) => (
            <article
              key={article.id}
              className="rounded-2xl border border-forest/10 bg-white p-5"
            >
              <h3 className="font-serif text-xl text-forest-deep">
                {article.title}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {article.published ? "Published" : "Draft"}
              </p>

              <div className="mt-4 flex gap-5">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => edit(article)}
                  className="text-forest-deep underline disabled:opacity-50"
                >
                  Edit
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => remove(article.id)}
                  className="text-red-600 disabled:opacity-50"
                >
                  {deleting === article.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}