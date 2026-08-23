/**
 * Nepal district catalog — single source of truth for the programmatic
 * area-guide pages at /area-guid/[slug].
 *
 * Each district gets a data-driven landing page populated from live verified
 * listings (propertiesFeed filtered by `district`). Slugs are stable,
 * lowercase-hyphenated forms of the official district names so URLs never
 * change even if display names are edited elsewhere.
 */

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
}

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

export const DISTRICT_CATALOG: DistrictEntry[] = RAW_DISTRICTS.map(
  ([province, name]) => ({ slug: toSlug(name), name, province }),
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