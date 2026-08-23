/**
 * Conversion-pair catalog — single source of truth for the programmatic
 * `/convertor/[pair]` pages ("Ropani to Square Feet", "Bigha to Katha", …).
 *
 * Every pair is expressed through the exact factors already defined in
 * `lib/land-units.ts`, so page content can never drift from the converter
 * tool itself. The list is CURATED (~50 pairs with genuine search demand),
 * NOT the full N×N matrix — over-generating low-demand combos would create
 * thin pages that dilute crawl budget.
 */

import {
  BIGHA_SYSTEM,
  ROPANI_SYSTEM,
  convertLand,
  formatLandNumber,
  type LandPartKey,
  type UnitKey,
} from "lib/land-units";

/* ------------------------------------------------------------------ */
/*  Unit display words                                                 */
/* ------------------------------------------------------------------ */

interface UnitWords {
  /** Title-case name used in headings, e.g. "Square Feet". */
  title: string;
  /** Plural form for prose, e.g. "square feet" / "Ropani". */
  plural: string;
  /** URL slug word, e.g. "square-feet". */
  slugWord: string;
}

const UNIT_WORDS: Record<UnitKey, UnitWords> = {
  ropani: { title: "Ropani", plural: "Ropani", slugWord: "ropani" },
  aana: { title: "Aana", plural: "Aana", slugWord: "aana" },
  paisa: { title: "Paisa", plural: "Paisa", slugWord: "paisa" },
  daam: { title: "Daam", plural: "Daam", slugWord: "daam" },
  bigha: { title: "Bigha", plural: "Bigha", slugWord: "bigha" },
  katha: { title: "Katha", plural: "Katha", slugWord: "katha" },
  dhur: { title: "Dhur", plural: "Dhur", slugWord: "dhur" },
  sqft: { title: "Square Feet", plural: "square feet", slugWord: "square-feet" },
  sqm: {
    title: "Square Meters",
    plural: "square meters",
    slugWord: "square-meters",
  },
  sqyd: {
    title: "Square Yards",
    plural: "square yards",
    slugWord: "square-yards",
  },
  acre: { title: "Acres", plural: "acres", slugWord: "acre" },
  hectare: { title: "Hectares", plural: "hectares", slugWord: "hectare" },
  sqkm: {
    title: "Square Kilometers",
    plural: "square kilometers",
    slugWord: "square-kilometers",
  },
};

/* ------------------------------------------------------------------ */
/*  Curated pair specs                                                 */
/* ------------------------------------------------------------------ */

/** [from, to] tuples with genuine search demand. */
const PAIR_SPECS: Array<[UnitKey, UnitKey]> = [
  /* Ropani (hill system) → … */
  ["ropani", "sqft"],
  ["ropani", "sqm"],
  ["ropani", "aana"],
  ["ropani", "paisa"],
  ["ropani", "bigha"],
  ["ropani", "katha"],
  ["ropani", "dhur"],
  ["ropani", "acre"],
  /* Aana → … */
  ["aana", "sqft"],
  ["aana", "sqm"],
  ["aana", "ropani"],
  ["aana", "paisa"],
  ["aana", "katha"],
  ["aana", "dhur"],
  /* Paisa / Daam → … */
  ["paisa", "sqft"],
  ["paisa", "aana"],
  ["daam", "sqft"],
  ["daam", "aana"],
  /* Bigha (Terai system) → … */
  ["bigha", "katha"],
  ["bigha", "sqft"],
  ["bigha", "sqm"],
  ["bigha", "dhur"],
  ["bigha", "ropani"],
  ["bigha", "aana"],
  ["bigha", "acre"],
  ["bigha", "hectare"],
  /* Katha → … */
  ["katha", "sqft"],
  ["katha", "sqm"],
  ["katha", "bigha"],
  ["katha", "dhur"],
  ["katha", "aana"],
  ["katha", "ropani"],
  /* Dhur → … */
  ["dhur", "sqft"],
  ["dhur", "katha"],
  ["dhur", "bigha"],
  ["dhur", "sqm"],
  /* International → Nepali */
  ["sqft", "sqm"],
  ["sqft", "aana"],
  ["sqft", "katha"],
  ["sqft", "ropani"],
  ["sqft", "dhur"],
  ["sqm", "sqft"],
  ["sqm", "aana"],
  ["sqm", "katha"],
  ["sqm", "ropani"],
  ["acre", "ropani"],
  ["acre", "bigha"],
  ["acre", "aana"],
  ["acre", "hectare"],
  ["hectare", "bigha"],
  ["hectare", "ropani"],
  ["hectare", "acre"],
];

