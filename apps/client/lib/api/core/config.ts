

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const API_VERSION = "v1";

export const PAGE_SIZE = 12;

export const API_TIMEOUT_MS = 15_000;

export function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path}`;
}
