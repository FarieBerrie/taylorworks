import "server-only";

import type { Prisma } from "@prisma/client";

import { isListingTier, type ListingTier } from "@/lib/config";

export type BillingMode = "mock" | "stripe";

export function getBillingMode(): BillingMode {
  const explicit = process.env.BILLING_MODE?.trim().toLowerCase();
  if (explicit === "mock") return "mock";
  if (explicit === "stripe") return "stripe";
  const ready = Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET &&
      process.env.STRIPE_PRICE_BASIC &&
      process.env.STRIPE_PRICE_FEATURED,
  );
  return ready ? "stripe" : "mock";
}

export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:43123").replace(/\/$/, "");
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
