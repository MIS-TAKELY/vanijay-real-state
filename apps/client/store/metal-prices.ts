import { create } from "zustand";
import type {
  CurrencyCode,
  MetalData,
  MetalId,
  WeightUnit,
} from "constants/gold/metals";
import { METALS_DATA } from "constants/gold/metals";

interface MetalPricesState {
  metals: MetalData[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  selectedMetal: MetalId;
  currency: CurrencyCode;
  unit: WeightUnit;
  setMetals: (metals: MetalData[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastUpdated: (date: Date | null) => void;
  setSelectedMetal: (id: MetalId) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setUnit: (unit: WeightUnit) => void;
  getMetal: (id: MetalId) => MetalData | undefined;
}

export const useMetalPricesStore = create<MetalPricesState>((set, get) => ({
  metals: METALS_DATA,
  loading: true,
  error: null,
  lastUpdated: null,
  selectedMetal: "gold",
  currency: "NPR",
  unit: "oz",
  setMetals: (metals) => set({ metals }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setLastUpdated: (lastUpdated) => set({ lastUpdated }),
  setSelectedMetal: (selectedMetal) => set({ selectedMetal }),
  setCurrency: (currency) => set({ currency }),
  setUnit: (unit) => set({ unit }),
  getMetal: (id) => get().metals.find((m) => m.id === id),
}));
