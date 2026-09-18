import { useRef, useState } from "react";
import { submitServiceRequest } from "@/lib/api";

const emptyForm = {
  name: "",
  mobile: "",
  location: "",
  property_type: "Home / Apartment",
  approximate_hive_height: "",
  description: "",
  preferred_date: "",
  preferred_time: "",
};

const properties = [
  "Home / Apartment",
  "Housing Society",
  "Bungalow / Farmhouse",
  "Commercial Property",
  "Tree / Outdoor Location",
  "Other",
];

export default function ServiceRequestForm() {
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState(null);
const photoInput = useRef(null);

  function update(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setMessage("");
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
     const result = await submitServiceRequest(
  {
    ...form,
    mobile: form.mobile.trim(),
  },
  photo
);

      setMessage(result.message);
      setForm({ ...emptyForm });

      setPhoto(null);
      if (photoInput.current) photoInput.current.value = "";
    } catch (err) {
     const detail = err.response?.data?.detail;

setError(
  err.response?.status === 429
    ? "Too many requests. Please wait before trying again."
    : typeof detail === "string"
      ? detail
      : "Could not send your request. Please try again."
);
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-forest/20 bg-white p-3";

  return (
    <section
      id="request-service"
      className="mt-16 scroll-mt-28 rounded-3xl border border-forest/10 bg-white p-6 sm:p-8"
    >
      <h2 className="font-serif text-3xl text-forest-deep">
        Request Service
      </h2>

      <p className="mt-3 text-slate-600">
        Share your site details. The team will contact you to confirm
        availability, charges, and appointment arrangements.
      </p>

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

      <form onSubmit={submit} className="mt-6">
        <fieldset disabled={saving} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <label htmlFor="service-name">
              Name *
              <input
                id="service-name"
                name="name"
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                value={form.name}
                onChange={update}
                className={inputClass}
              />
            </label>

            <label htmlFor="service-mobile">
              Mobile Number *
              <input
                id="service-mobile"
                name="mobile"
                type="tel"
                required
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                autoComplete="tel-national"
                placeholder="10-digit Indian mobile number"
                value={form.mobile}
                onChange={update}
                className={inputClass}
              />
            </label>
          </div>

          <label htmlFor="service-location" className="block">
            Location / Address *
            <textarea
              id="service-location"
              name="location"
              required
              minLength={3}
              maxLength={1000}
              rows={2}
              value={form.location}
              onChange={update}
              className={inputClass}
            />
          </label>

          <div className="grid sm:grid-cols-2 gap-5">
            <label htmlFor="service-property">
              Property Type *
              <select
                id="service-property"
                name="property_type"
                value={form.property_type}
                onChange={update}
                className={inputClass}
              >
                {properties.map((property) => (
                  <option key={property} value={property}>
                    {property}
                  </option>
                ))}
              </select>
            </label>

            <label htmlFor="service-height">
              Approximate Hive Height *
              <input
                id="service-height"
                name="approximate_hive_height"
                required
                maxLength={200}
                placeholder="For example: 10 feet or second floor"
                value={form.approximate_hive_height}
                onChange={update}
                className={inputClass}
              />
            </label>
          </div>

          <label htmlFor="service-description" className="block">
            Description *
            <textarea
              id="service-description"
              name="description"
              required
              minLength={10}
              maxLength={5000}
              rows={4}
              placeholder="Describe the hive location and access to the site."
              value={form.description}
              onChange={update}
              className={inputClass}
            />
          </label>


<label htmlFor="service-photo" className="block">
  Site Photo — Optional
  <input
    ref={photoInput}
    id="service-photo"
    type="file"
    accept="image/jpeg,image/png,image/webp"
    className={inputClass}
    onChange={(event) => {
      const file = event.target.files?.[0];
      setPhoto(null);
      setError("");
      setMessage("");

      if (!file) return;

      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 5 * 1024 * 1024
      ) {
        setError("Choose a JPEG, PNG, or WebP photo up to 5 MB.");
        event.target.value = "";
        return;
      }

      setPhoto(file);
    }}
  />

  <span className="block mt-2 text-sm text-slate-500">
    Take photographs only from a safe distance. Photos are accessible
    to the admin and used to assess your request.
  </span>
</label>


          <div className="grid sm:grid-cols-2 gap-5">
            <label htmlFor="service-date">
              Preferred Date
              <input
                id="service-date"
                name="preferred_date"
                type="date"
                value={form.preferred_date}
                onChange={update}
                className={inputClass}
              />
            </label>

            <label htmlFor="service-time">
              Preferred Time
              <input
                id="service-time"
                name="preferred_time"
                type="time"
                value={form.preferred_time}
                onChange={update}
                className={inputClass}
              />
            </label>
          </div>

          <p className="text-sm text-slate-500">
            Your preferred date and time are subject to confirmation.
            We’ll use these details to respond to your enquiry.{" "}
            <a href="/privacy-policy" className="underline">
              Privacy Policy
            </a>
          </p>

          <button
            type="submit"
            className="rounded-full bg-forest text-white px-6 py-3 disabled:opacity-50"
          >
            {saving ? "Sending..." : "Send Service Request"}
          </button>
        </fieldset>
      </form>
    </section>
  );
}