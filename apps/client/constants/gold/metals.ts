export type MetalId =
  | "gold"
  | "silver"
  | "platinum"
  | "palladium"
  | "bitcoin"
  | "ethereum"
  | "copper"
  | "diamond"
  | "steel";

/** Display currencies supported by the market UI. */
export type CurrencyCode = "NPR" | "USD" | "EUR" | "GBP" | "INR" | "CNY";

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  NPR: "रू",
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  CNY: "¥",
};

/** Approximate conversion rates from USD for display purposes. */
export const USD_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  NPR: 133,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.5,
  CNY: 7.24,
};

/** Unit conversion factors relative to troy ounce. */
export const UNIT_FACTORS: Record<string, number> = {
  oz: 1,
  gram: 31.1035,
  kilo: 0.0311035,
  tola: 2.6667,
  anna: 42.6667,
  sukhi: 170.6667,
};

export type WeightUnit = keyof typeof UNIT_FACTORS;

/** Display currency for the market — Nepali Rupee. */
export const CURRENCY_SYMBOL = CURRENCY_SYMBOLS.NPR;
export const CURRENCY_CODE = "NPR";

/** Approximate NPR→USD rate used only for pre-fetch fallback rendering. */
export const FALLBACK_USD_TO_NPR = 133;

export interface MetalMeta {
  id: MetalId;
  name: string;
  /** gold-api.com symbol (XAU, XAG, XPT, XPD, BTC, ETH, HG). */
  symbol: string;
  unit: string;
  accentColor: string;
  /** Relative volatility used to shape the synthetic sparkline around the live price. */
  volatility: number;
  description: string;
}

export interface MetalData extends MetalMeta {
  /** Live price in NPR. */
  price: number;
  /** Live price in USD. */
  usdPrice: number;
  /** Bid in NPR (only for metals whose source has an order book). */
  bid?: number;
  /** Ask in NPR. */
  ask?: number;
  /** Bid in USD. */
  usdBid?: number;
  /** Ask in USD. */
  usdAsk?: number;
  change: number;
  /** Absolute change in USD. */
  changeUsd: number;
  changePercent: number;
  /** Synthetic sparkline in NPR, anchored at the live price. */
  sparkline: number[];
  /** Synthetic sparkline in USD, anchored at the live USD price. */
  sparklineUsd: number[];
}

export interface HistoricalRow {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
}

// ── Static metadata for the symbols served by the gold-api / freegoldprice APIs ──

export const METAL_META_LIST: MetalMeta[] = [
  {
    id: "gold",
    name: "Gold",
    symbol: "XAU",
    unit: "oz",
    accentColor: "#C9A84C",
    volatility: 0.004,
    description:
      "The benchmark precious metal. Global reserve asset, inflation hedge, and cornerstone of portfolio diversification.",
  },
  {
    id: "silver",
    name: "Silver",
    symbol: "XAG",
    unit: "oz",
    accentColor: "#A8A9AD",
    volatility: 0.01,
    description:
      "Dual-purpose metal with industrial demand from solar panels and electronics alongside a traditional store-of-value role.",
  },
  {
    id: "platinum",
    name: "Platinum",
    symbol: "XPT",
    unit: "oz",
    accentColor: "#E5E4E2",
    volatility: 0.008,
    description:
      "Rarer than gold. Critical in automotive catalytic converters and hydrogen fuel cell technology.",
  },
  {
    id: "palladium",
    name: "Palladium",
    symbol: "XPD",
    unit: "oz",
    accentColor: "#CED0DD",
    volatility: 0.012,
    description:
      "Essential for gasoline engine emissions control. Supply is concentrated in Russia and South Africa.",
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    unit: "coin",
    accentColor: "#F7931A",
    volatility: 0.03,
    description:
      "Digital gold — a scarce, decentralized store of value with a hard supply cap of 21 million coins.",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    unit: "coin",
    accentColor: "#627EEA",
    volatility: 0.04,
    description:
      "Programmable money powering smart contracts, DeFi, and the largest app ecosystem in crypto.",
  },
  {
    id: "copper",
    name: "Copper",
    symbol: "HG",
    unit: "lb",
    accentColor: "#B87333",
    volatility: 0.015,
    description:
      "The industrial metal of electrification — wiring, motors, and grids as the world transitions to clean energy.",
  },
  {
    id: "diamond",
    name: "Diamond",
    symbol: "DIA",
    unit: "carat",
    accentColor: "#B9F2FF",
    volatility: 0.005,
    description:
      "The ultimate store of value in gemstone form. Industrial-grade diamonds drive semiconductor and quantum computing research.",
  },
  {
    id: "steel",
    name: "Steel",
    symbol: "STL",
    unit: "ton",
    accentColor: "#71797E",
    volatility: 0.018,
    description:
      "The backbone of modern infrastructure. Steel prices reflect global construction demand, iron ore supply, and carbon policy.",
  },
];

