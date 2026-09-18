import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Seo from "@/components/Seo";
import Reveal from "@/components/Reveal";
import ShippingPolicyContent from "@/components/ShippingPolicyContent";
import { getPolicy } from "@/lib/api";
import { POLICIES } from "@/lib/content";

const editableSlugs = new Set([
  "returns-policy",
  "privacy-policy",
  "terms",
]);

export default function PolicyPage() {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\/+|\/+$/g, "");
  const isShipping = slug === "shipping-policy";
  const needsLoading = editableSlugs.has(slug);

  const [result, setResult] = useState({
    slug: "",
    policy: null,
    error: false,
  });

  useEffect(() => {
    if (!editableSlugs.has(slug)) return;

    let active = true;

    setResult({ slug: "", policy: null, error: false });

    getPolicy(slug)
      .then((saved) => {
        if (active) {
          setResult({
            slug,
            policy: saved || POLICIES[slug],
            error: false,
          });
        }
      })
      .catch(() => {
        if (active) {
          setResult({ slug, policy: null, error: true });
        }
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const fallback = POLICIES[slug];
  const loaded = result.slug === slug;
  const policy = needsLoading
    ? loaded ? result.policy : null
    : fallback;

  if (!fallback) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl text-forest-deep">
          Page not found
        </h1>
        <Link
          to="/"
          className="mt-4 inline-block text-amber-brand underline"
        >
          Back home
        </Link>
      </div>
    );
  }

  const title = policy?.title || fallback.title;

  return (
    <div className="bg-cream min-h-[60vh]">
      <Seo
        title={`${title} | MRS Ventures`}
        description={policy?.intro || fallback.intro}
        canonical={`https://mrsventures.co.in/${slug}`}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <nav
          className="flex items-center gap-1.5 text-sm text-slate-500 mb-5"
          aria-label="Breadcrumb"
        >
          <Link to="/" className="hover:text-forest-deep">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-forest-deep font-medium">
            {title}
          </span>
        </nav>

        <Reveal>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-forest-deep">
            {title}
          </h1>
        </Reveal>

        {isShipping ? (
          <div className="mt-10">
            <ShippingPolicyContent key={slug} />
          </div>
        ) : !loaded && needsLoading ? (
          <p className="mt-6" role="status">
            Loading policy...
          </p>
        ) : loaded && result.error && needsLoading ? (
          <p className="mt-6 text-red-600" role="alert">
            Unable to load this policy. Please refresh the page.
          </p>
        ) : policy ? (
          <>
            <p className="mt-3 text-slate-600 whitespace-pre-line">
              {policy.intro}
            </p>

            <div className="mt-10 space-y-8">
              {policy.sections.map((section, index) => (
                <section key={index}>
                  <h2 className="font-serif text-2xl font-semibold text-forest-deep">
                    {section.h}
                  </h2>
                  <p className="mt-2 text-slate-600 leading-relaxed whitespace-pre-line">
                    {section.p}
                  </p>
                </section>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}