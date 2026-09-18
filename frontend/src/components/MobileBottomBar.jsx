import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Store, Search, Heart, ShoppingBag } from "lucide-react";
import { useShop } from "@/context/ShopContext";

export default function MobileBottomBar() {
  const { cartCount, wishlist, setSearchOpen, setCartOpen } = useShop();
  const { pathname } = useLocation();

  const item = "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[10px] font-medium";
  const active = (p) => (pathname === p ? "text-amber-brand" : "text-forest-deep/70");

  return (
    <nav
      data-testid="mobile-bottom-bar"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-cream/95 backdrop-blur-md border-t border-forest/10"
    >
      <div className="flex items-stretch">
        <Link to="/" className={`${item} ${active("/")}`} data-testid="bottom-home">
          <Home className="h-5 w-5" /> Home
        </Link>
        <Link to="/shop" className={`${item} ${active("/shop")}`} data-testid="bottom-shop">
          <Store className="h-5 w-5" /> Shop
        </Link>
        <button onClick={() => setSearchOpen(true)} className={`${item} text-forest-deep/70`} data-testid="bottom-search">
          <Search className="h-5 w-5" /> Search
        </button>
        <Link to="/wishlist" className={`${item} relative ${active("/wishlist")}`} data-testid="bottom-wishlist">
          <Heart className="h-5 w-5" /> Wishlist
          {wishlist.length > 0 && (
            <span className="absolute top-1 right-6 grid h-4 w-4 place-items-center rounded-full bg-amber-brand text-[9px] font-bold text-white">{wishlist.length}</span>
          )}
        </Link>
        <button onClick={() => setCartOpen(true)} className={`${item} relative text-forest-deep/70`} data-testid="bottom-cart">
          <ShoppingBag className="h-5 w-5" /> Cart
          {cartCount > 0 && (
            <span className="absolute top-1 right-5 grid h-4 w-4 place-items-center rounded-full bg-amber-brand text-[9px] font-bold text-white">{cartCount}</span>
          )}
        </button>
      </div>
    </nav>
  );
}
