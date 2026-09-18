import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Package, Search, User, Loader2 } from "lucide-react";
import Seo from "@/components/Seo";
import { getOrder } from "@/lib/api";
import { currency } from "@/lib/content";

const STEPS = ["confirmed", "processing", "shipped", "out for delivery", "delivered"];

export function TrackOrder() {
  const [num, setNum] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const track = async (e) => {
    e.preventDefault();
    if (!num.trim()) return;
    setLoading(true); setErr(""); setOrder(null);
    try {
      const o = await getOrder(num.trim());
      setOrder(o);
    } catch {
      setErr("Unable to access this order. Use the browser session where you placed it, or contact support.");
    } finally { setLoading(false); }
  };

  const stepIndex = order ? Math.max(0, STEPS.indexOf((order.status || "confirmed").toLowerCase())) : 0;

  return (
    <div className="bg-cream min-h-[60vh]">
      <Seo title="Track Order | MRS Ventures" description="Track your MRS Ventures order status." />
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center">
          <Package className="mx-auto h-10 w-10 text-forest-light" />
          <h1 className="mt-4 font-serif text-4xl font-bold text-forest-deep">Track Your Order</h1>
          <p className="mt-2 text-slate-600">Enter your order number in the browser session where you placed your order.</p>
        </div>
        <form onSubmit={track} className="mt-8 flex gap-2">
          <input value={num} onChange={(e) => setNum(e.target.value)} placeholder="e.g. MRS2506XXXX" data-testid="track-input"
            className="flex-1 rounded-full border border-forest/15 bg-white px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-brand" />
          <button type="submit" disabled={loading} data-testid="track-submit" className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream flex items-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Track
          </button>
        </form>
        {err && <p className="mt-4 text-center text-sm text-red-500">{err}</p>}
        {order && (
          <div className="mt-8 rounded-2xl border border-forest/10 bg-white p-6" data-testid="track-result">
            <div className="flex justify-between"><span className="text-sm text-slate-500">Order</span><span className="font-semibold text-forest-deep">{order.order_number}</span></div>
            <div className="mt-2 flex justify-between"><span className="text-sm text-slate-500">Total</span><span className="font-semibold text-forest-deep">{currency(order.total)}</span></div>
            <div className="mt-6 space-y-3">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${i <= stepIndex ? "bg-forest-light" : "bg-forest/20"}`} />
                  <span className={`text-sm capitalize ${i <= stepIndex ? "text-forest-deep font-medium" : "text-slate-400"}`}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Account() {
  return (
    <div className="bg-cream min-h-[60vh]">
      <Seo title="Account | MRS Ventures" description="Your MRS Ventures account." />
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <User className="mx-auto h-10 w-10 text-forest-light" />
        <h1 className="mt-4 font-serif text-4xl font-bold text-forest-deep">Accounts Coming Soon</h1>
        <p className="mt-3 text-slate-600">
          For now, enjoy fast <b>guest checkout</b> — no account required. Login, order history and
          saved addresses are on the way.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/shop" className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream hover:bg-forest-deep transition">Shop Now</Link>
          {/* <Link to="/track" className="rounded-full border border-forest/25 px-6 py-3 text-sm font-semibold text-forest-deep hover:bg-forest/5 transition">Track an Order</Link> */}
        </div>
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="bg-cream min-h-[60vh] grid place-items-center px-4">
      <div className="text-center">
        <p className="font-serif text-7xl font-bold text-amber-brand">404</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-forest-deep">Page not found</h1>
        <p className="mt-2 text-slate-600">The page you're looking for doesn't exist.</p>
        <Link to="/" className="mt-6 inline-block rounded-full bg-forest px-7 py-3.5 text-sm font-semibold text-cream hover:bg-forest-deep transition">Back Home</Link>
      </div>
    </div>
  );
}
