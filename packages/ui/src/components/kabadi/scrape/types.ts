export interface ScrapeCategorySummary {
  id: string;
  slug: string;
  name: string;
  nepali?: string | null;
  icon?: string | null;
  blurb?: string | null;
  items?: ScrapeItemSummary[];
}

export interface ScrapeItemSummary {
  id: string;
  name: string;
  nepali?: string | null;
  category: string; // slug
  unit: "kg" | "piece";
  rate: number;
  note?: string | null;
  popular?: boolean;
}

export interface HowItWorksStep {
  step: string;
  title: string;
  detail: string;
  icon: string; // lucide icon name
}

export interface TrustBadge {
  label: string;
  icon: string; // lucide icon name
}

export interface CTAContent {
  heading: string;
  headingHighlight: string;
  description: string;
  primaryButtonText: string;
  primaryButtonHref: string;
  secondaryButtonText: string;
  secondaryButtonHref: string;
  phone: string;
}

// Editable callback types
export type OnSectionFieldChange = (
  section: string,
  field: string,
  value: unknown,
) => void;
export type OnItemFieldChange = (
  itemId: string,
  field: string,
  value: unknown,
) => void;
