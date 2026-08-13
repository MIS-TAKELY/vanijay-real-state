"use client";

import { Button } from "@repo/ui";
import {
  FALLBACK_GRADIENT,
  TYPE_GRADIENTS,
  fetchMyListingsGraphql,
  type ApiProperty,
} from "lib/api";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "components/real-state/layout/dashboard/EmptyState";
import {
  LISTING_FILTER_TABS,
  type ListingFilter,
  type ListingStatus,
  type MyListing,
} from "./constants";
import { ListingsBulkBar } from "./ListingsBulkBar";
import { ListingsFilterTabs } from "./ListingsFilterTabs";
import { ListingsTable } from "./ListingsTable";

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const mins = Math.max(0, Math.floor((Date.now() - then) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function toMyListing(p: ApiProperty): MyListing {
  return {
    id: p.id,
    listingCode: p.listingCode,
    slug: p.slug,
    title: p.title,
    propertyType: p.propertyType,
    status: p.status as ListingStatus,
    verificationLevel: p.verificationLevel,
    askingPrice: p.askingPrice,
    gradient: TYPE_GRADIENTS[p.propertyType] ?? FALLBACK_GRADIENT,
    thumbnailUrl: p.media?.find((m) => m.isCover)?.url ?? p.media?.[0]?.url,
    views: 0,
    inquiries: 0,
    updatedAt: formatRelativeTime(p.updatedAt),
    raw: p,
  };
}

export function MyListings() {
  const [active, setActive] = useState<ListingFilter>("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchMyListingsGraphql()
      .then((properties) => {
        if (!cancelled) {
          setListings(properties.map(toMyListing));
        }
      })
      .catch((e) => {
        if (!cancelled)
          setError(
            e instanceof Error ? e.message : "Failed to load your listings.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => load(), [load]);

  const counts = useMemo(() => {
    const next = {} as Record<ListingFilter, number>;
    for (const tab of LISTING_FILTER_TABS) {
      next[tab.key] =
        tab.key === "ALL"
          ? listings.length
          : listings.filter((l) => l.status === tab.key).length;
    }
    return next;
  }, [listings]);

  const filtered = useMemo(
    () =>
      active === "ALL" ? listings : listings.filter((l) => l.status === active),
    [active, listings],
  );

  const toggleRow = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelectedIds((prev) => {
      const allSelected = filtered.every((l) => prev.has(l.id));
      if (allSelected) {
        const next = new Set(prev);
        filtered.forEach((l) => next.delete(l.id));
        return next;
      }
      const next = new Set(prev);
      filtered.forEach((l) => next.add(l.id));
      return next;
    });

  const clearSelection = () => setSelectedIds(new Set());
  const handleArchive = () => clearSelection();
  const handleReverify = () => clearSelection();

  if (loading && listings.length === 0) {
    return (
      <div className="flex flex-col gap-md">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl border border-outline-variant bg-surface"
          />
        ))}
      </div>
    );
  }

  if (error && listings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-md rounded-2xl border border-outline-variant bg-surface p-xl text-center">
        <p className="max-w-(--container-md) text-sm text-on-surface-variant">{error}</p>
        <Button
          variant="outline"
          onClick={() => void load()}
          className="rounded-md border-outline-variant px-md py-2 text-sm font-semibold text-on-surface hover:border-primary hover:text-primary"
        >
          Try again
        </Button>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        icon="list_alt"
        title="Your archive is empty"
        description="List your first verified property to start building your archive."
        action={
          <Button asChild>
            <Link href="/my-listings/new">List your first property</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col">
      <ListingsFilterTabs
        active={active}
        counts={counts}
        onChange={setActive}
      />

      <ListingsBulkBar
        selectedCount={selectedIds.size}
        onArchive={handleArchive}
        onReverify={handleReverify}
        onClear={clearSelection}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon="filter_list_off"
          title="No listings match this filter"
          description="Try a different status tab to see your listings."
        />
      ) : (
        <ListingsTable
          listings={filtered}
          selectedIds={selectedIds}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
          onChanged={() => void load()}
        />
      )}
    </div>
  );
}
