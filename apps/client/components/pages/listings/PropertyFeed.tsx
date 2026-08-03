"use client";

import { useSession } from "@repo/auth/client";
import { useCallback, useEffect, useState } from "react";
import { useAuthModalStore } from "store/auth-modal";
import { Pagination } from "./Pagination";
import { PropertyCard } from "./PropertyCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const PAGE_SIZE = 12;

/** Shape returned by GET /api/v1/properties/feed (PropertiesService.findFeed). */
interface ApiProperty {
  id: string;
  listingCode: string;
  slug: string;
  title: string;
  description?: string | null;
  propertyType: string;
  status: string;
  verificationLevel: string;
  askingPrice: number;
  pricePerAana?: number | null;
  roadAccessWidthFt?: number | null;
  roadType?: string | null;
  facing?: string | null;
  isCornerPlot: boolean;
  ownerId: string;
  agentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FeedPage {
  items: ApiProperty[];
  nextCursor: string | null;
  hasMore: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  RESIDENTIAL_LAND: "Residential Land",
  COMMERCIAL_LAND: "Commercial Land",
  AGRICULTURAL_LAND: "Agricultural Land",
  COMMERCIAL_SPACE: "Commercial Space",
  HERITAGE_HOME: "Heritage Home",
  RESIDENTIAL_HOUSE: "Residential House",
};

const TYPE_GRADIENTS: Record<string, string> = {
  RESIDENTIAL_LAND: "from-[#A8C0A0] via-[#7A9A70] to-[#5A7A55]",
  COMMERCIAL_LAND: "from-[#C8C0B0] via-[#A89880] to-[#887860]",
  AGRICULTURAL_LAND: "from-[#B0C8A0] via-[#88A870] to-[#688850]",
  COMMERCIAL_SPACE: "from-[#90A8C0] via-[#6A88A8] to-[#4A6888]",
  HERITAGE_HOME: "from-[#C0A890] via-[#A08868] to-[#806848]",
  RESIDENTIAL_HOUSE: "from-[#A0B8C8] via-[#7890A8] to-[#587088]",
};

const VERIFICATION_LABELS: Record<string, string> = {
  UNVERIFIED: "Unverified",
  LEVEL_1_BASIC: "Level 1 Basic",
  LEVEL_2_DOC_VERIFIED: "Document Verified",
  LEVEL_3_FIELD_VERIFIED: "Field Verified",
  REJECTED: "Rejected",
};

const FALLBACK_GRADIENT = "from-[#A8C0A0] via-[#7A9A70] to-[#5A7A55]";

function formatNPR(n: number): string {
  return `NPR ${new Intl.NumberFormat("en-US").format(n)}`;
}

/** Humanise an enum like NORTH_EAST -> "North East", with an override map. */
function labelEnum(value: string, labels: Record<string, string>): string {
  if (labels[value]) return labels[value];
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Map an API Property to the presentational PropertyCard props.
 * NOTE: the feed response doesn't include the location relation yet — the
 * `location` line shows the property type until `findFeed` adds
 * `include: { location: true }`.
 */
function toCardProps(p: ApiProperty) {
  const meta: string[] = [];
  if (p.roadAccessWidthFt || p.roadType) {
    const parts: string[] = [];
    if (p.roadAccessWidthFt) parts.push(`${p.roadAccessWidthFt}ft`);
    if (p.roadType) parts.push(labelEnum(p.roadType, {}));
    meta.push(`Road: ${parts.join(" ")}`);
  }
  if (p.facing) meta.push(`Facing: ${labelEnum(p.facing, {})}`);
  if (p.isCornerPlot) meta.push("Corner Plot");
  if (p.pricePerAana) meta.push(`Price/Aana: ${formatNPR(p.pricePerAana)}`);
  if (p.verificationLevel && p.verificationLevel !== "UNVERIFIED") {
    meta.push(
      `Verification: ${labelEnum(p.verificationLevel, VERIFICATION_LABELS)}`,
    );
  }

  return {
    id: p.slug, // detail route is /listings/[name] — slug is the natural key
    listingCode: p.listingCode,
    title: p.title,
    price: formatNPR(p.askingPrice),
    location: labelEnum(p.propertyType, TYPE_LABELS),
    gradient: TYPE_GRADIENTS[p.propertyType] ?? FALLBACK_GRADIENT,
    meta,
  };
}

async function fetchFeedPage(opts: {
  first: number;
  after?: string | null;
}): Promise<FeedPage> {
  const params = new URLSearchParams({ first: String(opts.first) });
  if (opts.after) params.set("after", opts.after);
  const res = await fetch(
    `${API_URL}/api/v1/properties/feed?${params.toString()}`,
    {
      credentials: "include",
      headers: { Accept: "application/json" },
      cache: "no-store",
    },
  );
  console.log("res-->",res)
  if (!res.ok) {
    throw new Error(`Failed to load listings (${res.status})`);
  }
  return (await res.json()) as FeedPage;
}

export function PropertyFeed() {
  const { data: session, isPending: sessionLoading } = useSession();
  const openAuthModal = useAuthModalStore((s) => s.open);

  const [items, setItems] = useState<ApiProperty[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const loadFirst = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await fetchFeedPage({ first: PAGE_SIZE });
      console.log("pages-->", page);
      setItems(page.items);
      setNextCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load listings");
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !nextCursor) return;
    setLoading(true);
    setError(null);
    try {
      const page = await fetchFeedPage({ first: PAGE_SIZE, after: nextCursor });
      setItems((prev) => [...prev, ...page.items]);
      setNextCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more listings");
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, nextCursor]);

  // Auto-load the first page once the session is confirmed (feed requires auth).
  useEffect(() => {
    // if (sessionLoading) return;
    void loadFirst();
    if (session?.user && !initialized && !loading) {
    }
  }, []);

  // Session still resolving.
  if (sessionLoading) {
    return <FeedSkeleton />;
  }

  // Initial load in progress.
  if (loading && items.length === 0) {
    return <FeedSkeleton />;
  }

  // Initial load failed.
  if (error && items.length === 0) {
    return (
      <section className="mx-auto max-w-container-max px-gutter py-xl text-center">
        <p className="mb-sm text-sm text-on-surface-variant">{error}</p>
        <button
          type="button"
          onClick={() => void loadFirst()}
          className="inline-flex cursor-pointer items-center justify-center rounded-md border border-outline-variant px-md py-2 text-sm font-semibold text-on-surface transition-colors hover:border-primary hover:text-primary"
        >
          Try again
        </button>
      </section>
    );
  }

  // No listings at all.
  if (!loading && items.length === 0) {
    return (
      <section className="mx-auto max-w-container-max px-gutter py-xl text-center">
        <p className="text-sm text-on-surface-variant">
          No listings available right now.
        </p>
      </section>
    );
  }

  return (
    <>
      <div className="mx-auto grid max-w-container-max grid-cols-1 gap-md px-gutter sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <PropertyCard key={p.id} property={toCardProps(p)} />
        ))}
      </div>

      {error && items.length > 0 && (
        <p className="mx-auto max-w-container-max px-gutter py-sm text-center text-sm text-on-surface-variant">
          {error}
        </p>
      )}

      <Pagination
        hasMore={hasMore}
        loading={loading}
        onLoadMore={() => void loadMore()}
      />

      {!hasMore && !loading && (
        <p className="mx-auto max-w-container-max px-gutter pb-xl text-center text-sm text-on-surface-variant">
          You&apos;ve reached the end of the listings.
        </p>
      )}
    </>
  );
}

function FeedSkeleton() {
  return (
    <div className="mx-auto grid max-w-container-max grid-cols-1 gap-md px-gutter py-md sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <div
          key={i}
          className="h-80 animate-pulse rounded-2xl bg-surface-container"
        />
      ))}
    </div>
  );
}
