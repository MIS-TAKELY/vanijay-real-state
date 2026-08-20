import type { Metadata } from "next";
import { Toaster } from "@repo/ui";
import { Suspense } from "react";
import { AuthModalListener } from "components/real-state/auth/AuthModalListener";
import { SITE_URL } from "lib/site";
import "./globals.css";

export const metadata: Metadata = {
  // Without metadataBase, relative canonicals (`alternates.canonical`) and
  // relative OG URLs resolve against the request host (www, staging, etc.).
  // Pin them all to the canonical public origin.
  metadataBase: new URL(SITE_URL),
  title: "MALPOTH | Verified Land & Property Archive",
  description: "The archive of record for legitimate land ownership in Nepal.",
};

/**
 * Site-wide entity schema — tells AI answer engines and search engines what
 * MALPOTH is (WebSite + SearchAction for sitelinks searchbox) and who runs it
 * (RealEstateAgent organization entity). Rendered on every page so the entity
 * is resolvable from any URL.
 */
const siteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "MALPOTH",
      description:
        "The archive of record for legitimate land ownership in Nepal — field-verified land and property listings cross-referenced against cadastral records.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "RealEstateAgent",
      "@id": `${SITE_URL}/#organization`,
      name: "MALPOTH",
      url: SITE_URL,
      description:
        "Nepal's archive of record for land and property. Every listing is field-verified and cross-referenced against the official cadastral record (Naksa) and the Malpot land ownership ledger.",
      areaServed: { "@type": "Country", name: "Nepal" },
      // TODO: add official social/profile URLs once confirmed (Phase 2).
      sameAs: [],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="text-on-surface">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
        {children}
        <Toaster position="top-center" richColors />
        <Suspense fallback={null}>
          <AuthModalListener />
        </Suspense>
      </body>
    </html>
  );
}
