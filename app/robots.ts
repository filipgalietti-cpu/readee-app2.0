import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/about", "/teachers", "/contact-us", "/privacy-policy", "/terms-of-service"],
      disallow: ["/dashboard", "/practice", "/assessment", "/account", "/api/"],
    },
    sitemap: "https://learn.readee.app/sitemap.xml",
  };
}
