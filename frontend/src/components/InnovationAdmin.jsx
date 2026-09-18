import { useEffect, useState } from "react";
import {
  adminGetInnovation,
  adminSaveInnovation,
} from "@/lib/api";

const statuses = [
  "IDEA",
  "UNDER DEVELOPMENT",
  "PROTOTYPE",
  "TESTING",
  "READY TO LAUNCH",
  "LAUNCHED",
];

const fields = [
  ["heading", "Page Heading", 200, 2],
  ["introduction", "Introduction", 10000, 6],
  ["project_title", "Project Title", 200, 2],
  ["project_description", "Project Description", 10000, 6],
];

export default function InnovationAdmin({ token }) {
  const [details, setDetails] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    setDetails(null);
    setError("");
    setMessage("");

    adminGetInnovation(token)
      .then((data) => {
        if (active) setDetails(data);
      })
      .catch(() => {
        if (active) {
          setError("Could not load Innovation content. Check your login.");
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  async function save(event) {
    event.preventDefault();
    if (!details || saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    const payload = Object.fromEntries(
      fields.map(([key]) => [key, details[key]])
    );
    payload.project_status = details.project_status;

    try {
      const saved = await adminSaveInnovation(token, payload);
      setDetails(saved);
      setMessage("Innovation content saved successfully.");
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Your session expired. Please log in again."
          : "Could not save. Check that all fields contain text."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="max-w-3xl">
      <h2 className="font-serif text-3xl text-forest-deep">
        Innovation
      </h2>

      {error && (
        <p role="alert" className="mt-5 text-red-600">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="mt-5 text-green-700">
          {message}
        </p>
      )}

      {!details ? (
        !error && <p className="mt-6">Loading content...</p>
      ) : (
        <form onSubmit={save} className="mt-6">
          <fieldset
            disabled={saving}
            className="space-y-5 rounded-2xl border border-forest/10 bg-white p-6"
          >
            {fields.map(([key, label, maxLength, rows]) => (
              <label
                key={key}
                htmlFor={`innovation-${key}`}
                className="block"
              >
                {label} *
                <textarea
                  id={`innovation-${key}`}
                  required
                  maxLength={maxLength}
                  rows={rows}
                  value={details[key] || ""}
                  onChange={(event) =>
                    setDetails((previous) => ({
                      ...previous,
                      [key]: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-forest/20 p-3"
                />
              </label>
            ))}

            <label htmlFor="innovation-status" className="block">
              Project Status
              <select
                id="innovation-status"
                value={details.project_status}
                onChange={(event) =>
                  setDetails((previous) => ({
                    ...previous,
                    project_status: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-forest/20 p-3"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className="rounded-full bg-forest text-white px-6 py-3"
            >
              {saving ? "Saving..." : "Save Innovation"}
            </button>
          </fieldset>
        </form>
      )}
    </section>
  );
}