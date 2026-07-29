import { Marker, Region } from "app/types/nepal-map";

export const navLinks = [
  { label: "Area Guides", href: "/area-guid" },
  { label: "NRN Concierge", href: "/nrn-concierge" },
  { label: "Listings", href: "/listings" },
  { label: "About", href: "/about" },
];

export const DISTRICTS = [
  {
    name: "Kathmandu",
    badge: "Cadastral Cleared",
    badgeColor: "bg-primary text-on-primary",
    desc: "Metropolitan core. High density commercial and premium residential zoning.",
    rate: "Rs 4.5M/Aana",
    trend: "+5.2% YOY",
    trendUp: true,
    map: "from-[#4A5A4A] to-[#2A3A2A]",
  },
  {
    name: "Pokhara",
    badge: "NRN Zone",
    badgeColor: "bg-secondary-container text-primary",
    desc: "Tourism hub. Strategic plots for hospitality and expat residential development.",
    rate: "Rs 2.8M/Aana",
    trend: "+8.1% YOY",
    trendUp: true,
    map: "from-[#C8C0B0] to-[#A89880]",
  },
  {
    name: "Lalitpur",
    badge: "Cadastral Cleared",
    badgeColor: "bg-primary text-on-primary",
    desc: "Heritage conservation alongside modern infrastructure. Mixed-use zoning.",
    rate: "Rs 3.9M/Aana",
    trend: "+4.5% YOY",
    trendUp: true,
    map: "from-[#E8E4DC] to-[#C8C0B0]",
  },
  {
    name: "Bhaktapur",
    badge: "Pending Verification",
    badgeColor: "bg-surface-container text-on-surface-variant",
    desc: "Rapid residential expansion. High potential for peripheral agricultural land conversion.",
    rate: "Rs 1.5M/Aana",
    trend: "Stable",
    trendUp: null,
    map: "from-[#F0EDE6] to-[#D8D4CC]",
  },
];

export const pillars = [
  {
    icon: "📄",
    title: "Every Document Checked",
    desc: "We cross-reference the Lalpurja (Title Deed) against the Malpot Office (Land Revenue) master ledger to ensure zero discrepancies in ownership history.",
  },
  {
    icon: "📍",
    title: "Field Verification",
    desc: "Physical boundaries are physically measured and matched against the official Naksha (Cadastral Map). Road access is physically verified, not just assumed.",
  },
  {
    icon: "⚖",
    title: "Disputes Flagged",
    desc: "Properties involved in active inheritance disputes, banking liens, or encroaching on Guthi (Trust) land are immediately filtered out of the index.",
  },
];


