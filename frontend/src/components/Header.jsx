import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingBag, Menu, User, ChevronDown, } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { NAV_LINKS } from "@/lib/content";
import {
  Sheet, SheetContent, SheetTrigger, SheetClose,
} from "@/components/ui/sheet";


function Logo() {
  return (
    <Link to="/" data-testid="header-logo" className="flex flex-col leading-none">
      <span className="font-serif text-2xl sm:text-[28px] font-bold tracking-tight text-forest-deep">
        MRS Ventures
      </span>
      <span className="text-[10px] uppercase tracking-[0.3em] text-amber-brand font-semibold">
        Premium Natural Foods
      </span>
    </Link>
  );
}

export default function Header() {
  const { cartCount, wishlist, setCartOpen, setSearchOpen } = useShop();
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="site-header"
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cream/95 backdrop-blur-md shadow-[0_4px_20px_rgba(13,59,46,0.08)]"
          : "bg-cream"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Mobile menu */}
          <div className="flex items-center gap-2 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button data-testid="mobile-menu-trigger" aria-label="Open menu" className="p-2 -ml-2">
                  <Menu className="h-6 w-6 text-forest-deep" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-cream w-[80%] max-w-xs">
                <nav className="mt-8 flex flex-col gap-1">
                 {NAV_LINKS.map((l) =>
  l.children ? (
    <details key={l.label} className="border-b border-forest/10">
      <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-lg font-serif font-medium text-forest-deep">
        {l.label}
        <ChevronDown className="h-4 w-4" />
      </summary>

      <div className="flex flex-col gap-1 pb-3 pl-3">
        {l.children.map((child) => (
          <SheetClose asChild key={child.label}>
            <Link
              to={child.to}
              className="py-2 text-sm text-forest-deep hover:text-amber-brand"
            >
              {child.label}
            </Link>
          </SheetClose>
        ))}
      </div>
    </details>
  ) : (
    <SheetClose asChild key={l.label}>
      <Link
        to={l.to}
        data-testid={`mobile-nav-${l.label.toLowerCase().replace(/\s/g, "-")}`}
        className="py-3 text-lg font-serif font-medium text-forest-deep border-b border-forest/10"
      >
        {l.label}
      </Link>
    </SheetClose>
  )
)}
                  <SheetClose asChild>
                    <Link to="/faq" className="py-3 text-lg font-serif font-medium text-forest-deep border-b border-forest/10">FAQ</Link>
                  </SheetClose>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex-1 lg:flex-none flex justify-center lg:justify-start">
            <Logo />
          </div>

          {/* Desktop nav */}

<nav className="hidden lg:flex items-center gap-7">
  {NAV_LINKS.map((l) =>
    l.children ? (
      <details
        key={l.label}
        className="relative"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            event.currentTarget.open = false;
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.currentTarget.open = false;
            event.currentTarget.querySelector("summary")?.focus();
          }
        }}
      >
        <summary
          data-testid={`nav-${l.label.toLowerCase().replace(/\s/g, "-")}`}
          className="flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-forest-deep/85 hover:text-amber-brand transition-colors"
        >
          {l.label}
          <ChevronDown className="h-4 w-4" />
        </summary>

        <div className="absolute left-0 top-full mt-3 w-80 rounded-xl border border-forest/10 bg-cream p-2 shadow-lg">
          {l.children.map((child) => (
            <Link
              key={child.label}
              to={child.to}
              onClick={(event) => {
                event.currentTarget.closest("details").open = false;
              }}
              className="block rounded-lg px-4 py-3 text-sm text-forest-deep hover:bg-beige hover:text-amber-brand transition-colors"
            >
              {child.label}
            </Link>
          ))}
        </div>
      </details>
    ) : (
      <Link
        key={l.label}
        to={l.to}
        data-testid={`nav-${l.label.toLowerCase().replace(/\s/g, "-")}`}
        className="text-sm font-medium text-forest-deep/85 hover:text-amber-brand transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-amber-brand hover:after:w-full after:transition-all"
      >
        {l.label}
      </Link>
    )
  )}
</nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              data-testid="search-trigger"
              aria-label="Search"
              className="p-2 rounded-full hover:bg-beige transition"
            >
              <Search className="h-5 w-5 text-forest-deep" />
            </button>
            {/* <button
              onClick={() => navigate("/account")}
              data-testid="account-btn"
              aria-label="Account"
              className="hidden sm:grid p-2 rounded-full hover:bg-beige transition place-items-center"
            >
              <User className="h-5 w-5 text-forest-deep" />
            </button> */}
            <Link
              to="/wishlist"
              data-testid="wishlist-link"
              aria-label="Wishlist"
              className="relative p-2 rounded-full hover:bg-beige transition"
            >
              <Heart className="h-5 w-5 text-forest-deep" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-amber-brand text-[10px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              data-testid="cart-trigger"
              aria-label="Cart"
              className="relative p-2 rounded-full hover:bg-beige transition"
            >
              <ShoppingBag className="h-5 w-5 text-forest-deep" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-amber-brand text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
