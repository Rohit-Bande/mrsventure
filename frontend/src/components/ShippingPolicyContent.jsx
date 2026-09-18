import { useEffect, useState } from "react";
import { getShippingPolicy } from "@/lib/api";

const sections = [
  ["order_processing", "Order Processing"],
  ["delivery_timelines", "Delivery Timelines"],
  ["shipping_charges", "Shipping Charges"],
  ["order_tracking", "Order Tracking"],
];

export default function ShippingPolicyContent() {
  const [policy, setPolicy] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    getShippingPolicy()
      .then((data) => {
        if (active) setPolicy(data);
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return <p>Unable to load the Shipping Policy. Please refresh.</p>;
  }

  if (!policy) return <p>Loading Shipping Policy...</p>;

  return (
    <div>
      <p className="text-slate-500 mb-10 whitespace-pre-line">
        {policy.introduction}
      </p>

      {sections.map(([key, title]) =>
        policy[key] ? (
          <section key={key} className="mb-8">
            <h2 className="text-2xl text-forest mb-3">{title}</h2>
            <p className="text-slate-500 leading-relaxed whitespace-pre-line">
              {policy[key]}
            </p>
          </section>
        ) : null
      )}
    </div>
  );
}