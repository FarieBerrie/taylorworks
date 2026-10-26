import type { MetadataRoute } from "next";
import { connection } from "next/server";

import { prisma } from "@/lib/db";
import { activeListingWhere, appUrl } from "@/lib/listing";

/**
 * The public pages plus every listed contractor and open job. Built per request rather than at
 * build time: on a first deploy the build runs before the database tables exist.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const base = appUrl();
  const now = new Date();
  const [contractors, jobs] = await Promise.all([
    prisma.contractorProfile.findMany({ where: activeListingWhere(now), select: { id: true, updatedAt: true } }),
    prisma.jobRequest.findMany({ where: { status: "OPEN" }, select: { id: true, updatedAt: true } }),
  ]);

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/contractors`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/jobs`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/signup`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.3 },
    ...contractors.map((c) => ({ url: `${base}/contractors/${c.id}`, lastModified: c.updatedAt, priority: 0.7 })),
    ...jobs.map((j) => ({ url: `${base}/jobs/${j.id}`, lastModified: j.updatedAt, priority: 0.6 })),
  ];
}
