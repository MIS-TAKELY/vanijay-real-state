/** Shared formatting + theme helpers for the chart components. */

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/** NPR amounts in lakh/crore style, e.g. रू 1.2 Cr. */
export function formatNpr(n: number): string {
  if (n === 0) return "रू 0";
  return `रू ${new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n)}`;
}

/** "2025-06" → "Jun 25" */
export function formatMonth(month: string): string {
  const y = Number(month.slice(0, 4));
  const m = Number(month.slice(5, 7));
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

/** "2025-06-14" → "Jun 14" */
export function formatTickDate(value: string): string {
  const y = Number(value.slice(0, 4));
  const m = Number(value.slice(5, 7));
  const d = Number(value.slice(8, 10));
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Theme constants shared by all charts. */
export const CHART_THEME = {
  grid: "oklch(0.882 0.012 85)",
  tick: "oklch(0.476 0.016 85)",
  palette: [
    "#3456bd", // primary blue — views / listings
    "oklch(0.404 0.048 155)", // green — favorites / users
    "oklch(0.452 0.164 25)", // vermillion — inquiries / phone clicks
    "oklch(0.55 0.19 325)", // purple — searches / cart
    "oklch(0.60 0.12 205)", // teal — shares / appointments
    "oklch(0.50 0.14 280)", // indigo — answers
    "oklch(0.66 0.14 145)", // emerald — questions
  ],
} as const;
