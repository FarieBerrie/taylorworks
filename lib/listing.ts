import "server-only";

import type { Prisma } from "@prisma/client";

import { isListingTier, type ListingTier } from "@/lib/config";
import { isProduction, stripeConfigured } from "@/lib/env";

export type BillingMode = "mock" | "stripe";

/**
 * "mock" lists contractors without charging, so it's for development only: in production it needs
 * ALLOW_MOCK_BILLING=true as well (a private staging site). Production otherwise always uses
 * Stripe, and if Stripe isn't configured yet the billing page says so instead of handing out
 * free listings.
 */
export function getBillingMode(): BillingMode {
  const explicit = process.env.BILLING_MODE?.trim().toLowerCase();
  const mockAllowed = !isProduction() || process.env.ALLOW_MOCK_BILLING === "true";
  if (explicit === "stripe" || !mockAllowed) return "stripe";
  if (explicit === "mock") return "mock";
  return stripeConfigured() ? "stripe" : "mock";
}

/**
 * The site's public address. NEXT_PUBLIC_APP_URL when set (your own domain); on Render before
 * that, the service's onrender.com address, which Render provides as RENDER_EXTERNAL_URL.
 */
export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || process.env.RENDER_EXTERNAL_URL || "http://127.0.0.1:43123").replace(
    /\/$/,
    "",
  );
}

export function priceIdForTier(tier: ListingTier) {
  return tier === "FEATURED" ? process.env.STRIPE_PRICE_FEATURED : process.env.STRIPE_PRICE_BASIC;
}

export function tierForPriceId(priceId: string | undefined, fallback: string | undefined): ListingTier {
  if (priceId && priceId === process.env.STRIPE_PRICE_FEATURED) return "FEATURED";
  if (priceId && priceId === process.env.STRIPE_PRICE_BASIC) return "BASIC";
  if (fallback && isListingTier(fallback)) return fallback;
  return "BASIC";
}

export type ListingSnapshot = {
  status: string;
  tier: string;
  currentPeriodEnd: Date | null;
};

export function isListingPublic(listing: ListingSnapshot | null | undefined, now: Date) {
  if (!listing || listing.status !== "ACTIVE") return false;
  if (listing.currentPeriodEnd && listing.currentPeriodEnd <= now) return false;
  return true;
}

export function activeListingWhere(now: Date): Prisma.ContractorProfileWhereInput {
  return {
    listing: {
      is: {
        status: "ACTIVE",
        OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: now } }],
      },
    },
  };
}

export function listingStatusLabel(listing: ListingSnapshot | null | undefined, now: Date) {
  if (!listing || listing.status === "INACTIVE") return "Not listed";
  if (listing.status === "PAST_DUE") return "Past due";
  if (listing.status === "CANCELED") return "Canceled";
  if (!isListingPublic(listing, now)) return "Expired";
  return listing.tier === "FEATURED" ? "Featured" : "Basic";
}
