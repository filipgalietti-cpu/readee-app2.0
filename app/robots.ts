import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/about",
        "/teachers",
        "/schools",
        "/contact-us",
        "/privacy-policy",
        "/terms-of-service",
        "/standards",
        "/standards/",
        "/upgrade",
        "/signup",
        "/login",
      ],
      disallow: [
        "/dashboard",
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
