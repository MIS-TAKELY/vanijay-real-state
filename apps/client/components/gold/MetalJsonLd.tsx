import { METAL_META, type MetalId } from "../../constants/gold/metals";
import { SITE_URL } from "lib/site";

/**
 * Server-rendered entity schema for a metal landing page: BreadcrumbList
 * (Home → Metals → Metal) plus a WebPage node tying the URL into the site
 * graph. Rendered on the server so crawlers see it without JS — complements
 * the client-rendered FAQPage schema emitted by FAQAccordion.
 */
export function MetalJsonLd({ metalId }: { metalId: MetalId }) {
  const meta = METAL_META[metalId];
  if (!meta) return null;

  const url = `${SITE_URL}/${metalId}`;
  const name = `${meta.name} — Live ${meta.name} Price`;

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

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name,
    description: meta.description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "Product",
      name: meta.name,
      description: meta.description,
    },
    breadcrumb: { "@id": `${url}#breadcrumb` },
    inLanguage: "en",
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
    </>
  );
}