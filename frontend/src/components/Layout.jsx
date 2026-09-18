import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomBar from "@/components/MobileBottomBar";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import CartDrawer from "@/components/CartDrawer";
import SearchOverlay from "@/components/SearchOverlay";

export default function Layout() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="App flex min-h-screen flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomBar />
      <WhatsAppFloat />
      <CartDrawer />
      <SearchOverlay />
    </div>
  );
}
