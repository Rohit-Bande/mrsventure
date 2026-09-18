import express from "express";
import multer from "multer";
import { existsSync, mkdirSync } from "node:fs";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, join } from "node:path";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { randomUUID, randomBytes, createHmac } from "node:crypto";
import { z } from "zod";
import {
  createSession, authenticated, verifyPassword, equal, digest,
} from "./auth.js";
import {
  product, category, orderInput, paymentInput, contactInput, loginInput,
} from "./schemas.js";


function fail(status,message) {const e=new Error(message);e.status=status;throw e;}
const iso=()=>new Date().toISOString();
const paise=n=>Math.round(n*100);
function publicCategory(c) {return {...c,label:c.name,desc:c.description,active:c.is_active};}
function sanitizedOrder(o) {const {access_hash,request_key,inventory_reserved,payment_conflict_id,...safe}=o;return safe;}
export function createApp({store,config={},gateway: suppliedGateway}={}) {
 const app=express();
app.set("trust proxy", "loopback");
app.disable("x-powered-by");
app.use(helmet({contentSecurityPolicy:{directives:{
 "script-src":["'self'",'https://checkout.razorpay.com','https://cdn.razorpay.com'],
 "style-src":["'self'","'unsafe-inline'",'https://fonts.googleapis.com'],
 "font-src":["'self'",'https://fonts.gstatic.com','data:'],
 "img-src":["'self'",'https:','data:','blob:'],
 "media-src": ["'self'"],
 "connect-src":["'self'",'https://api.postalpincode.in','https://*.razorpay.com'],
 "frame-src": [
  "https://*.razorpay.com",
  "https://www.youtube-nocookie.com",
  "https://www.youtube.com"
],
 "upgrade-insecure-requests":null
 }}}));
 // Razorpay signs the exact request bytes. Register this before express.json.
 app.post('/api/payments/razorpay/webhook',express.raw({type:'application/json',limit:'256kb'}),(req,res)=>{
  if(!config.razorpayWebhookSecret)fail(503,'Payment webhook is not configured');
  const signature=req.get('X-Razorpay-Signature');
  if(!Buffer.isBuffer(req.body)||typeof signature!=='string'||!/^[a-f0-9]{64}$/i.test(signature))fail(401,'Invalid webhook signature');
  const expected=createHmac('sha256',config.razorpayWebhookSecret).update(req.body).digest('hex');
  if(!equal(expected,signature.toLowerCase()))fail(401,'Invalid webhook signature');
  let event;
  try {event=JSON.parse(req.body.toString('utf8'));} catch {fail(400,'Invalid webhook JSON');}
  if(event.event!=='payment.captured')return res.json({received:true});
  const payment=event.payload?.payment?.entity;
  const result=recordCapturedPayment(payment);
  if(result.conflict)fail(409,'Second captured payment requires manual review');
  res.json({received:true,already_processed:result.alreadyProcessed});
 });
 app.use(express.json({limit:'256kb'}));
 const origins=(config.origins||'http://localhost:3000').split(',').map(s=>s.trim());
 app.use(cors({origin:(origin,cb)=>cb(null,!origin||origins.includes(origin)),allowedHeaders:['Content-Type','X-Admin-Token','X-Order-Token','Idempotency-Key']}));
 const limit=(max,windowMs=60000)=>rateLimit({windowMs,limit:max,standardHeaders:'draft-8',legacyHeaders:false,message:{detail:'Too many requests; try again later'}});
 app.use('/api',limit(240));
 const gateway=suppliedGateway||async function(method,path,body) {
  if(!config.razorpayKey||!config.razorpaySecret)fail(503,'Online payments are not configured. Use cash on delivery.');
  const response=await fetch(`https://api.razorpay.com/v1/${path}`,{method,signal:AbortSignal.timeout(15000),headers:{Authorization:`Basic ${Buffer.from(`${config.razorpayKey}:${config.razorpaySecret}`).toString('base64')}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  if(!response.ok)fail(502,'Payment gateway request failed. Please retry.');return response.json();
 };
 function admin(req,res,next) {if(!authenticated(store,req.get('X-Admin-Token')))return res.status(401).json({detail:'Unauthorized'});next();}
 function findOrder(number) {const o=store.all('orders').find(x=>x.order_number===number);if(!o)fail(404,'Order not found');return o;}
 function authorizeOrder(req,number) {const o=findOrder(number);const token=req.get('X-Order-Token');if(!token||!equal(digest(token),o.access_hash||''))fail(403,'Order access token required');return o;}
 function site() {return store.all('config').find(c=>c.key==='site')||{announcement:'Pure Ingredients • Thoughtfully Crafted • Delivered to Your Door',whatsapp:'09109102611',free_shipping_threshold:0,shipping_charge:0,instagram:'https://www.instagram.com/venturesmrs/'};}
 function paymentConfigured() {
  return Boolean(config.razorpayKey&&config.razorpaySecret&&(!config.razorpayKey.startsWith('rzp_live_')||config.razorpayWebhookSecret));
 }
 function recordCapturedPayment(payment) {
  if(!payment||typeof payment.id!=='string'||!payment.id.startsWith('pay_')||typeof payment.order_id!=='string'||!payment.order_id.startsWith('order_')||payment.status!=='captured'||payment.currency!=='INR'||!Number.isInteger(payment.amount)||payment.amount<=0)fail(400,'Invalid captured payment');
  return store.transaction(()=>{
   const o=store.all('orders').find(order=>order.razorpay_order_id===payment.order_id);
   if(!o)fail(503,'Gateway order not yet linked; retry webhook');
   if(o.payment_method!=='razorpay'||payment.amount!==paise(o.total))fail(409,'Captured payment does not match purchase');
   if(o.payment_status==='paid') {
    if(o.razorpay_payment_id===payment.id)return {alreadyProcessed:true,requiresReview:Boolean(o.needs_payment_review)};
    store.put('orders',o.id,{...o,needs_payment_review:true,payment_conflict_id:payment.id});
    return {alreadyProcessed:false,conflict:true};
   }
   const cancelled=o.status==='cancelled';
   store.put('orders',o.id,{...o,payment_status:'paid',status:cancelled?'cancelled':o.status==='pending_payment'?'confirmed':o.status,razorpay_payment_id:payment.id,paid_at:iso(),needs_payment_review:cancelled});
   return {alreadyProcessed:false,requiresReview:cancelled};
  });
 }
 async function fetchGatewayPayments(order) {
  if(!order.razorpay_order_id)return [];
  const response=await gateway('GET',`orders/${encodeURIComponent(order.razorpay_order_id)}/payments`);
  if(!Array.isArray(response.items))fail(502,'Could not reconcile gateway payments');
  return response.items;
 }
 async function reconcileOrder(order) {
  const payments=await fetchGatewayPayments(order);
  for(const payment of payments.filter(item=>item.status==='captured')) {
   const result=recordCapturedPayment(payment);
   if(result.conflict)fail(409,'Multiple captured payments require manual review');
  }
  return {order:store.get('orders',order.id),authorized:payments.some(item=>item.status==='authorized')};
 }

 const paymentExpiryMs =
  Number.isFinite(config.paymentExpiryMs) &&
  config.paymentExpiryMs >= 5 * 60 * 1000
    ? config.paymentExpiryMs
    : 30 * 60 * 1000;

async function expirePendingOrders(now = Date.now()) {
  const candidates = store.all("orders").filter((order) => {
    const createdAt = Date.parse(order.created_at);

    return (
      order.payment_method === "razorpay" &&
      order.status === "pending_payment" &&
      order.payment_status !== "paid" &&
      order.inventory_reserved === true &&
      Number.isFinite(createdAt) &&
      now - createdAt >= paymentExpiryMs
    );
  });

  let expired = 0;

  for (const candidate of candidates) {
    // If a Razorpay order exists, reconcile it before releasing stock.
    if (candidate.razorpay_order_id) {
      try {
        const result = await reconcileOrder(candidate);

        if (
          result.order.payment_status === "paid" ||
          result.authorized
        ) {
          continue;
        }
      } catch (error) {
        // A gateway failure must never cause automatic cancellation.
        console.error(
          `Could not reconcile pending order ${candidate.order_number}:`,
          error.message
        );
        continue;
      }
    }

    const wasExpired = store.transaction(() => {
      const current = store.get("orders", candidate.id);

      if (
        !current ||
        current.payment_method !== "razorpay" ||
        current.status !== "pending_payment" ||
        current.payment_status === "paid" ||
        current.inventory_reserved !== true
      ) {
        return false;
      }

      const createdAt = Date.parse(current.created_at);

      if (
        !Number.isFinite(createdAt) ||
        now - createdAt < paymentExpiryMs
      ) {
        return false;
      }

      reserve(current.items, 1);

      current.inventory_reserved = false;
      current.status = "cancelled";
      current.payment_status = "expired";
      current.expired_at = new Date(now).toISOString();

      store.put("orders", current.id, current);
      return true;
    });

    if (wasExpired) expired += 1;
  }

  return expired;
}

app.locals.expirePendingOrders = expirePendingOrders;

 function reserve(items,direction) {
  for(const item of items) {
   const p=store.get('products',item.product_id);if(!p)fail(409,'Product is no longer available');
   const v=item.variant_label?p.variants.find(v=>v.label===item.variant_label):null;
   if(item.variant_label&&!v)fail(409,'Product variant is no longer available');
   const target=v||p;if(direction===-1 && target.stock<item.quantity)fail(409,`${p.name}: insufficient stock`);
   target.stock+=direction*item.quantity;
   if(v)p.stock=p.variants.reduce((s,v)=>s+v.stock,0);
   store.put('products',p.id,p);
  }
 }
 app.get('/api',(_,res)=>res.json({message:'MRS Ventures API',brand:'MADHULOGY™'}));
 app.get('/api/health',(_,res)=>{store.db.prepare('SELECT 1').get();res.json({status:'ok'});});
 app.get('/api/config',(_,res)=>res.json({...site(),online_payments_enabled:paymentConfigured()}));
 app.get('/api/categories',(_,res)=>res.json(store.all('categories').filter(c=>c.is_active).map(publicCategory)));
 app.get('/api/reviews',(_,res)=>res.json(store.all('reviews')));
 app.get('/api/products',(req,res)=>{
  const q=z.object({category:z.string().optional(),search:z.string().max(200).optional(),sort:z.enum(['featured','price-asc','price-desc','rating','newest']).default('featured'),min_price:z.coerce.number().nonnegative().optional(),max_price:z.coerce.number().nonnegative().optional(),featured:z.enum(['true','false']).optional(),bestseller:z.enum(['true','false']).optional(),new:z.enum(['true','false']).optional()}).parse(req.query);
  let rows=store.all('products');if(q.category&&q.category!=='all')rows=rows.filter(p=>p.category===q.category);
  if(q.search){const s=q.search.toLowerCase();rows=rows.filter(p=>[p.name,p.short_desc,p.category_label,...p.tags].some(v=>v?.toLowerCase().includes(s)));}
  for(const [query,field] of [['featured','is_featured'],['bestseller','is_bestseller'],['new','is_new']])if(q[query]!==undefined)rows=rows.filter(p=>p[field]===(q[query]==='true'));
  if(q.min_price!==undefined)rows=rows.filter(p=>p.price>=q.min_price);if(q.max_price!==undefined)rows=rows.filter(p=>p.price<=q.max_price);
  const sort={'price-asc':(a,b)=>a.price-b.price,'price-desc':(a,b)=>b.price-a.price,rating:(a,b)=>b.rating-a.rating,newest:(a,b)=>b.created_at.localeCompare(a.created_at),featured:(a,b)=>Number(b.is_featured)-Number(a.is_featured)||a.name.localeCompare(b.name)};
  res.json(rows.sort(sort[q.sort]));
 });
 app.get('/api/products/:slug',(req,res)=>{const p=store.all('products').find(p=>p.slug===req.params.slug);if(!p)fail(404,'Product not found');res.json(p);});
 app.post('/api/newsletter',limit(5),(req,res)=>{const {email}=z.object({email:z.email()}).parse(req.body);store.put('newsletter',email.toLowerCase(),{email:email.toLowerCase(),created_at:iso()});res.json({success:true,message:'Subscribed successfully'});});
 app.post('/api/contact',limit(5),(req,res)=>{const data=contactInput.parse(req.body),id=randomUUID();store.insert('messages',id,{...data,id,created_at:iso()});res.status(201).json({success:true,message:'Message received. We will get back to you soon.'});});
 app.post('/api/orders',limit(10),(req,res)=>{
  const input=orderInput.parse(req.body);
  if(input.coupon)fail(400,'Coupons are not enabled');
  if(input.payment_method==='razorpay'&&!paymentConfigured())fail(503,'Online payments are not fully configured. Use cash on delivery.');
  const token=req.get('X-Order-Token');if(!token||!/^[a-f0-9]{64}$/.test(token))fail(400,'Create a secure order access token first');
  const key=req.get('Idempotency-Key');if(!key||!/^[a-f0-9-]{36}$/.test(key))fail(400,'Idempotency-Key must be a UUID');
  const previous=store.all('orders').find(o=>o.request_key===key);
  if(previous){if(previous.status==='cancelled')fail(409,'Previous order was cancelled. Start a new checkout attempt.');if(!equal(previous.access_hash,digest(token)))fail(409,'Request key already used');return res.json(sanitizedOrder(previous));}
  const order=store.transaction(()=>{
   const items=input.items.map(i=>{
    const p=store.get('products',i.product_id);if(!p)fail(400,'Unknown product');
    const c=store.all('categories').find(c=>c.slug===p.category);if(c&&!c.is_active)fail(409,'Product category is unavailable');
    const v=i.variant_label?p.variants.find(v=>v.label===i.variant_label):null;
    if(i.variant_label&&!v)fail(400,'Unknown product variant');if(p.variants.length&&!v)fail(400,'Select a product variant');
    return {product_id:p.id,slug:p.slug,name:p.name,variant_label:v?.label||null,image:p.images[0]||'',price:v?.price??p.price,quantity:i.quantity};
   });
   const subtotalPaise=items.reduce((s,i)=>s+paise(i.price)*i.quantity,0),cfg=site();
   const shippingPaise=subtotalPaise>=paise(cfg.free_shipping_threshold??799)?0:paise(cfg.shipping_charge??49);
   reserve(items,-1);
   const o={id:randomUUID(),order_number:`MRS${randomBytes(12).toString('hex').toUpperCase()}`,items,customer:input.customer,payment_method:input.payment_method,subtotal:subtotalPaise/100,shipping:shippingPaise/100,discount:0,total:(subtotalPaise+shippingPaise)/100,coupon:null,payment_status:input.payment_method==='cod'?'cod_pending':'pending',status:input.payment_method==='cod'?'confirmed':'pending_payment',created_at:iso(),access_hash:digest(token),request_key:key,inventory_reserved:true};
   store.insert('orders',o.id,o);return o;
  });res.status(201).json(sanitizedOrder(order));
 });
 app.get('/api/orders/:number',limit(30),(req,res)=>res.json(sanitizedOrder(authorizeOrder(req,req.params.number))));
 const creating=new Map();
 app.post('/api/payments/razorpay/create-order',limit(10),async(req,res)=>{
  if(!paymentConfigured())fail(503,'Online payments are not fully configured');
  const {order_number}=z.object({order_number:z.string().min(1)}).parse(req.body);let o=authorizeOrder(req,order_number);
  if(o.payment_method!=='razorpay'||o.status!=='pending_payment')fail(409,'Order cannot accept payment');
  if(!creating.has(o.id)) {
   const job=(async()=>{
    if(o.razorpay_order_id)return;
    const remote=await gateway('POST','orders',{amount:paise(o.total),currency:'INR',receipt:o.order_number});
    store.transaction(()=>{const current=store.get('orders',o.id);if(current.status!=='pending_payment')fail(409,'Order is no longer payable');store.put('orders',o.id,{...current,razorpay_order_id:remote.id});});
   })();creating.set(o.id,job);job.finally(()=>creating.delete(o.id)).catch(()=>{});
  }
  await creating.get(o.id);o=store.get('orders',o.id);
  res.json({mock:false,key_id:config.razorpayKey,order_id:o.razorpay_order_id,amount:paise(o.total),currency:'INR'});
 });
 app.post('/api/payments/razorpay/verify',limit(20),async(req,res)=>{
  const data=paymentInput.parse(req.body);let o=authorizeOrder(req,data.order_number);
  if(!config.razorpaySecret)fail(503,'Payments are not configured');
  if(!o.razorpay_order_id||data.razorpay_order_id!==o.razorpay_order_id||data.razorpay_order_id.startsWith('order_mock_'))fail(400,'Gateway order does not match this purchase');
  const expected=createHmac('sha256',config.razorpaySecret).update(`${o.razorpay_order_id}|${data.razorpay_payment_id}`).digest('hex');
  if(!equal(expected,data.razorpay_signature))fail(400,'Payment verification failed');
  const remote=await gateway('GET',`payments/${encodeURIComponent(data.razorpay_payment_id)}`);
  if(remote.id!==data.razorpay_payment_id||remote.order_id!==o.razorpay_order_id||remote.amount!==paise(o.total)||remote.currency!=='INR'||remote.status!=='captured')fail(409,'Payment has not been captured for the correct amount');
  const result=recordCapturedPayment(remote);
  if(result.conflict)fail(409,'Second captured payment requires manual review');
  if(result.requiresReview)fail(409,'Payment captured for a cancelled order. Contact support; do not pay again.');
  res.json({success:true,payment_status:'paid'});
 });
 app.post('/api/payments/razorpay/reconcile',limit(8),async(req,res)=>{
  const {order_number}=z.object({order_number:z.string().min(1)}).parse(req.body);
  const o=authorizeOrder(req,order_number);
  if(o.payment_method!=='razorpay'||!o.razorpay_order_id)fail(409,'Order is not ready for reconciliation');
  const result=await reconcileOrder(o);
  res.json({payment_status:result.order.payment_status,status:result.order.status,needs_payment_review:Boolean(result.order.needs_payment_review)});
 });
 app.post('/api/admin/login',limit(5,15*60000),(req,res)=>{const {password}=loginInput.parse(req.body);if(!config.adminHash||!verifyPassword(password,config.adminHash))fail(401,'Invalid password');res.json({success:true,...createSession(store)});});
 app.post('/api/admin/logout',admin,(req,res)=>{store.remove('sessions',digest(req.get('X-Admin-Token')));res.json({success:true});});
 app.use('/api/admin',admin);



 // Knowledge Centre articles
const knowledgeArticleSchema = z.object({
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().min(1).max(1000),
  body: z.string().trim().min(1).max(50000),
  published: z.boolean(),
});

function readKnowledgeArticles() {
  return store.get("config", "knowledge_articles")?.items || [];
}

// Public: only published articles are visible.
app.get("/api/knowledge-articles", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(
    readKnowledgeArticles().filter((article) => article.published)
  );
});

app.get("/api/knowledge-articles/:id", (req, res) => {
  const article = readKnowledgeArticles().find(
    (item) => item.id === req.params.id && item.published
  );

  if (!article) fail(404, "Article not found");

  res.set("Cache-Control", "no-store");
  res.json(article);
});

// Admin: view drafts and published articles.
app.get("/api/admin/knowledge-articles", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(readKnowledgeArticles());
});

// Admin: create an article.
app.post("/api/admin/knowledge-articles", (req, res) => {
  const details = knowledgeArticleSchema.parse(req.body);

  const article = {
    ...details,
    id: randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.transaction(() => {
    store.put("config", "knowledge_articles", {
      key: "knowledge_articles",
      items: [article, ...readKnowledgeArticles()],
    });
  });

  res.status(201).json(article);
});

// Admin: edit or publish an article.
app.put("/api/admin/knowledge-articles/:id", (req, res) => {
  const details = knowledgeArticleSchema.parse(req.body);
  let saved;

  store.transaction(() => {
    const items = readKnowledgeArticles();
    const existing = items.find((item) => item.id === req.params.id);

    if (!existing) fail(404, "Article not found");

    saved = {
      ...existing,
      ...details,
      updated_at: new Date().toISOString(),
    };

    store.put("config", "knowledge_articles", {
      key: "knowledge_articles",
      items: items.map((item) => item.id === saved.id ? saved : item),
    });
  });

  res.json(saved);
});

// Admin: delete an article.
app.delete("/api/admin/knowledge-articles/:id", (req, res) => {
  store.transaction(() => {
    const items = readKnowledgeArticles();

    if (!items.some((item) => item.id === req.params.id)) {
      fail(404, "Article not found");
    }

    store.put("config", "knowledge_articles", {
      key: "knowledge_articles",
      items: items.filter((item) => item.id !== req.params.id),
    });
  });

  res.json({ success: true });
});


 // Editable Innovation page
const innovationSchema = z.object({
  heading: z.string().trim().min(1).max(200),
  introduction: z.string().trim().min(1).max(10000),
  project_title: z.string().trim().min(1).max(200),
  project_description: z.string().trim().min(1).max(10000),
  project_status: z.enum([
    "IDEA",
    "UNDER DEVELOPMENT",
    "PROTOTYPE",
    "TESTING",
    "READY TO LAUNCH",
    "LAUNCHED",
  ]),
});

const defaultInnovation = {
  heading: "Turning Everyday Problems into Practical Solutions",
  introduction:
    "At MRS Ventures, innovation means finding simple, practical solutions to everyday problems.\n\nWe are exploring and developing innovative products, prototypes and practical ideas that can make everyday tasks easier, safer and more efficient.\n\nOur approach is hands-on — identify a real-world problem, understand it closely, build a practical solution, test it and improve it.",
  project_title: "Pressure Cooker Whistle Counter",
  project_description:
    "We are currently working on a practical Pressure Cooker Whistle Counter — a simple solution designed to help count and monitor cooker whistles more conveniently. This is one example of our ongoing approach to developing useful, practical innovations for everyday problems.",
  project_status: "UNDER DEVELOPMENT",
};

function readInnovation() {
  return {
    ...defaultInnovation,
    ...store.get("config", "innovation"),
  };
}

app.get("/api/innovation", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(readInnovation());
});

app.get("/api/admin/innovation", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(readInnovation());
});

app.put("/api/admin/innovation", (req, res) => {
  const details = innovationSchema.parse(req.body);

  const saved = {
    ...details,
    key: "innovation",
    updated_at: new Date().toISOString(),
  };

  store.put("config", "innovation", saved);
  res.json(saved);
});



 // From the Field gallery
const fieldGalleryItemSchema = z.object({
  title: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100),
  type: z.enum(["image", "video"]).default("image"),
  src: z.string().trim().max(500),
}).superRefine((data, context) => {
  const pattern =
    data.type === "video"
      ? /^\/uploads\/[a-f0-9-]+\.mp4$/
      : /^\/uploads\/[a-f0-9-]+\.(jpg|png|webp)$/;

  if (!pattern.test(data.src)) {
    context.addIssue({
      code: "custom",
      path: ["src"],
      message: "Select an uploaded file matching the media type.",
    });
  }
});

function readFieldGallery() {
  return store.get("config", "field_gallery")?.items || [];
}

// Public: display gallery images.
app.get("/api/field-gallery", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(readFieldGallery());
});

// Admin: load gallery entries.
app.get("/api/admin/field-gallery", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(readFieldGallery());
});

// Admin: add an uploaded image to the gallery.
app.post("/api/admin/field-gallery", (req, res) => {
  const details = fieldGalleryItemSchema.parse(req.body);

 const item = {
  ...details,
  id: randomUUID(),
  created_at: new Date().toISOString(),
};

  store.transaction(() => {
    const items = readFieldGallery();

    store.put("config", "field_gallery", {
      key: "field_gallery",
      items: [item, ...items],
    });
  });

  res.status(201).json(item);
});

// Admin: remove an entry from the public gallery.
app.delete("/api/admin/field-gallery/:id", (req, res) => {
  store.transaction(() => {
    const items = readFieldGallery();

    if (!items.some((item) => item.id === req.params.id)) {
      fail(404, "Gallery entry not found");
    }

    store.put("config", "field_gallery", {
      key: "field_gallery",
      items: items.filter((item) => item.id !== req.params.id),
    });
  });

  res.json({ success: true });
});


 // Bee hive removal and relocation enquiries
const serviceRequestSchema = z.object({
  name: z.string().trim().min(2).max(120),
  mobile: z.string().trim().regex(
    /^[6-9]\d{9}$/,
    "Enter a valid 10-digit Indian mobile number"
  ),
  location: z.string().trim().min(3).max(1000),
  property_type: z.enum([
    "Home / Apartment",
    "Housing Society",
    "Bungalow / Farmhouse",
    "Commercial Property",
    "Tree / Outdoor Location",
    "Other",
  ]),
  approximate_hive_height: z.string().trim().min(1).max(200),
  description: z.string().trim().min(10).max(5000),
  preferred_date: z.string().trim().max(100),
  preferred_time: z.string().trim().max(100),
});

// Public: submit an enquiry.
// A preferred time is a request, not a confirmed booking.
const servicePhotosDir = fileURLToPath(
  new URL("../private-service-photos/", import.meta.url)
);

const servicePhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 8,
    fieldSize: 20000,
    parts: 10,
  },
}).single("photo");

function receiveServicePhoto(req, res, next) {
  servicePhotoUpload(req, res, (error) => {
    if (!error) return next();

    res.status(400).json({
      detail:
        error.code === "LIMIT_FILE_SIZE"
          ? "Photo must be smaller than 5 MB."
          : "Invalid upload. Submit one photo and the form details.",
    });
  });
}

function servicePhotoType(buffer) {
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
    )
  ) {
    return { extension: "png", mime: "image/png" };
  }

  if (
    buffer.length >= 3 &&
    buffer[0] === 255 &&
    buffer[1] === 216 &&
    buffer[2] === 255
  ) {
    return { extension: "jpg", mime: "image/jpeg" };
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { extension: "webp", mime: "image/webp" };
  }

  return null;
}

app.post(
  "/api/service-requests",
  limit(5),
  receiveServicePhoto,
  async (req, res) => {
    const details = serviceRequestSchema.parse(req.body);
    const id = randomUUID();
    let photo = null;
    let photoPath = null;

    if (req.file) {
      const type = servicePhotoType(req.file.buffer);

      if (!type) {
        return res.status(400).json({
          detail: "Use a JPEG, PNG, or WebP photo.",
        });
      }

      await mkdir(servicePhotosDir, { recursive: true });

      const filename = `${id}.${type.extension}`;
      photoPath = join(servicePhotosDir, filename);

      await writeFile(photoPath, req.file.buffer, {
        flag: "wx",
        mode: 0o600,
      });

      photo = { filename, mime: type.mime };
    }

    try {
      store.insert("messages", id, {
        ...details,
        id,
        service: "Bee Hive Removal & Relocation",
        status: "new",
        photo,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      if (photoPath) {
        await unlink(photoPath).catch(() => {});
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      id,
      message:
        "Your request has been received. Our team will contact you to confirm availability and arrangements.",
    });
  }
);

// Place after the existing app.use("/api/admin", admin).
app.get("/api/admin/service-requests/:id/photo", (req, res) => {
  const request = store.get("messages", req.params.id);

  if (
    !request ||
    request.service !== "Bee Hive Removal & Relocation" ||
    !request.photo
  ) {
    return res.status(404).json({ detail: "Photo not found." });
  }

  res.set("Cache-Control", "no-store");
  res.type(request.photo.mime);

  res.sendFile(
    request.photo.filename,
    { root: servicePhotosDir, dotfiles: "deny" },
    (error) => {
      if (!error) return;

      if (res.headersSent) {
        return res.end();
      }

      res.status(error.statusCode || 500).json({
        detail: "Unable to load photo.",
      });
    }
  );
});

// Admin: view service requests.
app.get("/api/admin/service-requests", (req, res) => {
  const requests = store
    .all("messages")
    .filter(
      (message) =>
        message.service === "Bee Hive Removal & Relocation"
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  res.set("Cache-Control", "no-store");
  res.json(requests);
});

 // Editable customer-care policies
const editablePolicySlugs = new Set([
  "returns-policy",
  "privacy-policy",
  "terms",
]);

const editablePolicySchema = z.object({
  title: z.string().trim().min(1).max(200),
  intro: z.string().trim().max(2000),
  sections: z.array(
    z.object({
      h: z.string().trim().min(1).max(200),
      p: z.string().trim().min(1).max(10000),
    })
  ).min(1).max(30),
});

function checkPolicySlug(slug) {
  if (!editablePolicySlugs.has(slug)) {
    fail(404, "Policy not found");
  }
}

// Public website: load saved policy.
// null means the frontend should use its existing content.
app.get("/api/policies/:slug", (req, res) => {
  checkPolicySlug(req.params.slug);

  res.set("Cache-Control", "no-store");
  res.json(
    store.get("config", `policy:${req.params.slug}`) || null
  );
});

// Admin: load saved policy.
app.get("/api/admin/policies/:slug", (req, res) => {
  checkPolicySlug(req.params.slug);

  res.set("Cache-Control", "no-store");
  res.json(
    store.get("config", `policy:${req.params.slug}`) || null
  );
});

// Admin: save policy.
app.put("/api/admin/policies/:slug", (req, res) => {
  checkPolicySlug(req.params.slug);

  const details = editablePolicySchema.parse(req.body);
  const key = `policy:${req.params.slug}`;

  const saved = {
    ...details,
    key,
    updated_at: new Date().toISOString(),
  };

  store.put("config", key, saved);
  res.json(saved);
});


 // Editable Shipping Policy
const shippingPolicySchema = z.object({
  introduction: z.string().trim().max(2000),
  order_processing: z.string().trim().max(10000),
  delivery_timelines: z.string().trim().max(10000),
  shipping_charges: z.string().trim().max(10000),
  order_tracking: z.string().trim().max(10000),
});

const defaultShippingPolicy = {
  introduction: "How we process, pack and deliver your MRS Ventures order.",
  order_processing: "",
  delivery_timelines: "",
  shipping_charges: "",
  order_tracking: "",
};

function readShippingPolicy() {
  return {
    ...defaultShippingPolicy,
    ...store.get("config", "shipping_policy"),
  };
}

app.get("/api/shipping-policy", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(readShippingPolicy());
});

app.get("/api/admin/shipping-policy", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(readShippingPolicy());
});

app.put("/api/admin/shipping-policy", (req, res) => {
  const details = shippingPolicySchema.parse(req.body);
  const saved = {
    ...details,
    key: "shipping_policy",
    updated_at: new Date().toISOString(),
  };

  store.put("config", "shipping_policy", saved);
  res.json(saved);
});


 // QUALITY & TRANSPARENCY
const qualityInformationSchema = z.object({
  ingredients: z.string().trim().max(1000),
  net_quantity: z.string().trim().max(200),
  storage: z.string().trim().max(1000),
  best_before: z.string().trim().max(300),
  lab_report_text: z.string().trim().max(500),

  lab_report_url: z.string().trim().max(2000).refine(
    (value) => {
      if (!value) return true;
      if (value.startsWith("/uploads/")) return true;

      try {
        return ["http:", "https:"].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    },
    "Enter a valid HTTP or HTTPS link"
  ),

  image_url: z.string().trim().max(2000).refine(
    (value) => {
      if (!value) return true;
      if (value.startsWith("/uploads/")) return true;

      try {
        return ["http:", "https:"].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    },
    "Enter a valid HTTP or HTTPS image URL"
  ),
});

function getQualityInformation() {
  const saved = store.get("config", "quality_information");

  // Reuse the FSSAI number saved in Business Information.
  const business = store.get("config", "business_information");

  return {
    ingredients: saved?.ingredients ?? "100% Pure Raw Honey",
    net_quantity: saved?.net_quantity ?? "As stated on pack",
    storage: saved?.storage ?? "Cool, dry place",
    best_before: saved?.best_before ?? "",
    lab_report_text: saved?.lab_report_text ?? "",
    lab_report_url: saved?.lab_report_url ?? "",
    image_url: saved?.image_url ?? "",
    fssai_license: business?.fssai_license ?? "",
  };
}

// Public homepage reads these details.
app.get("/api/quality-information", (req, res) => {
  res.json(getQualityInformation());
});

// Admin loads the editing form.
app.get("/api/admin/quality-information", (req, res) => {
  res.json(getQualityInformation());
});

// Admin saves the section.
app.put("/api/admin/quality-information", (req, res) => {
  const details = qualityInformationSchema.parse(req.body);

  store.put("config", "quality_information", {
    key: "quality_information",
    ...details,
    updated_at: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: "Quality information saved",
    data: getQualityInformation(),
  });
});
 

 // BUSINESS INFORMATION
const businessInformationSchema = z.object({
  company_legal_name: z.string().trim().max(200),
  registered_address: z.string().trim().max(1000),
  gstin: z.string().trim().max(15),
  fssai_license: z.string().trim().max(14),
});

function getBusinessInformation() {
  const saved = store.get("config", "business_information");

  return {
    company_legal_name: saved?.company_legal_name || "",
    registered_address: saved?.registered_address || "",
    gstin: saved?.gstin || "",
    fssai_license: saved?.fssai_license || "",
  };
}

// Public website reads these details.
app.get("/api/business-information", (req, res) => {
  res.json(getBusinessInformation());
});

// Logged-in admin loads the editing form.
app.get("/api/admin/business-information", (req, res) => {
  res.json(getBusinessInformation());
});

// Logged-in admin saves the details.
app.put("/api/admin/business-information", (req, res) => {
  const details = businessInformationSchema.parse(req.body);

  store.put("config", "business_information", {
    key: "business_information",
    ...details,
    updated_at: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: "Business information saved",
    data: details,
  });
});

 const uploadsDir = fileURLToPath(
  new URL("../uploads/", import.meta.url)
);

mkdirSync(uploadsDir, { recursive: true });

// Admin gallery video uploads
const receiveVideo = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 1,
    fields: 0,
    parts: 2,
  },
}).single("video");

app.post(
  "/api/admin/video-uploads",
  limit(5),
  (req, res, next) => {
    receiveVideo(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          detail:
            error.code === "LIMIT_FILE_SIZE"
              ? "Video must be smaller than 25 MB."
              : "Please upload one MP4 video only.",
        });
      }

      next();
    });
  },
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        detail: "Please select an MP4 video.",
      });
    }

    const buffer = req.file.buffer;

    // Basic MP4 container check.
    // This does not validate the full video or its codecs.
    const boxSize = buffer.length >= 4
      ? buffer.readUInt32BE(0)
      : 0;

    const brands = [];

    if (
      buffer.length >= 16 &&
      buffer.toString("ascii", 4, 8) === "ftyp" &&
      boxSize >= 16 &&
      boxSize <= buffer.length &&
      boxSize <= 4096 &&
      boxSize % 4 === 0
    ) {
      brands.push(buffer.toString("ascii", 8, 12));

      for (let offset = 16; offset + 4 <= boxSize; offset += 4) {
        brands.push(buffer.toString("ascii", offset, offset + 4));
      }
    }

    const supportedBrands = [
      "isom", "iso2", "iso3", "iso4",
      "iso5", "iso6", "mp41", "mp42", "avc1",
    ];

    if (!brands.some((brand) => supportedBrands.includes(brand))) {
      return res.status(400).json({
        detail: "Please upload a supported MP4 video.",
      });
    }

    const filename = `${randomUUID()}.mp4`;

    await writeFile(
      resolve(uploadsDir, filename),
      buffer,
      { flag: "wx" }
    );

    res.status(201).json({
      url: `/uploads/${filename}`,
      type: "video",
    });
  }
);

app.use(
  "/uploads",
  express.static(uploadsDir, {
    dotfiles: "deny",
    index: false,
    fallthrough: false,
  })
);

const receiveImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 0,
  },
}).single("image");

app.post(
  "/api/admin/uploads",
  limit(20),
  (req, res, next) => {
    receiveImage(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          detail:
            error.code === "LIMIT_FILE_SIZE"
              ? "Image must be smaller than 5 MB"
              : "Please upload one image only",
        });
      }

      next();
    });
  },
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        detail: "Please select an image",
      });
    }

    const buffer = req.file.buffer;
    let extension;

    if (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
      )
    ) {
      extension = "png";
    } else if (
      buffer.length >= 3 &&
      buffer[0] === 255 &&
      buffer[1] === 216 &&
      buffer[2] === 255
    ) {
      extension = "jpg";
    } else if (
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    ) {
      extension = "webp";
    } else {
      return res.status(400).json({
        detail: "Only JPG, PNG and WebP images are supported",
      });
    }

    const filename = `${randomUUID()}.${extension}`;

    await writeFile(
      resolve(uploadsDir, filename),
      buffer,
      { flag: "wx" }
    );

    res.status(201).json({
      url: `/uploads/${filename}`,
    });
  }
);

const receiveDocument = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
    fields: 0,
  },
}).single("document");

app.post(
  "/api/admin/document-uploads",
  limit(20),
  (req, res, next) => {
    receiveDocument(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          detail:
            error.code === "LIMIT_FILE_SIZE"
              ? "Document must be smaller than 10 MB"
              : "Please upload one PDF file only",
        });
      }

      next();
    });
  },
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        detail: "Please select a PDF file",
      });
    }

    const buffer = req.file.buffer;

    if (
      !(
        buffer.length >= 5 &&
        buffer.toString("ascii", 0, 5) === "%PDF-"
      )
    ) {
      return res.status(400).json({
        detail: "Only PDF documents are supported",
      });
    }

    const filename = `${randomUUID()}.pdf`;

    await writeFile(
      resolve(uploadsDir, filename),
      buffer,
      { flag: "wx" }
    );

    res.status(201).json({
      url: `/uploads/${filename}`,
    });
  }
);


 app.get('/api/admin/products',(_,res)=>res.json(store.all('products')));
 function saveProduct(input,id) {
  const data=product.parse(input);
  if(store.all('products').some(p=>p.slug===data.slug&&p.id!==id))fail(409,'Product slug already exists');
  const c=store.all('categories').find(c=>c.slug===data.category);if(!c)fail(400,'Unknown category');
  if(new Set(data.variants.map(v=>v.label)).size!==data.variants.length)fail(400,'Variant labels must be unique');
  data.category_label=c.name;data.variants=data.variants.map(v=>({...v,id:v.id||randomUUID()}));if(data.variants.length)data.stock=data.variants.reduce((s,v)=>s+v.stock,0);
  if(data.mrp!=null&&data.mrp<data.price)fail(400,'MRP cannot be below price');
  const p={...data,id,created_at:input.created_at||iso()};store.put('products',id,p);return p;
 }
 app.post('/api/admin/products',(req,res)=>res.status(201).json(saveProduct(req.body,randomUUID())));
 app.patch('/api/admin/products/:id',(req,res)=>{
  const p=store.get('products',req.params.id);if(!p)fail(404,'Product not found');
  const parsed=product.partial().parse(req.body);const patch=Object.fromEntries(Object.entries(parsed).filter(([key])=>Object.hasOwn(req.body,key)));
  // Keep a single standard variant in sync with the existing admin price/stock editor.
  if(!patch.variants&&p.variants.length===1)patch.variants=p.variants.map(v=>({...v,...Object.fromEntries(['price','mrp','stock'].filter(k=>patch[k]!==undefined).map(k=>[k,patch[k]]))}));
  res.json(saveProduct({...p,...patch},p.id));
 });
 app.delete('/api/admin/products/:id',(req,res)=>{if(!store.get('products',req.params.id))fail(404,'Product not found');if(store.all('orders').some(o=>o.inventory_reserved&&o.status!=='delivered'&&o.items.some(i=>i.product_id===req.params.id)))fail(409,'Product belongs to an active order');store.remove('products',req.params.id);res.json({success:true});});
 app.get('/api/admin/categories',(_,res)=>res.json(store.all('categories')));
 function saveCategory(input,id) {
  const c=category.parse(input);if(store.all('categories').some(x=>x.slug===c.slug&&x.id!==id))fail(409,'Category slug already exists');const old=store.get('categories',id);
  if(old&&old.slug!==c.slug&&store.all('products').some(p=>p.category===old.slug))fail(409,'Cannot rename slug while products use this category');
  store.put('categories',id,{...c,id});return {...c,id};
 }
 app.post('/api/admin/categories',(req,res)=>res.status(201).json(saveCategory(req.body,randomUUID())));
 app.patch('/api/admin/categories/:id',(req,res)=>{const old=store.get('categories',req.params.id);if(!old)fail(404,'Category not found');const c=store.transaction(()=>{
  const parsed=category.partial().parse(req.body);const patch=Object.fromEntries(Object.entries(parsed).filter(([key])=>Object.hasOwn(req.body,key)));const c=saveCategory({...old,...patch},old.id);for(const p of store.all('products').filter(p=>p.category===c.slug))store.put('products',p.id,{...p,category_label:c.name});return c;
 });res.json(c);});
 app.delete('/api/admin/categories/:id',(req,res)=>{const c=store.get('categories',req.params.id);if(!c)fail(404,'Category not found');if(store.all('products').some(p=>p.category===c.slug))fail(409,'Move products to another category first');store.remove('categories',c.id);res.json({success:true});});
 app.get('/api/admin/orders',(_,res)=>res.json(store.all('orders').sort((a,b)=>b.created_at.localeCompare(a.created_at)).map(sanitizedOrder)));
 app.post('/api/admin/orders/:number/reconcile',limit(10),async(req,res)=>{
  const o=findOrder(req.params.number);
  if(o.payment_method!=='razorpay'||!o.razorpay_order_id)fail(409,'Order has no gateway payment to reconcile');
  const result=await reconcileOrder(o);
  res.json({order:sanitizedOrder(result.order),authorized:result.authorized});
 });
 const transitions={pending_payment:['cancelled'],confirmed:['processing','cancelled'],processing:['shipped','cancelled'],shipped:['out for delivery','delivered'],'out for delivery':['delivered'],delivered:[],cancelled:[]};
 app.patch('/api/admin/orders/:number/status',async(req,res)=>{
  const status=z.enum(['pending_payment','confirmed','processing','shipped','out for delivery','delivered','cancelled']).parse(req.query.status);
  if(status==='cancelled') {
   const pending=findOrder(req.params.number);
   if(pending.payment_method==='razorpay'&&pending.status==='pending_payment'&&pending.razorpay_order_id) {
    const result=await reconcileOrder(pending);
    if(result.order.payment_status==='paid')fail(409,'Payment captured. Do not cancel without refund review.');
    if(result.authorized)fail(409,'Payment is authorized. Resolve it in Razorpay before cancellation.');
   }
  }
  const result=store.transaction(()=>{const o=findOrder(req.params.number);if(status===o.status)return o;if(!transitions[o.status]?.includes(status))fail(409,'Invalid order status transition');
   if(status==='cancelled'&&o.payment_status==='paid')fail(409,'Refund paid orders through Razorpay before cancellation; refund reconciliation is not implemented');
   if(status==='cancelled'&&o.inventory_reserved){reserve(o.items,1);o.inventory_reserved=false;}
   o.status=status;if(status==='delivered'&&o.payment_method==='cod')o.payment_status='paid';store.put('orders',o.id,o);return o;
  });res.json({success:true,order:sanitizedOrder(result)});
 });
 app.get('/api/admin/stats',(_,res)=>{const orders=store.all('orders');res.json({orders:orders.length,revenue:orders.filter(o=>o.payment_status==='paid'&&o.status!=='cancelled').reduce((s,o)=>s+paise(o.total),0)/100,products:store.all('products').length,subscribers:store.all('newsletter').length});});
 app.get('/api/admin/messages',(_,res)=>res.json(store.all('messages')));
 app.get('/api/admin/newsletter',(_,res)=>res.json(store.all('newsletter')));
 if(config.frontendDir&&existsSync(resolve(config.frontendDir,'index.html'))) {
  app.use(express.static(config.frontendDir));
  app.get('/{*path}',(req,res,next)=>req.path.startsWith('/api')?next():res.sendFile(resolve(config.frontendDir,'index.html')));
 }
 app.use((req,res)=>res.status(404).json({detail:'Not found'}));
 app.use((error,req,res,next)=>{
  if(error instanceof z.ZodError)return res.status(422).json({detail:'Invalid request',issues:error.issues.map(i=>({path:i.path.join('.'),message:i.message}))});
  const status=error.status||500;if(status>=500)console.error('API request failed:',error.message);res.status(status).json({detail:status===500?'Internal server error':error.message});
 });return app;
}