/* ------------------------------------------------------------------ */
/*  Derived catalog                                                    */
/* ------------------------------------------------------------------ */

/** How a pair is grouped on the hub directory + related links. */
export type PairGroup =
  | "within-hill"
  | "within-terai"
  | "cross-system"
  | "nepali-international"
  | "international-nepali";

export interface ConversionPair {
  slug: string;
  from: UnitKey;
  to: UnitKey;
  group: PairGroup;
}

function isNepali(key: UnitKey): boolean {
  return (
    ROPANI_SYSTEM.includes(key as LandPartKey) ||
    BIGHA_SYSTEM.includes(key as LandPartKey)
  );
}

function groupOf(from: UnitKey, to: UnitKey): PairGroup {
  const fNep = isNepali(from);
  const tNep = isNepali(to);
  if (!fNep && !tNep) {
    // International ↔ international pairs ride along as their own bucket;
    // classify by which Nepali system they are most often paired against.
    return "international-nepali";
  }
  if (fNep && tNep) {
    const fHill = ROPANI_SYSTEM.includes(from as LandPartKey);
    const tHill = ROPANI_SYSTEM.includes(to as LandPartKey);
    if (fHill && tHill) return "within-hill";
    if (!fHill && !tHill) return "within-terai";
    return "cross-system";
  }
  return fNep ? "nepali-international" : "international-nepali";
}

export const CONVERSION_PAIRS: ConversionPair[] = PAIR_SPECS.map(
  ([from, to]) => ({
    slug: `${UNIT_WORDS[from].slugWord}-to-${UNIT_WORDS[to].slugWord}`,
    from,
    to,
    group: groupOf(from, to),
  }),
);

const BY_SLUG = new Map(CONVERSION_PAIRS.map((p) => [p.slug, p]));

export function getConversionBySlug(slug: string): ConversionPair | undefined {
  return BY_SLUG.get(slug);
}

export function pairTitleWords(pair: ConversionPair): {
  from: UnitWords;
  to: UnitWords;
} {
  return { from: UNIT_WORDS[pair.from], to: UNIT_WORDS[pair.to] };
}

export function conversionPath(slug: string): string {
  return `/convertor/${slug}`;
}

export function reversePair(pair: ConversionPair): ConversionPair | undefined {
  return getConversionBySlug(
    `${UNIT_WORDS[pair.to].slugWord}-to-${UNIT_WORDS[pair.from].slugWord}`,
  );
}

/**
 * Related conversions for internal linking: other targets of the same source
 * first (strongest topical adjacency), then same-target pages, then the
 * reverse direction when present.
 */
export function relatedPairs(
  pair: ConversionPair,
  limit = 6,
): ConversionPair[] {
  const out: ConversionPair[] = [];
  const seen = new Set([pair.slug]);

  const push = (p?: ConversionPair | null) => {
    if (p && !seen.has(p.slug) && out.length < limit) {
      seen.add(p.slug);
      out.push(p);
    }
  };

  // Reverse direction (highest value cross-link).
  push(reversePair(pair));

  // Other targets from the same source unit, in catalog order.
  for (const p of CONVERSION_PAIRS) {
    if (out.length >= limit) break;
    if (p.from === pair.from && p.to !== pair.to) push(p);
  }

  // Same target from sibling sources within the same grouping family.
  for (const p of CONVERSION_PAIRS) {
    if (out.length >= limit) break;
    if (p.to === pair.to && p.from !== pair.from && p.group === pair.group) {
      push(p);
    }
  }

  return out;
}

/* ------------------------------------------------------------------ */
/*  Content generation                                                 */
/* ------------------------------------------------------------------ */

/** Exact forward factor, formatted for display (e.g. "5,476"). */
export function pairFactor(pair: ConversionPair): string {
  return formatLandNumber(convertLand(1, pair.from, pair.to));
}

/** Exact reverse factor, formatted for display. */
export function pairReverseFactor(pair: ConversionPair): string {
  return formatLandNumber(convertLand(1, pair.to, pair.from));
}

/** SEO keyword set for the pair's metadata. */
export function pairKeywords(pair: ConversionPair): string[] {
  const f = UNIT_WORDS[pair.from];
  const t = UNIT_WORDS[pair.to];
  const fl = f.title.toLowerCase();
  const tl = t.title.toLowerCase();
  return [
    `${fl} to ${tl}`,
    `1 ${fl} in ${tl}`,
    `how many ${t.plural} in 1 ${fl}`,
    `${fl} to ${tl} converter`,
    `${fl} to ${tl} conversion Nepal`,
    `nepal land measurement ${fl} ${tl}`,
  ];
}

