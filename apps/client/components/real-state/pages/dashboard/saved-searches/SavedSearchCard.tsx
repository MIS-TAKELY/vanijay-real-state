import { Icon } from "@repo/ui";
import Link from "next/link";
import type { SavedSearch } from "./constants";
import { FrequencyToggle } from "./FrequencyToggle";
import { SavedSearchMenu } from "./SavedSearchMenu";

interface SavedSearchCardProps {
  search: SavedSearch;
}

export function SavedSearchCard({ search }: SavedSearchCardProps) {
  const hasNew = search.newMatches > 0;

  return (
    <div className="flex flex-col gap-sm rounded-2xl border border-outline-variant border-t-2 border-t-gold/40 bg-surface p-md shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:border-gold/50 hover:shadow-lg">
      <div className="flex items-start justify-between gap-sm">
        <div className="flex min-w-0 items-start gap-1.5">
          {hasNew ? (
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold ring-4 ring-gold/15"
              aria-label={`${search.newMatches} new matches`}
            />
          ) : null}
          <h3 className="text-sm font-medium text-on-surface leading-snug">
            {search.label}
          </h3>
        </div>
        <SavedSearchMenu />
      </div>

      {/* Filter summary chips */}
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(search.filters).map(([key, value]) => (
          <span
            key={key}
            className="inline-flex items-center rounded-full border border-outline-variant px-2 py-0.5 text-[11px] text-on-surface-variant"
          >
            <span className="font-medium text-on-surface">{key}:</span>
            <span className="ml-1">{value}</span>
          </span>
        ))}
      </div>

      {/* Footer row: match count + frequency + run now */}
      <div className="flex flex-wrap items-center justify-between gap-sm border-t border-outline-variant pt-sm">
        <div className="flex items-center gap-sm">
          <div className="flex flex-col">
            <span className="mono-stat text-lg font-bold text-gold-deep leading-none">
              {search.matchCount}
            </span>
            <span className="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant">
              matches
            </span>
          </div>
          {hasNew ? (
            <span className="mono-stat inline-flex items-center rounded-full bg-gold px-1.5 py-0.5 text-[11px] font-bold text-on-gold leading-none">
              +{search.newMatches} new
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-sm">
          <FrequencyToggle value={search.alertFrequency} />
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-label-sm font-medium text-on-surface-variant hover:text-gold-deep hover:bg-surface-container transition-colors"
          >
            <Icon name="play_arrow" className="text-data-table" />
            Run now
          </Link>
        </div>
      </div>
    </div>
  );
}
