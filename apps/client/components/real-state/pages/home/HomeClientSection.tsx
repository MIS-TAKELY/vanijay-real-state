"use client";

import dynamic from "next/dynamic";
import type { CmsHeroSlide } from "lib/api/services/cms";
import {
  CardRailSkeleton,
  RailSectionSkeleton,
} from "./skeletons";
import { DeferredMount } from "./DeferredMount";

/* ─── Skeleton placeholders ──────────────────────────────────────── */

function CategorySkeleton() {
  return (
    <div className="py-4" aria-label="Property categories">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="flex gap-4 justify-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2.5">
              <div className="size-20 md:size-24 rounded-2xl animate-pulse bg-outline-variant/40" />
              <div className="h-3 w-14 rounded animate-pulse bg-outline-variant/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecentlyAddedSkeleton() {
  return (
    <RailSectionSkeleton title="Recently Added" count={4} />
  );
}

function ListingsSkeleton() {
  return (
    <>
      <RailSectionSkeleton title="Featured Properties" />
      <RailSectionSkeleton title="Trending Now" tinted />
    </>
  );
}

/** Must occupy the same box as NepalmapWrapper's hydrated map
 *  (NEPAL_MAP_HEIGHT) or the page jumps when the bundle arrives. */
const MAP_PLACEHOLDER_HEIGHT = "clamp(100px, 34vh, 400px)";

function MapSkeleton() {
  return (
    <section className="py-6 md:py-14 relative z-10 w-full">
      <div
        style={{
          width: "100%",
          height: MAP_PLACEHOLDER_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(13,26,20,0.6)",
          color: "#c9a227",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.05em",
        }}
        aria-busy="true"
        aria-label="Loading interactive map"
      >
        Loading map…
      </div>
    </section>
  );
}

function AboutSkeleton() {
  return (
    <section className="border-t border-outline-variant bg-surface-container-low">
      <div className="mx-auto max-w-container-max px-gutter py-xl">
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <div className="h-6 w-48 rounded bg-outline-variant/40 animate-pulse mb-4" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="mb-3">
                <div className="h-5 w-full rounded bg-outline-variant/30 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Dynamic imports with code-splitting ────────────────────────── */

const CategoryStrip = dynamic(
  () => import("./CategoryStrip").then((m) => m.CategoryStrip),
  { ssr: false, loading: CategorySkeleton },
);

// HeroBannerCarousel is above the fold — statically imported so it ships
// in the main bundle and renders server-side immediately (no lazy-load delay).
import { HeroBannerCarousel } from "./HeroBannerCarousel";

const ListingsMarketplace = dynamic(
  () => import("./ListingsMarketplace").then((m) => m.ListingsMarketplace),
  { ssr: false, loading: ListingsSkeleton },
);

const RecentlyAdded = dynamic(
  () => import("./RecentlyAdded").then((m) => m.RecentlyAdded),
  { ssr: false, loading: RecentlyAddedSkeleton },
);

const RecentlyViewed = dynamic(
  () => import("./RecentlyViewed").then((m) => m.RecentlyViewed),
  { ssr: false, loading: RecentlyAddedSkeleton },
);

const NepalmapWrapper = dynamic(
  () => import("./NepalmapWrapper"),
  { ssr: false, loading: MapSkeleton },
);

const AboutArchive = dynamic(
  () => import("./AboutArchive").then((m) => m.AboutArchive),
  { ssr: false, loading: AboutSkeleton },
);

/* ─── Main client section ────────────────────────────────────────── */

interface HomeClientSectionProps {
  /** Server-fetched CMS hero slides — skips the client-side round-trip so
   *  the LCP image renders immediately. */
  initialHeroSlides?: CmsHeroSlide[];
}

export function HomeClientSection({
  initialHeroSlides,
}: HomeClientSectionProps) {
  return (
    <>
      {/* Above the fold — statically imported, renders immediately */}
      <CategoryStrip />
      <HeroBannerCarousel initialSlides={initialHeroSlides} />
      {/* Near the fold — code-split, loads right away */}
      <ListingsMarketplace />
      <RecentlyAdded />
      {/* RecentlyViewed renders null for empty history — deferring it would
          collapse its skeleton box and cause CLS, so it stays immediate. */}
      <RecentlyViewed />
      {/* Deep below the fold — deferred to post-load idle so the map bundle
          (~390 KB gzip), its tile fetches, and rail APIs never compete with
          the LCP hero during the critical rendering window. */}
      <DeferredMount fallback={<MapSkeleton />}>
        <NepalmapWrapper />
      </DeferredMount>
      <DeferredMount fallback={<AboutSkeleton />}>
        <AboutArchive />
      </DeferredMount>
    </>
  );
}

export { CardRailSkeleton };
