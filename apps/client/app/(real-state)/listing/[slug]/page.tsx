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
  formatMinBuyableLand,
  formatNPR,
  isLandPropertyType,
  labelEnum,
  TYPE_GRADIENTS,
  TYPE_LABELS,
  VERIFICATION_LABELS,
  type ApiProperty,
  type ApiPropertyMedia,
} from "lib/api/services/properties/types";
import { stripHtml } from "components/real-state/googlemap/utils";
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
      title: `${property.title} | Lekhaprati`,
      description:
        plainDesc ||
        `${labelEnum(property.propertyType, TYPE_LABELS)} for sale in ${formatLocation(property.location)}.`,
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

  const { images, videos, cadastralMaps } = partitionMedia(property.media);
  const gradient = TYPE_GRADIENTS[property.propertyType] ?? FALLBACK_GRADIENT;
  const area = formatLandArea(property.landArea);
  const location = formatLocation(property.location);
  const verified = property.verificationLevel !== "UNVERIFIED";
  // Building types (houses/spaces/heritage) don't always include land — skip
  // the land-area rows when the parcel is zero/absent.
  const hasLand = Boolean(property.landArea && property.landArea.totalSqFt > 0);
  const p = property;

  const specs: Array<[string, string | null | undefined]> = [
    ...(hasLand
      ? ([
          ["Land Area", area],
          ["Total Area", `${formatNumber(p.landArea?.totalSqFt)} sq ft`],
          ["Total Area (m²)", `${formatNumber(p.landArea?.totalSqMeters)} m²`],
        ] as Array<[string, string | null | undefined]>)
      : []),
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
    // Per-unit price moved to the interactive unit selector on the decision card.
    ["Listing Code", property.listingCode ?? null],
    [
      "Verification",
      labelEnum(property.verificationLevel, VERIFICATION_LABELS),
    ],
  ];

  // Type-specific specs from Step 3 (null/empty values are filtered out
  // below). Multi-select fields render as chip groups under the rows.
  const typeSpecs: Array<[string, string | null | undefined]> = [];
  const chipGroups: Array<{ label: string; values: string[] }> = [];
  const label = (v: string) => labelEnum(v, {});

  // Building specs (house / space / heritage)
  if (p.builtUpAreaSqFt)
    typeSpecs.push(["Built-up Area", `${formatNumber(p.builtUpAreaSqFt)} sq ft`]);
  if (p.propertySubtype) typeSpecs.push(["Subtype", label(p.propertySubtype)]);
  if (p.yearBuilt) typeSpecs.push(["Year Built", String(p.yearBuilt)]);
  if (p.constructionStatus)
    typeSpecs.push([
      "Construction Status",
      CONSTRUCTION_LABELS[p.constructionStatus] ?? label(p.constructionStatus),
    ]);
  if (p.floorNumber != null) typeSpecs.push(["Floor Number", String(p.floorNumber)]);
  if (p.totalFloors != null) typeSpecs.push(["Total Floors", String(p.totalFloors)]);
  if (p.bedrooms != null) typeSpecs.push(["Bedrooms", String(p.bedrooms)]);
  if (p.bathrooms != null) typeSpecs.push(["Bathrooms", String(p.bathrooms)]);
  if (p.livingRooms != null) typeSpecs.push(["Living Rooms", String(p.livingRooms)]);
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
  if (p.frontageFt) typeSpecs.push(["Frontage", `${formatNumber(p.frontageFt)} ft`]);
  if (p.boundaryWall) typeSpecs.push(["Boundary Wall", label(p.boundaryWall)]);
  if (p.landClearance) typeSpecs.push(["Cleared / Fenced", "Yes"]);

  // Commercial land
  if (p.depthFt) typeSpecs.push(["Depth", `${formatNumber(p.depthFt)} ft`]);
  if (p.zoning) typeSpecs.push(["Zoning", label(p.zoning)]);
  if (p.setbackAvailable)
    typeSpecs.push(["Setback", p.setbackText ? `Yes — ${p.setbackText}` : "Yes"]);
  if (p.suitableFor?.length)
    chipGroups.push({ label: "Suitable for", values: p.suitableFor.map(label) });
  if (p.parkingSpaces != null)
    typeSpecs.push(["Parking Spaces", String(p.parkingSpaces)]);

  // Agricultural land
  if (p.landClassification)
    typeSpecs.push(["Land Classification", label(p.landClassification)]);
  if (p.soilType) typeSpecs.push(["Soil Type", label(p.soilType)]);
  if (p.waterSources?.length)
    chipGroups.push({ label: "Water Sources", values: p.waterSources.map(label) });
  if (p.irrigationType) typeSpecs.push(["Irrigation", label(p.irrigationType)]);
  if (p.currentCrops) typeSpecs.push(["Current Crops", p.currentCrops]);
  if (p.fencing) typeSpecs.push(["Fencing", label(p.fencing)]);
  if (p.electricityAvailable) typeSpecs.push(["Electricity", "Available"]);
  if (p.terrain) typeSpecs.push(["Terrain", label(p.terrain)]);
  if (p.annualYield) typeSpecs.push(["Annual Yield", p.annualYield]);
  if (p.farmStructures?.length)
    chipGroups.push({ label: "Farm Structures", values: p.farmStructures.map(label) });

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
    chipGroups.push({ label: "Commercial Features", values: p.commercialFeatures.map(label) });
  if (p.zoningLegal) typeSpecs.push(["Zoning / Legal", label(p.zoningLegal)]);

  // Heritage home
  if (p.heritageType) typeSpecs.push(["Heritage Type", label(p.heritageType)]);
  if (p.heritageEra) typeSpecs.push(["Era / Period", label(p.heritageEra)]);
  if (p.heritageGrade) typeSpecs.push(["Grade", label(p.heritageGrade)]);
  if (p.courtyard) typeSpecs.push(["Courtyard", label(p.courtyard)]);
  if (p.traditionalFeatures?.length)
    chipGroups.push({ label: "Traditional Features", values: p.traditionalFeatures.map(label) });
  if (p.renovationStatus) typeSpecs.push(["Renovation", label(p.renovationStatus)]);

  // Partial sale / negotiation (land types)
  if (p.minBuyableLandSqFt) {
    typeSpecs.push([
      "Min Buyable Land",
      formatMinBuyableLand(property) ?? `${formatNumber(p.minBuyableLandSqFt)} sq ft`,
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
                {allSpecs
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <SpecRow
                      key={label}
                      label={label}
                      value={value as string}
                    />
                  ))}
                {chipGroups.length > 0 && (
                  <div className="flex flex-col gap-sm pt-3">
                    {chipGroups.map((group) => (
                      <div key={group.label} className="flex flex-col gap-1.5">
                        <span className="text-sm text-on-surface-variant">
                          {group.label}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {group.values.map((v) => (
                            <span
                              key={v}
                              className="rounded bg-surface-container px-2 py-0.5 text-[12px] font-medium text-on-surface-variant"
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
              price={property.askingPrice}
              isLand={isLandPropertyType(property.propertyType)}
              landTotalSqFt={property.landArea?.totalSqFt ?? null}
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
