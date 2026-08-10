"use client";

import type { GeocodeResult } from "./LocationSearch";
import type {
  ReverseGeocodeAddress,
  ReverseGeocodeResult,
} from "./reverseGeocode";

/* ------------------------------------------------------------------ */
/*  Google Geocoding API — reverse geocoding                            */
/* ------------------------------------------------------------------ */

/**
 * Reverse-geocode lat/lng → structured place via Google's Geocoding API.
 *
 * Maps Google's `address_components` hierarchy onto the same
 * {@link ReverseGeocodeAddress} shape the Nominatim-backed `reverseGeocode`
 * produces, so downstream consumers (e.g. the listing wizard's
 * `buildLocationPatch`) work with either provider unchanged:
 *
 *   country                 → country
 *   administrative_area_1   → state        (e.g. "Bagmati Province")
 *   administrative_area_2   → county       (e.g. "Lalitpur District")
 *   administrative_area_3   → municipality (e.g. "Lalitpur Metropolitan City")
 *   locality / sublocality… → city / suburb
 *   route                   → road
 *   premise / intersection… → displayName pieces
 *
 * Returns `null` on network failure, HTTP errors or when Google has no
 * results for the point, letting callers fall back to another provider.
 */

export interface GoogleReverseGeocodeOptions {
  /** Google Maps Platform API key (client-side Geocoding key). */
  apiKey: string;
  /** REST endpoint — override for proxies/tests. */
  endpoint?: string;
  /** BCP-47 language for the results. Default `"en"`. */
  language?: string;
  /** AbortSignal to cancel an in-flight request. */
  signal?: AbortSignal;
}

interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GoogleGeocodeEntry {
  place_id?: string;
  formatted_address?: string;
  address_components?: GoogleAddressComponent[];
}

interface GoogleGeocodeResponse {
  status?: string;
  results?: GoogleGeocodeEntry[];
}

function pickComponent(
  components: GoogleAddressComponent[] | undefined,
  ...types: string[]
): string | undefined {
  if (!components) return undefined;
  for (const t of types) {
    const hit = components.find((c) => c.types.includes(t));
    if (hit?.long_name) return hit.long_name;
  }
  return undefined;
}

export async function reverseGeocodeGoogle(
  lat: number,
  lng: number,
  {
    apiKey,
    endpoint = "https://maps.googleapis.com/maps/api/geocode/json",
    language = "en",
    signal,
  }: GoogleReverseGeocodeOptions,
): Promise<(ReverseGeocodeResult & { address: ReverseGeocodeAddress }) | null> {
  if (!apiKey) return null;

  let res: Response;
  try {
    const params = new URLSearchParams({
      latlng: `${lat},${lng}`,
      key: apiKey,
      language,
      result_type: "street_address|premise|route|sublocality|locality|administrative_area_level_1",
    });
    res = await fetch(`${endpoint}?${params.toString()}`, { signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return null;
    throw err;
  }
  if (!res.ok) return null;

  const data = (await res.json()) as GoogleGeocodeResponse;
  const best = data.status === "OK" ? data.results?.[0] : undefined;
  const comps = best?.address_components;
  if (!best?.formatted_address) return null;

  const address: ReverseGeocodeAddress = {
    country: pickComponent(comps, "country"),
    state: pickComponent(comps, "administrative_area_level_1"),
    // Nepal's districts surface as level_2 on Google.
    county: pickComponent(comps, "administrative_area_level_2"),
    state_district: pickComponent(comps, "administrative_area_level_2"),
    municipality: pickComponent(comps, "administrative_area_level_3"),
    city: pickComponent(comps, "locality", "postal_town"),
    town: pickComponent(comps, "locality"),
    suburb: pickComponent(comps, "sublocality_level_1", "sublocality"),
    neighbourhood: pickComponent(comps, "neighborhood", "sublocality_level_2"),
    road: pickComponent(comps, "route"),
    hamlet: pickComponent(comps, "premise", "point_of_interest"),
    postcode: pickComponent(comps, "postal_code"),
  };

  return {
    id: best.place_id ?? `${lat},${lng}`,
    displayName: best.formatted_address,
    lat,
    lng,
    address,
  } satisfies ReverseGeocodeResult & { address: ReverseGeocodeAddress };
}

/** Re-export so a single import site can switch providers. */
export type { GeocodeResult };
