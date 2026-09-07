import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  UNIT_RATE_UNITS,
  UnitRateTemplate,
  isValidUnitRateCombo,
} from "../../../../components/gold/UnitRateTemplate";
import { getTodayRates } from "lib/fenegosida";

export const revalidate = 300; // match the Fenegosida rate cadence

type PageProps = { params: Promise<{ unit: string }> };

export function generateStaticParams() {
  return UNIT_RATE_UNITS.map((u) => ({ unit: u.id }));
}

const UNIT_LABELS = Object.fromEntries(
  UNIT_RATE_UNITS.map((u) => [u.id, u.label]),
);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { unit } = await params;
  if (!isValidUnitRateCombo("silver", unit)) {
    return { title: "Not found", robots: { index: false } };
  }
  const label = UNIT_LABELS[unit] ?? unit;
  const title = `Silver Price per ${label} Today — Live NPR Rate`;
  const description = `Live silver price per ${label.toLowerCase()} in NPR. Spot-derived rates, the official Nepali market tola rate, and exact conversions across tola, anna, sukhi, gram, kilo and troy ounce.`;
  return {
    title,
    description,
    keywords: [
      `silver price per ${label.toLowerCase()}`,
      `1 ${label.toLowerCase()} silver price`,
      "silver rate Nepal today",
      "silver price NPR",
      "tola silver rate",
    ],
    alternates: { canonical: `/silver/${unit}` },
    openGraph: {
      title,
      description,
      images: [{ url: "/og-home.png", width: 1200, height: 630, alt: title }],
      type: "website",
      url: `/silver/${unit}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-home.png"],
    },
    robots: { index: true, follow: true },
  };
}

export default async function SilverUnitPage({ params }: PageProps) {
  const { unit } = await params;
  if (!isValidUnitRateCombo("silver", unit)) notFound();
  const todayRates = await getTodayRates();
  return (
    <UnitRateTemplate
      metalId="silver"
      unitId={unit}
      todayRate={todayRates?.silver ?? null}
    />
  );
}
