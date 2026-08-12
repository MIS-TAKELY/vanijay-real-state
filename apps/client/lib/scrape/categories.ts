/**
 * Hamrobazaar real-estate categories (public data, sourced from the site's
 * category tree — GUIDs captured from live category URLs, Aug 2026).
 * Safe to import from client components: constants only, no fetch logic.
 */

export interface HamrobazaarCategory {
  id: string;
  slug: string;
  detailPath: string;
  name: string;
  isAll?: boolean;
}

export const HAMROBAZAAR_REAL_ESTATE_CATEGORIES: HamrobazaarCategory[] = [
  {
    id: "06B8B8E6-4CDE-4D79-AE65-38B8BAA9FF17",
    slug: "real-estate",
    detailPath: "real-estate",
    name: "All Real Estate",
    isAll: true,
  },
  {
    id: "7305909A-83CA-4AAD-B474-FC6E02963642",
    slug: "for-sale-land",
    detailPath: "for-sale-land",
    name: "For Sale — Land",
  },
  {
    id: "56C5F377-50C1-42A4-B6C2-24A8B3235DC7",
    slug: "for-sale-house",
    detailPath: "for-sale-house",
    name: "For Sale — House",
  },
  {
    id: "FAE90931-F7AF-4A21-B1D5-64D9BC8E9966",
    slug: "for-sale-apartment",
    detailPath: "for-sale-apartment",
    name: "For Sale — Apartment",
  },
  {
    id: "772C51F2-C967-41ED-A183-5D53876AC400",
    slug: "for-sale-commercial-building",
    detailPath: "for-sale-commercial-building",
    name: "For Sale — Commercial Building",
  },
  {
    id: "237B5864-5C80-46A3-AC73-ACAFCF2E8E5C",
    slug: "business-shop-for-sale",
    detailPath: "business-shop-for-sale",
    name: "Business & Shop For Sale",
  },
  {
    id: "0E1281CE-7C55-4821-BE0A-62C566CCD577",
    slug: "for-rent-flat-apartment",
    detailPath: "for-rent-flat-apartment",
    name: "For Rent — Flat & Apartment",
  },
  {
    id: "5C236040-EAB5-4C16-8954-41A0F2F780CE",
    slug: "for-rent-house",
    detailPath: "for-rent-house",
    name: "For Rent — House",
  },
  {
    id: "52869B8F-6C05-46F5-94D3-8ECAD6D273CA",
    slug: "for-rent-land",
    detailPath: "for-rent-land",
    name: "For Rent — Land",
  },
  {
    id: "77433461-DCC8-4ABC-94A6-C3AA5D92B545",
    slug: "for-rent-office-space",
    detailPath: "for-rent-office-space",
    name: "For Rent — Office Space",
  },
  {
    id: "A9C70559-16C7-49D8-988B-9AC3C9F975E7",
    slug: "for-rent-shutter-shop-space",
    detailPath: "for-rent-shutter-shop-space",
    name: "For Rent — Shutter & Shop Space",
  },
  {
    id: "890B268A-6DAC-4C35-9B80-946AFFF13441",
    slug: "flatmates-paying-guests",
    detailPath: "flatmates-paying-guests",
    name: "Flatmates & Paying Guests",
  },
];

export function findCategory(id: string): HamrobazaarCategory | undefined {
  return HAMROBAZAAR_REAL_ESTATE_CATEGORIES.find((c) => c.id === id);
}

export const HAMROBAZAAR_DEFAULT_CATEGORY: HamrobazaarCategory =
  HAMROBAZAAR_REAL_ESTATE_CATEGORIES.find((c) => c.isAll) ??
  HAMROBAZAAR_REAL_ESTATE_CATEGORIES[0]!;
