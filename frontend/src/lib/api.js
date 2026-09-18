import axios from "axios";

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
export const API = `${BACKEND_URL}/api`;

const api = axios.create({ baseURL: API });
const accessKey = number => `mrs_order_access_${number}`;
api.interceptors.request.use(request => {
  const number = request.url?.startsWith("/orders/") ? decodeURIComponent(request.url.slice(8)) : request.data?.order_number;
  const token = number && sessionStorage.getItem(accessKey(number));
  if(token) request.headers["X-Order-Token"] = token;
  return request;
});
export const adminLogout = token => api.post("/admin/logout", {}, authHeader(token));

export const getProducts = (params = {}) =>
  api.get("/products", { params }).then((r) => r.data);
export const getProduct = (slug) => api.get(`/products/${slug}`).then((r) => r.data);
export const getCategories = () => api.get("/categories").then((r) => r.data);
export const getConfig = () => api.get("/config").then((r) => r.data);
export const getReviews = () => api.get("/reviews").then((r) => r.data);
export const subscribeNewsletter = (email) =>
  api.post("/newsletter", { email }).then((r) => r.data);
export const sendContact = (payload) => api.post("/contact", payload).then((r) => r.data);
export const createOrder = async payload => {
 const fingerprint = JSON.stringify(payload);
 let attempt;
 try { attempt = JSON.parse(sessionStorage.getItem("mrs_order_attempt")); } catch {}
 if(!attempt || attempt.fingerprint !== fingerprint) {
   const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2,"0")).join("");
   attempt = {fingerprint, token, id:crypto.randomUUID()};
   sessionStorage.setItem("mrs_order_attempt", JSON.stringify(attempt));
 }
 const {data} = await api.post("/orders", payload, {headers:{"X-Order-Token":attempt.token,"Idempotency-Key":attempt.id}});
 sessionStorage.setItem(accessKey(data.order_number), attempt.token);
 return data;
};
export const completeOrderAttempt = () => sessionStorage.removeItem("mrs_order_attempt");
export const getOrder = (num) => api.get(`/orders/${num}`).then((r) => r.data);
export const rzpCreateOrder = (payload) =>
  api.post("/payments/razorpay/create-order", payload).then((r) => r.data);
export const rzpVerify = (payload) =>
  api.post("/payments/razorpay/verify", payload).then((r) => r.data);
export const rzpReconcile = (payload) =>
  api.post("/payments/razorpay/reconcile", payload).then((r) => r.data);

// Admin
export const adminLogin = (password) =>
  api.post("/admin/login", { password }).then((r) => r.data);
const authHeader = (token) => ({ headers: { "X-Admin-Token": token } });
export const adminGetProducts = (token) =>
  api.get("/admin/products", authHeader(token)).then((r) => r.data);
export const adminCreateProduct = (token, data) =>
  api.post("/admin/products", data, authHeader(token)).then((r) => r.data);
export const adminUpdateProduct = (token, id, data) =>
  api.patch(`/admin/products/${id}`, data, authHeader(token)).then((r) => r.data);
export const adminDeleteProduct = (token, id) =>
  api.delete(`/admin/products/${id}`, authHeader(token)).then((r) => r.data);
export const adminGetOrders = (token) =>
  api.get("/admin/orders", authHeader(token)).then((r) => r.data);
export const adminReconcileOrder = (token, num) =>
  api.post(`/admin/orders/${num}/reconcile`, {}, authHeader(token)).then((r) => r.data);
export const adminUpdateOrderStatus = (token, num, status) =>
  api.patch(`/admin/orders/${num}/status?status=${status}`, {}, authHeader(token)).then((r) => r.data);
export const adminStats = (token) =>
  api.get("/admin/stats", authHeader(token)).then((r) => r.data);

export const adminGetCategories = (token) =>
  api.get("/admin/categories", authHeader(token)).then((r) => r.data);

export const adminCreateCategory = (token, data) =>
  api.post("/admin/categories", data, authHeader(token)).then((r) => r.data);

export const adminUpdateCategory = (token, id, data) =>
  api.patch(`/admin/categories/${id}`, data, authHeader(token)).then((r) => r.data);

export const adminDeleteCategory = (token, id) =>
  api.delete(`/admin/categories/${id}`, authHeader(token)).then((r) => r.data);

export const adminUploadImage = async (token, file) => {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await api.post(
    "/admin/uploads",
    formData,
    authHeader(token)
  );

  const apiAddress = new URL(API, window.location.origin);

  return {
    ...data,
    url: new URL(data.url, apiAddress).href,
  };
};

export const adminUploadDocument = async (token, file) => {
  const formData = new FormData();
  formData.append("document", file);

  const { data } = await api.post(
    "/admin/document-uploads",
    formData,
    authHeader(token)
  );

  return data;
};

// Load business information for the public website.
export const getBusinessInformation = () =>
  api.get("/business-information").then((response) => response.data);

// Load business information for the admin editing form.
export const adminGetBusinessInformation = (token) =>
  api
    .get("/admin/business-information", authHeader(token))
    .then((response) => response.data);

// Save business information from the admin panel.
export const adminSaveBusinessInformation = (token, details) =>
  api
    .put(
      "/admin/business-information",
      details,
      authHeader(token)
    )
    .then((response) => response.data);


    // Load Quality & Transparency details for the homepage.
