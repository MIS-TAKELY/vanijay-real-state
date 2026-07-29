"use client";
import dynamic from "next/dynamic";
import { MARKERS } from "constants/varibles-constants";

const NepalmapWrapper = () => {
  const NepalMap = dynamic(() => import("components/nepalmap/NepalMap"), {
    ssr: false,
  });

  return <NepalMap markers={MARKERS} />;
};

export default NepalmapWrapper;
