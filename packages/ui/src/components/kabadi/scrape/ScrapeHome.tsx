"use client";

import { CategoryGrid } from "./CategoryGrid";
import { Calculator } from "./Calculator";
import { RateCatalog } from "./RateCatalog";
import { HowItWorks } from "./HowItWorks";
import { CTA } from "./CTA";
import type {
  ScrapeCategorySummary,
  HowItWorksStep,
  TrustBadge,
  CTAContent,
  OnSectionFieldChange,
} from "./types";

/**
 * Shared home-page template for the Kabadi / Scrape product.
 *
 * This is the ONE place that defines the section order and outline of the
 * public `/scrape` page. Both the client app (read-only) and the admin CMS
 * (read-only + inline data editing via `editable`/`onFieldChange`) render this
 * same component, so the admin preview can never drift from the live client.
 *
 * Section order: Rates → Calculator → Categories → How it works → CTA.
 * The admin may only edit the *data* shown here (heading / copy / rates). The
 * layout and section composition are fixed — they cannot be re-arranged in the
 * CMS.
 */
export interface ScrapeHomeProps {
  /** Categories + their items (the source of all scrap rates data). */
  categories: ScrapeCategorySummary[];

  /** Stored How-It-Works content. Falls back to built-in defaults when absent. */
  howItWorks?: {
    steps?: HowItWorksStep[];
    trust?: TrustBadge[];
  };

  /** Stored CTA content. Merged over the built-in defaults. */
  cta?: Partial<CTAContent>;

  /** Turn on inline editing for the shared data fields. */
  editable?: boolean;

  /** Receives data-field edits when `editable` is true. */
  onFieldChange?: OnSectionFieldChange;
}

export function ScrapeHome({
  categories,
  howItWorks,
  cta,
  editable = false,
  onFieldChange,
}: ScrapeHomeProps) {
  const allItems = categories.flatMap((c) => c.items ?? []);

  return (
    <>
      <CategoryGrid categories={categories} />
      <Calculator items={allItems} />
      <RateCatalog categories={categories} />
      <HowItWorks
        steps={howItWorks?.steps}
        trust={howItWorks?.trust}
        editable={editable}
        onFieldChange={onFieldChange}
      />
      <CTA content={cta} editable={editable} onFieldChange={onFieldChange} />
    </>
  );
}