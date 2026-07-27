import { EligibilityAndDocs } from "app/components/pages/nrn-concierge/EligibilityAndDocs";
import { Hero } from "app/components/pages/nrn-concierge/Hero";
import { ProcessAndBooking } from "app/components/pages/nrn-concierge/ProcessAndBooking";
import { RemoteWindow } from "app/components/pages/nrn-concierge/RemoteWindow";
import { VerifiedStamp } from "app/components/pages/nrn-concierge/VerifiedStamp";

export default function NRNConcierge() {
  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#1B1C19] antialiased">
      <main>
        <Hero />
        <EligibilityAndDocs />
        <ProcessAndBooking />
        <VerifiedStamp />
        <RemoteWindow />
      </main>
    </div>
  );
}
