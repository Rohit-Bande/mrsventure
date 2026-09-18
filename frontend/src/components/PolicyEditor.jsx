import { useEffect, useState } from "react";
import { adminGetPolicy, adminSavePolicy } from "@/lib/api";
import { POLICIES } from "@/lib/content";

const choices = [
  ["returns-policy", "Returns & Refunds"],
  ["privacy-policy", "Privacy Policy"],
  ["terms", "Terms & Conditions"],
];

function PolicyForm({ token, slug }) {
  const [details, setDetails] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    setDetails(null);
    setError("");
    setMessage("");

    adminGetPolicy(token, slug)
      .then((saved) => {
        if (!active) return;

        const policy = saved || POLICIES[slug];

        setDetails({
          title: policy.title,
          intro: policy.intro,
          sections: policy.sections.map(({ h, p }) => ({ h, p })),
        });
      })
      .catch(() => {
        if (active) {
          setError("Could not load policy. Please log in again.");
        }
      });

    return () => {
      active = false;
    };
  }, [token, slug]);

  function updateSection(index, field, value) {
    setDetails((previous) => ({
      ...previous,
      sections: previous.sections.map((section, i) =>
        i === index ? { ...section, [field]: value } : section
      ),
    }));
  }

  async function save(event) {
    event.preventDefault();
    if (!details || saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await adminSavePolicy(token, slug, {
        title: details.title,
        intro: details.intro,
        sections: details.sections,
      });

      setMessage("Policy saved successfully.");
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Your session expired. Please log in again."
          : "Could not save. Check that every heading and section has text."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 text-red-600">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="mb-4 text-green-700">
          {message}
        </p>
      )}

      {!details ? (
        !error && <p>Loading policy...</p>
      ) : (
        <form onSubmit={save}>
          <fieldset disabled={saving} className="space-y-5">
            <div>
              <label htmlFor="policy-title" className="block mb-2">
                Page Title
              </label>
              <input
                id="policy-title"
                required
                maxLength={200}
                value={details.title}
                onChange={(event) =>
                  setDetails({
                    ...details,
                    title: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-forest/20 p-3"
              />
            </div>

            <div>
              <label htmlFor="policy-intro" className="block mb-2">
                Introduction
              </label>
              <textarea
                id="policy-intro"
                rows={3}
                maxLength={2000}
                value={details.intro}
                onChange={(event) =>
                  setDetails({
                    ...details,
                    intro: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-forest/20 p-3"
              />
            </div>

            {details.sections.map((section, index) => (
              <div
                key={index}
                className="rounded-xl border border-forest/15 p-4 space-y-3"
              >
                <div>
                  <label
                    htmlFor={`policy-heading-${index}`}
                    className="block mb-2"
                  >
                    Section {index + 1} Heading
                  </label>
                  <input
                    id={`policy-heading-${index}`}
                    required
                    maxLength={200}
                    value={section.h}
                    onChange={(event) =>
                      updateSection(index, "h", event.target.value)
                    }
                    className="w-full rounded-xl border border-forest/20 p-3"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`policy-text-${index}`}
                    className="block mb-2"
                  >
                    Section Text
                  </label>
                  <textarea
                    id={`policy-text-${index}`}
                    required
                    rows={5}
                    maxLength={10000}
                    value={section.p}
                    onChange={(event) =>
                      updateSection(index, "p", event.target.value)
                    }
                    className="w-full rounded-xl border border-forest/20 p-3"
                  />
                </div>

                <button
                  type="button"
                  disabled={details.sections.length === 1}
                  onClick={() =>
                    setDetails((previous) => ({
                      ...previous,
                      sections: previous.sections.filter(
                        (_, i) => i !== index
                      ),
                    }))
                  }
                  className="text-red-600 disabled:opacity-40"
                >
                  Remove Section
                </button>
              </div>
            ))}

            <button
              type="button"
              disabled={details.sections.length >= 30}
              onClick={() =>
                setDetails((previous) => ({
                  ...previous,
                  sections: [...previous.sections, { h: "", p: "" }],
                }))
              }
              className="rounded-xl border border-forest/20 px-4 py-2"
            >
              Add Section
            </button>

            <div>
              <button
                type="submit"
                className="rounded-full bg-forest text-white px-6 py-3"
              >
                {saving ? "Saving..." : "Save Policy"}
              </button>
            </div>
          </fieldset>
        </form>
      )}
    </div>
  );
}

export default function PolicyEditor({ token }) {
  const [slug, setSlug] = useState("returns-policy");

  return (
    <section className="max-w-3xl">
      <h2 className="text-2xl font-semibold mb-6">
        Customer Care Policies
      </h2>

      <label htmlFor="policy-selection" className="block mb-2">
        Select Policy
      </label>

      <select
        id="policy-selection"
        value={slug}
        onChange={(event) => setSlug(event.target.value)}
        className="w-full rounded-xl border border-forest/20 p-3 mb-6"
      >
        {choices.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <PolicyForm key={slug} token={token} slug={slug} />
    </section>
  );
}