import type { ComponentType } from "react";
import {
  ArrowRight,
  Banknote,
  Box,
  CalendarCheck,
  Cpu,
  Hammer,
  Newspaper,
  PhoneCall,
  Recycle,
  Refrigerator,
  Scale,
  ShieldCheck,
  Truck,
} from "lucide-react";

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

export function formatRate(item: { rate: number; unit: string }): string {
  return `Rs ${formatNepaliNumber(item.rate)} / ${item.unit === "kg" ? "kg" : "piece"}`;
}

export function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

const LUCIDE_ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  ArrowRight,
  Banknote,
  Box,
  CalendarCheck,
  Cpu,
  Hammer,
  Newspaper,
  PhoneCall,
  Recycle,
  Refrigerator,
  Scale,
  ShieldCheck,
  Truck,
};

export function getLucideIcon(
  name: string,
): ComponentType<{ className?: string }> | null {
  return LUCIDE_ICON_MAP[name] ?? null;
}
