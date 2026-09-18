import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star, Heart, Minus, Plus, ChevronRight, MessageCircle, Truck, ShieldCheck, RotateCcw, Check,
} from "lucide-react";
import Seo from "@/components/Seo";
import ProductCard from "@/components/ProductCard";
import { useShop } from "@/context/ShopContext";
import { getProduct, getProducts } from "@/lib/api";
import { currency, discountPct, waLink } from "@/lib/content";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [variant, setVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setNotFound(false);
    getProduct(slug)
      .then((p) => {
        setProduct(p);
        setVariant(p.variants?.[0] || null);
        setActiveImg(0);
        setQty(1);
        getProducts({ category: p.category }).then((r) => setRelated(r.filter((x) => x.slug !== p.slug).slice(0, 4)));
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl text-forest-deep">Product not found</h1>
        <Link to="/shop" className="mt-4 inline-block text-amber-brand underline">Back to Shop</Link>
      </div>
    );
  }
  if (!product) return <div className="min-h-[60vh]" />;

  const price = variant ? variant.price : product.price;
  const mrp = variant ? variant.mrp : product.mrp;
  const pct = discountPct(price, mrp);
  const wished = isWishlisted(product.slug);
  const selectedSku =
  variant?.sku ||
  ((product.variants || []).length <= 1 ? product.sku : "");
  const gallery =
  variant?.images?.length > 0 ? variant.images : (product.images || []);

const selectedQuantity =
  variant?.weight && variant.weight !== "Standard"
    ? variant.weight
    : product.net_quantity;

  const waMsg = `Hello MRS Ventures, I would like to order ${product.name}${variant ? ` (${variant.label})` : ""}. Please share the available options and delivery details.`;

  const buyNow = () => {
    addToCart(product, variant, qty, false);
    navigate("/checkout");
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku || undefined,
    image: product.images,
    description: product.short_desc,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating: product.rating ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.review_count || 1 } : undefined,
  };

  return (
    <div className="bg-cream pb-24 lg:pb-0">
      <Seo
        title={product.seo_title || `${product.name} | MRS Ventures`}
        description={product.seo_description || product.short_desc}
        canonical={`https://mrsventures.co.in/product/${product.slug}`}
        image={product.images?.[0]}
        jsonLd={jsonLd}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6 flex-wrap" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-forest-deep">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to={`/shop?category=${product.category}`} className="hover:text-forest-deep">{product.category_label}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-forest-deep font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Gallery */}
          <div>
            <div className="relative overflow-hidden rounded-3xl bg-beige shadow-[0_20px_50px_rgba(13,59,46,0.1)]">
              <img src={gallery[activeImg] || gallery[0]} alt={product.name} className="w-full object-cover aspect-square" data-testid="pdp-main-image" />
              {pct > 0 && <span className="absolute left-4 top-4 rounded-full bg-amber-brand px-3 py-1 text-xs font-semibold text-white">{pct}% OFF</span>}
            </div>
            {gallery.length > 1 && (
              <div className="mt-3 flex gap-3">
                {gallery.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} data-testid={`pdp-thumb-${i}`}
                    className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition ${activeImg === i ? "border-amber-brand" : "border-transparent opacity-70 hover:opacity-100"}`}>
                    <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-amber-brand">{product.brand} • {product.category_label}</p>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-forest-deep leading-tight">{product.name}</h1>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex text-amber-brand">
                {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-current" : "text-slate-300"}`} />)}
              </div>
              <span className="text-sm text-slate-500">{product.rating ? `${product.rating.toFixed(1)} rating` : "New"}</span>
            </div>

            <p className="mt-4 text-slate-600 leading-relaxed">{product.short_desc}</p>

            <div className="mt-5 flex items-end gap-3">
  <span className="font-serif text-4xl font-bold text-forest-deep">
    {currency(price)}
  </span>

  {mrp != null && mrp > price && (
    <span className="text-lg text-slate-400 line-through mb-1">
      {currency(mrp)}
    </span>
  )}

  {pct > 0 && (
    <span className="rounded-full bg-amber-brand/10 px-3 py-1 text-sm font-semibold text-amber-brand">
      {pct}% OFF
    </span>
  )}
