/**
 * "New Listing" creation wizard constants & mock data (DESIGN.md §5.2.1).
 *
 * Icons reference the shared `@repo/ui` `<Icon>` name registry (Lucide),
 * so every glyph here renders through the same source of truth as the rest of
 * the dashboard. Values mirror the real Prisma enums (`PropertyType`,
 * `PropertyStatus`, `UnitSystem` conventions) used in the app.
 */

/* ---------------------------- wizard steps ---------------------------- */

export interface WizardStep {
  id: string;
  title: string;
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: "basics", title: "Basics" },
  { id: "location", title: "Location" },
  { id: "specs", title: "Land & Specs" },
  { id: "media", title: "Media & Documents" },
  { id: "review", title: "Review & Submit" },
];

/* --------------------------- property types ---------------------------- */

export interface WizardPropertyType {
  key: string;
  label: string;
  /** Material Symbols-style icon name resolved by the shared `Icon`. */
  icon: string;
  desc: string;
}

export const PROPERTY_TYPES: WizardPropertyType[] = [
  { key: "RESIDENTIAL_LAND", label: "Residential Land", icon: "terrain", desc: "Plots for homes" },
  { key: "COMMERCIAL_LAND", label: "Commercial Land", icon: "storefront", desc: "Business-zone plots" },
  { key: "AGRICULTURAL_LAND", label: "Agricultural Land", icon: "agriculture", desc: "Farmland & orchards" },
  { key: "RESIDENTIAL_HOUSE", label: "Residential House", icon: "home", desc: "Homes & apartments" },
  { key: "COMMERCIAL_SPACE", label: "Commercial Space", icon: "apartment", desc: "Shops & offices" },
  { key: "HERITAGE_HOME", label: "Heritage Home", icon: "article", desc: "Traditional property" },
];

/* ------------------------------ land units ----------------------------- */

export type UnitSystem = "ROPANI" | "BIGHA";

export interface UnitPart {
  key: string;
  unit: string;
}

/** Ropani-Aana-Paisa-Daam system (hilly regions). */
export const ROPANI_PARTS: UnitPart[] = [
  { key: "ropani", unit: "Ropani" },
  { key: "aana", unit: "Aana" },
  { key: "paisa", unit: "Paisa" },
  { key: "daam", unit: "Daam" },
];

/** Bigha-Katha-Dhur system (Terai flats). */
export const BIGHA_PARTS: UnitPart[] = [
  { key: "bigha", unit: "Bigha" },
  { key: "katha", unit: "Katha" },
  { key: "dhur", unit: "Dhur" },
];

export const UNIT_SYSTEMS: { key: UnitSystem; label: string }[] = [
  { key: "ROPANI", label: "Ropani / Aana" },
  { key: "BIGHA", label: "Bigha / Katha" },
];

/* ------------------------------ price per unit ------------------------ */

export interface PriceUnit {
  key: string;
  label: string;
  /** Total area (sq ft) of a single unit — drives price-per-unit math. */
  sqFt: number;
}

/**
 * Every land unit the asking price can be broken down into. The sq ft factors
 * mirror the conversion constants used in draft.ts (1 aana = 342.25 sq ft,
 * 1 katha = 364.5 sq ft), so the implied per-unit rate always agrees with the
 * total area computed on the Land & Specs step.
 */
export const PRICE_UNITS: PriceUnit[] = [
  { key: "ropani", label: "Ropani", sqFt: 342.25 * 16 },
  { key: "aana", label: "Aana", sqFt: 342.25 },
  { key: "paisa", label: "Paisa", sqFt: 342.25 / 4 },
  { key: "daam", label: "Daam", sqFt: 342.25 / 16 },
  { key: "bigha", label: "Bigha", sqFt: 364.5 * 20 },
  { key: "katha", label: "Katha", sqFt: 364.5 },
  { key: "dhur", label: "Dhur", sqFt: 364.5 / 20 },
  { key: "sqft", label: "Sq. ft", sqFt: 1 },
  { key: "sqm", label: "Sq. m", sqFt: 1 / 0.092903 },
];

/** Default "price per" unit for each unit system (the common market rate). */
export const PRICE_UNIT_DEFAULT: Record<UnitSystem, string> = {
  ROPANI: "aana",
  BIGHA: "katha",
};

/* ------------------------------- road / facing ------------------------- */

/**
 * `value` is the exact Prisma enum member sent to the API; `label` is what
 * the user sees. Keep in sync with `enum RoadType` in
 * packages/db/prisma/schema.prisma.
 */
export const ROAD_TYPES = [
  { value: "PITCHED", label: "Pitched" },
  { value: "GRAVEL", label: "Gravel" },
  { value: "SOIL", label: "Earthen" },
  { value: "BLOCK_PAVED", label: "Block paved" },
  { value: "FOOTPATH", label: "Footpath" },
];

/** Matches `enum FacingDirection` in packages/db/prisma/schema.prisma. */
export const FACING_DIRECTIONS = [
  { value: "NORTH", label: "North" },
  { value: "SOUTH", label: "South" },
  { value: "EAST", label: "East" },
  { value: "WEST", label: "West" },
  { value: "NORTH_EAST", label: "North-East" },
  { value: "NORTH_WEST", label: "North-West" },
  { value: "SOUTH_EAST", label: "South-East" },
  { value: "SOUTH_WEST", label: "South-West" },
];

/* ---------------------- cascaded location data -------------------- */

export interface Municipality {
  name: string;
  wards: number; // highest ward number
}

export interface District {
  name: string;
  municipalities: Municipality[];
}

export interface Province {
  name: string;
  districts: District[];
}

/**
 * All 7 provinces of Nepal with their districts and local bodies.
 * Ward counts follow Nepal's 2017 federal restructuring.
 *
 * Aliases used in matchProvince():
 *   Province 1  → Koshi Province
 *   Province 2  → Madhesh Province
 *   Province 3  → Bagmati Province
 *   Province 4  → Gandaki Province
 *   Province 5  → Lumbini Province
 *   Province 6  → Karnali Province
 *   Province 7  → Sudurpashchim Province
 */
