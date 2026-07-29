"use client";

import dynamic from "next/dynamic";
import {
  ActivityTicker,
  AskArchive,
  BrowseByIntent,
  Hero,
  NRNConcierge,
  PropertyCarousel,
  TrustStack,
  VerificationSteps,
} from "../components/pages/home";

// Dynamically import NepalMap with SSR disabled (Leaflet requires browser APIs)
const NepalMap = dynamic(() => import("../components/pages/home/Nepalmap"), {
  ssr: false,
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStack />
      <BrowseByIntent />
      <NepalMap />
      <PropertyCarousel />
      <VerificationSteps />
      <ActivityTicker />
      <AskArchive />
      <NRNConcierge />
    </>
  );
}
