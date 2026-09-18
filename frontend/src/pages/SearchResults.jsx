import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Seo from "@/components/Seo";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api";

export default function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProducts({ search: q }).then((d) => { setResults(d); setLoading(false); }).catch(() => setLoading(false));
  }, [q]);

  return (
    <div className="bg-cream min-h-[60vh]">
      <Seo title={`Search: ${q} | MRS Ventures`} description={`Search results for ${q} at MRS Ventures.`} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-slate-500">Search results for</p>
        <h1 className="font-serif text-4xl font-bold text-forest-deep">"{q}"</h1>
        <p className="mt-2 text-slate-600">{results.length} {results.length === 1 ? "product" : "products"} found</p>

        {loading ? (
          <div className="mt-10 min-h-[30vh]" />
        ) : results.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-forest/20 p-14 text-center">
            <p className="text-slate-600">No products found. Try a different search.</p>
            <Link to="/shop" className="mt-6 inline-block rounded-full bg-forest px-7 py-3.5 text-sm font-semibold text-cream">Browse Shop</Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {results.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
