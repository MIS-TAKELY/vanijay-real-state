import { cache } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Icon,
} from "@repo/ui";
import { CATEGORY_CATALOG } from "constants/category-catalog";
import {
  DISTRICT_CATALOG,
  getDistrictBySlug,
  TIER_META,
  TOPOGRAPHY_META,
  type DistrictEntry,
} from "constants/district-catalog";
import { fetchFeedPageGraphql, type FeedPage } from "lib/api/services/properties";
import {
  formatLocation,
  formatNPR,
  labelEnum,
  TYPE_LABELS,
  type ApiProperty,
} from "lib/api/services/properties/types";
import { buildHreflang, ogLocaleFor } from "lib/i18n";
import { SITE_URL } from "lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 3600;

type PageProps = { params: Promise<{ district: string }> };

/** One Aana = 342.25 sq ft (hill system) — used to derive missing rates. */
const SQFT_PER_AANA = 342.25;

/* ──────────────────────────────────────────────────────────────────────
 * DATA LOADING
 * ────────────────────────────────────────────────────────────────────── */

/**
 * Cached per-request loader so generateMetadata and the page share one API
 * call. Falls back to an empty feed on failure so the page still renders
 * (and degrades to noindex) instead of erroring.
 */
const loadDistrictFeed = cache(
  async (districtName: string): Promise<FeedPage> => {
    try {
      return await fetchFeedPageGraphql({ first: 24, district: districtName });
    } catch {
      return { items: [], nextCursor: null, hasMore: false };
    }
  },
);

interface DistrictStats {
  count: number;
  minPrice: number | null;
  maxPrice: number | null;
  avgPrice: number | null;
  /** Average derived NPR per Aana across listings with enough data. */
  avgPricePerAana: number | null;
  categories: Array<{ name: string; slug: string; count: number }>;
  municipalities: string[];
}

function pricePerAanaOf(p: ApiProperty): number | null {
  if (p.pricePerAana && p.pricePerAana > 0) return p.pricePerAana;
  const sqFt = p.landArea?.totalSqFt;
  if (sqFt && sqFt >= SQFT_PER_AANA) {
    return Math.round(p.askingPrice / (sqFt / SQFT_PER_AANA));
  }
  return null;
}

function computeStats(items: ApiProperty[]): DistrictStats {
  if (items.length === 0) {
    return {
      count: 0,
      minPrice: null,
      maxPrice: null,
      avgPrice: null,
      avgPricePerAana: null,
      categories: [],
      municipalities: [],
    };
  }

  const prices = items.map((p) => p.askingPrice).filter((v) => v > 0);
  const rates = items
    .map(pricePerAanaOf)
    .filter((v): v is number => v != null && v > 0);

  const catCounts = new Map<string, number>();
  for (const p of items) {
    const entry = CATEGORY_CATALOG.find(
      (c) => c.mainCategory === p.mainCategory,
    );
    const key = entry ? entry.slug : p.mainCategory.toLowerCase();
    catCounts.set(key, (catCounts.get(key) ?? 0) + 1);
  }
  const categories = [...catCounts.entries()]
    .map(([slugKey, count]) => ({
      slug: slugKey,
      count,
      name: CATEGORY_CATALOG.find((c) => c.slug === slugKey)?.title ?? slugKey,
    }))
    .sort((a, b) => b.count - a.count);

  const municipalities = [
    ...new Set(
      items
        .map((p) => p.location?.municipality?.trim())
        .filter((m): m is string => Boolean(m)),
    ),
  ].sort();

  return {
    count: items.length,
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
    avgPrice: prices.length
      ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      : null,
    avgPricePerAana: rates.length
      ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)
      : null,
    categories,
    municipalities,
  };
}

