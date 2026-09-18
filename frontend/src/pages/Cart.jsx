import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Seo from "@/components/Seo";
import ProductCard from "@/components/ProductCard";
import { useShop } from "@/context/ShopContext";
import { getProducts } from "@/lib/api";
import { currency } from "@/lib/content";

export default function Cart() {
  const { cart, updateQty, removeFromCart, cartSubtotal, cartSavings, config } = useShop();
  const navigate = useNavigate();
  const [upsell, setUpsell] = useState([]);

  const shipping = config.shipping_charge ?? 0;

  useEffect(() => {
    getProducts({ bestseller: true }).then((d) => setUpsell(d.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div className="bg-cream min-h-[60vh]">
      <Seo title="Your Cart | MRS Ventures" description="Review your MRS Ventures cart and checkout securely." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-forest-deep">Your Cart</h1>

        {cart.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-forest/20 p-14 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-forest/30" />
            <p className="mt-4 text-slate-600">Your cart is empty.</p>
            <Link to="/shop" className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3.5 text-sm font-semibold text-cream hover:bg-forest-deep transition">
              Start Shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid lg:grid-cols-[1fr_360px] gap-8">
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.key} className="flex gap-4 rounded-2xl border border-forest/10 bg-white p-4" data-testid={`cart-page-item-${item.slug}`}>
                  <Link to={`/product/${item.slug}`}>
                    <img src={item.image} alt={item.name} className="h-24 w-24 rounded-xl object-cover bg-beige" />
                  </Link>
                  <div className="flex-1">
                    <div className="flex justify-between gap-2">
                      <div>
                        <Link to={`/product/${item.slug}`} className="font-serif text-lg font-semibold text-forest-deep hover:text-amber-brand">{item.name}</Link>
                        {item.variant_label && <p className="text-xs text-slate-500">{item.variant_label}</p>}
                      </div>
                      <button onClick={() => removeFromCart(item.key)} className="text-slate-400 hover:text-red-500 h-fit" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-forest/15">
                        <button onClick={() => updateQty(item.key, item.quantity - 1)} className="p-2" aria-label="Decrease"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQty(item.key, item.quantity + 1)} className="p-2" aria-label="Increase"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <span className="font-serif text-lg font-bold text-forest-deep">{currency(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside>
              <div className="sticky top-24 rounded-2xl border border-forest/10 bg-white p-6">
                <h2 className="font-serif text-xl font-semibold text-forest-deep">Order Summary</h2>
                <div className="mt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-medium">{currency(cartSubtotal)}</span></div>
                  {cartSavings > 0 && <div className="flex justify-between text-forest-light"><span>You save</span><span>−{currency(cartSavings)}</span></div>}
                  <div className="flex justify-between"><span className="text-slate-600">Shipping</span><span className="font-medium">{shipping === 0 ? "Free" : currency(shipping)}</span></div>
                  <div className="border-t border-forest/10 pt-3 flex justify-between items-center">
                    <span className="font-serif text-lg font-semibold text-forest-deep">Total</span>
                    <span className="font-serif text-2xl font-bold text-forest-deep">{currency(cartSubtotal + shipping)}</span>
                  </div>
                </div>
                <button onClick={() => navigate("/checkout")} data-testid="cart-checkout-btn"
                  className="mt-5 w-full rounded-full bg-forest py-3.5 text-sm font-semibold text-cream hover:bg-forest-deep transition active:scale-[0.98]">
                  Proceed to Checkout
                </button>
                <Link to="/shop" className="mt-3 block text-center text-sm text-forest-deep/70 hover:text-forest-deep">Continue shopping</Link>
              </div>
            </aside>
          </div>
        )}

        {cart.length > 0 && upsell.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest-deep mb-6">Complete Your Pantry</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {upsell.filter((u) => !cart.some((c) => c.product_id === u.id)).slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
