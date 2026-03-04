import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://learn.readee.app";

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/teachers`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/contact-us`, lastModified: new Date(), priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), priority: 0.3 },
    { url: `${baseUrl}/terms-of-service`, lastModified: new Date(), priority: 0.3 },
    { url: `${baseUrl}/feedback`, lastModified: new Date(), priority: 0.5 },
  ];
}