function compactNpr(n: number): string {
  if (n >= 10_000_000) return `Rs ${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000) return `Rs ${(n / 100_000).toFixed(1)} Lakh`;
  return formatNPR(n);
}

/* ──────────────────────────────────────────────────────────────────────
 * METADATA
 * ────────────────────────────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { district: slug } = await params;
  const district = getDistrictBySlug(slug);
  if (!district) {
    return {
      title: "Area guide not found | MALPOTH",
      robots: { index: false },
    };
  }

  // Thin-content guard: districts without any verified listing stay out of
  // the index until inventory exists (noindex,follow keeps link equity
  // flowing while avoiding thin/duplicate quality flags).
  const feed = await loadDistrictFeed(district.name);
  const hasListings = feed.items.length > 0;
  const canonical = `/area-guid/${district.slug}`;

  const title = hasListings
    ? `Land & Property for Sale in ${district.name} — Verified Records`
    : `${district.name} District Land Records — Area Guide`;
  const description = hasListings
    ? `${feed.items.length} field-verified land & property listings in ${district.name} district, Nepal. Cadastral-cleared titles, live price ranges and road-access data.`
    : `Cadastral-cleared land records for ${district.name} district, Nepal. Verification status, coverage and neighbouring districts.`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: buildHreflang(canonical),
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonical}`,
      siteName: "MALPOTH",
      type: "website",
      ...ogLocaleFor(),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: hasListings
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        }
      : { index: false, follow: true },
  };
}

/* ──────────────────────────────────────────────────────────────────────
 * JSON-LD STRUCTURED DATA
 * ────────────────────────────────────────────────────────────────────── */

const pageUrl = (slug: string) => `${SITE_URL}/area-guid/${slug}`;

const breadcrumbSchema = (district: DistrictEntry) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${pageUrl(district.slug)}#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Area Guides",
      item: `${SITE_URL}/area-guid`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: district.name,
      item: pageUrl(district.slug),
    },
  ],
});

const collectionSchema = (
  district: DistrictEntry,
  stats: DistrictStats,
  items: ApiProperty[],
) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${pageUrl(district.slug)}#collection`,
      url: pageUrl(district.slug),
      name: `Verified Land & Property Records — ${district.name} District`,
      description: `Field-verified land and property listings in ${district.name} district, Nepal.`,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
      mainEntity: { "@id": `${pageUrl(district.slug)}#itemlist` },
      breadcrumb: { "@id": `${pageUrl(district.slug)}#breadcrumb` },
      inLanguage: "en",
    },
    {
      "@type": "ItemList",
      "@id": `${pageUrl(district.slug)}#itemlist`,
      name: `Verified listings in ${district.name}`,
      numberOfItems: stats.count,
      itemListElement: items.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/${p.slug}`,
        name: p.title,
      })),
    },
  ],
});

const webPageSchema = (district: DistrictEntry, description: string) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${pageUrl(district.slug)}#webpage`,
  url: pageUrl(district.slug),
  name: `${district.name} District Land & Property Records | MALPOTH`,
  description,
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  mainEntity: { "@id": `${pageUrl(district.slug)}#collection` },
  breadcrumb: { "@id": `${pageUrl(district.slug)}#breadcrumb` },
  inLanguage: "en",
});

const faqSchema = (
  districtSlug: string,
  qa: Array<{ q: string; a: string }>,
) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${pageUrl(districtSlug)}#faq`,
  mainEntity: qa.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});

/* ──────────────────────────────────────────────────────────────────────
 * PAGE
 * ────────────────────────────────────────────────────────────────────── */

export function generateStaticParams() {
  return DISTRICT_CATALOG.map((d) => ({ district: d.slug }));
}

