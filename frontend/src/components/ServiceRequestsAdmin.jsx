import { useEffect, useState } from "react";
import {
  adminGetServiceRequests,
  adminGetServicePhoto,
} from "@/lib/api";

function ServicePhoto({ token, id }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  async function loadPhoto() {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const blob = await adminGetServicePhoto(token, id);
      setUrl(URL.createObjectURL(blob));
    } catch {
      setError("Unable to load photo. Check your admin session.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5">
      {!url && (
        <button
          type="button"
          disabled={loading}
          onClick={loadPhoto}
          className="rounded-xl border border-forest/20 px-4 py-2"
        >
          {loading ? "Loading photo..." : "View Site Photo"}
        </button>
      )}

      {error && <p role="alert" className="mt-2 text-red-600">{error}</p>}

      {url && (
        <img
          src={url}
          alt="Site photo submitted with the service enquiry"
          className="mt-3 max-h-80 max-w-full rounded-xl object-contain"
        />
      )}
    </div>
  );
}

export default function ServiceRequestsAdmin({ token }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    adminGetServiceRequests(token)
      .then((data) => {
  if (active) {
    setRequests(data);
    setLastUpdated(new Date().toLocaleTimeString("en-IN"));
  }
})
      .catch((err) => {
        if (active) {
          setError(
            err.response?.status === 401
              ? "Your session expired. Please log in again."
              : "Could not load service requests."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, refresh]);

  return (
    <section className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-serif text-3xl text-forest-deep">
          Service Requests
        </h2>

        <button
          type="button"
          disabled={loading}
          onClick={() => setRefresh((value) => value + 1)}
          className="rounded-full border border-forest/20 px-5 py-2 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
            </div>

      {lastUpdated && !loading && !error && (
        <p role="status" className="mt-3 text-sm text-slate-500">
          Updated at {lastUpdated} · {requests.length} service requests
        </p>
      )}

      {error && (
        <p role="alert" className="mt-6 text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p role="status" className="mt-6">Loading requests...</p>
      ) : error ? null : requests.length === 0 ? (
        <p className="mt-6 text-slate-600">
          No service requests yet.
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          {requests.map((request) => (
            <article
              key={request.id}
              className="rounded-2xl border border-forest/10 bg-white p-6"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <h3 className="font-serif text-2xl text-forest-deep">
                  {request.name}
                </h3>

                <span className="rounded-full bg-beige px-3 py-1 text-sm">
                  {request.status}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Received:{" "}
                {new Date(request.created_at).toLocaleString("en-IN")}
              </p>

              <dl className="mt-5 grid sm:grid-cols-2 gap-5">
                <div>
                  <dt className="font-medium">Mobile Number</dt>
                  <dd className="mt-1">
                    <a
                      href={`tel:+91${request.mobile}`}
                      className="text-forest-deep underline"
                    >
                      {request.mobile}
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="font-medium">Property Type</dt>
                  <dd className="mt-1 text-slate-600">
                    {request.property_type}
                  </dd>
                </div>

                <div>
                  <dt className="font-medium">Location</dt>
                  <dd className="mt-1 text-slate-600 whitespace-pre-line">
                    {request.location}
                  </dd>
                </div>

                <div>
                  <dt className="font-medium">Approximate Hive Height</dt>
                  <dd className="mt-1 text-slate-600">
                    {request.approximate_hive_height}
                  </dd>
                </div>

                <div>
                  <dt className="font-medium">Preferred Date</dt>
                  <dd className="mt-1 text-slate-600">
                    {request.preferred_date || "Not specified"}
                  </dd>
                </div>

                <div>
                  <dt className="font-medium">Preferred Time</dt>
                  <dd className="mt-1 text-slate-600">
                    {request.preferred_time || "Not specified"}
                  </dd>
                </div>
              </dl>

              <h4 className="mt-5 font-medium">Description</h4>
              <p className="mt-2 text-slate-600 whitespace-pre-line break-words">
                {request.description}
              </p>

              {request.photo && (
  <ServicePhoto
    key={`${request.id}-${token}`}
    token={token}
    id={request.id}
  />
)}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}