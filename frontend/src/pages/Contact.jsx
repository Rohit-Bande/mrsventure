import React, { useState, useEffect } from "react";
import { Phone, Mail, MapPin, MessageCircle, Instagram, Loader2 } from "lucide-react";
import Seo from "@/components/Seo";
import Reveal from "@/components/Reveal";
import { sendContact, getBusinessInformation } from "@/lib/api";
import { waLink, INSTAGRAM_URL, WHATSAPP_NUMBER_DISPLAY } from "@/lib/content";
import { toast } from "sonner";

const C = "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8";

export default function Contact() {
  const [businessInfo, setBusinessInfo] = useState(null);
const [addressError, setAddressError] = useState(false);

useEffect(() => {
  let cancelled = false;

  getBusinessInformation()
    .then((details) => {
      if (!cancelled) setBusinessInfo(details);
    })
    .catch(() => {
      if (!cancelled) setAddressError(true);
    });

  return () => {
    cancelled = true;
  };
}, []);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error("Please fill all required fields"); return; }
    setLoading(true);
    try {
      await sendContact(form);
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast.error("Could not send message. Please try WhatsApp.");
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-cream">
      <Seo title="Contact MRS Ventures | Get in Touch"
        description="Contact MRS Ventures — chat on WhatsApp at 09109102611 or send us a message."
        canonical="https://mrsventures.co.in/contact" />

      <div className={`${C} py-14 sm:py-20`}>
        <Reveal className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] font-semibold text-amber-brand">We'd love to hear from you</p>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl font-bold text-forest-deep">Get in Touch</h1>
          <p className="mt-3 text-slate-600">Questions, orders or wholesale — we're happy to help.</p>
        </Reveal>

        <div className="mt-12 grid lg:grid-cols-2 gap-8">
          <Reveal className="space-y-4">
            <a href={waLink("Hello MRS Ventures, I have a question.")} target="_blank" rel="noopener noreferrer" data-testid="contact-whatsapp"
              className="flex items-center gap-4 rounded-2xl border border-forest/10 bg-white p-5 hover:border-forest/30 transition">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[#25D366]/15 text-[#128C43]"><MessageCircle className="h-6 w-6" /></div>
              <div><p className="font-serif text-lg font-semibold text-forest-deep">WhatsApp</p><p className="text-sm text-slate-500">{WHATSAPP_NUMBER_DISPLAY} — Chat or order</p></div>
            </a>
            <a href={`tel:${WHATSAPP_NUMBER_DISPLAY}`} className="flex items-center gap-4 rounded-2xl border border-forest/10 bg-white p-5 hover:border-forest/30 transition">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-forest/10 text-forest-deep"><Phone className="h-6 w-6" /></div>
              <div><p className="font-serif text-lg font-semibold text-forest-deep">Call Us</p><p className="text-sm text-slate-500">{WHATSAPP_NUMBER_DISPLAY}</p></div>
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl border border-forest/10 bg-white p-5 hover:border-forest/30 transition">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-brand/15 text-amber-brand"><Instagram className="h-6 w-6" /></div>
              <div><p className="font-serif text-lg font-semibold text-forest-deep">Instagram</p><p className="text-sm text-slate-500">@venturesmrs</p></div>
            </a>
            <div className="flex items-center gap-4 rounded-2xl border border-forest/10 bg-white p-5">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-forest/10 text-forest-deep"><MapPin className="h-6 w-6" /></div>
              <div><p className="font-serif text-lg font-semibold text-forest-deep">Address</p><p className="text-sm text-slate-500 whitespace-pre-line break-words">
  {addressError
    ? "Address temporarily unavailable"
    : !businessInfo
      ? "Loading address…"
      : businessInfo.registered_address || "Address not provided"}
</p></div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <form onSubmit={submit} className="rounded-2xl border border-forest/10 bg-white p-6 sm:p-8 space-y-4" data-testid="contact-form">
              <div>
                <label className="text-sm font-medium text-forest-deep">Name <span className="text-amber-brand">*</span></label>
                <input value={form.name} onChange={set("name")} data-testid="contact-name" className="mt-1.5 w-full rounded-xl border border-forest/15 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-brand" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-forest-deep">Email <span className="text-amber-brand">*</span></label>
                  <input type="email" value={form.email} onChange={set("email")} data-testid="contact-email" className="mt-1.5 w-full rounded-xl border border-forest/15 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-brand" />
                </div>
                <div>
                  <label className="text-sm font-medium text-forest-deep">Phone</label>
                  <input value={form.phone} onChange={set("phone")} data-testid="contact-phone" className="mt-1.5 w-full rounded-xl border border-forest/15 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-brand" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-forest-deep">Message <span className="text-amber-brand">*</span></label>
                <textarea value={form.message} onChange={set("message")} rows={5} data-testid="contact-message" className="mt-1.5 w-full rounded-xl border border-forest/15 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-brand resize-none" />
              </div>
              <button type="submit" disabled={loading} data-testid="contact-submit"
                className="w-full rounded-full bg-forest py-3.5 text-sm font-semibold text-cream hover:bg-forest-deep transition active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : "Send Message"}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
