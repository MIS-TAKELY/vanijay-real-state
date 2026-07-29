import { ArchitectureOfTrust } from "components/pages/area-guid/ArchitectureOfTrust";
import { DistrictLedgers } from "components/pages/area-guid/DistrictLedgers";
import { Hero } from "components/pages/area-guid/Hero";
import { NRNBanner } from "components/pages/area-guid/NRNBanner";

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
