"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "../../../common/dashboard/EmptyState";
import {
  LISTING_FILTER_TABS,
  MY_LISTINGS,
  type ListingFilter,
} from "./constants";
import { ListingsBulkBar } from "./ListingsBulkBar";
import { ListingsFilterTabs } from "./ListingsFilterTabs";
import { ListingsTable } from "./ListingsTable";

export function MyListings() {
  const [active, setActive] = useState<ListingFilter>("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const counts = useMemo(() => {
    const next = {} as Record<ListingFilter, number>;
    for (const tab of LISTING_FILTER_TABS) {
      next[tab.key] =
        tab.key === "ALL"
          ? MY_LISTINGS.length
          : MY_LISTINGS.filter((l) => l.status === tab.key).length;
    }
    return next;
  }, []);

  const filtered = useMemo(
    () =>
      active === "ALL"
        ? MY_LISTINGS
        : MY_LISTINGS.filter((l) => l.status === active),
    [active],
  );

  const toggleRow = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelectedIds((prev) => {
      const allSelected = filtered.every((l) => prev.has(l.id));
      if (allSelected) {
        const next = new Set(prev);
        filtered.forEach((l) => next.delete(l.id));
        return next;
      }
      const next = new Set(prev);
      filtered.forEach((l) => next.add(l.id));
      return next;
    });

  const clearSelection = () => setSelectedIds(new Set());
  // Placeholder handlers — wire to mutations when the API is ready.
  const handleArchive = () => clearSelection();
  const handleReverify = () => clearSelection();

  if (MY_LISTINGS.length === 0) {
    return (
      <EmptyState
        icon="list_alt"
        title="Your archive is empty"
        description="List your first verified property to start building your archive."
        action={
          <a
            href="/dashboard/listings/new"
            className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary/90 transition-colors"
          >
            List your first property
          </a>
        }
      />
    );
  }

  return (
    <div className="flex flex-col">
      <ListingsFilterTabs
        active={active}
        counts={counts}
        onChange={setActive}
      />

      <ListingsBulkBar
        selectedCount={selectedIds.size}
        onArchive={handleArchive}
        onReverify={handleReverify}
        onClear={clearSelection}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon="filter_list_off"
          title="No listings match this filter"
          description="Try a different status tab to see your listings."
        />
      ) : (
        <ListingsTable
          listings={filtered}
          selectedIds={selectedIds}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
        />
      )}
    </div>
  );
}
