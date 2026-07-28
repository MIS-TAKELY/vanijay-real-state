import { ArchitectureOfTrust } from "app/components/pages/area-guid/ArchitectureOfTrust";
import { DistrictLedgers } from "app/components/pages/area-guid/DistrictLedgers";
import { NRNBanner } from "app/components/pages/area-guid/NRNBanner";
import { Hero } from "app/components/pages/area-guid/Hero";

export default function AreaGuidesPage() {
  return (
    <>
      <Hero />
      <DistrictLedgers />
      <NRNBanner />
      <ArchitectureOfTrust />
    </>
  );
}
