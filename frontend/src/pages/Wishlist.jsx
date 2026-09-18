import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import Seo from "@/components/Seo";
import { useShop } from "@/context/ShopContext";
import { currency } from "@/lib/content";

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useShop();

  return (
    <div className="bg-cream min-h-[60vh]">
      <Seo title="Your Wishlist | MRS Ventures" description="Your saved MRS Ventures products." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-forest-deep">Your Wishlist</h1>

        {wishlist.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-forest/20 p-14 text-center">
            <Heart className="mx-auto h-12 w-12 text-forest/30" />
            <p className="mt-4 text-slate-600">Your wishlist is empty. Save products you love.</p>
            <Link to="/shop" className="mt-6 inline-block rounded-full bg-forest px-7 py-3.5 text-sm font-semibold text-cream hover:bg-forest-deep transition">Explore Shop</Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {wishlist.map((p) => (
              <div key={p.slug} className="flex gap-4 rounded-2xl border border-forest/10 bg-white p-4" data-testid={`wishlist-item-${p.slug}`}>
                <Link to={`/product/${p.slug}`}><img src={p.image} alt={p.name} className="h-24 w-24 rounded-xl object-cover bg-beige" /></Link>
                <div className="flex-1">
                  <Link to={`/product/${p.slug}`} className="font-serif text-lg font-semibold text-forest-deep hover:text-amber-brand leading-tight line-clamp-2">{p.name}</Link>
                  <p className="mt-1 font-semibold text-forest-deep">{currency(p.price)}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => { addToCart({ ...p, images: [p.image] }, null); toggleWishlist(p); }} data-testid={`wishlist-move-${p.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-cream hover:bg-forest-deep transition">
                      <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
                    </button>
                    <button onClick={() => toggleWishlist(p)} className="grid h-9 w-9 place-items-center rounded-full border border-forest/15 text-slate-400 hover:text-red-500" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
