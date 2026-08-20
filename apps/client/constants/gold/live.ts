/** Single live quote returned by GET /api/gold/live. */
export interface GoldLiveQuote {
  symbol: string;
  name: string;
  /** Price in NPR. */
  price: number;
  /** Price in USD. */
  usdPrice: number;
  /** Bid in NPR (null when the upstream source has no order book). */
  bid: number | null;
  /** Ask in NPR. */
  ask: number | null;
  /** Bid in USD. */
  usdBid: number | null;
  /** Ask in USD. */
  usdAsk: number | null;
  currency: "NPR";
}

export interface GoldLiveResponse {
  ok?: boolean;
  date?: string | null;
  unit?: string;
  usdToNpr?: number;
  quotes?: GoldLiveQuote[];
  error?: string;
}

/** Timeframe ranges supported by GET /api/gold/history. */
export type HistoryRange = "1M" | "3M" | "6M" | "1Y" | "5Y" | "MAX";

export const HISTORY_RANGES: HistoryRange[] = [
  "1M",
  "3M",
  "6M",
  "1Y",
  "5Y",
  "MAX",
];

/** One daily price point (USD upstream; converted client-side). */
export interface HistoryPoint {
  /** Business day as "yyyy-mm-dd" (lightweight-charts time format). */
  time: string;
  /** Aggregated price in USD for that day. */
  price: number;
}

export interface GoldHistoryResponse {
  ok: boolean;
  symbol?: string;
  range?: HistoryRange;
  /** Upstream prices are always USD. */
  currency?: "USD";
  points?: HistoryPoint[];
  error?: string;
}
