import React from "react";
import { Link } from "react-router-dom";
import { Heart, Plus, Star } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { currency, discountPct } from "@/lib/content";

export default function ProductCard({ product, index = 0 }) {
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const pct = discountPct(product.price, product.mrp);
  const wished = isWishlisted(product.slug);

  return (
    <div
      data-testid={`product-card-${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-forest/10 shadow-[0_10px_30px_rgba(13,59,46,0.05)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(13,59,46,0.12)] hover:-translate-y-1"
    >
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
        {pct > 0 && (
          <span className="rounded-full bg-amber-brand px-2.5 py-1 text-[11px] font-semibold text-white">
            {pct}% OFF
          </span>
        )}
        {product.is_new && (
          <span className="rounded-full bg-forest px-2.5 py-1 text-[11px] font-semibold text-cream">
            New
          </span>
        )}
        {product.badge && (
          <span className="rounded-full bg-gold/90 px-2.5 py-1 text-[11px] font-semibold text-forest-deep">
            {product.badge}
          </span>
        )}
      </div>

      <button
        onClick={() => toggleWishlist(product)}
        data-testid={`wishlist-toggle-${product.slug}`}
        aria-label="Toggle wishlist"
        className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur border border-forest/10 transition hover:scale-105 active:scale-95"
      >
        <Heart className={`h-4 w-4 ${wished ? "fill-amber-brand text-amber-brand" : "text-forest"}`} />
      </button>

      <Link to={`/product/${product.slug}`} className="block overflow-hidden bg-beige">
        <img
          src={product.images?.[0]}
          alt={product.name}
          loading="lazy"
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-amber-brand font-semibold">
          {product.category_label}
        </p>
        <Link to={`/product/${product.slug}`}>
          <h3 className="mt-1 font-serif text-lg font-semibold leading-snug text-forest-deep line-clamp-2 hover:text-amber-brand transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-slate-600 line-clamp-2">{product.short_desc}</p>

        <div className="mt-2 flex items-center gap-1 text-amber-brand">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${i < Math.round(product.rating) ? "fill-current" : "text-slate-300"}`}
            />
          ))}
          <span className="ml-1 text-xs text-slate-500">
            {product.rating ? product.rating.toFixed(1) : "New"}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <span className="font-serif text-xl font-bold text-forest-deep">
              {currency(product.price)}
            </span>
            {product.mrp && product.mrp > product.price && (
              <span className="ml-2 text-sm text-slate-400 line-through">
                {currency(product.mrp)}
              </span>
            )}
          </div>
          <button
            onClick={() => addToCart(product, product.variants?.[0])}
            data-testid={`quick-add-${product.slug}`}
            aria-label="Add to cart"
            className="grid h-10 w-10 place-items-center rounded-full bg-forest text-cream transition-transform hover:scale-105 active:scale-95 hover:bg-forest-deep"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
