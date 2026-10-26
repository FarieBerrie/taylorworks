import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripe, subscriptionIdFromInvoice, syncSubscriptionById } from "@/lib/stripe";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 400 });
  }

  const payload = await request.text();
  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode !== "subscription") break;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
      if (subscriptionId) {
        await syncSubscriptionById(subscriptionId, session.metadata?.contractorProfileId);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      // Fetch the subscription's current state: events can arrive late or out of order
      await syncSubscriptionById(event.data.object.id);
      break;
    }
    case "invoice.payment_failed": {
      const subscriptionId = subscriptionIdFromInvoice(event.data.object);
      if (subscriptionId) await syncSubscriptionById(subscriptionId);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
