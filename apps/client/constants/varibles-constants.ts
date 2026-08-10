import { Marker, Region } from "types/nepal-map";

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
  {
    id: 1,
    price: "रू 41.5M",
    priceValue: 41.5,
    change: "12.4%",
    trend: "up",
    lat: 27.7172,
    lng: 85.324,
    area: "Lazimpat",
    city: "Kathmandu",
    region: "Kathmandu Valley",
    verified: true,
    description: "High-demand commercial & residential embassy district",
    tags: ["Commercial", "Hot"],
    sqFt: "3,800",
    psf: "10,920",
    tier: "premium",
  },
  {
    id: 2,
    price: "रू 34.2M",
    priceValue: 34.2,
    change: "8.1%",
    trend: "up",
    lat: 27.7291,
    lng: 85.3286,
    area: "Baluwatar",
    city: "Kathmandu",
    region: "Kathmandu Valley",
    verified: true,
    description: "Prime residential & diplomatic zone with elite schools",
    tags: ["Diplomatic", "Premium"],
    sqFt: "4,200",
    psf: "8,140",
    tier: "premium",
  },
  {
    id: 3,
    price: "रू 28.9M",
    priceValue: 28.9,
    change: "6.7%",
    trend: "up",
    lat: 27.717,
    lng: 85.348,
    area: "Boudha",
    city: "Kathmandu",
    region: "Kathmandu Valley",
    verified: true,
    description: "Cultural hub with UNESCO heritage & strong rental demand",
    tags: ["Rental", "Heritage"],
    sqFt: "3,500",
    psf: "8,260",
    tier: "premium",
  },
  {
    id: 4,
    price: "रू 22.4M",
    priceValue: 22.4,
    change: "4.2%",
    trend: "up",
    lat: 27.678,
    lng: 85.317,
    area: "Patan",
    city: "Lalitpur",
    region: "Kathmandu Valley",
    verified: true,
    description: "Heritage city, rising mid-premium residential segment",
    tags: ["Heritage", "Family"],
    sqFt: "3,200",
    psf: "7,000",
    tier: "standard",
  },
  {
    id: 5,
    price: "रू 18.6M",
    priceValue: 18.6,
    change: "3.1%",
    trend: "up",
    lat: 27.671,
    lng: 85.429,
    area: "Bhaktapur",
    city: "Bhaktapur",
    region: "Kathmandu Valley",
    verified: false,
    description: "Ancient Newari city with growing real estate interest",
    tags: ["Heritage", "Value"],
    sqFt: "3,400",
    psf: "5,470",
    tier: "standard",
  },
  {
    id: 6,
    price: "रू 19.8M",
    priceValue: 19.8,
    change: "9.3%",
    trend: "up",
    lat: 28.2096,
    lng: 83.9856,
    area: "Lakeside",
    city: "Pokhara",
    region: "Pokhara",
    verified: true,
    description: "Tourism & second-home hotspot with Phewa Lake frontage",
    tags: ["Tourism", "Lake View"],
    sqFt: "3,600",
    psf: "5,500",
    tier: "premium",
  },
  {
    id: 7,
    price: "रू 14.2M",
    priceValue: 14.2,
    change: "5.6%",
    trend: "up",
    lat: 28.238,
    lng: 83.973,
    area: "Mahendrapool",
    city: "Pokhara",
    region: "Pokhara",
    verified: true,
    description: "Commercial core of Pokhara with strong retail demand",
    tags: ["Commercial", "Central"],
    sqFt: "2,900",
    psf: "4,900",
    tier: "standard",
  },
  {
    id: 8,
    price: "रू 11.5M",
    priceValue: 11.5,
    change: "7.8%",
    trend: "up",
    lat: 26.4525,
    lng: 87.2718,
    area: "Biratnagar",
    city: "Biratnagar",
    region: "Eastern",
    verified: true,
    description: "Industrial & trading gateway to Eastern Nepal markets",
    tags: ["Industrial", "Trade"],
    sqFt: "3,100",
    psf: "3,710",
    tier: "standard",
  },
  {
    id: 9,
    price: "रू 9.8M",
    priceValue: 9.8,
    change: "4.5%",
    trend: "up",
    lat: 26.812,
    lng: 87.283,
    area: "Dharan",
    city: "Dharan",
    region: "Eastern",
    verified: false,
    description: "Hill city with growing education & hospital infrastructure",
    tags: ["Hill", "Residential"],
    sqFt: "2,800",
    psf: "3,500",
    tier: "emerging",
  },
  {
    id: 10,
    price: "रू 13.4M",
    priceValue: 13.4,
    change: "6.2%",
    trend: "up",
    lat: 27.676,
    lng: 84.433,
    area: "Bharatpur",
    city: "Chitwan",
    region: "Central & Terai",
    verified: true,
    description: "Fast-growing Terai commercial hub near Chitwan National Park",
    tags: ["Commercial", "Growth"],
    sqFt: "3,300",
    psf: "4,060",
    tier: "standard",
  },
  {
    id: 11,
    price: "रू 8.9M",
    priceValue: 8.9,
    change: "2.1%",
    trend: "flat",
    lat: 27.429,
    lng: 85.032,
    area: "Hetauda",
    city: "Makwanpur",
    region: "Central & Terai",
    verified: false,
    description: "Industrial corridor with steady long-term value retention",
    tags: ["Industrial"],
    sqFt: "2,700",
    psf: "3,300",
    tier: "emerging",
  },
  {
    id: 12,
    price: "रू 10.2M",
    priceValue: 10.2,
    change: "5.9%",
    trend: "up",
    lat: 27.01,
    lng: 84.88,
    area: "Birgunj",
    city: "Parsa",
    region: "Central & Terai",
    verified: true,
    description: "Major India border trade city with logistics infrastructure",
    tags: ["Trade", "Border"],
    sqFt: "3,000",
    psf: "3,400",
    tier: "standard",
  },
  {
    id: 13,
    price: "रू 12.1M",
    priceValue: 12.1,
    change: "8.4%",
    trend: "up",
    lat: 27.7,
    lng: 83.45,
    area: "Butwal",
    city: "Rupandehi",
    region: "Western",
    verified: true,
    description: "Rapidly expanding commercial center near Lumbini corridor",
    tags: ["Growth", "Commercial"],
    sqFt: "3,200",
    psf: "3,780",
    tier: "standard",
  },
  {
    id: 14,
    price: "रू 9.4M",
    priceValue: 9.4,
    change: "3.8%",
    trend: "up",
    lat: 27.506,
    lng: 83.446,
    area: "Bhairahawa",
    city: "Rupandehi",
    region: "Western",
    verified: false,
    description:
      "International airport city with Lumbini Buddhist tourism link",
    tags: ["Tourism", "Border"],
    sqFt: "2,900",
    psf: "3,240",
    tier: "emerging",
  },
  {
    id: 15,
    price: "रू 7.6M",
    priceValue: 7.6,
    change: "1.2%",
    trend: "flat",
    lat: 28.05,
    lng: 81.6167,
    area: "Nepalgunj",
    city: "Banke",
    region: "Western",
    verified: true,
    description: "Western Terai commercial node with regional trade dominance",
    tags: ["Commercial", "Terai"],
    sqFt: "2,600",
    psf: "2,920",
    tier: "emerging",
  },
];

