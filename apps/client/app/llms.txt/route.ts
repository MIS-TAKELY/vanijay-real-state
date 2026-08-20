import { SITE_URL } from "lib/site";

/**
 * /llms.txt — machine-readable context file for AI systems (llmstxt.org).
 * Gives LLMs and AI search engines (ChatGPT, Perplexity, Claude, Copilot)
 * a fast, parseable overview of what MALPOTH is and where the citable
 * content lives, without requiring them to crawl and render the site.
 *
 * Not required for Google AI Overviews, but materially helps non-Google
 * answer engines extract and cite the site.
 */

export const dynamic = "force-static";

const content = `# MALPOTH — Verified Land & Property Archive

> MALPOTH is Nepal's archive of record for land and property. Every listing is field-verified and cross-referenced against the official cadastral record (Naksa) and the Malpot land ownership ledger before publication. The archive covers land, residential, commercial, industrial and institutional property across 74 districts of Nepal, with zero title disputes.

## Key facts

- Founded: 2024, Kathmandu, Nepal
- Coverage: 74 districts indexed, 12,000+ verified listings
- Verification: 100% field-verified; cadastral-cleared before publication
- Land units: 1 Aana = 342.25 sq ft (hill system); 1 Katha = 364.5 sq ft (Terai system); 1 Ropani = 16 Aana; 1 Bigha = 20 Katha

## Listing categories

- [Land for Sale in Nepal](${SITE_URL}/category/land): Residential, commercial and agricultural plots with verified boundaries, road access and ownership history.
- [Residential Properties for Sale in Nepal](${SITE_URL}/category/residential): Houses, apartments and townhouses across Kathmandu Valley and beyond.
- [Commercial Properties for Sale in Nepal](${SITE_URL}/category/commercial): Offices, retail spaces and hospitality assets in Nepal's business districts.
- [Industrial Properties for Sale in Nepal](${SITE_URL}/category/industrial): Warehouses, production facilities and logistics land with verified zoning and title.
- [Special Purpose Properties for Sale in Nepal](${SITE_URL}/category/institutional): Healthcare, education and community facilities with completed entitlement checks.
- [Search all verified listings](${SITE_URL}/search): Filter by district, municipality, price, area, facing and road access.

## Free tools

- [Land Unit Converter](${SITE_URL}/convertor): Instant, exact conversions between Nepali land units (Ropani, Aana, Paisa, Daam, Bigha, Katha, Dhur) and international units (sq ft, sq m, sq yd, acre, hectare).
- [Compare Properties](${SITE_URL}/compare): Side-by-side comparison of verified listings — price, area, road access, facing and verification status.

## Services

- [NRN Concierge](${SITE_URL}/nrn-concierge): End-to-end remote land purchase for Non-Resident Nepalis — eligibility assessment, Power of Attorney filing, cadastral title verification and escrow settlement, no travel required.

## Trust & reference

- [About MALPOTH](${SITE_URL}/about): Nepal's first institutional land archive — verification methodology, story and leadership.
- [Land Act Compliance](${SITE_URL}/legal/land-act-compliance): How listings comply with the Lands Act 2021, Civil Code ownership provisions and cadastral verification standards.
- [Area Guides](${SITE_URL}/area-guid): Cadastral-cleared land records by district — road access, verification tier and ownership history.

## Sitemap

- [XML Sitemap](${SITE_URL}/sitemap.xml): All live listing detail pages use clean /{slug} URLs.
`;

export function GET() {
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
