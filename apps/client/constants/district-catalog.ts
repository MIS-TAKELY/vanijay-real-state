/**
 * Nepal district catalog — single source of truth for the programmatic
 * area-guide pages at /area-guid/[slug].
 *
 * Each district gets a data-driven landing page populated from live verified
 * listings (propertiesFeed filtered by `district`). Slugs are stable,
 * lowercase-hyphenated forms of the official district names so URLs never
 * change even if display names are edited elsewhere.
 */

export type TopographyKey = "terai" | "hill" | "mountain" | "valley";

export type TierKey = "cadastral" | "field" | "pending";

export interface DistrictEntry {
  /** URL segment, e.g. "kathmandu", "nawalparasi-east". */
  slug: string;
  /** Official district name as stored on property records. */
  name: string;
  province:
    | "Koshi"
    | "Madhesh"
    | "Bagmati"
    | "Gandaki"
    | "Lumbini"
    | "Karnali"
    | "Sudurpashchim";
  /** Physical terrain classification used for area-guide filtering. */
  topography: TopographyKey;
  /** Land-record verification depth for this district. */
  tier: TierKey;
  /** Curated indicative average land rate in NPR per Aana (null = awaiting survey). */
  avgRatePerAana: number | null;
  /** Indicative year-over-year rate movement in percent (null = stable/no data). */
  trendPct: number | null;
  /** One-line market/zoning note shown on cards and profile pages. */
  description: string;
}

/** Display metadata for topography keys. */
export const TOPOGRAPHY_META: Record<
  TopographyKey,
  { label: string; icon: string }
> = {
  valley: { label: "Valley (Urban)", icon: "location_city" },
  terai: { label: "Flat (Terai)", icon: "landscape" },
  hill: { label: "Sloped (Hilly)", icon: "terrain" },
  mountain: { label: "Mountain (Himali)", icon: "filter_hdr" },
};

/** Display metadata for verification tiers. */
export const TIER_META: Record<
  TierKey,
  { label: string; shortLabel: string }
> = {
  cadastral: { label: "Cadastral Cleared (A)", shortLabel: "Cadastral Cleared" },
  field: { label: "Field Verified (B)", shortLabel: "Field Verified" },
  pending: {
    label: "Pending Verification",
    shortLabel: "Pending Verification",
  },
};

const RAW_DISTRICTS: Array<[DistrictEntry["province"], string]> = [
  // Koshi (14)
  ["Koshi", "Bhojpur"],
  ["Koshi", "Dhankuta"],
  ["Koshi", "Ilam"],
  ["Koshi", "Jhapa"],
  ["Koshi", "Khotang"],
  ["Koshi", "Morang"],
  ["Koshi", "Okhaldhunga"],
  ["Koshi", "Panchthar"],
  ["Koshi", "Sankhuwasabha"],
  ["Koshi", "Solukhumbu"],
  ["Koshi", "Sunsari"],
  ["Koshi", "Taplejung"],
  ["Koshi", "Terhathum"],
  ["Koshi", "Udayapur"],
  // Madhesh (8)
  ["Madhesh", "Bara"],
  ["Madhesh", "Dhanusha"],
  ["Madhesh", "Mahottari"],
  ["Madhesh", "Parsa"],
  ["Madhesh", "Rautahat"],
  ["Madhesh", "Saptari"],
  ["Madhesh", "Sarlahi"],
  ["Madhesh", "Siraha"],
  // Bagmati (13)
  ["Bagmati", "Bhaktapur"],
  ["Bagmati", "Chitwan"],
  ["Bagmati", "Dhading"],
  ["Bagmati", "Dolakha"],
  ["Bagmati", "Kathmandu"],
  ["Bagmati", "Kavrepalanchok"],
  ["Bagmati", "Lalitpur"],
  ["Bagmati", "Makwanpur"],
  ["Bagmati", "Nuwakot"],
  ["Bagmati", "Ramechhap"],
  ["Bagmati", "Rasuwa"],
  ["Bagmati", "Sindhuli"],
  ["Bagmati", "Sindhupalchok"],
  // Gandaki (11)
  ["Gandaki", "Baglung"],
  ["Gandaki", "Gorkha"],
  ["Gandaki", "Kaski"],
  ["Gandaki", "Lamjung"],
  ["Gandaki", "Manang"],
  ["Gandaki", "Mustang"],
  ["Gandaki", "Myagdi"],
  ["Gandaki", "Nawalparasi East"],
  ["Gandaki", "Parbat"],
  ["Gandaki", "Syangja"],
  ["Gandaki", "Tanahu"],
  // Lumbini (12)
  ["Lumbini", "Arghakhanchi"],
  ["Lumbini", "Banke"],
  ["Lumbini", "Bardiya"],
  ["Lumbini", "Dang"],
  ["Lumbini", "Gulmi"],
  ["Lumbini", "Kapilvastu"],
  ["Lumbini", "Palpa"],
  ["Lumbini", "Pyuthan"],
  ["Lumbini", "Rolpa"],
  ["Lumbini", "Rukum East"],
  ["Lumbini", "Rupandehi"],
  ["Lumbini", "Nawalparasi West"],
  // Karnali (10)
  ["Karnali", "Dailekh"],
  ["Karnali", "Dolpa"],
  ["Karnali", "Humla"],
  ["Karnali", "Jajarkot"],
  ["Karnali", "Jumla"],
  ["Karnali", "Kalikot"],
  ["Karnali", "Mugu"],
  ["Karnali", "Rukum West"],
  ["Karnali", "Salyan"],
  ["Karnali", "Surkhet"],
  // Sudurpashchim (9)
  ["Sudurpashchim", "Achham"],
  ["Sudurpashchim", "Baitadi"],
  ["Sudurpashchim", "Bajhang"],
  ["Sudurpashchim", "Bajura"],
  ["Sudurpashchim", "Dadeldhura"],
  ["Sudurpashchim", "Darchula"],
  ["Sudurpashchim", "Doti"],
  ["Sudurpashchim", "Kailali"],
  ["Sudurpashchim", "Kanchanpur"],
];

