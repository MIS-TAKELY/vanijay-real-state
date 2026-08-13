import { API_VERSION } from "./config";

export const API_ENDPOINTS = {
  properties: {
    feed: `/api/${API_VERSION}/properties/feed`,
    byId: (id: string) =>
      `/api/${API_VERSION}/properties/${encodeURIComponent(id)}`,
    create: `/api/${API_VERSION}/properties`,
    update: (id: string) =>
      `/api/${API_VERSION}/properties/${encodeURIComponent(id)}`,
    remove: (id: string) =>
      `/api/${API_VERSION}/properties/${encodeURIComponent(id)}`,
  },

  seller: {
    register: `/api/${API_VERSION}/seller/register`,
    checkPhone: `/api/${API_VERSION}/seller/check-phone`,
  },

  uploads: {
    single: `/api/${API_VERSION}/uploads`,
    multiple: `/api/${API_VERSION}/uploads/multiple`,
    remove: (publicId: string) =>
      `/api/${API_VERSION}/uploads/${encodeURIComponent(publicId)}`,
  },

  favorites: {
    base: `/api/${API_VERSION}/favorites`,
    byProperty: (propertyId: string) =>
      `/api/${API_VERSION}/favorites/${encodeURIComponent(propertyId)}`,
    status: (propertyId: string) =>
      `/api/${API_VERSION}/favorites/status/${encodeURIComponent(propertyId)}`,
  },

  cart: {
    base: `/api/${API_VERSION}/cart`,
    count: `/api/${API_VERSION}/cart/count`,
    byProperty: (propertyId: string) =>
      `/api/${API_VERSION}/cart/${encodeURIComponent(propertyId)}`,
  },

    auth: {
    base: `/api/auth`,
    signUpEmail: `/api/auth/sign-up/email`,
    signInEmail: `/api/auth/sign-in/email`,
    signOut: `/api/auth/sign-out`,
    getSession: `/api/auth/get-session`,
  },

  analytics: {
    trending: `/api/${API_VERSION}/analytics/trending`,
    trackView: (propertyId: string) =>
      `/api/${API_VERSION}/analytics/properties/${encodeURIComponent(propertyId)}/view`,
    trackShare: (propertyId: string) =>
      `/api/${API_VERSION}/analytics/properties/${encodeURIComponent(propertyId)}/share`,
    trackPhoneClick: (propertyId: string) =>
      `/api/${API_VERSION}/analytics/properties/${encodeURIComponent(propertyId)}/phone-click`,
    sellerContact: (propertyId: string) =>
      `/api/${API_VERSION}/analytics/properties/${encodeURIComponent(propertyId)}/seller-contact`,
  },

  dashboard: {
    overview: `/api/${API_VERSION}/dashboard/overview`,
  },

  profile: {
    base: `/api/${API_VERSION}/profile`,
    citizenship: `/api/${API_VERSION}/profile/citizenship`,
  },
} as const;

export const GRAPHQL_ENDPOINT = `/api/${API_VERSION}/vanijay-real-state`;

export type ApiDomain = keyof typeof API_ENDPOINTS;
