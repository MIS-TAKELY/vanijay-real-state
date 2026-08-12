import { ArchitectureOfTrust } from "components/real-state/pages/area-guid/ArchitectureOfTrust";
import { DistrictLedgers } from "components/real-state/pages/area-guid/DistrictLedgers";
import { Hero } from "components/real-state/pages/area-guid/Hero";
import { NRNBanner } from "components/real-state/pages/area-guid/NRNBanner";

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
