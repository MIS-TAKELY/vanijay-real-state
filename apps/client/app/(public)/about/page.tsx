import type { Metadata } from "next";
import { CTA, Hero, Leadership, Stats, Story, Timeline, Values } from "components/pages/about";

const PAGE_URL = "https://lekhaprati.com/about";

export const metadata: Metadata = {
  title: "About Lekhaprati | Nepal's Verified Land & Property Archive",
  description:
    "Lekhaprati is Nepal's first institutional land archive. Learn how we eliminate title disputes through rigorous field verification, cadastral cross-referencing, and legal transparency.",
  keywords: [
    "about Lekhaprati",
    "Nepal land archive",
    "verified property Nepal",
    "land title verification",
    "real estate transparency",
    "cadastral records Nepal",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Lekhaprati | Nepal's Verified Land & Property Archive",
    description:
      "Nepal's first institutional land archive. Professionalizing real estate through rigorous field verification and legal transparency.",
    url: PAGE_URL,
    siteName: "Lekhaprati",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Lekhaprati | Nepal's Verified Land & Property Archive",
    description:
      "Nepal's first institutional land archive — rigorous field verification, cadastral cross-referencing, zero title disputes.",
  },
  robots: { index: true, follow: true },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Lekhaprati",
  url: "https://lekhaprati.com",
  description:
    "Nepal's first institutional land archive. Professionalizing real estate through rigorous field verification and legal transparency.",
  foundingDate: "2024",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Durbar Marg",
    addressLocality: "Kathmandu",
    addressCountry: "NP",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "info@lekhaprati.com",
    contactType: "customer service",
  },
  sameAs: [],
};

const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Lekhaprati — Nepal's Land Archive",
  description:
    "Learn how Lekhaprati eliminates title disputes through field verification, cadastral cross-referencing, and legal transparency.",
  mainEntity: { "@type": "Organization", name: "Lekhaprati" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://lekhaprati.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "About",
      item: PAGE_URL,
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main>
        <Hero />
        <Story />
        <Values />
        <Timeline />
        <Stats />
        <Leadership />
        <CTA />
      </main>
    </>
  );
}