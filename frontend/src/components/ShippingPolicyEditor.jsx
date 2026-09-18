import { useEffect, useState } from "react";
import {
  adminGetShippingPolicy,
  adminSaveShippingPolicy,
} from "@/lib/api";

const fields = [
  ["introduction", "Introduction"],
  ["order_processing", "Order Processing"],
  ["delivery_timelines", "Delivery Timelines"],
  ["shipping_charges", "Shipping Charges"],
  ["order_tracking", "Order Tracking"],
];

export default function ShippingPolicyEditor({ token }) {
  const [details, setDetails] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    setDetails(null);
    setError("");

    adminGetShippingPolicy(token)
      .then((data) => {
        if (active) setDetails(data);
      })
      .catch(() => {
        if (active) setError("Could not load policy. Please log in again.");
      });

    return () => {
      active = false;
    };
  }, [token]);

  async function save(event) {
    event.preventDefault();
    if (saving || !details) return;

    setSaving(true);
    setError("");
    setMessage("");

    const payload = Object.fromEntries(
      fields.map(([key]) => [key, details[key] || ""])
    );

    try {
      const saved = await adminSaveShippingPolicy(token, payload);
      setDetails(saved);
      setMessage("Shipping Policy saved successfully.");
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Your session expired. Please log in again."
          : "Could not save the policy. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="max-w-3xl">
      <h2 className="text-2xl font-semibold mb-6">
        Shipping Policy
      </h2>

      {error && <p role="alert" className="text-red-600 mb-4">{error}</p>}
      {message && <p role="status" className="text-green-700 mb-4">{message}</p>}

      {!details ? (
        !error && <p>Loading policy...</p>
      ) : (
        <form onSubmit={save} className="space-y-5">
          {fields.map(([key, label]) => (
            <div key={key}>
              <label htmlFor={`shipping-${key}`} className="block mb-2">
                {label}
              </label>

              <textarea
                id={`shipping-${key}`}
                rows={key === "introduction" ? 2 : 4}
                maxLength={key === "introduction" ? 2000 : 10000}
                value={details[key] || ""}
                disabled={saving}
                onChange={(event) =>
                  setDetails((previous) => ({
                    ...previous,
                    [key]: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-forest/20 p-3 bg-white"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-forest text-white px-6 py-3 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Shipping Policy"}
          </button>
        </form>
      )}
    </section>
  );
}