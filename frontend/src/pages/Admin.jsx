import React, { useEffect, useState } from "react";
import { Lock, LayoutDashboard, Package, ShoppingCart, LogOut, Loader2, IndianRupee, Users, Boxes, Plus, Eye, EyeOff, Menu } from "lucide-react";
import Seo from "@/components/Seo";
import {
  adminLogin, adminLogout,
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetOrders,
  adminReconcileOrder,
  adminUpdateOrderStatus,
  adminStats,
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
   adminUploadImage,
   adminUploadDocument,
     adminGetBusinessInformation,
  adminSaveBusinessInformation,
    adminGetQualityInformation,
  adminSaveQualityInformation,
    adminGetEnquiries,
} from "@/lib/api";
import { currency } from "@/lib/content";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetTrigger, SheetClose,
} from "@/components/ui/sheet";
import ShippingPolicyEditor from "@/components/ShippingPolicyEditor";
import PolicyEditor from "@/components/PolicyEditor";
import ServiceRequestsAdmin from "@/components/ServiceRequestsAdmin";
import FieldGalleryAdmin from "@/components/FieldGalleryAdmin";
import InnovationAdmin from "@/components/InnovationAdmin";
import KnowledgeAdmin from "@/components/KnowledgeAdmin";

const ORDER_STATUSES = ["pending_payment", "confirmed", "processing", "shipped", "out for delivery", "delivered", "cancelled"];

const ADMIN_TABS = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["products", "Products", Package],
  ["categories", "Categories", Package],
  ["orders", "Orders", ShoppingCart],
  ["enquiries", "Enquiries", Users],
  ["business", "Business Information", Package],
  ["quality", "Quality & Transparency", Package],
  ["shipping", "Shipping Policy", Package],
  ["policies", "Customer Care Policies", Package],
  ["service-requests", "Service Requests", Users],
  ["field-gallery", "From the Field", Package],
  ["innovation", "Innovation", Package],
  ["knowledge", "Knowledge Centre", Package],
];

const DEFAULT_CATEGORY = {
  name: "",
  slug: "",
  description: "",
  is_active: true,
};

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const emptyProduct = {
  ingredients: "",
storage: "",
origin: "India",
how_to_use: "",
  sku: "",
brand: "MADHULOGY™",
net_quantity: "",
  name: "", category: "", short_desc: "", description: "",
  price: "", mrp: "", image: "", stock: 100, is_featured: false,
};

function Login({ onLogin }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminLogin(pw);
      localStorage.setItem("mrs_admin_token", res.token);
      onLogin(res.token);
    } catch {
      toast.error("Invalid password");
    } finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen grid place-items-center bg-forest-deep px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-cream p-8 shadow-xl">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-forest text-cream mx-auto"><Lock className="h-6 w-6" /></div>
        <h1 className="mt-4 text-center font-serif text-3xl font-bold text-forest-deep">Admin Panel</h1>
        <p className="mt-1 text-center text-sm text-slate-500">MRS Ventures Management</p>
        <div className="relative mt-6">
          <input type={showPw ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Admin password" data-testid="admin-password"
            className="w-full rounded-xl border border-forest/15 px-4 py-3 pr-11 text-sm outline-none focus:ring-2 focus:ring-amber-brand" />
          <button type="button" onClick={() => setShowPw((v) => !v)} data-testid="admin-password-toggle"
            aria-label={showPw ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-forest-deep">
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <button type="submit" disabled={loading} data-testid="admin-login-btn"
          className="mt-4 w-full rounded-full bg-forest py-3 text-sm font-semibold text-cream hover:bg-forest-deep transition disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
        </button>
      </form>
    </div>
  );
}

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("mrs_admin_token"));
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
const [enquiriesLoading, setEnquiriesLoading] = useState(false);
const [enquiriesError, setEnquiriesError] = useState("");
const [enquiriesRefresh, setEnquiriesRefresh] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [businessInfo, setBusinessInfo] = useState({
  company_legal_name: "",
  registered_address: "",
  gstin: "",
  fssai_license: "",
});

const [businessLoading, setBusinessLoading] = useState(false);
const [businessSaving, setBusinessSaving] = useState(false);
const [businessLoaded, setBusinessLoaded] = useState(false);
const [qualityInfo, setQualityInfo] = useState({
  ingredients: "",
  net_quantity: "",
  storage: "",
  best_before: "",
  lab_report_text: "",
  lab_report_url: "",
  image_url: "",
  fssai_license: "",
});

const [qualityLoading, setQualityLoading] = useState(false);
const [qualityLoaded, setQualityLoaded] = useState(false);
const [qualitySaving, setQualitySaving] = useState(false);
const [qualityImageUploading, setQualityImageUploading] = useState(false);
const [qualityDocUploading, setQualityDocUploading] = useState(false);
const [showCategoryDialog, setShowCategoryDialog] = useState(false);
const [editingCategory, setEditingCategory] = useState(null);
const [categoryForm, setCategoryForm] = useState(DEFAULT_CATEGORY);
const [categorySaving, setCategorySaving] = useState(false);
const [editingProduct, setEditingProduct] = useState(null);

  const load = async (t) => {
    try {
     const [s, p, o, c] = await Promise.all([
  adminStats(t),
  adminGetProducts(t),
  adminGetOrders(t),
  adminGetCategories(t),
]);

setStats(s);
setProducts(p);
setOrders(o);
setCategories(c);
    } catch {
      localStorage.removeItem("mrs_admin_token");
      setToken(null);
    }
  };

  useEffect(() => { if (token) load(token); }, [token]);

  useEffect(() => {
  if (!token || tab !== "business") return;

  let cancelled = false;

  setBusinessLoading(true);
  setBusinessLoaded(false);

  adminGetBusinessInformation(token)
    .then((details) => {
      if (cancelled) return;

      setBusinessInfo({
        company_legal_name: details.company_legal_name || "",
        registered_address: details.registered_address || "",
        gstin: details.gstin || "",
        fssai_license: details.fssai_license || "",
      });

      setBusinessLoaded(true);
    })
    .catch(() => {
      if (!cancelled) {
        toast.error("Could not load business information");
      }
    })
    .finally(() => {
      if (!cancelled) setBusinessLoading(false);
    });

  return () => {
    cancelled = true;
  };
}, [token, tab]);

const setBusinessField = (field, value) => {
  setBusinessInfo((previous) => ({
    ...previous,
    [field]: value,
  }));
};

const saveBusinessInformation = async (event) => {
  event.preventDefault();

  if (!businessLoaded || businessSaving) return;

  setBusinessSaving(true);

  try {
    const result = await adminSaveBusinessInformation(
      token,
      businessInfo
    );

    setBusinessInfo(result.data);
    toast.success("Business information saved");
  } catch (error) {
    toast.error(
      error?.response?.data?.detail ||
        "Could not save business information"
    );
  } finally {
    setBusinessSaving(false);
  }
};

useEffect(() => {
  if (!token || tab !== "quality") return;

  let cancelled = false;

  setQualityLoading(true);
  setQualityLoaded(false);

  adminGetQualityInformation(token)
    .then((details) => {
      if (cancelled) return;

      setQualityInfo(details);
      setQualityLoaded(true);
    })
    .catch(() => {
      if (!cancelled) {
        toast.error("Could not load quality information");
      }
    })
    .finally(() => {
      if (!cancelled) setQualityLoading(false);
    });

  return () => {
    cancelled = true;
  };
}, [token, tab]);

