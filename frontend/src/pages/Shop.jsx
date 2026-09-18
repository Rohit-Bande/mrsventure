import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { SlidersHorizontal, ChevronRight } from "lucide-react";
import Seo from "@/components/Seo";
import ProductCard from "@/components/ProductCard";
import { useShop } from "@/context/ShopContext";
import { getProducts } from "@/lib/api";
import {
  Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";



function Filters({ categories: CATEGORIES, category, setCategory, price, setPrice, inStock, setInStock, tags, setTags }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-serif text-lg font-semibold text-forest-deep mb-3">Category</h3>
        <div className="space-y-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCategory(c.slug)}
              data-testid={`filter-cat-${c.slug}`}
              className={`block w-full text-left rounded-lg px-3 py-2 text-sm transition ${
                category === c.slug ? "bg-forest text-cream" : "text-forest-deep hover:bg-beige"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-serif text-lg font-semibold text-forest-deep mb-4">Price Range</h3>
        <Slider
          min={0} max={2000} step={50}
          value={price}
          onValueChange={setPrice}
          data-testid="filter-price-slider"
          className="my-2"
        />
        <div className="mt-3 flex justify-between text-sm text-slate-600">
          <span>₹{price[0]}</span>
          <span>₹{price[1]}</span>
        </div>
      </div>

      <div>
        <h3 className="font-serif text-lg font-semibold text-forest-deep mb-3">Availability</h3>
        <label className="flex items-center gap-2 text-sm text-forest-deep cursor-pointer">
          <Checkbox checked={inStock} onCheckedChange={setInStock} data-testid="filter-instock" />
          In stock only
        </label>
      </div>

      <div>
        <h3 className="font-serif text-lg font-semibold text-forest-deep mb-3">Collections</h3>
        {[["new", "New Arrivals"], ["bestseller", "Best Sellers"], ["featured", "Featured"]].map(([val, label]) => (
          <label key={val} className="flex items-center gap-2 text-sm text-forest-deep cursor-pointer py-1">
            <Checkbox
              checked={tags.includes(val)}
              onCheckedChange={(c) => setTags((t) => (c ? [...t, val] : t.filter((x) => x !== val)))}
              data-testid={`filter-tag-${val}`}
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function Shop() {
  const {categories} = useShop();
  const CATEGORIES = [{slug:"all",label:"All Products"},...categories];
  const [params, setParams] = useSearchParams();
  const [all, setAll] = useState([]);
  const [category, setCategory] = useState(params.get("category") || "all");
  const [sort, setSort] = useState("featured");
  const [price, setPrice] = useState([0, 2000]);
  const [inStock, setInStock] = useState(false);
  const [tags, setTags] = useState(params.get("filter") ? [params.get("filter")] : []);

  useEffect(() => {
    getProducts().then(setAll).catch(() => {});
  }, []);

  useEffect(() => {
    const next = {};
    if (category !== "all") next.category = category;
    setParams(next, { replace: true });
  }, [category, setParams]);

  const filtered = useMemo(() => {
    let list = [...all];
    if (category !== "all") list = list.filter((p) => p.category === category);
    list = list.filter((p) => p.price >= price[0] && p.price <= price[1]);
    if (inStock) list = list.filter((p) => p.stock > 0);
    if (tags.includes("new")) list = list.filter((p) => p.is_new);
    if (tags.includes("bestseller")) list = list.filter((p) => p.is_bestseller);
    if (tags.includes("featured")) list = list.filter((p) => p.is_featured);
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    else list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    return list;
  }, [all, category, price, inStock, tags, sort]);

  const filterProps = { categories:CATEGORIES, category, setCategory, price, setPrice, inStock, setInStock, tags, setTags };
  const activeCat = CATEGORIES.find((c) => c.slug === category);

  return (
    <div className="bg-cream">
      <Seo
        title={`Shop ${activeCat?.label !== "All Products" ? activeCat?.label : "Natural Foods"} | MRS Ventures`}
        description="Shop MADHULOGY™ Pure Raw Honey, premium makhana and flavoured makhana online. Premium Indian natural foods, delivered with care."
        canonical="https://mrsventures.co.in/shop"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-forest-deep">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-forest-deep font-medium">Shop</span>
        </nav>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-forest-deep">
          {activeCat?.label === "All Products" ? "Our Collection" : activeCat?.label}
        </h1>
        <p className="mt-2 text-slate-600 max-w-2xl">
          Premium natural foods from MRS Ventures — carefully selected, thoughtfully crafted.
        </p>

        <div className="mt-8 grid lg:grid-cols-[260px_1fr] gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-forest/10 bg-white p-6">
              <Filters {...filterProps} />
            </div>
          </aside>

          <div>
            <div className="flex items-center justify-between gap-3 mb-6">
              <p className="text-sm text-slate-600">{filtered.length} products</p>
              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <button data-testid="mobile-filter-trigger" className="lg:hidden inline-flex items-center gap-2 rounded-full border border-forest/20 px-4 py-2 text-sm font-medium text-forest-deep">
                      <SlidersHorizontal className="h-4 w-4" /> Filters
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="bg-cream overflow-y-auto">
                    <SheetHeader><SheetTitle className="font-serif text-2xl text-forest-deep text-left">Filters</SheetTitle></SheetHeader>
                    <div className="mt-6"><Filters {...filterProps} /></div>
                  </SheetContent>
                </Sheet>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-[170px] rounded-full border-forest/20" data-testid="sort-select">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-forest/20 p-12 text-center text-slate-500">
                No products match your filters.
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" data-testid="shop-grid">
                {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