export const REGIONS: Region[] = [
  "Kathmandu Valley",
  "Pokhara",
  "Eastern",
  "Central & Terai",
  "Western",
];

export const REGION_CENTERS: Record<Region, [number, number]> = {
  "Kathmandu Valley": [27.7, 85.36],
  Pokhara: [28.22, 83.98],
  Eastern: [26.63, 87.28],
  "Central & Terai": [27.04, 84.86],
  Western: [27.78, 82.55],
};

export const stats = [
  { value: "12,482", label: "Verified Listings" },
  { value: "74", label: "Districts Covered" },
  { value: "0%", label: "Title Discrepancies" },
];

export const browseCards = [
  {
    title: "Browse Land",
    description:
      "Filter by area, soil quality, and future infrastructure plans.",
    icon: "arrow_forward",
    variant: "default" as const,
  },
  {
    title: "Browse Buildings",
    description:
      "Pre-inspected commercial and residential assets with full history.",
    icon: "arrow_forward",
    variant: "default" as const,
  },
  {
    title: "What's My Land Worth?",
    description:
      "Get an archival-grade valuation based on verified transaction data.",
    icon: "analytics",
    variant: "primary" as const,
  },
];

export const trustItems = [
  { icon: "description", text: "Every document checked before listing" },
  { icon: "location_on", text: "Field verification, not just paperwork" },
  {
    icon: "verified_user",
    text: "You'll always know what's disputed or clear",
  },
];

