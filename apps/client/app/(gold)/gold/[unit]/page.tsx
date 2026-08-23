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
  if (!isValidUnitRateCombo("gold", unit)) {
    return { title: "Not found | Malpoth", robots: { index: false } };
  }
  const label = UNIT_LABELS[unit] ?? unit;
  const title = `Gold Price per ${label} Today — Live NPR Rate & Tola Conversion | Malpoth`;
  const description = `Live gold price per ${label.toLowerCase()} in NPR. Spot-derived rates, the official Nepali market tola rate, and exact conversions across tola, anna, sukhi, gram, kilo and troy ounce.`;
  return {
    title,
    description,
    keywords: [
      `gold price per ${label.toLowerCase()}`,
      `1 ${label.toLowerCase()} gold price`,
      "gold rate Nepal today",
      "gold price NPR",
      "tola gold rate",
    ],
    alternates: { canonical: `/gold/${unit}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/gold/${unit}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function GoldUnitPage({ params }: PageProps) {
  const { unit } = await params;
  if (!isValidUnitRateCombo("gold", unit)) notFound();
  const todayRates = await getTodayRates();
  return (
    <UnitRateTemplate
      metalId="gold"
      unitId={unit}
      todayRate={todayRates?.gold ?? null}
    />
  );
}
