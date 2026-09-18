import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { product } from './schemas.js';
export function seed(store) {
 store.transaction(()=>{
  if(!store.all('categories').length)for(const [slug,name,description] of [['honey','Honey','MADHULOGY™ Pure Raw Honey'],['makhana','Makhana','Premium Makhana'],['flavoured-makhana','Flavoured Makhana','Curated flavoured varieties']])store.insert('categories',slug,{id:slug,slug,name,description,is_active:true});
  if(!store.all('products').length)for(const raw of JSON.parse(readFileSync(new URL('./catalog.json',import.meta.url),'utf8'))) {
   const p=product.parse(raw);p.id=p.id||randomUUID();p.variants=p.variants.map(v=>({...v,id:v.id||randomUUID()}));if(p.variants.length)p.stock=p.variants.reduce((s,v)=>s+v.stock,0);p.created_at=new Date().toISOString();store.insert('products',p.id,p);
  }
 });
}
