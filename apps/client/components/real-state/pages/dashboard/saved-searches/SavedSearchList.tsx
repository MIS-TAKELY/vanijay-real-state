"use client";

import { Button, toast } from "@repo/ui";
import { EmptyState } from "components/real-state/layout/dashboard/EmptyState";
import { ApiError } from "lib/api/core/client";
import {
  createSavedSearch,
  deleteSavedSearch,
  updateSavedSearch,
} from "lib/api/services/saved-searches";
import type {
  AlertFrequency,
  SavedSearchItem,
} from "lib/api/services/saved-searches/types";
import Link from "next/link";
import { useState } from "react";
import { SavedSearchCard } from "./SavedSearchCard";

interface SavedSearchListProps {
  initialItems: SavedSearchItem[];
}

export function SavedSearchList({ initialItems }: SavedSearchListProps) {
  const [items, setItems] = useState<SavedSearchItem[]>(initialItems);
  const [busyId, setBusyId] = useState<string | null>(null);

  const withBusy = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    try {
      await action();
    } finally {
      setBusyId(null);
    }
  };

  const handleFrequencyChange = (
    id: string,
    alertFrequency: AlertFrequency,
  ) => {
    const previous = items.find((item) => item.id === id);
    if (!previous) return;
    void withBusy(id, async () => {
      // Optimistic update; roll back just this row on failure.
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, alertFrequency } : item,
        ),
      );
      try {
        await updateSavedSearch(id, { alertFrequency });
      } catch (error) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, alertFrequency: previous.alertFrequency }
              : item,
          ),
        );
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Could not update alert frequency",
        );
      }
    });
  };

  const handleRename = (id: string, label: string) => {
    void withBusy(id, async () => {
      try {
        const updated = await updateSavedSearch(id, { label });
        setItems((prev) =>
          prev.map((item) => (item.id === id ? updated : item)),
        );
        toast.success("Search renamed");
      } catch (error) {
        toast.error(
          error instanceof ApiError ? error.message : "Could not rename search",
        );
      }
    });
  };

  const handleDuplicate = (id: string) => {
    const source = items.find((item) => item.id === id);
    if (!source) return;
    void withBusy(id, async () => {
      try {
        const copy = await createSavedSearch({
          label: `${source.label} (copy)`,
          filters: source.filters,
          alertFrequency: source.alertFrequency,
        });
        setItems((prev) => [copy, ...prev]);
        toast.success("Search duplicated");
      } catch (error) {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Could not duplicate search",
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    void withBusy(id, async () => {
      try {
        await deleteSavedSearch(id);
        setItems((prev) => prev.filter((item) => item.id !== id));
        toast.success("Search deleted");
      } catch (error) {
        toast.error(
          error instanceof ApiError ? error.message : "Could not delete search",
        );
      }
    });
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon="bookmark"
        title="No saved searches yet"
        description="Save a search from the listings page to get alerts when new matching properties are verified."
        action={
          <Button
            asChild
            className="rounded-md bg-gold font-semibold text-on-gold hover:bg-gold/90"
          >
            <Link href="/search">Search properties</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-md">
      {items.map((search) => (
        <SavedSearchCard
          key={search.id}
          search={search}
          busy={busyId === search.id}
          onFrequencyChange={(freq) =>
            handleFrequencyChange(search.id, freq)
          }
          onRename={(label) => handleRename(search.id, label)}
          onDuplicate={() => handleDuplicate(search.id)}
          onDelete={() => handleDelete(search.id)}
        />
      ))}
    </div>
  );
}
