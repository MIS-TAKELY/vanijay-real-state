import { Icon } from "@repo/ui";
import Link from "next/link";
import { savedSearchRunHref } from "lib/saved-search-url";
import type {
  AlertFrequency,
  SavedSearchItem,
} from "lib/api/services/saved-searches/types";
import { FrequencyToggle } from "./FrequencyToggle";
import { SavedSearchMenu } from "./SavedSearchMenu";

interface SavedSearchCardProps {
  search: SavedSearchItem;
  busy?: boolean;
  onFrequencyChange: (value: AlertFrequency) => void;
  onRename: (label: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

/** Human-readable chip label for a filter key. */
const FILTER_LABELS: Record<string, string> = {
  q: "Search",
  type: "Type",
  price: "Price",
  district: "District",
  minSize: "Min size",
  maxSize: "Max size",
};

const TYPE_LABELS: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  plot: "Plot / Land",
  house: "House",
};

const PRICE_LABELS: Record<string, string> = {
  "under-20l": "Under 20L",
  "20l-50l": "20L – 50L",
  "50l-1cr": "50L – 1Cr",
  "1cr-plus": "1Cr+",
};

function filterDisplayValue(key: string, value: string): string {
  if (key === "type") return TYPE_LABELS[value] ?? value;
  if (key === "price") return PRICE_LABELS[value] ?? value;
  return value;
}

export function SavedSearchCard({
  search,
  busy = false,
  onFrequencyChange,
  onRename,
  onDuplicate,
  onDelete,
}: SavedSearchCardProps) {
  const filters = search.filters ?? {};

  return (
    <div className="flex flex-col gap-sm rounded-2xl border border-outline-variant border-t-2 border-t-gold/40 bg-surface p-md shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:border-gold/50 hover:shadow-lg">
      <div className="flex items-start justify-between gap-sm">
        <h3 className="min-w-0 text-sm font-medium text-on-surface leading-snug">
          {search.label}
        </h3>
        <SavedSearchMenu
          label={search.label}
          busy={busy}
          onRename={onRename}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      </div>

      {/* Filter summary chips */}
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(filters).map(([key, rawValue]) => {
          if (rawValue == null || rawValue === "") return null;
          const value = String(rawValue);
          return (
            <span
              key={key}
              className="inline-flex items-center rounded-full border border-outline-variant px-2 py-0.5 text-[11px] text-on-surface-variant"
            >
              <span className="font-medium text-on-surface">
                {FILTER_LABELS[key] ?? key}:
              </span>
              <span className="ml-1">{filterDisplayValue(key, value)}</span>
            </span>
          );
        })}
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
        </div>

        <div className="flex items-center gap-sm">
          <FrequencyToggle
            value={search.alertFrequency}
            onChange={onFrequencyChange}
            disabled={busy}
          />
          <Link
            href={savedSearchRunHref(filters)}
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
