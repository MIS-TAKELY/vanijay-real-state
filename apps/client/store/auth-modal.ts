"use client";

import { create } from "zustand";

interface AuthModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  redirect: string | null;
  setRedirect: (path: string | null) => void;
  // Error carried over from a redirect (e.g. rejected Google sign-in) so the
  // modal can show it once it opens.
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, redirect: null, error: null }),
  redirect: null,
  setRedirect: (redirect) => set({ redirect }),
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
