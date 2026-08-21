import type { Metadata, Viewport } from "next";
import { Toaster } from "@repo/ui";
import { Suspense } from "react";
import { SerwistProvider } from "@serwist/turbopack/react";
import { AuthModalListener } from "components/real-state/auth/AuthModalListener";
import { SITE_URL } from "lib/site";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  themeColor: "#1B5E20",
};

const APP_NAME = "MALPOTH";
const APP_DEFAULT_TITLE = "MALPOTH | Verified Land & Property Archive";
const APP_TITLE_TEMPLATE = "%s - MALPOTH";
const APP_DESCRIPTION = "The archive of record for legitimate land ownership in Nepal — field-verified land and property listings cross-referenced against cadastral records.";

export const metadata: Metadata = {
  // Without metadataBase, relative canonicals (`alternates.canonical`) and
  // relative OG URLs resolve against the request host (www, staging, etc.).
  // Pin them all to the canonical public origin.
  metadataBase: new URL(SITE_URL),
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
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
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MALPOTH" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="text-on-surface">
        <SerwistProvider swUrl="/sw.js">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
          />
          {children}
          <Toaster position="top-center" richColors />
          <Suspense fallback={null}>
            <AuthModalListener />
          </Suspense>
        </SerwistProvider>
      </body>
    </html>
  );
}
