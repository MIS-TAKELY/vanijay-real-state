export type Trend = "up" | "flat" | "down";
export type MapMode = "dark" | "satellite" | "streets";
export type Region =
  | "Kathmandu Valley"
  | "Pokhara"
  | "Eastern"
  | "Central & Terai"
  | "Western";

export interface Marker {
  id: string;
  price: string;
  priceValue: number;
  change: string;
  trend: Trend;
  lat: number;
  lng: number;
  area: string;
  city: string;
  region: Region;
  verified: boolean;
  description: string;
  tags: string[];
  sqFt: string;
  psf: string;
  tier: "premium" | "standard" | "emerging";
}