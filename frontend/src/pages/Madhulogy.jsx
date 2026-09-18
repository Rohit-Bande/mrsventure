import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { waLink } from "@/lib/content";
import BrandProducts from "@/components/BrandProducts";

export default function Madhulogy() {
  return (
    <main className="bg-cream">
      <Seo
        title="MADHULOGY™ Raw Natural Honey | MRS Ventures"
        description="Discover MADHULOGY Raw Natural Honey, harvested from naturally made honeycombs."
        canonical="https://mrsventures.co.in/madhulogy"
      />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="text-amber-brand uppercase tracking-widest text-sm">
              MADHULOGY™ · by MRS Ventures
            </p>

            <p className="mt-3 text-forest-deep font-medium">
              Pure • Raw • Natural
            </p>

            <h1 className="mt-5 font-serif text-4xl sm:text-5xl text-forest-deep">
              From Natural Honeycomb to Your Home.
            </h1>

            <p className="mt-6 text-slate-600 leading-relaxed">
              Discover MADHULOGY™ Raw Natural Honey — harvested by us
              from naturally made honeycombs and carefully handled to
              preserve its natural character, authentic taste and goodness.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                to="/shop?category=honey"
                className="rounded-full bg-forest text-white px-6 py-3"
              >
                Shop Honey
              </Link>

              <a
                href={waLink("Hello, I would like to know more about MADHULOGY honey.")}
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
              src="/images/field/honeycomb.jpeg"
              alt="Natural honeycomb harvested for MADHULOGY raw honey"
              className="w-full h-full object-cover aspect-[4/3]"
            />
          </div>
        </div>

<BrandProducts
  brand="MADHULOGY™"
  title="Choose Your Honey Pack"
/>

        <section className="mt-16 max-w-4xl">
          <h2 className="font-serif text-3xl text-forest-deep">
            The MADHULOGY™ Story
          </h2>

          <div className="mt-5 space-y-4 text-slate-600 leading-relaxed">
            <p>
              MADHULOGY™ Raw Natural Honey is our flagship product,
              harvested by us from naturally made honeycombs.
            </p>

            <p>
              We believe in keeping honey as close as possible to its
              natural form. Our honey is carefully harvested and handled
              with minimal intervention, without unnecessary processing
              and without adding preservatives or artificial additives.
            </p>

            <p>
              From natural honeycomb to bottle, our focus is simple —
              preserve the natural character, aroma, taste and texture
              of honey.
            </p>

            <p>
              Thoughtfully harvested and carefully bottled, MADHULOGY™
              brings authentic raw honey from nature to your everyday table.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-3xl text-forest-deep">
            From Honeycomb to Bottle
          </h2>

          <div className="grid sm:grid-cols-3 gap-5 mt-6">
            {[
              [
                "Natural Honeycomb",
                "Every jar begins with a naturally made honeycomb.",
              ],
              [
                "Harvesting & Handling",
                "We personally harvest our honey and handle it with care, keeping intervention minimal.",
              ],
              [
                "Carefully Bottled",
                "Our objective is to preserve the honey’s natural character and bring its authentic taste to your home.",
              ],
            ].map(([title, text]) => (
              <article
                key={title}
                className="bg-white border border-forest/10 rounded-2xl p-6"
              >
                <h3 className="font-serif text-2xl text-forest-deep">
                  {title}
                </h3>
                <p className="mt-3 text-slate-600 leading-relaxed">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-3xl text-forest-deep">
            What Goes Into Every Jar Matters.
          </h2>

          <div className="grid sm:grid-cols-2 gap-5 mt-6">
            {[
              ["Ingredients", "100% Raw Honey"],
              ["Preservatives", "No added preservatives or artificial additives."],
              [
                "Storage",
                "Store in a cool, dry place away from direct sunlight, heat and moisture. Keep the container tightly closed.",
              ],
              [
                "Pack Information",
                "Refer to the individual product page and packaging for net quantity, MRP, batch details and best-before information.",
              ],
            ].map(([title, text]) => (
              <article
                key={title}
                className="bg-white border border-forest/10 rounded-2xl p-6"
              >
                <h3 className="font-medium text-forest-deep">{title}</h3>
                <p className="mt-3 text-slate-600 leading-relaxed">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 max-w-4xl">
          <h2 className="font-serif text-3xl text-forest-deep">
            Honey Questions, Answered
          </h2>

          <div className="mt-6 space-y-3">
            {[
              [
                "How is MADHULOGY™ honey harvested?",
                "Our honey is harvested by us from naturally made honeycombs, carefully handled and bottled with minimal intervention.",
              ],
              [
                "Is honey crystallisation normal?",
                "Honey can naturally crystallise over time. Crystallisation alone cannot establish honey purity or adulteration.",
              ],
              [
                "Why can honey colour and taste vary?",
                "Natural honey can vary in colour, aroma and flavour depending on nectar sources, season and other conditions.",
              ],
              [
                "What is the shelf life?",
                "Please refer to the Best Before date printed on the individual product packaging.",
              ],
              [
                "Is honey suitable for babies?",
                "Honey is not recommended for infants below 12 months of age.",
              ],
            ].map(([question, answer]) => (
              <details
                key={question}
                className="rounded-xl border border-forest/10 bg-white p-5"
              >
                <summary className="cursor-pointer font-medium text-forest-deep">
                  {question}
                </summary>
                <p className="mt-3 text-slate-600 leading-relaxed">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-12">
          <Link
            to="/shop?category=honey"
            className="inline-block rounded-full bg-forest text-white px-6 py-3"
          >
            Explore Available Honey Packs
          </Link>
        </div>
      </section>
    </main>
  );
}