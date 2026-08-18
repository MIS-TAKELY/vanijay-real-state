export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

/** Server-side API origin (Docker DNS in prod). Never bake the public URL into proxy checks. */
export const AUTH_API_URL =
  process.env.AUTH_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export const API_VERSION = "v1";

export const PAGE_SIZE = 12;

export const API_TIMEOUT_MS = 15_000;

export function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path}`;
}

/** Server-side API origin (internal Docker DNS). Never route server fetches
 *  through the public URL — going out via Cloudflare 403s/times out. */
export function serverApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${AUTH_API_URL}${path}`;
}
