import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { getConfig, getCategories } from "@/lib/api";

const ShopContext = createContext(null);
export const useShop = () => useContext(ShopContext);

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export function ShopProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState(() => load("mrs_cart", []));
  const [wishlist, setWishlist] = useState(() => load("mrs_wishlist", []));
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [config, setConfig] = useState({
    announcement: "Pure Ingredients • Thoughtfully Crafted • Delivered to Your Door",
    whatsapp: "09109102611",
    shipping_charge: 0,
  });

  useEffect(() => {
    getConfig().then(setConfig).catch(() => {});
    getCategories().then(setCategories).catch(() => {});
  }, []);
  useEffect(() => localStorage.setItem("mrs_cart", JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem("mrs_wishlist", JSON.stringify(wishlist)), [wishlist]);

  const addToCart = useCallback((product, variant, qty = 1, openDrawer = true) => {
    const price = variant ? variant.price : product.price;
    const mrp = variant ? variant.mrp : product.mrp;
    const variant_label = variant ? variant.label : null;
    const key = `${product.id}__${variant_label || ""}`;
    setCart((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + qty } : i));
      }
      return [
        ...prev,
        {
          key,
          product_id: product.id,
          slug: product.slug,
          name: product.name,
          variant_label,
          image: product.images?.[0] || "",
          price,
          mrp,
          quantity: qty,
        },
      ];
    });
    toast.success(`${product.name} added to cart`);
    if (openDrawer) setCartOpen(true);
  }, []);

  const removeFromCart = useCallback((key) => {
    setCart((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const updateQty = useCallback((key, qty) => {
    if (qty < 1) return;
    setCart((prev) => prev.map((i) => (i.key === key ? { ...i, quantity: qty } : i)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((product) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p.slug === product.slug);
      if (exists) {
        toast(`${product.name} removed from wishlist`);
        return prev.filter((p) => p.slug !== product.slug);
      }
      toast.success(`${product.name} added to wishlist`);
      return [
        ...prev,
        {
          slug: product.slug,
          id: product.id,
          name: product.name,
          image: product.images?.[0] || "",
          price: product.price,
          mrp: product.mrp,
          short_desc: product.short_desc,
        },
      ];
    });
  }, []);

  const isWishlisted = useCallback((slug) => wishlist.some((p) => p.slug === slug), [wishlist]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartSubtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartSavings = cart.reduce(
    (s, i) => s + ((i.mrp && i.mrp > i.price ? i.mrp - i.price : 0) * i.quantity),
    0
  );

  const value = {
    categories, cart, wishlist, cartOpen, setCartOpen, searchOpen, setSearchOpen, config,
    addToCart, removeFromCart, updateQty, clearCart,
    toggleWishlist, isWishlisted,
    cartCount, cartSubtotal, cartSavings,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
