"use client";

import dynamic from "next/dynamic";
import { memo, useMemo } from "react";
import { MARKERS, REGIONS, REGION_CENTERS } from "constants/varibles-constants";
import type { NepalMapProps } from "components/real-state/googlemap/types";

const GoogleNepalMapDynamic = dynamic(
  () =>
    import("components/real-state/googlemap").then((m) => ({
      default: m.GoogleNepalMap,
    })),
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

export interface NepalMapWrapperProps extends Omit<
  NepalMapProps,
  "markers" | "regions" | "regionCenters"
> {
  markers?: NepalMapProps["markers"];
  regions?: NepalMapProps["regions"];
  regionCenters?: NepalMapProps["regionCenters"];
}

const NepalmapWrapper = memo(function NepalmapWrapper({
  markers = MARKERS,
  regions = REGIONS,
  regionCenters = REGION_CENTERS,
  ...rest
}: NepalMapWrapperProps) {
  const props = useMemo<NepalMapProps>(
    () => ({ markers, regions, regionCenters, ...rest }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [markers, regions, regionCenters, JSON.stringify(rest)],
  );

  return <GoogleNepalMapDynamic {...props} />;
});

export default NepalmapWrapper;
