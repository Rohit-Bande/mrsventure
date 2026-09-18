import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { currency } from "@/lib/content";
import { getProducts } from "@/lib/api";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";

export default function CartDrawer() {
  const {
    cart, cartOpen, setCartOpen, updateQty, removeFromCart,
    cartSubtotal, addToCart,
  } = useShop();
  const navigate = useNavigate();
  const [upsell, setUpsell] = useState([]);

  useEffect(() => {
    if (cartOpen && upsell.length === 0) {
      getProducts({ bestseller: true }).then((d) => setUpsell(d.slice(0, 3))).catch(() => {});
    }
  }, [cartOpen, upsell.length]);

  const goCheckout = () => {
    setCartOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="bg-cream w-full sm:max-w-md flex flex-col p-0" data-testid="cart-drawer">
        <SheetHeader className="px-5 py-4 border-b border-forest/10">
          <SheetTitle className="font-serif text-2xl text-forest-deep text-left">Your Cart</SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
            <ShoppingBag className="h-12 w-12 text-forest/30" />
            <p className="text-slate-600">Your cart is empty.</p>
            <button
              onClick={() => { setCartOpen(false); navigate("/shop"); }}
              className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream hover:bg-forest-deep transition"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="px-5 pt-4">
              <div className="rounded-xl bg-beige p-3 text-center text-xs font-semibold text-forest-light">
                🎉 Free shipping on all orders
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {cart.map((item) => (
                <div key={item.key} className="flex gap-3" data-testid={`cart-item-${item.slug}`}>
                  <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover bg-beige" />
                  <div className="flex-1">
                    <p className="font-serif font-semibold text-forest-deep leading-tight">{item.name}</p>
                    {item.variant_label && <p className="text-xs text-slate-500">{item.variant_label}</p>}
                    <p className="text-sm font-semibold text-forest-deep mt-1">{currency(item.price)}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-forest/15">
                        <button onClick={() => updateQty(item.key, item.quantity - 1)} className="p-1.5" aria-label="Decrease" data-testid={`cart-dec-${item.slug}`}>
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQty(item.key, item.quantity + 1)} className="p-1.5" aria-label="Increase" data-testid={`cart-inc-${item.slug}`}>
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.key)} className="text-slate-400 hover:text-red-500 transition" aria-label="Remove" data-testid={`cart-remove-${item.slug}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {upsell.length > 0 && (
                <div className="pt-2">
                  <p className="font-serif text-lg font-semibold text-forest-deep">Complete Your Pantry</p>
                  <div className="mt-3 space-y-2">
                    {upsell.filter((u) => !cart.some((c) => c.product_id === u.id)).slice(0, 2).map((u) => (
                      <div key={u.id} className="flex items-center gap-3 rounded-xl border border-forest/10 p-2">
                        <img src={u.images?.[0]} alt={u.name} className="h-12 w-12 rounded-lg object-cover bg-beige" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-forest-deep leading-tight line-clamp-1">{u.name}</p>
                          <p className="text-xs text-slate-500">{currency(u.price)}</p>
                        </div>
                        <button onClick={() => addToCart(u, u.variants?.[0])} className="rounded-full bg-forest/10 px-3 py-1.5 text-xs font-semibold text-forest-deep hover:bg-forest/20 transition" data-testid={`upsell-add-${u.slug}`}>
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-forest/10 px-5 py-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-serif text-xl font-bold text-forest-deep">{currency(cartSubtotal)}</span>
              </div>
              <p className="text-xs text-slate-500">Free shipping on all orders.</p>
              <button
                onClick={goCheckout}
                data-testid="drawer-checkout-btn"
                className="w-full rounded-full bg-forest py-3.5 text-sm font-semibold text-cream hover:bg-forest-deep transition active:scale-[0.98]"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
