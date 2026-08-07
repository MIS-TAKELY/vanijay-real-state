"use client";

import type { GeocodeResult } from "./LocationSearch";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/**
 * Parsed `address` block returned by Nominatim's `/reverse` endpoint.
 * Field names mirror the OpenStreetMap / Nominatim address hierarchy so
 * callers can pick whichever keys are populated for a given region.
 */
export interface ReverseGeocodeAddress {
  country?: string;
  country_code?: string;
  state?: string;
  county?: string;
  state_district?: string;
  municipality?: string;
  town?: string;
  city?: string;
  village?: string;
  suburb?: string;
  road?: string;
  neighbourhood?: string;
  hamlet?: string;
  postcode?: string;
  [key: string]: unknown;
}

export interface ReverseGeocodeResult extends GeocodeResult {
  address?: ReverseGeocodeAddress;
}

export interface ReverseGeocodeOptions {
  /** Nominatim-compatible reverse endpoint. */
  endpoint?: string;
  /** ISO 3166-1 alpha-2 country code to bias results to. Default `"np"`. */
  countryCode?: string;
  /** Optional AbortSignal to cancel an in-flight request. */
  signal?: AbortSignal;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * Reverse-geocode lat/lng → structured place via Nominatim `/reverse`.
 *
 * Pure `fetch` — no `window` / `leaflet` import — so it is safe to call from
 * client components and is exported from the `@repo/ui` barrel alongside the
 * forward-geocoding `<LocationSearch>`.
 *
 * Returns `null` when the request fails, is aborted, or Nominatim has no
 * data for the point (so callers can degrade gracefully).
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
  {
    endpoint = "https://nominatim.openstreetmap.org/reverse",
    countryCode = "np",
    signal,
  }: ReverseGeocodeOptions = {},
): Promise<ReverseGeocodeResult | null> {
  let res: Response;
  try {
    res = await fetch(
      `${endpoint}?format=json&lat=${lat}&lon=${lng}&countrycodes=${countryCode}&accept-language=en`,
      { signal },
    );
  } catch (err) {
    // AbortError is expected when a newer request supersedes this one.
    if (err instanceof Error && err.name === "AbortError") return null;
    throw err;
  }

  if (!res.ok) return null;

  const data: {
    place_id?: number | string;
    display_name?: string;
    address?: ReverseGeocodeAddress;
    [key: string]: unknown;
  } = await res.json();

  if (!data.display_name) return null;

  return {
    id: data.place_id ?? `${lat},${lng}`,
    displayName: data.display_name,
    lat,
    lng,
    address: data.address,
  };
}
