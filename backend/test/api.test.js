import { test,before,after } from 'node:test';
import assert from 'node:assert/strict';
import {
  randomUUID,
  randomBytes,
  scryptSync,
  createHmac,
} from "node:crypto";
import { createStore } from '../src/store.js';
import { createApp } from '../src/app.js';
import { seed } from '../src/seed.js';
const store=createStore();seed(store);
const password='test-private-password',salt='test-salt';
const config={adminHash:`scrypt$${salt}$${scryptSync(password,salt,64).toString('hex')}`,razorpayKey:'test-key',razorpaySecret:'test-secret',razorpayWebhookSecret:'test-webhook-secret'};
let server,url,token,remotePayment,gatewayPayments;
const app=createApp({store,config,gateway:async(method,path,body)=>method==='POST'?{id:`order_${body.receipt}`}:path.endsWith('/payments')?{items:gatewayPayments||[]}:remotePayment});
before(async()=>{server=app.listen(0);await new Promise(r=>server.once('listening',r));url=`http://localhost:${server.address().port}/api`;});
after(async()=>{await new Promise(r=>server.close(r));store.close();});
async function req(path,method='GET',body,headers={}) {const r=await fetch(url+path,{method,headers:{'Content-Type':'application/json',...headers},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()};}
const access='a'.repeat(64),headers=()=>({'X-Order-Token':access,'Idempotency-Key':randomUUID()});
function body(){const p=store.all('products')[0];return {items:[{product_id:p.id,variant_label:p.variants[0].label,quantity:1,price:.01}],customer:{name:'Test Buyer',mobile:'9999999999',address:'Test Road',city:'Indore',state:'MP',pincode:'452001'},payment_method:'razorpay',subtotal:.01,total:.01};}
test('catalogue search and price filtering',async()=>{let r=await req('/products?search=honey');assert.equal(r.status,200);assert.ok(r.data.length>0);assert.ok(r.data.every(p=>p.category==='honey'));r=await req('/products?min_price=200&max_price=500');assert.ok(r.data.length>0);assert.ok(r.data.every(p=>p.price>=200&&p.price<=500));});
test('admin authorization, sessions and category CRUD',async()=>{
 assert.equal((await req('/admin/categories')).status,401);const login=await req('/admin/login','POST',{password});assert.equal(login.status,200);token=login.data.token;const h={'X-Admin-Token':token};
 const c=await req('/admin/categories','POST',{name:'Test Category',slug:'test-category'},h);assert.equal(c.status,201);const u=await req(`/admin/categories/${c.data.id}`,'PATCH',{name:'Updated Category'},h);assert.equal(u.data.name,'Updated Category');assert.equal((await req(`/admin/categories/${c.data.id}`,'DELETE',undefined,h)).status,200);
 const p=store.all('products')[0];const edit=await req(`/admin/products/${p.id}`,'PATCH',{short_desc:'Updated summary'},h);assert.equal(edit.status,200);assert.equal(edit.data.variants.length,p.variants.length);assert.equal(edit.data.is_featured,p.is_featured);assert.equal(edit.data.stock,p.stock);
});
test('server calculates totals, protects customer data and prevents duplicate orders',async()=>{
 const h=headers(),b=body(),p=store.all('products')[0],stock=p.variants[0].stock;const a=await req('/orders','POST',b,h);assert.equal(a.status,201);assert.equal(a.data.subtotal,p.variants[0].price);assert.notEqual(a.data.total,.01);assert.equal(a.data.status,'pending_payment');assert.equal(a.data.access_hash,undefined);
 const retry=await req('/orders','POST',b,h);assert.equal(retry.data.order_number,a.data.order_number);assert.equal(store.get('products',p.id).variants[0].stock,stock-1);assert.equal((await req('/orders/'+a.data.order_number)).status,403);assert.equal((await req('/orders/'+a.data.order_number,'GET',undefined,h)).status,200);
});
test('invalid carts and insufficient stock rejected',async()=>{
 for(const change of [b=>b.items=[],b=>b.items[0].quantity=-1,b=>b.items[0].product_id='unknown']){const b=body();change(b);assert.ok((await req('/orders','POST',b,headers())).status>=400);}
 assert.equal((await req('/orders','POST',body(),{'Idempotency-Key':randomUUID()})).status,400);const p=store.all('products')[0],old=p.variants[0].stock;p.variants[0].stock=0;store.put('products',p.id,p);assert.equal((await req('/orders','POST',body(),headers())).status,409);p.variants[0].stock=old;store.put('products',p.id,p);
});
test('payment bypass blocked; only matching captured payments accepted',async()=>{
 const h=headers(),o=(await req('/orders','POST',body(),h)).data;const c=await req('/payments/razorpay/create-order','POST',{order_number:o.order_number,amount:.01},h);assert.equal(c.data.amount,Math.round(o.total*100));
 const p={order_number:o.order_number,razorpay_order_id:'order_mock_bad',razorpay_payment_id:'pay_test',razorpay_signature:'0'.repeat(64)};assert.equal((await req('/payments/razorpay/verify','POST',p,h)).status,400);
 p.razorpay_order_id=c.data.order_id;p.razorpay_signature=createHmac('sha256',config.razorpaySecret).update(`${p.razorpay_order_id}|pay_test`).digest('hex');remotePayment={id:'pay_test',order_id:p.razorpay_order_id,amount:1,currency:'INR',status:'captured'};assert.equal((await req('/payments/razorpay/verify','POST',p,h)).status,409);remotePayment.amount=Math.round(o.total*100);assert.equal((await req('/payments/razorpay/verify','POST',p,h)).status,200);assert.equal((await req('/payments/razorpay/verify','POST',p,h)).status,200);
});
async function webhook(event,secret=config.razorpayWebhookSecret,signatureOverride) {
 const raw=JSON.stringify(event),signature=signatureOverride??createHmac('sha256',secret).update(raw).digest('hex');
 const response=await fetch(url+'/payments/razorpay/webhook',{method:'POST',headers:{'Content-Type':'application/json','X-Razorpay-Signature':signature},body:raw});
 return {status:response.status,data:await response.json()};
}
test('signed captured webhook confirms interrupted checkout; duplicate delivery is safe',async()=>{
 const h=headers(),o=(await req('/orders','POST',body(),h)).data;
 const gatewayOrder=(await req('/payments/razorpay/create-order','POST',{order_number:o.order_number},h)).data;
 const payment={id:'pay_interrupted',order_id:gatewayOrder.order_id,amount:Math.round(o.total*100),currency:'INR',status:'captured'};
 const event={event:'payment.captured',payload:{payment:{entity:payment}}};
 assert.equal((await webhook(event,'wrong-secret')).status,401);
 assert.equal((await webhook({...event,event:'payment.failed'},config.razorpayWebhookSecret,'0'.repeat(64))).status,401);
 assert.equal((await webhook({...event,payload:{payment:{entity:{...payment,amount:1}}}})).status,409);
 assert.equal((await req('/orders/'+o.order_number,'GET',undefined,h)).data.payment_status,'pending');
 gatewayPayments=[payment];
 const recovered=await req('/payments/razorpay/reconcile','POST',{order_number:o.order_number},h);
 assert.equal(recovered.status,200);assert.equal(recovered.data.payment_status,'paid');
 gatewayPayments=[];
 assert.equal((await webhook(event)).status,200);
 assert.equal((await webhook(event)).data.already_processed,true);
 const saved=(await req('/orders/'+o.order_number,'GET',undefined,h)).data;
 assert.equal(saved.payment_status,'paid');assert.equal(saved.status,'confirmed');assert.equal(saved.razorpay_payment_id,payment.id);
 assert.equal((await webhook({...event,payload:{payment:{entity:{...payment,id:'pay_second'}}}})).status,409);
 assert.equal((await req('/orders/'+o.order_number,'GET',undefined,h)).data.needs_payment_review,true);
});
test('captured payment after cancellation stays cancelled and is flagged for review',async()=>{
 const h=headers(),o=(await req('/orders','POST',body(),h)).data;
 const gatewayOrder=(await req('/payments/razorpay/create-order','POST',{order_number:o.order_number},h)).data;
 const adminHeader={'X-Admin-Token':token};
 assert.equal((await req(`/admin/orders/${o.order_number}/status?status=cancelled`,'PATCH',undefined,adminHeader)).status,200);
 const payment={id:'pay_after_cancel',order_id:gatewayOrder.order_id,amount:Math.round(o.total*100),currency:'INR',status:'captured'};
 assert.equal((await webhook({event:'payment.captured',payload:{payment:{entity:payment}}})).status,200);
 const saved=(await req('/orders/'+o.order_number,'GET',undefined,h)).data;
 assert.equal(saved.status,'cancelled');assert.equal(saved.payment_status,'paid');assert.equal(saved.needs_payment_review,true);
});
test('live payment keys without a webhook secret are disabled',async()=>{
 const disabled=createApp({store,config:{razorpayKey:'rzp_live_example',razorpaySecret:'example'}}).listen(0);
 await new Promise(r=>disabled.once('listening',r));
 try {
  const response=await fetch(`http://localhost:${disabled.address().port}/api/config`);
  assert.equal((await response.json()).online_payments_enabled,false);
 } finally {await new Promise(r=>disabled.close(r));}
});
test('cancellation restores stock once and logout revokes admin session', async () => {
  const localStore = createStore();
  seed(localStore);
  const localApp = createApp({ store: localStore, config });
  const localServer = localApp.listen(0);
  await new Promise((resolve) => localServer.once('listening', resolve));

  const localUrl = `http://localhost:${localServer.address().port}/api`;
  const localReq = async (path, method = 'GET', data, requestHeaders = {}) => {
    const response = await fetch(localUrl + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...requestHeaders },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
    return { status: response.status, data: await response.json() };
  };

  try {
    const login = await localReq('/admin/login', 'POST', { password });
    assert.equal(login.status, 200);
    const adminHeaders = { 'X-Admin-Token': login.data.token };

    const product = localStore.all('products')[0];
    const stock = product.variants[0].stock;
    const orderBody = {
      ...body(),
      items: [{
        product_id: product.id,
        variant_label: product.variants[0].label,
        quantity: 1,
      }],
      payment_method: 'cod',
    };

    const created = await localReq('/orders', 'POST', orderBody, headers());
    assert.equal(created.status, 201, JSON.stringify(created.data));

    for (let i = 0; i < 2; i++) {
      const cancelled = await localReq(
        `/admin/orders/${created.data.order_number}/status?status=cancelled`,
        'PATCH',
        undefined,
        adminHeaders
      );
      assert.equal(cancelled.status, 200);
      assert.equal(localStore.get('products', product.id).variants[0].stock, stock);
    }

    assert.equal((await localReq('/admin/logout', 'POST', undefined, adminHeaders)).status, 200);
    assert.equal((await localReq('/admin/categories', 'GET', undefined, adminHeaders)).status, 401);
  } finally {
    await new Promise((resolve) => localServer.close(resolve));
    localStore.close();
  }
});

test("expired unpaid Razorpay orders restore stock safely", async () => {
  const localStore = createStore();
  seed(localStore);

  const paymentsByOrder = new Map();
  const gatewayFailures = new Set();

  const localGateway = async (method, path, data) => {
    if (method === "POST" && path === "orders") {
      const orderId = `order_${randomUUID().replaceAll("-", "")}`;
      paymentsByOrder.set(orderId, []);
      return { id: orderId };
    }

    const match = path.match(/^orders\/([^/]+)\/payments$/);

    if (method === "GET" && match) {
      const orderId = match[1];

      if (gatewayFailures.has(orderId)) {
        const error = new Error("Test gateway unavailable");
        error.status = 502;
        throw error;
      }

      return {
        items: paymentsByOrder.get(orderId) || [],
      };
    }

    throw new Error(`Unexpected gateway request: ${method} ${path}`);
  };

  const localApp = createApp({
    store: localStore,
    config: {
      ...config,
      paymentExpiryMs: 5 * 60 * 1000,
    },
    gateway: localGateway,
  });

  const localServer = localApp.listen(0);

  await new Promise((resolve) =>
    localServer.once("listening", resolve)
  );

  const localUrl =
    `http://localhost:${localServer.address().port}/api`;

  const localReq = async (
    path,
    method = "GET",
    data,
    requestHeaders = {}
  ) => {
    const response = await fetch(localUrl + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...requestHeaders,
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });

    return {
      status: response.status,
      data: await response.json(),
    };
  };

  const product = localStore.all("products")[0];
  const initialStock = product.variants[0].stock;
  const now = Date.now();

  const createPendingOrder = async () => {
    const requestHeaders = {
      "X-Order-Token": "b".repeat(64),
      "Idempotency-Key": randomUUID(),
    };

    const orderBody = {
      items: [
        {
          product_id: product.id,
          variant_label: product.variants[0].label,
          quantity: 1,
        },
      ],
      customer: {
        name: "Expiry Test Buyer",
        mobile: "9999999999",
        email: "",
        address: "Test Address",
        city: "Indore",
        state: "Madhya Pradesh",
        pincode: "452001",
      },
      payment_method: "razorpay",
    };

    const created = await localReq(
      "/orders",
      "POST",
      orderBody,
      requestHeaders
    );

    assert.equal(
      created.status,
      201,
      JSON.stringify(created.data)
    );

    const gatewayOrder = await localReq(
      "/payments/razorpay/create-order",
      "POST",
      { order_number: created.data.order_number },
      requestHeaders
    );

    assert.equal(
      gatewayOrder.status,
      200,
      JSON.stringify(gatewayOrder.data)
    );

    const savedOrder = localStore
      .all("orders")
      .find(
        (item) =>
          item.order_number === created.data.order_number
      );

    savedOrder.created_at = new Date(
      now - 10 * 60 * 1000
    ).toISOString();

    localStore.put(
      "orders",
      savedOrder.id,
      savedOrder
    );

    return {
      order: savedOrder,
      headers: requestHeaders,
    };
  };

  try {
    // 1. A genuinely unpaid order expires and restores stock.
    const unpaid = await createPendingOrder();

    assert.equal(
      localStore.get("products", product.id).variants[0].stock,
      initialStock - 1
    );

    const expiredCount =
      await localApp.locals.expirePendingOrders(now);

    assert.equal(expiredCount, 1);

    const expiredOrder = localStore.get(
      "orders",
      unpaid.order.id
    );

    assert.equal(expiredOrder.status, "cancelled");
    assert.equal(expiredOrder.payment_status, "expired");
    assert.equal(expiredOrder.inventory_reserved, false);

    assert.equal(
      localStore.get("products", product.id).variants[0].stock,
      initialStock
    );

    // Running expiry again must not restore stock twice.
    assert.equal(
      await localApp.locals.expirePendingOrders(now),
      0
    );

    assert.equal(
      localStore.get("products", product.id).variants[0].stock,
      initialStock
    );

    // 2. An authorized payment must not be expired.
    const authorized = await createPendingOrder();

    paymentsByOrder.set(
      authorized.order.razorpay_order_id,
      [
        {
          id: "pay_authorized_test",
          order_id: authorized.order.razorpay_order_id,
          amount: Math.round(authorized.order.total * 100),
          currency: "INR",
          status: "authorized",
        },
      ]
    );

    assert.equal(
      await localApp.locals.expirePendingOrders(now),
      0
    );

    const authorizedOrder = localStore.get(
      "orders",
      authorized.order.id
    );

    assert.equal(
      authorizedOrder.status,
      "pending_payment"
    );

    assert.equal(
      authorizedOrder.inventory_reserved,
      true
    );

    // 3. A captured payment becomes paid instead of expiring.
    const captured = await createPendingOrder();

    paymentsByOrder.set(
      captured.order.razorpay_order_id,
      [
        {
          id: "pay_captured_expiry_test",
          order_id: captured.order.razorpay_order_id,
          amount: Math.round(captured.order.total * 100),
          currency: "INR",
          status: "captured",
        },
      ]
    );

    assert.equal(
      await localApp.locals.expirePendingOrders(now),
      0
    );

    const capturedOrder = localStore.get(
      "orders",
      captured.order.id
    );

    assert.equal(capturedOrder.status, "confirmed");
    assert.equal(capturedOrder.payment_status, "paid");
    assert.equal(capturedOrder.inventory_reserved, true);

    // 4. A gateway error must not cancel an order.
    const unavailable = await createPendingOrder();

    gatewayFailures.add(
      unavailable.order.razorpay_order_id
    );

    assert.equal(
      await localApp.locals.expirePendingOrders(now),
      0
    );

    const unavailableOrder = localStore.get(
      "orders",
      unavailable.order.id
    );

    assert.equal(
      unavailableOrder.status,
      "pending_payment"
    );

    assert.equal(
      unavailableOrder.inventory_reserved,
      true
    );
  } finally {
    await new Promise((resolve) =>
      localServer.close(resolve)
    );

    localStore.close();
  }
});

test('expired sessions are rejected',async()=>{
 const {digest}=await import('../src/auth.js');const expired='expired-test-token';store.insert('sessions',digest(expired),{expires_at:Date.now()-1});assert.equal((await req('/admin/categories','GET',undefined,{'X-Admin-Token':expired})).status,401);
});
test('missing gateway configuration rejects online orders without demo success',async()=>{
 const disabled=createApp({store,config:{}}).listen(0);await new Promise(r=>disabled.once('listening',r));
 try {const r=await fetch(`http://localhost:${disabled.address().port}/api/orders`,{method:'POST',headers:{'Content-Type':'application/json',...headers()},body:JSON.stringify(body())});assert.equal(r.status,503);} finally {await new Promise(r=>disabled.close(r));}
});
