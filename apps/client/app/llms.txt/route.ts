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

### Single-pair conversion pages

Dedicated converter pages under /convertor/{from}-to-{to} with exact factors, two-way lookup tables and FAQs. Key examples:

- [Ropani to Square Feet](${SITE_URL}/convertor/ropani-to-square-feet): 1 Ropani = 5,476 sq ft (16 Aana).
- [Aana to Square Feet](${SITE_URL}/convertor/aana-to-square-feet): 1 Aana = 342.25 sq ft.
- [Katha to Square Feet](${SITE_URL}/convertor/katha-to-square-feet): 1 Katha = 364.5 sq ft.
- [Bigha to Square Feet](${SITE_URL}/convertor/bigha-to-square-feet): 1 Bigha = 7,290 sq ft (20 Katha).
- [Dhur to Square Feet](${SITE_URL}/convertor/dhur-to-square-feet): 1 Dhur = 18.225 sq ft.
- [Bigha to Katha](${SITE_URL}/convertor/bigha-to-katha): 1 Bigha = 20 Katha.
- [Ropani to Bigha](${SITE_URL}/convertor/ropani-to-bigha): cross-system hill ↔ Terai bridge.
- [Aana to Square Meters](${SITE_URL}/convertor/aana-to-square-meters): 1 Aana ≈ 31.80 sq m.
- All ~52 pairs are linked from [the converter hub](${SITE_URL}/convertor).

## Services

- [NRN Concierge](${SITE_URL}/nrn-concierge): End-to-end remote land purchase for Non-Resident Nepalis — eligibility assessment, Power of Attorney filing, cadastral title verification and escrow settlement, no travel required.

## Trust & reference

- [About MALPOTH](${SITE_URL}/about): Nepal's first institutional land archive — verification methodology, story and leadership.
- [Land Act Compliance](${SITE_URL}/legal/land-act-compliance): How listings comply with the Lands Act 2021, Civil Code ownership provisions and cadastral verification standards.
- [Area Guides](${SITE_URL}/area-guid): Cadastral-cleared land records by district — road access, verification tier and ownership history.

## Area guides by district

Programmatic district pages with live verified-inventory counts and price ranges (all 77 districts of Nepal under /area-guid/{district}):

- [Kathmandu](${SITE_URL}/area-guid/kathmandu)
- [Lalitpur](${SITE_URL}/area-guid/lalitpur)
- [Bhaktapur](${SITE_URL}/area-guid/bhaktapur)
- [Kaski (Pokhara)](${SITE_URL}/area-guid/kaski)
- [Chitwan](${SITE_URL}/area-guid/chitwan)
- [Morang (Biratnagar)](${SITE_URL}/area-guid/morang)
- [Rupandehi (Butwal)](${SITE_URL}/area-guid/rupandehi)
- [Jhapa](${SITE_URL}/area-guid/jhapa)

## Live precious metals market

Real-time NPR & USD prices for 9 assets, updated continuously — spot rates, historical charts, bid/ask spreads and unit converters (including traditional Nepali units: 1 tola = 11.6638 g, 16 anna, 64 sukhi):

- [Gold Price Today](${SITE_URL}/gold): Live gold rate with official Nepali market rate.
- [Silver Price Today](${SITE_URL}/silver): Live silver rate per tola, gram and ounce.
- [Platinum Price Today](${SITE_URL}/platinum)
- [Palladium Price Today](${SITE_URL}/palladium)
- [Bitcoin Price Today](${SITE_URL}/bitcoin)
- [Ethereum Price Today](${SITE_URL}/ethereum)
- [Copper Price Today](${SITE_URL}/copper)
- [Diamond Price Today](${SITE_URL}/diamond): Per-carat rates.
- [Steel Price Today](${SITE_URL}/steel): Per-ton construction steel rates.
- [Compare Metals](${SITE_URL}/metals/compare): Side-by-side price and performance comparison.

Unit-rate pages (gold & silver quoted in every supported unit):

- [Gold Price per Tola](${SITE_URL}/gold/tola) · [per Anna](${SITE_URL}/gold/anna) · [per Sukhi](${SITE_URL}/gold/sukhi) · [per Gram](${SITE_URL}/gold/gram) · [per Kilo](${SITE_URL}/gold/kilo) · [per Troy Ounce](${SITE_URL}/gold/oz)
- [Silver Price per Tola](${SITE_URL}/silver/tola) · [per Anna](${SITE_URL}/silver/anna) · [per Sukhi](${SITE_URL}/silver/sukhi) · [per Gram](${SITE_URL}/silver/gram) · [per Kilo](${SITE_URL}/silver/kilo) · [per Troy Ounce](${SITE_URL}/silver/oz)

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
