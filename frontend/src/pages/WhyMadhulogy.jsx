import React from "react";
import { Link } from "react-router-dom";
import { Droplet, Leaf, Sparkles, Package, ArrowRight } from "lucide-react";
import Seo from "@/components/Seo";
import Reveal from "@/components/Reveal";
import { HERO_IMAGE } from "@/lib/content";

const C = "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8";

export default function WhyMadhulogy() {
  return (
    <div className="bg-cream">
      <Seo title="Why MADHULOGY™ | Pure Raw Honey by MRS Ventures"
        description="Why choose MADHULOGY™ Pure Raw Honey — natural character, distinct taste, smooth texture and premium packaging."
        canonical="https://mrsventures.co.in/why-madhulogy" />

      <section className="py-16 sm:py-20">
        <div className={`${C} grid lg:grid-cols-2 gap-10 lg:gap-16 items-center`}>
          <Reveal>
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-amber-brand">Why MADHULOGY™</p>
            <h1 className="mt-4 font-serif text-4xl sm:text-5xl font-bold text-forest-deep leading-tight">Pure Raw Honey, Naturally Exceptional.</h1>
            <p className="mt-5 text-slate-600 leading-relaxed">
              MADHULOGY™ is the flagship of MRS Ventures — honey the way nature intended, with nothing to hide.
            </p>
          </Reveal>
          <Reveal delay={100} className="rounded-3xl overflow-hidden shadow-lg">
            <img src={HERO_IMAGE} alt="MADHULOGY Pure Raw Honey" className="w-full object-cover aspect-[4/5]" />
          </Reveal>
        </div>
      </section>

      <section className="pb-16">
        <div className={C}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[[Leaf, "Natural Character", "Honey as nature intended — nothing artificial."],
              [Droplet, "Distinct Taste", "A warm, balanced, floral character."],
              [Sparkles, "Smooth Texture", "Rich and beautifully golden."],
              [Package, "Premium Packaging", "Thoughtfully bottled and delivered with care."]].map(([Icon, h, d]) => (
              <Reveal key={h} className="rounded-2xl border border-forest/10 bg-white p-6">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-amber-brand/15 text-amber-brand"><Icon className="h-5 w-5" /></div>
                <h3 className="mt-4 font-serif text-xl font-semibold text-forest-deep">{h}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{d}</p>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-dashed border-forest/25 bg-beige/40 p-6 sm:p-8 text-center">
            <h3 className="font-serif text-xl font-semibold text-forest-deep">A note on claims</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-2xl mx-auto">
              We display certifications and lab results only when documented by the business. Purity claims,
              FSSAI details and lab reports will appear here once verified.
            </p>
          </div>

          <div className="mt-10 text-center">
            <Link to="/shop?category=honey" className="inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3.5 text-sm font-semibold text-cream hover:bg-forest-deep transition">
              Shop MADHULOGY™ <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