export interface Property {
  id: string;
  location: string;
  title: string;
  plotId: string;
  size: string;
  price: string;
  image: string;
  alt: string;
}

export const properties: Property[] = [
  {
    id: "1",
    location: "Bhaktapur - Sector 04",
    title: "Mountain View Estate Plot",
    plotId: "BK-44102",
    size: "4.5 Aana",
    price: "रू 24,500,000",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBx-ORyBwj6oYzqTpSn7QY5OrynAjIRBEV2P7G2FywW2BzOy8a7IzdlJT29eEjpoupPL1YnAa8yYlQ6BjtpIZMmR2LbRtlUJlyOEYqxzMC-jm-4x1d2P0JvzgnCkJIPIs0oy6wNCB1Z805bMMnonOW_knMwjt1MmUtBwNnz8kTcACoolXkspjN4v_v1oADoElqpg16XpBAyxYdWxzjimrlhFGfvcdVhWYaaVIEDxc3btiLVXxTuFprmfQRQ5F7XttVB37wYmSayQgg",
    alt: "Prime Land Plot",
  },
  {
    id: "2",
    location: "Lalitpur - Patan Heritage",
    title: "Refurbished Commercial Loft",
    plotId: "LT-9902",
    size: "1,200 SqFt",
    price: "रू 52,000,000",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCwGcMtLGfKoSUnpWGH9wo0TgdIPN-bGosQvG_M-vjID8DcCpHH3H5OAM0-BytOMK7bd6glY7y1BzBqiKXomRnnksOwzZw1pF-ck_W3QBaa0ArIR1dy8r3m_NOP4-XUp7Vw75zyNsRVBgU89V6ev1Cr2lvMZgocxGOFDL-5Idsf4fYV08M0F8BTP3x-TvDvTEx94p_v63b3e0TSQi7n-nNjDdkpOexp7AdsULBXzHON29G4XASR8-EAPwtfavJZ2pXf2jVJm0QDVFM",
    alt: "Commercial Loft",
  },
  {
    id: "3",
    location: "Pokhara - Lakeside South",
    title: "Fertile Multi-Use Plot",
    plotId: "PK-1108",
    size: "1.2 Ropani",
    price: "रू 18,700,000",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCkgfgcvBCs4awPzbDmkhjk-YlSQy_V72_mpHIHTEsNoYYsIvhraaMfRtx7uP1mEbwYmRs3X20z-ekTobs1kndsP5aXB2cP9r_dFiOY6wqYaAPakTuvtt5lddIV7JOfZPCovWkoLZgXgcJ-MtVjymoZuAE7c0SJvrYMabmjJKvoTjgXSYFCWehPWaLtk5MIRzDH-R-qBNPz7OEZvv6bmOH5uG3Are5nnyRTpqbcNzigMbzsg4QR4xwpJ7rQsSrfvG_9FTO9y8fYvgw",
    alt: "Fertile Plot",
  },
];

export const steps = [
  {
    number: "01",
    title: "Document Audit",
    description:
      "Deep audit of ownership history, tax clearances, and cadastral maps from Land Revenue Offices.",
    icon: null,
  },
  {
    number: "02",
    title: "Field Verification",
    description:
      "Physical visit by our certified surveyors to confirm boundaries, topography, and absence of physical disputes.",
    icon: null,
  },
  {
    number: null,
    title: "Archival Stamp",
    description:
      "The property is awarded the 'Verified' status and indexed into our public-trust archival platform.",
    icon: "check_circle",
  },
];

