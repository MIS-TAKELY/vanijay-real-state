import type { MetadataRoute } from "next";
import { SITE_URL } from "lib/site";

/**
 * /robots.txt — allow the full public surface, block private and machine
 * surfaces. Listing detail pages live at /{slug} (SEO); the legacy
 * /listing/{slug} redirect stays crawlable so crawlers follow the 301 and
 * pass link equity to the new URLs.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        // API + proxied backend routes
        "/api/",
        // Gold console (admin content management)
        "/admin",
        // Signed-in surfaces (route group (real-state)/(auth))
        "/cart",
        "/dashboard",
        "/favorites",
        "/my-listings",
        "/profile",
        "/saved-searches",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
