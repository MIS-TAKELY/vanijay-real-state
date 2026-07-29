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

export const about_stats = [
  { value: "74", label: "Districts Indexed" },
  { value: "12,000+", label: "Verified Listings" },
  { value: "0%", label: "Title Discrepancies" },
  { value: "100%", label: "Field-Verified" },
];
