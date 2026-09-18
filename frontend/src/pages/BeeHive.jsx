import { Link } from "react-router-dom";
import { Phone, MessageCircle } from "lucide-react";
import Seo from "@/components/Seo";
import {
  waLink,
  WHATSAPP_NUMBER_DISPLAY,
} from "@/lib/content";
import ServiceRequestForm from "@/components/ServiceRequestForm";

const locations = [
  "Homes & Apartments",
  "Housing Societies",
  "Bungalows & Farmhouses",
  "Balconies & Terraces",
  "Commercial Premises",
  "Trees & Outdoor Locations",
];

export default function BeeHive() {
  const callNumber = WHATSAPP_NUMBER_DISPLAY.replace(/[^\d+]/g, "");

  return (
    <main className="bg-cream">
      <Seo
        title="Bee Hive Removal & Relocation | MRS Ventures"
        description="Enquire about bee hive removal and relocation for residential, commercial, and outdoor locations."
        canonical="https://mrsventures.co.in/bee-hive-removal"
      />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="max-w-3xl">
          <p className="text-amber-brand uppercase tracking-widest text-sm">
            MRS Ventures Services
          </p>

          <h1 className="mt-5 font-serif text-4xl sm:text-5xl text-forest-deep">
            Bee Hive Removal & Relocation
          </h1>

          <p className="mt-5 font-serif text-2xl text-forest-deep">
            Safe. Responsible. Bee-Friendly.
          </p>

          <p className="mt-6 text-slate-600 leading-relaxed">
            We provide professional bee hive removal and relocation
            services for locations where bee colonies may create a
            safety concern. Our approach focuses on responsible handling
            and avoiding unnecessary harm to bees wherever feasible.
          </p>

          <p className="mt-4 text-slate-600 leading-relaxed">
            The proposed approach, service availability, charges, and
            scheduling are confirmed after discussing your location
            and site conditions.
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <a
              href={`tel:${callNumber}`}
              className="inline-flex items-center gap-2 rounded-full bg-forest text-white px-6 py-3"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call Now
            </a>

            <a
              href={waLink(
                "Hello, I would like to enquire about bee hive removal and relocation."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-forest text-forest-deep px-6 py-3"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp Now
            </a>

            <a
  href="#request-service"
  className="rounded-full border border-forest text-forest-deep px-6 py-3"
>
  Request Service
</a>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="font-serif text-3xl text-forest-deep">
            Locations We Can Assess
          </h2>

          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((location) => (
              <div
                key={location}
                className="rounded-2xl border border-forest/10 bg-white p-6"
              >
                <h3 className="font-serif text-xl text-forest-deep">
                  {location}
                </h3>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-3xl text-forest-deep">
            How to Request Service
          </h2>

          <ol className="mt-6 grid sm:grid-cols-3 gap-5">
            {[
              [
                "Share Your Details",
                "Tell us your name, contact number, location, property type, and where the hive is situated.",
              ],
              [
                "Discuss the Site",
                "The team will discuss approximate hive height, access, site conditions, and your preferred date and time.",
              ],
              [
                "Confirm Arrangements",
                "The team will confirm availability, the proposed approach, charges, and appointment arrangements.",
              ],
            ].map(([title, text], index) => (
              <li
                key={title}
                className="rounded-2xl border border-forest/10 bg-white p-6"
              >
                <span className="text-amber-brand font-semibold">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h3 className="mt-3 font-serif text-2xl text-forest-deep">
                  {title}
                </h3>

                <p className="mt-3 text-slate-600 leading-relaxed">
                  {text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14 rounded-2xl border border-forest/10 bg-beige p-6">
          <h2 className="font-serif text-2xl text-forest-deep">
            Before the Team Visits
          </h2>

          <p className="mt-3 text-slate-600 leading-relaxed">
            Keep people and pets away from the hive. Avoid disturbing,
            spraying, burning, or attempting to remove it yourself.
            Share photographs only if they can be taken from a safe
            distance.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-3xl text-forest-deep">
            Questions About the Service
          </h2>

          <div className="mt-6 space-y-3">
            {[
              [
                "How much does the service cost?",
                "Charges are confirmed after reviewing your location, hive position, access, and site conditions.",
              ],
              [
                "Can I choose a preferred appointment time?",
                "You can share your preferred date and time. The appointment is confirmed separately by the team.",
              ],
              [
                "Can I send photographs?",
                "Yes, you can share site photographs through WhatsApp if you can take them from a safe distance.",
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
        <ServiceRequestForm />
      </section>
    </main>
  );
}