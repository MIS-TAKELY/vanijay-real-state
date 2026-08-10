"use client";

import { fetchCartCount } from "lib/api/services/cart";
import { create } from "zustand";

interface CartState {
  /** Sum of quantities across the user's cart (from /api/v1/cart/count). */
  count: number;
  /** Whether a count has been fetched at least once (drives navbar badge). */
  loaded: boolean;
  setCount: (count: number) => void;
  /** Refresh the count from the API. Safe to call when signed out. */
  load: () => Promise<number>;
}

export const useCartStore = create<CartState>((set) => ({
  count: 0,
  loaded: false,
  setCount: (count) => set({ count, loaded: true }),
  load: async () => {
    try {
      const { count } = await fetchCartCount();
      set({ count, loaded: true });
      return count;
    } catch {
      set({ count: 0, loaded: true });
      return 0;
    }
  },
}));