export const tickerItems = [
  "#LT-9923 SOLD • रू 45,000,000",
  "VERIFICATION IN PROGRESS: DISTRICT LAMJUNG",
  "#BK-1102 NEW LISTING • रू 12,800,000",
  "ANNUAL VALUATION UPDATE: KATHMANDU +8.4%",
];

export const archiveCards = [
  {
    category: "Title Inquiry",
    question: "How do I know if a Guthi land plot is safely transferable?",
    action: "Read Analysis",
  },
  {
    category: "Investment Strategy",
    question:
      "What is the projected price trend for plots near the new bypass?",
    action: "View Projections",
  },
  {
    category: "Process Transparency",
    question:
      "What specific field checks are done during Lekhaprati verification?",
    action: "See Methodology",
  },
];

export const team = [
  {
    name: "Aayush Shrestha",
    role: "Founder & Archivist",
    bio: "Former surveyor at the Department of Land Reform & Management. Over a decade of experience in cadastral mapping and land dispute resolution across Bagmati and Gandaki provinces.",
  },
  {
    name: "Priya Sharma",
    role: "Director of Operations",
    bio: "Chartered accountant specializing in Nepali real estate compliance. Previously led due diligence for cross-border property investments at a Kathmandu-based law firm.",
  },
  {
    name: "Rabi Thapa",
    role: "Head of Field Verification",
    bio: "Licensed surveyor and GIS specialist. Has personally verified over 3,000 plots across 34 districts using drone photogrammetry and satellite overlay.",
  },
];

export const values = [
  {
    icon: "verified",
    title: "Archival Rigour",
    desc: "Every document checked against the source. We accept nothing less than the master record from the Land Revenue Office — no photocopies, no hearsay.",
  },
  {
    icon: "location_on",
    title: "Physical Presence",
    desc: "We go to the plot. Our surveyors measure boundaries, verify road access, and document the site with drone footage before any listing is approved.",
  },
  {
    icon: "balance",
    title: "Legal Transparency",
    desc: "Disputes are flagged, not hidden. Whether an inheritance conflict, a banking lien, or a Guthi trust encroachment, we surface it before the buyer commits.",
  },
  {
    icon: "shield",
    title: "Institutional Trust",
    desc: "We operate as a public-trust archive. Every verified plot is indexed with a permanent Archival ID and published for anyone to reference.",
  },
];

export const milestones = [
  {
    year: "2022",
    title: "The Idea",
    desc: "Co-founders identify the systemic title-dispute problem in Nepali real estate after witnessing a decade-long land conflict within their own families.",
  },
  {
    year: "2023",
    title: "Field Trials",
    desc: "Pilot verification programme across three Kathmandu wards. 47 plots field-checked; 22% had discrepancies. The model proves its necessity.",
  },
  {
    year: "2024",
    title: "Public Launch",
    desc: "Lekhaprati goes live as a public-trust archive. First 74 districts indexed; 12,000+ cadastral-cleared listings published.",
  },
  {
    year: "2025",
    title: "NRN Concierge",
    desc: "Launch of the Non-Resident Nepali concierge desk. Remote verification services extended to NRN citizens and FCNO investors worldwide.",
  },
];



export const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&h=900&fit=crop",
    headline: "Find Your Dream Property",
    subheadline: "Explore thousands of verified listings across the country. From luxury villas to cozy apartments, your perfect home awaits.",
    ctaPrimary: "Explore Properties",
    ctaSecondary: "List Your Property",
  },
  {
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=900&fit=crop",
    headline: "Luxury Living Redefined",
    subheadline: "Discover premium properties in the most sought-after neighborhoods. Verified listings, transparent pricing, seamless experience.",
    ctaPrimary: "Explore Properties",
    ctaSecondary: "List Your Property",
  },
  {
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&h=900&fit=crop",
    headline: "Smart Investments Start Here",
    subheadline: "Access detailed market insights, virtual tours, and direct owner contacts. Make informed decisions with confidence.",
    ctaPrimary: "Explore Properties",
    ctaSecondary: "List Your Property",
  },
];

