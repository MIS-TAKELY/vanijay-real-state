import { Badge, Icon } from "@repo/ui";
import { PropertyViewTracker } from "components/real-state/common/PropertyViewTracker";
import { stripHtml } from "components/real-state/googlemap/utils";
import { SimilarProperties } from "components/real-state/pages/home/SimilarProperties";
import { ListingDecisionCard } from "components/real-state/pages/listing/ListingDecisionCard";
import { ListingDescription } from "components/real-state/pages/listing/ListingDescription";
import { ListingGallery } from "components/real-state/pages/listing/ListingGallery";
import { MobilePriceBar } from "components/real-state/pages/listing/MobilePriceBar";
import { ApiError } from "lib/api/core/client";
import { fetchPropertyByGraphql } from "lib/api/services/properties";
import {
  FALLBACK_GRADIENT,
  formatLandArea,
  formatLocation,
  formatMinBuyableLand,
  formatNPR,
  labelEnum,
  priceContextFromApiProperty,
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
    const plainDesc = stripHtml(property.description);
    return {
      title: `${property.title} | MALPOTH`,
      description:
        plainDesc ||
        `${labelEnum(property.subCategory, TYPE_LABELS)} for sale in ${formatLocation(property.location)}.`,
      alternates: { canonical: `/${slug}` },
      openGraph: {
        title: property.title,
        description:
          plainDesc ||
          `${formatNPR(property.askingPrice)} — ${formatLocation(property.location)}`,
        images: property.media?.[0]?.url ? [property.media[0].url] : undefined,
        type: "website",
      },
    };
  } catch {
    return { title: "Listing not found | MALPOTH" };
  }
}

function formatNumber(n: number | null | undefined): string | null {
  return n == null ? null : new Intl.NumberFormat("en-US").format(n);
}

/** Nicer display labels for construction statuses (labelEnum would render
 *  "READY" as just "Ready"). */
const CONSTRUCTION_LABELS: Record<string, string> = {
  READY: "Ready to move",
  UNDER_CONSTRUCTION: "Under construction",
  PRE_LAUNCH: "Pre-launch",
  RENOVATED: "Renovated",
  OLD_CONSTRUCTION: "Old construction",
  CORE_SHELL: "Core & shell",
};

