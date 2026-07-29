import NepalmapWrapper from "components/pages/home/NepalmapWrapper";
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

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStack />
      <BrowseByIntent />
      <NepalmapWrapper />
      <PropertyCarousel />
      <VerificationSteps />
      <ActivityTicker />
      <AskArchive />
      <NRNConcierge />
    </>
  );
}

