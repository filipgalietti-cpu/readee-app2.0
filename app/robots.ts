import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/about",
        "/contact-us",
        "/privacy-policy",
        "/terms-of-service",
        "/standards",
        "/standards/",
        "/community",
        "/community/",
        "/today",
        "/today/",
        "/upgrade",
        "/signup",
        "/login",
      ],
      disallow: [
        "/demo",
        "/demo/",
        "/dashboard",
        "/discover",
        "/practice",
        "/assessment",
        "/account",
        "/api/",
        "/admin",
        "/classroom",
        "/class/",
        "/student/",
      ],
    },
    sitemap: "https://learn.readee.app/sitemap.xml",
  };
}