export const getQualityInformation = () =>
  api
    .get("/quality-information")
    .then((response) => response.data);

// Load details for the admin editing form.
export const adminGetQualityInformation = (token) =>
  api
    .get("/admin/quality-information", authHeader(token))
    .then((response) => response.data);

// Save details from the admin panel.
export const adminSaveQualityInformation = (token, details) =>
  api
    .put(
      "/admin/quality-information",
      details,
      authHeader(token)
    )
    .then((response) => response.data);


 // Load contact-form enquiries for the logged-in admin.
export const adminGetEnquiries = (token) =>
  api
    .get("/admin/messages", authHeader(token))
    .then((response) => response.data);   
    

    export const getShippingPolicy = () =>
  api.get("/shipping-policy").then((r) => r.data);

export const adminGetShippingPolicy = (token) =>
  api.get("/admin/shipping-policy", authHeader(token))
    .then((r) => r.data);

export const adminSaveShippingPolicy = (token, details) =>
  api.put("/admin/shipping-policy", details, authHeader(token))
    .then((r) => r.data);

    // Load a policy for the public website.
export const getPolicy = (slug) =>
  api
    .get(`/policies/${encodeURIComponent(slug)}`)
    .then((response) => response.data);

// Load a policy for the admin editor.
export const adminGetPolicy = (token, slug) =>
  api
    .get(
      `/admin/policies/${encodeURIComponent(slug)}`,
      authHeader(token)
    )
    .then((response) => response.data);

// Save a policy from the admin editor.
export const adminSavePolicy = (token, slug, details) =>
  api
    .put(
      `/admin/policies/${encodeURIComponent(slug)}`,
      details,
      authHeader(token)
    )
    .then((response) => response.data);

    // Public: send a bee hive service enquiry.
export const submitServiceRequest = (details, photo) => {
  const formData = new FormData();

  Object.entries(details).forEach(([key, value]) => {
    formData.append(key, value ?? "");
  });

  if (photo) formData.append("photo", photo);

  return api
    .post("/service-requests", formData)
    .then((response) => response.data);
};

// Admin: view bee hive service enquiries.
export const adminGetServiceRequests = (token) =>
  api
    .get("/admin/service-requests", authHeader(token))
    .then((response) => response.data);

    export const adminGetServicePhoto = (token, id) =>
  api
    .get(
      `/admin/service-requests/${encodeURIComponent(id)}/photo`,
      {
        ...authHeader(token),
        responseType: "blob",
      }
    )
    .then((response) => response.data);


    // Public: load From the Field gallery.
export const getFieldGallery = () =>
  api.get("/field-gallery").then((response) => response.data);

// Admin: load gallery entries.
export const adminGetFieldGallery = (token) =>
  api
    .get("/admin/field-gallery", authHeader(token))
    .then((response) => response.data);

// Admin: save an uploaded image as a gallery entry.
export const adminAddFieldGallery = (token, details) =>
  api
    .post("/admin/field-gallery", details, authHeader(token))
    .then((response) => response.data);

// Admin: remove a gallery entry.
export const adminDeleteFieldGallery = (token, id) =>
  api
    .delete(
      `/admin/field-gallery/${encodeURIComponent(id)}`,
      authHeader(token)
    )
    .then((response) => response.data);


    // Admin: upload an MP4 for the public gallery.
export const adminUploadVideo = async (token, file) => {
  const formData = new FormData();
  formData.append("video", file);

  const { data } = await api.post(
    "/admin/video-uploads",
    formData,
    authHeader(token)
  );

  return data;
};


// Public: load Innovation page content.
export const getInnovation = () =>
  api
    .get("/innovation")
    .then((response) => response.data);

// Admin: load the editing form.
export const adminGetInnovation = (token) =>
  api
    .get("/admin/innovation", authHeader(token))
    .then((response) => response.data);

// Admin: save Innovation content.
export const adminSaveInnovation = (token, details) =>
  api
    .put("/admin/innovation", details, authHeader(token))
    .then((response) => response.data);


    // Public: load published articles.
export const getKnowledgeArticles = () =>
  api
    .get("/knowledge-articles")
    .then((response) => response.data);

// Public: load an individual published article.
export const getKnowledgeArticle = (id) =>
  api
    .get(`/knowledge-articles/${encodeURIComponent(id)}`)
    .then((response) => response.data);

// Admin: load drafts and published articles.
export const adminGetKnowledgeArticles = (token) =>
  api
    .get("/admin/knowledge-articles", authHeader(token))
    .then((response) => response.data);

// Admin: create an article.
export const adminCreateKnowledgeArticle = (token, details) =>
  api
    .post(
      "/admin/knowledge-articles",
      details,
      authHeader(token)
    )
    .then((response) => response.data);

// Admin: update an article.
export const adminUpdateKnowledgeArticle = (token, id, details) =>
  api
    .put(
      `/admin/knowledge-articles/${encodeURIComponent(id)}`,
      details,
      authHeader(token)
    )
    .then((response) => response.data);

// Admin: delete an article.
export const adminDeleteKnowledgeArticle = (token, id) =>
  api
    .delete(
      `/admin/knowledge-articles/${encodeURIComponent(id)}`,
      authHeader(token)
    )
    .then((response) => response.data);


export default api;
