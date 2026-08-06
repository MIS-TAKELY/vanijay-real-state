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
  },

  uploads: {
    single: `/api/${API_VERSION}/uploads`,
    multiple: `/api/${API_VERSION}/uploads/multiple`,
    remove: (publicId: string) =>
      `/api/${API_VERSION}/uploads/${encodeURIComponent(publicId)}`,
  },

  auth: {
    base: `/api/auth`,
    signUpEmail: `/api/auth/sign-up/email`,
    signInEmail: `/api/auth/sign-in/email`,
    signOut: `/api/auth/sign-out`,
    getSession: `/api/auth/get-session`,
  },
} as const;

/** Code-first GraphQL endpoint (Apollo Server) — see apps/api/src/app.module.ts. */
export const GRAPHQL_ENDPOINT = `/api/${API_VERSION}/vanijay-real-state`;

export type ApiDomain = keyof typeof API_ENDPOINTS;