function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

/* ──────────────────────────────────────────────────────────────────────
 * CURATED DISTRICT METADATA
 *
 * Static, editorially-reviewed Nepal land-market data used across the
 * area-guide hub cards, filters and district profile pages. Rates are
 * indicative NPR-per-Aana averages for mid-band residential land; live
 * verified-listing stats from the API always take precedence when shown
 * alongside these on detail pages. `avgRatePerAana: null` means the
 * field team has not yet surveyed enough parcels to quote a figure.
 * ────────────────────────────────────────────────────────────────────── */

type DistrictMeta = Pick<
  DistrictEntry,
  "topography" | "tier" | "avgRatePerAana" | "trendPct" | "description"
>;

const DISTRICT_META: Record<string, DistrictMeta> = {
  // ── Koshi ──
  bhojpur: { topography: "hill", tier: "pending", avgRatePerAana: null, trendPct: null, description: "Hill district with scattered settlement plots around Bhojpur Bazaar." },
  dhankuta: { topography: "hill", tier: "field", avgRatePerAana: 220000, trendPct: 2.1, description: "Eastern hill trade centre; steady demand for roadside residential plots." },
  ilam: { topography: "hill", tier: "field", avgRatePerAana: 300000, trendPct: 4.0, description: "Tea-garden tourism corridor; strong demand near Ilam Bazaar and Kanyam." },
  jhapa: { topography: "terai", tier: "cadastral", avgRatePerAana: 900000, trendPct: 5.5, description: "Bhadrapur–Birtamod commercial belt; high-growth Terai corridor." },
  khotang: { topography: "hill", tier: "pending", avgRatePerAana: 100000, trendPct: null, description: "Remote hill district; agricultural terraces dominate the market." },
  morang: { topography: "terai", tier: "cadastral", avgRatePerAana: 1600000, trendPct: 6.2, description: "Biratnagar metropolitan core; premier industrial and commercial zoning." },
  okhaldhunga: { topography: "hill", tier: "pending", avgRatePerAana: 110000, trendPct: null, description: "Mid-hill district with small-town residential expansion." },
  panchthar: { topography: "hill", tier: "field", avgRatePerAana: 180000, trendPct: 1.8, description: "Cardamom-belt hill economy; modest plot turnover in Phidim." },
  sankhuwasabha: { topography: "hill", tier: "pending", avgRatePerAana: 150000, trendPct: 2.5, description: "Gateway to Makalu; Khandbari shows emerging roadside demand." },
  solukhumbu: { topography: "mountain", tier: "pending", avgRatePerAana: 200000, trendPct: 3.0, description: "Evergreen trekking economy; lodge and hospitality plots around Lukla." },
  sunsari: { topography: "terai", tier: "cadastral", avgRatePerAana: 1200000, trendPct: 4.8, description: "Itahari–Dharan junction corridor; strong mixed-use appreciation." },
  taplejung: { topography: "hill", tier: "field", avgRatePerAana: 170000, trendPct: 1.5, description: "Far-east hill hub; airport-adjacent plots in Phungling." },
  terhathum: { topography: "hill", tier: "field", avgRatePerAana: 160000, trendPct: 1.2, description: "Myanglung bazaar heritage; low-volume but stable plot market." },
  udayapur: { topography: "hill", tier: "field", avgRatePerAana: 140000, trendPct: 2.0, description: "Inner-Terai transition; Gaighat riverside plots gaining interest." },

  // ── Madhesh ──
  bara: { topography: "terai", tier: "cadastral", avgRatePerAana: 450000, trendPct: 3.8, description: "Simara–Jitpur industrial axis; logistics land in demand." },
  dhanusha: { topography: "terai", tier: "cadastral", avgRatePerAana: 900000, trendPct: 4.5, description: "Janakpur cultural-commercial hub; dense municipal plot market." },
  mahottari: { topography: "terai", tier: "field", avgRatePerAana: 350000, trendPct: 2.8, description: "Agricultural Terai belt; Jaleshwar township plots steady." },
  parsa: { topography: "terai", tier: "cadastral", avgRatePerAana: 1400000, trendPct: 6.0, description: "Birgunj customs-port economy; highest Madhesh commercial rates." },
  rautahat: { topography: "terai", tier: "field", avgRatePerAana: 400000, trendPct: 3.2, description: "Chandrapur rail-corridor growth; Gaur municipal plots active." },
  saptari: { topography: "terai", tier: "field", avgRatePerAana: 400000, trendPct: 3.0, description: "Rajbiraj border-trade town; affordable residential inventory." },
  sarlahi: { topography: "terai", tier: "field", avgRatePerAana: 350000, trendPct: 2.6, description: "Malangwa border market; predominantly agricultural holdings." },
  siraha: { topography: "terai", tier: "field", avgRatePerAana: 350000, trendPct: 2.4, description: "Lahan highway-bazaar strip; incremental roadside development." },

  // ── Bagmati ──
  bhaktapur: { topography: "valley", tier: "cadastral", avgRatePerAana: 1500000, trendPct: 3.5, description: "Rapid residential expansion; heritage-core zoning restrictions apply." },
  chitwan: { topography: "terai", tier: "cadastral", avgRatePerAana: 1800000, trendPct: 7.0, description: "Bharatpur metro growth; strongest outside-the-Valley appreciation." },
  dhading: { topography: "hill", tier: "field", avgRatePerAana: 250000, trendPct: 2.2, description: "Prithvi-highway corridor; Nilkantha and Malekhu plot activity." },
  dolakha: { topography: "hill", tier: "pending", avgRatePerAana: 130000, trendPct: null, description: "Charikot–Bhimeshwor hill market; hydropower-linked land interest." },
  kathmandu: { topography: "valley", tier: "cadastral", avgRatePerAana: 4500000, trendPct: 5.2, description: "Metropolitan core. High-density commercial and premium residential zoning." },
  kavrepalanchok: { topography: "hill", tier: "cadastral", avgRatePerAana: 500000, trendPct: 5.0, description: "Banepa–Dhulikhel valley rim; Valley-spillover residential demand." },
  lalitpur: { topography: "valley", tier: "cadastral", avgRatePerAana: 3900000, trendPct: 4.5, description: "Heritage conservation alongside modern infrastructure. Mixed-use zoning." },
  makwanpur: { topography: "hill", tier: "cadastral", avgRatePerAana: 500000, trendPct: 4.2, description: "Hetauda industrial seat; east-west highway frontage premiums." },
  nuwakot: { topography: "hill", tier: "field", avgRatePerAana: 200000, trendPct: 1.9, description: "Bidur hill town; Trishuli-river terrace agriculture dominates." },
  ramechhap: { topography: "hill", tier: "pending", avgRatePerAana: 150000, trendPct: 1.5, description: "Manthali airport growth point; hillside terraced parcels." },
  rasuwa: { topography: "hill", tier: "pending", avgRatePerAana: 150000, trendPct: 3.5, description: "Rasuwagadhi China-trade gate; Syabrubesi corridor potential." },
  sindhuli: { topography: "hill", tier: "field", avgRatePerAana: 140000, trendPct: 1.6, description: "Mid-hill highway district; Sindhulimadhi orange-belt orchards." },
  sindhupalchok: { topography: "hill", tier: "field", avgRatePerAana: 150000, trendPct: 2.4, description: "Kodari border trade and Araniko-highway roadside plots." },

  // ── Gandaki ──
  baglung: { topography: "hill", tier: "field", avgRatePerAana: 180000, trendPct: 1.4, description: "Kaligandaki corridor; suspension-bridge trade town Baglung Bazaar." },
  gorkha: { topography: "hill", tier: "field", avgRatePerAana: 200000, trendPct: 1.8, description: "Historic royal seat; Prithvi-highway spur plot activity." },
  kaski: { topography: "hill", tier: "cadastral", avgRatePerAana: 2800000, trendPct: 8.1, description: "Tourism hub. Strategic plots for hospitality and expat residential development." },
  lamjung: { topography: "hill", tier: "field", avgRatePerAana: 250000, trendPct: 2.0, description: "Besishahar Marsyangdi corridor; Annapurna-trek gateway plots." },
  manang: { topography: "mountain", tier: "pending", avgRatePerAana: null, trendPct: null, description: "Trans-Himalayan trekking zone; minimal formal land transactions." },
  mustang: { topography: "mountain", tier: "pending", avgRatePerAana: null, trendPct: null, description: "Upper-Mustang restricted heritage zone; Lo-Manthang special status." },
  myagdi: { topography: "hill", tier: "field", avgRatePerAana: 220000, trendPct: 2.6, description: "Beni junction to Dhaulagiri; hot-spring tourism (Tatopani) plots." },
  "nawalparasi-east": { topography: "terai", tier: "cadastral", avgRatePerAana: 800000, trendPct: 4.6, description: "Kawasoti–Gaindakot Butwal-Narayanghat corridor; fast-growing Terai belt." },
  parbat: { topography: "hill", tier: "field", avgRatePerAana: 200000, trendPct: 1.7, description: "Kushma bazaar; world's longest suspension-bridge tourism effect." },
  syangja: { topography: "hill", tier: "field", avgRatePerAana: 250000, trendPct: 2.2, description: "Putalibazaar and Waling towns; Siddhartha-highway frontage value." },
  tanahu: { topography: "hill", tier: "field", avgRatePerAana: 300000, trendPct: 3.4, description: "Damauli hub; Seti-river rafting tourism and proposed smart-city buzz." },

  // ── Lumbini ──
  arghakhanchi: { topography: "hill", tier: "pending", avgRatePerAana: 150000, trendPct: 1.2, description: "Sandhikharka hill town; low-turnover agricultural market." },
  banke: { topography: "terai", tier: "cadastral", avgRatePerAana: 1100000, trendPct: 5.0, description: "Nepalgunj trade gateway; cross-border commerce drives demand." },
  bardiya: { topography: "terai", tier: "field", avgRatePerAana: 250000, trendPct: 3.0, description: "Tharu-heritage safari tourism; national-park buffer-zone plots." },
  dang: { topography: "terai", tier: "cadastral", avgRatePerAana: 400000, trendPct: 3.6, description: "Largest Terai-valley district; Ghorahi and Tulsipur dual hubs." },
  gulmi: { topography: "hill", tier: "field", avgRatePerAana: 200000, trendPct: 1.5, description: "Coffee-belt hills; Tamghas bazaar modest plot turnover." },
  kapilvastu: { topography: "terai", tier: "field", avgRatePerAana: 300000, trendPct: 2.8, description: "Lumbini pilgrimage spillover; Buddha-circuit hospitality land." },
  palpa: { topography: "hill", tier: "field", avgRatePerAana: 280000, trendPct: 2.0, description: "Tansen heritage ridge town; Siddhartha-highway connectivity." },
  pyuthan: { topography: "hill", tier: "pending", avgRatePerAana: 130000, trendPct: null, description: "Sworgadwari pilgrimage draw; remittance-funded homebuilding." },
  rolpa: { topography: "hill", tier: "pending", avgRatePerAana: 120000, trendPct: null, description: "Liwang hill district; road-access improvements opening supply." },
  "rukum-east": { topography: "hill", tier: "pending", avgRatePerAana: 100000, trendPct: null, description: "Putha Uttarganga Himal fringe; nascent formal plot market." },
  rupandehi: { topography: "terai", tier: "cadastral", avgRatePerAana: 1300000, trendPct: 5.8, description: "Butwal–Siddharthanagar industrial spine; Lumbini tourism adjacency." },
  "nawalparasi-west": { topography: "terai", tier: "cadastral", avgRatePerAana: 650000, trendPct: 3.8, description: "Ramgram–Sunwal belt; east-west highway commercial frontage." },

  // ── Karnali ──
  dailekh: { topography: "hill", tier: "pending", avgRatePerAana: 120000, trendPct: 1.0, description: "Dullu heritage site; Karnali-highway improvement tailwind." },
  dolpa: { topography: "mountain", tier: "pending", avgRatePerAana: null, trendPct: null, description: "Phoksundo lake region; community-managed tourism tenure only." },
  humla: { topography: "mountain", tier: "pending", avgRatePerAana: null, trendPct: null, description: "Simikot gateway to Tibet; roadless upper-Karnali terrain." },
  jajarkot: { topography: "hill", tier: "pending", avgRatePerAana: 90000, trendPct: null, description: "Khalanga hill bazaar; herb-economy and new-road access gains." },
  jumla: { topography: "mountain", tier: "pending", avgRatePerAana: 150000, trendPct: 2.5, description: "High-altitude apple economy; Karnali provincial capital Khalanga." },
  kalikot: { topography: "hill", tier: "pending", avgRatePerAana: 80000, trendPct: null, description: "Remote mid-hills; minimal recorded parcel turnover." },
  mugu: { topography: "mountain", tier: "pending", avgRatePerAana: null, trendPct: null, description: "Rara lake region; subsistence land use, negligible formal market." },
  "rukum-west": { topography: "hill", tier: "pending", avgRatePerAana: 100000, trendPct: 1.0, description: "Musikot hill town; Sisne-trek early-stage tourism interest." },
  salyan: { topography: "hill", tier: "pending", avgRatePerAana: 110000, trendPct: null, description: "Khalanga hill district; road connectivity slowly unlocking plots." },
  surkhet: { topography: "terai", tier: "field", avgRatePerAana: 450000, trendPct: 3.2, description: "Birendranagar provincial capital; fastest-appreciating Karnali hub." },

  // ── Sudurpashchim ──
  achham: { topography: "hill", tier: "pending", avgRatePerAana: 100000, trendPct: null, description: "Mangalsen hill district; remittance-driven homebuilding only." },
  baitadi: { topography: "hill", tier: "pending", avgRatePerAana: 120000, trendPct: 1.0, description: "Dasharathchand India-border trade; Patan bazaar modest activity." },
  bajhang: { topography: "hill", tier: "pending", avgRatePerAana: 70000, trendPct: null, description: "Chainpur hill town; Jhakot river-terrace farmland dominant." },
  bajura: { topography: "hill", tier: "pending", avgRatePerAana: null, trendPct: null, description: "Remote Karnali-fringe district; negligible formal land records." },
  dadeldhura: { topography: "hill", tier: "field", avgRatePerAana: 140000, trendPct: 1.8, description: "Amargadhi ridge town; north-south highway junction value." },
  darchula: { topography: "hill", tier: "pending", avgRatePerAana: 100000, trendPct: null, description: "India-China tri-junction; Khalanga border-bazaar potential." },
  doti: { topography: "hill", tier: "pending", avgRatePerAana: 110000, trendPct: 1.2, description: "Silgadhi hill seat; Shikhar-temple pilgrimage footfall." },
  kailali: { topography: "terai", tier: "cadastral", avgRatePerAana: 700000, trendPct: 4.4, description: "Dhangadhi Far-West commercial capital; fastest Sudurpashchim growth." },
  kanchanpur: { topography: "terai", tier: "field", avgRatePerAana: 500000, trendPct: 3.4, description: "Mahendranagar Bhimdatta border hub; Suklaphanta eco-tourism edge." },
};

export const DISTRICT_CATALOG: DistrictEntry[] = RAW_DISTRICTS.map(
  ([province, name]) => {
    const slug = toSlug(name);
    return {
      slug,
      name,
      province,
      // Every catalog slug must have curated metadata (verified in review).
      ...DISTRICT_META[slug]!,
    };
  },
);

export function getDistrictBySlug(slug: string): DistrictEntry | undefined {
  return DISTRICT_CATALOG.find((d) => d.slug === slug);
}

/**
 * Resolve an API district value (property.location.district) to its catalog
 * entry. Comparison is normalization-tolerant so minor casing/spacing drift
 * between admin input and this catalog cannot break matching.
 */
export function findDistrictByName(name: string): DistrictEntry | undefined {
  const norm = name.trim().toLowerCase().replace(/\s+/g, " ");
  return DISTRICT_CATALOG.find(
    (d) => d.name.toLowerCase().replace(/\s+/g, " ") === norm,
  );
}