export const MARKERS: Marker[] = [
  { id: 1,  price: "रू 41.5M", priceValue: 41.5, change: "12.4%", trend: "up",   lat: 27.7172, lng: 85.3240, area: "Lazimpat",    city: "Kathmandu", region: "Kathmandu Valley", verified: true,  description: "High-demand commercial & residential embassy district",  tags: ["Commercial", "Hot"],       sqFt: "3,800", psf: "10,920", tier: "premium"   },
  { id: 2,  price: "रू 34.2M", priceValue: 34.2, change: "8.1%",  trend: "up",   lat: 27.7291, lng: 85.3286, area: "Baluwatar",   city: "Kathmandu", region: "Kathmandu Valley", verified: true,  description: "Prime residential & diplomatic zone with elite schools",    tags: ["Diplomatic", "Premium"],   sqFt: "4,200", psf: "8,140",  tier: "premium"   },
  { id: 3,  price: "रू 28.9M", priceValue: 28.9, change: "6.7%",  trend: "up",   lat: 27.7170, lng: 85.3480, area: "Boudha",      city: "Kathmandu", region: "Kathmandu Valley", verified: true,  description: "Cultural hub with UNESCO heritage & strong rental demand",  tags: ["Rental", "Heritage"],      sqFt: "3,500", psf: "8,260",  tier: "premium"   },
  { id: 4,  price: "रू 22.4M", priceValue: 22.4, change: "4.2%",  trend: "up",   lat: 27.6780, lng: 85.3170, area: "Patan",       city: "Lalitpur",  region: "Kathmandu Valley", verified: true,  description: "Heritage city, rising mid-premium residential segment",    tags: ["Heritage", "Family"],      sqFt: "3,200", psf: "7,000",  tier: "standard"  },
  { id: 5,  price: "रू 18.6M", priceValue: 18.6, change: "3.1%",  trend: "up",   lat: 27.6710, lng: 85.4290, area: "Bhaktapur",  city: "Bhaktapur", region: "Kathmandu Valley", verified: false, description: "Ancient Newari city with growing real estate interest",    tags: ["Heritage", "Value"],       sqFt: "3,400", psf: "5,470",  tier: "standard"  },
  { id: 6,  price: "रू 19.8M", priceValue: 19.8, change: "9.3%",  trend: "up",   lat: 28.2096, lng: 83.9856, area: "Lakeside",    city: "Pokhara",   region: "Pokhara",          verified: true,  description: "Tourism & second-home hotspot with Phewa Lake frontage",   tags: ["Tourism", "Lake View"],    sqFt: "3,600", psf: "5,500",  tier: "premium"   },
  { id: 7,  price: "रू 14.2M", priceValue: 14.2, change: "5.6%",  trend: "up",   lat: 28.2380, lng: 83.9730, area: "Mahendrapool",city: "Pokhara",   region: "Pokhara",          verified: true,  description: "Commercial core of Pokhara with strong retail demand",     tags: ["Commercial", "Central"],   sqFt: "2,900", psf: "4,900",  tier: "standard"  },
  { id: 8,  price: "रू 11.5M", priceValue: 11.5, change: "7.8%",  trend: "up",   lat: 26.4525, lng: 87.2718, area: "Biratnagar", city: "Biratnagar", region: "Eastern",          verified: true,  description: "Industrial & trading gateway to Eastern Nepal markets",    tags: ["Industrial", "Trade"],     sqFt: "3,100", psf: "3,710",  tier: "standard"  },
  { id: 9,  price: "रू 9.8M",  priceValue: 9.8,  change: "4.5%",  trend: "up",   lat: 26.8120, lng: 87.2830, area: "Dharan",     city: "Dharan",    region: "Eastern",          verified: false, description: "Hill city with growing education & hospital infrastructure",tags: ["Hill", "Residential"],     sqFt: "2,800", psf: "3,500",  tier: "emerging"  },
  { id: 10, price: "रू 13.4M", priceValue: 13.4, change: "6.2%",  trend: "up",   lat: 27.6760, lng: 84.4330, area: "Bharatpur",  city: "Chitwan",   region: "Central & Terai",  verified: true,  description: "Fast-growing Terai commercial hub near Chitwan National Park",tags: ["Commercial", "Growth"],   sqFt: "3,300", psf: "4,060",  tier: "standard"  },
  { id: 11, price: "रू 8.9M",  priceValue: 8.9,  change: "2.1%",  trend: "flat", lat: 27.4290, lng: 85.0320, area: "Hetauda",    city: "Makwanpur", region: "Central & Terai",  verified: false, description: "Industrial corridor with steady long-term value retention", tags: ["Industrial"],              sqFt: "2,700", psf: "3,300",  tier: "emerging"  },
  { id: 12, price: "रू 10.2M", priceValue: 10.2, change: "5.9%",  trend: "up",   lat: 27.0100, lng: 84.8800, area: "Birgunj",    city: "Parsa",     region: "Central & Terai",  verified: true,  description: "Major India border trade city with logistics infrastructure",tags: ["Trade", "Border"],        sqFt: "3,000", psf: "3,400",  tier: "standard"  },
  { id: 13, price: "रू 12.1M", priceValue: 12.1, change: "8.4%",  trend: "up",   lat: 27.7000, lng: 83.4500, area: "Butwal",     city: "Rupandehi", region: "Western",          verified: true,  description: "Rapidly expanding commercial center near Lumbini corridor",tags: ["Growth", "Commercial"],   sqFt: "3,200", psf: "3,780",  tier: "standard"  },
  { id: 14, price: "रू 9.4M",  priceValue: 9.4,  change: "3.8%",  trend: "up",   lat: 27.5060, lng: 83.4460, area: "Bhairahawa", city: "Rupandehi", region: "Western",          verified: false, description: "International airport city with Lumbini Buddhist tourism link",tags: ["Tourism", "Border"],     sqFt: "2,900", psf: "3,240",  tier: "emerging"  },
  { id: 15, price: "रू 7.6M",  priceValue: 7.6,  change: "1.2%",  trend: "flat", lat: 28.0500, lng: 81.6167, area: "Nepalgunj",  city: "Banke",     region: "Western",          verified: true,  description: "Western Terai commercial node with regional trade dominance",tags: ["Commercial", "Terai"],    sqFt: "2,600", psf: "2,920",  tier: "emerging"  },
];

export const REGIONS: Region[] = [
  "Kathmandu Valley",
  "Pokhara",
  "Eastern",
  "Central & Terai",
  "Western",
];

export const REGION_CENTERS: Record<Region, [number, number]> = {
  "Kathmandu Valley": [27.70, 85.36],
  "Pokhara":          [28.22, 83.98],
  "Eastern":          [26.63, 87.28],
  "Central & Terai":  [27.04, 84.86],
  "Western":          [27.78, 82.55],
};