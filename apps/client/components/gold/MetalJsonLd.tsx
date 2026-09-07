import type { MetalId } from "../../constants/gold/metals";
import {
  FALLBACK_PRICES,
  METAL_META,
} from "../../constants/gold/metals";
import { METAL_FAQS } from "../../constants/gold/faq-data";
import { SITE_URL } from "lib/site";

/** Spot / official rate used for Dataset variableMeasured. */
export interface MetalOfferInput {
  /** Numeric price shown on the page (e.g. NPR per tola or per oz). */
  price: number;
  /** ISO 4217 currency code. Defaults to NPR. */
  priceCurrency?: string;
  /** Human unit for UnitPriceSpecification (tola, oz, coin, …). */
  unitText?: string;
  /** ISO date the quoted price remains valid through (defaults to tomorrow). */
  priceValidUntil?: string;
}

function defaultPriceValidUntil(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function resolveOffer(
  metalId: MetalId,
  offer?: MetalOfferInput | null,
): Required<MetalOfferInput> {
  const meta = METAL_META[metalId];
  const price =
    offer?.price && offer.price > 0 ? offer.price : FALLBACK_PRICES[metalId];
  return {
    price,
    priceCurrency: offer?.priceCurrency ?? "NPR",
    unitText: offer?.unitText ?? meta.unit,
    priceValidUntil: offer?.priceValidUntil ?? defaultPriceValidUntil(),
  };
}

/**
 * Server-rendered entity schema for a metal landing page: BreadcrumbList,
 * WebPage + Dataset (price quote — not merchant Product, since MALPOTH does
 * not sell physical metal), and FAQPage. Rendered on the server so crawlers
 * see it without JS.
 */
export function MetalJsonLd({
  metalId,
  offer,
}: {
  metalId: MetalId;
  offer?: MetalOfferInput | null;
}) {
  const meta = METAL_META[metalId];
  if (!meta) return null;

  const url = `${SITE_URL}/${metalId}`;
  const name = `Live ${meta.name} Price Today in Nepal`;
  const image = `${SITE_URL}/og-home.png`;
  const resolved = resolveOffer(metalId, offer);
  const priceString = Number(resolved.price.toFixed(2)).toString();

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Metals",
        item: `${SITE_URL}/gold`,
      },
      { "@type": "ListItem", position: 3, name: meta.name, item: url },
    ],
  };

  const dataset = {
    "@type": "Dataset",
    "@id": `${url}#dataset`,
    name: `${meta.name} price quote (${resolved.priceCurrency}/${resolved.unitText})`,
    description: meta.description,
    url,
    creator: { "@id": `${SITE_URL}/#organization` },
    temporalCoverage: resolved.priceValidUntil,
    variableMeasured: {
      "@type": "PropertyValue",
      name: `${meta.name} price per ${resolved.unitText}`,
      value: priceString,
      unitText: resolved.unitText,
      currency: resolved.priceCurrency,
    },
  };

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name,
    description: meta.description,
    primaryImageOfPage: { "@type": "ImageObject", url: image },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: { "@id": `${url}#dataset` },
    breadcrumb: { "@id": `${url}#breadcrumb` },
    inLanguage: "en",
  };

  const faqs = METAL_FAQS[metalId] ?? [];
  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${url}#faq`,
          mainEntity: faqs.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  const datasetGraph = {
    "@context": "https://schema.org",
    ...dataset,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetGraph) }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
    </>
  );
}
