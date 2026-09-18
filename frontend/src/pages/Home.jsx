import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Leaf, Award, Sparkles, Truck, ShieldCheck, Hand, Gift, Sprout, MapPin,
  ArrowRight, Star, Quote, Instagram, MessageCircle,
} from "lucide-react";
import Seo from "@/components/Seo";
import Reveal from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import { useShop } from "@/context/ShopContext";
import { API, getProducts, getQualityInformation, getFieldGallery } from "@/lib/api";
import {
  TRUST_STRIP, WHY_US, HONEY_RITUAL, FAQS, INSTAGRAM_GRID,
  HERO_IMAGE, LIFESTYLE_IMAGE, HONEY_500_IMAGE, waLink, INSTAGRAM_URL, currency,
} from "@/lib/content";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

import YouTubeSlider from "@/components/YouTubeSlider";

const ICONS = { Leaf, Award, Sparkles, Truck, ShieldCheck, Hand, Gift, Sprout, MapPin };

const CONTAINER = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

function Overline({ children }) {
  return <p className="text-xs uppercase tracking-[0.25em] font-semibold text-amber-brand">{children}</p>;
}

export default function Home() {
  const [heroVideoReady, setHeroVideoReady] = useState(false);
  const [products, setProducts] = useState([]);
  const [qualityInfo, setQualityInfo] = useState(null);
const [qualityError, setQualityError] = useState(false);

useEffect(() => {
  let cancelled = false;

  getQualityInformation()
    .then((details) => {
      if (!cancelled) setQualityInfo(details);
    })
    .catch(() => {
      if (!cancelled) setQualityError(true);
    });

  return () => {
    cancelled = true;
  };
}, []);
  const [flagship, setFlagship] = useState(null);
  const [tab, setTab] = useState("all");
  const { addToCart } = useShop();

  useEffect(() => {
    getProducts().then((d) => {
      setProducts(d);
      setFlagship(d.find((p) => p.badge === "Flagship") || d[0]);
    }).catch(() => {});
  }, []);

  const [galleryItems, setGalleryItems] = useState([]);

  useEffect(() => {
    getFieldGallery().then((items) => {
      setGalleryItems(items.filter((item) => item.type !== "video").slice(0, 6));
    }).catch(() => {});
  }, []);

  const galleryImageUrl = (src) => new URL(src, new URL(API, window.location.origin)).href;

  const filtered = tab === "all" ? products : products.filter((p) => p.category === tab);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MRS Ventures",
    url: "https://mrsventures.co.in/",
    description: "A premium Indian natural foods brand, with MADHULOGY™ Pure Raw Honey as its flagship product.",
    sameAs: [INSTAGRAM_URL],
    contactPoint: { "@type": "ContactPoint", telephone: "+91-9109102611", contactType: "customer service" },
  };

  return (
    <div className="bg-cream">
      <Seo
        title="MRS Ventures — Premium Indian Natural Foods | MADHULOGY™ Pure Raw Honey"
        description="Discover MADHULOGY™ Pure Raw Honey by MRS Ventures — naturally rich, authentic honey. Shop pure raw honey, premium makhana & flavoured makhana online in India."
        canonical="https://mrsventures.co.in/"
        image={HERO_IMAGE}
        jsonLd={jsonLd}
      />

      {/* HERO */}
      <section className="relative overflow-hidden bg-forest-deep">
        <div className="relative h-[75vh] min-h-[420px] sm:h-[85vh] sm:min-h-[520px] lg:h-[92vh] lg:min-h-[640px] w-full">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/video/Madhulogy_20260917160223.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onPlaying={() => setHeroVideoReady(true)}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 via-forest-deep/10 to-forest-deep/30" />

          <div className={`${CONTAINER} relative h-full flex items-end justify-center sm:justify-start pb-10 sm:pb-14 lg:pb-20`}>
            <Reveal className="flex flex-wrap justify-center sm:justify-start gap-3">
              <Link to="/shop?category=honey" data-testid="hero-shop-honey"
                className="group inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3.5 text-sm font-semibold text-cream transition-transform hover:scale-[1.02] active:scale-95 hover:bg-forest-deep">
                Shop Honey <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/why-madhulogy" data-testid="hero-discover"
                className="inline-flex items-center gap-2 rounded-full border border-cream/60 bg-white/10 backdrop-blur px-7 py-3.5 text-sm font-semibold text-cream transition hover:bg-white/20">
                Discover MADHULOGY™
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-forest/10 bg-cream">
        <div className={`${CONTAINER} grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-forest/10`}>
          {TRUST_STRIP.map((t, i) => {
            const Icon = ICONS[t.icon];
            return (
              <div key={t.title} className="flex flex-col items-center text-center gap-2 p-6 sm:p-8" data-testid={`trust-${i}`}>
                <Icon className="h-7 w-7 text-forest-light" />
                <h3 className="font-serif text-lg font-semibold text-forest-deep">{t.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500">{t.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FLAGSHIP */}
      {flagship && (
        <section className="py-16 sm:py-20 lg:py-24">
          <div className={`${CONTAINER} grid lg:grid-cols-2 gap-10 lg:gap-16 items-center`}>
            <Reveal className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img src={flagship.images?.[0]} alt={flagship.name} className="col-span-2 rounded-3xl object-cover aspect-[11/11] shadow-[0_20px_50px_rgba(13,59,46,0.12)]" />
                <img src={HONEY_500_IMAGE} alt="MADHULOGY honey" className="rounded-2xl object-cover aspect-square" />
                <img src={LIFESTYLE_IMAGE} alt="Honey ritual" className="rounded-2xl object-cover aspect-square" />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <Overline>Meet MADHULOGY™</Overline>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-deep leading-tight">
                Pure Raw Honey, Naturally Exceptional.
              </h2>
              <p className="mt-5 text-slate-600 leading-relaxed">
                MADHULOGY™ is the flagship product of MRS Ventures — a naturally rich, authentic honey
                with a warm amber character, delicate aroma and smooth natural texture.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {[
                  ["Natural Character", "Honey as nature intended."],
                  ["Distinct Taste", "Warm, balanced and floral."],
                  ["Smooth Texture", "Rich and beautifully golden."],
                  ["Premium Packaging", "Thoughtfully bottled with care."],
                ].map(([h, d]) => (
                  <div key={h} className="rounded-2xl bg-beige/60 p-4">
                    <p className="font-serif text-lg font-semibold text-forest-deep">{h}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{d}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link to={`/product/${flagship.slug}`} data-testid="flagship-shop"
                  className="inline-flex items-center gap-2 rounded-full bg-amber-brand px-7 py-3.5 text-sm font-semibold text-white hover:bg-amber-glow transition active:scale-95">
                  Shop MADHULOGY™ <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="font-serif text-2xl font-bold text-forest-deep">
                  {currency(flagship.price)}
                  {flagship.mrp && <span className="ml-2 text-base text-slate-400 line-through font-sans">{currency(flagship.mrp)}</span>}
                </span>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* PRODUCT COLLECTION */}
      <section className="py-16 sm:py-20 bg-beige/50">
        <div className={CONTAINER}>
          <Reveal className="text-center max-w-2xl mx-auto">
            <Overline>Explore Our Collection</Overline>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-deep">
              A Growing Range of Natural Goodness
            </h2>
          </Reveal>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {[
              ["all", "All"], ["honey", "Honey"], ["makhana", "Makhana"], ["flavoured-makhana", "Flavoured Makhana"],
            ].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setTab(val)}
                data-testid={`collection-tab-${val}`}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                  tab === val ? "bg-forest text-cream" : "bg-white text-forest-deep border border-forest/15 hover:bg-forest/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
          <div className="mt-10 text-center">
            <Link to="/shop" data-testid="collection-view-all" className="inline-flex items-center gap-2 rounded-full border border-forest/25 px-7 py-3 text-sm font-semibold text-forest-deep hover:bg-forest/5 transition">
              View Full Shop <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* HONEY RITUAL */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className={`${CONTAINER} grid lg:grid-cols-2 gap-10 lg:gap-16 items-center`}>
          <Reveal className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(13,59,46,0.12)] order-1">
            <img src={LIFESTYLE_IMAGE} alt="Honey drizzled into warm water" className="w-full object-cover aspect-[4/3]" />
          </Reveal>
          <Reveal delay={120} className="order-2">
            <Overline>A Little Golden Ritual</Overline>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-forest-deep">
              Small Moments, Naturally Sweetened.
            </h2>
            <p className="mt-4 text-slate-600">
              A spoonful of honey has a quiet way of making everyday moments feel a little more special.
              Here's how our community loves to enjoy MADHULOGY™.
            </p>
            <div className="mt-6 space-y-3">
              {HONEY_RITUAL.map((r) => (
                <div key={r.title} className="flex gap-3 rounded-2xl bg-beige/60 p-4">
                  <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-brand/15 text-amber-brand"><Sparkles className="h-4 w-4" /></div>
                  <div>
                    <p className="font-serif text-lg font-semibold text-forest-deep">{r.title}</p>
                    <p className="text-sm text-slate-500">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* GALLERY */}
      {galleryItems.length > 0 && (
        <section className="py-16 sm:py-20 bg-beige/50">
          <div className={CONTAINER}>
            <Reveal className="text-center max-w-2xl mx-auto">
              <Overline>Our Work, Our Journey</Overline>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-deep">
                From the Field
              </h2>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {galleryItems.map((item) => (
                <div key={item.id} className="group relative aspect-square overflow-hidden rounded-2xl">
                  <img
                    src={galleryImageUrl(item.src)}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link to="/from-the-field" data-testid="gallery-view-more"
                className="inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3.5 text-sm font-semibold text-cream hover:bg-forest-deep transition">
                View More <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* WHY US */}
      <section className="py-16 sm:py-20 bg-forest-deep text-cream">
        <div className={CONTAINER}>
          <Reveal className="text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-gold">Why MRS Ventures?</p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold">
              Premium in Every Detail.
            </h2>
          </Reveal>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_US.map((w, i) => {
              const Icon = ICONS[w.icon];
              return (
                <Reveal key={w.title} delay={i * 60} className="rounded-2xl border border-cream/15 bg-forest/40 p-6 transition hover:bg-forest/60">
                  <Icon className="h-7 w-7 text-gold" />
                  <h3 className="mt-4 font-serif text-xl font-semibold">{w.title}</h3>
                  <p className="mt-2 text-sm text-cream/70">{w.desc}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* QUALITY / TRANSPARENCY */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className={`${CONTAINER} grid lg:grid-cols-2 gap-10 lg:gap-16 items-center`}>
          <Reveal>
            <Overline>Quality & Transparency</Overline>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-forest-deep">
              What Goes Into Every Jar Matters.
            </h2>
            <p className="mt-4 text-slate-600">
              We believe you deserve to know exactly what you're bringing to your table. Every MADHULOGY™
              product carries clear information — with verified certifications displayed only once documented.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
  {!qualityInfo ? (
    <p className="col-span-2 text-slate-500">
      {qualityError
        ? "Quality information is temporarily unavailable."
        : "Loading quality information…"}
    </p>
  ) : (
    [
      ["Ingredients", qualityInfo.ingredients],
      ["Net Quantity", qualityInfo.net_quantity],
      ["Storage", qualityInfo.storage],
      ["Best Before", qualityInfo.best_before],
      ["FSSAI", qualityInfo.fssai_license],
      ["Lab Report", qualityInfo.lab_report_text],
    ].map(([label, value]) => (
      <div
        key={label}
        className="rounded-xl border border-forest/10 bg-white p-3"
      >
        <p className="text-[11px] uppercase tracking-wider text-amber-brand font-semibold">
          {label}
        </p>

        <p className="mt-0.5 whitespace-pre-line break-words text-forest-deep">
          {value || "Not provided"}
        </p>

        {label === "Lab Report" && qualityInfo.lab_report_url && (
          <a
            href={qualityInfo.lab_report_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-forest-deep underline"
          >
            View Lab Report
          </a>
        )}
      </div>
    ))
  )}
</div>
            <p className="mt-4 text-xs text-slate-400">
              We never display certification badges we cannot verify. Certifications will appear here once documented by the business.
            </p>
          </Reveal>
          <Reveal delay={120} className="rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(13,59,46,0.12)]">
<img
  src={qualityInfo?.image_url || HONEY_500_IMAGE}
  alt="MADHULOGY honey jar close up"
  className="w-full object-cover aspect-[4/5]"
/>          </Reveal>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="py-16 sm:py-20 bg-beige/60">
        <div className={`${CONTAINER} max-w-3xl text-center`}>
          <Reveal>
            <Overline>From Nature to Your Table</Overline>
            <Quote className="mx-auto mt-6 h-10 w-10 text-amber-brand/40" />
            <p className="mt-4 font-serif text-2xl sm:text-3xl lg:text-4xl leading-snug text-forest-deep">
              MRS Ventures was created with a simple belief — everyday food can be both naturally good
              and beautifully presented.
            </p>
            <p className="mt-6 text-slate-600 leading-relaxed">
              We're building a collection of premium natural food products, beginning with MADHULOGY™
              Pure Raw Honey and expanding into carefully selected products such as makhana and flavoured makhana.
            </p>
            <Link to="/our-story" data-testid="brandstory-cta" className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3.5 text-sm font-semibold text-cream hover:bg-forest-deep transition">
              Our Story <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-16 sm:py-20">
        <div className={CONTAINER}>
          <Reveal className="text-center max-w-2xl mx-auto">
            <Overline>Loved by Our Customers</Overline>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-forest-deep">Real Words, Real Warmth</h2>
          </Reveal>
          <Reveal delay={100} className="mt-10 rounded-3xl border border-dashed border-forest/25 bg-beige/40 p-10 sm:p-14 text-center">
            <div className="flex justify-center gap-1 text-amber-brand mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
            </div>
            <p className="font-serif text-2xl text-forest-deep">Customer reviews coming soon</p>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
              Verified customer reviews will appear here as our community grows. Have you tried MADHULOGY™?
            </p>
            <a
  href="https://www.google.com/search?q=madhulogy#lrd=0x3963038e29bee9b7:0x3e5dee1bf8b230fd,1,,,,"
  target="_blank"
  rel="noopener noreferrer"
  className="mt-6 inline-flex items-center gap-2 rounded-full border border-forest/25 px-6 py-3 text-sm font-semibold text-forest-deep hover:bg-forest/5 transition"
>
  <Star className="h-4 w-4" />
  Share Your Experience
</a>
          </Reveal>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="py-16 sm:py-20 bg-beige/50">
        <div className={CONTAINER}>
          <Reveal className="text-center max-w-2xl mx-auto">
            <Overline>@venturesmrs</Overline>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-forest-deep">Follow the MRS Ventures Journey</h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {INSTAGRAM_GRID.map((src, i) => (
              <a key={i} href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
                data-testid={`instagram-tile-${i}`}
                className="group relative aspect-square overflow-hidden rounded-xl">
                <img src={src} alt="MRS Ventures Instagram" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-forest-deep/0 group-hover:bg-forest-deep/40 transition grid place-items-center">
                  <Instagram className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition" />
                </div>
              </a>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" data-testid="instagram-follow"
              className="inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3.5 text-sm font-semibold text-cream hover:bg-forest-deep transition">
              <Instagram className="h-4 w-4" /> Follow Us on Instagram
            </a>
          </div>
        </div>
      </section>

      <YouTubeSlider />

      {/* FAQ */}

      {/* FAQ */}
      <section className="py-16 sm:py-20">
        <div className={`${CONTAINER} max-w-3xl`}>
          <Reveal className="text-center">
            <Overline>Good to Know</Overline>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-forest-deep">Frequently Asked Questions</h2>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <Accordion type="single" collapsible className="space-y-3">
              {FAQS.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`} data-testid={`faq-${i}`} className="rounded-2xl border border-forest/10 bg-white px-5">
                  <AccordionTrigger className="font-serif text-lg text-forest-deep hover:no-underline text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-slate-600">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* WHATSAPP CTA */}
      <section className="pb-20">
        <div className={CONTAINER}>
          <Reveal className="rounded-3xl bg-forest-deep px-6 py-12 sm:px-12 sm:py-16 text-center text-cream relative overflow-hidden">
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-amber-glow/20 blur-3xl" />
            <h2 className="font-serif text-3xl sm:text-4xl font-bold">Have a question? Chat with us.</h2>
            <p className="mt-3 text-cream/75 max-w-xl mx-auto">
              Order directly or ask us anything on WhatsApp — we're happy to help you choose.
            </p>
            <a href={waLink("Hello MRS Ventures, I would like to know more about your products.")} target="_blank" rel="noopener noreferrer"
              data-testid="cta-whatsapp"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-8 py-4 text-sm font-semibold text-white hover:brightness-105 transition active:scale-95">
              <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
            </a>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
