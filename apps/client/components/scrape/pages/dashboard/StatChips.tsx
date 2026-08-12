import { Activity, Clock3, Database, FlaskConical, Layers } from "lucide-react";
import { formatPrice } from "lib/scrape/hamrobazaar";
import type { ScrapeResult } from "lib/scrape/hamrobazaar";

function computeStats(items: { price: number }[]) {
  if (items.length === 0) {
    return { avg: 0, min: 0, max: 0 };
  }
  const prices = items.map((i) => i.price);
  return {
    avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

export function StatChips({ result }: { result: ScrapeResult }) {
  const { avg, min, max } = computeStats(result.items);

  const chips = [
    {
      icon: Layers,
      label: "Fetched",
      value: `${result.items.length}`,
      sub: `${result.totalRecords.toLocaleString()} total in category`,
    },
    {
      icon: Activity,
      label: "Avg. price",
      value: formatPrice(avg),
      sub: `min ${formatPrice(min)} · max ${formatPrice(max)}`,
    },
    {
      icon: Database,
      label: "Data source",
      value: result.usedFallback ? "Sample" : "Live",
      sub: result.usedFallback
        ? "target unreachable — fallback dataset"
        : "hamrobazaar.com API",
    },
    {
      icon: Clock3,
      label: "Duration",
      value: `${result.durationMs} ms`,
      sub: new Date(result.fetchedAt).toLocaleTimeString(),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-scrape-border bg-scrape-border lg:grid-cols-4">
      {chips.map((chip) => {
        const Icon = chip.icon;
        const live =
          chip.label === "Data source" && !result.usedFallback;
        const sample =
          chip.label === "Data source" && result.usedFallback;
        return (
          <div
            key={chip.label}
            className="flex items-start gap-3 bg-scrape-surface px-4 py-4 transition-colors hover:bg-scrape-surface-2"
          >
            <span
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-scrape-border bg-scrape-surface-2 ${
                live
                  ? "text-scrape-success"
                  : sample
                    ? "text-scrape-warning"
                    : "text-scrape-primary"
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <p className="font-scrape-mono text-[11px] uppercase tracking-wider text-scrape-muted">
                {chip.label}
              </p>
              <p
                className={`mt-0.5 truncate font-scrape-mono text-lg ${
                  live
                    ? "text-scrape-success"
                    : sample
                      ? "text-scrape-warning"
                      : "text-scrape-on-bg"
                }`}
              >
                {chip.value}
              </p>
              <p className="truncate text-[11px] text-scrape-muted">
                {chip.sub}
              </p>
            </div>
          </div>
        );
      })}
      {result.usedFallback && (
        <div className="col-span-full flex items-center gap-2 bg-scrape-warning/10 px-4 py-2.5">
          <FlaskConical className="h-3.5 w-3.5 shrink-0 text-scrape-warning" />
          <p className="text-xs text-scrape-warning">
            Live fetch failed ({result.error ?? "unknown error"}) — showing the
            sample dataset so the pipeline stays demonstrable. Retry or adjust
            filters below.
          </p>
        </div>
      )}
    </div>
  );
}
