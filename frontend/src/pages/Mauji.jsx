import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { waLink } from "@/lib/content";
import BrandProducts from "@/components/BrandProducts";

const journey = [
  "Shri Maujilal Ji",
  "Namkeen Business – Baktra Village",
  "Tradition of Indian Snacking",
  "MAUJI – Makhana",
  "Modern Makhana & Flavoured Makhana",
];

const flavours = [
  "Peri-Peri",
  "Mint / Pudina",
  "Magic Masala",
  "Cream & Onion",
];

export default function Mauji() {
  return (
    <main className="bg-cream">
      <Seo
        title="MAUJI – Makhana | MRS Ventures"
        description="Discover MAUJI Makhana, connecting traditional Indian snacking heritage with modern makhana."
        canonical="https://mrsventures.co.in/mauji"
      />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="text-amber-brand uppercase tracking-widest text-sm">
              By MRS Ventures
            </p>

            <h1 className="mt-5 font-serif text-4xl sm:text-5xl text-forest-deep">
              MAUJI – Makhana
            </h1>

            <p className="mt-5 font-serif text-2xl text-forest-deep">
              A Tradition of Indian Snacking, a New Chapter with Makhana.
            </p>

            <p className="mt-6 text-slate-600 leading-relaxed">
              MAUJI connects a traditional namkeen heritage with modern
              makhana and flavoured makhana. Discover our collection and
              find your favourite flavour for everyday snack moments.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                to="/shop?category=flavoured-makhana"
                className="rounded-full bg-forest text-white px-6 py-3"
              >
                Shop Flavoured Makhana
              </Link>

              <a
                href={waLink("Hello, I would like to enquire about MAUJI Makhana.")}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-forest text-forest-deep px-6 py-3"
              >
                WhatsApp Enquiry
              </a>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(13,59,46,0.12)]">
            <img
              src="/images/field/muji makhana.jpeg"
              alt="MAUJI Makhana — Baat Ki Khatir, trusted since 1972"
              className="w-full h-full object-cover aspect-[9/7]"
            />
          </div>
        </div>

        <BrandProducts
  brand="MAUJI"
  title="Shop MAUJI Makhana"
/>

        <section className="mt-16 max-w-4xl">
          <h2 className="font-serif text-3xl text-forest-deep">
            The MAUJI Story
          </h2>

          <div className="mt-5 space-y-4 text-slate-600 leading-relaxed">
            <p>
              The MAUJI story begins with Shri Maujilal Ji from
              Baktra village, who established a namkeen business.
            </p>

            <p>
              From this traditional connection with namkeen and Indian
              snacking, the journey continues into the development of
              MAUJI – Makhana.
            </p>

            <p>
              MAUJI brings this heritage into a modern snacking
              collection of makhana and flavoured makhana.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-3xl text-forest-deep">
            Our Journey
          </h2>

          <ol className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {journey.map((step, index) => (
              <li
                key={step}
                className="rounded-2xl border border-forest/10 bg-white p-6"
              >
                <span className="text-sm font-semibold text-amber-brand">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-serif text-xl text-forest-deep">
                  {step}
                </h3>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-3xl text-forest-deep">
            Explore Our Flavours
          </h2>

          <p className="mt-4 text-slate-600">
            Our flavoured makhana range includes:
          </p>

          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {flavours.map((flavour) => (
              <article
                key={flavour}
                className="rounded-2xl border border-forest/10 bg-white p-6"
              >
                <h3 className="font-serif text-2xl text-forest-deep">
                  {flavour}
                </h3>
                <p className="mt-3 text-slate-600">
                  Explore available packs in our shop.
                </p>
              </article>
            ))}
          </div>

          <Link
            to="/shop?category=flavoured-makhana"
            className="inline-block mt-7 rounded-full bg-forest text-white px-6 py-3"
          >
            View Available Packs
          </Link>
        </section>

        <section className="mt-16 rounded-3xl border border-forest/10 bg-white p-6 sm:p-8">
          <h2 className="font-serif text-3xl text-forest-deep">
            Raw Makhana
          </h2>

          <p className="mt-4 text-slate-600 leading-relaxed">
            We are exploring raw makhana grades including 3 Suta,
            4 Suta, 5 Suta, 5+ Suta HP, 6 Suta, 6+ HP, and mixed sizes.
            The final range, pack sizes, and retail pricing will be
            confirmed separately.
          </p>

          <a
            href={waLink("Hello, I would like to enquire about raw makhana availability and grades.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 text-forest-deep font-medium underline"
          >
            Enquire About Raw Makhana
          </a>
        </section>

        <section className="mt-14 max-w-4xl">
          <h2 className="font-serif text-3xl text-forest-deep">
            Know Your Pack
          </h2>

          <p className="mt-4 text-slate-600 leading-relaxed">
            Check the individual product page and packaging for
            ingredients, allergens, nutritional information, net quantity,
            storage instructions, and best-before details.
          </p>
        </section>
      </section>
    </main>
  );
}