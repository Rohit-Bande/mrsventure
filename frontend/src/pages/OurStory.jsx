import React from "react";
import { Link } from "react-router-dom";
import { Quote, ArrowRight } from "lucide-react";
import Seo from "@/components/Seo";
import Reveal from "@/components/Reveal";
import { LIFESTYLE_IMAGE } from "@/lib/content";

const C = "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8";

const verticals = [
  {
    title: "Products",
    text: "MADHULOGY™ Raw Natural Honey and MAUJI – Makhana.",
    to: "/shop",
    label: "Explore Products",
  },
  {
    title: "Services",
    text: "Responsible Bee Hive Removal & Relocation.",
    to: "/bee-hive-removal",
    label: "Explore Our Service",
  },
  {
    title: "Innovation",
    text: "Practical ideas and solutions for everyday problems.",
    to: "/innovation",
    label: "Discover Innovation",
  },
  {
    title: "Knowledge",
    text: "Educational content, product transparency and real-world stories.",
    to: "/knowledge-centre",
    label: "Visit Knowledge Centre",
  },
];

export default function OurStory() {
  return (
    <div className="bg-cream">
      <Seo
        title="Our Story | MRS Ventures"
        description="Discover the MRS Ventures journey across genuine products, responsible services and practical innovation."
        canonical="https://mrsventures.co.in/our-story"
      />

      <section className="py-16 sm:py-24">
        <div className={C}>
          <Reveal className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-amber-brand">
              From Nature to Products, From Problems to Solutions
            </p>

            <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-forest-deep leading-tight">
              Our Story
            </h1>
          </Reveal>

          <Reveal
            delay={100}
            className="mt-10 rounded-3xl overflow-hidden shadow-lg"
          >
            <img
              src={LIFESTYLE_IMAGE}
              alt="Honey serving scene"
              className="w-full object-cover aspect-[4/2]"
            />
          </Reveal>

          <Reveal delay={150} className="mt-12">
            <Quote
              aria-hidden="true"
              className="h-10 w-10 text-amber-brand/40"
            />

            <p className="mt-2 font-serif text-2xl sm:text-3xl leading-snug text-forest-deep">
              Create genuine products, provide responsible services and
              develop practical solutions that solve real-world problems.
            </p>

            <div className="mt-8 space-y-5 text-slate-600 leading-relaxed">
              <p>
                MRS Ventures is built around this simple idea. We believe
                in learning from the real world, building with purpose
                and delivering with care.
              </p>

              <p>
                Our journey begins with MADHULOGY™ Raw Natural Honey,
                harvested by us from naturally made honeycombs. From
                harvesting to bottling, our focus is on preserving the
                natural character, aroma, taste and texture of honey.
              </p>

              <p>
                We are also building MAUJI – Makhana, carrying forward a
                connection with traditional Indian snacking that began
                with the namkeen business established by Shri Maujilal Ji
                in Baktra village.
              </p>

              <p>
                Alongside our products, we provide Bee Hive Removal &
                Relocation services, with an approach focused on responsible
                handling and avoiding unnecessary harm to bees wherever
                feasible.
              </p>

              <p>
                We are developing practical innovations based on everyday
                problems. Our current Pressure Cooker Whistle Counter
                project is under development.
              </p>
            </div>
          </Reveal>

          <Reveal delay={200} className="mt-14">
            <h2 className="font-serif text-3xl font-semibold text-forest-deep">
              What We’re Building
            </h2>

            <div className="mt-6 grid sm:grid-cols-2 gap-5">
              {verticals.map((vertical) => (
                <article
                  key={vertical.title}
                  className="rounded-2xl border border-forest/10 bg-white p-6"
                >
                  <h3 className="font-serif text-2xl text-forest-deep">
                    {vertical.title}
                  </h3>

                  <p className="mt-3 text-slate-600 leading-relaxed">
                    {vertical.text}
                  </p>

                  <Link
                    to={vertical.to}
                    className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-forest-deep hover:text-amber-brand transition"
                  >
                    {vertical.label}
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>
          </Reveal>

          <Reveal delay={250} className="mt-12 rounded-2xl bg-beige p-6">
            <h2 className="font-serif text-2xl text-forest-deep">
              Looking Ahead
            </h2>

            <p className="mt-4 text-slate-600 leading-relaxed">
              We are exploring future Dry Fruits and Natural Spices
              categories. These ranges will be introduced after sourcing,
              quality and product evaluation.
            </p>

            <div className="mt-5 flex flex-wrap gap-4 text-sm">
              <Link to="/dry-fruits" className="text-forest-deep underline">
                Dry Fruits — Coming Soon
              </Link>

              <Link
                to="/natural-spices"
                className="text-forest-deep underline"
              >
                Natural Spices — Coming Soon
              </Link>
            </div>
          </Reveal>

          <Reveal delay={300} className="mt-12 flex flex-wrap gap-3">
            <Link
              to="/madhulogy"
              className="inline-flex items-center gap-2 rounded-full bg-amber-brand px-7 py-3.5 text-sm font-semibold text-white hover:bg-amber-glow transition"
            >
              Discover MADHULOGY™
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>

            <Link
              to="/mauji"
              className="inline-flex items-center gap-2 rounded-full border border-forest/25 px-7 py-3.5 text-sm font-semibold text-forest-deep hover:bg-forest/5 transition"
            >
              Discover MAUJI
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}