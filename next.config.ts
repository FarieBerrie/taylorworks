import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const isHttps = (process.env.NEXT_PUBLIC_APP_URL || process.env.RENDER_EXTERNAL_URL || "").startsWith("https://");

// Content Security Policy without nonces: nonces need every page rendered per request, which
// would switch off this app's prerendered shells (cacheComponents / partial prerendering). Forms
// may hand off to Stripe Checkout and the customer portal. Development adds what React's dev
// tools need.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com https://billing.stripe.com",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  // Full URLs (which can carry password-reset tokens) never leave the site
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Only once the site is on https: browsers would refuse plain http for a year afterwards
  ...(isHttps ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
];

const nextConfig: NextConfig = {
  /* config options here */
  // The README and NEXT_PUBLIC_APP_URL use 127.0.0.1; the dev server only trusts localhost by default
  allowedDevOrigins: ["127.0.0.1"],
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
