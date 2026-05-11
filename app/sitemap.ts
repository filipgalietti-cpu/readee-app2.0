import type { MetadataRoute } from "next";
import { getAllStandards, slugifyStandard } from "@/lib/data/standards";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { listCategories } from "@/lib/discover/categories";

const BASE = "https://learn.readee.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/standards`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/schools`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/schools/funding-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/schools/dpa`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/community`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/community/all`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE}/community/grade/k`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/community/grade/1st`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/community/grade/2nd`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/community/grade/3rd`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/community/grade/4th`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/discover`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/today`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
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

  // Approved community passages — public reads + acquisition surface.
  // Pull at build/render time; sitemap regen frequency keeps this fresh.
  let communityRoutes: MetadataRoute.Sitemap = [];
  try {
    const admin = supabaseAdmin();
    const { data } = await admin
      .from("community_passages")
      .select("slug, updated_at")
      .eq("status", "approved")
      .not("slug", "is", null)
      .limit(5000);
    communityRoutes = ((data ?? []) as { slug: string; updated_at: string }[]).map(
      (r) => ({
        url: `${BASE}/community/${r.slug}`,
        lastModified: r.updated_at ? new Date(r.updated_at) : now,
        changeFrequency: "monthly",
        priority: 0.6,
      }),
    );
  } catch {
    // Sitemap shouldn't 500 the build if Supabase is briefly unreachable.
  }

  // Discovery category index pages — 7 stable URLs.
  const categoryRoutes: MetadataRoute.Sitemap = listCategories().map((cat) => ({
    url: `${BASE}/discover/${cat.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  // Discovery articles (per-article URLs — the SEO surface for organic
  // acquisition). Filter qc_overall = fail so we don't index pieces
  // /discover hides at read-time.
  let discoveryRoutes: MetadataRoute.Sitemap = [];
  try {
    const admin = supabaseAdmin();
    const { data } = await admin
      .from("discovery_articles")
      .select("category, slug, updated_at")
      .neq("qc_overall", "fail")
      .limit(5000);
    discoveryRoutes = (
      (data ?? []) as { category: string; slug: string; updated_at: string }[]
    ).map((r) => ({
      url: `${BASE}/discover/${r.category}/${r.slug}`,
      lastModified: r.updated_at ? new Date(r.updated_at) : now,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch {
    /* sitemap shouldn't 500 on transient DB issues */
  }

  // Daily Readee archive — every past day is its own /today/[slug].
  let dailyRoutes: MetadataRoute.Sitemap = [];
  try {
    const admin = supabaseAdmin();
    const { data } = await admin
      .from("daily_questions")
      .select("slug, created_at")
      .neq("qc_overall", "fail")
      .order("created_at", { ascending: false })
      .limit(365);
    dailyRoutes = (
      (data ?? []) as { slug: string; created_at: string }[]
    ).map((r) => ({
      url: `${BASE}/today/${r.slug}`,
      lastModified: r.created_at ? new Date(r.created_at) : now,
      changeFrequency: "monthly",
      priority: 0.5,
    }));
  } catch {
    /* same */
  }

  return [
    ...staticRoutes,
    ...standardRoutes,
    ...communityRoutes,
    ...categoryRoutes,
    ...discoveryRoutes,
    ...dailyRoutes,
  ];
}
