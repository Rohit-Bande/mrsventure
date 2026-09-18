import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Package, MessageCircle } from "lucide-react";
import Seo from "@/components/Seo";
import { getOrder } from "@/lib/api";
import { currency, waLink } from "@/lib/content";

const STEPS = [
  "Order Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const STATUS_STEP = {
  confirmed: 0,
  processing: 1,
  shipped: 2,
  "out for delivery": 3,
  delivered: 4,
};

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    let active = true;
    let timer;

    const loadOrder = async () => {
      try {
        const latestOrder = await getOrder(orderNumber);

        if (!active) return;

        setOrder(latestOrder);

        // Stop checking after the order reaches a final status.
        if (
          latestOrder.status === "delivered" ||
          latestOrder.status === "cancelled"
        ) {
          return;
        }
      } catch {
        // Keep the previously loaded order and try again.
      }

      if (active) {
        timer = window.setTimeout(loadOrder, 10000);
      }
    };

    loadOrder();

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [orderNumber]);

  const currentStep = STATUS_STEP[order?.status] ?? 0;
  const isCancelled = order?.status === "cancelled";

  return (
    <div className="bg-cream min-h-[70vh]">
      <Seo
        title="Order Status | MRS Ventures"
        description="View your latest MRS Ventures order status."
      />

      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-forest-light/15">
          <CheckCircle2 className="h-11 w-11 text-forest-light" />
        </div>

        <h1 className="mt-6 font-serif text-4xl font-bold text-forest-deep">
          {isCancelled
            ? "Order Cancelled"
            : order?.payment_method === "razorpay" &&
                order.payment_status !== "paid"
              ? "Payment not confirmed"
              : "Thank you for your order!"}
        </h1>

        <p className="mt-2 text-slate-600">
          {isCancelled
            ? "This order has been cancelled. Contact support if you need assistance."
            : order?.payment_method === "razorpay" &&
                order.payment_status !== "paid"
              ? "If you were charged, do not pay again. Contact support with your order number."
              : "This page updates automatically when your order status changes."}
        </p>

        <div className="mt-8 rounded-2xl border border-forest/10 bg-white p-6 text-left">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-500">Order Number</span>
            <span
              className="break-all text-right font-serif text-lg font-bold text-forest-deep"
              data-testid="order-number"
            >
              {orderNumber}
            </span>
          </div>

          {order && (
            <>
              <div className="mt-3 flex items-center justify-between border-t border-forest/10 pt-3">
                <span className="text-sm text-slate-500">Order Total</span>
                <span className="font-semibold text-forest-deep">
                  {currency(order.total)}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-slate-500">Payment</span>
                <span className="text-sm font-medium text-forest-deep">
                  {order.payment_method === "cod"
                    ? "Cash on Delivery"
                    : order.payment_status === "paid"
                      ? "Paid Online"
                      : "Payment pending"}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-slate-500">Current Status</span>
                <span
                  className={`text-sm font-semibold capitalize ${
                    isCancelled ? "text-red-600" : "text-forest-deep"
                  }`}
                >
                  {order.status?.replaceAll("_", " ")}
                </span>
              </div>

              <div className="mt-6">
                <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-forest-deep">
                  <Package className="h-4 w-4" />
                  Order Status
                </p>

                {isCancelled ? (
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    <span className="text-sm font-medium text-red-600">
                      Order Cancelled
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {STEPS.map((step, index) => {
                      const reached = index <= currentStep;
                      const current = index === currentStep;

                      return (
                        <div key={step} className="flex items-center gap-3">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              reached ? "bg-forest-light" : "bg-forest/20"
                            }`}
                          />

                          <span
                            className={`text-sm ${
                              reached
                                ? "font-medium text-forest-deep"
                                : "text-slate-400"
                            }`}
                          >
                            {step}
                            {current && (
                              <span className="ml-2 text-xs text-forest-light">
                                Current
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/shop"
            className="rounded-full bg-forest px-7 py-3.5 text-sm font-semibold text-cream transition hover:bg-forest-deep"
          >
            Continue Shopping
          </Link>

          <a
            href={waLink(
              `Hi MRS Ventures, I would like an update for order ${orderNumber}.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-forest/25 px-7 py-3.5 text-sm font-semibold text-forest-deep transition hover:bg-forest/5"
          >
            <MessageCircle className="h-4 w-4" />
            Track on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}