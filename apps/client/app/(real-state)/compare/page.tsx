"use client";

import { Button, Icon } from "@repo/ui";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "hooks/use-debounce";
import {
  fetchFeedPage,
  fetchPropertyBySlug,
} from "lib/api/services/properties/properties";
import type {
  ApiProperty,
  CardProperty,
} from "lib/api/services/properties/types";
import {
  formatNPR,
  formatLocation,
  formatLandArea,
  isLandPropertyType,
  labelEnum,
  toCardProps,
  TYPE_LABELS,
  VERIFICATION_LABELS,
} from "lib/api/services/properties/types";
import { listingCoverImageUrl } from "lib/media/videoThumbnail";
import { useCompareStore, MAX_COMPARE_ITEMS } from "store/compare";

/* ------------------------------------------------------------------ */
/*  Search sub-component                                               */
/* ------------------------------------------------------------------ */

function PropertySearch({
  selectedSlugs,
  onToggle,
}: {
  selectedSlugs: Set<string>;
  onToggle: (property: CardProperty) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CardProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Debounce the query value with 1 second delay
  const debouncedQuery = useDebounce(query, 1000);

  const handleSearch = useCallback(async (searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      // Load a batch and filter client-side (no dedicated search API)
      const page = await fetchFeedPage({ first: 50 });
      const lower = q.toLowerCase();
      const filtered = (page.items ?? [])
        .filter(
          (p: ApiProperty) =>
            p.title.toLowerCase().includes(lower) ||
            (p.location?.municipality ?? "").toLowerCase().includes(lower) ||
            (p.location?.district ?? "").toLowerCase().includes(lower) ||
            (p.listingCode ?? "").toLowerCase().includes(lower),
        )
        .slice(0, 10)
        .map((p: ApiProperty) => toCardProps(p));
      setResults(filtered);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger search when debounced query changes
  useEffect(() => {
    handleSearch(debouncedQuery);
  }, [debouncedQuery, handleSearch]);
  return (
    <div className="mb-8">
      <label
        htmlFor="compare-search"
        className="mb-2 block text-sm font-medium text-on-surface"
      >
        Add properties to compare
      </label>
      <div className="flex gap-2">
        <input
          id="compare-search"
          type="text"
          placeholder="Search by title, location, or listing code..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
          className="flex-1 rounded-lg border border-outline-variant bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <Button
          onClick={() => handleSearch(query)}
          disabled={loading || !query.trim()}
          className="bg-primary px-5 text-on-primary hover:bg-primary/90"
        >
          {loading ? (
            <Icon name="progress_activity" className="animate-spin" />
          ) : (
            <>
              <Icon name="search" className="mr-1.5 text-sm" />
              Search
            </>
          )}
        </Button>
      </div>

      {/* Results dropdown */}
      {searched && (
        <div className="mt-2 max-h-72 overflow-y-auto rounded-lg border border-outline-variant bg-surface shadow-sm">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-on-surface-variant">
              No properties found for &ldquo;{query}&rdquo;
            </p>
          ) : (
            results.map((p) => {
              const isSelected = selectedSlugs.has(p.id);
              const atMax = selectedSlugs.size >= MAX_COMPARE_ITEMS;
              return (
                <button
                  key={p.id}
                  onClick={() => onToggle(p)}
                  disabled={!isSelected && atMax}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-container ${
                    isSelected ? "bg-primary/5" : ""
                  } ${!isSelected && atMax ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface-container">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt=""
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className={`h-full w-full bg-gradient-to-br ${p.gradient}`}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-on-surface">
                      {p.title}
                    </p>
                    <p className="truncate text-xs text-on-surface-variant">
                      {p.location} &middot; {p.price}
                    </p>
                  </div>
                  {isSelected ? (
                    <Icon name="check" className="shrink-0 text-primary" />
                  ) : (
                    <span className="shrink-0 text-xs font-medium text-primary">
                      Add
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
      <p className="mt-1.5 text-xs text-on-surface-variant">
        {selectedSlugs.size}/{MAX_COMPARE_ITEMS} selected
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main compare content                                               */
/* ------------------------------------------------------------------ */

function ComparePageContent() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") ?? "";
  const slugs = idsParam.split(",").filter(Boolean);

  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const { items, add, remove, isSelected, clear } = useCompareStore();

  useEffect(() => {
    if (slugs.length === 0) {
      setProperties([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all(slugs.map((slug) => fetchPropertyBySlug(slug)))
      .then((results) => {
        if (!cancelled) setProperties(results.filter(Boolean));
      })
      .catch(() => {
        if (!cancelled) setProperties([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [idsParam]);

  const selectedSlugs = useMemo(
    () => new Set(properties.map((p) => p.slug)),
    [properties],
  );

  const handleToggle = useCallback(
    async (property: CardProperty) => {
      if (isSelected(property.id)) {
        remove(property.id);
        setProperties((prev) => prev.filter((p) => p.id !== property.id));
      } else {
        const added = add(property);
        if (added) {
          try {
            const full = await fetchPropertyBySlug(property.id);
            if (full) setProperties((prev) => [...prev, full]);
          } catch {}
        }
      }
    },
    [add, remove, isSelected],
  );

  const handleRemove = useCallback(
    (id: string) => {
      remove(id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    },
    [remove],
  );

  const handleClear = useCallback(() => {
    clear();
    setProperties([]);
  }, [clear]);

  /* ---- Empty / insufficient state ---- */
  if (!loading && properties.length < 2) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-headline-md text-2xl font-bold text-on-surface">
            Compare Properties
          </h1>
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <Icon name="arrow_forward" className="mr-1 rotate-180" />
              Back
            </Link>
          </Button>
        </div>

        <PropertySearch selectedSlugs={selectedSlugs} onToggle={handleToggle} />

        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-outline-variant bg-surface-container/30 px-4 text-center">
          <Icon
            name="swap_horiz"
            className="text-5xl text-on-surface-variant/40"
          />
          <h2 className="font-headline-md text-lg font-semibold text-on-surface">
            Select at least 2 properties to compare
          </h2>
          <p className="max-w-md text-sm text-on-surface-variant">
            Use the search above or go back to listings and tap the Compare
            button on property cards.
          </p>
          <Button
            asChild
            className="bg-primary text-on-primary hover:bg-primary/90"
          >
            <Link href="/">Browse Properties</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Icon
          name="progress_activity"
          className="animate-spin text-3xl text-primary"
        />
      </div>
    );
  }

  /* ---- Comparison table ---- */
  const rows: {
    label: string;
    key: string;
    render: (p: ApiProperty) => string;
  }[] = [
    {
      label: "Price",
      key: "price",
      render: (p) => formatNPR(p.askingPrice),
    },
    {
      label: "Price / Aana",
      key: "pricePerAana",
      render: (p) =>
        isLandPropertyType(p.mainCategory) && p.pricePerAana
          ? formatNPR(p.pricePerAana)
          : "\u2014",
    },
    {
      label: "Type",
      key: "type",
      render: (p) => labelEnum(p.subCategory, TYPE_LABELS),
    },
    {
      label: "Location",
      key: "location",
      render: (p) => formatLocation(p.location),
    },
    {
      label: "Land Area",
      key: "area",
      render: (p) => formatLandArea(p.landArea) ?? "\u2014",
    },
    {
      label: "Road Access",
      key: "road",
      render: (p) => {
        const parts: string[] = [];
        if (p.roadAccessWidthFt) parts.push(`${p.roadAccessWidthFt} ft`);
        if (p.roadType) parts.push(labelEnum(p.roadType, {}));
        return parts.length > 0 ? parts.join(", ") : "\u2014";
      },
    },
    {
      label: "Facing",
      key: "facing",
      render: (p) => (p.facing ? labelEnum(p.facing, {}) : "\u2014"),
    },
    {
      label: "Corner Plot",
      key: "corner",
      render: (p) => (p.isCornerPlot ? "Yes" : "No"),
    },
    {
      label: "Verification",
      key: "verification",
      render: (p) => labelEnum(p.verificationLevel, VERIFICATION_LABELS),
    },
    {
      label: "Status",
      key: "status",
      render: (p) => labelEnum(p.status, {}),
    },
    {
      label: "Listed",
      key: "listed",
      render: (p) =>
        new Date(p.createdAt).toLocaleDateString("en-NP", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-headline-md text-2xl font-bold text-on-surface">
          Compare Properties
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleClear}>
            Clear All
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <Icon name="arrow_forward" className="mr-1 rotate-180" />
              Back
            </Link>
          </Button>
        </div>
      </div>

      {/* Inline search for adding more properties */}
      <PropertySearch selectedSlugs={selectedSlugs} onToggle={handleToggle} />

      <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface shadow-sm">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-40 min-w-[160px] bg-surface-container p-4 font-semibold text-on-surface">
                Property
              </th>
              {properties.map((p) => {
                const coverUrl = listingCoverImageUrl(p.media);
                return (
                  <th
                    key={p.id}
                    className="min-w-[220px] max-w-[280px] p-4 align-top"
                  >
                    <div className="mb-3 h-32 overflow-hidden rounded-lg bg-surface-container">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={p.title}
                          draggable={false}
                          onContextMenu={(e) => e.preventDefault()}
                          onDragStart={(e) => e.preventDefault()}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-on-surface-variant/50">
                          No image
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/${p.slug}`}
                      className="mb-1 block font-semibold text-on-surface hover:text-primary line-clamp-2"
                    >
                      {p.title}
                    </Link>
                    <p className="text-xs text-on-surface-variant">
                      {p.listingCode}
                    </p>
                    <button
                      onClick={() => handleRemove(p.id)}
                      className="mt-2 text-xs font-medium text-error hover:underline"
                    >
                      Remove
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.key}
                className={
                  idx % 2 === 0 ? "bg-surface" : "bg-surface-container/50"
                }
              >
                <td className="sticky left-0 z-10 border-r border-outline-variant/50 bg-inherit p-3 font-medium text-on-surface">
                  {row.label}
                </td>
                {properties.map((p) => (
                  <td key={p.id} className="p-3 text-on-surface-variant">
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Icon
            name="progress_activity"
            className="animate-spin text-3xl text-primary"
          />
        </div>
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}