/** Page <title>. The root layout template appends the "- MALPOTH" suffix. */
export function pairMetaTitle(pair: ConversionPair): string {
  const { from, to } = pairTitleWords(pair);
  return `${from.title} to ${to.title} Converter — Exact Nepal Land Units`;
}

/** Page meta description, includes the exact factor for SERP snippets. */
export function pairMetaDescription(pair: ConversionPair): string {
  const { from, to } = pairTitleWords(pair);
  return `Convert ${from.title.toLowerCase()} to ${to.plural} instantly: 1 ${from.title} = ${pairFactor(pair)} ${to.plural}. Free exact converter with tables, reverse conversion and FAQs.`;
}

/**
 * Unique intro paragraphs. Copy varies by GROUP (hill vs Terai vs
 * international) so pages read differently across buckets, while every
 * number on the page is computed from the exact unit factors.
 */
export function pairIntro(pair: ConversionPair): string[] {
  const { from, to } = pairTitleWords(pair);
  const factor = pairFactor(pair);

  switch (pair.group) {
    case "within-hill":
      return [
        `${from.title} and ${to.title} belong to Nepal's Ropani–Aana–Paisa–Daam system — the standard land measurement across the country's hill regions, including Kathmandu Valley. Because the sub-unit ratios inside the system are fixed by definition, converting between them is exact: 1 ${from.title} = ${factor} ${to.plural}.`,
        `On older Lalpurja transcripts and Malpot records, valley plots are frequently written in compound form (e.g. 4 Ropani 8 Aana), so being fluent in the internal ratios — 1 Ropani = 16 Aana, 1 Aana = 4 Paisa, 1 Paisa = 4 Daam — is essential when checking deed figures line by line.`,
      ];
    case "within-terai":
      return [
        `${from.title} and ${to.title} are part of the Bigha–Katha–Dhur system used throughout the Terai, Nepal's southern plains. The ratios never drift: 1 Bigha = 20 Katha and 1 Katha = 20 Dhur, which makes this conversion exact — 1 ${from.title} = ${factor} ${to.plural}.`,
        `Terai farmland is usually recorded in Bigha while individual residential plots trade in Katha or Dhur, so this pairing comes up constantly in plain-district deals from Jhapa to Kailali.`,
      ];
    case "cross-system":
      return [
        `${from.title} belongs to one traditional system and ${to.title} to the other — the hill regions (Kathmandu Valley included) measure in Ropani–Aana–Paisa–Daam while the Terai plains use Bigha–Katha–Dhur. The two systems share no common base, so an exact bridge matters: 1 ${from.title} = ${factor} ${to.plural}.`,
        `Buyers relocating between the hills and the plains hit this mismatch immediately: a Ropani (5,476 sq ft) is smaller than a Bigha (7,290 sq ft) even though both sound like "whole plot" units. Every figure on this page uses the exact factors behind MALPOTH's verified listings, so comparisons hold up.`,
      ];
    case "nepali-international":
      return [
        `${from.title} is a traditional Nepali land unit, and ${to.plural} is what banks, master plans and most foreign documents expect. Converting exactly — 1 ${from.title} = ${factor} ${to.plural} — keeps loan collateral reports, municipal drawings and overseas correspondence consistent with the Lalpurja.`,
        `This is one of the most-searched conversions in Nepal because asking rates are quoted per local unit while valuations arrive in metric or imperial terms. The tables below cover the everyday values so you do not have to recompute each time.`,
      ];
    case "international-nepali":
      return [
        `${from.title} is an international area unit, while land across Nepal is advertised in local terms — ${to.plural} in this case. The exact relationship is 1 ${from.title} = ${factor} ${to.plural}, so you can translate any foreign or technical document into the units sellers actually quote.`,
        `For NRNs and foreign-funded projects this conversion is routine: agricultural statistics report in hectares, construction documents in meters, yet every negotiation happens in Ropani, Aana, Katha or Dhur depending on the region.`,
      ];
  }
}

