"use client";

import type { Marker, Region } from "components/real-state/googlemap/types";
import { stripHtml } from "components/real-state/googlemap/utils";
import { MARKERS, REGION_CENTERS } from "constants/varibles-constants";
import { fetchFeedPageGraphql } from "lib/api/services/properties";
import type { ApiProperty } from "lib/api/services/properties/types";
import dynamic from "next/dynamic";
import { memo, useEffect, useMemo, useState } from "react";

/** Single source of truth for the map's rendered height — the lazy-loading
 *  placeholder must occupy the same box as the hydrated map so the layout
 *  doesn't jump when the bundle arrives. */
export const NEPAL_MAP_HEIGHT = "clamp(100px, 34vh, 400px)";

const LeafletNepalMapDynamic = dynamic(
  () => import("components/real-state/leaflet-map/LeafletNepalMap"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          height: NEPAL_MAP_HEIGHT,
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
        // className={`h-${NEPAL_MAP_HEIGHT} xs:h-[50px]`}
      >
        Loading map…
      </div>
    ),
  },
);

export interface NepalMapWrapperProps {
  markers?: Marker[];
  height?: string;
  className?: string;
  onMarkerSelect?: (marker: Marker | null) => void;
}

/* ─── DB property → Marker mapping ────────────────────────────────── */

const REGION_DISTRICTS: Record<Region, string[]> = {
  "Kathmandu Valley": ["Kathmandu", "Lalitpur", "Bhaktapur"],
  Pokhara: ["Kaski", "Tanahun", "Syangja", "Lamjung"],
  Eastern: [
    "Morang",
    "Sunsari",
    "Jhapa",
    "Ilam",
    "Panchthar",
    "Taplejung",
    "Sankhuwasabha",
    "Solukhumbu",
    "Khotang",
    "Bhojpur",
    "Dhankuta",
    "Terhathum",
    "Udayapur",
    "Saptari",
    "Siraha",
    "Okhaldhunga",
  ],
  "Central & Terai": [
    "Chitwan",
    "Makwanpur",
    "Parsa",
    "Bara",
    "Rautahat",
    "Sarlahi",
    "Mahottari",
    "Dhanusa",
    "Sindhuli",
    "Ramechhap",
    "Kavrepalanchok",
    "Sindhupalchok",
    "Dolakha",
    "Rasuwa",
    "Nuwakot",
    "Dhading",
    "Gorkha",
  ],
  Western: [
    "Rupandehi",
    "Banke",
    "Kapilvastu",
    "Nawalparasi",
    "Palpa",
    "Arghakhanchi",
    "Gulmi",
    "Dang",
    "Pyuthan",
    "Rolpa",
    "Salyan",
    "Rukum",
    "Dailekh",
    "Jajarkot",
    "Surkhet",
    "Bardiya",
    "Kailali",
    "Kanchanpur",
    "Doti",
    "Achham",
    "Bajhang",
    "Bajura",
    "Baitadi",
    "Darchula",
    "Baglung",
    "Myagdi",
    "Parbat",
  ],
};

function distanceSq(a: [number, number], b: [number, number]): number {
  const dLat = a[0] - b[0];
  const dLng = (a[1] - b[1]) * Math.cos((a[0] * Math.PI) / 180);
  return dLat * dLat + dLng * dLng;
}

function districtToRegion(district: string, lat: number, lng: number): Region {
  const name = district.trim().toLowerCase();
  for (const [region, districts] of Object.entries(REGION_DISTRICTS)) {
    if (districts.some((d) => d.toLowerCase() === name)) {
      return region as Region;
    }
  }
  // Fallback: nearest region center by approximate distance.
  let best: Region = "Kathmandu Valley";
  let bestDist = Infinity;
  for (const [region, center] of Object.entries(REGION_CENTERS)) {
    const dist = distanceSq(center, [lat, lng]);
    if (dist < bestDist) {
      bestDist = dist;
      best = region as Region;
    }
  }
  return best;
}

function toMarker(p: ApiProperty): Marker | null {
  const lat = p.location?.latitude;
  const lng = p.location?.longitude;
  if (lat == null || lng == null) return null;

  const district = p.location?.district ?? "";
  const area = p.location?.areaName || p.location?.municipality || district;
  const sqFt = p.landArea?.totalSqFt ?? 0;
  const priceM = p.askingPrice / 1_000_000;
  const psf = sqFt > 0 ? Math.round(p.askingPrice / sqFt) : 0;
  const verified =
    p.verificationLevel === "LEVEL_2_DOC_VERIFIED" ||
    p.verificationLevel === "LEVEL_3_FIELD_VERIFIED";

  const plainDesc = stripHtml(p.description);

  return {
    id: p.id,
    price: `रू ${priceM.toFixed(1)}M`,
    priceValue: Number(priceM.toFixed(2)),
    change: "0%",
    trend: "flat",
    lat,
    lng,
    area: area || district || "Nepal",
    city: district,
    region: districtToRegion(district, lat, lng),
    verified,
    description:
      plainDesc || `Property in ${area || district || "Nepal"} — ${p.title}`,
    tags: [
      p.subCategory.replace(/_/g, " "),
      verified ? "Verified" : "Listing",
    ],
    sqFt: sqFt > 0 ? sqFt.toLocaleString("en-US") : "—",
    psf: psf > 0 ? psf.toLocaleString("en-US") : "—",
    tier: priceM >= 20 ? "premium" : priceM >= 8 ? "standard" : "emerging",
  };
}

/* ─── Component ───────────────────────────────────────────────────── */

const NepalmapWrapper = memo(function NepalmapWrapper({
  markers,
  height = NEPAL_MAP_HEIGHT,
  ...rest
}: NepalMapWrapperProps) {
  const [dbMarkers, setDbMarkers] = useState<Marker[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchFeedPageGraphql({ first: 100 })
      .then((page) => {
        if (cancelled) return;
        const mapped = page.items
          .map(toMarker)
          .filter((m): m is Marker => m !== null);
        setDbMarkers(mapped);
      })
      .catch(() => {
        // Fall back to the curated constants when the API is unreachable.
        if (!cancelled) setDbMarkers(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const resolvedMarkers = useMemo(() => {
    if (markers) return markers;
    return dbMarkers && dbMarkers.length > 0 ? dbMarkers : MARKERS;
  }, [markers, dbMarkers]);

  const props = useMemo(
    () => ({ markers: resolvedMarkers, height, ...rest }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolvedMarkers, height, JSON.stringify(rest)],
  );

  return <LeafletNepalMapDynamic {...props} />;
});

export default NepalmapWrapper;
