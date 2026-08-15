"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CardProperty } from "lib/api/services/properties/types";

export const MAX_COMPARE_ITEMS = 4;

interface CompareState {
  items: CardProperty[];
  add: (property: CardProperty) => boolean;
  remove: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (property) => {
        const { items } = get();
        if (items.some((i) => i.id === property.id)) return false;
        if (items.length >= MAX_COMPARE_ITEMS) return false;
        set({ items: [...items, property] });
        return true;
      },

      remove: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      clear: () => {
        set({ items: [] });
      },

      isSelected: (id) => {
        return get().items.some((i) => i.id === id);
      },
    }),
    {
      name: "compare-items",
    },
  ),
);
