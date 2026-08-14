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
