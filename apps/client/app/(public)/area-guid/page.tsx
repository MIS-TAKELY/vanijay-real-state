import { AskQuestion } from "app/components/pages/area-guid/AskQuestion";
import { Hero } from "app/components/pages/area-guid/Hero";
import { Listings } from "app/components/pages/area-guid/Listings";
import { MarketSection } from "app/components/pages/area-guid/MarketSection";
import { Stats } from "app/components/pages/area-guid/Stats";

export default function BaluwatarAreaGuide() {
  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#1B1C19] antialiased">
      <main>
        {/* 1. Hero — establishes area context */}
        <Hero />

        {/* 2. Stats — key metrics & credibility signals */}
        <Stats />

        {/* 3. Listings — core value: actual properties for sale */}
        <Listings />

        {/* 4. MarketSection — deeper context: valuation + nearby amenities */}
        <MarketSection />

        {/* 5. AskQuestion — CTA for expert insights */}
        <AskQuestion />
      </main>
    </div>
  );
}
