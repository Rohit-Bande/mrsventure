import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2, Check } from "lucide-react";
import Seo from "@/components/Seo";
import { useShop } from "@/context/ShopContext";
import { currency } from "@/lib/content";
import { createOrder, completeOrderAttempt, rzpCreateOrder, rzpVerify, rzpReconcile } from "@/lib/api";
import { toast } from "sonner";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const empty = { name: "", mobile: "", email: "", address: "", landmark: "", city: "", state: "", pincode: "" };

const Field = ({ label, name, value, onChange, type = "text", placeholder, span, required }) => (
  <div className={span ? "sm:col-span-2" : ""}>
    <label className="text-sm font-medium text-forest-deep">{label}{required && <span className="text-amber-brand"> *</span>}</label>
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      data-testid={`checkout-${name}`}
      className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-brand"
    />
  </div>
);

export default function Checkout() {
  const { cart, cartSubtotal, clearCart, config } = useShop();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [payment, setPayment] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  const shipping = config.shipping_charge ?? 0;
  const total = cartSubtotal + shipping;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const lookupPincode = async (pin) => {
    if (!/^\d{6}$/.test(pin)) return;
    setPinLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      const po = data?.[0]?.PostOffice?.[0];
      if (po) setForm((f) => ({ ...f, city: po.District, state: po.State }));
    } catch { /* silent */ } finally { setPinLoading(false); }
  };

  const validate = () => {
    if (!form.name.trim()) return "Please enter your full name";
    if (!/^\d{10}$/.test(form.mobile)) return "Please enter a valid 10-digit mobile number";
    if (!form.address.trim()) return "Please enter your delivery address";
    if (!form.city.trim() || !form.state.trim()) return "Please enter city and state";
    if (!/^\d{6}$/.test(form.pincode)) return "Please enter a valid 6-digit pincode";
    return null;
  };

  const finishOrder = (orderNumber) => {
    completeOrderAttempt();
    clearCart();
    navigate(`/order-success/${orderNumber}`);
  };

  const placeOrder = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }
    if (cart.length === 0) { toast.error("Your cart is empty"); return; }

    setLoading(true);
    try {
      const order = await createOrder({
        items: cart.map((c) => ({
          product_id: c.product_id, slug: c.slug, name: c.name,
          variant_label: c.variant_label, image: c.image, price: c.price, quantity: c.quantity,
        })),
        customer: form,
        payment_method: payment,
        subtotal: cartSubtotal, shipping, discount: 0, total,
      });

      // A previous callback or webhook may have completed this same idempotent attempt.
      if (order.payment_method === "razorpay" && order.payment_status === "paid") {
        if (order.needs_payment_review) {
          toast.error(`Order ${order.order_number} requires payment review. Do not pay again; contact support.`);
          setLoading(false);
          return;
        }
        finishOrder(order.order_number);
        return;
      }
      if (order.status === "cancelled") {
        toast.error(`Order ${order.order_number} was cancelled. Do not pay again; contact support.`);
        setLoading(false);
        return;
      }

      if (payment === "cod") {
        toast.success("Order placed successfully!");
        finishOrder(order.order_number);
        return;
      }

      const rzp = await rzpCreateOrder({ order_number: order.order_number });

      const ok = await loadRazorpayScript();
      if (!ok) { toast.error("Could not load payment gateway"); setLoading(false); return; }

      const options = {
        key: rzp.key_id,
        amount: rzp.amount,
        currency: rzp.currency,
        name: "MRS Ventures",
        description: "MADHULOGY™ Order",
        order_id: rzp.order_id,
        prefill: { name: form.name, email: form.email, contact: form.mobile },
        theme: { color: "#0D3B2E" },
        handler: async (resp) => {
          try {
            await rzpVerify({
              order_number: order.order_number,
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            });
            toast.success("Payment successful!");
            finishOrder(order.order_number);
          } catch {
            // A signed webhook may have confirmed the payment even if this browser call failed.
            try {
              const latest = await rzpReconcile({order_number:order.order_number});
              if (latest.payment_status === "paid" && !latest.needs_payment_review) {
                finishOrder(order.order_number);
                return;
              }
            } catch { /* Keep the attempt and cart for support/recovery. */ }
            toast.error(`Payment not confirmed for ${order.order_number}. If charged, do not pay again; contact support.`, { duration: 12000 });
            setLoading(false);
          }
        },
        modal: { ondismiss: () => {
          toast(`Checkout closed for ${order.order_number}. If charged, do not pay again; contact support.`, { duration: 10000 });
          setLoading(false);
        } },
      };
      const razorpay = new window.Razorpay(options);

razorpay.on("payment.failed", (response) => {
  const paymentError = response?.error;

  const safeReason = [
    paymentError?.description,
    paymentError?.reason,
  ]
    .filter(Boolean)
    .join(" — ");

  toast.error(
    safeReason || "Payment failed. Please choose another payment method.",
    { duration: 12000 }
  );

  setLoading(false);
});

razorpay.open();
    } catch (error) {
  const detail = error?.response?.data?.detail;
  toast.error(
    typeof detail === "string"
      ? detail
      : "Could not place order. Please try again."
  );
  setLoading(false);
}
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <Seo title="Checkout | MRS Ventures" description="Secure checkout." />
        <h1 className="font-serif text-3xl text-forest-deep">Your cart is empty</h1>
        <button onClick={() => navigate("/shop")} className="mt-4 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream">Go to Shop</button>
      </div>
    );
  }

  return (
    <div className="bg-cream">
      <Seo title="Checkout | MRS Ventures" description="Secure guest checkout for your MRS Ventures order." />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-serif text-4xl font-bold text-forest-deep">Checkout</h1>
        <p className="mt-1 text-sm text-slate-500 flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Guest checkout — no account required</p>

        <div className="mt-8 grid lg:grid-cols-[1fr_380px] gap-8">
          <div className="rounded-2xl border border-forest/10 bg-white p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-semibold text-forest-deep">Delivery Details</h2>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" name="name" value={form.name} onChange={set("name")} placeholder="Your full name" required />
              <Field label="Mobile Number" name="mobile" value={form.mobile} onChange={set("mobile")} type="tel" placeholder="10-digit mobile" required />
              <Field label="Email (optional)" name="email" value={form.email} onChange={set("email")} type="email" placeholder="you@email.com" span />
              <Field label="Complete Address" name="address" value={form.address} onChange={set("address")} placeholder="House no, street, area" span required />
              <Field label="Landmark (optional)" name="landmark" value={form.landmark} onChange={set("landmark")} placeholder="Nearby landmark" span />
              <div>
                <label className="text-sm font-medium text-forest-deep">Pincode <span className="text-amber-brand">*</span></label>
                <div className="relative">
                  <input
                    value={form.pincode}
                    onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 6); setForm((f) => ({ ...f, pincode: v })); if (v.length === 6) lookupPincode(v); }}
                    placeholder="6-digit pincode"
                    data-testid="checkout-pincode"
                    className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-brand"
                  />
                  {pinLoading && <Loader2 className="absolute right-3 top-4 h-4 w-4 animate-spin text-amber-brand" />}
                </div>
              </div>
              <Field label="City" name="city" value={form.city} onChange={set("city")} placeholder="City" required />
              <Field label="State" name="state" value={form.state} onChange={set("state")} placeholder="State" span required />
            </div>

            <h2 className="mt-8 font-serif text-2xl font-semibold text-forest-deep">Payment Method</h2>
            <div className="mt-4 space-y-3">
              {[
                ["razorpay", "Pay Online", config.online_payments_enabled === false ? "Online payments are currently unavailable" : "UPI • Cards • Net Banking • Wallets (Razorpay)"],
                ["cod", "Cash on Delivery", "Pay when your order arrives"],
              ].map(([val, title, desc]) => (
                <button key={val} onClick={() => setPayment(val)} disabled={val === "razorpay" && config.online_payments_enabled === false} data-testid={`payment-${val}`}
                  className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${payment === val ? "border-forest bg-beige/60" : "border-forest/15 hover:border-forest/40"}`}>
                  <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${payment === val ? "border-forest bg-forest" : "border-forest/30"}`}>
                    {payment === val && <Check className="h-3 w-3 text-cream" />}
                  </span>
                  <span>
                    <span className="block font-medium text-forest-deep">{title}</span>
                    <span className="block text-xs text-slate-500">{desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <aside>
            <div className="sticky top-24 rounded-2xl border border-forest/10 bg-white p-6">
              <h2 className="font-serif text-xl font-semibold text-forest-deep">Order Summary</h2>
              <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.key} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover bg-beige" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-forest-deep leading-tight line-clamp-1">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.variant_label} × {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium">{currency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 border-t border-forest/10 pt-4 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span>{currency(cartSubtotal)}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Shipping</span><span>{shipping === 0 ? "Free" : currency(shipping)}</span></div>
                <div className="flex justify-between items-center border-t border-forest/10 pt-2">
                  <span className="font-serif text-lg font-semibold text-forest-deep">Total</span>
                  <span className="font-serif text-2xl font-bold text-forest-deep">{currency(total)}</span>
                </div>
              </div>
              <button onClick={placeOrder} disabled={loading} data-testid="place-order-btn"
                className="mt-5 w-full rounded-full bg-amber-brand py-4 text-sm font-semibold text-white hover:bg-amber-glow transition active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : <>Place Order • {currency(total)}</>}
              </button>
              <p className="mt-3 text-center text-xs text-slate-400 flex items-center justify-center gap-1"><Lock className="h-3 w-3" /> Secure & encrypted</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
