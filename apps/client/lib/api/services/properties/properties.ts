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
    propertyType
    status
    verificationLevel
    askingPrice
    pricePerAana
    roadAccessWidthFt
    roadType
    facing
    isCornerPlot
    isFeatured
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

const LISTINGS_FEED_QUERY = `
  query ListingsFeed($first: Int, $after: String) {
    propertiesFeed(first: $first, after: $after) {
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

export function fetchFeedPageGraphql(opts: {
  first: number;
  after?: string | null;
}): Promise<FeedPage> {
  return gqlRequest<{ propertiesFeed: FeedPage }>(LISTINGS_FEED_QUERY, {
    first: opts.first,
    after: opts.after ?? null,
  }).then((data) => data.propertiesFeed);
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
