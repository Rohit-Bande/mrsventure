import { Link, useLocation } from "react-router-dom";
import Seo from "@/components/Seo";

const categories = {
  "/dry-fruits": {
    title: "Dry Fruits",
    description:
      "We are exploring premium-quality dry fruits from reliable suppliers, producing regions and, wherever possible, direct farmer connections. The range will be introduced after sourcing, quality and product evaluation.",
    note:
      "Possible future categories include almonds, cashews, walnuts, raisins, pistachios and dates. The final selection has not yet been confirmed.",
  },
  "/natural-spices": {
    title: "Natural Spices",
    description:
      "India is home to some of the world's finest spices. We are exploring sourcing opportunities with farmers, producer groups and trusted suppliers to develop a carefully selected range of whole and ground spices.",
    note:
      "Our focus is on authentic sourcing, quality, freshness and transparent product information. Specific products will be announced once finalized.",
  },
};

export default function ComingSoonProduct() {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, "");
  const category = categories[path];

  if (!category) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-serif text-3xl text-forest-deep">
          Page not found
        </h1>
        <Link to="/" className="inline-block mt-5 underline">
          Back Home
        </Link>
      </main>
    );
  }

  return (
    <main className="bg-cream min-h-[60vh]">
      <Seo
        title={`${category.title} – Coming Soon | MRS Ventures`}
        description={category.description}
        canonical={`https://mrsventures.co.in${path}`}
      />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <p className="text-amber-brand uppercase tracking-widest text-sm">
          Future Product Category
        </p>

        <h1 className="mt-5 font-serif text-4xl sm:text-5xl text-forest-deep">
          {category.title}
        </h1>

        <span className="inline-block mt-5 rounded-full bg-beige px-4 py-2 text-sm font-semibold text-forest-deep">
          Coming Soon
        </span>

        <p className="mt-8 text-slate-600 leading-relaxed text-lg">
          {category.description}
        </p>

        <p className="mt-5 text-slate-600 leading-relaxed">
          {category.note}
        </p>

        <p className="mt-6 text-sm text-slate-500">
          This category is being explored and is not currently available
          to purchase.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/contact"
            className="rounded-full bg-forest text-white px-6 py-3"
          >
            Contact Us
          </Link>

          <Link
            to="/shop"
            className="rounded-full border border-forest text-forest-deep px-6 py-3"
          >
            Shop Available Products
          </Link>
        </div>
      </section>
    </main>
  );
}