</div>
            <p className="text-xs text-slate-400">Inclusive of all taxes</p>

            {(selectedSku ||
  selectedQuantity ||
  product.origin ||
  variant?.batch_number ||
  variant?.manufactured_on ||
  variant?.best_before) && (
  <dl className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-forest/10 bg-white p-4">
    {selectedSku && (
      <div>
        <dt className="text-xs uppercase tracking-wider text-slate-500">
          SKU
        </dt>
        <dd className="mt-1 text-sm font-medium text-forest-deep break-words">
          {product.sku}
        </dd>
      </div>
    )}

   {selectedQuantity && (
      <div>
        <dt className="text-xs uppercase tracking-wider text-slate-500">
          Net Quantity
        </dt>
        <dd className="mt-1 text-sm font-medium text-forest-deep">
          {product.net_quantity}
        </dd>
      </div>
    )}

    {product.origin && !product.origin.includes("[CLIENT TO PROVIDE]") && (
      <div>
        <dt className="text-xs uppercase tracking-wider text-slate-500">
          Country of Origin
        </dt>
        <dd className="mt-1 text-sm font-medium text-forest-deep">
          {product.origin}
        </dd>
      </div>
    )}

    {[
  ["Batch Number", variant?.batch_number],
  ["Manufacturing Date", variant?.manufactured_on],
  ["Best Before", variant?.best_before],
]
  .filter(([, value]) => Boolean(value))
  .map(([label, value]) => (
    <div key={label}>
      <dt className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-forest-deep">
        {value}
      </dd>
    </div>
  ))}
  </dl>
)}
  


            {product.variants?.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-forest-deep mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
  key={v.id}
  onClick={() => {
    setVariant(v);
    setActiveImg(0);
  }} data-testid={`variant-${v.label.replace(/\s/g, "")}`}
                      className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                        variant?.id === v.id ? "border-forest bg-forest text-cream" : "border-forest/20 text-forest-deep hover:border-forest/50"
                      }`}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-full border border-forest/20">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3" aria-label="Decrease" data-testid="pdp-qty-dec"><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center font-medium" data-testid="pdp-qty">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="p-3" aria-label="Increase" data-testid="pdp-qty-inc"><Plus className="h-4 w-4" /></button>
              </div>
              <button onClick={() => toggleWishlist(product)} data-testid="pdp-wishlist"
                className="grid h-12 w-12 place-items-center rounded-full border border-forest/20 transition hover:bg-beige">
                <Heart className={`h-5 w-5 ${wished ? "fill-amber-brand text-amber-brand" : "text-forest-deep"}`} />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => addToCart(product, variant, qty)} data-testid="pdp-add-to-cart"
                className="rounded-full border-2 border-forest px-6 py-3.5 text-sm font-semibold text-forest-deep hover:bg-forest hover:text-cream transition active:scale-95">
                Add to Cart
              </button>
              <button onClick={buyNow} data-testid="pdp-buy-now"
                className="rounded-full bg-amber-brand px-6 py-3.5 text-sm font-semibold text-white hover:bg-amber-glow transition active:scale-95">
                Buy Now
              </button>
            </div>
            <a href={waLink(waMsg)} target="_blank" rel="noopener noreferrer" data-testid="pdp-whatsapp"
              className="mt-3 flex items-center justify-center gap-2 rounded-full border border-[#25D366] px-6 py-3.5 text-sm font-semibold text-[#128C43] hover:bg-[#25D366]/10 transition">
              <MessageCircle className="h-4 w-4" /> Order on WhatsApp
            </a>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[[Truck, "Delivered with care"], [ShieldCheck, "Premium quality"], [RotateCcw, "Easy support"]].map(([Icon, label], i) => (
                <div key={i} className="rounded-xl bg-beige/60 p-3">
                  <Icon className="mx-auto h-5 w-5 text-forest-light" />
                  <p className="mt-1 text-xs text-slate-600">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="mt-14">
          <Tabs defaultValue="description">
            <TabsList className="flex flex-wrap h-auto justify-start gap-2 bg-transparent p-0">
              {["description", "ingredients", "nutrition", "how-to-use", "storage", "shipping", "returns"].map((t) => (
                <TabsTrigger key={t} value={t} data-testid={`tab-${t}`}
                  className="rounded-full border border-forest/15 bg-white px-4 py-2 text-sm data-[state=active]:bg-forest data-[state=active]:text-cream capitalize">
                  {t.replace(/-/g, " ")}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="mt-6 rounded-2xl border border-forest/10 bg-white p-6 sm:p-8 text-slate-600 leading-relaxed">
              <TabsContent value="description">
  <p className="whitespace-pre-line">{product.description}</p>
</TabsContent>
              <TabsContent value="ingredients"><p>{product.ingredients || "[CLIENT TO PROVIDE]"}</p></TabsContent>
              <TabsContent value="nutrition">
                {product.nutrition?.length ? (
                  <div className="max-w-md">
                    <p className="text-xs text-slate-400 mb-3">Typical values per 100g. [Verify against actual pack — CLIENT TO PROVIDE]</p>
                    {product.nutrition.map((n) => (
                      <div key={n.label} className="flex justify-between border-b border-forest/10 py-2">
                        <span>{n.label}</span><span className="font-medium text-forest-deep">{n.value}</span>
                      </div>
                    ))}
                  </div>
                ) : <p>[CLIENT TO PROVIDE]</p>}
              </TabsContent>
              <TabsContent value="how-to-use">
  <p className="whitespace-pre-line">
    {product.how_to_use || "Refer to the product packaging or contact us for usage guidance."}
  </p>
</TabsContent>

<TabsContent value="storage">
  <p className="whitespace-pre-line">
    {product.storage || "Refer to the product packaging for storage instructions."}
  </p>
</TabsContent>
              <TabsContent value="shipping"><p>Orders are processed promptly and delivered with secure packaging. Delivery timelines vary by location. <Link to="/shipping-policy" className="text-amber-brand underline">Read our Shipping Policy</Link>.</p></TabsContent>
              <TabsContent value="returns"><p>As food products, returns apply in specific cases such as damaged or incorrect items. <Link to="/returns-policy" className="text-amber-brand underline">Read our Returns Policy</Link>.</p></TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest-deep mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>

      {/* Sticky mobile bar */}
      <div className="lg:hidden fixed bottom-16 inset-x-0 z-30 bg-cream/95 backdrop-blur-md border-t border-forest/10 px-4 py-3 flex items-center gap-3">
        <div className="shrink-0">
          <p className="font-serif text-xl font-bold text-forest-deep leading-none">{currency(price)}</p>
          {mrp && mrp > price && <p className="text-xs text-slate-400 line-through">{currency(mrp)}</p>}
        </div>
        <button onClick={() => addToCart(product, variant, qty)} data-testid="sticky-add-to-cart"
          className="flex-1 rounded-full border-2 border-forest py-3 text-sm font-semibold text-forest-deep active:scale-95">Add to Cart</button>
        <button onClick={buyNow} data-testid="sticky-buy-now"
          className="flex-1 rounded-full bg-amber-brand py-3 text-sm font-semibold text-white active:scale-95">Buy Now</button>
      </div>
    </div>
  );
}