export const PROVINCES: Province[] = [
  /* ── Province 1 / Koshi ─────────────────────────────────────────── */
  {
    name: "Koshi",
    districts: [
      {
        name: "Taplejung",
        municipalities: [
          { name: "Phungling Municipality", wards: 9 },
          { name: "Sirijunga Rural Municipality", wards: 6 },
          { name: "Meringden Rural Municipality", wards: 6 },
          { name: "Pathivara Yangwarak Rural Municipality", wards: 9 },
          { name: "Sidingba Rural Municipality", wards: 6 },
          { name: "Aathrai Tribeni Rural Municipality", wards: 7 },
          { name: "Mikwakhola Rural Municipality", wards: 6 },
          { name: "Phaktanglung Rural Municipality", wards: 7 },
          { name: "Maiwakhola Rural Municipality", wards: 6 },
        ],
      },
      {
        name: "Panchthar",
        municipalities: [
          { name: "Phidim Municipality", wards: 9 },
          { name: "Tumbewa Rural Municipality", wards: 6 },
          { name: "Kummayak Rural Municipality", wards: 6 },
          { name: "Miklajung Rural Municipality", wards: 6 },
          { name: "Phalelung Rural Municipality", wards: 6 },
          { name: "Hilihang Rural Municipality", wards: 6 },
          { name: "Yangwarak Rural Municipality", wards: 7 },
        ],
      },
      {
        name: "Ilam",
        municipalities: [
          { name: "Ilam Municipality", wards: 9 },
          { name: "Deumai Municipality", wards: 9 },
          { name: "Mai Municipality", wards: 9 },
          { name: "Suryodaya Municipality", wards: 14 },
          { name: "Chulachuli Rural Municipality", wards: 6 },
          { name: "Fakphokthum Rural Municipality", wards: 6 },
          { name: "Maijogmai Rural Municipality", wards: 6 },
          { name: "Mangsebung Rural Municipality", wards: 7 },
          { name: "Rong Rural Municipality", wards: 6 },
          { name: "Sandakpur Rural Municipality", wards: 6 },
        ],
      },
      {
        name: "Jhapa",
        municipalities: [
          { name: "Mechinagar Municipality", wards: 15 },
          { name: "Bhadrapur Municipality", wards: 9 },
          { name: "Kankai Municipality", wards: 9 },
          { name: "Damak Municipality", wards: 9 },
          { name: "Birtamod Municipality", wards: 9 },
          { name: "Arjundhara Municipality", wards: 9 },
          { name: "Shivasataxi Municipality", wards: 9 },
          { name: "Gauradaha Municipality", wards: 9 },
          { name: "Haldibari Municipality", wards: 9 },
          { name: "Buddhashanti Rural Municipality", wards: 9 },
          { name: "Barhadashi Rural Municipality", wards: 9 },
          { name: "Kachankawal Rural Municipality", wards: 6 },
          { name: "Jhapa Rural Municipality", wards: 6 },
          { name: "Kamal Rural Municipality", wards: 6 },
          { name: "Gaurigunj Rural Municipality", wards: 7 },
        ],
      },
      {
        name: "Morang",
        municipalities: [
          { name: "Biratnagar Metropolitan", wards: 19 },
          { name: "Urlabari Municipality", wards: 9 },
          { name: "Pathari Sanischare Municipality", wards: 9 },
          { name: "Sundarharaicha Municipality", wards: 9 },
          { name: "Rangeli Municipality", wards: 9 },
          { name: "Letang Municipality", wards: 9 },
          { name: "Ratuwamai Municipality", wards: 9 },
          { name: "Belbari Municipality", wards: 9 },
          { name: "Jahada Municipality", wards: 9 },
          { name: "Gramthan Municipality", wards: 9 },
          { name: "Budhiganga Municipality", wards: 9 },
          { name: "Katahari Municipality", wards: 9 },
          { name: "Kanepokhari Rural Municipality", wards: 6 },
          { name: "Kerabari Rural Municipality", wards: 7 },
          { name: "Miklajung Rural Municipality", wards: 6 },
          { name: "Dhanpalthan Rural Municipality", wards: 6 },
        ],
      },
      {
        name: "Sunsari",
        municipalities: [
          { name: "Dharan Sub-Metropolitan", wards: 20 },
          { name: "Itahari Sub-Metropolitan", wards: 19 },
          { name: "Inaruwa Municipality", wards: 9 },
          { name: "Duhabi Municipality", wards: 9 },
          { name: "Ramdhuni Municipality", wards: 9 },
          { name: "Barahakshetra Municipality", wards: 9 },
          { name: "Harinagara Rural Municipality", wards: 6 },
          { name: "Koshi Rural Municipality", wards: 7 },
          { name: "Gadhi Rural Municipality", wards: 6 },
          { name: "Barju Rural Municipality", wards: 6 },
        ],
      },
      {
        name: "Dhankuta",
        municipalities: [
          { name: "Dhankuta Municipality", wards: 9 },
          { name: "Pakhribas Municipality", wards: 9 },
          { name: "Mahalaxmi Municipality", wards: 9 },
          { name: "Chhathar Jorpati Rural Municipality", wards: 6 },
          { name: "Khalsa Khalsa Rural Municipality", wards: 6 },
          { name: "Sangurigadhi Rural Municipality", wards: 6 },
          { name: "Sahidbhumi Rural Municipality", wards: 6 },
        ],
      },
      {
        name: "Terhathum",
        municipalities: [
          { name: "Myanglung Municipality", wards: 9 },
          { name: "Laligurans Municipality", wards: 9 },
          { name: "Aathrai Rural Municipality", wards: 6 },
          { name: "Chhathar Rural Municipality", wards: 6 },
          { name: "Fedap Rural Municipality", wards: 6 },
          { name: "Phedap Rural Municipality", wards: 6 },
        ],
      },
      {
        name: "Sankhuwasabha",
        municipalities: [
          { name: "Khandbari Municipality", wards: 9 },
          { name: "Chainpur Municipality", wards: 9 },
          { name: "Dharmadevi Municipality", wards: 9 },
          { name: "Panchakhapan Municipality", wards: 9 },
          { name: "Madi Municipality", wards: 9 },
          { name: "Makalu Rural Municipality", wards: 7 },
          { name: "Chichila Rural Municipality", wards: 6 },
          { name: "Sabhapokhari Rural Municipality", wards: 7 },
          { name: "Bhotkhola Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Bhojpur",
        municipalities: [
          { name: "Bhojpur Municipality", wards: 9 },
          { name: "Shadananda Municipality", wards: 9 },
          { name: "Arun Rural Municipality", wards: 6 },
          { name: "Ramprasad Rai Rural Municipality", wards: 6 },
          { name: "Hatuwagadhi Rural Municipality", wards: 7 },
          { name: "Pauwadungma Rural Municipality", wards: 6 },
          { name: "Tyamke Yuwa Rural Municipality", wards: 6 },
          { name: "Aamchok Rural Municipality", wards: 6 },
        ],
      },
      {
        name: "Khotang",
        municipalities: [
          { name: "Diktel Rupakot Majhuwagadhi Municipality", wards: 9 },
          { name: "Halesi Tuwachung Municipality", wards: 9 },
          { name: "Sakela Municipality", wards: 9 },
          { name: "Barahapokhari Rural Municipality", wards: 6 },
          { name: "Kepilasagadhi Rural Municipality", wards: 6 },
          { name: "Lamidanda Rural Municipality", wards: 6 },
          { name: "Ainselukhark Rural Municipality", wards: 6 },
          { name: "Rawabeshi Rural Municipality", wards: 6 },
          { name: "Jantedhunga Rural Municipality", wards: 6 },
        ],
      },
      {
        name: "Solukhumbu",
        municipalities: [
          { name: "Solududhkunda Municipality", wards: 9 },
          { name: "Necha Salyan Rural Municipality", wards: 6 },
          { name: "Dudhkoshi Rural Municipality", wards: 6 },
          { name: "Likhupike Rural Municipality", wards: 6 },
          { name: "Khumbu Pasanglhamu Rural Municipality", wards: 5 },
          { name: "Mahakulung Rural Municipality", wards: 7 },
          { name: "Thulung Dudhkoshi Rural Municipality", wards: 6 },
        ],
      },
      {
        name: "Okhaldhunga",
        municipalities: [
          { name: "Siddhicharan Municipality", wards: 9 },
          { name: "Manebhanjyang Rural Municipality", wards: 6 },
          { name: "Champadevi Rural Municipality", wards: 6 },
          { name: "Molung Rural Municipality", wards: 6 },
          { name: "Sunkoshi Rural Municipality", wards: 6 },
          { name: "Likhu Rural Municipality", wards: 6 },
          { name: "Khijidemba Rural Municipality", wards: 7 },
        ],
      },
      {
        name: "Udayapur",
        municipalities: [
          { name: "Triyuga Municipality", wards: 14 },
          { name: "Katari Municipality", wards: 9 },
          { name: "Chaudandigadhi Municipality", wards: 9 },
          { name: "Belaka Municipality", wards: 9 },
          { name: "Udayapurgadhi Rural Municipality", wards: 6 },
          { name: "Tapli Rural Municipality", wards: 7 },
          { name: "Rautamai Rural Municipality", wards: 6 },
          { name: "Sunkoshi Rural Municipality", wards: 6 },
        ],
      },
    ],
  },

  /* ── Province 2 / Madhesh ─────────────────────────────────────────── */
  {
    name: "Madhesh",
    districts: [
      {
        name: "Saptari",
        municipalities: [
          { name: "Rajbiraj Municipality", wards: 9 },
          { name: "Kanchanrup Municipality", wards: 9 },
          { name: "Bode Barsain Municipality", wards: 9 },
          { name: "Saptakoshi Municipality", wards: 9 },
          { name: "Dakneshwori Municipality", wards: 9 },
          { name: "Hanumannagar Kankalini Municipality", wards: 9 },
          { name: "Shambhunath Municipality", wards: 9 },
          { name: "Agnisaira Krishnasawaran Rural Municipality", wards: 6 },
          { name: "Bishnupur Rural Municipality", wards: 6 },
          { name: "Chhinnamasta Rural Municipality", wards: 6 },
          { name: "Mahadeva Rural Municipality", wards: 6 },
          { name: "Rupani Rural Municipality", wards: 6 },
          { name: "Tilathi Koiladi Rural Municipality", wards: 6 },
        ],
      },
      {
        name: "Siraha",
        municipalities: [
          { name: "Siraha Municipality", wards: 9 },
          { name: "Lahan Municipality", wards: 9 },
          { name: "Dhangadhimai Municipality", wards: 9 },
          { name: "Sukhipur Municipality", wards: 9 },
          { name: "Mirchaiya Municipality", wards: 9 },
          { name: "Golbazar Municipality", wards: 9 },
          { name: "Karjanha Municipality", wards: 9 },
          { name: "Bariyarpatti Municipality", wards: 9 },
          { name: "Aurahi Rural Municipality", wards: 6 },
          { name: "Bishnupur Rural Municipality", wards: 6 },
          { name: "Bhagawanpur Rural Municipality", wards: 6 },
          { name: "Naraha Rural Municipality", wards: 6 },
          { name: "Sakhuwanankarkatti Rural Municipality", wards: 6 },
          { name: "Arnama Rural Municipality", wards: 6 },
          { name: "Lakshmipur Patari Rural Municipality", wards: 6 },
        ],
      },
      {
        name: "Dhanusha",
        municipalities: [
          { name: "Janakpur Sub-Metropolitan", wards: 20 },
          { name: "Dhanusha Municipality", wards: 9 },
          { name: "Chhireshwornath Municipality", wards: 9 },
          { name: "Ganeshman Charnath Municipality", wards: 9 },
          { name: "Mithila Municipality", wards: 9 },
          { name: "Mithila Bihari Municipality", wards: 9 },
          { name: "Sahidnagar Municipality", wards: 9 },
          { name: "Bideha Municipality", wards: 9 },
          { name: "Nagarain Municipality", wards: 9 },
          { name: "Aurahi Rural Municipality", wards: 6 },
          { name: "Bateshwar Rural Municipality", wards: 6 },
          { name: "Dhanauji Rural Municipality", wards: 6 },
          { name: "Hansapur Rural Municipality", wards: 6 },
          { name: "Janaknandini Rural Municipality", wards: 7 },
          { name: "Kamala Rural Municipality", wards: 6 },
          { name: "Mukhiyapatti Musharniya Rural Municipality", wards: 6 },
          { name: "Lakshminiya Rural Municipality", wards: 7 },
          { name: "Shreepure Rural Municipality", wards: 7 },
        ],
      },
      {
        name: "Mahottari",
        municipalities: [
          { name: "Jaleshwar Municipality", wards: 9 },
          { name: "Bardibas Municipality", wards: 9 },
          { name: "Gaushala Municipality", wards: 9 },
          { name: "Bhangaha Municipality", wards: 9 },
          { name: "Manara Shisawa Municipality", wards: 9 },
          { name: "Matihani Municipality", wards: 9 },
          { name: "Ramgopalpur Municipality", wards: 9 },
          { name: "Aurahi Rural Municipality", wards: 6 },
          { name: "Balwa Rural Municipality", wards: 6 },
          { name: "Ekdara Rural Municipality", wards: 6 },
          { name: "Mahottari Rural Municipality", wards: 6 },
          { name: "Pipra Rural Municipality", wards: 7 },
          { name: "Samsi Rural Municipality", wards: 6 },
          { name: "Sonama Rural Municipality", wards: 6 },
        ],
      },
      {
        name: "Sarlahi",
        municipalities: [
          { name: "Malangwa Municipality", wards: 9 },
          { name: "Haripur Municipality", wards: 9 },
          { name: "Harion Municipality", wards: 9 },
          { name: "Barahathawa Municipality", wards: 9 },
          { name: "Godaita Municipality", wards: 9 },
          { name: "Ishworpur Municipality", wards: 9 },
          { name: "Lalbandi Municipality", wards: 9 },
          { name: "Bagmati Municipality", wards: 9 },
          { name: "Bishnu Rural Municipality", wards: 7 },
          { name: "Brahampuri Rural Municipality", wards: 6 },
          { name: "Chakraghatta Rural Municipality", wards: 6 },
          { name: "Chandranagar Rural Municipality", wards: 6 },
          { name: "Dhankaul Rural Municipality", wards: 6 },
          { name: "Kabilasi Rural Municipality", wards: 7 },
          { name: "Parsa Rural Municipality", wards: 7 },
          { name: "Ramnagar Rural Municipality", wards: 6 },
        ],
      },
      {
        name: "Rautahat",
        municipalities: [
          { name: "Gaur Municipality", wards: 9 },
          { name: "Rajpur Municipality", wards: 9 },
          { name: "Chandrapur Municipality", wards: 9 },
          { name: "Garuda Municipality", wards: 9 },
          { name: "Gujara Municipality", wards: 9 },
          { name: "Ishnath Municipality", wards: 9 },
          { name: "Katahariya Municipality", wards: 9 },
          { name: "Madhav Narayan Municipality", wards: 9 },
          { name: "Maulapur Municipality", wards: 9 },
          { name: "Phatuwa Bijayapur Municipality", wards: 9 },
          { name: "Baudhimai Rural Municipality", wards: 7 },
          { name: "Brindaban Rural Municipality", wards: 6 },
          { name: "Devahi Gonahi Rural Municipality", wards: 6 },
          { name: "Durga Bhagwati Rural Municipality", wards: 7 },
          { name: "Gadhimai Municipality", wards: 9 },
          { name: "Karmaiya Rural Municipality", wards: 7 },
          { name: "Paroha Municipality", wards: 9 },
          { name: "Rajdevi Municipality", wards: 9 },
        ],
      },
      {
        name: "Bara",
        municipalities: [
          { name: "Kalaiya Sub-Metropolitan", wards: 20 },
          { name: "Jitpur Simara Sub-Metropolitan", wards: 17 },
          { name: "Kolhabi Municipality", wards: 9 },
          { name: "Mahagadhimai Municipality", wards: 9 },
          { name: "Nijgadh Municipality", wards: 9 },
          { name: "Pacharauta Municipality", wards: 9 },
          { name: "Pheta Rural Municipality", wards: 6 },
          { name: "Prasauni Rural Municipality", wards: 7 },
          { name: "Suwarna Rural Municipality", wards: 7 },
          { name: "Adarsha Kotwal Rural Municipality", wards: 7 },
          { name: "Bishrampur Rural Municipality", wards: 6 },
          { name: "Devtal Rural Municipality", wards: 7 },
          { name: "Kaudena Rural Municipality", wards: 6 },
          { name: "Simraungadh Municipality", wards: 9 },
          { name: "Vishnupur Rural Municipality", wards: 7 },
        ],
      },
      {
        name: "Parsa",
        municipalities: [
          { name: "Birgunj Metropolitan", wards: 32 },
          { name: "Pokhariya Municipality", wards: 9 },
          { name: "Parsagadhi Municipality", wards: 9 },
          { name: "Bahudarmai Municipality", wards: 9 },
          { name: "Bindabasini Rural Municipality", wards: 6 },
          { name: "Chhipaharmai Rural Municipality", wards: 6 },
          { name: "Dhobini Rural Municipality", wards: 6 },
          { name: "Jagarnathpur Rural Municipality", wards: 6 },
          { name: "Jirabhawani Rural Municipality", wards: 6 },
          { name: "Kalikamai Rural Municipality", wards: 6 },
          { name: "Paterwasugauli Rural Municipality", wards: 6 },
          { name: "Paterwa Sugauli Rural Municipality", wards: 6 },
          { name: "Pkali Rural Municipality", wards: 6 },
          { name: "Sakhuwa Prasauni Rural Municipality", wards: 6 },
          { name: "Thori Rural Municipality", wards: 5 },
        ],
      },
    ],
  },

  /* ── Province 3 / Bagmati ────────────────────────────────────────── */
  {
    name: "Bagmati",
    districts: [
      {
        name: "Kathmandu",
        municipalities: [
          { name: "Kathmandu Metropolitan", wards: 32 },
          { name: "Kirtipur Municipality", wards: 19 },
          { name: "Budhanilkantha Municipality", wards: 15 },
          { name: "Gokarneshwar Municipality", wards: 9 },
          { name: "Kageshwari Manohara Municipality", wards: 9 },
          { name: "Nagarjun Municipality", wards: 9 },
          { name: "Shankharapur Municipality", wards: 9 },
          { name: "Tarakeshwar Municipality", wards: 11 },
          { name: "Tokha Municipality", wards: 11 },
          { name: "Dakshinkali Municipality", wards: 9 },
          { name: "Chandragiri Municipality", wards: 15 },
        ],
      },
      {
        name: "Lalitpur",
        municipalities: [
          { name: "Lalitpur Metropolitan", wards: 29 },
          { name: "Godawari Municipality", wards: 14 },
          { name: "Mahalaxmi Municipality", wards: 10 },
          { name: "Bagmati Rural Municipality", wards: 5 },
          { name: "Konjyosom Rural Municipality", wards: 5 },
          { name: "Mahankal Rural Municipality", wards: 7 },
        ],
      },
      {
        name: "Bhaktapur",
        municipalities: [
          { name: "Bhaktapur Municipality", wards: 10 },
          { name: "Madhyapur Thimi Municipality", wards: 9 },
          { name: "Changunarayan Municipality", wards: 9 },
          { name: "Suryabinayak Municipality", wards: 9 },
        ],
      },
      {
        name: "Kavrepalanchok",
        municipalities: [
          { name: "Banepa Municipality", wards: 9 },
          { name: "Dhulikhel Municipality", wards: 9 },
          { name: "Panauti Municipality", wards: 9 },
          { name: "Nala Rural Municipality", wards: 5 },
          { name: "Khanikhola Rural Municipality", wards: 5 },
          { name: "Roshi Rural Municipality", wards: 5 },
          { name: "Bethanchok Rural Municipality", wards: 7 },
          { name: "Bhumlu Rural Municipality", wards: 6 },
          { name: "Chaurideurali Rural Municipality", wards: 5 },
          { name: "Mandan Deupur Municipality", wards: 9 },
          { name: "Mahabharat Rural Municipality", wards: 6 },
          { name: "Temal Rural Municipality", wards: 6 },
        ],
      },
      {
        name: "Sindhupalchok",
        municipalities: [
          { name: "Chautara Sangachokgadhi Municipality", wards: 9 },
          { name: "Balephi Rural Municipality", wards: 7 },
          { name: "Bhotekoshi Rural Municipality", wards: 6 },
          { name: "Helambu Rural Municipality", wards: 7 },
          { name: "Indrawati Rural Municipality", wards: 6 },
          { name: "Jugal Rural Municipality", wards: 7 },
          { name: "Larjung Rural Municipality", wards: 5 },
          { name: "Lisankhu Pakhar Rural Municipality", wards: 5 },
          { name: "Melamchi Municipality", wards: 9 },
          { name: "Sunkoshi Rural Municipality", wards: 6 },
          { name: "Tripurasundari Rural Municipality", wards: 5 },
          { name: "Tarkegyang Rural Municipality", wards: 6 },
        ],
      },
      {
        name: "Rasuwa",
        municipalities: [
          { name: "Rasuwa Rural Municipality", wards: 5 },
          { name: "Kalika Rural Municipality", wards: 5 },
          { name: "Naukunda Rural Municipality", wards: 5 },
          { name: "Parbatikunda Rural Municipality", wards: 5 },
          { name: "Gosaikunda Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Nuwakot",
        municipalities: [
          { name: "Bidur Municipality", wards: 9 },
          { name: "Belkotgadhi Municipality", wards: 9 },
          { name: "Dupcheshwar Rural Municipality", wards: 5 },
          { name: "Kispang Rural Municipality", wards: 6 },
          { name: "Tadi Rural Municipality", wards: 5 },
          { name: "Likhu Rural Municipality", wards: 5 },
          { name: "Suryagadhi Rural Municipality", wards: 7 },
          { name: "Panchakanya Rural Municipality", wards: 5 },
          { name: "Shivapuri Rural Municipality", wards: 5 },
          { name: "Tarkeshwar Rural Municipality", wards: 5 },
          { name: "Kakani Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Dhading",
        municipalities: [
          { name: "Nilkantha Municipality", wards: 9 },
          { name: "Benighat Rorang Rural Municipality", wards: 7 },
          { name: "Galchi Rural Municipality", wards: 7 },
          { name: "Gajuri Rural Municipality", wards: 7 },
          { name: "Gangajamuna Rural Municipality", wards: 6 },
          { name: "Jwalamukhi Rural Municipality", wards: 7 },
          { name: "Khaniyabas Rural Municipality", wards: 7 },
          { name: "Rubi Valley Rural Municipality", wards: 6 },
          { name: "Siddhalek Rural Municipality", wards: 6 },
          { name: "Thakre Rural Municipality", wards: 6 },
          { name: "Tripura Sundari Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Makwanpur",
        municipalities: [
          { name: "Hetauda Sub-Metropolitan", wards: 17 },
          { name: "Thaha Municipality", wards: 9 },
          { name: "Bakaiya Rural Municipality", wards: 7 },
          { name: "Bhimphedi Rural Municipality", wards: 7 },
          { name: "Indrasarowar Rural Municipality", wards: 6 },
          { name: "Kailash Rural Municipality", wards: 5 },
          { name: "Manahari Rural Municipality", wards: 7 },
          { name: "Makwanpurgadhi Rural Municipality", wards: 5 },
          { name: "Raksirang Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Ramechhap",
        municipalities: [
          { name: "Manthali Municipality", wards: 9 },
          { name: "Ramechhap Municipality", wards: 9 },
          { name: "Doramba Rural Municipality", wards: 6 },
          { name: "Gokulganga Rural Municipality", wards: 6 },
          { name: "Khandadevi Rural Municipality", wards: 7 },
          { name: "Likhu Tamakoshi Rural Municipality", wards: 7 },
          { name: "Sunapati Rural Municipality", wards: 5 },
          { name: "Umakunda Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Dolakha",
        municipalities: [
          { name: "Bhimeshwar Municipality", wards: 9 },
          { name: "Jiri Municipality", wards: 9 },
          { name: "Baiteshwar Rural Municipality", wards: 6 },
          { name: "Bigu Rural Municipality", wards: 5 },
          { name: "Gaurishankar Rural Municipality", wards: 8 },
          { name: "Kalinchok Rural Municipality", wards: 5 },
          { name: "Melung Rural Municipality", wards: 6 },
          { name: "Sailung Rural Municipality", wards: 6 },
          { name: "Tamakoshi Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Sindhuli",
        municipalities: [
          { name: "Kamalamai Municipality", wards: 9 },
          { name: "Dudhauli Municipality", wards: 9 },
          { name: "Golanjor Rural Municipality", wards: 6 },
          { name: "Hariharpurgadhi Rural Municipality", wards: 5 },
          { name: "Marin Rural Municipality", wards: 7 },
          { name: "Phikkal Rural Municipality", wards: 7 },
          { name: "Sunkoshi Rural Municipality", wards: 6 },
          { name: "Tinpatan Rural Municipality", wards: 7 },
        ],
      },
      {
        name: "Chitwan",
        municipalities: [
          { name: "Bharatpur Metropolitan", wards: 29 },
          { name: "Ratnanagar Municipality", wards: 9 },
          { name: "Kalika Municipality", wards: 9 },
          { name: "Khairhani Municipality", wards: 9 },
          { name: "Madi Municipality", wards: 9 },
          { name: "Rapti Municipality", wards: 9 },
          { name: "Ichchhakamana Rural Municipality", wards: 5 },
        ],
      },
    ],
  },

  /* ── Province 4 / Gandaki ───────────────────────────────────────── */
  {
    name: "Gandaki",
    districts: [
      {
        name: "Kaski",
        municipalities: [
          { name: "Pokhara Metropolitan", wards: 33 },
          { name: "Annapurna Rural Municipality", wards: 7 },
          { name: "Machhapuchchhre Rural Municipality", wards: 6 },
          { name: "Madi Rural Municipality", wards: 6 },
          { name: "Rupa Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Syangja",
        municipalities: [
          { name: "Putalibazar Municipality", wards: 9 },
          { name: "Waling Municipality", wards: 9 },
          { name: "Arjunchaupari Rural Municipality", wards: 6 },
          { name: "Biruwa Rural Municipality", wards: 7 },
          { name: "Chapakot Municipality", wards: 9 },
          { name: "Galyang Municipality", wards: 9 },
          { name: "Harinas Rural Municipality", wards: 5 },
          { name: "Kaligandaki Rural Municipality", wards: 7 },
          { name: "Phedikhola Rural Municipality", wards: 6 },
        ],
      },
      {
        name: "Tanahun",
        municipalities: [
          { name: "Byas Municipality", wards: 9 },
          { name: "Bhimad Municipality", wards: 9 },
          { name: "Shuklagandaki Municipality", wards: 9 },
          { name: "Anbukhaireni Rural Municipality", wards: 7 },
          { name: "Bandipur Rural Municipality", wards: 6 },
          { name: "Devghat Rural Municipality", wards: 7 },
          { name: "Ghiring Rural Municipality", wards: 6 },
          { name: "Myagde Rural Municipality", wards: 7 },
          { name: "Rhishing Rural Municipality", wards: 5 },
          { name: "Rishing Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Lamjung",
        municipalities: [
          { name: "Besisahar Municipality", wards: 9 },
          { name: "Sundarbazar Municipality", wards: 9 },
          { name: "Dordi Rural Municipality", wards: 6 },
          { name: "Dudhpokhari Rural Municipality", wards: 6 },
          { name: "Kwholasothar Rural Municipality", wards: 6 },
          { name: "Marsyangdi Rural Municipality", wards: 5 },
          { name: "Madhyanepal Rural Municipality", wards: 5 },
          { name: "Rainas Municipality", wards: 9 },
        ],
      },
      {
        name: "Gorkha",
        municipalities: [
          { name: "Gorkha Municipality", wards: 9 },
          { name: "Palungtar Municipality", wards: 9 },
          { name: "Ajirkot Rural Municipality", wards: 5 },
          { name: "Arughat Rural Municipality", wards: 5 },
          { name: "Aarughat Rural Municipality", wards: 5 },
          { name: "Barpak Sulikot Rural Municipality", wards: 5 },
          { name: "Bhimsenthapa Rural Municipality", wards: 5 },
          { name: "Dharche Rural Municipality", wards: 5 },
          { name: "Gandaki Rural Municipality", wards: 5 },
          { name: "Sahid Lakhan Rural Municipality", wards: 5 },
          { name: "Siranchok Rural Municipality", wards: 5 },
          { name: "Tsum Nubri Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Manang",
        municipalities: [
          { name: "Chame Rural Municipality", wards: 5 },
          { name: "Manang Disyang Rural Municipality", wards: 5 },
          { name: "Narchyang Rural Municipality", wards: 5 },
          { name: "Narpa Bhumi Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Mustang",
        municipalities: [
          { name: "Gharapjhong Rural Municipality", wards: 5 },
          { name: "Barhagaun Muktichhetra Rural Municipality", wards: 5 },
          { name: "Lomanthang Rural Municipality", wards: 5 },
          { name: "Lo-Ghekar Damodarkunda Rural Municipality", wards: 5 },
          { name: "Thasang Rural Municipality", wards: 5 },
          { name: "Waragung Muktikshetra Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Myagdi",
        municipalities: [
          { name: "Beni Municipality", wards: 9 },
          { name: "Annapurna Rural Municipality", wards: 6 },
          { name: "Dhaulagiri Rural Municipality", wards: 5 },
          { name: "Mangala Rural Municipality", wards: 5 },
          { name: "Malika Rural Municipality", wards: 6 },
          { name: "Raghuganga Rural Municipality", wards: 6 },
        ],
      },
      {
        name: "Baglung",
        municipalities: [
          { name: "Baglung Municipality", wards: 9 },
          { name: "Dhorpatan Municipality", wards: 9 },
          { name: "Jaimini Municipality", wards: 9 },
          { name: "Bareng Rural Municipality", wards: 5 },
          { name: "Badigad Rural Municipality", wards: 5 },
          { name: "Galkot Municipality", wards: 9 },
          { name: "Kanthekhola Rural Municipality", wards: 5 },
          { name: "Nisikhola Rural Municipality", wards: 5 },
          { name: "Taman Khola Rural Municipality", wards: 5 },
          { name: "Tara Hill Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Parbat",
        municipalities: [
          { name: "Kushma Municipality", wards: 9 },
          { name: "Phalewas Municipality", wards: 9 },
          { name: "Bihadi Rural Municipality", wards: 5 },
          { name: "Jaljala Rural Municipality", wards: 5 },
          { name: "Mahashila Rural Municipality", wards: 5 },
          { name: "Modi Rural Municipality", wards: 5 },
          { name: "Painyu Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Nawalpur",
        municipalities: [
          { name: "Kawasoti Municipality", wards: 9 },
          { name: "Gaidakot Municipality", wards: 9 },
          { name: "Devchuli Municipality", wards: 9 },
          { name: "Madhyabindu Municipality", wards: 9 },
          { name: "Baudikhel Rural Municipality", wards: 5 },
          { name: "Binayee Tribeni Rural Municipality", wards: 5 },
          { name: "Bulingtar Rural Municipality", wards: 5 },
          { name: "Hupsekot Municipality", wards: 9 },
          { name: "Triveni Rural Municipality", wards: 5 },
        ],
      },
    ],
  },

  /* ── Province 5 / Lumbini ───────────────────────────────────────── */
  {
    name: "Lumbini",
    districts: [
      {
        name: "Rupandehi",
        municipalities: [
          { name: "Butwal Sub-Metropolitan", wards: 19 },
          { name: "Siddharthanagar Municipality", wards: 13 },
          { name: "Devdaha Municipality", wards: 13 },
          { name: "Tilottama Municipality", wards: 18 },
          { name: "Sainamaina Municipality", wards: 10 },
          { name: "Lumbini Sanskritik Municipality", wards: 9 },
          { name: "Gaidahawa Rural Municipality", wards: 7 },
          { name: "Kanchan Rural Municipality", wards: 8 },
          { name: "Kotahimai Rural Municipality", wards: 7 },
          { name: "Mayadevi Rural Municipality", wards: 7 },
          { name: "Marchawari Rural Municipality", wards: 6 },
          { name: "Omsatiya Rural Municipality", wards: 7 },
          { name: "Rohini Rural Municipality", wards: 7 },
          { name: "Sammarimai Rural Municipality", wards: 7 },
          { name: "Siyari Rural Municipality", wards: 7 },
          { name: "Suddhodhan Rural Municipality", wards: 9 },
        ],
      },
      {
        name: "Kapilvastu",
        municipalities: [
          { name: "Kapilvastu Municipality", wards: 9 },
          { name: "Banganga Municipality", wards: 9 },
          { name: "Buddhabhumi Municipality", wards: 9 },
          { name: "Shivaraj Municipality", wards: 9 },
          { name: "Krishnanagar Municipality", wards: 9 },
          { name: "Maharajgunj Rural Municipality", wards: 7 },
          { name: "Yashodhara Rural Municipality", wards: 7 },
          { name: "Mayadevi Rural Municipality", wards: 7 },
          { name: "Suddhodhan Rural Municipality", wards: 7 },
        ],
      },
      {
        name: "Nawalparasi East",
        municipalities: [
          { name: "Bardaghat Municipality", wards: 9 },
          { name: "Sunwal Municipality", wards: 9 },
          { name: "Palhi Nandan Rural Municipality", wards: 7 },
          { name: "Pratappur Rural Municipality", wards: 5 },
          { name: "Ramgram Municipality", wards: 9 },
          { name: "Susta Rural Municipality", wards: 5 },
          { name: "Sarawal Rural Municipality", wards: 7 },
        ],
      },
      {
        name: "Palpa",
        municipalities: [
          { name: "Tansen Municipality", wards: 9 },
          { name: "Rampur Municipality", wards: 9 },
          { name: "Rainadevi Chhahara Rural Municipality", wards: 5 },
          { name: "Ribdikot Rural Municipality", wards: 6 },
          { name: "Rambha Rural Municipality", wards: 5 },
          { name: "Tinau Rural Municipality", wards: 5 },
          { name: "Mathagadhi Rural Municipality", wards: 5 },
          { name: "Bagnaskali Rural Municipality", wards: 5 },
          { name: "Purbakhola Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Arghakhanchi",
        municipalities: [
          { name: "Sandhikharka Municipality", wards: 9 },
          { name: "Sitganga Municipality", wards: 9 },
          { name: "Bhumikasthan Municipality", wards: 9 },
          { name: "Chhatradev Rural Municipality", wards: 6 },
          { name: "Malarani Rural Municipality", wards: 6 },
          { name: "Panini Rural Municipality", wards: 6 },
        ],
      },
      {
        name: "Gulmi",
        municipalities: [
          { name: "Resunga Municipality", wards: 9 },
          { name: "Musikot Municipality", wards: 9 },
          { name: "Gulmi Durbar Rural Municipality", wards: 5 },
          { name: "Chandrakot Rural Municipality", wards: 5 },
          { name: "Chatrakot Rural Municipality", wards: 5 },
          { name: "Dhurkot Rural Municipality", wards: 5 },
          { name: "Ishma Rural Municipality", wards: 5 },
          { name: "Kaligandaki Rural Municipality", wards: 5 },
          { name: "Madane Rural Municipality", wards: 6 },
          { name: "Malika Rural Municipality", wards: 5 },
          { name: "Ruru Rural Municipality", wards: 5 },
          { name: "Satyawati Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Pyuthan",
        municipalities: [
          { name: "Pyuthan Municipality", wards: 9 },
          { name: "Swargadwary Municipality", wards: 9 },
          { name: "Airawati Rural Municipality", wards: 6 },
          { name: "Gaumukhi Rural Municipality", wards: 6 },
          { name: "Jhimruk Rural Municipality", wards: 6 },
          { name: "Mandavi Rural Municipality", wards: 6 },
          { name: "Naubahini Rural Municipality", wards: 6 },
          { name: "Sarumarani Rural Municipality", wards: 6 },
        ],
      },
      {
        name: "Rolpa",
        municipalities: [
          { name: "Rolpa Municipality", wards: 9 },
          { name: "Runtigadhi Rural Municipality", wards: 6 },
          { name: "Tribeni Rural Municipality", wards: 5 },
          { name: "Lungri Rural Municipality", wards: 5 },
          { name: "Madi Rural Municipality", wards: 5 },
          { name: "Pariwartan Rural Municipality", wards: 5 },
          { name: "Sukidaha Rural Municipality", wards: 5 },
          { name: "Sunchhahari Rural Municipality", wards: 5 },
          { name: "Thawang Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Rukum East",
        municipalities: [
          { name: "Putha Uttarganga Rural Municipality", wards: 5 },
          { name: "Bhume Rural Municipality", wards: 5 },
          { name: "Sisne Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Dang Deukhuri",
        municipalities: [
          { name: "Ghorahi Sub-Metropolitan", wards: 19 },
          { name: "Tulsipur Sub-Metropolitan", wards: 19 },
          { name: "Lamahi Municipality", wards: 9 },
          { name: "Rajpur Rural Municipality", wards: 6 },
          { name: "Banglachuli Rural Municipality", wards: 6 },
          { name: "Babai Rural Municipality", wards: 6 },
          { name: "Dangisharan Rural Municipality", wards: 5 },
          { name: "Gadhawa Rural Municipality", wards: 6 },
          { name: "Rapti Rural Municipality", wards: 6 },
          { name: "Shantinagar Rural Municipality", wards: 6 },
        ],
      },
      {
        name: "Banke",
        municipalities: [
          { name: "Nepalgunj Sub-Metropolitan", wards: 17 },
          { name: "Kohalpur Municipality", wards: 9 },
          { name: "Baijanath Rural Municipality", wards: 5 },
          { name: "Duduwa Rural Municipality", wards: 5 },
          { name: "Janki Rural Municipality", wards: 5 },
          { name: "Khajura Rural Municipality", wards: 6 },
          { name: "Narainapur Rural Municipality", wards: 5 },
          { name: "Rapti Sonari Rural Municipality", wards: 6 },
        ],
      },
      {
        name: "Bardiya",
        municipalities: [
          { name: "Gulariya Municipality", wards: 9 },
          { name: "Madhuwan Municipality", wards: 9 },
          { name: "Rajapur Municipality", wards: 9 },
          { name: "Thakurbaba Municipality", wards: 9 },
          { name: "Barbardiya Municipality", wards: 9 },
          { name: "Badhaiyatal Rural Municipality", wards: 5 },
          { name: "Bansgadhi Municipality", wards: 9 },
          { name: "Geruwa Rural Municipality", wards: 5 },
        ],
      },
    ],
  },

  /* ── Province 6 / Karnali ───────────────────────────────────────── */
  {
    name: "Karnali",
    districts: [
      {
        name: "Surkhet",
        municipalities: [
          { name: "Birendranagar Municipality", wards: 9 },
          { name: "Bheriganga Municipality", wards: 9 },
          { name: "Gurbhakot Municipality", wards: 9 },
          { name: "Panchapuri Municipality", wards: 9 },
          { name: "Chaukune Rural Municipality", wards: 5 },
          { name: "Chingad Rural Municipality", wards: 5 },
          { name: "Kunathari Rural Municipality", wards: 5 },
          { name: "Lekbeshi Municipality", wards: 9 },
          { name: "Simta Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Dailekh",
        municipalities: [
          { name: "Narayan Municipality", wards: 9 },
          { name: "Dullu Municipality", wards: 9 },
          { name: "Aathabis Municipality", wards: 9 },
          { name: "Bhairabi Rural Municipality", wards: 5 },
          { name: "Chamunda Bindrasaini Municipality", wards: 9 },
          { name: "Dungeshwar Rural Municipality", wards: 5 },
          { name: "Gurans Rural Municipality", wards: 5 },
          { name: "Mahabu Rural Municipality", wards: 5 },
          { name: "Naumule Rural Municipality", wards: 5 },
          { name: "Thantikandh Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Jajarkot",
        municipalities: [
          { name: "Chandannath Municipality", wards: 9 },
          { name: "Bheri Municipality", wards: 9 },
          { name: "Barekot Rural Municipality", wards: 6 },
          { name: "Junichande Rural Municipality", wards: 5 },
          { name: "Kuse Rural Municipality", wards: 5 },
          { name: "Nalgad Municipality", wards: 9 },
          { name: "Shiwalaya Rural Municipality", wards: 5 },
          { name: "Tribeni Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Rukum West",
        municipalities: [
          { name: "Musikot Municipality", wards: 9 },
          { name: "Aathbiskot Municipality", wards: 9 },
          { name: "Banfikot Rural Municipality", wards: 5 },
          { name: "Chaurjahari Municipality", wards: 9 },
          { name: "Sani Bheri Rural Municipality", wards: 5 },
          { name: "Triveni Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Salyan",
        municipalities: [
          { name: "Sharada Municipality", wards: 9 },
          { name: "Bangad Kupinde Municipality", wards: 9 },
          { name: "Bagchaur Municipality", wards: 9 },
          { name: "Kalimati Rural Municipality", wards: 5 },
          { name: "Darma Rural Municipality", wards: 6 },
          { name: "Kapurkot Rural Municipality", wards: 5 },
          { name: "Kumakh Rural Municipality", wards: 5 },
          { name: "Siddha Kumakh Rural Municipality", wards: 5 },
          { name: "Tribeni Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Dolpa",
        municipalities: [
          { name: "Thuli Bheri Municipality", wards: 9 },
          { name: "Tripurasundari Municipality", wards: 9 },
          { name: "Dolpo Buddha Rural Municipality", wards: 5 },
          { name: "Jagadulla Rural Municipality", wards: 5 },
          { name: "Kaike Rural Municipality", wards: 5 },
          { name: "Mudkechula Rural Municipality", wards: 5 },
          { name: "She Phoksundo Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Mugu",
        municipalities: [
          { name: "Chhayanath Rara Municipality", wards: 9 },
          { name: "Khatyad Rural Municipality", wards: 5 },
          { name: "Mugum Carma Rural Municipality", wards: 5 },
          { name: "Soru Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Humla",
        municipalities: [
          { name: "Simkot Rural Municipality", wards: 5 },
          { name: "Adanchuli Rural Municipality", wards: 5 },
          { name: "Chankheli Rural Municipality", wards: 5 },
          { name: "Kharpunath Rural Municipality", wards: 5 },
          { name: "Namkha Rural Municipality", wards: 5 },
          { name: "Sarkegad Rural Municipality", wards: 5 },
          { name: "Tanjakot Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Kalikot",
        municipalities: [
          { name: "Khandachakra Municipality", wards: 9 },
          { name: "Narharinath Rural Municipality", wards: 5 },
          { name: "Pachaljharana Rural Municipality", wards: 5 },
          { name: "Palata Rural Municipality", wards: 5 },
          { name: "Raskot Municipality", wards: 9 },
          { name: "Shubha Kalika Rural Municipality", wards: 5 },
          { name: "Tilagupha Rural Municipality", wards: 5 },
          { name: "Mahawai Rural Municipality", wards: 5 },
        ],
      },
    ],
  },

  /* ── Province 7 / Sudurpashchim ─────────────────────────────────── */
  {
    name: "Sudurpashchim",
    districts: [
      {
        name: "Kailali",
        municipalities: [
          { name: "Dhangadhi Sub-Metropolitan", wards: 19 },
          { name: "Tikapur Municipality", wards: 9 },
          { name: "Bhajani Municipality", wards: 9 },
          { name: "Gauriganga Municipality", wards: 9 },
          { name: "Godawari Municipality", wards: 9 },
          { name: "Janaki Rural Municipality", wards: 5 },
          { name: "Joshipur Rural Municipality", wards: 5 },
          { name: "Kailari Rural Municipality", wards: 6 },
          { name: "Chure Rural Municipality", wards: 5 },
          { name: "Bardagoriya Rural Municipality", wards: 5 },
          { name: "Mohanyal Rural Municipality", wards: 5 },
          { name: "Phatepur Rural Municipality", wards: 5 },
          { name: "Lamkichuha Municipality", wards: 9 },
        ],
      },
      {
        name: "Kanchanpur",
        municipalities: [
          { name: "Mahendranagar Municipality", wards: 9 },
          { name: "Bedkot Municipality", wards: 9 },
          { name: "Belauri Municipality", wards: 9 },
          { name: "Bhimdatta Municipality", wards: 13 },
          { name: "Punarbas Municipality", wards: 9 },
          { name: "Shuklaphanta Municipality", wards: 9 },
          { name: "Beldandi Rural Municipality", wards: 5 },
          { name: "Krishnapur Municipality", wards: 9 },
          { name: "Laljhadi Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Dadeldhura",
        municipalities: [
          { name: "Amargadhi Municipality", wards: 9 },
          { name: "Aalital Rural Municipality", wards: 5 },
          { name: "Ajayameru Rural Municipality", wards: 5 },
          { name: "Bhageshwar Rural Municipality", wards: 5 },
          { name: "Ganyapadhura Rural Municipality", wards: 5 },
          { name: "Nawadurga Rural Municipality", wards: 6 },
          { name: "Parashuram Municipality", wards: 9 },
        ],
      },
      {
        name: "Doti",
        municipalities: [
          { name: "Dipayal Silgadhi Municipality", wards: 9 },
          { name: "Shikhar Municipality", wards: 9 },
          { name: "Aadarsha Rural Municipality", wards: 5 },
          { name: "Badikedar Rural Municipality", wards: 5 },
          { name: "Bogtan Phudsil Rural Municipality", wards: 5 },
          { name: "Jorayal Rural Municipality", wards: 5 },
          { name: "K I Singh Rural Municipality", wards: 5 },
          { name: "Lekam Rural Municipality", wards: 5 },
          { name: "Purbichauki Rural Municipality", wards: 5 },
          { name: "Sayal Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Achham",
        municipalities: [
          { name: "Mangalsen Municipality", wards: 9 },
          { name: "Camadanda Rural Municipality", wards: 5 },
          { name: "Chaurpati Rural Municipality", wards: 5 },
          { name: "Dhakari Rural Municipality", wards: 5 },
          { name: "Mellekh Rural Municipality", wards: 5 },
          { name: "Panchadewal Binayak Municipality", wards: 9 },
          { name: "Ramaroshan Rural Municipality", wards: 5 },
          { name: "Sanphebagar Municipality", wards: 9 },
          { name: "Turmakhand Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Bajura",
        municipalities: [
          { name: "Badimalika Municipality", wards: 9 },
          { name: "Budhiganga Municipality", wards: 9 },
          { name: "Budhinanda Municipality", wards: 9 },
          { name: "Gaumul Rural Municipality", wards: 5 },
          { name: "Himali Rural Municipality", wards: 5 },
          { name: "Jagannath Rural Municipality", wards: 5 },
          { name: "Khaptad Chhanna Rural Municipality", wards: 5 },
          { name: "Pandav Gupha Rural Municipality", wards: 5 },
          { name: "Tribeni Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Bajhang",
        municipalities: [
          { name: "Bungal Municipality", wards: 9 },
          { name: "Talkot Rural Municipality", wards: 5 },
          { name: "Chhededaha Rural Municipality", wards: 5 },
          { name: "Durgathali Rural Municipality", wards: 5 },
          { name: "Jayaprithvi Municipality", wards: 9 },
          { name: "Kedarsyu Rural Municipality", wards: 5 },
          { name: "Khaptadchhanna Rural Municipality", wards: 5 },
          { name: "Masta Rural Municipality", wards: 5 },
          { name: "Saipal Rural Municipality", wards: 5 },
          { name: "Surma Rural Municipality", wards: 5 },
          { name: "Thalara Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Baitadi",
        municipalities: [
          { name: "Dasharathchand Municipality", wards: 9 },
          { name: "Patan Municipality", wards: 9 },
          { name: "Dilasaini Rural Municipality", wards: 5 },
          { name: "Dogdakedar Rural Municipality", wards: 5 },
          { name: "Melauli Municipality", wards: 9 },
          { name: "Pancheshwar Rural Municipality", wards: 5 },
          { name: "Purchaudi Municipality", wards: 9 },
          { name: "Shivanath Rural Municipality", wards: 5 },
          { name: "Surnaya Rural Municipality", wards: 5 },
        ],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Property-type-specific specs — the dynamic fields Step 3 renders     */
/* per property type. Values are enum-style strings ready for the      */
/* backend pass (fields are currently wizard-only, not yet persisted). */
/* ------------------------------------------------------------------ */

export interface Option {
  value: string;
  label: string;
}

/** Property types that are sold by land area (units required). */
export const LAND_PROPERTY_TYPES = [
  "RESIDENTIAL_LAND",
  "COMMERCIAL_LAND",
  "AGRICULTURAL_LAND",
];

/** Property types that are sold by built-up area (building + optional land). */
export const BUILDING_PROPERTY_TYPES = [
  "RESIDENTIAL_HOUSE",
  "COMMERCIAL_SPACE",
  "HERITAGE_HOME",
];

export function isLandType(type: string): boolean {
  return LAND_PROPERTY_TYPES.includes(type);
}

export function isBuildingType(type: string): boolean {
  return BUILDING_PROPERTY_TYPES.includes(type);
}

/* ------------------------- residential land ------------------------- */

export const PLOT_SHAPES: Option[] = [
  { value: "RECTANGULAR", label: "Rectangular" },
  { value: "SQUARE", label: "Square" },
  { value: "IRREGULAR", label: "Irregular" },
  { value: "TRIANGULAR", label: "Triangular" },
  { value: "TRAPEZOIDAL", label: "Trapezoidal" },
  { value: "OTHER", label: "Other" },
];

export const BOUNDARY_WALL_OPTIONS: Option[] = [
  { value: "YES", label: "Yes" },
  { value: "PARTIAL", label: "Partial" },
  { value: "NO", label: "No" },
];

/* -------------------------- commercial land ------------------------- */

export const ZONING_OPTIONS: Option[] = [
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "MIXED_USE", label: "Mixed-use" },
  { value: "INDUSTRIAL", label: "Industrial" },
  { value: "RETAIL", label: "Retail" },
  { value: "OFFICE", label: "Office" },
  { value: "HOSPITALITY", label: "Hospitality" },
  { value: "OTHER", label: "Other" },
];

export const SUITABLE_FOR_OPTIONS: Option[] = [
  { value: "RETAIL", label: "Retail" },
  { value: "OFFICE", label: "Office" },
  { value: "HOTEL", label: "Hotel" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "WAREHOUSE", label: "Warehouse" },
  { value: "SHOWROOM", label: "Showroom" },
  { value: "BANK", label: "Bank" },
  { value: "OTHER", label: "Other" },
];

/* ------------------------- agricultural land ------------------------ */

export const LAND_CLASSIFICATIONS: Option[] = [
  { value: "IRRIGATED", label: "Irrigated" },
  { value: "RAIN_FED", label: "Rain-fed" },
  { value: "TERAI_FARMLAND", label: "Terai farmland" },
  { value: "HILLSIDE_TERRACE", label: "Hillside terrace" },
  { value: "ORCHARD", label: "Orchard" },
  { value: "PASTURE", label: "Pasture" },
  { value: "FOREST_WOODLOT", label: "Forest / woodlot" },
  { value: "BARREN", label: "Barren" },
  { value: "MIXED_USE", label: "Mixed-use" },
];

export const SOIL_TYPES: Option[] = [
  { value: "ALLUVIAL", label: "Alluvial" },
  { value: "SANDY_LOAM", label: "Sandy loam" },
  { value: "CLAY", label: "Clay" },
  { value: "SILT", label: "Silt" },
  { value: "RED_SOIL", label: "Red soil" },
  { value: "ROCKY", label: "Rocky" },
  { value: "MIXED", label: "Mixed" },
  { value: "UNKNOWN", label: "Unknown" },
];

export const WATER_SOURCES: Option[] = [
  { value: "RIVER_STREAM", label: "River / Stream" },
  { value: "CANAL", label: "Canal" },
  { value: "POND", label: "Pond" },
  { value: "WELL_BOREWELL", label: "Well / Borewell" },
  { value: "RAINWATER", label: "Rainwater harvesting" },
  { value: "IRRIGATION_SYSTEM", label: "Irrigation system" },
  { value: "NONE", label: "None" },
];

export const IRRIGATION_TYPES: Option[] = [
  { value: "FLOOD_FURROW", label: "Flood / furrow" },
  { value: "SPRINKLER", label: "Sprinkler" },
  { value: "DRIP", label: "Drip" },
  { value: "MANUAL", label: "Manual" },
  { value: "CANAL_FED", label: "Canal-fed" },
  { value: "OTHER", label: "Other" },
];

export const TERRAIN_TYPES: Option[] = [
  { value: "FLAT", label: "Flat" },
  { value: "GENTLE_SLOPE", label: "Gentle slope" },
  { value: "MODERATE_SLOPE", label: "Moderate slope" },
  { value: "STEEP_SLOPE", label: "Steep slope" },
  { value: "TERRACED", label: "Terraced" },
  { value: "HILLY", label: "Hilly" },
];

export const FARM_STRUCTURES: Option[] = [
  { value: "NONE", label: "None" },
  { value: "SHED", label: "Shed" },
  { value: "BARN", label: "Barn" },
  { value: "STORAGE", label: "Storage" },
  { value: "GREENHOUSE", label: "Greenhouse" },
  { value: "FARMHOUSE", label: "Farmhouse" },
  { value: "CATTLE_SHED", label: "Cattle shed" },
  { value: "TUBE_WELL", label: "Tube well" },
];

export const FENCING_OPTIONS: Option[] = [
  { value: "FULL", label: "Fully fenced" },
  { value: "PARTIAL", label: "Partially fenced" },
  { value: "NONE", label: "Unfenced" },
];

/* ------------------------- residential house ------------------------ */

export const HOUSE_SUBTYPES: Option[] = [
  { value: "INDEPENDENT_HOUSE", label: "Independent House" },
  { value: "DUPLEX", label: "Duplex" },
  { value: "TOWNHOUSE", label: "Townhouse" },
  { value: "VILLA", label: "Villa" },
  { value: "APARTMENT", label: "Apartment / Flat" },
  { value: "STUDIO", label: "Studio" },
  { value: "PENTHOUSE", label: "Penthouse" },
  { value: "BUNGALOW", label: "Bungalow" },
  { value: "ROW_HOUSE", label: "Row house" },
];

/** Subtypes where the unit sits in a multi-storey block (floor number & total floors apply). */
export const APARTMENT_LIKE_SUBTYPES = ["APARTMENT", "STUDIO", "PENTHOUSE"];

/** Subtypes that include the plot itself (corner plot toggle applies). */
export const HOUSE_WITH_LAND_SUBTYPES = [
  "INDEPENDENT_HOUSE",
  "DUPLEX",
  "TOWNHOUSE",
  "VILLA",
  "BUNGALOW",
  "ROW_HOUSE",
];

export const HOUSE_CONSTRUCTION_STATUSES: Option[] = [
  { value: "READY", label: "Ready to move" },
  { value: "UNDER_CONSTRUCTION", label: "Under construction" },
  { value: "PRE_LAUNCH", label: "Pre-launch" },
  { value: "RENOVATED", label: "Renovated" },
  { value: "OLD_CONSTRUCTION", label: "Old construction" },
];

export const PARKING_OPTIONS: Option[] = [
  { value: "NONE", label: "None" },
  { value: "ONE_CAR", label: "1 car" },
  { value: "TWO_CARS", label: "2 cars" },
  { value: "THREE_PLUS", label: "3+ cars" },
  { value: "COVERED", label: "Covered" },
  { value: "UNCOVERED", label: "Uncovered" },
  { value: "STREET", label: "Street parking" },
];

export const HOUSE_FURNISHING: Option[] = [
  { value: "UNFURNISHED", label: "Unfurnished" },
  { value: "SEMI_FURNISHED", label: "Semi-furnished" },
  { value: "FULLY_FURNISHED", label: "Fully furnished" },
];

export const HOUSE_AMENITIES: Option[] = [
  { value: "GARDEN", label: "Garden / Yard" },
  { value: "TERRACE_ROOFTOP", label: "Terrace / Rooftop access" },
  { value: "SERVANT_QUARTER", label: "Servant quarter" },
  { value: "STORE_ROOM", label: "Store room" },
  { value: "PUJA_ROOM", label: "Puja room" },
  { value: "STUDY_ROOM", label: "Study room" },
  { value: "LAUNDRY_ROOM", label: "Laundry room" },
  { value: "BASEMENT", label: "Basement" },
  { value: "SOLAR_WATER_HEATER", label: "Solar water heater" },
  { value: "WATER_SUPPLY", label: "Water supply (Municipal / Borewell)" },
  { value: "THREE_PHASE_ELECTRICITY", label: "Electricity (3-phase)" },
  { value: "INTERNET_FIBER", label: "Internet / Fiber ready" },
  { value: "CABLE_TV", label: "Cable TV" },
  { value: "SECURITY_GUARD", label: "Security guard" },
  { value: "CCTV_INTERCOM", label: "CCTV / Intercom" },
  { value: "GENERATOR_INVERTER", label: "Generator / Inverter" },
  { value: "ELEVATOR", label: "Elevator" },
  { value: "GYM", label: "Gym" },
  { value: "SWIMMING_POOL", label: "Swimming pool" },
  { value: "COMMUNITY_HALL", label: "Community hall" },
  { value: "PLAY_AREA", label: "Children's play area" },
  { value: "GAS_PIPELINE", label: "Gas pipeline" },
  { value: "RAINWATER_HARVESTING", label: "Rainwater harvesting" },
  { value: "EARTHQUAKE_RESISTANT", label: "Earthquake resistant" },
  { value: "FIRE_SAFETY", label: "Fire safety equipment" },
];

/** House facing = "Same as plot" or any of the 8 directions. */
export const HOUSE_FACING_OPTIONS: Option[] = [
  { value: "SAME_AS_PLOT", label: "Same as plot facing" },
  ...FACING_DIRECTIONS.map((d) => ({ value: d.value, label: d.label })),
];

/* -------------------------- commercial space ------------------------ */

export const SPACE_SUBTYPES: Option[] = [
  { value: "OFFICE_SPACE", label: "Office space" },
  { value: "RETAIL_SHOP", label: "Retail shop" },
  { value: "RESTAURANT", label: "Restaurant / food court" },
  { value: "WAREHOUSE", label: "Warehouse / Godown" },
  { value: "SHOWROOM", label: "Showroom" },
  { value: "COWORKING", label: "Co-working space" },
  { value: "HOTEL_MOTEL", label: "Hotel / Motel" },
  { value: "FACTORY_INDUSTRIAL", label: "Factory / Industrial" },
  { value: "MIXED_USE_BUILDING", label: "Mixed-use building" },
  { value: "SHOPPING_COMPLEX", label: "Shopping complex unit" },
  { value: "CLINIC", label: "Clinic / Diagnostic" },
];

export const SPACE_CONSTRUCTION_STATUSES: Option[] = [
  { value: "READY", label: "Ready" },
  { value: "UNDER_CONSTRUCTION", label: "Under construction" },
  { value: "CORE_SHELL", label: "Core & shell" },
  { value: "RENOVATED", label: "Renovated" },
];

export const SPACE_PARKING_TYPES: Option[] = [
  { value: "COVERED", label: "Covered" },
  { value: "UNCOVERED", label: "Uncovered" },
  { value: "BASEMENT", label: "Basement" },
  { value: "STILT", label: "Stilt" },
];

export const SPACE_FURNISHING: Option[] = [
  { value: "BARE_SHELL", label: "Bare shell" },
  { value: "WARM_SHELL", label: "Warm shell" },
  { value: "UNFURNISHED", label: "Unfurnished" },
  { value: "SEMI_FURNISHED", label: "Semi-furnished" },
  { value: "FULLY_FURNISHED", label: "Fully furnished" },
];

export const PRICE_TYPES: Option[] = [
  { value: "FIXED", label: "Fixed price" },
  { value: "NEGOTIABLE", label: "Negotiable" },
  { value: "ON_REQUEST", label: "Price on request" },
];

export const COMMERCIAL_FEATURES: Option[] = [
  { value: "THREE_PHASE_ELECTRICITY", label: "3-phase electricity" },
  { value: "HIGH_SPEED_INTERNET", label: "High-speed internet ready" },
  { value: "CENTRAL_AC", label: "Central AC provision" },
  { value: "FIRE_SAFETY_NOC", label: "Fire safety / NOC" },
  { value: "LIFT_ELEVATOR", label: "Lift / Elevator" },
  { value: "SECURITY_24_7", label: "24/7 security" },
  { value: "CCTV", label: "CCTV" },
  { value: "POWER_BACKUP", label: "Power backup" },
  { value: "WATER_STORAGE_TANK", label: "Water storage tank" },
  { value: "SEPTIC_TANK", label: "Septic tank" },
  { value: "LOADING_BAY", label: "Loading / unloading bay" },
  { value: "MEZZANINE", label: "Mezzanine floor" },
  { value: "DISPLAY_WINDOW", label: "Display window" },
  { value: "STORAGE_ROOM", label: "Storage room / Godown" },
  { value: "PANTRY", label: "Pantry / Kitchenette" },
  { value: "ATTACHED_TOILET", label: "Attached toilet" },
  { value: "DG_SET", label: "DG set provision" },
  { value: "VASTU", label: "Vastu compliant" },
];

export const ZONING_LEGAL_OPTIONS: Option[] = [
  { value: "RESIDENTIAL_COMMERCIAL_MIXED", label: "Residential-commercial mixed" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "INDUSTRIAL", label: "Industrial" },
  { value: "INSTITUTIONAL", label: "Institutional" },
  { value: "OTHER", label: "Other" },
];

/* ---------------------------- heritage home ------------------------- */

export const HERITAGE_TYPES: Option[] = [
  { value: "NEWARI_TRADITIONAL", label: "Newari traditional" },
  { value: "MALLA_ERA", label: "Malla era" },
  { value: "RANA_PALACE", label: "Rana palace" },
  { value: "GORKHA_STYLE", label: "Gorkha style" },
  { value: "BUDDHIST_MONASTERY", label: "Buddhist monastery" },
  { value: "TERAI_HAVELI", label: "Traditional Terai haveli" },
  { value: "OTHER", label: "Other" },
];

export const HERITAGE_ERAS: Option[] = [
  { value: "PRE_1900", label: "Pre-1900" },
  { value: "1900_1950", label: "1900–1950" },
  { value: "1950_1980", label: "1950–1980" },
  { value: "1980_2000", label: "1980–2000" },
  { value: "UNKNOWN", label: "Unknown" },
];

export const HERITAGE_GRADES: Option[] = [
  { value: "GRADE_I", label: "Grade I (National heritage)" },
  { value: "GRADE_II", label: "Grade II (Provincial)" },
  { value: "GRADE_III", label: "Grade III (Local)" },
  { value: "UNGRADED", label: "Ungraded" },
  { value: "UNKNOWN", label: "Unknown" },
];

export const TRADITIONAL_FEATURES: Option[] = [
  { value: "CARVED_WOODEN_WINDOWS", label: "Carved wooden windows (Tiki-jhya)" },
  { value: "BRICK_TIMBER_FRAME", label: "Brick-timber frame (Dhalan)" },
  { value: "STONE_FOUNDATION", label: "Stone foundation" },
  { value: "MUD_MORTAR", label: "Mud mortar construction" },
  { value: "TRADITIONAL_TILED_ROOF", label: "Traditional tiled roof" },
  { value: "TORAN_GATEWAY", label: "Toran / Gateway" },
  { value: "STONE_SPOUT", label: "Stone spout (Dhunge dhara)" },
  { value: "BRICK_PAVEMENT", label: "Brick pavement (Pati)" },
  { value: "ORIGINAL_MURALS", label: "Original murals / Paintings" },
  { value: "TRADITIONAL_STAIRCASE", label: "Traditional staircase" },
];

export const RENOVATION_STATUSES: Option[] = [
  { value: "ORIGINAL", label: "Original / untouched" },
  { value: "PARTIALLY_RENOVATED", label: "Partially renovated" },
  { value: "FULLY_RENOVATED", label: "Fully renovated" },
  { value: "RESTORED_EXPERT", label: "Restored by expert" },
  { value: "MODERNIZED", label: "Modernized" },
];

export const COURTYARD_OPTIONS: Option[] = [
  { value: "CENTRAL", label: "Central" },
  { value: "SIDE", label: "Side" },
  { value: "MULTIPLE", label: "Multiple" },
  { value: "NONE", label: "None" },
];

export const HERITAGE_AMENITY_EXTRAS: Option[] = [
  { value: "HERITAGE_CONSERVATION", label: "Heritage conservation status" },
  { value: "TOURISM_HOMESTAY", label: "Tourism / homestay potential" },
  { value: "MUSEUM_POTENTIAL", label: "Museum potential" },
];

/* ---------------------------- review checklist ------------------------- */

// (REVIEW_CHECKLIST was static mock data; StepReview now builds the
// checklist dynamically from the actual wizard draft.)
