import { gqlRequest } from "../../core/graphql";
import type { ApiProperty } from "./types";

export interface PropertyItem {
  id: string;
  listingCode: string;
  slug: string;
  title: string;
  description?: string | null;
  propertyType: string;
  status: string;
  verificationLevel: string;
  askingPrice: number;
  pricePerAana?: number | null;
  roadAccessWidthFt?: number | null;
  roadType?: string | null;
  facing?: string | null;
  isCornerPlot: boolean;
  isFeatured: boolean;
  ownerId: string;
  agentId?: string | null;
  createdAt: string;
  updatedAt: string;
  location?: any | null;
  landArea?: any | null;
  media: Array<{
    url: string;
    altText?: string | null;
    sortOrder: number;
    isCover: boolean;
  }>;
}

export interface PropertyListResponse {
  items: PropertyItem[];
  total: number;
}

const TRENDING_PROPERTIES_QUERY = `
  query TrendingProperties($limit: Int, $period: String) {
    trendingProperties(limit: $limit, period: $period) {
      items {
        propertyId
        title
        slug
        imageUrl
        location
        askingPrice
        trendingScore
        viewCount
        favoriteCount
        cartAddCount
      }
    }
  }
`;

const SIMILAR_PROPERTIES_QUERY = `
  query SimilarProperties($propertyId: ID!, $limit: Int) {
    similarProperties(propertyId: $propertyId, limit: $limit) {
      items {
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
          url
          altText
          sortOrder
          isCover
        }
      }
      total
    }
  }
`;

const RECENTLY_VIEWED_QUERY = `
  query RecentlyViewedProperties($limit: Int) {
    recentlyViewedProperties(limit: $limit) {
      items {
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
          url
          altText
          sortOrder
          isCover
        }
      }
      total
    }
  }
`;

const FEATURED_PROPERTIES_QUERY = `
  query FeaturedProperties($limit: Int) {
    featuredProperties(limit: $limit) {
      items {
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
          url
          altText
          sortOrder
          isCover
        }
      }
      total
    }
  }
`;

export async function fetchTrendingPropertiesGraphql(
  limit = 10,
  period = '7d',
): Promise<PropertyListResponse> {
  const data = await gqlRequest<{ trendingProperties: { items: any[] } }>(
    TRENDING_PROPERTIES_QUERY,
    { limit, period },
  );
  
  return {
    items: data.trendingProperties.items.map((item: any) => ({
      ...item,
      media: item.imageUrl ? [{ url: item.imageUrl, isCover: true, sortOrder: 0 }] : [],
    })),
    total: data.trendingProperties.items.length,
  };
}

export async function fetchSimilarProperties(
  propertyId: string,
  limit = 10,
): Promise<PropertyListResponse> {
  const data = await gqlRequest<{ similarProperties: PropertyListResponse }>(
    SIMILAR_PROPERTIES_QUERY,
    { propertyId, limit },
  );
  return data.similarProperties;
}

export async function fetchRecentlyViewedProperties(
  limit = 10,
): Promise<PropertyListResponse> {
  const data = await gqlRequest<{ recentlyViewedProperties: PropertyListResponse }>(
    RECENTLY_VIEWED_QUERY,
    { limit },
  );
  return data.recentlyViewedProperties;
}

export async function fetchFeaturedProperties(
  limit = 10,
): Promise<PropertyListResponse> {
  const data = await gqlRequest<{ featuredProperties: PropertyListResponse }>(
    FEATURED_PROPERTIES_QUERY,
    { limit },
  );
  return data.featuredProperties;
}
