/**
 * Kabadi price guide — what your scrap is worth.
 * Rates compiled from an analysis of scrap marketplaces (Scrapuncle, The
 * Kabadiwala, Thulo Kawadi Recycling) and Kathmandu Valley market data.
 * Rates are indicative, per kg / per piece, and vary with condition and
 * current market. Last reviewed: Aug 2026.
 */

export type KabadiUnit = "kg" | "piece";

export type KabadiCategoryId =
  | "paper"
  | "plastic"
  | "metal"
  | "ewaste"
  | "appliance"
  | "other";

export interface KabadiItem {
  id: string;
  name: string;
  nepali?: string;
  category: KabadiCategoryId;
  unit: KabadiUnit;
  rate: number; // NPR
  note?: string;
  popular?: boolean;
}

export interface KabadiCategory {
  id: KabadiCategoryId;
  name: string;
  nepali: string;
  icon: string;
  blurb: string;
}

export const KABADI_CATEGORIES: KabadiCategory[] = [
  {
    id: "paper",
    name: "Paper & Cardboard",
    nepali: "कागज र गत्ता",
    icon: "newspaper",
    blurb:
      "Newspapers, office paper, books and gatta (cardboard). Keep it dry for top rates.",
  },
  {
    id: "plastic",
    name: "Plastic",
    nepali: "प्लास्टिक",
    icon: "recycling",
    blurb:
      "PET bottles, milk packets, buckets and hard plastic. Sorted plastic pays more.",
  },
  {
    id: "metal",
    name: "Metals",
    nepali: "धातु",
    icon: "hammer",
    blurb:
      "Copper, brass, aluminum, iron and steel. The heavy hitters of the kabadi world.",
  },
  {
    id: "ewaste",
    name: "E-Waste",
    nepali: "इ-फोहोर",
    icon: "cpu",
    blurb:
      "Old phones, laptops, CPUs, monitors and printers. Value is per piece.",
  },
  {
    id: "appliance",
    name: "Appliances",
    nepali: "विद्युतीय सामान",
    icon: "refrigerator",
    blurb:
      "Fridges, washing machines, ACs, geysers and microwaves — priced per unit.",
  },
  {
    id: "other",
    name: "Glass & Other",
    nepali: "अन्य सामान",
    icon: "bottle",
    blurb: "Glass bottles, clothes, tires, batteries and vehicles.",
  },
];