/** Per-page FAQ, generated from exact math + system context. */
export function pairFaq(pair: ConversionPair): Array<{ q: string; a: string }> {
  const { from, to } = pairTitleWords(pair);
  const fwd = pairFactor(pair);
  const rev = pairReverseFactor(pair);
  const fl = from.title.toLowerCase();
  const tl = to.plural;

  const items: Array<{ q: string; a: string }> = [
    {
      q: `How many ${tl} are there in 1 ${fl}?`,
      a: `1 ${from.title} equals exactly ${fwd} ${tl}. The factor comes from MALPOTH's registry constants (1 Aana = 342.25 sq ft, 1 Katha = 364.5 sq ft), so the result carries no rounding error beyond the digits shown.`,
    },
    {
      q: `How many ${fl} are there in 1 ${tl.replace(/^./, (c) => c.toUpperCase())}?`,
      a: `Working backwards, 1 ${to.title} equals exactly ${rev} ${from.plural.toLowerCase()}. The converter tool above handles any value in both directions instantly.`,
    },
    {
      q: "Is this conversion exact?",
      a: `Yes. All factors trace back to exact definitions — 1 Aana = 342.25 sq ft and 1 Katha = 364.5 sq ft — the same values used across MALPOTH's listing wizard and pricing engine. Results render to up to 10 significant digits.`,
    },
  ];

  switch (pair.group) {
    case "cross-system":
      items.push({
        q: `Which system do ${from.title} and ${to.title} belong to?`,
        a: `${from.title} and ${to.title} come from different traditional systems: Ropani–Aana–Paisa–Daam governs the hills (including Kathmandu Valley), while Bigha–Katha–Dhur governs the Terai plains. They are related only through their exact square-foot equivalents, which is why this converter exists.`,
      });
      break;
    case "within-hill":
      items.push({
        q: "How do Ropani, Aana, Paisa and Daam relate to each other?",
        a: "The hill system is fully decimal-free but fixed: 1 Ropani = 16 Aana, 1 Aana = 4 Paisa and 1 Paisa = 4 Daam. In square feet that is 1 Ropani = 5,476 sq ft and 1 Aana = 342.25 sq ft.",
      });
      break;
    case "within-terai":
      items.push({
        q: "How do Bigha, Katha and Dhur relate to each other?",
        a: "The Terai system is fixed at 1 Bigha = 20 Katha and 1 Katha = 20 Dhur. In square feet that is 1 Bigha = 7,290 sq ft and 1 Katha = 364.5 sq ft.",
      });
      break;
    case "nepali-international":
      items.push({
        q: `Where is the ${fl} used in Nepal?`,
        a:
          pair.from === "bigha" || pair.from === "katha" || pair.from === "dhur"
            ? "Bigha, Katha and Dhur are the everyday units of the Terai — the southern plains districts such as Morang, Rupandehi, Dang and Kailali — and appear directly on Terai Lalpurja deeds."
            : "Ropani, Aana, Paisa and Daam are the everyday units of the hilly regions, including all three cities of Kathmandu Valley, and appear directly on hill-region Lalpurja deeds.",
      });
      break;
    case "international-nepali":
      items.push({
        q: `Which Nepali region quotes prices in ${tl}?`,
        a:
          pair.to === "bigha" || pair.to === "katha" || pair.to === "dhur"
            ? "Katha, Bigha and Dhur dominate in the Terai plains — from Jhapa and Morang in the east through Rupandehi to Kanchanpur in the west."
            : "Ropani and its sub-units Aana, Paisa and Daam dominate in the hill regions, including Kathmandu, Lalitpur and Bhaktapur.",
      });
      break;
  }

  return items;
}

/** Multiplication-chain explanation shown under the answer block. */
export function pairFactorChain(pair: ConversionPair): string {
  const { from, to } = pairTitleWords(pair);
  const fwd = pairFactor(pair);

  if (pair.from === "sqft") {
    return `1 ${to.title} = ${formatLandNumber(convertLand(1, pair.to, "sqft"))} sq ft, therefore 1 sq ft = ${fwd} ${to.plural}.`;
  }
  if (pair.to === "sqft") {
    return `1 ${from.title} = ${fwd} sq ft — the product of the unit's exact definition (1 Aana = 342.25 sq ft, 1 Katha = 364.5 sq ft) and its position in its own system.`;
  }
  const fromSqFt = formatLandNumber(convertLand(1, pair.from, "sqft"));
  const toSqFt = formatLandNumber(convertLand(1, pair.to, "sqft"));
  return `1 ${from.title} = ${fromSqFt} sq ft and 1 ${to.title} = ${toSqFt} sq ft, so dividing the two gives 1 ${from.title} = ${fwd} ${to.plural}.`;
}
