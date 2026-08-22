import {
  CTA,
  Hero,
  Leadership,
  Stats,
  Story,
  Timeline,
  Values,
} from "components/real-state/pages/about";
import { buildHreflang, ogLocaleFor } from "lib/i18n";
import { SITE_URL } from "lib/site";
import type { Metadata } from "next";

const PAGE_URL = `${SITE_URL}/about`;

export const metadata: Metadata = {
  title: "About MALPOTH | Nepal's Verified Land & Property Archive",
  description:
    "MALPOTH is Nepal's first institutional land archive. Learn how we eliminate title disputes through rigorous field verification, cadastral cross-referencing, and legal transparency.",
  keywords: [
    "about MALPOTH",
    "Nepal land archive",
    "verified property Nepal",
    "land title verification",
    "real estate transparency",
    "cadastral records Nepal",
  ],
  alternates: {
    canonical: "/about",
    languages: buildHreflang("/about"),
  },
  openGraph: {
    title: "About MALPOTH | Nepal's Verified Land & Property Archive",
    description:
      "Nepal's first institutional land archive. Professionalizing real estate through rigorous field verification and legal transparency.",
    url: PAGE_URL,
    siteName: "MALPOTH",
    type: "website",
    ...ogLocaleFor(),
  },
  twitter: {
    card: "summary_large_image",
    title: "About MALPOTH | Nepal's Verified Land & Property Archive",
    description:
      "Nepal's first institutional land archive — rigorous field verification, cadastral cross-referencing, zero title disputes.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MALPOTH",
  url: SITE_URL,
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
    email: "hello@malpoth.com",
    contactType: "customer service",
  },
  sameAs: [],
};

const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About MALPOTH — Nepal's Land Archive",
  description:
    "Learn how MALPOTH eliminates title disputes through field verification, cadastral cross-referencing, and legal transparency.",
  mainEntity: { "@type": "Organization", name: "MALPOTH" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
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
