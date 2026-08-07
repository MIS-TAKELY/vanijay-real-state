"use client";

import { useMemo, useState } from "react";
import { Button, Icon } from "@repo/ui";
import { cn } from "@repo/ui";
import {
  LISTINGS,
  LISTING_STATUS_FILTERS,
  type ListingStatus,
} from "constants/operations";
import { VerificationQueueTable } from "components/VerificationQueueTable";

export default function ListingsPage() {
  const [filter, setFilter] = useState<ListingStatus | null>(null);

  const rows = useMemo(() => {
    if (!filter) return LISTINGS;
    return LISTINGS.filter((r) => r.status === filter);
  }, [filter]);

  return (
    <>
      <header className="flex flex-col gap-xs">
        <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
          Listings
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {rows.length} listings — {filter ? filter.replaceAll("_", " ").toLowerCase() : "all statuses"}.
        </p>
      </header>

      <section className="mt-lg">
        <div className="mb-md flex flex-wrap items-center gap-xs">
          <div className="flex items-center gap-xs">
            {LISTING_STATUS_FILTERS.map((f) => {
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() =>
                    setFilter(active ? null : f.value)
                  }
                  className={cn(
                    "font-label-sm mono-stat text-[11px] font-bold uppercase tracking-widest rounded-full px-3 py-1.5 transition-colors",
                    active
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-xs">
            <Button
              variant="outline"
              size="sm"
              className="border-outline-variant"
            >
              <Icon name="filter_list" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="border-outline-variant">
              <Icon name="sort" /> Sort
            </Button>
          </div>
        </div>

        <div className="admin-surface border border-outline-variant rounded-xl p-md">
          <VerificationQueueTable rows={rows} />
        </div>
      </section>
    </>
  );
}
