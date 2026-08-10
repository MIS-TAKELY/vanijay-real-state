import NepalmapWrapper from "components/pages/home/NepalmapWrapper";
import {
  ActivityTicker,
  AskArchive,
  BrowseByIntent,
  FeaturedListings,
  Hero,
  NRNConcierge,
  PropertyCarousel,
  RecentlyViewed,
  TrendingProperties,
  TrustStack,
  VerificationSteps,
} from "../components/pages/home";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStack />
      <BrowseByIntent />
      <NepalmapWrapper />
      <PropertyCarousel />
      <TrendingProperties />
      <FeaturedListings />
      <RecentlyViewed />
      <VerificationSteps />
      <ActivityTicker />
      <AskArchive />
      <NRNConcierge />
    </>
  );
}

