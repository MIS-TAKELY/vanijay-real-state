"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "./Icon";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn } from "../lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface GeocodeResult {
  id: number | string;
  displayName: string;
  lat: number;
  lng: number;
}

export interface LocationSearchProps {
  /** Called when the user picks a result from the dropdown. */
  onSelect: (result: GeocodeResult) => void;
  /** ISO 3166-1 alpha-2 country code to bias results to. Default `"np"`. */
  countryCode?: string;
  /** Field label. Default `"Search location"`. */
  label?: string;
  /** Input placeholder. */
  placeholder?: string;
  /** Debounce in ms before firing the request. Default `500`. */
  debounceMs?: number;
  /** Minimum query length before searching. Default `3`. */
  minQueryLength?: number;
  /** Nominatim-compatible search endpoint. */
  endpoint?: string;
  /** Extra classes for the wrapper. */
  className?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * `<LocationSearch>` — a debounced, race-safe Nominatim (OpenStreetMap)
 * geocoding search box with a results dropdown. Reusable anywhere a place
 * search is needed; bias results to a country via `countryCode`.
 */
export function LocationSearch({
  onSelect,
  countryCode = "np",
  label = "Search location",
  placeholder = "Search places (e.g. Patan Durbar Square)",
  debounceMs = 500,
  minQueryLength = 3,
  endpoint = "https://nominatim.openstreetmap.org/search",
  className,
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = query.trim();
    if (trimmed.length < minQueryLength) {
      setResults([]);
      setIsSearching(false);
      abortRef.current?.abort();
      return;
    }

    timerRef.current = setTimeout(async () => {
      // Cancel any in-flight request before starting a new one.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsSearching(true);

      try {
        const res = await fetch(
          `${endpoint}?format=json&q=${encodeURIComponent(
            trimmed,
          )}&countrycodes=${countryCode}&limit=5&accept-language=en`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error("Search failed");
        const data: NominatimResult[] = await res.json();
        setResults(
          data.map((r) => ({
            id: r.place_id,
            displayName: r.display_name,
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon),
          })),
        );
      } catch (err) {
        // Ignore aborts from newer queries superseding this one.
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Location search error:", err);
        setResults([]);
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, countryCode, debounceMs, endpoint, minQueryLength]);

  const handleSelect = (result: GeocodeResult) => {
    onSelect(result);
    setQuery("");
    setResults([]);
  };

  const showEmpty =
    query.trim().length >= minQueryLength &&
    !isSearching &&
    results.length === 0;

  return (
    <div className={cn("relative z-50 flex flex-col gap-xs", className)}>
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full pr-10"
        />
        {isSearching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            <Icon name="sync" className="animate-spin text-[18px]" />
          </span>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute top-full mt-1 w-full overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-lg">
          {results.map((result) => (
            <button
              key={result.id}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full cursor-pointer px-3 py-2.5 text-left text-sm text-on-surface transition-colors hover:bg-surface-container"
            >
              <span className="line-clamp-1">{result.displayName}</span>
            </button>
          ))}
        </div>
      )}

      {showEmpty && (
        <p className="text-xs text-on-surface-variant">No results found</p>
      )}
    </div>
  );
}