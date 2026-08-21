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
    <div className="mb-4 sm:mb-8">
      <label
        htmlFor="compare-search"
        className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-on-surface"
      >
        Add properties to compare
      </label>
      <div className="flex gap-1.5 sm:gap-2">
        <input
          id="compare-search"
          type="text"
          placeholder="Search by title, location, or code..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
          className="flex-1 rounded-lg border border-outline-variant bg-surface-container px-3 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <Button
          onClick={() => handleSearch(query)}
          disabled={loading || !query.trim()}
          className="bg-primary px-3 sm:px-5 text-xs sm:text-sm text-on-primary hover:bg-primary/90"
        >
          {loading ? (
            <Icon name="progress_activity" className="animate-spin text-sm" />
          ) : (
            <>
              <Icon name="search" className="mr-1 sm:mr-1.5 text-xs sm:text-sm" />
              Search
            </>
          )}
        </Button>
      </div>

      {/* Results dropdown */}
      {searched && (
        <div className="mt-2 max-h-72 overflow-y-auto rounded-lg border border-outline-variant bg-surface shadow-sm">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-xs sm:text-sm text-on-surface-variant">
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
                  className={`flex w-full items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-left text-xs sm:text-sm transition-colors hover:bg-surface-container ${
                    isSelected ? "bg-primary/5" : ""
                  } ${!isSelected && atMax ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 overflow-hidden rounded-md bg-surface-container">
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
                    <p className="truncate text-[10px] sm:text-xs text-on-surface-variant">
                      {p.location} &middot; {p.price}
                    </p>
                  </div>
                  {isSelected ? (
                    <Icon name="check" className="shrink-0 text-primary text-sm sm:text-base" />
                  ) : (
                    <span className="shrink-0 text-[10px] sm:text-xs font-medium text-primary">
                      Add
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
      <p className="mt-1.5 text-[10px] sm:text-xs text-on-surface-variant">
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
      <div className="mx-auto max-w-container-max px-gutter py-8">
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

  const gridCols = `minmax(46px, ${properties.length >= 4 ? "16%" : properties.length === 3 ? "18%" : "22%"}) repeat(${properties.length}, minmax(0, 1fr))`;

  return (
    <div className="mx-auto max-w-container-max px-1 sm:px-4 md:px-gutter py-2.5 sm:py-8">
      <div className="mb-2.5 sm:mb-6 flex items-center justify-between gap-2">
        <h1 className="font-headline-md text-base sm:text-2xl font-bold text-on-surface truncate">
          Compare Properties
        </h1>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" onClick={handleClear} className="h-7 sm:h-8 px-2 sm:px-3 text-[11px] sm:text-sm">
            Clear All
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-7 sm:h-8 px-2 sm:px-3 text-[11px] sm:text-sm">
            <Link href="/">
              <Icon name="arrow_forward" className="mr-0.5 sm:mr-1 rotate-180 text-xs sm:text-sm" />
              Back
            </Link>
          </Button>
        </div>
      </div>

      {/* Inline search for adding more properties */}
      <PropertySearch selectedSlugs={selectedSlugs} onToggle={handleToggle} />

      <div className="w-full overflow-hidden rounded-md border border-outline-variant bg-surface shadow-sm">
        {/* Header Row */}
        <div
          className="grid border-b border-outline-variant bg-surface"
          style={{ gridTemplateColumns: gridCols }}
        >
          <div className="flex flex-col justify-start border-r border-outline-variant/50 bg-surface-container p-1 sm:p-2.5 md:p-4 text-[9px] sm:text-xs md:text-sm font-semibold text-on-surface">
            <span>Property</span>
          </div>
          {properties.map((p) => {
            const coverUrl = listingCoverImageUrl(p.media);
            return (
              <div
                key={p.id}
                className="flex min-w-0 flex-col justify-between border-r border-outline-variant/30 p-1 sm:p-2.5 md:p-4 last:border-r-0"
              >
                <div>
                  <div className="mb-1 aspect-[16/10] w-full overflow-hidden rounded bg-surface-container sm:mb-2 sm:rounded-lg">
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
                      <div className="flex h-full items-center justify-center text-[8px] text-on-surface-variant/50 sm:text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/${p.slug}`}
                    className="mb-0.5 block line-clamp-2 text-[9px] font-semibold leading-tight text-on-surface hover:text-primary sm:text-xs md:text-sm"
                  >
                    {p.title}
                  </Link>
                  <p className="truncate text-[7px] text-on-surface-variant sm:text-[10px]">
                    {p.listingCode}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(p.id)}
                  className="mt-0.5 block text-left text-[8px] font-medium text-error hover:underline sm:mt-1.5 sm:text-xs"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>

        {/* Attribute Rows */}
        {rows.map((row, idx) => (
          <div
            key={row.key}
            className={`grid border-b border-outline-variant/20 last:border-b-0 ${
              idx % 2 === 0 ? "bg-surface" : "bg-surface-container/40"
            }`}
            style={{ gridTemplateColumns: gridCols }}
          >
            <div className="flex items-center border-r border-outline-variant/50 p-1 text-[8px] font-medium leading-tight text-on-surface break-words sm:p-2.5 sm:text-xs md:text-sm">
              {row.label}
            </div>
            {properties.map((p) => (
              <div
                key={p.id}
                className="flex min-w-0 items-center border-r border-outline-variant/30 p-1 text-[8px] leading-tight text-on-surface-variant break-words last:border-r-0 sm:p-2.5 sm:text-xs md:text-sm"
              >
                <span className="w-full [overflow-wrap:anywhere] break-words">
                  {row.render(p)}
                </span>
              </div>
            ))}
          </div>
        ))}
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
