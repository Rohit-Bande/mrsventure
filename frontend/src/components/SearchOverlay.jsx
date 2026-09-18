import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { getProducts } from "@/lib/api";
import { currency } from "@/lib/content";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const POPULAR = ["Raw Honey", "Makhana", "Peri Peri", "Cheese Makhana", "MADHULOGY"];

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useShop();
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mrs_recent") || "[]"); } catch { return []; }
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    const t = setTimeout(() => {
      getProducts({ search: q }).then(setResults).catch(() => {});
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const runSearch = (term) => {
    const val = term ?? q;
    if (!val.trim()) return;
    const next = [val, ...recent.filter((r) => r !== val)].slice(0, 5);
    setRecent(next);
    localStorage.setItem("mrs_recent", JSON.stringify(next));
    setSearchOpen(false);
    setQ("");
    navigate(`/search?q=${encodeURIComponent(val)}`);
  };

  const openProduct = (slug) => {
    setSearchOpen(false);
    setQ("");
    navigate(`/product/${slug}`);
  };

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent
        className="bg-cream p-0 gap-0 max-w-2xl top-[8%] translate-y-0 sm:top-[10%] w-[95vw] rounded-2xl overflow-hidden"
        data-testid="search-overlay"
      >
        <DialogTitle className="sr-only">Search products</DialogTitle>
        <div className="flex items-center gap-3 border-b border-forest/10 px-5 py-4">
          <Search className="h-5 w-5 text-forest-deep/60" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Search honey, makhana, flavours…"
            data-testid="search-input"
            className="flex-1 bg-transparent text-lg outline-none placeholder:text-slate-400 text-forest-deep"
          />
          <button onClick={() => setSearchOpen(false)} aria-label="Close" className="p-1">
            {/* <X className="h-5 w-5 text-forest-deep/60" /> */}
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          {q.trim() && results.length > 0 && (
            <div className="space-y-2">
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => openProduct(p.slug)}
                  data-testid={`search-result-${p.slug}`}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-beige transition"
                >
                  <img src={p.images?.[0]} alt={p.name} className="h-12 w-12 rounded-lg object-cover bg-beige" />
                  <div className="flex-1">
                    <p className="font-medium text-forest-deep leading-tight">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.category_label}</p>
                  </div>
                  <span className="text-sm font-semibold text-forest-deep">{currency(p.price)}</span>
                </button>
              ))}
            </div>
          )}

          {q.trim() && results.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-6">No products found for "{q}".</p>
          )}

          {!q.trim() && (
            <div className="space-y-6">
              {recent.length > 0 && (
                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                    <Clock className="h-3.5 w-3.5" /> Recent Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button key={r} onClick={() => runSearch(r)} className="rounded-full border border-forest/15 px-3 py-1.5 text-sm text-forest-deep hover:bg-beige transition">
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  <TrendingUp className="h-3.5 w-3.5" /> Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map((r) => (
                    <button key={r} onClick={() => runSearch(r)} data-testid={`popular-search-${r.toLowerCase().replace(/\s/g, "-")}`} className="rounded-full bg-forest/10 px-3 py-1.5 text-sm text-forest-deep hover:bg-forest/20 transition">
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
