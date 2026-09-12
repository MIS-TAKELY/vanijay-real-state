"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";

/**
 * Google Analytics 4 (gtag.js) — loaded via `next/script` with the
 * `afterInteractive` strategy so it never blocks hydration.
 *
 * Page views:
 * - The initial-load pageview is sent automatically by the `gtag("config", …)`
 *   call in the inline init script below.
 * - App Router client-side navigations do NOT re-trigger gtag.js's automatic
 *   pageview, so the effect sends an explicit `page_view` event whenever the
 *   route or query string changes. The first render is skipped via a ref (and
 *   repeated URLs de-duplicated) so the initial load is never double-counted.
 *
 * Renders nothing when `gaId` is empty — pass
 * `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID` from the root layout so GA is
 * fully absent from builds where analytics is not configured.
 *
 * Must be wrapped in a <Suspense> boundary in the root layout
 * (useSearchParams requires one during static rendering).
 */
type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

export function GoogleAnalytics({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrl = useRef<string | null>(null);

  useEffect(() => {
    const qs = searchParams.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    // First run: the inline init script's gtag("config") already sent the
    // initial pageview — sending another here would double-count it.
    if (lastTrackedUrl.current === null) {
      lastTrackedUrl.current = url;
      return;
    }
    // Same URL again (e.g. dev StrictMode double-invoked effects) — no-op.
    if (lastTrackedUrl.current === url) return;
    lastTrackedUrl.current = url;

    window.gtag?.("event", "page_view", {
      page_path: url,
      page_location: window.location.href,
    });
  }, [pathname, searchParams]);

  // Measurement IDs are alphanumerics + dash; strip anything else before it is
  // interpolated into the inline init script below.
  const safeGaId = gaId.replace(/[^A-Za-z0-9_-]/g, "");

  if (!safeGaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${safeGaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${safeGaId}');
        `}
      </Script>
    </>
  );
}