const setQualityField = (field, value) => {
  setQualityInfo((previous) => ({
    ...previous,
    [field]: value,
  }));
};

const uploadQualityImage = async (event) => {
  const file = event.target.files?.[0];
  event.target.value = "";

  if (!file) return;

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    toast.error("Select a JPG, PNG or WebP image");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error("Image must be smaller than 5 MB");
    return;
  }

  setQualityImageUploading(true);

  try {
    const result = await adminUploadImage(token, file);
    setQualityField("image_url", result.url);
    toast.success("Image uploaded. Save Changes to publish it.");
  } catch (error) {
    toast.error(
      error?.response?.data?.detail || "Could not upload image"
    );
  } finally {
    setQualityImageUploading(false);
  }
};

const uploadQualityDocument = async (event) => {
  const file = event.target.files?.[0];
  event.target.value = "";

  if (!file) return;

  if (file.type !== "application/pdf") {
    toast.error("Select a PDF file");
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    toast.error("Document must be smaller than 10 MB");
    return;
  }

  setQualityDocUploading(true);

  try {
    const result = await adminUploadDocument(token, file);
    setQualityField("lab_report_url", result.url);
    toast.success("Lab report uploaded. Save Changes to publish it.");
  } catch (error) {
    toast.error(
      error?.response?.data?.detail || "Could not upload the lab report"
    );
  } finally {
    setQualityDocUploading(false);
  }
};

const saveQualityInformation = async (event) => {
  event.preventDefault();

  if (!qualityLoaded || qualitySaving || qualityImageUploading) return;

  // FSSAI is managed separately in Business Information.
  const { fssai_license, ...details } = qualityInfo;

  setQualitySaving(true);

  try {
    const result = await adminSaveQualityInformation(token, details);
    setQualityInfo(result.data);
    toast.success("Quality information saved");
  } catch (error) {
    toast.error(
      error?.response?.data?.detail || "Could not save quality information"
    );
  } finally {
    setQualitySaving(false);
  }
};

useEffect(() => {
  if (!token || tab !== "enquiries") return;

  let cancelled = false;

  setEnquiriesLoading(true);
  setEnquiriesError("");

  adminGetEnquiries(token)
    .then((messages) => {
      if (cancelled) return;

      setEnquiries(
        [...messages].sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        )
      );
    })
    .catch(() => {
      if (!cancelled) {
        setEnquiriesError("Could not load enquiries. Please retry.");
      }
    })
    .finally(() => {
      if (!cancelled) setEnquiriesLoading(false);
    });

  return () => {
    cancelled = true;
  };
}, [token, tab, enquiriesRefresh]);

  const logout = async () => { try { await adminLogout(token); } catch { toast.error("Could not revoke session. Try again."); return; } localStorage.removeItem("mrs_admin_token"); setToken(null); };

  const openAddCategory = () => {
  setEditingCategory(null);
  setCategoryForm(DEFAULT_CATEGORY);
  setShowCategoryDialog(true);
};

const openEditCategory = (category) => {
  setEditingCategory(category);
  setCategoryForm({
    name: category.name || "",
    slug: category.slug || "",
    description: category.description || "",
    is_active: category.is_active !== false,
  });
  setShowCategoryDialog(true);
};

const setCategoryField = (key, value) => {
  setCategoryForm((prev) => ({
    ...prev,
    [key]: value,
  }));
};

const saveCategory = async () => {
  if (!categoryForm.name.trim()) {
    toast.error("Category name is required");
    return;
  }

  const payload = {
    ingredients: np.ingredients.trim(),
storage: np.storage.trim(),
origin: np.origin.trim(),
how_to_use: np.how_to_use.trim(),
    brand: np.brand.trim(),
    sku: np.sku.trim(),
net_quantity: np.net_quantity.trim(),
    name: categoryForm.name.trim(),
    slug: categoryForm.slug.trim() || slugify(categoryForm.name),
    description: categoryForm.description.trim(),
    is_active: categoryForm.is_active,
  };

  setCategorySaving(true);

  try {
    if (editingCategory) {
      const updated = await adminUpdateCategory(
        token,
        editingCategory.id,
        payload
      );

      setCategories((prev) =>
        prev.map((category) =>
          category.id === editingCategory.id
            ? { ...category, ...updated }
            : category
        )
      );

      toast.success("Category updated");
    } else {
      const created = await adminCreateCategory(token, payload);
      setCategories((prev) => [...prev, created]);
      toast.success("Category added");
    }

    setShowCategoryDialog(false);
    setEditingCategory(null);
    setCategoryForm(DEFAULT_CATEGORY);
  } catch (error) {
    toast.error(
      error?.response?.data?.detail || "Could not save category"
    );
  } finally {
    setCategorySaving(false);
  }
};

const removeCategory = async (id) => {
  if (!window.confirm("Delete this category?")) return;

  try {
    await adminDeleteCategory(token, id);
    setCategories((prev) =>
      prev.filter((category) => category.id !== id)
    );
    toast.success("Category deleted");
  } catch (error) {
    toast.error(
      error?.response?.data?.detail || "Could not delete category"
    );
  }
};

const updateProduct = async (id, data) => {
  try {
    const saved = await adminUpdateProduct(token, id, data);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? saved : p))
    );
    toast.success("Product updated");
  } catch (error) {
    toast.error(error?.response?.data?.detail || "Update failed");
  }
};

const openEditProduct = (product) => {
  setEditingProduct(product);
};

const saveEditedProduct = async () => {
  if (!editingProduct || saving) return;

  const incompleteNutrition = (editingProduct.nutrition || []).some(
  (row) => !row.label?.trim() || !row.value?.trim()
);

if (incompleteNutrition) {
  toast.error("Fill both fields in every nutrition row, or remove the empty row");
  return;
}

const packs = editingProduct.variants || [];

if (
  packs.some(
    (pack) =>
      !pack.label?.trim() ||
      !pack.weight?.trim() ||
      !Number.isFinite(pack.price) ||
      pack.price < 0 ||
      !Number.isInteger(pack.stock) ||
      pack.stock < 0 ||
      (pack.mrp != null &&
        (!Number.isFinite(pack.mrp) || pack.mrp < pack.price)) ||
      (pack.manufactured_on &&
        pack.best_before &&
        pack.best_before < pack.manufactured_on)
  )
) {
  toast.error("Check each pack’s size, price, MRP, stock and dates");
  return;
}

const labels = packs.map((pack) => pack.label.trim().toLowerCase());
if (new Set(labels).size !== labels.length) {
  toast.error("Pack labels must be unique");
  return;
}

  setSaving(true);
  try {
    const saved = await adminUpdateProduct(token, editingProduct.id, {
      brand: editingProduct.brand,
      sku: editingProduct.sku || "",
      net_quantity: editingProduct.net_quantity || "",
      origin: editingProduct.origin || "",
      description: editingProduct.description || "",
      storage: editingProduct.storage || "",
      ingredients: editingProduct.ingredients || "",
      nutrition: editingProduct.nutrition || [],
      images: editingProduct.images || [],
       ...(packs.length > 0
    ? { price: packs[0].price, mrp: packs[0].mrp ?? null }
    : {}),
  variants: packs,
    });

    setProducts((prev) =>
      prev.map((p) => (p.id === saved.id ? saved : p))
    );
    setEditingProduct(null);
    toast.success("Product saved");
  } catch (error) {
    toast.error(error?.response?.data?.detail || "Could not save product");
  } finally {
    setSaving(false);
  }
};

