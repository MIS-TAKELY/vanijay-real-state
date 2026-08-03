/**
 * Public entry point for the API layer — import everything from "lib/api".
 *
 *   import { apiFetch, API_ENDPOINTS, fetchFeedPage, PAGE_SIZE } from "lib/api";
 *
 * Folder structure:
 *   lib/api/
 *   ├── core/         infrastructure: config, generic client, endpoint registry
 *   └── services/     domain services (one folder per backend domain)
 *       ├── properties/   feed + CRUD + types/mappers
 *       └── seller/       seller registration
 */
export * from "./core/config";
export * from "./core/client";
export * from "./core/endpoints";
export * from "./services/properties";
export * from "./services/seller";
