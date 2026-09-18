import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ShopProvider } from "@/context/ShopContext";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";
import SearchResults from "@/pages/SearchResults";
import Wishlist from "@/pages/Wishlist";
import About from "@/pages/About";
import OurStory from "@/pages/OurStory";
import WhyMadhulogy from "@/pages/WhyMadhulogy";
import Contact from "@/pages/Contact";
import FAQ from "@/pages/FAQ";
import PolicyPage from "@/pages/PolicyPage";
import { TrackOrder, Account, NotFound } from "@/pages/Misc";
import Admin from "@/pages/Admin";
import Madhulogy from "./pages/Madhulogy";
import Mauji from "./pages/Mauji";
import BeeHive from "./pages/BeeHive";
import Innovation from "@/pages/Innovation";
import ComingSoonProduct from "@/pages/ComingSoonProduct";
import KnowledgeCentre from "@/pages/KnowledgeCentre";
import FromTheField from "@/pages/FromTheField";
import KnowledgeArticle from "@/pages/KnowledgeArticle";

function App() {
  return (
    <BrowserRouter>
      <ShopProvider>
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/about" element={<About />} />
            <Route path="/our-story" element={<OurStory />} />
            <Route path="/why-madhulogy" element={<WhyMadhulogy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/account" element={<Account />} />
            <Route path="/shipping-policy" element={<PolicyPage />} />
            <Route path="/returns-policy" element={<PolicyPage />} />
            <Route path="/privacy-policy" element={<PolicyPage />} />
            <Route path="/terms" element={<PolicyPage />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/madhulogy" element={<Madhulogy/>}/>
            <Route path="/mauji" element={<Mauji/>}/>
            <Route path="/bee-hive-removal" element={<BeeHive/>}/>
            <Route path="/innovation" element={<Innovation />} />
            <Route path="/dry-fruits" element={<ComingSoonProduct />} />
            <Route path="/natural-spices" element={<ComingSoonProduct />} />
            <Route path="/knowledge-centre" element={<KnowledgeCentre />} />
            <Route path="/from-the-field" element={<FromTheField />} />
            <Route path="/knowledge-centre/:id" element={<KnowledgeArticle />}/>
          </Route>
        </Routes>
      </ShopProvider>
    </BrowserRouter>
  );
}

export default App;
