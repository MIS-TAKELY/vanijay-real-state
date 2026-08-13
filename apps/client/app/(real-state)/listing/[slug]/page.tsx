import { Badge, Button, Icon } from "@repo/ui";
import { AddToCartButton } from "components/real-state/common/AddToCartButton";
import { CallSellerButton } from "components/real-state/common/CallSellerButton";
import { SaveToFavoritesButton } from "components/real-state/common/SaveToFavoritesButton";
import { PropertyViewTracker } from "components/real-state/common/PropertyViewTracker";
import { SimilarProperties } from "components/real-state/pages/home/SimilarProperties";
import { ListingGallery } from "components/real-state/pages/listing/ListingGallery";
import { ListingLinks } from "components/real-state/pages/listing/ListingLinks";
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
      "Status",
      labelEnum(property.status, {
        DRAFT: "Draft",
        UNDER_VERIFICATION: "Under Verification",
        LIVE: "Live",
        SOLD: "Sold",
        ARCHIVED: "Archived",
        REJECTED: "Rejected",
      }),
    ],
    [
      "Verification",
      labelEnum(property.verificationLevel, VERIFICATION_LABELS),
    ],
  ];

  const locationSpecs: Array<[string, string | null | undefined]> = property.location
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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
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
        <header className="mb-6">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {labelEnum(property.propertyType, TYPE_LABELS)}
            </Badge>
            {verified && (
              <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
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
          <h1 className="font-headline-md text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">
            {property.title}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-on-surface-variant">
            <Icon name="location_on" className="text-[16px]" />
            {location}
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <ListingGallery
              images={images}
              title={property.title}
              fallbackGradient={gradient}
            />

            {/* Description */}
            {property.description && (
              <section className="mt-8">
                <h2 className="mb-3 text-lg font-semibold text-on-surface">
                  Description
                </h2>
                <p className="whitespace-pre-line leading-7 text-on-surface-variant">
                  {property.description}
                </p>
              </section>
            )}

            {/* Specifications */}
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-semibold text-on-surface">
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
              <section className="mt-8">
                <h2 className="mb-3 text-lg font-semibold text-on-surface">
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

            <ListingLinks
              location={property.location}
              videos={videos}
              cadastralMaps={cadastralMaps}
            />
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

              {(images.length > 0 || videos.length > 0 || cadastralMaps.length > 0) && (
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-on-surface-variant">
                  {images.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-surface-container px-2 py-1">
                      <Icon name="photo_camera" className="text-[14px]" />
                      {images.length} photo{images.length === 1 ? "" : "s"}
                    </span>
                  )}
                  {videos.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-surface-container px-2 py-1">
                      <Icon name="videocam" className="text-[14px]" />
                      {videos.length} video{videos.length === 1 ? "" : "s"}
                    </span>
                  )}
                  {cadastralMaps.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-surface-container px-2 py-1">
                      <Icon name="map" className="text-[14px]" />
                      Naksa
                    </span>
                  )}
                </div>
              )}

              <Button asChild className="mt-5 w-full rounded-md font-semibold">
                <Link href={`/inquiries?property=${property.slug}`}>
                  <Icon name="chat" className="text-[18px]" />
                  Send Inquiry
                </Link>
              </Button>
              <CallSellerButton
                propertyId={property.id}
                className="mt-2 w-full rounded-md border-outline-variant font-semibold"
              />
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

        {/* Similar Properties Section */}
        <SimilarProperties propertyId={property.id} />
      </main>
    </>
  );
}
