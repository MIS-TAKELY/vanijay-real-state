import { API_TIMEOUT_MS, apiUrl, serverApiUrl } from "./config";

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export interface ApiFetchOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  credentials?: boolean;
  skipServerCookies?: boolean;
  cache?: RequestCache;
  next?: { revalidate?: number; tags?: string[] };
}

function toQueryString(
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    sp.set(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

async function getServerCookieHeader(): Promise<string | undefined> {
  if (typeof window !== "undefined") return undefined;
  const { cookies } = await import("next/headers");
  const store = await cookies();
  const header = store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  return header || undefined;
}

function makeTimeoutSignal(ms: number): AbortSignal | undefined {
  const ctor =
    typeof AbortSignal !== "undefined"
      ? (AbortSignal as unknown as {
          timeout?: (ms: number) => AbortSignal;
        })
      : undefined;
  return typeof ctor?.timeout === "function" ? ctor.timeout(ms) : undefined;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    query,
    headers: extraHeaders = {},
    signal,
    credentials = true,
    skipServerCookies = false,
    cache,
    next,
  } = options;

  const isServer = typeof window === "undefined";

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...extraHeaders,
  };
  if (body !== undefined) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }
  if (isServer && !skipServerCookies) {
    const cookie = await getServerCookieHeader();
    if (cookie) headers.cookie = cookie;
  }

  const init: RequestInit = { method, headers };
  if (body !== undefined) init.body = JSON.stringify(body);
  if (cache !== undefined) init.cache = cache;
  if (next !== undefined) {
    (init as RequestInit & { next?: unknown }).next = next;
  } else if (isServer && cache === undefined) {
    init.cache = "no-store";
  }
  if (!isServer && credentials) init.credentials = "include";

  if (signal) {
    init.signal = signal;
  } else if (API_TIMEOUT_MS > 0) {
    const timeoutSignal = makeTimeoutSignal(API_TIMEOUT_MS);
    if (timeoutSignal) init.signal = timeoutSignal;
  }

  const url = isServer
    ? serverApiUrl(`${path}${query ? toQueryString(query) : ""}`)
    : apiUrl(`${path}${query ? toQueryString(query) : ""}`);

  const res = await fetch(url, init);

  if (!res.ok) {
    let parsed: unknown;
    try {
      parsed = await res.json();
    } catch {
      parsed = undefined;
    }
    // The API's GlobalExceptionFilter passes class-validator messages through
    // as a string[] (one entry per failed constraint), so normalize both
    // shapes into a single readable message.
    const raw =
      typeof parsed === "object" && parsed !== null
        ? (parsed as { message?: unknown }).message
        : undefined;
    const message = Array.isArray(raw)
      ? raw.filter((m): m is string => typeof m === "string").join("; ")
      : typeof raw === "string"
        ? raw
        : undefined;
    throw new ApiError(
      res.status,
      message || `Request failed (${res.status})`,
      parsed,
    );
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
