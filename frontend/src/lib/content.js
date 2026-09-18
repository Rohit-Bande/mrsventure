export const WHATSAPP_NUMBER_DISPLAY = "09109102611";
const WHATSAPP_INTL = "919109102611";

export const waLink = (message) =>
  `https://wa.me/${WHATSAPP_INTL}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export const INSTAGRAM_URL = "https://www.instagram.com/venturesmrs/";

export const currency = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const discountPct = (price, mrp) =>
  mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

export const NAV_LINKS = [
  { label: "Home", to: "/" },

  {
    label: "Products",
    children: [
      {
        label: "MADHULOGY™ – Raw Natural Honey",
        to: "/madhulogy",
      },
      {
        label: "MAUJI – Makhana",
        to: "/mauji",
      },
      {
        label: "Dry Fruits – Coming Soon",
        to: "/dry-fruits",
      },
      {
        label: "Natural Spices – Coming Soon",
        to: "/natural-spices",
      },
    ],
  },

  {
    label: "Services",
    children: [
      {
        label: "Bee Hive Removal & Relocation",
        to: "/bee-hive-removal",
      },
    ],
  },

  { label: "Innovation", to: "/innovation" },
  { label: "Our Story", to: "/our-story" },
  { label: "Knowledge Centre", to: "/knowledge-centre" },
  { label: "Gallery", to: "/from-the-field" },
  { label: "Contact", to: "/contact" },
  { label: "Shop", to: "/shop" },
];

export const TRUST_STRIP = [
  { title: "Pure & Natural", desc: "Carefully selected products.", icon: "Leaf" },
  { title: "Premium Quality", desc: "Made for quality-conscious customers.", icon: "Award" },
  { title: "Authentic Taste", desc: "Natural flavour and goodness.", icon: "Sparkles" },
  { title: "Delivered with Care", desc: "Secure packaging and convenient delivery.", icon: "Truck" },
];

export const WHY_US = [
  { title: "Naturally Inspired", desc: "Inspired by the goodness of natural ingredients.", icon: "Leaf" },
  { title: "Quality First", desc: "Quality is at the heart of every product.", icon: "ShieldCheck" },
  { title: "Thoughtfully Selected", desc: "Products selected with care.", icon: "Hand" },
  { title: "Premium Experience", desc: "From product to packaging to delivery.", icon: "Gift" },
  { title: "Growing Collection", desc: "A growing range of premium natural foods.", icon: "Sprout" },
  { title: "Made for Modern India", desc: "Traditional goodness with a modern experience.", icon: "MapPin" },
];

export const HONEY_RITUAL = [
  { title: "Morning Warm Water", desc: "A spoonful stirred into warm water to begin the day." },
  { title: "With Your Tea", desc: "A natural sweetener that lets the honey's character shine." },
  { title: "Over Toast & Breakfast", desc: "Golden drizzles on toast, bowls and breakfast plates." },
  { title: "A Natural Sweetener", desc: "A wholesome way to sweeten, the way nature intended." },
];

export const FAQS = [
  {
    q: "Is MADHULOGY™ honey pure and raw?",
    a: "MADHULOGY™ Pure Raw Honey is presented as raw, unprocessed honey. Detailed certification and lab documentation will be shared as provided by the business.",
  },
  {
    q: "Why has my honey crystallised?",
    a: "Honey can naturally crystallise over time. Crystallisation alone does not establish purity or adulteration. Follow the storage instructions on the pack.",  },
  {
    q: "What is the shelf life?",
    a: "Please refer to the best-before date on the pack. Store in a cool, dry place away from direct sunlight.",
  },
  {
    q: "How long does delivery take?",
    a: "Orders are typically processed and dispatched promptly. Delivery timelines vary by location.",
  },
  {
    q: "Can I order on WhatsApp?",
    a: "Yes. You can chat with us on WhatsApp at 09109102611 to place an order or ask any question.",
  },
  {
    q: "Do you offer Cash on Delivery?",
    a: "Cash on Delivery availability depends on the business settings and your location.",
  },
];

export const TESTIMONIALS_COMING_SOON = true;

export const FOOTER_NAV = {
  shop: [
    { label: "Honey", to: "/shop?category=honey" },
    { label: "Makhana", to: "/shop?category=makhana" },
    { label: "Flavoured Makhana", to: "/shop?category=flavoured-makhana" },
    { label: "New Arrivals", to: "/shop?filter=new" },
    { label: "Best Sellers", to: "/shop?filter=bestseller" },
  ],
  company: [
    { label: "About Us", to: "/about" },
    { label: "Our Story", to: "/our-story" },
    { label: "Why MADHULOGY", to: "/why-madhulogy" },
    { label: "Contact", to: "/contact" },
    { label: "FAQ", to: "/faq" },
    { label: "From the Field", to: "/from-the-field" },
  ],
  care: [
    { label: "Shipping Policy", to: "/shipping-policy" },
    { label: "Returns & Refunds", to: "/returns-policy" },
    { label: "Privacy Policy", to: "/privacy-policy" },
    { label: "Terms & Conditions", to: "/terms" },
    // { label: "Track Order", to: "/track" },
  ],
};

const IMG = "https://static.prod-images.emergentagent.com/jobs/5434bbf8-3289-4e59-b53a-7b4c239c5893/images/";
export const INSTAGRAM_GRID = [
  IMG + "2fa2ac0fec2873c72aad0402fbaba6be18776724ce6e3ebf0f4e68119021dc14.jpeg",
  IMG + "15e88183c3e824da8ac1e504a3a86d0740c95db3a63d1a91a61901bde8c42983.jpeg",
  IMG + "519f020cf35088d661f9ee178e791eab44e37477281201e09117d2f009df39ac.jpeg",
  IMG + "df69b14867f80381be8b64d818b33b7f9c80211ea996d8fcaeb3a209bba819e9.jpeg",
  IMG + "236253ce0dcb36c57f9e3785cf26c99a0a9acaff680eb363cfa4ee9f097bf065.jpeg",
  IMG + "f8b4fdd93d1a6c4ca0bfd101b418d219c571c99b973fae752fcff61e89e2372b.jpeg",
];

export const HERO_IMAGE = "/images/field/Home honey.jpeg";
export const LIFESTYLE_IMAGE = "/images/field/honey spoon.jpeg";
export const HONEY_500_IMAGE = "/images/field/zar.jpeg";

export const POLICIES = {
  "shipping-policy": {
    title: "Shipping Policy",
    intro: "How we process, pack and deliver your MRS Ventures order.",
    sections: [
      { h: "Order Processing", p: "Orders are processed promptly after confirmation. [Exact processing time: CLIENT TO PROVIDE]" },
      { h: "Delivery Timelines", p: "Delivery timelines vary by location and courier partner. [CLIENT TO PROVIDE]" },
      { h: "Shipping Charges", p: "Shipping charges, if applicable, are shown at checkout. Free shipping may apply above a threshold. [CLIENT TO PROVIDE]" },
      { h: "Order Tracking", p: "Tracking details will be shared once your order is dispatched. [CLIENT TO PROVIDE]" },
    ],
  },
  "returns-policy": {
    title: "Returns & Refund Policy",
    intro: "Our approach to returns, replacements and refunds.",
    sections: [
      { h: "Eligibility", p: "As food products, returns are accepted only in specific cases such as damaged or incorrect items. [CLIENT TO PROVIDE]" },
      { h: "How to Request", p: "Contact us within the stated window with your order number and photos of the issue. [CLIENT TO PROVIDE]" },
      { h: "Refunds", p: "Approved refunds are processed to the original payment method within a defined timeline. [CLIENT TO PROVIDE]" },
    ],
  },
  "privacy-policy": {
    title: "Privacy Policy",
    intro: "How MRS Ventures collects, uses and protects your information.",
    sections: [
      { h: "Information We Collect", p: "We collect information you provide at checkout such as name, contact and delivery address to fulfil your order." },
      { h: "How We Use It", p: "Your information is used to process orders, provide support and improve our service. We do not sell your data." },
      { h: "Data Security", p: "We take reasonable measures to protect your information. Payment details are handled by secure payment gateways." },
      { h: "Contact", p: "For privacy queries, contact us via the details on our Contact page. [Legal entity & registered address: CLIENT TO PROVIDE]" },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    intro: "The terms that govern your use of the MRS Ventures website.",
    sections: [
      { h: "Use of Website", p: "By using this website you agree to these terms. Content is provided for information and shopping purposes." },
      { h: "Pricing & Availability", p: "Prices and availability are subject to change without notice. We reserve the right to correct errors." },
      { h: "Orders", p: "All orders are subject to acceptance and confirmation. We may cancel orders in case of pricing errors or stock issues." },
      { h: "Governing Law", p: "These terms are governed by applicable Indian law. [Legal entity, GSTIN & FSSAI: CLIENT TO PROVIDE]" },
    ],
  },
};

export const LEGAL_PLACEHOLDERS = [
  { label: "Company Legal Name", value: "[CLIENT TO PROVIDE]" },
  { label: "Registered Address", value: "[CLIENT TO PROVIDE]" },
  { label: "GSTIN", value: "[CLIENT TO PROVIDE]" },
  { label: "FSSAI License", value: "[CLIENT TO PROVIDE]" },
];
