import { z } from 'zod';
const text=z.string().trim().min(1).max(500);
const money=z.number().finite().nonnegative().max(1000000).refine(n=>Math.abs(n*100-Math.round(n*100))<1e-6,'Use at most two decimal places');
const stock=z.number().int().nonnegative().max(1000000);

export const variant = z.object({
  id: z.string().optional(),
  label: text,
  weight: text,
  price: money,
  mrp: money.nullable().optional(),
  stock: stock.default(100),
  sku: z.string().trim().max(100).default(""),
  batch_number: z.string().trim().max(100).default(""),
  manufactured_on: z.union([z.literal(""), z.iso.date()]).default(""),
  best_before: z.union([z.literal(""), z.iso.date()]).default(""),
   images: z.array(z.url()).max(12).default([]),
});

export const product=z.object({
 id:z.string().optional(),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),name:text,brand:text.default('MRS Ventures'),category:text,category_label:text.optional(),
 short_desc:z.string().max(2000),description:z.string().max(20000),price:money,mrp:money.nullable().optional(),currency:z.literal('INR').default('INR'),
 images:z.array(z.url()).max(12).default([]),stock:stock.default(100),variants:z.array(variant).max(30).default([]),
 is_featured:z.boolean().default(false),is_bestseller:z.boolean().default(false),is_new:z.boolean().default(false),badge:z.string().max(100).nullable().optional(),
 tags:z.array(text).default([]),rating:z.number().min(0).max(5).default(0),review_count:stock.default(0),
 ingredients:z.string().default(''),nutrition:z.array(z.record(z.string(),z.string())).default([]),how_to_use:z.string().default(''),storage:z.string().default(''),net_quantity:z.string().default(''),origin:z.string().default(''),seo_title:z.string().default(''),seo_description:z.string().default('')
,sku: z.string().trim().max(100).default(''),
});
export const category=z.object({name:text,slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),description:z.string().max(2000).default(''),is_active:z.boolean().default(true)});
export const orderInput=z.object({
 items:z.array(z.object({product_id:text,variant_label:text.nullable().optional(),quantity:z.number().int().min(1).max(100)})).min(1).max(50),
 customer:z.object({name:text,mobile:z.string().regex(/^\d{10}$/),email:z.union([z.email(),z.literal('')]).optional(),address:text,landmark:z.string().max(500).optional(),city:text,state:text,pincode:z.string().regex(/^\d{6}$/)}),
 payment_method:z.enum(['cod','razorpay']),coupon:z.string().max(100).nullable().optional()
});
export const paymentInput=z.object({order_number:text,razorpay_order_id:text,razorpay_payment_id:text,razorpay_signature:z.string().regex(/^[0-9a-f]{64}$/)});
export const contactInput=z.object({name:text,email:z.email(),message:z.string().trim().min(1).max(10000),phone:z.string().max(30).optional()});
export const loginInput=z.object({password:z.string().min(1).max(256)});
