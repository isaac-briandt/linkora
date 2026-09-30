import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://connectora.io";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/ai",
        "/api",
        "/auth",
        "/dashboard",
        "/experiences",
        "/login",
        "/organization",
        "/organizations",
        "/people",
        "/register",
      ],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