export const KABADI_ITEMS: KabadiItem[] = [
  /* ---- Paper & Cardboard ---- */
  {
    id: "paper-newspaper",
    name: "Newspaper",
    nepali: "पत्रिका",
    category: "paper",
    unit: "kg",
    rate: 35,
    note: "Clean & dry",
    popular: true,
  },
  {
    id: "paper-office",
    name: "Office paper (A3/A4)",
    nepali: "कागज",
    category: "paper",
    unit: "kg",
    rate: 15,
  },
  {
    id: "paper-books",
    name: "Books",
    nepali: "किताब",
    category: "paper",
    unit: "kg",
    rate: 12,
  },
  {
    id: "paper-notebooks",
    name: "Notebooks & copies",
    nepali: "कापी",
    category: "paper",
    unit: "kg",
    rate: 10,
  },
  {
    id: "paper-cardboard",
    name: "Cardboard / gatta",
    nepali: "गत्ता",
    category: "paper",
    unit: "kg",
    rate: 12,
  },

  /* ---- Plastic ---- */
  {
    id: "plastic-pet",
    name: "PET bottles",
    nepali: "पानीको बोतल",
    category: "plastic",
    unit: "kg",
    rate: 20,
    note: "Sorted",
    popular: true,
  },
  {
    id: "plastic-milk",
    name: "Milk packets",
    nepali: "दूधको प्याकेट",
    category: "plastic",
    unit: "kg",
    rate: 10,
  },
  {
    id: "plastic-hard",
    name: "Hard plastic (buckets, chairs)",
    nepali: "कडा प्लास्टिक",
    category: "plastic",
    unit: "kg",
    rate: 15,
  },
  {
    id: "plastic-mixed",
    name: "Mixed plastic",
    nepali: "मिश्रित प्लास्टिक",
    category: "plastic",
    unit: "kg",
    rate: 8,
  },
  {
    id: "plastic-drum",
    name: "Plastic drums",
    nepali: "प्लास्टिक ड्रम",
    category: "plastic",
    unit: "piece",
    rate: 120,
  },

  /* ---- Metals ---- */
  {
    id: "metal-copper",
    name: "Copper (wire, tube)",
    nepali: "तामा",
    category: "metal",
    unit: "kg",
    rate: 1400,
    note: "Best rate in the yard",
    popular: true,
  },
  {
    id: "metal-brass",
    name: "Brass",
    nepali: "पित्तल",
    category: "metal",
    unit: "kg",
    rate: 900,
    popular: true,
  },
  {
    id: "metal-aluminum",
    name: "Aluminum",
    nepali: "एल्मुनियम",
    category: "metal",
    unit: "kg",
    rate: 200,
  },
  {
    id: "metal-iron",
    name: "Iron",
    nepali: "फलाम",
    category: "metal",
    unit: "kg",
    rate: 35,
  },
  {
    id: "metal-steel",
    name: "Steel utensils",
    nepali: "स्टिल भाँडा",
    category: "metal",
    unit: "kg",
    rate: 40,
  },
  {
    id: "metal-tin",
    name: "Tin",
    nepali: "टिन",
    category: "metal",
    unit: "kg",
    rate: 25,
  },
  {
    id: "metal-battery",
    name: "Lead-acid battery (small)",
    nepali: "ब्याट्री",
    category: "metal",
    unit: "piece",
    rate: 500,
  },
  {
    id: "metal-battery-large",
    name: "Lead-acid battery (large)",
    nepali: "ठूलो ब्याट्री",
    category: "metal",
    unit: "piece",
    rate: 1200,
  },

  /* ---- E-Waste ---- */
  {
    id: "ewaste-smartphone",
    name: "Smartphone (old)",
    nepali: "पुरानो मोबाइल",
    category: "ewaste",
    unit: "piece",
    rate: 150,
    note: "Working or not",
    popular: true,
  },
  {
    id: "ewaste-keypad",
    name: "Keypad phone",
    nepali: "किप्याड मोबाइल",
    category: "ewaste",
    unit: "piece",
    rate: 80,
  },
  {
    id: "ewaste-laptop",
    name: "Laptop",
    nepali: "ल्यापटप",
    category: "ewaste",
    unit: "piece",
    rate: 350,
  },
  {
    id: "ewaste-cpu",
    name: "Desktop CPU",
    nepali: "कम्प्युटर",
    category: "ewaste",
    unit: "piece",
    rate: 400,
  },
  {
    id: "ewaste-monitor",
    name: "Monitor (LCD)",
    nepali: "मनिटर",
    category: "ewaste",
    unit: "piece",
    rate: 250,
  },
  {
    id: "ewaste-printer",
    name: "Printer",
    nepali: "प्रिन्टर",
    category: "ewaste",
    unit: "piece",
    rate: 300,
  },
  {
    id: "ewaste-pcb",
    name: "Circuit boards (PCB)",
    nepali: "सर्किट बोर्ड",
    category: "ewaste",
    unit: "kg",
    rate: 200,
  },

  /* ---- Appliances ---- */
  {
    id: "app-fridge-single",
    name: "Refrigerator (single door)",
    nepali: "फ्रिज",
    category: "appliance",
    unit: "piece",
    rate: 1800,
    popular: true,
  },
  {
    id: "app-fridge-double",
    name: "Refrigerator (double door)",
    nepali: "ठूलो फ्रिज",
    category: "appliance",
    unit: "piece",
    rate: 3500,
  },
  {
    id: "app-washing",
    name: "Washing machine",
    nepali: "धुने मेसिन",
    category: "appliance",
    unit: "piece",
    rate: 1500,
  },
  {
    id: "app-ac-window",
    name: "AC (window)",
    nepali: "एसी",
    category: "appliance",
    unit: "piece",
    rate: 2500,
  },
  {
    id: "app-ac-split",
    name: "AC (split, with copper)",
    nepali: "स्प्लिट एसी",
    category: "appliance",
    unit: "piece",
    rate: 4000,
  },
  {
    id: "app-geyser",
    name: "Water heater / geyser",
    nepali: "गिजर",
    category: "appliance",
    unit: "piece",
    rate: 800,
  },
  {
    id: "app-microwave",
    name: "Microwave oven",
    nepali: "माइक्रोवेभ",
    category: "appliance",
    unit: "piece",
    rate: 600,
  },
  {
    id: "app-tv",
    name: "TV (CRT / old)",
    nepali: "पुरानो टिभी",
    category: "appliance",
    unit: "piece",
    rate: 500,
  },

  /* ---- Glass & Other ---- */
  {
    id: "other-glass",
    name: "Glass bottles",
    nepali: "सिसाको बोतल",
    category: "other",
    unit: "kg",
    rate: 6,
  },
  {
    id: "other-clothes",
    name: "Old clothes",
    nepali: "पुरानो कपडा",
    category: "other",
    unit: "kg",
    rate: 5,
  },
  {
    id: "other-tires",
    name: "Vehicle tires",
    nepali: "टायर",
    category: "other",
    unit: "piece",
    rate: 50,
  },
  {
    id: "other-bicycle",
    name: "Bicycle",
    nepali: "साइकल",
    category: "other",
    unit: "piece",
    rate: 500,
  },
  {
    id: "other-bike",
    name: "Motorcycle (scrap)",
    nepali: "मोटरसाइकल",
    category: "other",
    unit: "piece",
    rate: 2500,
  },
  {
    id: "other-car",
    name: "Car (scrap)",
    nepali: "गाडी",
    category: "other",
    unit: "piece",
    rate: 18000,
  },
];

export const RATES_LAST_UPDATED = "2026-08-12";

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

/** Indian/Nepali digit grouping: 4100000 → "41,00,000". */
export function formatNepaliNumber(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.round(Math.abs(value));
  const s = String(abs);
  if (s.length <= 3) return `${sign}${s}`;
  const last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  const groups: string[] = [last3];
  while (rest.length > 2) {
    groups.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest.length > 0) groups.unshift(rest);
  return `${sign}${groups.join(",")}`;
}

export function formatRate(item: Pick<KabadiItem, "rate" | "unit">): string {
  return `Rs ${formatNepaliNumber(item.rate)} / ${item.unit === "kg" ? "kg" : "piece"}`;
}

export function categoryById(id: KabadiCategoryId): KabadiCategory {
  return KABADI_CATEGORIES.find((c) => c.id === id) ?? KABADI_CATEGORIES[0]!;
}

export const KABADI_DEFAULT_ITEM: KabadiItem = KABADI_ITEMS[0]!;