export default async function DistrictAreaGuidePage({ params }: PageProps) {
  const { district: slug } = await params;
  const district = getDistrictBySlug(slug);
  if (!district) notFound();

  const feed = await loadDistrictFeed(district.name);
  const stats = computeStats(feed.items);
  const siblings = DISTRICT_CATALOG.filter(
    (d) => d.province === district.province && d.slug !== district.slug,
  );
  const hasListings = stats.count > 0;

  const priceRangeText =
    stats.minPrice != null && stats.maxPrice != null
      ? `${compactNpr(stats.minPrice)} – ${compactNpr(stats.maxPrice)}`
      : "Not yet available";

  const rateText =
    stats.avgPricePerAana != null
      ? `${compactNpr(stats.avgPricePerAana)} / Aana`
      : "Not yet available";

  /* FAQ copy is generated from the same live numbers shown on the page, so
   * every district answers differently (unique value, not swapped vars). */
  const faqItems: Array<{ q: string; a: string }> = [
    {
      q: `How much does land cost in ${district.name} district?`,
      a:
        stats.avgPricePerAana != null
          ? `Among MALPOTH's ${stats.count} currently verified listings in ${district.name}, listed prices run from ${compactNpr(stats.minPrice ?? 0)} to ${compactNpr(stats.maxPrice ?? 0)}, averaging roughly ${compactNpr(stats.avgPricePerAana)} per Aana. Every price is taken from the seller's asking price at publication and re-checked during field verification.`
          : `There are not yet enough verified listings in ${district.name} to quote a reliable average. As MALPOTH's field team verifies parcels in this district, live price ranges will appear here.`,
    },
    {
      q: `Are property titles in ${district.name} verified?`,
      a: `Yes. Every listing published for ${district.name} is cross-referenced against the official cadastral record (Naksa) and the Malpot land ownership ledger before going live. Listings carry their verification tier so you can see exactly what was checked.`,
    },
    {
      q: `Which areas of ${district.name} have verified listings?`,
      a:
        stats.municipalities.length > 0
          ? `Current verified listings cover ${stats.municipalities.slice(0, 6).join(", ")}. Use the search filters to narrow by municipality and ward.`
          : `No municipalities in ${district.name} have verified listings yet. Check back as new parcels complete verification.`,
    },
    {
      q: `Can non-resident Nepalis (NRNs) buy land in ${district.name}?`,
      a: `NRNs can purchase land in Nepal subject to NRB residency rules and land-ceiling limits that apply nationwide, including ${district.name}. MALPOTH's NRN Concierge handles eligibility assessment, Power of Attorney filing and cadastral verification remotely.`,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(district)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema(district, stats, feed.items)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            webPageSchema(
              district,
              `Field-verified land and property listings in ${district.name} district, Nepal.`,
            ),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema(district.slug, faqItems)),
        }}
      />

      <main className="flex flex-col">
        {/* ── Hero ── */}
        <section className="border-b border-outline-variant bg-surface-container">
          <div className="mx-auto max-w-container-max px-gutter py-xl">
            <nav aria-label="Breadcrumb" className="mb-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/area-guid">Area Guides</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{district.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </nav>
            <p className="mb-2 font-label-sm text-[11px] font-bold uppercase tracking-[0.8px] text-primary">
              Area Guide — {district.province} Province
            </p>
            <h1 className="font-headline-md text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
              Land &amp; Property Records in {district.name} District
            </h1>
            <p className="mt-4 max-w-3xl leading-relaxed text-on-surface-variant">
              {hasListings ? (
                <>
                  MALPOTH currently holds{" "}
                  <strong className="text-navy">{stats.count}</strong>{" "}
                  field-verified {stats.count === 1 ? "listing" : "listings"} in{" "}
                  {district.name} district. Every parcel below was
                  cross-referenced against the cadastral record (Naksa) and the
                  Malpot ledger before publication — zero title disputes.
                </>
              ) : (
                <>
                  Our field team is actively verifying parcels across{" "}
                  {district.name} district. Verified listings will appear here
                  as they clear cadastral checks. Meanwhile, browse the
                  neighbouring districts below that already hold verified
                  inventory.
                </>
              )}
            </p>
          </div>
        </section>

        {/* ── Market stats strip ── */}
        <section className="border-b border-outline-variant">
          <div className="mx-auto grid max-w-container-max grid-cols-2 gap-px bg-outline-variant px-gutter py-xl sm:grid-cols-4">
            {[
              { label: "Verified Listings", value: String(stats.count) },
              { label: "Price Range", value: priceRangeText },
              { label: "Avg. Rate", value: rateText },
              {
                label: "Municipalities Covered",
                value: String(stats.municipalities.length),
              },
            ].map((s) => (
              <div key={s.label} className="bg-surface px-4 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-on-surface-variant">
                  {s.label}
                </p>
                <p className="mono-stat mt-1 text-lg font-semibold text-navy">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── District profile — curated catalog metadata ── */}
        <section className="border-b border-outline-variant">
          <div className="mx-auto max-w-container-max px-gutter py-xl">
            <h2 className="font-headline-md mb-4 text-xl font-semibold tracking-tight text-navy">
              District Profile
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-outline-variant bg-surface p-5">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.5px] text-on-surface-variant">
                  Topography
                </p>
                <p className="mt-1.5 flex items-center gap-2 font-medium text-navy">
                  <Icon
                    name={TOPOGRAPHY_META[district.topography].icon}
                    className="text-[18px] text-primary/70"
                  />
                  {TOPOGRAPHY_META[district.topography].label}
                </p>
              </div>
              <div className="rounded-2xl border border-outline-variant bg-surface p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-on-surface-variant">
                  Verification Tier
                </p>
                <Badge
                  variant="outline"
                  className="mt-2 border-primary/30 bg-secondary-container text-primary"
                >
                  {district.tier === "cadastral" && (
                    <Icon name="verified" className="text-[12px]" />
                  )}
                  {TIER_META[district.tier].shortLabel}
                </Badge>
              </div>
              <div className="rounded-2xl border border-outline-variant bg-surface p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-on-surface-variant">
                  Indicative Base Rate
                </p>
                <p className="mono-stat mt-1 text-lg font-semibold text-navy">
                  {stats.avgPricePerAana != null
                    ? `${compactNpr(stats.avgPricePerAana)} / Aana`
                    : district.avgRatePerAana != null
                      ? `${compactNpr(district.avgRatePerAana)} / Aana*`
                      : "Awaiting survey"}
                </p>
              </div>
              <div className="rounded-2xl border border-outline-variant bg-surface p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-on-surface-variant">
                  Market Trend
                </p>
                <p
                  className={`mono-stat mt-1 flex items-center gap-1 text-lg font-semibold ${
                    district.trendPct == null
                      ? "text-on-surface-variant"
                      : district.trendPct > 0
                        ? "text-primary"
                        : "text-error"
                  }`}
                >
                  {district.trendPct != null && district.trendPct > 0 && (
                    <Icon name="trending_up" className="text-[18px]" />
                  )}
                  {district.trendPct != null && district.trendPct <= 0 && (
                    <Icon name="trending_down" className="text-[18px]" />
                  )}
                  {district.trendPct == null
                    ? "Stable / No data"
                    : `${district.trendPct > 0 ? "+" : ""}${district.trendPct}% YOY`}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              {district.description}
              {district.avgRatePerAana != null &&
                stats.avgPricePerAana == null && (
                  <span className="mt-1 block text-[11px] italic">
                    * Curated indicative figure from MALPOTH&apos;s district
                    survey — no live verified listings yet.
                  </span>
                )}
            </p>
          </div>
        </section>

        {/* ── Category mix + municipalities ── */}
        {(stats.categories.length > 0 || stats.municipalities.length > 0) && (
          <section className="border-b border-outline-variant">
            <div className="mx-auto max-w-container-max px-gutter py-xl">
              {stats.categories.length > 0 && (
                <>
                  <h2 className="font-headline-md mb-4 text-xl font-semibold tracking-tight text-navy">
                    Property Types in {district.name}
                  </h2>
                  <div className="mb-8 flex flex-wrap gap-2">
                    {stats.categories.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/category/${c.slug}`}
                        className="rounded-md bg-surface-container px-3 py-1.5 text-sm font-medium text-navy transition-colors hover:bg-primary hover:text-on-primary"
                      >
                        {c.name} ({c.count})
                      </Link>
                    ))}
                  </div>
                </>
              )}
              {stats.municipalities.length > 0 && (
                <>
                  <h2 className="font-headline-md mb-4 text-xl font-semibold tracking-tight text-navy">
                    Areas Covered
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {stats.municipalities.map((m) => (
                      <Link
                        key={m}
                        href={`/search?dist=${encodeURIComponent(district.name)}&mun=${encodeURIComponent(m)}`}
                        className="rounded-md border border-outline-variant px-3 py-1.5 text-sm text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                      >
                        {m}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* ── Verified listings grid ── */}
        {hasListings && (
          <section className="border-b border-outline-variant">
            <div className="mx-auto max-w-container-max px-gutter py-xl">
              <h2 className="font-headline-md mb-6 text-xl font-semibold tracking-tight text-navy">
                Verified Listings in {district.name}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {feed.items.map((p) => (
                  <Link
                    key={p.id}
                    href={`/${p.slug}`}
                    className="group rounded-sm bg-surface shadow-xs transition-shadow hover:shadow-md"
                  >
                    <div className="border-b border-outline-variant px-5 py-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.5px] text-primary">
                        {labelEnum(p.subCategory, TYPE_LABELS)}
                      </p>
                      <h3 className="mt-1 line-clamp-2 font-headline-md font-semibold text-navy group-hover:text-primary">
                        {p.title}
                      </h3>
                    </div>
                    <div className="flex items-end justify-between px-5 py-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-on-surface-variant">
                          Asking Price
                        </p>
                        <p className="mono-stat text-base font-semibold text-navy">
                          {formatNPR(p.askingPrice)}
                        </p>
                      </div>
                      <p className="max-w-[55%] truncate text-right text-[12px] text-on-surface-variant">
                        {p.location ? formatLocation(p.location) : district.name}
                      </p>
                    </div>
                    <div className="border-t border-outline-variant px-5 py-2.5">
                      <span className="text-[11px] font-semibold tracking-[0.4px] text-primary flex items-center gap-1 transition-transform duration-200 group-hover:translate-x-1">
                        View Details →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <p className="mt-6 text-sm text-on-surface-variant">
                Looking for more options?{" "}
                <Link
                  href={`/search?dist=${encodeURIComponent(district.name)}`}
                  className="font-medium text-primary hover:underline"
                >
                  Search all listings in {district.name}
                </Link>
              </p>
            </div>
          </section>
        )}

        {/* ── FAQ (mirrors FAQPage schema above) ── */}
        <section className="border-b border-outline-variant">
          <div className="mx-auto max-w-container-max px-gutter py-xl">
            <h2 className="font-headline-md mb-6 text-xl font-semibold tracking-tight text-navy">
              FAQs — {district.name} Property
            </h2>
            <Accordion
              type="single"
              collapsible
              className="rounded-sm border border-outline-variant bg-surface shadow-xs"
            >
              {faqItems.map((f, i) => (
                <AccordionItem
                  key={f.q}
                  value={`faq-${i}`}
                  className="border-outline-variant px-5 last:border-b-0"
                >
                  <AccordionTrigger className="text-left font-medium text-navy">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-on-surface-variant">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── Spoke cross-links: sibling districts in the province ── */}
        {siblings.length > 0 && (
          <section>
            <div className="mx-auto max-w-container-max px-gutter py-xl">
              <h2 className="font-headline-md mb-4 text-xl font-semibold tracking-tight text-navy">
                Other {district.province} Province Districts
              </h2>
              <div className="flex flex-wrap gap-2">
                {siblings.map((d) => (
                  <Link
                    key={d.slug}
                    href={`/area-guid/${d.slug}`}
                    className="rounded-md bg-surface-container px-3 py-1.5 text-sm text-on-surface-variant transition-colors hover:bg-primary hover:text-on-primary"
                  >
                    {d.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