export const METAL_META = Object.fromEntries(
  METAL_META_LIST.map((m) => [m.id, m]),
) as Record<MetalId, MetalMeta>;

// ── Synthetic sparkline / history, anchored at the live price ──

function generateSparkline(
  base: number,
  volatilityRatio: number,
  points: number,
): number[] {
  const data: number[] = [];
  let current = base * (1 - volatilityRatio * 2);
  for (let i = 0; i < points - 1; i++) {
    const t = i / (points - 1);
    const change =
      Math.sin(i * 0.8) * volatilityRatio * base +
      Math.cos(i * 1.3) * volatilityRatio * base * 0.5;
    // Dampen oscillation toward the end so the series closes on the live price.
    current += change * (1 - t);
    data.push(current);
  }
  data.push(base);
  return data;
}

function generateHistory(basePrice: number, days: number): HistoricalRow[] {
  const rows: HistoricalRow[] = [];
  const now = new Date();
  let price = basePrice * 0.94;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const dailyVol = basePrice * 0.012;
    const open = price;
    const change =
      Math.sin(i * 0.7) * dailyVol + Math.cos(i * 1.1) * dailyVol * 0.4;
    const close = price + change;
    const high = Math.max(open, close) + Math.abs(change) * 0.3;
    const low = Math.min(open, close) - Math.abs(change) * 0.3;

    rows.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      change: Math.round((close - open) * 100) / 100,
    });

    price = close;
  }

  return rows.reverse();
}

// ── Construction helpers ──

export function buildMetalData(
  id: MetalId,
  price: number,
  extra?: Partial<
    Pick<MetalData, "bid" | "ask" | "usdPrice" | "usdBid" | "usdAsk">
  >,
): MetalData {
  const meta = METAL_META[id];
  const usdPrice = extra?.usdPrice ?? price / FALLBACK_USD_TO_NPR;
  const sparkline = generateSparkline(price, meta.volatility, 30);
  const sparklineUsd = generateSparkline(usdPrice, meta.volatility, 30);
  const first = sparkline[0] ?? price;
  const firstUsd = sparklineUsd[0] ?? usdPrice;
  const change = price - first;
  const changeUsd = usdPrice - firstUsd;
  const changePercent = (change / first) * 100;
  return {
    ...meta,
    price,
    usdPrice,
    sparkline,
    sparklineUsd,
    change,
    changeUsd,
    changePercent,
    ...extra,
  };
}

/** Fallback quotes (NPR) so the page renders before the first live fetch. */
export const FALLBACK_PRICES: Record<MetalId, number> = {
  gold: 666386.69,
  silver: 9907.36,
  platinum: 263802.85,
  palladium: 205316.26,
  bitcoin: 9_639_000,
  ethereum: 286_600,
  copper: 995,
  diamond: 1_200_000,
  steel: 85_000,
};

/** Convert a USD price to any supported display currency. */
export function convertCurrency(
  usdPrice: number,
  currency: CurrencyCode,
): number {
  return usdPrice * (USD_EXCHANGE_RATES[currency] ?? 1);
}

/**
 * Live price in the requested display currency.
 * NPR and USD are exact (served by the feed); other currencies are
 * converted from the USD quote so the symbol and value always agree.
 */
export function priceInCurrency(
  metal: Pick<MetalData, "price" | "usdPrice">,
  currency: CurrencyCode,
): number {
  if (currency === "NPR") return metal.price;
  return convertCurrency(metal.usdPrice, currency);
}

/** Absolute change in the requested display currency. */
export function changeInCurrency(
  metal: Pick<MetalData, "change" | "changeUsd">,
  currency: CurrencyCode,
): number {
  if (currency === "NPR") return metal.change;
  return convertCurrency(metal.changeUsd, currency);
}

/**
 * Live price per traditional Nepali unit (tola/anna/sukhi) in the requested
 * display currency. Uses the same live quote as the hero price (NPR from the
 * feed; other currencies from the USD quote) so units stay consistent.
 * Only meaningful for metals priced by weight.
 */
export function pricePerNepalUnit(
  metal: Pick<MetalData, "price" | "usdPrice" | "unit">,
  unit: NepalUnit,
  currency: CurrencyCode,
): number {
  const base = priceInCurrency(metal, currency);
  return convertUnit(base, metal.unit, unit.id);
}

