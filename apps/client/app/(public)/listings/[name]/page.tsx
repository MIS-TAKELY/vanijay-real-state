import { Badge, Button, Icon } from "@repo/ui";
import { AddToCartButton } from "components/common/AddToCartButton";
import { SaveToFavoritesButton } from "components/common/SaveToFavoritesButton";
import { ApiError } from "lib/api/core/client";
import { fetchPropertyByGraphql } from "lib/api/services/properties";
import {
  FALLBACK_GRADIENT,
  formatLandArea,
  formatLocation,
  formatNPR,
  labelEnum,
  TYPE_GRADIENTS,
  TYPE_LABELS,
  VERIFICATION_LABELS,
  type ApiProperty,
} from "lib/api/services/properties/types";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ name: string }> };

async function loadProperty(name: string): Promise<ApiProperty> {
  try {
    return await fetchPropertyByGraphql(name);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { name } = await params;
  try {
    const property = await fetchPropertyByGraphql(name);
    return {
      title: `${property.title} | Lekhaprati`,
      description:
        property.description ??
        `${labelEnum(property.propertyType, TYPE_LABELS)} for sale in ${formatLocation(property.location)}.`,
      openGraph: {
        title: property.title,
        description:
          property.description ??
          `${formatNPR(property.askingPrice)} — ${formatLocation(property.location)}`,
        images: property.media?.[0]?.url ? [property.media[0].url] : undefined,
        type: "website",
      },
    };
  } catch {
    return { title: "Listing not found | Lekhaprati" };
  }
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-outline-variant py-2.5 text-sm last:border-b-0">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-medium text-on-surface">{value}</span>
    </div>
  );
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { name } = await params;
  const property = await loadProperty(name);

  const cover = property.media?.find((m) => m.isCover) ?? property.media?.[0];
  const gallery = (property.media ?? []).filter((m) => m !== cover);
  const gradient = TYPE_GRADIENTS[property.propertyType] ?? FALLBACK_GRADIENT;
  const area = formatLandArea(property.landArea);
  const location = formatLocation(property.location);
  const verified = property.verificationLevel !== "UNVERIFIED";

  const specs: Array<[string, string | null | undefined]> = [
    ["Land Area", area],
    [
      "Total Area",
      property.landArea
        ? `${new Intl.NumberFormat("en-US").format(property.landArea.totalSqFt)} sq ft`
        : null,
    ],
    ["Property Type", labelEnum(property.propertyType, TYPE_LABELS)],
    [
      "Road Access",
      [
        property.roadAccessWidthFt ? `${property.roadAccessWidthFt} ft` : null,
        property.roadType ? labelEnum(property.roadType, {}) : null,
      ]
        .filter(Boolean)
        .join(" · ") || null,
    ],
    ["Facing", property.facing ? labelEnum(property.facing, {}) : null],
    ["Corner Plot", property.isCornerPlot ? "Yes" : null],
    [
      "Price per Aana",
      property.pricePerAana ? formatNPR(property.pricePerAana) : null,
    ],
  ];

  return (
    <main className="mx-auto max-w-[1280px] px-6 pb-16 pt-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-4 text-xs text-on-surface-variant"
      >
        <Link href="/listings" className="hover:text-on-surface">
          Listings
        </Link>
        {property.location && (
          <>
            <span className="mx-2">›</span>
            <span>{property.location.district}</span>
            {property.location.areaName && (
              <>
                <span className="mx-2">›</span>
                <span className="text-on-surface">
                  {property.location.areaName}
                </span>
              </>
            )}
          </>
        )}
      </nav>

      {/* Hero */}
      <section className="relative h-72 overflow-hidden rounded-2xl sm:h-96">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- external upload URL; see PropertyCard
          <img
            src={cover.url}
            alt={cover.altText ?? property.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={`h-full w-full bg-gradient-to-br ${gradient}`}
            aria-hidden
          />
        )}
        <div className="absolute left-4 top-4 flex gap-2">
          <Badge className="bg-surface/95 text-tertiary shadow-sm">
            {verified ? (
              <>
                <Icon name="verified" filled className="mr-1 text-[14px]" />
                {labelEnum(property.verificationLevel, VERIFICATION_LABELS)}
              </>
            ) : (
              "Unverified"
            )}
          </Badge>
          <Badge variant="outline" className="bg-surface/95">
            {labelEnum(property.propertyType, TYPE_LABELS)}
          </Badge>
        </div>
      </section>

      {gallery.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {gallery.slice(0, 4).map((m) => (
            // eslint-disable-next-line @next/next/no-img-element -- external upload URL
            <img
              key={m.url}
              src={m.url}
              alt={m.altText ?? property.title}
              className="h-24 w-full rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          <h1 className="font-headline-md text-2xl font-medium text-on-surface sm:text-3xl">
            {property.title}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-on-surface-variant">
            <Icon name="location_on" className="text-[16px]" />
            {location}
            {property.location?.municipality &&
              ` · ${property.location.municipality}, Ward ${property.location.wardNumber}`}
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Listing ID: {property.listingCode}
          </p>

          {property.description && (
            <section className="mt-6">
              <h2 className="mb-2 text-lg font-semibold text-on-surface">
                About this property
              </h2>
              <p className="whitespace-pre-line text-[15px] leading-7 text-on-surface-variant">
                {property.description}
              </p>
            </section>
          )}

          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-on-surface">
              Specifications
            </h2>
            <div className="rounded-xl border border-outline-variant bg-surface px-4 py-2">
              {specs
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <SpecRow key={label} label={label} value={value as string} />
                ))}
            </div>
          </section>

          {property.location?.latitude != null &&
            property.location?.longitude != null && (
              <section className="mt-8">
                <h2 className="mb-3 text-lg font-semibold text-on-surface">
                  Location
                </h2>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${property.location.latitude}&mlon=${property.location.longitude}#map=16/${property.location.latitude}/${property.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <Icon name="map" className="text-[18px]" />
                  View coordinates on OpenStreetMap
                </a>
              </section>
            )}
        </div>

        {/* Price card */}
        <aside>
          <div className="sticky top-24 rounded-2xl border border-outline-variant bg-surface p-6">
            <p className="mono-stat text-2xl font-semibold text-primary">
              {formatNPR(property.askingPrice)}
            </p>
            {property.pricePerAana && (
              <p className="mt-0.5 text-sm text-on-surface-variant">
                {formatNPR(property.pricePerAana)} per Aana
              </p>
            )}

            <Button asChild className="mt-5 w-full rounded-md font-semibold">
              <Link href={`/inquiries?property=${property.slug}`}>
                <Icon name="chat" className="text-[18px]" />
                Send Inquiry
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="mt-2 w-full rounded-md border-outline-variant font-semibold"
            >
              <Link href="/appointments">
                <Icon name="event" className="text-[18px]" />
                Request Site Visit
              </Link>
            </Button>
            <AddToCartButton
              propertyId={property.id}
              title={property.title}
              variant="outline"
              className="mt-2 w-full rounded-md border-outline-variant font-semibold"
            />
            <SaveToFavoritesButton
              propertyId={property.id}
              variant="ghost"
              className="mt-2 w-full rounded-md font-semibold"
            />

            {!verified && (
              <p className="mt-4 rounded-md bg-surface-container p-3 text-xs leading-5 text-on-surface-variant">
                This listing has not completed verification yet. Independently
                confirm ownership documents (Lalpurja) before any payment.
              </p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
