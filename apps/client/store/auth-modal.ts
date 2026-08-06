"use client";

import { create } from "zustand";

interface AuthModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  /**
   * Path to navigate to after a successful sign-in (e.g. the protected page
   * the user was bounced from via `?redirect=`). One-shot: consumed on
   * sign-in success and discarded when the modal is closed.
   */
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
