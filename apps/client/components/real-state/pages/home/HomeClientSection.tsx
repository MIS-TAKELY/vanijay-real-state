"use client";

import dynamic from "next/dynamic";

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


function ListingsSkeleton() {
  return (
    <section className="py-6 md:py-10">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="h-6 w-48 rounded bg-outline-variant/40 animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl animate-pulse bg-outline-variant/20"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function MapSkeleton() {
  return (
    <section className="py-6 md:py-14 relative z-10 w-full">
      <div
        style={{
          width: "100%",
          height: "clamp(400px, 40vh, 440px)",
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
  { ssr: false, loading: ListingsSkeleton },
);

const RecentlyViewed = dynamic(
  () => import("./RecentlyViewed").then((m) => m.RecentlyViewed),
  { ssr: false, loading: ListingsSkeleton },
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

export function HomeClientSection() {
  return (
    <>
      {/* Above the fold — statically imported, renders immediately */}
      <CategoryStrip />
      <HeroBannerCarousel />
      {/* Below the fold — dynamically imported, code-split */}
      <ListingsMarketplace />
      <RecentlyAdded />
      <RecentlyViewed />
      <NepalmapWrapper />
      <AboutArchive />
    </>
  );
}