const uploadEditedProductImage = async (event) => {
  const file = event.target.files?.[0];
  event.target.value = "";

  if (!file || !editingProduct || imageUploading) return;

  if ((editingProduct.images || []).length >= 12) {
    toast.error("A product can have up to 12 photos");
    return;
  }

  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 5 * 1024 * 1024
  ) {
    toast.error("Select a JPG, PNG or WebP image under 5 MB");
    return;
  }

  setImageUploading(true);
  try {
    const uploaded = await adminUploadImage(token, file);
    setEditingProduct((current) =>
      current
        ? {
            ...current,
            images: [...(current.images || []), uploaded.url],
          }
        : current
    );
    toast.success("Photo added. Click Save Changes when finished.");
  } catch (error) {
    toast.error(error?.response?.data?.detail || "Image upload failed");
  } finally {
    setImageUploading(false);
  }
};

const uploadPackImage = async (event, packIndex) => {
  const file = event.target.files?.[0];
  event.target.value = "";

  if (!file || !editingProduct || imageUploading || saving) return;

  const pack = editingProduct.variants?.[packIndex];
  if (!pack) return;

  if ((pack.images || []).length >= 12) {
    toast.error("A pack can have up to 12 photos");
    return;
  }

  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 5 * 1024 * 1024
  ) {
    toast.error("Select a JPG, PNG or WebP image under 5 MB");
    return;
  }

  setImageUploading(true);
  try {
    const uploaded = await adminUploadImage(token, file);

    setEditingProduct((current) =>
      current
        ? {
            ...current,
            variants: (current.variants || []).map((item, index) =>
              index === packIndex
                ? { ...item, images: [...(item.images || []), uploaded.url] }
                : item
            ),
          }
        : current
    );

    toast.success("Pack photo added. Click Save Changes to publish.");
  } catch (error) {
    toast.error(error?.response?.data?.detail || "Pack photo upload failed");
  } finally {
    setImageUploading(false);
  }
};

  const removeProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try { await adminDeleteProduct(token, id); setProducts((prev) => prev.filter((p) => p.id !== id)); toast.success("Deleted"); }
    catch (error) {
  toast.error(error?.response?.data?.detail || "Delete failed");
}
  };

  const setNP = (k, v) => setNewProduct((p) => ({ ...p, [k]: v }));

  const uploadProductImage = async (event) => {
  const file = event.target.files?.[0];
  event.target.value = "";

  if (!file) return;

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    toast.error("Select a JPG, PNG or WebP image");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error("Image must be smaller than 5 MB");
    return;
  }

  setImageUploading(true);

  try {
    const result = await adminUploadImage(token, file);
    setNP("image", result.url);
    toast.success("Image uploaded");
  } catch (error) {
    toast.error(
      error?.response?.data?.detail || "Could not upload image"
    );
  } finally {
    setImageUploading(false);
  }
};

  const createProduct = async () => {
  if (saving || imageUploading) return;

  const np = newProduct;

  if (!np.brand.trim()) {
  toast.error("Please enter a brand");
  return;
}

  if (!np.category) {
    toast.error("Please select a category");
    return;
  }
    if (!np.name.trim() || !np.short_desc.trim() || !np.price) {
      toast.error("Name, short description and price are required");
      return;
    }
    const category_label =
  categories.find((c) => c.slug === np.category)?.name ||
  np.category;
    const price = Number(np.price);
    const payload = {
      slug: slugify(np.name) + "-" + Math.random().toString(36).slice(2, 6),
      name: np.name.trim(),
      brand: np.category === "honey" ? "MADHULOGY™" : "MRS Ventures",
      category: np.category,
      category_label,
      short_desc: np.short_desc.trim(),
      description: np.description.trim() || np.short_desc.trim(),
      price,
      mrp: np.mrp ? Number(np.mrp) : null,
      images: np.image.trim() ? [np.image.trim()] : [],
      stock: Number(np.stock) || 0,
      is_featured: np.is_featured,
      variants: [{ label: "Standard", weight: "Standard", price, mrp: np.mrp ? Number(np.mrp) : null, stock: Number(np.stock) || 0 }],
      seo_title: `${np.name.trim()} | MRS Ventures`,
      seo_description: np.short_desc.trim(),
    };
    setSaving(true);
    try {
      const created = await adminCreateProduct(token, payload);
      setProducts((prev) => [...prev, created]);
      toast.success("Product added");
      setShowAdd(false);
      setNewProduct(emptyProduct);
      load(token);
    } catch (error) {
  toast.error(error?.response?.data?.detail || "Could not add product");
} finally { setSaving(false); }
  };

  const changeStatus = async (num, status) => {
    try { const result=await adminUpdateOrderStatus(token, num, status); setOrders((prev) => prev.map((o) => (o.order_number === num ? result.order : o))); toast.success("Status updated"); }
    catch (error) { toast.error(error?.response?.data?.detail || "Update failed"); }
  };
  const reconcilePayment = async (num) => {
    try {
      const result=await adminReconcileOrder(token,num);
      setOrders((prev)=>prev.map((o)=>o.order_number===num?result.order:o));
      toast(result.order.needs_payment_review?"Payment needs manual review":result.authorized?"Payment authorized; do not cancel yet":`Payment status: ${result.order.payment_status}`);
    } catch (error) {toast.error(error?.response?.data?.detail || "Could not reconcile payment");}
  };

  if (!token) return <Login onLogin={setToken} />;

  return (
    <div className="min-h-screen bg-beige/40">
      <Seo title="Admin | MRS Ventures" description="MRS Ventures admin panel" />
      <div className="flex">
        <aside className="hidden sm:flex w-56 flex-col bg-forest-deep text-cream min-h-screen p-5 sticky top-0">
          <h2 className="font-serif text-2xl font-bold">MRS Ventures</h2>
          <p className="text-xs text-cream/60">Admin Panel</p>
          <nav className="mt-8 space-y-1 flex-1">
            {ADMIN_TABS.map(([val, label, Icon]) => (
              <button key={val} onClick={() => setTab(val)} data-testid={`admin-tab-${val}`}
                className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm leading-snug transition ${tab === val ? "bg-cream/15 font-medium" : "text-cream/70 hover:bg-cream/10"}`}>
                <Icon className="h-4 w-4 mt-0.5 shrink-0" /> <span>{label}</span>
              </button>
            ))}
          </nav>
          <button onClick={logout} data-testid="admin-logout" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-cream/70 hover:bg-cream/10"><LogOut className="h-4 w-4" /> Logout</button>
        </aside>

        <main className="flex-1 p-4 sm:p-8">
          <div className="sm:hidden mb-4 flex items-center justify-between rounded-xl border border-forest/15 bg-white px-4 py-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Admin Panel</p>
              <p className="font-serif text-lg font-semibold text-forest-deep">
                {ADMIN_TABS.find(([v]) => v === tab)?.[1]}
              </p>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <button data-testid="admin-mobile-menu-trigger" aria-label="Open admin menu"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-forest/15 text-forest-deep">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="flex w-[80%] max-w-xs flex-col bg-forest-deep p-5 text-cream">
                <h2 className="font-serif text-2xl font-bold">MRS Ventures</h2>
                <p className="text-xs text-cream/60">Admin Panel</p>
                <nav className="mt-8 flex-1 space-y-1 overflow-y-auto">
                  {ADMIN_TABS.map(([val, label, Icon]) => (
                    <SheetClose asChild key={val}>
                      <button onClick={() => setTab(val)} data-testid={`admin-tab-mobile-${val}`}
                        className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm leading-snug transition ${tab === val ? "bg-cream/15 font-medium" : "text-cream/70 hover:bg-cream/10"}`}>
                        <Icon className="h-4 w-4 mt-0.5 shrink-0" /> <span>{label}</span>
                      </button>
                    </SheetClose>
                  ))}
                </nav>
                <SheetClose asChild>
                  <button onClick={logout} data-testid="admin-logout-mobile" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-cream/70 hover:bg-cream/10"><LogOut className="h-4 w-4" /> Logout</button>
                </SheetClose>
              </SheetContent>
            </Sheet>
          </div>

          {tab === "shipping" && (
  <ShippingPolicyEditor token={token} />
)}

