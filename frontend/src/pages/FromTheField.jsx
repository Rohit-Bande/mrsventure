import { useEffect, useState } from "react";
import { API, getFieldGallery } from "@/lib/api";

import Seo from "@/components/Seo";

export default function FromTheField() {
  const [category, setCategory] = useState("All");
  const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(false);

useEffect(() => {
  let active = true;

  getFieldGallery()
    .then((data) => {
      if (active) setItems(data);
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

 const categories = [
  "All",
  ...new Set(items.map((item) => item.category)),
];

const media =
  category === "All"
    ? items
    : items.filter((item) => item.category === category);

  return (
    <main className="bg-cream">
      <Seo
        title="From the Field | MRS Ventures"
        description="Photographs and videos from MRS Ventures harvesting, sourcing, services and development."
        canonical="https://mrsventures.co.in/from-the-field"
      />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <p className="text-amber-brand uppercase tracking-widest text-sm">
          Our Work, Our Journey
        </p>

        <h1 className="mt-5 font-serif text-4xl sm:text-5xl text-forest-deep">
          From the Field
        </h1>

        <p className="mt-6 max-w-3xl text-slate-600 leading-relaxed">
          A visual journal of honey harvesting, natural honeycombs,
          bee hive relocation, makhana sourcing and processing,
          farmer visits, and practical innovation.
        </p>

        {loading ? (
  <p role="status" className="mt-10">
    Loading gallery...
  </p>
) : error ? (
  <p role="alert" className="mt-10 text-red-600">
    Unable to load the gallery. Please refresh the page.
  </p>
) : items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-forest/10 bg-white p-8">
            <h2 className="font-serif text-2xl text-forest-deep">
              Our Field Journal Is Taking Shape
            </h2>
            <p className="mt-3 text-slate-600">
              Genuine photographs and videos from our work will be
              shared here as they are ready.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap gap-2">
              {categories.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={category === value}
                  onClick={() => setCategory(value)}
                  className={`rounded-full px-4 py-2 text-sm ${
                    category === value
                      ? "bg-forest text-white"
                      : "border border-forest/20 text-forest-deep"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>

            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {media.map((item) => (
                <figure
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-forest/10 bg-white"
                >
                  {item.type === "video" ? (
                    <video
                      controls
                      playsInline
                      preload="metadata"
                      aria-label={item.title}
                      className="w-full aspect-video object-contain bg-black"
                    >
                      <source src={new URL(item.src, new URL(API, window.location.origin)).href} type="video/mp4" />
                      Your browser does not support video playback.
                    </video>
                  ) : (
                    <img
                      src={new URL(item.src, new URL(API, window.location.origin)).href}
                      alt={item.title}
                      loading="lazy"
                      className="w-full aspect-video object-cover"
                    />
                  )}

                  <figcaption className="p-5">
                    <p className="text-xs text-amber-brand uppercase tracking-wider">
                      {item.category}
                    </p>
                    <h2 className="mt-2 font-serif text-xl text-forest-deep">
                      {item.title}
                    </h2>
                  </figcaption>
                </figure>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}