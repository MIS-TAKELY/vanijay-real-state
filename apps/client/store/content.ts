"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  heroSlides as defaultHeroSlides,
  categories as defaultCategories,
  type HeroSlide,
  type Category,
} from "constants/varibles-constants";
import {
  CONTENT_BLOCKS as defaultContentBlocks,
  type ContentBlock,
} from "constants/gold/content-blocks";

/**
 * Bump this whenever the default content in code changes. Persisted
 * overrides that were written under an older version are re-seeded from
 * the new defaults instead of silently shipping stale copy.
 */
export const CONTENT_VERSION = 2;

export type ContentSection = "hero" | "categories" | "contentBlocks";

export interface ContentState {
  version: number;
  // Real-state home — hero banner
  heroEnabled: boolean;
  heroSlides: HeroSlide[];
  // Real-state home — category strip
  categoriesEnabled: boolean;
  categories: Category[];
  // Gold / metals pages — content blocks
  contentBlocks: ContentBlock[];

  setHeroEnabled: (enabled: boolean) => void;
  setHeroSlides: (slides: HeroSlide[]) => void;
  setCategoriesEnabled: (enabled: boolean) => void;
  setCategories: (categories: Category[]) => void;
  setContentBlocks: (blocks: ContentBlock[]) => void;
  updateContentBlock: (id: string, patch: Partial<ContentBlock>) => void;
  resetSection: (section: ContentSection) => void;
  resetAll: () => void;
}

export const defaultContentState = {
  version: CONTENT_VERSION,
  heroEnabled: true,
  heroSlides: defaultHeroSlides,
  categoriesEnabled: true,
  categories: defaultCategories,
  contentBlocks: defaultContentBlocks,
};

const blankSlide = (): HeroSlide => ({
  image: "",
  headline: "",
  subheadline: "",
  ctaPrimary: "",
  ctaSecondary: "",
});

export const useContentStore = create<ContentState>()(
  persist(
    (set) => ({
      ...defaultContentState,

      setHeroEnabled: (heroEnabled) => set({ heroEnabled }),

      setHeroSlides: (heroSlides) => set({ heroSlides }),

      setCategoriesEnabled: (categoriesEnabled) => set({ categoriesEnabled }),

      setCategories: (categories) => set({ categories }),

      setContentBlocks: (contentBlocks) => set({ contentBlocks }),

      updateContentBlock: (id, patch) =>
        set((state) => ({
          contentBlocks: state.contentBlocks.map((block) =>
            block.id === id ? { ...block, ...patch } : block,
          ),
        })),

      resetSection: (section) =>
        set(() => {
          if (section === "hero") {
            return {
              heroEnabled: defaultContentState.heroEnabled,
              heroSlides: [...defaultHeroSlides],
            };
          }
          if (section === "categories") {
            return {
              categoriesEnabled: defaultContentState.categoriesEnabled,
              categories: [...defaultCategories],
            };
          }
          return { contentBlocks: [...defaultContentBlocks] };
        }),

      resetAll: () =>
        set({
          ...defaultContentState,
          heroSlides: [...defaultHeroSlides],
          categories: [...defaultCategories],
          contentBlocks: [...defaultContentBlocks],
        }),
    }),
    {
      name: "malpoth-content",
      version: CONTENT_VERSION,
      migrate: (persistedState, version) => {
        if (version !== CONTENT_VERSION) {
          return { ...defaultContentState } as ContentState;
        }
        return persistedState as ContentState;
      },
    },
  ),
);

export { blankSlide };