function partitionMedia(media: ApiPropertyMedia[] = []) {
  const sorted = [...media].sort((a, b) => a.sortOrder - b.sortOrder);
  const images = sorted.filter((m) => !m.type || m.type === "IMAGE");
  const videos = sorted.filter((m) => m.type === "VIDEO_WALKTHROUGH");
  const cadastralMaps = sorted.filter((m) => m.type === "CADASTRAL_MAP");
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
  const gradient = TYPE_GRADIENTS[property.subCategory] ?? FALLBACK_GRADIENT;
  const area = formatLandArea(property.landArea);
  const location = formatLocation(property.location);
  const verified = property.verificationLevel !== "UNVERIFIED";
  const hasLand = Boolean(property.landArea && property.landArea.totalSqFt > 0);
  // Shared pricing inputs — per-unit rates on this page now use the exact same
  // conversion as the listing wizard (see priceContextFromApiProperty).
  const pricing = priceContextFromApiProperty(property);
  const p = property;

  const specs: Array<[string, string | null | undefined]> = [
    ...(hasLand
      ? ([
          ["Land Area", area],
          ["Total Area", `${formatNumber(p.landArea?.totalSqFt)} sq ft`],
          ["Total Area (m²)", `${formatNumber(p.landArea?.totalSqMeters)} m²`],
        ] as Array<[string, string | null | undefined]>)
      : []),
    ["Property Type", labelEnum(property.subCategory, TYPE_LABELS)],
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
    // Per-unit price moved to the interactive unit selector on the decision card.
    ["Listing Code", property.listingCode ?? null],
    [
      "Verification",
      labelEnum(property.verificationLevel, VERIFICATION_LABELS),
    ],
  ];

  // Key facts for the scannable strip under the title — the four
  // decision-relevant essentials, pulled from the spec rows built above.
  const keyFacts = specs
    .filter(([label]) =>
      ["Land Area", "Road Access", "Facing", "Property Type"].includes(label),
    )
    .filter(([, value]) => Boolean(value)) as Array<[string, string]>;

  const typeSpecs: Array<[string, string | null | undefined]> = [];
  const chipGroups: Array<{ label: string; values: string[] }> = [];
  const label = (v: string) => labelEnum(v, {});

  // Building specs (house / space / heritage)
  if (p.builtUpAreaSqFt)
    typeSpecs.push([
      "Built-up Area",
      `${formatNumber(p.builtUpAreaSqFt)} sq ft`,
    ]);
  if (p.propertySubtype) typeSpecs.push(["Subtype", label(p.propertySubtype)]);
  if (p.yearBuilt) typeSpecs.push(["Year Built", String(p.yearBuilt)]);
  if (p.constructionStatus)
    typeSpecs.push([
      "Construction Status",
      CONSTRUCTION_LABELS[p.constructionStatus] ?? label(p.constructionStatus),
    ]);
  if (p.floorNumber != null)
    typeSpecs.push(["Floor Number", String(p.floorNumber)]);
  if (p.totalFloors != null)
    typeSpecs.push(["Total Floors", String(p.totalFloors)]);
  if (p.bedrooms != null) typeSpecs.push(["Bedrooms", String(p.bedrooms)]);
  if (p.bathrooms != null) typeSpecs.push(["Bathrooms", String(p.bathrooms)]);
  if (p.livingRooms != null)
    typeSpecs.push(["Living Rooms", String(p.livingRooms)]);
  if (p.kitchens != null) typeSpecs.push(["Kitchens", String(p.kitchens)]);
  if (p.balconies != null) typeSpecs.push(["Balconies", String(p.balconies)]);
  if (p.parking) typeSpecs.push(["Parking", label(p.parking)]);
  if (p.furnishing) typeSpecs.push(["Furnishing", label(p.furnishing)]);
  if (p.houseFacing)
    typeSpecs.push([
      "House Facing",
      p.houseFacing === "SAME_AS_PLOT" ? "Same as plot" : label(p.houseFacing),
    ]);
  if (p.amenities?.length)
    chipGroups.push({ label: "Amenities", values: p.amenities.map(label) });

  // Residential land
  if (p.plotShape) typeSpecs.push(["Plot Shape", label(p.plotShape)]);
  if (p.frontageFt)
    typeSpecs.push(["Frontage", `${formatNumber(p.frontageFt)} ft`]);
  if (p.boundaryWall) typeSpecs.push(["Boundary Wall", label(p.boundaryWall)]);
  if (p.landClearance) typeSpecs.push(["Cleared / Fenced", "Yes"]);

  // Commercial land
  if (p.depthFt) typeSpecs.push(["Depth", `${formatNumber(p.depthFt)} ft`]);
  if (p.zoning) typeSpecs.push(["Zoning", label(p.zoning)]);
  if (p.setbackAvailable)
    typeSpecs.push([
      "Setback",
      p.setbackText ? `Yes — ${p.setbackText}` : "Yes",
    ]);
  if (p.suitableFor?.length)
    chipGroups.push({
      label: "Suitable for",
      values: p.suitableFor.map(label),
    });
  if (p.parkingSpaces != null)
    typeSpecs.push(["Parking Spaces", String(p.parkingSpaces)]);

  // Agricultural land
  if (p.landClassification)
    typeSpecs.push(["Land Classification", label(p.landClassification)]);
  if (p.soilType) typeSpecs.push(["Soil Type", label(p.soilType)]);
  if (p.waterSources?.length)
    chipGroups.push({
      label: "Water Sources",
      values: p.waterSources.map(label),
    });
  if (p.irrigationType) typeSpecs.push(["Irrigation", label(p.irrigationType)]);
  if (p.currentCrops) typeSpecs.push(["Current Crops", p.currentCrops]);
  if (p.fencing) typeSpecs.push(["Fencing", label(p.fencing)]);
  if (p.electricityAvailable) typeSpecs.push(["Electricity", "Available"]);
  if (p.terrain) typeSpecs.push(["Terrain", label(p.terrain)]);
  if (p.annualYield) typeSpecs.push(["Annual Yield", p.annualYield]);
  if (p.farmStructures?.length)
    chipGroups.push({
      label: "Farm Structures",
      values: p.farmStructures.map(label),
    });

  // Commercial space
  if (p.ceilingHeightFt)
    typeSpecs.push(["Ceiling Height", `${formatNumber(p.ceilingHeightFt)} ft`]);
  if (p.parkingAvailable) {
    const parkingParts = [
      p.parkingSpaces ? `${p.parkingSpaces} spaces` : null,
      p.parkingType ? label(p.parkingType) : null,
    ]
      .filter(Boolean)
      .join(" · ");
    typeSpecs.push(["Parking", parkingParts || "Yes"]);
  }
  if (p.priceType) typeSpecs.push(["Price Type", label(p.priceType)]);
  if (p.leaseAvailable)
    typeSpecs.push([
      "Lease Option",
      p.leaseMonthlyRent
        ? `Available — ${formatNPR(p.leaseMonthlyRent)}/month`
        : "Available",
    ]);
  if (p.commercialFeatures?.length)
    chipGroups.push({
      label: "Commercial Features",
      values: p.commercialFeatures.map(label),
    });
  if (p.zoningLegal) typeSpecs.push(["Zoning / Legal", label(p.zoningLegal)]);

  // Heritage home
  if (p.heritageType) typeSpecs.push(["Heritage Type", label(p.heritageType)]);
  if (p.heritageEra) typeSpecs.push(["Era / Period", label(p.heritageEra)]);
  if (p.heritageGrade) typeSpecs.push(["Grade", label(p.heritageGrade)]);
  if (p.courtyard) typeSpecs.push(["Courtyard", label(p.courtyard)]);
  if (p.traditionalFeatures?.length)
    chipGroups.push({
      label: "Traditional Features",
      values: p.traditionalFeatures.map(label),
    });
  if (p.renovationStatus)
    typeSpecs.push(["Renovation", label(p.renovationStatus)]);

  // Partial sale / negotiation (land types)
  if (p.minBuyableLandSqFt) {
    typeSpecs.push([
      "Min Buyable Land",
      formatMinBuyableLand(property) ??
        `${formatNumber(p.minBuyableLandSqFt)} sq ft`,
    ]);
  }
  if (p.isNegotiable) typeSpecs.push(["Negotiable", "Yes"]);

  const allSpecs = [...specs, ...typeSpecs];

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
          <ol className="flex items-center gap-1.5 text-sm text-on-surface-variant">
            <li>
              <Link href="/" className="transition-colors hover:text-primary">
                Home
              </Link>
            </li>
            <li aria-hidden className="flex items-center">
              <Icon
                name="chevron_right"
                className="text-on-surface-variant/60"
              />
            </li>
            <li>
              <Link
                href="/search"
                className="transition-colors hover:text-primary"
              >
                {labelEnum(property.subCategory, TYPE_LABELS)}
              </Link>
            </li>
            <li aria-hidden className="flex items-center">
              <Icon
                name="chevron_right"
                className="text-on-surface-variant/60"
              />
            </li>
            <li className="min-w-0 truncate font-medium text-on-surface">
              {property.title}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-4">
          {/* Badges */}
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {labelEnum(property.subCategory, TYPE_LABELS)}
            </Badge>
            {verified && (
              <Badge
                variant="outline"
                className="gap-1 border-gold/40 text-gold-deep"
              >
                <Icon name="verified" className="text-[14px]" />
                {labelEnum(property.verificationLevel, VERIFICATION_LABELS)}
              </Badge>
            )}
            {property.isFeatured && (
              <Badge variant="destructive">Featured</Badge>
            )}
            
          </div>

          {/* Title + Location */}
          <div className="min-w-0">
            <h1 className="font-headline-md text-pretty text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              {property.title}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <p className="flex min-w-0 max-w-full items-center gap-1.5 text-sm leading-6 text-on-surface-variant">
                <Icon name="location_on" className="shrink-0 text-[16px]" />
                <span className="truncate text-pretty">{location}</span>
              </p>
            </div>
          </div>

          {/* Key facts — the essentials at a glance, without reading the table */}
          {/* {keyFacts.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {keyFacts.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline gap-2 rounded-lg border border-outline-variant bg-surface px-3 py-2"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                    {label}
                  </span>
                  <span className="mono-stat text-[13px] font-medium text-on-surface">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )} */}
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
            <section className="mt-8">
              <h2 className="mb-4 font-headline-md text-lg font-semibold tracking-tight text-navy">
                Specifications
              </h2>
              <dl className="divide-y divide-outline-variant">
                {allSpecs
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <div
                      key={label}
                      className="grid gap-1 py-3 sm:grid-cols-[200px_1fr] sm:gap-6"
                    >
                      <dt className="text-sm text-on-surface-variant">
                        {label}
                      </dt>
                      <dd className="text-sm font-medium text-on-surface">
                        {value as string}
                      </dd>
                    </div>
                  ))}
              </dl>
              {chipGroups.length > 0 && (
                <div className="flex flex-col gap-4 pt-4">
                  {chipGroups.map((group) => (
                    <div key={group.label} className="flex flex-col gap-2">
                      <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                        {group.label}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {group.values.map((v) => (
                          <span
                            key={v}
                            className="rounded-md bg-surface-container px-2.5 py-1 text-[13px] font-medium text-on-surface-variant"
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Location details */}
            {locationSpecs.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-4 font-headline-md text-lg font-semibold tracking-tight text-navy">
                  Location
                </h2>
                <dl className="divide-y divide-outline-variant">
                  {locationSpecs
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <div
                        key={label}
                        className="grid gap-1 py-3 sm:grid-cols-[200px_1fr] sm:gap-6"
                      >
                        <dt className="text-sm text-on-surface-variant">
                          {label}
                        </dt>
                        <dd className="text-sm font-medium text-on-surface">
                          {value as string}
                        </dd>
                      </div>
                    ))}
                </dl>
              </section>
            )}
          </div>

          {/* Decision card — price, map, docs, CTAs */}
          <aside>
            <ListingDecisionCard
              propertyId={property.id}
              title={property.title}
              pricing={pricing}
              location={property.location}
              verified={verified}
            />
          </aside>
        </div>

        {/* Similar Properties Section */}
        <SimilarProperties propertyId={property.id} />

        {/* Clearance so the fixed mobile price bar never covers the footer */}
        <div className="h-28 lg:hidden" aria-hidden="true" />
      </main>

      {/* Mobile sticky price + primary actions (desktop uses the sidebar card) */}
      <MobilePriceBar
        askingPrice={formatNPR(property.askingPrice)}
        propertyId={property.id}
      />
    </>
  );
}
