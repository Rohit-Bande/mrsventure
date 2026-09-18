import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { getInnovation } from "@/lib/api";

export default function Innovation() {
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    getInnovation()
      .then((data) => {
        if (active) setDetails(data);
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="bg-cream">
      <Seo
        title="Innovation | MRS Ventures"
        description="Explore practical ideas and innovation projects at MRS Ventures."
        canonical="https://mrsventures.co.in/innovation"
      />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <p className="text-amber-brand uppercase tracking-widest text-sm">
          MRS Ventures Innovation
        </p>

        {error ? (
          <p role="alert" className="mt-8 text-red-600">
            Unable to load Innovation content. Please refresh the page.
          </p>
        ) : !details ? (
          <p role="status" className="mt-8">
            Loading Innovation...
          </p>
        ) : (
          <>
            <div className="max-w-3xl">
              <h1 className="mt-5 font-serif text-4xl sm:text-5xl text-forest-deep">
                {details.heading}
              </h1>

              <p className="mt-6 text-slate-600 leading-relaxed whitespace-pre-line">
                {details.introduction}
              </p>
            </div>

            <section className="mt-14">
              <h2 className="font-serif text-3xl text-forest-deep">
                How We Develop Ideas
              </h2>

              <ol className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  ["Identify", "Start with a real-world problem."],
                  ["Understand", "Explore the task and the people affected."],
                  ["Build", "Develop a practical idea or prototype."],
                  ["Test & Improve", "Learn from testing and refine the solution."],
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

            <section className="mt-16 rounded-3xl border border-forest/10 bg-white p-6 sm:p-10">
              <p className="text-sm text-amber-brand uppercase tracking-widest">
                Featured Innovation Project
              </p>

              <h2 className="mt-4 font-serif text-3xl sm:text-4xl text-forest-deep">
                {details.project_title}
              </h2>

              <span className="inline-block mt-4 rounded-full bg-beige px-4 py-2 text-sm font-semibold text-forest-deep">
                {details.project_status}
              </span>

              <p className="mt-6 max-w-3xl text-slate-600 leading-relaxed whitespace-pre-line">
                {details.project_description}
              </p>

              {details.project_status !== "LAUNCHED" && (
                <p className="mt-5 text-sm text-slate-500">
                  This project is not currently available to purchase.
                </p>
              )}
            </section>

            <section className="mt-14 max-w-3xl">
              <h2 className="font-serif text-3xl text-forest-deep">
                Have a Practical Problem to Share?
              </h2>

              <p className="mt-4 text-slate-600 leading-relaxed">
                Contact us to discuss an everyday problem, an idea,
                or a potential collaboration.
              </p>

              <Link
                to="/contact"
                className="inline-block mt-6 rounded-full bg-forest text-white px-6 py-3"
              >
                Contact Us
              </Link>
            </section>
          </>
        )}
      </section>
    </main>
  );
}