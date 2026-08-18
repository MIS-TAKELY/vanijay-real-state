"use client";

import { Button, Icon, Popover, PopoverContent, PopoverTrigger, toast } from "@repo/ui";
import { ApiError } from "lib/api/core/client";
import { createSavedSearch } from "lib/api/services/saved-searches";
import type { AlertFrequency } from "lib/api/services/saved-searches/types";
import { searchParamsToFilters } from "lib/saved-search-url";
import { useRequireAuth } from "lib/hooks/use-require-auth";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FREQUENCY_OPTIONS } from "../dashboard/saved-searches/constants";

/** All URL param keys that represent an active filter (short keys). */
const FILTER_KEYS = [
  "q",
  "type",
  "pr",
  "dist",
  "minS",
  "maxS",
  "mun",
  "ward",
  "bed",
  "bath",
  "face",
  "road",
  "cp",
  "ng",
  "cs",
  "ft",
  "sub",
  "am",
];

const SKIP_DEFAULTS: Record<string, string> = {
  type: "all",
  pr: "any",
  face: "any",
  road: "any",
  cs: "any",
  ft: "any",
  sub: "all",
};

/**
 * "Save search & alert" — persists the current `/search` filter state as a
 * `SavedSearch` with the chosen alert frequency. Guests are sent through the
 * sign-in modal first.
 */
export function SaveSearchButton() {
  const searchParams = useSearchParams();
  const { requireAuth } = useRequireAuth();
  const [frequency, setFrequency] = useState<AlertFrequency>("INSTANT");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const hasActiveFilters = FILTER_KEYS.some((key) => {
    const value = searchParams.get(key);
    if (!value) return false;
    const skipDefault = SKIP_DEFAULTS[key];
    if (skipDefault && value === skipDefault) return false;
    return true;
  });

  const save = async () => {
    if (!requireAuth()) return;
    setSaving(true);
    try {
      await createSavedSearch({
        filters: searchParamsToFilters(searchParams),
        alertFrequency: frequency,
      });
      setOpen(false);
      toast.success("Search saved — we'll alert you on new matches");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not save this search",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!hasActiveFilters) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-9 shrink-0 rounded-md px-3 text-xs font-semibold text-gold-deep hover:bg-gold/10 hover:text-gold-deep"
        >
          <Icon name="alarm" className="text-[16px]" />
          Save search
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <div className="flex flex-col gap-sm">
          <p className="font-label-sm text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Alert me when new properties match
          </p>
          <div className="grid grid-cols-3 gap-1 rounded-full border border-outline-variant bg-surface p-0.5">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFrequency(opt.key)}
                aria-pressed={frequency === opt.key}
                className={`rounded-full px-2 py-1.5 text-[12px] font-medium transition-colors ${
                  frequency === opt.key
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="w-full rounded-md bg-gold font-semibold text-on-gold hover:bg-gold/90"
          >
            {saving ? "Saving…" : "Save search"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
