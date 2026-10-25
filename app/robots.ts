import type { MetadataRoute } from "next";
import { connection } from "next/server";

import { appUrl } from "@/lib/listing";

// Per request, so the sitemap address is the live one rather than whatever was set at build time
export default async function robots(): Promise<MetadataRoute.Robots> {
  await connection();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Signed-in pages and one-time links have nothing for a search engine
      disallow: ["/api/", "/dashboard", "/messages", "/profile", "/billing", "/reset-password"],
    },
    sitemap: `${appUrl()}/sitemap.xml`,
  };
}
