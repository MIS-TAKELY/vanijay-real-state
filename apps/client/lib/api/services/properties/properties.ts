import { apiFetch } from "../../core/client";
import { API_ENDPOINTS } from "../../core/endpoints";
import { gqlRequest } from "../../core/graphql";
import type { ApiProperty, CreatePropertyPayload, FeedPage } from "./types";

export function fetchFeedPage(opts: {
  first: number;
  after?: string | null;
}): Promise<FeedPage> {
  return apiFetch<FeedPage>(API_ENDPOINTS.properties.feed, {
    query: { first: opts.first, after: opts.after ?? undefined },
  });
}

export function fetchPropertyById(id: string): Promise<ApiProperty> {
  return apiFetch<ApiProperty>(API_ENDPOINTS.properties.byId(id));
}

export function fetchPropertyBySlug(slug: string): Promise<ApiProperty> {
  return apiFetch<ApiProperty>(API_ENDPOINTS.properties.byId(slug));
}

export function createProperty(
  input: CreatePropertyPayload,
): Promise<ApiProperty> {
  return apiFetch<ApiProperty>(API_ENDPOINTS.properties.create, {
    method: "POST",
    body: input,
  });
}

const PROPERTY_FRAGMENT = `
  fragment PropertyFields on Property {
    id
    listingCode
    slug
    title
    description
    mainCategory
    subCategory
    status
    verificationLevel
    askingPrice
    pricePerAana
    roadAccessWidthFt
    roadType
    facing
    isCornerPlot
    isFeatured
    isNegotiable
    minBuyableLandSqFt
    minBuyableUnitSystem
    minBuyableRopani
    minBuyableAana
    minBuyablePaisa
    minBuyableDaam
    minBuyableBigha
    minBuyableKatha
    minBuyableDhur
    builtUpAreaSqFt
    propertySubtype
    yearBuilt
    constructionStatus
    floorNumber
    totalFloors
    bedrooms
    bathrooms
    livingRooms
    kitchens
    balconies
    parking
    furnishing
    houseFacing
    amenities
    plotShape
    frontageFt
    boundaryWall
    landClearance
    depthFt
    zoning
    setbackAvailable
    setbackText
    suitableFor
    parkingSpaces
    landClassification
    soilType
    waterSources
    irrigationType
    currentCrops
    fencing
    electricityAvailable
    terrain
    annualYield
    farmStructures
    ceilingHeightFt
    parkingAvailable
    parkingType
    priceType
    leaseAvailable
    leaseMonthlyRent
    commercialFeatures
    zoningLegal
    heritageType
    heritageEra
    heritageGrade
    courtyard
    traditionalFeatures
    renovationStatus
    ownerId
    agentId
    createdAt
    updatedAt
    location {
      province
      district
      municipality
      wardNumber
      areaName
      addressText
      latitude
      longitude
    }
    landArea {
      ropani
      aana
      paisa
      daam
      bigha
      katha
      dhur
      totalSqFt
      totalSqMeters
    }
    media {
      type
      url
      altText
      sortOrder
      isCover
    }
  }
`;

export interface FeedQueryOptions {
  first: number;
  after?: string | null;
  q?: string | null;
  type?: string | null;
  price?: string | null;
  district?: string | null;
  minSize?: string | number | null;
  maxSize?: string | number | null;
}

const LISTINGS_FEED_QUERY = `
  query ListingsFeed($first: Int, $after: String, $q: String, $type: String, $price: String, $district: String, $minSize: Float, $maxSize: Float) {
    propertiesFeed(first: $first, after: $after, q: $q, type: $type, price: $price, district: $district, minSize: $minSize, maxSize: $maxSize) {
      items {
        ...PropertyFields
      }
      nextCursor
      hasMore
    }
  }
  ${PROPERTY_FRAGMENT}
`;

const PROPERTY_QUERY = `
  query Property($idOrSlug: ID!) {
    property(idOrSlug: $idOrSlug) {
      ...PropertyFields
    }
  }
  ${PROPERTY_FRAGMENT}
`;

const MY_PROPERTIES_QUERY = `
  query MyProperties {
    myProperties {
      ...PropertyFields
    }
  }
  ${PROPERTY_FRAGMENT}
`;

export function fetchFeedPageGraphql(
  opts: FeedQueryOptions,
): Promise<FeedPage> {
  return gqlRequest<{ propertiesFeed: FeedPage }>(LISTINGS_FEED_QUERY, {
    first: opts.first,
    after: opts.after ?? null,
    q: opts.q?.trim() ? opts.q.trim() : null,
    type: opts.type && opts.type !== "all" ? opts.type : null,
    price: opts.price && opts.price !== "any" ? opts.price : null,
    district: opts.district?.trim() ? opts.district.trim() : null,
    minSize:
      opts.minSize != null && opts.minSize !== "" ? Number(opts.minSize) : null,
    maxSize:
      opts.maxSize != null && opts.maxSize !== "" ? Number(opts.maxSize) : null,
  }).then((data) => data.propertiesFeed);
}

export interface SearchSuggestion {
  value: string;
  label: string;
  type: string;
}

const SEARCH_SUGGESTIONS_QUERY = `
  query SearchSuggestions($q: String!, $limit: Int) {
    searchSuggestions(q: $q, limit: $limit) {
      value
      label
      type
    }
  }
`;

export function fetchSearchSuggestionsGraphql(
  q: string,
  limit = 8,
): Promise<SearchSuggestion[]> {
  return gqlRequest<{ searchSuggestions: SearchSuggestion[] }>(
    SEARCH_SUGGESTIONS_QUERY,
    { q, limit },
  ).then((data) => data.searchSuggestions);
}

export function fetchPropertyByGraphql(idOrSlug: string): Promise<ApiProperty> {
  return gqlRequest<{ property: ApiProperty }>(PROPERTY_QUERY, {
    idOrSlug,
  }).then((data) => data.property);
}

export function fetchMyListingsGraphql(): Promise<ApiProperty[]> {
  return gqlRequest<{ myProperties: ApiProperty[] }>(MY_PROPERTIES_QUERY).then(
    (data) => data.myProperties,
  );
}

export function updateProperty(
  id: string,
  input: object,
): Promise<ApiProperty> {
  return apiFetch<ApiProperty>(API_ENDPOINTS.properties.update(id), {
    method: "PATCH",
    body: input,
  });
}

/**
 * Move a listing through the lifecycle (Mark sold / Archive / re-publish) by
 * PATCHing only the status field. Used by the My Listings row menu.
 */
export function updatePropertyStatus(
  id: string,
  status: string,
): Promise<ApiProperty> {
  return updateProperty(id, { status });
}

export function deleteProperty(id: string): Promise<void> {
  return apiFetch<void>(API_ENDPOINTS.properties.remove(id), {
    method: "DELETE",
  });
}
