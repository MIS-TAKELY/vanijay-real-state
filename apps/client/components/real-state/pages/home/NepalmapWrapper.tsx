"use client";

import dynamic from "next/dynamic";
import { memo, useMemo } from "react";
import { MARKERS } from "constants/varibles-constants";
import type { Marker } from "components/real-state/googlemap/types";

const LeafletNepalMapDynamic = dynamic(
  () => import("components/real-state/leaflet-map/LeafletNepalMap"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          height: "clamp(420px, 52vh, 620px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(13,26,20,0.6)",
          color: "#4ade80",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.05em",
        }}
        aria-busy="true"
        aria-label="Loading interactive map"
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

const NepalmapWrapper = memo(function NepalmapWrapper({
  markers = MARKERS,
  ...rest
}: NepalMapWrapperProps) {
  const props = useMemo(
    () => ({ markers, ...rest }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [markers, JSON.stringify(rest)],
  );

  return <LeafletNepalMapDynamic {...props} />;
});

export default NepalmapWrapper;



