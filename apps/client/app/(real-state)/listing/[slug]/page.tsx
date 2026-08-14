import { Badge, Icon } from "@repo/ui";
import { PropertyViewTracker } from "components/real-state/common/PropertyViewTracker";
import { SimilarProperties } from "components/real-state/pages/home/SimilarProperties";
import { ListingDecisionCard } from "components/real-state/pages/listing/ListingDecisionCard";
import { ListingDescription } from "components/real-state/pages/listing/ListingDescription";
import { ListingGallery } from "components/real-state/pages/listing/ListingGallery";
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
  type ApiPropertyMedia,
} from "lib/api/services/properties/types";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ slug: string }> };

async function loadProperty(slug: string): Promise<ApiProperty> {
  try {
    return await fetchPropertyByGraphql(slug);
  } catch (error) {
    // The API returns GraphQL resolver errors on an HTTP 200 response (e.g. the
    // "Property … not found" message from a non-LIVE/invalid slug), so normalize
    // those to 404 and render the not-found page instead of crashing.
    if (
      error instanceof ApiError &&
      (error.status === 404 || /not found/i.test(error.message))
    ) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const property = await fetchPropertyByGraphql(slug);
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
    <div className="flex items-baseline justify-between gap-4 border-b border-outline-variant py-2.5 text-sm last:border-b-0">
      <span className="shrink-0 text-on-surface-variant">{label}</span>
      <span className="text-right font-medium text-on-surface">{value}</span>
    </div>
  );
}

function partitionMedia(media: ApiPropertyMedia[] = []) {
  const sorted = [...media].sort((a, b) => a.sortOrder - b.sortOrder);
  const images = sorted.filter((m) => !m.type || m.type === "IMAGE");
  const videos = sorted.filter((m) => m.type === "VIDEO_WALKTHROUGH");
  // Cadastral maps (Naksa) are the only documents shown on the listing page.
  const cadastralMaps = sorted.filter((m) => m.type === "CADASTRAL_MAP");
  // Anything without a recognized type still belongs in the photo gallery so
  // we never silently drop uploaded assets.
  const known = new Set(["IMAGE", "VIDEO_WALKTHROUGH", "CADASTRAL_MAP"]);
  const otherImages = sorted.filter(
    (m) => m.type && !known.has(m.type) && !images.includes(m),
  );
  return {
    images: [...images, ...otherImages],
    videos,
    cadastralMaps,
  };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const property = await loadProperty(slug);

  console.log("property-->",property)

  const { images, videos, cadastralMaps } = partitionMedia(property.media);
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
    [
      "Total Area (m²)",
      property.landArea
        ? `${new Intl.NumberFormat("en-US").format(property.landArea.totalSqMeters)} m²`
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
    ["Corner Plot", property.isCornerPlot ? "Yes" : "No"],
    [
      "Price per Aana",
      property.pricePerAana ? formatNPR(property.pricePerAana) : null,
    ],
    ["Listing Code", property.listingCode ?? null],
    [
      "Verification",
      labelEnum(property.verificationLevel, VERIFICATION_LABELS),
    ],
  ];

  const locationSpecs: Array<[string, string | null | undefined]> =
    property.location
      ? [
          ["Area", property.location.areaName],
          ["Municipality", property.location.municipality],
          ["Ward", `Ward ${property.location.wardNumber}`],
          ["District", property.location.district],
          ["Province", property.location.province],
          ["Address", property.location.addressText],
          [
            "Coordinates",
            property.location.latitude != null &&
            property.location.longitude != null
              ? `${property.location.latitude}, ${property.location.longitude}`
              : null,
          ],
        ]
      : [];

  return (
    <>
      <PropertyViewTracker propertyId={property.id} />
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-3" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-on-surface-variant">
            <li>
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/#listings" className="hover:text-primary">
                Listings
              </Link>
            </li>
            <li>/</li>
            <li className="truncate font-medium text-on-surface">
              {property.title}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-4">
          {/* Badges */}
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {labelEnum(property.propertyType, TYPE_LABELS)}
            </Badge>
            {verified && (
              <Badge
                variant="outline"
                className="gap-1 border-primary/30 text-primary"
              >
                <Icon name="verified" className="text-[14px]" />
                {labelEnum(property.verificationLevel, VERIFICATION_LABELS)}
              </Badge>
            )}
            {property.isFeatured && (
              <Badge variant="destructive">Featured</Badge>
            )}
            {property.listingCode && (
              <span className="mono-stat text-xs text-on-surface-variant">
                {property.listingCode}
              </span>
            )}
          </div>

          {/* Title + Location + Maps */}
          <div className="min-w-0">
            <h1 className="font-headline-md text-pretty text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">
              {property.title}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <p className="flex min-w-0 max-w-full items-center gap-1.5 text-sm leading-6 text-on-surface-variant">
                <Icon name="location_on" className="shrink-0 text-[16px]" />
                <span className="truncate text-pretty">{location}</span>
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <ListingGallery
              images={images}
              videos={videos}
              cadastralMaps={cadastralMaps}
              title={property.title}
              fallbackGradient={gradient}
            />

            {/* Description */}
            {property.description && (
              <ListingDescription html={property.description} />
            )}

            {/* Specifications */}
            <section className="mt-5">
              <h2 className="mb-2 text-lg font-semibold text-on-surface">
                Specifications
              </h2>
              <div className="rounded-xl border border-outline-variant bg-surface px-4 py-2">
                {specs
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <SpecRow
                      key={label}
                      label={label}
                      value={value as string}
                    />
                  ))}
              </div>
            </section>

            {/* Location details */}
            {locationSpecs.length > 0 && (
              <section className="mt-5">
                <h2 className="mb-2 text-lg font-semibold text-on-surface">
                  Location
                </h2>
                <div className="rounded-xl border border-outline-variant bg-surface px-4 py-2">
                  {locationSpecs
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <SpecRow
                        key={label}
                        label={label}
                        value={value as string}
                      />
                    ))}
                </div>
              </section>
            )}
          </div>

          {/* Decision card — price, map, docs, CTAs */}
          <aside>
            <ListingDecisionCard
              propertyId={property.id}
              slug={property.slug}
              title={property.title}
              askingPrice={formatNPR(property.askingPrice)}
              pricePerAana={
                property.pricePerAana ? formatNPR(property.pricePerAana) : null
              }
              location={property.location}
              verified={verified}
            />
          </aside>
        </div>

        {/* Similar Properties Section */}
        <SimilarProperties propertyId={property.id} />
      </main>
    </>
  );
}
