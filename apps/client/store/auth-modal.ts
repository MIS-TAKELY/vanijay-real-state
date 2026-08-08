"use client";

import { create } from "zustand";

interface AuthModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  redirect: string | null;
  setRedirect: (path: string | null) => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, redirect: null }),
  redirect: null,
  setRedirect: (redirect) => set({ redirect }),
}));
