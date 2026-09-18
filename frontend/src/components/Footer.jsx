import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, MessageCircle, Phone, Globe } from "lucide-react";
import { FOOTER_NAV, waLink, INSTAGRAM_URL, WHATSAPP_NUMBER_DISPLAY } from "@/lib/content";
import { subscribeNewsletter } from "@/lib/api";
import { toast } from "sonner";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await subscribeNewsletter(email);
      toast.success("Thanks for subscribing!");
      setEmail("");
    } catch {
      toast.error("Please enter a valid email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer data-testid="site-footer" className="bg-forest-deep text-cream/90 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-24 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="lg:pr-6">
            <h3 className="font-serif text-2xl font-bold text-cream">MRS Ventures</h3>
            <p className="mt-4 text-sm leading-relaxed text-cream/70">
              A premium Indian natural foods brand, with MADHULOGY™ Pure Raw Honey as its
              flagship product — building a growing collection of carefully selected natural foods.
            </p>
            <div className="mt-6 flex gap-3">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                data-testid="footer-instagram"
                className="grid h-10 w-10 place-items-center rounded-full border border-cream/20 hover:bg-cream/10 transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href={waLink("Hello MRS Ventures, I have a question.")} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                data-testid="footer-whatsapp"
                className="grid h-10 w-10 place-items-center rounded-full border border-cream/20 hover:bg-cream/10 transition">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          <FooterCol title="Shop" links={FOOTER_NAV.shop} />
          <FooterCol title="Company" links={FOOTER_NAV.company} />

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Customer Care</h4>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_NAV.care.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-cream/70 hover:text-cream transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* <div className="mt-12 rounded-2xl border border-cream/15 bg-forest/40 p-6 sm:p-8 grid gap-6 md:grid-cols-2 items-center">
          <div>
            <h4 className="font-serif text-xl font-semibold text-cream">Join the MRS Ventures circle</h4>
            <p className="text-sm text-cream/70 mt-1">Thoughtful updates on new products and golden rituals.</p>
          </div>
          <form onSubmit={submit} className="flex gap-2" data-testid="newsletter-form">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              data-testid="newsletter-input"
              className="flex-1 rounded-full bg-cream text-forest-deep px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-brand"
            />
            <button
              type="submit"
              disabled={loading}
              data-testid="newsletter-submit"
              className="rounded-full bg-amber-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-glow active:scale-95 disabled:opacity-60"
            >
              Subscribe
            </button>
          </form>
        </div> */}

        <div className="mt-10 flex flex-col gap-3 border-t border-cream/15 pt-6 text-sm text-cream/70 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href={`tel:${WHATSAPP_NUMBER_DISPLAY}`} className="flex items-center gap-2 hover:text-cream">
              <Phone className="h-4 w-4" /> {WHATSAPP_NUMBER_DISPLAY}
            </a>
            <a href="https://mrsventures.co.in/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-cream">
              <Globe className="h-4 w-4" /> mrsventures.co.in
            </a>
          </div>
          <div className="flex flex-col gap-1 sm:items-end">
            <p>© {new Date().getFullYear()} MRS Ventures. All rights reserved.</p>
            <a href="https://genixotech.com/digital" target="_blank" rel="noopener noreferrer" className="text-xs text-cream/50 hover:text-cream/80 transition">
              Technology & Digital Partner — Genixotech Digital
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="text-sm text-cream/70 hover:text-cream transition">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
