import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // The README and NEXT_PUBLIC_APP_URL use 127.0.0.1; the dev server only trusts localhost by default
  allowedDevOrigins: ["127.0.0.1"],
  cacheComponents: true,
  partialPrefetching: true,
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
