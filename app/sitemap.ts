import type { MetadataRoute } from "next";
import { getAllStandards, slugifyStandard } from "@/lib/data/standards";

const BASE = "https://learn.readee.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/standards`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/schools`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/schools/funding-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/schools/dpa`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/upgrade`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/teachers`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/contact-us`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/feedback`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms-of-service`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // One URL per Common Core standard. Each is a kept-static landing page
  // with free sample questions and an upgrade CTA — big SEO surface.
  const standardRoutes: MetadataRoute.Sitemap = getAllStandards().map((s) => ({
    url: `${BASE}/standards/${slugifyStandard(s.standard_id)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...standardRoutes];
}
