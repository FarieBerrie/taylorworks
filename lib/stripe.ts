import "server-only";

import Stripe from "stripe";

import { type ListingTier } from "@/lib/config";
import { prisma } from "@/lib/db";
import { tierForPriceId } from "@/lib/listing";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
  return new Stripe(key);
}

function mapStripeStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "active":
    case "trialing":
      return "ACTIVE";
    case "past_due":
    case "unpaid":
      return "PAST_DUE";
    case "canceled":
    case "incomplete_expired":
      return "CANCELED";
    default:
      return "INACTIVE";
  }
}

export async function applySubscription(subscription: Stripe.Subscription, profileHint?: string | null) {
  const item = subscription.items.data[0];
  const priceId = item?.price?.id;
  const tier = tierForPriceId(priceId, subscription.metadata?.tier);
  const status = mapStripeStatus(subscription.status);
  const periodEnd = item ? new Date(item.current_period_end * 1000) : null;
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
  const profileId = subscription.metadata?.contractorProfileId || profileHint || null;

  const data = {
    tier,
    status,
    stripeCustomerId: customerId ?? null,
    stripeSubscriptionId: subscription.id,
    currentPeriodEnd: periodEnd,
    activatedAt: status === "ACTIVE" ? new Date() : undefined,
  };

  if (profileId) {
    await prisma.listing.upsert({
      where: { contractorProfileId: profileId },
      create: {
        contractorProfileId: profileId,
        ...data,
        activatedAt: status === "ACTIVE" ? new Date() : null,
      },
      update: data,
    });
    return;
  }

  const existing = await prisma.listing.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });
  if (!existing) return;
  await prisma.listing.update({ where: { id: existing.id }, data });
}

export async function syncSubscriptionById(subscriptionId: string, profileHint?: string | null) {
  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await applySubscription(subscription, profileHint);
}

export function subscriptionIdFromInvoice(invoice: Stripe.Invoice) {
  const details = invoice.parent?.subscription_details;
  const subscription = details?.subscription;
  if (!subscription) return null;
  return typeof subscription === "string" ? subscription : subscription.id;
}

export function tierFromCheckout(metadata: Stripe.Metadata | null): ListingTier {
  return tierForPriceId(undefined, metadata?.tier);
}
