/**
 * Server-only fetcher for the Fenegosida daily metal rates
 * (https://api.fenegosida.org). Used exclusively for the gold/silver
 * hero "Today's Price" headline — everything else keeps the live feed.
 *
 * Never imported from client components: the fetch runs on the server
 * (ISR revalidation), so the API URL never appears in the browser.
 */

export interface FenegosidaTodayRate {
  /** Official rate per tola (NPR). */
  perTola: number;
  /** Rate per gram (NPR), derived from the 10-gram row. */
  perGram: number;
  /** Rate per 10 grams (NPR). */
  per10Gram: number;
  /** ISO date the rate was published for. */
  date: string;
}

interface FenegosidaTodayRow {
  rateType?: string;
  todayBaseRatePerGram?: number | null;
  yestardayBaseRatePerGram?: number | null;
  todayDate?: string | null;
}

const TODAY_URL = "https://api.fenegosida.org/api/website/v1/Dashboard/today";
const GOLD_KEY = "सुन";
const SILVER_KEY = "चाँदी";

const TEN_GRAM = "१० ग्राम";
const ONE_TOLA = "१ तोला";

export const REVALIDATE_SECONDS = 300;

function findRow(
  rows: FenegosidaTodayRow[],
  metalKey: string,
  unitKey: string,
): FenegosidaTodayRow | undefined {
  return rows.find(
    (r) =>
      r.rateType?.includes(metalKey) &&
      r.rateType?.includes(unitKey) &&
      typeof r.todayBaseRatePerGram === "number" &&
      r.todayBaseRatePerGram > 0,
  );
}

export async function getTodayRates(): Promise<{
  gold: FenegosidaTodayRate;
  silver: FenegosidaTodayRate;
} | null> {
  try {
    const res = await fetch(TODAY_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;

    const rows = (await res.json()) as FenegosidaTodayRow[];
    if (!Array.isArray(rows) || rows.length === 0) return null;

    const build = (metalKey: string): FenegosidaTodayRate | null => {
      const tola = findRow(rows, metalKey, ONE_TOLA);
      const tenGram = findRow(rows, metalKey, TEN_GRAM);
      if (!tola || !tenGram) return null;
      const perTola = tola.todayBaseRatePerGram as number;
      const per10Gram = tenGram.todayBaseRatePerGram as number;
      return {
        perTola,
        per10Gram,
        perGram: per10Gram / 10,
        date: tola.todayDate ?? tenGram.todayDate ?? "",
      };
    };

    const gold = build(GOLD_KEY);
    const silver = build(SILVER_KEY);
    if (!gold || !silver) return null;

    return { gold, silver };
  } catch {
    return null;
  }
}