import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, Sparkles, Gift, ArrowRight } from "lucide-react";
import Seo from "@/components/Seo";
import Reveal from "@/components/Reveal";
import { HONEY_500_IMAGE, LIFESTYLE_IMAGE } from "@/lib/content";
import { getBusinessInformation } from "@/lib/api";
const C = "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8";

export default function About() {
  const [businessInfo, setBusinessInfo] = useState(null);
const [businessError, setBusinessError] = useState(false);

useEffect(() => {
  let cancelled = false;

  getBusinessInformation()
    .then((details) => {
      if (!cancelled) setBusinessInfo(details);
    })
    .catch(() => {
      if (!cancelled) setBusinessError(true);
    });

  return () => {
    cancelled = true;
  };
}, []);

const businessDetails = [
  {
    label: "Company Legal Name",
    value: businessInfo?.company_legal_name,
  },
  {
    label: "Registered Address",
    value: businessInfo?.registered_address,
  },
  {
    label: "GSTIN",
    value: businessInfo?.gstin,
  },
  {
    label: "FSSAI License",
    value: businessInfo?.fssai_license,
  },
];
  return (
    <div className="bg-cream">
      <Seo title="About MRS Ventures | Premium Indian Natural Foods"
        description="MRS Ventures is a premium Indian natural foods brand, with MADHULOGY™ Pure Raw Honey as its flagship product."
        canonical="https://mrsventures.co.in/about" />

      <section className="bg-forest-deep text-cream py-16 sm:py-24">
        <div className={C}>
          <Reveal>
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-gold">About MRS Ventures</p>
            <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">A premium Indian natural-food brand.</h1>
            <p className="mt-6 max-w-2xl text-cream/75 text-lg">
              MRS Ventures is building a collection of premium natural food products — beginning with
              MADHULOGY™ Pure Raw Honey and expanding into carefully selected products such as makhana and flavoured makhana.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className={`${C} grid lg:grid-cols-2 gap-10 items-center`}>
          <Reveal className="rounded-3xl overflow-hidden shadow-lg">
            <img src={HONEY_500_IMAGE} alt="MADHULOGY honey" className="w-full object-cover aspect-[4/3]" />
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest-deep">Everyday food, naturally good.</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              We were created with a simple belief — everyday food can be both naturally good and
              beautifully presented. From product to packaging to delivery, we obsess over the details
              so you can enjoy natural goodness with confidence.
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Our flagship, MADHULOGY™ Pure Raw Honey, reflects that promise — and it's only the beginning.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-4 pb-16">
        <div className={C}>
          <div className="grid sm:grid-cols-3 gap-5">
            {[[Leaf, "Naturally Inspired", "Inspired by the goodness of natural ingredients."],
              [Sparkles, "Quality First", "Quality is at the heart of every product."],
              [Gift, "Premium Experience", "From product to packaging to delivery."]].map(([Icon, h, d]) => (
              <Reveal key={h} className="rounded-2xl border border-forest/10 bg-white p-6">
                <Icon className="h-7 w-7 text-forest-light" />
                <h3 className="mt-3 font-serif text-xl font-semibold text-forest-deep">{h}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className={C}>
          <div className="rounded-2xl border border-dashed border-forest/25 bg-beige/40 p-6 sm:p-8">
            <h3 className="font-serif text-xl font-semibold text-forest-deep">Business Information</h3>
<p className="text-sm text-slate-500 mt-1">
  {businessError
    ? "Business information is temporarily unavailable."
    : !businessInfo
      ? "Loading business information…"
      : "Our business details."}
</p>            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {businessInfo && businessDetails.map((l) => (
                <div key={l.label} className="rounded-xl bg-white p-3 text-sm">
                  <span className="text-[11px] uppercase tracking-wider text-amber-brand font-semibold">{l.label}</span>
<p className="text-forest-deep mt-0.5 whitespace-pre-line break-words">
  {l.value || "Not provided"}
</p>                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link to="/our-story" className="inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3.5 text-sm font-semibold text-cream hover:bg-forest-deep transition">
              Read Our Story <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