/** Conversion factors: how many grams in one unit. */
const GRAMS_PER_UNIT: Record<string, number> = {
  oz: 31.1035,
  gram: 1,
  kilo: 1000,
  tola: 11.6638038,
  anna: 11.6638038 / 16,
  sukhi: 11.6638038 / 64,
  lb: 453.592,
  carat: 0.2,
  ton: 1_000_000,
};

// ── Traditional Nepali weight units ──
// Standard in Nepal's bullion/jewellery market — FEDHEN daily rates are
// quoted per tola. 1 tola (तोल) = 180 troy grains = 11.6638038 g;
// 1 tola = 16 anna (आन); 1 anna = 4 sukhi (सुक) → 1 tola = 64 sukhi.
export interface NepalUnit {
  id: "tola" | "anna" | "sukhi";
  label: string;
  nepali: string;
  grams: number;
}

export const NEPAL_UNITS: NepalUnit[] = [
  { id: "tola", label: "Tola", nepali: "तोला", grams: GRAMS_PER_UNIT.tola! },
  { id: "anna", label: "Anna", nepali: "आना", grams: GRAMS_PER_UNIT.anna! },
  { id: "sukhi", label: "Sukhi", nepali: "सुकी", grams: GRAMS_PER_UNIT.sukhi! },
];

/** Convert a price from one unit to another. Works for any source/target unit pair. */
export function convertUnit(
  price: number,
  fromUnit: string,
  toUnit: WeightUnit | string,
): number {
  if (fromUnit === toUnit) return price;
  const fromGrams = GRAMS_PER_UNIT[fromUnit] || 31.1035;
  const toGrams = GRAMS_PER_UNIT[toUnit] || 31.1035;
  const pricePerGram = price / fromGrams;
  return pricePerGram * toGrams;
}

/** Format price with currency symbol and unit conversion. */
export function formatConvertedPrice(
  usdPrice: number,
  currency: CurrencyCode,
  unit: WeightUnit = "oz",
  originalUnit: string = "oz",
): string {
  const converted = convertUnit(usdPrice, originalUnit, unit);
  const inCurrency = convertCurrency(converted, currency);
  return `${CURRENCY_SYMBOLS[currency]}${inCurrency.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** SEO-friendly slug for each metal. */
export const METAL_SLUGS: Record<MetalId, string> = {
  gold: "gold",
  silver: "silver",
  platinum: "platinum",
  palladium: "palladium",
  bitcoin: "bitcoin",
  ethereum: "ethereum",
  copper: "copper",
  diamond: "diamond",
  steel: "steel",
};

/** Reverse lookup: slug → MetalId. */
export const SLUG_TO_METAL: Record<string, MetalId> = Object.fromEntries(
  (Object.entries(METAL_SLUGS) as [MetalId, string][]).map(([id, slug]) => [
    slug,
    id,
  ]),
) as Record<string, MetalId>;

export const METALS_DATA: MetalData[] = METAL_META_LIST.map((m) =>
  buildMetalData(m.id, FALLBACK_PRICES[m.id]),
);

export function getHistoricalData(price: number): HistoricalRow[] {
  return generateHistory(price, 14);
}

// ── Formatting ──

export function formatPrice(
  value: number,
  currency: CurrencyCode = "NPR",
): string {
  return `${CURRENCY_SYMBOLS[currency]}${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Bid/ask pair for the requested currency (undefined when unavailable). */
export function getBidAsk(
  metal: Pick<MetalData, "bid" | "ask" | "usdBid" | "usdAsk">,
  currency: CurrencyCode,
): { bid?: number; ask?: number } {
  if (currency === "USD") return { bid: metal.usdBid, ask: metal.usdAsk };
  if (currency === "NPR") return { bid: metal.bid, ask: metal.ask };
  // Other display currencies: convert the USD order book.
  return {
    bid:
      metal.usdBid != null
        ? convertCurrency(metal.usdBid, currency)
        : undefined,
    ask:
      metal.usdAsk != null
        ? convertCurrency(metal.usdAsk, currency)
        : undefined,
  };
}

/**
 * Formatted bid/ask spread like "रू386.69 (0.06%)", or null when the
 * source has no order book for the metal (BTC/ETH/HG).
 */
export function formatSpread(
  bid: number | undefined,
  ask: number | undefined,
  currency: CurrencyCode = "NPR",
): string | null {
  if (bid == null || ask == null || bid <= 0 || ask <= 0) return null;
  const spread = ask - bid;
  const mid = (bid + ask) / 2;
  const pct = (spread / mid) * 100;
  return `${formatPrice(spread, currency)} (${pct.toFixed(2)}%)`;
}

export function formatChange(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}`;
}

export function formatChangePercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}