export const categories = [
  { name: "Apartments", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200&h=200&fit=crop" },
  { name: "Villas", image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=200&h=200&fit=crop" },
  { name: "Land", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&h=200&fit=crop" },
  { name: "Commercial", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=200&fit=crop" },
  { name: "Rentals", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&h=200&fit=crop" },
  { name: "Farm Houses", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&h=200&fit=crop" },
  { name: "Plots", image: "https://images.unsplash.com/photo-1449156493391-d2cfa28e468b?w=200&h=200&fit=crop" },
  { name: "Offices", image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=200&h=200&fit=crop" },
];


export const trustValues = [
  { icon: "verified", title: "Verified Listings", description: "Every property is manually verified for authenticity" },
  { icon: "user", title: "Direct Owner Contact", description: "Connect directly with property owners, no middlemen" },
  { icon: "video", title: "Virtual Tours Available", description: "Explore properties from the comfort of your home" },
  { icon: "shield", title: "Secure Transactions", description: "End-to-end encrypted and legally compliant process" },
];

export interface ListingProperty {
  id: string;
  title: string;
  location: string;
  price: string;
  image: string;
  listingType: "For Sale" | "For Rent";
  beds?: number;
  baths?: number;
  sqft?: string;
  alt: string;
  listedDays?: string;
  highDemand?: boolean;
}

export const similarProperties: ListingProperty[] = [
  { id: "sim-1", title: "Modern 3BHK Apartment", location: "Bandra West, Mumbai", price: "₹ 2.5 Cr", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=450&fit=crop", listingType: "For Sale", beds: 3, baths: 2, sqft: "1,800 sqft", alt: "Modern apartment in Bandra" },
  { id: "sim-2", title: "Luxury Villa with Pool", location: "Juhu, Mumbai", price: "₹ 8.2 Cr", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=450&fit=crop", listingType: "For Sale", beds: 5, baths: 4, sqft: "4,500 sqft", alt: "Luxury villa with pool" },
  { id: "sim-3", title: "Spacious 2BHK for Rent", location: "Andheri East, Mumbai", price: "₹ 45,000/mo", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=450&fit=crop", listingType: "For Rent", beds: 2, baths: 2, sqft: "1,100 sqft", alt: "2BHK apartment in Andheri" },
  { id: "sim-4", title: "Penthouse with City View", location: "Worli, Mumbai", price: "₹ 5.1 Cr", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=450&fit=crop", listingType: "For Sale", beds: 4, baths: 3, sqft: "3,200 sqft", alt: "Penthouse in Worli" },
  { id: "sim-5", title: "Cozy Studio Apartment", location: "Powai, Mumbai", price: "₹ 28,000/mo", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=450&fit=crop", listingType: "For Rent", beds: 1, baths: 1, sqft: "650 sqft", alt: "Studio apartment in Powai" },
  { id: "sim-6", title: "Premium Office Space", location: "BKC, Mumbai", price: "₹ 1.8 Cr", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=450&fit=crop", listingType: "For Sale", beds: 0, baths: 2, sqft: "2,400 sqft", alt: "Office space in BKC" },
];

export const trendingProperties: ListingProperty[] = [
  { id: "trend-1", title: "Waterfront Luxury Condo", location: "Marine Drive, Mumbai", price: "₹ 4.7 Cr", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=450&fit=crop", listingType: "For Sale", beds: 3, baths: 3, sqft: "2,600 sqft", alt: "Waterfront condo", listedDays: "Listed 2 days ago", highDemand: true },
  { id: "trend-2", title: "Gated Community Villa", location: "Thane West, Mumbai", price: "₹ 3.9 Cr", image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&h=450&fit=crop", listingType: "For Sale", beds: 4, baths: 3, sqft: "3,100 sqft", alt: "Gated community villa", listedDays: "Listed 5 days ago", highDemand: true },
  { id: "trend-3", title: "Commercial Shop Space", location: "Dadar East, Mumbai", price: "₹ 95 Lakh", image: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=600&h=450&fit=crop", listingType: "For Rent", beds: 0, baths: 1, sqft: "800 sqft", alt: "Commercial shop space", listedDays: "Listed 1 day ago", highDemand: true },
  { id: "trend-4", title: "Hillside Bungalow", location: "Malabar Hill, Mumbai", price: "₹ 12 Cr", image: "https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=600&h=450&fit=crop", listingType: "For Sale", beds: 5, baths: 4, sqft: "5,500 sqft", alt: "Hillside bungalow", listedDays: "Listed 3 days ago", highDemand: true },
  { id: "trend-5", title: "Fully Furnished 1BHK", location: "Ghatkopar West, Mumbai", price: "₹ 32,000/mo", image: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600&h=450&fit=crop", listingType: "For Rent", beds: 1, baths: 1, sqft: "750 sqft", alt: "Furnished 1BHK", listedDays: "Listed 6 hours ago", highDemand: true },
];

export interface RecentlyViewedItem {
  id: string;
  title: string;
  location: string;
  price: string;
  image: string;
  alt: string;
}

export const recentlyViewed: RecentlyViewedItem[] = [
  { id: "rec-1", title: "Splendid 3BHK in Lokhandwala", location: "Andheri West, Mumbai", price: "₹ 2.1 Cr", image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400&h=250&fit=crop", alt: "3BHK in Lokhandwala" },
  { id: "rec-2", title: "Premium Plot in Kharghar", location: "Navi Mumbai", price: "₹ 85 Lakh", image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400&h=250&fit=crop", alt: "Plot in Kharghar" },
  { id: "rec-3", title: "Sea-Facing Apartment", location: "Juhu, Mumbai", price: "₹ 4.2 Cr", image: "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=400&h=250&fit=crop", alt: "Sea-facing apartment" },
  { id: "rec-4", title: "Independent House in Virar", location: "Virar West, Mumbai", price: "₹ 72 Lakh", image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=400&h=250&fit=crop", alt: "Independent house" },
  { id: "rec-5", title: "Retail Space in Inorbit Mall", location: "Malad West, Mumbai", price: "₹ 1.2 Cr", image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=250&fit=crop", alt: "Retail space in Malad" },
  { id: "rec-6", title: "Chawl Renovation Ready Unit", location: "Dadar West, Mumbai", price: "₹ 48 Lakh", image: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=400&h=250&fit=crop", alt: "Renovation ready unit" },
];

export interface FeaturedListing {
  id: string;
  title: string;
  location: string;
  description: string;
  price: string;
  image: string;
  alt: string;
  beds?: number;
  baths?: number;
  sqft?: string;
  agentName: string;
  agentAvatar: string;
}

export const featuredListings: FeaturedListing[] = [
  { id: "feat-1", title: "Grand Presidential Suite", location: "Altamount Road, Mumbai", description: "A rare opportunity to own a piece of Mumbai's most prestigious address. This meticulously designed residence features Italian marble flooring, a private elevator, panoramic city views, and a rooftop infinity pool. Every detail speaks luxury.", price: "₹ 18.5 Cr", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop", alt: "Presidential suite interior", beds: 5, baths: 6, sqft: "6,200 sqft", agentName: "Priya Kapoor", agentAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" },
  { id: "feat-2", title: "Heritage Bungalow by the Sea", location: "Juhu Tara, Mumbai", description: "An iconic heritage bungalow blending Art Deco charm with contemporary luxury. Set on a sprawling plot with a private beach access, landscaped gardens, and a state-of-the-art home theater. Perfect for collectors and connoisseurs.", price: "₹ 22 Cr", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop", alt: "Heritage bungalow exterior", beds: 6, baths: 5, sqft: "7,800 sqft", agentName: "Rohan Mehta", agentAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
  { id: "feat-3", title: "Sky Villa in Lower Parel", location: "Prestige Ozone, Mumbai", description: "Perched above the city skyline, this sky villa redefines urban living with its double-height living room, private terrace garden, and wraparound views of the Arabian Sea. Smart-home automation throughout.", price: "₹ 9.8 Cr", image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&h=600&fit=crop", alt: "Sky villa living room", beds: 4, baths: 4, sqft: "4,100 sqft", agentName: "Ananya Iyer", agentAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
];


export const about_stats = [
  { value: "74", label: "Districts Indexed" },
  { value: "12,000+", label: "Verified Listings" },
  { value: "0%", label: "Title Discrepancies" },
  { value: "100%", label: "Field-Verified" },
];