{tab === "policies" && (
  <PolicyEditor token={token} />
)}

{tab === "service-requests" && (
  <ServiceRequestsAdmin token={token} />
)}

{tab === "field-gallery" && (
  <FieldGalleryAdmin token={token} />
)}


{tab === "innovation" && (
  <InnovationAdmin token={token} />
)}

{tab === "knowledge" && (
  <KnowledgeAdmin token={token} />
)}

          {tab === "dashboard" && (
            <div>
              <h1 className="font-serif text-3xl font-bold text-forest-deep">Dashboard</h1>
              <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[[IndianRupee, "Revenue", currency(stats?.revenue || 0)], [ShoppingCart, "Orders", stats?.orders || 0], [Boxes, "Products", stats?.products || 0], [Users, "Subscribers", stats?.subscribers || 0]].map(([Icon, label, val]) => (
                  <div key={label} className="rounded-2xl border border-forest/10 bg-white p-5">
                    <Icon className="h-6 w-6 text-amber-brand" />
                    <p className="mt-3 text-sm text-slate-500">{label}</p>
                    <p className="font-serif text-2xl font-bold text-forest-deep">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "business" && (
  <div className="max-w-3xl">
    <h1 className="font-serif text-3xl font-bold text-forest-deep">
      Business Information
    </h1>

    <p className="mt-2 text-sm text-slate-500">
      Update the business details displayed on your About page.
    </p>

    {businessLoading ? (
      <p className="mt-6 flex items-center gap-2 text-forest-deep">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading business information…
      </p>
    ) : !businessLoaded ? (
      <p className="mt-6 text-red-600">
        Could not load the details. Open another tab, then return
        here to retry.
      </p>
    ) : (
      <form
        onSubmit={saveBusinessInformation}
        className="mt-6 space-y-5 rounded-2xl border border-forest/10 bg-white p-6"
      >
        <fieldset disabled={businessSaving} className="space-y-5">
          <div>
            <label
              htmlFor="business-legal-name"
              className="text-sm font-medium text-forest-deep"
            >
              Company Legal Name
            </label>

            <input
              id="business-legal-name"
              value={businessInfo.company_legal_name}
              onChange={(event) =>
                setBusinessField(
                  "company_legal_name",
                  event.target.value
                )
              }
              maxLength={200}
              className="mt-1.5 w-full rounded-xl border border-forest/15 px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="business-address"
              className="text-sm font-medium text-forest-deep"
            >
              Registered Address
            </label>

            <textarea
              id="business-address"
              value={businessInfo.registered_address}
              onChange={(event) =>
                setBusinessField(
                  "registered_address",
                  event.target.value
                )
              }
              rows={3}
              maxLength={1000}
              className="mt-1.5 w-full rounded-xl border border-forest/15 px-4 py-3 text-sm"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="business-gstin"
                className="text-sm font-medium text-forest-deep"
              >
                GSTIN
              </label>

              <input
                id="business-gstin"
                value={businessInfo.gstin}
                onChange={(event) =>
                  setBusinessField(
                    "gstin",
                    event.target.value.toUpperCase()
                  )
                }
                maxLength={15}
                className="mt-1.5 w-full rounded-xl border border-forest/15 px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="business-fssai"
                className="text-sm font-medium text-forest-deep"
              >
                FSSAI Licence Number
              </label>

              <input
                id="business-fssai"
                value={businessInfo.fssai_license}
                onChange={(event) =>
                  setBusinessField(
                    "fssai_license",
                    event.target.value
                  )
                }
                maxLength={14}
                inputMode="numeric"
                className="mt-1.5 w-full rounded-xl border border-forest/15 px-4 py-3 text-sm"
              />
            </div>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={businessSaving}
          className="flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream disabled:opacity-60"
        >
          {businessSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    )}
  </div>
)}


{tab === "quality" && (
  <div className="max-w-3xl">
    <h1 className="font-serif text-3xl font-bold text-forest-deep">
      Quality & Transparency
    </h1>

    <p className="mt-2 text-sm text-slate-500">
      Update the product information and image displayed on the homepage.
    </p>

    {qualityLoading ? (
      <p className="mt-6 flex items-center gap-2 text-forest-deep">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading…
      </p>
    ) : !qualityLoaded ? (
      <p className="mt-6 text-red-600">
        Could not load details. Open another tab, then return here to retry.
      </p>
    ) : (
      <form
        onSubmit={saveQualityInformation}
        className="mt-6 space-y-5 rounded-2xl border border-forest/10 bg-white p-6"
      >
        <fieldset
          disabled={qualitySaving || qualityImageUploading || qualityDocUploading}
          className="space-y-5"
        >
          {[
            ["ingredients", "Ingredients", 1000],
            ["net_quantity", "Net Quantity", 200],
            ["storage", "Storage", 1000],
            ["best_before", "Best Before", 300],
            ["lab_report_text", "Lab Report Text", 500],
          ].map(([field, label, maxLength]) => (
            <div key={field}>
              <label
                htmlFor={`quality-${field}`}
                className="text-sm font-medium text-forest-deep"
              >
                {label}
              </label>

              <input
                id={`quality-${field}`}
                value={qualityInfo[field] || ""}
                onChange={(event) =>
                  setQualityField(field, event.target.value)
                }
                maxLength={maxLength}
                className="mt-1.5 w-full rounded-xl border border-forest/15 px-4 py-3 text-sm"
              />
            </div>
          ))}

          <div>
            <label
              htmlFor="quality-lab-link"
              className="text-sm font-medium text-forest-deep"
            >
              Lab Report Link
            </label>

            <input
              id="quality-lab-link"
              type="text"
              value={qualityInfo.lab_report_url || ""}
              onChange={(event) =>
                setQualityField("lab_report_url", event.target.value)
              }
              placeholder="https://... or upload a PDF below"
              maxLength={2000}
              className="mt-1.5 w-full rounded-xl border border-forest/15 px-4 py-3 text-sm"
            />

            <p className="mt-2 text-xs text-slate-500">
              Paste a link above, or upload the report PDF directly — it
              updates whenever you re-upload a new one.
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-forest/10 px-3 py-2 text-xs font-medium text-forest-deep hover:bg-forest/20">
                {qualityDocUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Upload Lab Report PDF"
                )}
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={uploadQualityDocument}
                  disabled={qualityDocUploading}
                  className="hidden"
                />
              </label>

              {qualityInfo.lab_report_url && (
                <a
                  href={qualityInfo.lab_report_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-forest-deep underline"
                >
                  View current file
                </a>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-beige/50 p-4">
            <p className="text-sm font-medium text-forest-deep">
              FSSAI Licence Number
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {qualityInfo.fssai_license || "Not provided"}
            </p>

            <button
              type="button"
              onClick={() => setTab("business")}
              className="mt-2 text-sm text-forest-deep underline"
            >
              Edit in Business Information
            </button>
          </div>

          <div>
            <label
              htmlFor="quality-image-upload"
              className="text-sm font-medium text-forest-deep"
            >
              Section Image
            </label>

            <input
              id="quality-image-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={uploadQualityImage}
              className="mt-1.5 w-full rounded-xl border border-forest/15 px-4 py-3 text-sm"
            />

            <p className="mt-2 text-xs text-slate-500">
              JPG, PNG or WebP. Maximum 5 MB.
            </p>

            {qualityInfo.image_url && (
              <div className="mt-3">
                <img
                  src={qualityInfo.image_url}
                  alt="Quality section preview"
                  className="h-48 w-48 rounded-xl object-cover"
                />

                <button
                  type="button"
                  onClick={() => setQualityField("image_url", "")}
                  className="mt-2 text-sm text-red-600"
                >
                  Use default image
                </button>
              </div>
            )}
          </div>
        </fieldset>

        {qualityImageUploading && (
          <p className="flex items-center gap-2 text-sm text-forest-deep">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading image…
          </p>
        )}

        <button
          type="submit"
          disabled={qualitySaving || qualityImageUploading}
          className="flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream disabled:opacity-60"
        >
          {qualitySaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    )}
  </div>
)}


{tab === "enquiries" && (
  <div className="max-w-5xl">
    <div className="flex items-center justify-between gap-4">
      <h1 className="font-serif text-3xl font-bold text-forest-deep">
        Enquiries
      </h1>

      <button
        type="button"
        onClick={() => setEnquiriesRefresh((value) => value + 1)}
        disabled={enquiriesLoading}
        className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-60"
      >
        Refresh
      </button>
    </div>

    <p className="mt-2 text-sm text-slate-500">
      Messages submitted through the website contact form.
    </p>

    <div className="mt-6 space-y-4">
      {enquiriesLoading ? (
        <p className="flex items-center gap-2 text-forest-deep">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading enquiries…
        </p>
      ) : enquiriesError ? (
        <p role="alert" className="text-red-600">
          {enquiriesError}
        </p>
      ) : enquiries.length === 0 ? (
        <div className="rounded-2xl border border-forest/10 bg-white p-6 text-slate-500">
          No enquiries received yet.
        </div>
      ) : (
        enquiries.map((enquiry) => (
          <article
            key={enquiry.id}
            className="rounded-2xl border border-forest/10 bg-white p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="font-serif text-xl font-semibold text-forest-deep">
                {enquiry.name}
              </h2>

              <p className="text-xs text-slate-500">
                {enquiry.created_at &&
                  new Date(enquiry.created_at).toLocaleString()}
              </p>
            </div>

            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="break-words text-forest-deep">
                  {enquiry.email || "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">Phone</dt>
                <dd className="text-forest-deep">
                  {enquiry.phone || "Not provided"}
                </dd>
              </div>
            </dl>

            <div className="mt-4 rounded-xl bg-beige/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-brand">
                Message
              </p>

              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-forest-deep">
                {enquiry.message}
              </p>
            </div>
          </article>
        ))
      )}
    </div>
  </div>
)}


          {tab === "products" && (
            <div>
              <div className="flex items-center justify-between gap-3">
                <h1 className="font-serif text-3xl font-bold text-forest-deep">Products</h1>
                <button onClick={() => { setNewProduct(emptyProduct); setShowAdd(true); }} data-testid="admin-add-product-btn"
                  className="inline-flex items-center gap-2 rounded-full bg-amber-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-glow transition active:scale-95">
                  <Plus className="h-4 w-4" /> Add Product
                </button>
              </div>
              <div className="mt-6 space-y-3">
                {products.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-forest/10 bg-white p-4" data-testid={`admin-product-${p.slug}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <img src={p.images?.[0]} alt={p.name} className="h-16 w-16 shrink-0 rounded-lg object-cover bg-beige" />
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-lg font-semibold text-forest-deep">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.category_label}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 sm:shrink-0">
                        <label className="text-xs text-slate-500">Stock
                          <input type="number" defaultValue={p.stock} onBlur={(e) => updateProduct(p.id, { stock: Number(e.target.value) })} data-testid={`admin-stock-${p.slug}`}
                            className="ml-1 w-16 rounded-lg border border-forest/15 px-2 py-1 text-sm text-forest-deep" />
                        </label>
                        <label className="flex items-center gap-1 text-xs text-slate-500">
                          <input type="checkbox" defaultChecked={p.is_featured} onChange={(e) => updateProduct(p.id, { is_featured: e.target.checked })} /> Featured
                        </label>
                        <button type="button" onClick={() => openEditProduct(p)}
  className="rounded-lg bg-forest/10 px-3 py-1.5 text-xs font-medium text-forest-deep hover:bg-forest/20">
  Edit
</button>
                        <button onClick={() => removeProduct(p.id)} data-testid={`admin-delete-${p.slug}`} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100">Delete</button>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-forest/10 pt-4">
                      {p.variants?.length > 1 ? (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
    {p.variants.map((v, index) => (
      <div key={v.id || v.label} className="rounded-xl border border-forest/10 bg-beige/40 p-3">
        <p className="mb-2 text-xs font-semibold text-forest-deep">{v.label}</p>
        <div className="flex items-center gap-2">
          <label className="flex-1 text-xs text-slate-500">
            Price ₹
            <input
              type="number"
              min="0"
              step="0.01"
              defaultValue={v.price}
              onBlur={(e) => {
                const price = Number(e.target.value);
                if (!Number.isFinite(price) || price < 0 || price === v.price) return;
                updateProduct(p.id, {
                  variants: p.variants.map((item, i) =>
                    i === index ? { ...item, price } : item
                  ),
                  ...(index === 0 ? { price } : {}),
                });
              }}
              className="mt-1 w-full rounded-lg border border-forest/15 px-2 py-1"
            />
          </label>
          <label className="flex-1 text-xs text-slate-500">
            MRP ₹
            <input
              type="number"
              min="0"
              step="0.01"
              defaultValue={v.mrp ?? ""}
              onBlur={(e) => {
                const mrp = e.target.value === "" ? null : Number(e.target.value);
                if (mrp !== null && (!Number.isFinite(mrp) || mrp < v.price)) return;
                if (mrp === (v.mrp ?? null)) return;
                updateProduct(p.id, {
                  variants: p.variants.map((item, i) =>
                    i === index ? { ...item, mrp } : item
                  ),
                  ...(index === 0 ? { mrp } : {}),
                });
              }}
              className="mt-1 w-full rounded-lg border border-forest/15 px-2 py-1"
            />
          </label>
        </div>
      </div>
    ))}
  </div>
) : (
  <label className="text-xs text-slate-500">
    Price ₹
    <input
      type="number"
      defaultValue={p.price}
      onBlur={(e) => updateProduct(p.id, { price: Number(e.target.value) })}
      data-testid={`admin-price-${p.slug}`}
      className="ml-1 w-20 rounded-lg border border-forest/15 px-2 py-1 text-sm text-forest-deep"
    />
  </label>
)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "categories" && (
  <div>
    <div className="flex items-center justify-between gap-3">
      <h1 className="font-serif text-3xl font-bold text-forest-deep">
        Categories
      </h1>

      <button
        onClick={openAddCategory}
        data-testid="admin-add-category-btn"
        className="inline-flex items-center gap-2 rounded-full bg-amber-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-glow transition"
      >
        <Plus className="h-4 w-4" />
        Add Category
      </button>
    </div>

    <div className="mt-6 space-y-3">
      {categories.length === 0 ? (
        <p className="text-slate-500">No categories found.</p>
      ) : (
        categories.map((category) => (
          <div
            key={category.id}
            className="rounded-2xl border border-forest/10 bg-white p-4 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="flex-1">
              <p className="font-serif text-lg font-semibold text-forest-deep">
                {category.name}
              </p>

              <p className="text-xs text-slate-500">
                Slug: {category.slug}
              </p>

              {category.description && (
                <p className="mt-1 text-sm text-slate-500">
                  {category.description}
                </p>
              )}
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                category.is_active !== false
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {category.is_active !== false ? "Active" : "Inactive"}
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => openEditCategory(category)}
                className="rounded-lg bg-forest/10 px-3 py-1.5 text-xs font-medium text-forest-deep hover:bg-forest/20"
              >
                Edit
              </button>

           

              <button
                onClick={() => removeCategory(category.id)}
                className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
)}

          {tab === "orders" && (
            <div>
              <h1 className="font-serif text-3xl font-bold text-forest-deep">Orders</h1>
              {orders.length === 0 ? (
                <p className="mt-6 text-slate-500">No orders yet.</p>
              ) : (
                <div className="mt-6 space-y-3">
                  {orders.map((o) => (
                    <div key={o.order_number} className="rounded-2xl border border-forest/10 bg-white p-4" data-testid={`admin-order-${o.order_number}`}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                              <p className="break-all font-sans text-sm font-semibold tracking-wide text-forest-deep select-all">
                                 {o.order_number}
                              </p>
                          <p className="text-xs text-slate-500">{o.customer?.name} • {o.customer?.mobile} • {o.customer?.city}, {o.customer?.state}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-forest-deep">{currency(o.total)}</p>
                          <p className="text-xs text-slate-500 capitalize">{o.payment_method} • {o.payment_status}</p>
                          {o.needs_payment_review && (
                            <p role="alert" className="mt-1 text-xs font-semibold text-red-700">
                              Payment requires manual review — do not fulfil
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="text-xs text-slate-500">{o.items?.length} item(s)</span>
                        {o.payment_method === "razorpay" && o.razorpay_order_id && (
                          <button type="button" onClick={()=>reconcilePayment(o.order_number)} className="text-xs text-forest-deep underline">
                            Reconcile payment
                          </button>
                        )}
                        <Select value={o.status} onValueChange={(v) => changeStatus(o.order_number, v)}>
                          <SelectTrigger className="w-[180px] h-9 rounded-full border-forest/20 text-sm" data-testid={`admin-status-${o.order_number}`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-cream max-w-lg max-h-[90vh] overflow-y-auto" data-testid="admin-add-product-dialog">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-forest-deep">Add New Product</DialogTitle>
            <DialogDescription>Create a new product for the MRS Ventures catalog.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-forest-deep">Product Name *</label>
              <input value={newProduct.name} onChange={(e) => setNP("name", e.target.value)} data-testid="np-name"
                className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-brand" />
            </div>

<div>
  <label htmlFor="np-brand" className="text-sm text-forest-deep">
    Brand *
  </label>
  <input
    id="np-brand"
    value={newProduct.brand}
    onChange={(e) => setNP("brand", e.target.value)}
    className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-3"
  />
</div>

<div>
  <label htmlFor="np-sku" className="text-sm text-forest-deep">
    SKU
  </label>
  <input
    id="np-sku"
    maxLength={100}
    placeholder="MADHULOGY-100G"
    value={newProduct.sku}
    onChange={(e) => setNP("sku", e.target.value)}
    className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-3"
  />
</div>

<div>
  <label htmlFor="np-quantity" className="text-sm text-forest-deep">
    Net Quantity / Pack Size
  </label>
  <input
    id="np-quantity"
    placeholder="100 g"
    value={newProduct.net_quantity}
    onChange={(e) => setNP("net_quantity", e.target.value)}
    className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-3"
  />
</div>

            <div>
              <label className="text-sm font-medium text-forest-deep">Category *</label>
              <Select value={newProduct.category} onValueChange={(v) => setNP("category", v)}>
                <SelectTrigger className="mt-1.5 rounded-xl border-forest/15 bg-white" data-testid="np-category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories
  .filter((category) => category.is_active !== false)
  .map((category) => (
    <SelectItem
      key={category.slug}
      value={category.slug}
    >
      {category.name}
    </SelectItem>
  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-forest-deep">Short Description *</label>
              <input value={newProduct.short_desc} onChange={(e) => setNP("short_desc", e.target.value)} data-testid="np-short-desc"
                className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-brand" />
            </div>
            <div>
              <label className="text-sm font-medium text-forest-deep">Full Description</label>
              <textarea value={newProduct.description} onChange={(e) => setNP("description", e.target.value)} rows={3} data-testid="np-description"
                className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-brand resize-none" />
            </div>
            <div>
  <label htmlFor="np-ingredients" className="text-sm text-forest-deep">
    Ingredients
  </label>
  <textarea
    id="np-ingredients"
    rows={2}
    placeholder="For example: 100% Raw Honey"
    value={newProduct.ingredients}
    onChange={(e) => setNP("ingredients", e.target.value)}
    className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-3"
  />
</div>

<div>
  <label htmlFor="np-storage" className="text-sm text-forest-deep">
    Storage Instructions
  </label>
  <textarea
    id="np-storage"
    rows={3}
    placeholder="Store in a cool, dry place..."
    value={newProduct.storage}
    onChange={(e) => setNP("storage", e.target.value)}
    className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-3"
  />
</div>

<div>
  <label htmlFor="np-origin" className="text-sm text-forest-deep">
    Country of Origin
  </label>
  <input
    id="np-origin"
    value={newProduct.origin}
    onChange={(e) => setNP("origin", e.target.value)}
    className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-3"
  />
</div>

<div>
  <label htmlFor="np-how-to-use" className="text-sm text-forest-deep">
    How to Use
  </label>
  <textarea
    id="np-how-to-use"
    rows={3}
    value={newProduct.how_to_use}
    onChange={(e) => setNP("how_to_use", e.target.value)}
    className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-3"
  />
</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-forest-deep">Price (₹) *</label>
                <input type="number" value={newProduct.price} onChange={(e) => setNP("price", e.target.value)} data-testid="np-price"
                  className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-brand" />
              </div>
              <div>
                <label className="text-sm font-medium text-forest-deep">MRP (₹)</label>
                <input type="number" value={newProduct.mrp} onChange={(e) => setNP("mrp", e.target.value)} data-testid="np-mrp"
                  className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-brand" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-forest-deep">Stock</label>
                <input type="number" value={newProduct.stock} onChange={(e) => setNP("stock", e.target.value)} data-testid="np-stock"
                  className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-brand" />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm text-forest-deep">
                  <input type="checkbox" checked={newProduct.is_featured} onChange={(e) => setNP("is_featured", e.target.checked)} data-testid="np-featured" /> Featured product
                </label>
              </div>
            </div>
            <div>
  <label
    htmlFor="product-image-upload"
    className="text-sm font-medium text-forest-deep"
  >
    Upload Product Image
  </label>

  <input
    id="product-image-upload"
    type="file"
    accept="image/jpeg,image/png,image/webp"
    onChange={uploadProductImage}
    disabled={imageUploading || saving}
    className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm"
  />

  <p className="mt-2 text-xs text-slate-500">
    JPG, PNG or WebP. Maximum 5 MB.
  </p>

  {imageUploading && (
    <p className="mt-2 text-sm text-forest-deep">
      Uploading image…
    </p>
  )}

  {newProduct.image && (
    <img
      src={newProduct.image}
      alt="Product preview"
      className="mt-3 h-36 w-36 rounded-xl object-cover"
    />
  )}
</div>
          </div>
          <DialogFooter>
            <button onClick={() => setShowAdd(false)} className="rounded-full border border-forest/20 px-5 py-2.5 text-sm font-semibold text-forest-deep hover:bg-forest/5">Cancel</button>
          <button onClick={createProduct} disabled={saving || imageUploading} data-testid="np-save"
              className="rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream hover:bg-forest-deep transition disabled:opacity-60 flex items-center gap-2">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Add Product"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
  open={Boolean(editingProduct)}
  onOpenChange={(open) => {
    if (!open && !saving) setEditingProduct(null);
  }}
>
  <DialogContent className="bg-cream max-w-lg max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="font-serif text-2xl text-forest-deep">
        Edit Product
      </DialogTitle>
      <DialogDescription>
        Update the existing product without creating a duplicate.
      </DialogDescription>
    </DialogHeader>

    {editingProduct && (
      <div className="space-y-4 py-2">
        <p className="font-medium text-forest-deep">{editingProduct.name}</p>

    <label className="block text-sm text-forest-deep">
  Add Product Photo
  <input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    onChange={uploadEditedProductImage}
    disabled={saving || imageUploading}
    className="mt-2 block w-full"
  />
  <span className="mt-1 block text-xs text-slate-500">
    Add photos one at a time, up to 12. Save when finished.
  </span>
</label>



<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
  {(editingProduct.images || []).map((url, index) => (
    <div
      key={`${url}-${index}`}
      className="rounded-xl border border-forest/15 bg-white p-2"
    >
      <img
        src={url}
        alt={`Product photo ${index + 1}`}
        className="h-28 w-full rounded-lg object-cover"
      />

      <p className="mt-2 text-xs text-slate-500">
        {index === 0 ? "Main photo" : `Photo ${index + 1}`}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        {index > 0 && (
          <button
            type="button"
            disabled={saving || imageUploading}
            onClick={() =>
              setEditingProduct((current) =>
                current
                  ? {
                      ...current,
                      images: [
                        current.images[index],
                        ...current.images.filter((_, i) => i !== index),
                      ],
                    }
                  : current
              )
            }
            className="text-xs text-forest-deep underline disabled:opacity-50"
          >
            Make main
          </button>
        )}

        <button
          type="button"
          disabled={saving || imageUploading}
          onClick={() =>
            setEditingProduct((current) =>
              current
                ? {
                    ...current,
                    images: current.images.filter((_, i) => i !== index),
                  }
                : current
            )
          }
          className="text-xs text-red-600 underline disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </div>
  ))}
</div>


{(editingProduct.variants || []).length > 0 && (
  <div className="space-y-3">
    <p className="font-medium text-forest-deep">Details for Each Pack</p>
    <p className="text-xs text-slate-500">
      Enter only information verified on the actual pack. Unknown fields can stay blank.
    </p>

    {editingProduct.variants.map((pack, index) => (
      <div
        key={pack.id || `${pack.label}-${index}`}
        className="rounded-xl border border-forest/15 bg-white p-3"
      >
       <div className="grid gap-3 sm:grid-cols-2">
  {[
    ["label", "Pack Label", "text"],
    ["weight", "Net Quantity", "text"],
    ["price", "Selling Price ₹", "number"],
    ["mrp", "MRP ₹", "number"],
    ["stock", "Stock", "number"],
  ].map(([field, label, type]) => (
    <label key={field} className="text-sm text-forest-deep">
      {label}
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        step={field === "stock" ? 1 : type === "number" ? "0.01" : undefined}
        value={pack[field] ?? ""}
        onChange={(event) => {
          const raw = event.target.value;
          const value =
            field === "mrp" && raw === ""
              ? null
              : type === "number"
                ? Number(raw)
                : raw;

          setEditingProduct((current) => ({
            ...current,
            variants: (current.variants || []).map((item, i) =>
              i === index ? { ...item, [field]: value } : item
            ),
          }));
        }}
        className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-3 py-2"
      />
    </label>
  ))}

  <div className="mt-4 space-y-2">
  <label className="block text-sm text-forest-deep">
    Photos for {pack.label || "New Pack"}
    <input
      type="file"
      accept="image/jpeg,image/png,image/webp"
      disabled={saving || imageUploading}
      onChange={(event) => uploadPackImage(event, index)}
      className="mt-1 block w-full"
    />
  </label>

  <p className="text-xs text-slate-500">
    If no pack photos are saved, the product’s shared gallery is used.
  </p>

  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
    {(pack.images || []).map((url, photoIndex) => (
      <div
        key={`${url}-${photoIndex}`}
        className="rounded-lg border border-forest/15 bg-white p-2"
      >
        <img
          src={url}
          alt={`${pack.label} photo ${photoIndex + 1}`}
          className="h-20 w-full rounded object-cover"
        />

        {photoIndex > 0 && (
          <button
            type="button"
            disabled={saving || imageUploading}
            onClick={() =>
              setEditingProduct((current) => ({
                ...current,
                variants: current.variants.map((item, i) =>
                  i === index
                    ? {
                        ...item,
                        images: [
                          item.images[photoIndex],
                          ...item.images.filter((_, j) => j !== photoIndex),
                        ],
                      }
                    : item
                ),
              }))
            }
            className="mr-2 text-xs text-forest-deep underline"
          >
            Make main
          </button>
        )}

        <button
          type="button"
          disabled={saving || imageUploading}
          onClick={() =>
            setEditingProduct((current) => ({
              ...current,
              variants: current.variants.map((item, i) =>
                i === index
                  ? {
                      ...item,
                      images: (item.images || []).filter(
                        (_, j) => j !== photoIndex
                      ),
                    }
                  : item
              ),
            }))
          }
          className="text-xs text-red-600 underline"
        >
          Remove
        </button>
      </div>
    ))}
  </div>
</div>
</div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            ["sku", "Pack SKU", "text"],
            ["batch_number", "Batch Number", "text"],
            ["manufactured_on", "Manufacturing Date", "date"],
            ["best_before", "Best-Before Date", "date"],
          ].map(([field, label, type]) => (
            <label key={field} className="text-sm text-forest-deep">
              {label}
              <input
                type={type}
                value={pack[field] || ""}
                onChange={(event) =>
                  setEditingProduct((current) => ({
                    ...current,
                    variants: (current.variants || []).map((item, i) =>
                      i === index
                        ? { ...item, [field]: event.target.value }
                        : item
                    ),
                  }))
                }
                className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-3 py-2"
              />
            </label>
          ))}
        </div>
      </div>
    ))}

    <button
  type="button"
  disabled={saving || imageUploading}
  onClick={() =>
    setEditingProduct((current) => ({
      ...current,
      variants: [
        ...(current.variants || []),
        {
          label: "",
          weight: "",
          price: 0,
          mrp: null,
          stock: 0,
          sku: "",
          batch_number: "",
          manufactured_on: "",
          best_before: "",
        },
      ],
    }))
  }
  className="text-sm text-forest-deep underline disabled:opacity-50"
>
  Add Pack Size
</button>
  </div>
)}


        {[
          ["brand", "Brand"],
          ["sku", "SKU"],
          ["net_quantity", "Net Quantity"],
          ["origin", "Country of Origin"],
        ].map(([key, label]) => (
          <label key={key} className="block text-sm text-forest-deep">
            {label}
            <input
              value={editingProduct[key] || ""}
              onChange={(e) =>
                setEditingProduct((current) => ({
                  ...current,
                  [key]: e.target.value,
                }))
              }
              className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-2.5"
            />
          </label>
        ))}

        <label className="block text-sm text-forest-deep">
  Description
  <textarea
    rows={5}
    value={editingProduct.description || ""}
    onChange={(e) =>
      setEditingProduct((current) => ({
        ...current,
        description: e.target.value,
      }))
    }
    className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-2.5"
  />
</label>

<label className="block text-sm text-forest-deep">
  Ingredients
  <textarea
    rows={2}
    value={editingProduct.ingredients || ""}
    onChange={(event) =>
      setEditingProduct((current) => ({
        ...current,
        ingredients: event.target.value,
      }))
    }
    className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-2.5"
  />
</label>

<div className="space-y-2">
  <p className="text-sm text-forest-deep">Nutrition Information</p>

  {(editingProduct.nutrition || []).map((row, index) => (
    <div key={index} className="flex gap-2">
      <input
        aria-label={`Nutrition label ${index + 1}`}
        placeholder="e.g. Energy"
        value={row.label || ""}
        onChange={(event) =>
          setEditingProduct((current) => ({
            ...current,
            nutrition: (current.nutrition || []).map((item, i) =>
              i === index ? { ...item, label: event.target.value } : item
            ),
          }))
        }
        className="min-w-0 flex-1 rounded-xl border border-forest/15 bg-white px-3 py-2"
      />
      <input
        aria-label={`Nutrition value ${index + 1}`}
        placeholder="e.g. 304 kcal"
        value={row.value || ""}
        onChange={(event) =>
          setEditingProduct((current) => ({
            ...current,
            nutrition: (current.nutrition || []).map((item, i) =>
              i === index ? { ...item, value: event.target.value } : item
            ),
          }))
        }
        className="min-w-0 flex-1 rounded-xl border border-forest/15 bg-white px-3 py-2"
      />
      <button
        type="button"
        aria-label={`Remove nutrition row ${index + 1}`}
        onClick={() =>
          setEditingProduct((current) => ({
            ...current,
            nutrition: (current.nutrition || []).filter((_, i) => i !== index),
          }))
        }
        className="text-xs text-red-600 underline"
      >
        Remove
      </button>
    </div>
  ))}

  <button
    type="button"
    onClick={() =>
      setEditingProduct((current) => ({
        ...current,
        nutrition: [...(current.nutrition || []), { label: "", value: "" }],
      }))
    }
    className="text-sm text-forest-deep underline"
  >
    Add Row
  </button>
</div>

<label className="block text-sm text-forest-deep">
  Storage Instructions
  <textarea
    rows={3}
    value={editingProduct.storage || ""}
    onChange={(e) =>
      setEditingProduct((current) => ({
        ...current,
        storage: e.target.value,
      }))
    }
    className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-2.5"
  />
</label>
      </div>
    )}

    <DialogFooter>
      <button type="button" onClick={() => setEditingProduct(null)}>
        Cancel
      </button>
      <button
        type="button"
        disabled={saving}
        onClick={saveEditedProduct}
        className="rounded-full bg-forest px-6 py-2.5 text-white disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      <Dialog
  open={showCategoryDialog}
  onOpenChange={setShowCategoryDialog}
>
  <DialogContent
    className="bg-cream max-w-lg"
    data-testid="admin-category-dialog"
  >
    <DialogHeader>
      <DialogTitle className="font-serif text-2xl text-forest-deep">
        {editingCategory ? "Edit Category" : "Add Category"}
      </DialogTitle>

      <DialogDescription>
        Create or update a product category.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 py-2">
      <div>
        <label className="text-sm font-medium text-forest-deep">
          Category Name *
        </label>

        <input
          value={categoryForm.name}
          onChange={(e) => {
            const name = e.target.value;
            setCategoryForm((prev) => ({
              ...prev,
              name,
              slug: editingCategory ? prev.slug : slugify(name),
            }));
          }}
          placeholder="e.g. Dry Fruits"
          className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-brand"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-forest-deep">
          Slug
        </label>

        <input
          value={categoryForm.slug}
          onChange={(e) =>
            setCategoryField("slug", e.target.value)
          }
          placeholder="dry-fruits"
          className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-brand"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-forest-deep">
          Description
        </label>

        <textarea
          value={categoryForm.description}
          onChange={(e) =>
            setCategoryField("description", e.target.value)
          }
          rows={3}
          placeholder="Category description"
          className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-brand resize-none"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-forest-deep">
        <input
          type="checkbox"
          checked={categoryForm.is_active}
          onChange={(e) =>
            setCategoryField("is_active", e.target.checked)
          }
        />
        Active category
      </label>
    </div>

    <DialogFooter>
      <button
        onClick={() => setShowCategoryDialog(false)}
        className="rounded-full border border-forest/20 px-5 py-2.5 text-sm font-semibold text-forest-deep hover:bg-forest/5"
      >
        Cancel
      </button>

      <button
        onClick={saveCategory}
        disabled={categorySaving}
        className="rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream hover:bg-forest-deep transition disabled:opacity-60 flex items-center gap-2"
      >
        {categorySaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : editingCategory ? (
          "Update Category"
        ) : (
          "Add Category"
        )}
      </button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}
