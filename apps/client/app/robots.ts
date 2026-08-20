import type { MetadataRoute } from "next";
import { SITE_URL } from "lib/site";

/**
 * /robots.txt — allow the full public surface, block private and machine
 * surfaces. Listing detail pages live at /{slug} (SEO); the legacy
 * /listing/{slug} redirect stays crawlable so crawlers follow the 301 and
 * pass link equity to the new URLs.
 *
 * AI answer-engine crawlers get explicit allow rules (in addition to the
 * `*` rule) so they are never accidentally blocked by upstream proxies or
 * future rule changes, and so intent is visible in the file itself.
 */

/** Crawlers used by AI answer engines (ChatGPT, Perplexity, Claude, etc.). */
const AI_CRAWLERS = [
  "GPTBot", // OpenAI / ChatGPT
  "OAI-SearchBot", // ChatGPT Search
  "ChatGPT-User", // ChatGPT browse-on-demand
  "PerplexityBot", // Perplexity AI
  "ClaudeBot", // Anthropic / Claude
  "Claude-SearchBot", // Claude search
  "anthropic-ai", // Anthropic crawlers
  "Google-Extended", // Gemini / Google AI training & answers
  "CCBot", // Common Crawl — training corpus for many LLMs
  "Amazonbot", // Amazon
  "cohere-ai", // Cohere
];

export default function robots(): MetadataRoute.Robots {
  const disallow = [
    // API + proxied backend routes
    "/api/",
    // Gold console (admin content management)
    "/admin",
    // Scraping / data-utility surface — not SEO content
    "/scrape",
    // Signed-in surfaces (route group (real-state)/(auth))
    "/appointments",
    "/cart",
    "/dashboard",
    "/documents",
    "/favorites",
    "/inquiries",
    "/my-listings",
    "/profile",
    "/questions",
    "/saved-searches",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      // Explicit allow for AI answer-engine crawlers — same public surface,
      // stated per-agent so the intent is unambiguous.
      ...AI_CRAWLERS.map((agent) => ({
        userAgent: agent,
        allow: "/",
        disallow,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
