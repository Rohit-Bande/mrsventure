import React from "react";
import Seo from "@/components/Seo";
import Reveal from "@/components/Reveal";
import { FAQS } from "@/lib/content";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question", name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="bg-cream min-h-[60vh]">
      <Seo title="FAQ | MRS Ventures" description="Frequently asked questions about MADHULOGY™ honey, makhana, delivery and ordering."
        canonical="https://mrsventures.co.in/faq" jsonLd={jsonLd} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <Reveal className="text-center">
          <p className="text-xs uppercase tracking-[0.25em] font-semibold text-amber-brand">Good to Know</p>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl font-bold text-forest-deep">Frequently Asked Questions</h1>
        </Reveal>
        <Reveal delay={100} className="mt-10">
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} data-testid={`faq-item-${i}`} className="rounded-2xl border border-forest/10 bg-white px-5">
                <AccordionTrigger className="font-serif text-lg text-forest-deep hover:no-underline text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-slate-600">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </div>
  );
}
