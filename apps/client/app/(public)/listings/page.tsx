import { Pagination } from "app/components/pages/listings/Pagination";
import { PropertyCard } from "app/components/pages/listings/PropertyCard";
import { ResultsHeader } from "app/components/pages/listings/ResultsHeader";
import { SearchFilters } from "app/components/pages/listings/SearchFilters";

const PROPERTIES = [
  {
    id: "8821-KTM",
    title: "Budhanilkantha Residential",
    price: "NPR 45,500,000",
    location: "Plot #42, Ward 03, Kathmandu",
    meta: ["0-8-2-1 RAPD", "Road Access: 20ft"],
    type: "residential",
    gradient: "from-[#A8C0A0] via-[#7A9A70] to-[#5A7A55]",
  },
  {
    id: "1042-LAL",
    title: "Jhamsikhel Commercial",
    price: "NPR 128,000,000",
    location: "Sector B, Ward 02, Lalitpur",
    meta: ["1-2-0-0 RAPD", "Road Access: 32ft"],
    type: "commercial",
    gradient: "from-[#C8C0B0] via-[#A89880] to-[#887860]",
  },
  {
    id: "5590-LAL",
    title: "Sanepa Luxury Apartment",
    price: "NPR 32,000,000",
    location: "The Zenith, Unit 4B, Sanepa",
    meta: ["1,850 Sq Ft", "3 BHK"],
    type: "apartment",
    gradient: "from-[#90A8C0] via-[#6A88A8] to-[#4A6888]",
  },
  {
    id: "2219-BKT",
    title: "Bhaktapur Heritage Plot",
    price: "NPR 18,500,000",
    location: "Siddhapokhari, Ward 01, Bhaktapur",
    meta: ["0-5-1-0 RAPD", "Road Access: 12ft"],
    type: "plot",
    gradient: "from-[#B0C8A0] via-[#88A870] to-[#688850]",
  },
];

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#1B1C19] antialiased">
      <main>
        <SearchFilters />
        <ResultsHeader />

        {/* Property grid */}
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROPERTIES.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>

        <Pagination />
      </main>
    </div>
  );
}
