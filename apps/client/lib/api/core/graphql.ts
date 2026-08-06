import { ApiError } from "./client";
import { API_TIMEOUT_MS, apiUrl } from "./config";
import { GRAPHQL_ENDPOINT } from "./endpoints";

interface GqlEnvelope<T> {
  data?: T;
  errors?: ReadonlyArray<{
    message: string;
    path?: ReadonlyArray<string | number>;
  }>;
}

export interface GqlRequestOptions {
  forwardCookies?: boolean;
  signal?: AbortSignal;
  credentials?: boolean;
}

function makeTimeoutSignal(ms: number): AbortSignal | undefined {
  const ctor =
    typeof AbortSignal !== "undefined"
      ? (AbortSignal as unknown as { timeout?: (ms: number) => AbortSignal })
      : undefined;
  return typeof ctor?.timeout === "function" ? ctor.timeout(ms) : undefined;
}

export async function gqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  opts: GqlRequestOptions = {},
): Promise<T> {
  const { forwardCookies = true, signal, credentials = true } = opts;

  const isServer = typeof window === "undefined";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (isServer && forwardCookies) {
    const { cookies } = await import("next/headers");
    const store = await cookies();
    const cookie = store
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
    if (cookie) headers.cookie = cookie;
  }

  const init: RequestInit = {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  };
  if (!isServer && credentials) init.credentials = "include";

  if (signal) {
    init.signal = signal;
  } else if (API_TIMEOUT_MS > 0) {
    const timeoutSignal = makeTimeoutSignal(API_TIMEOUT_MS);
    if (timeoutSignal) init.signal = timeoutSignal;
  }

  const res = await fetch(apiUrl(GRAPHQL_ENDPOINT), init);

  let parsed: GqlEnvelope<T> | undefined;
  try {
    parsed = (await res.json()) as GqlEnvelope<T>;
  } catch {
    parsed = undefined;
  }

  if (!res.ok || parsed?.errors?.length) {
    const serverMessage = parsed?.errors?.map((e) => e.message).join("; ");
    throw new ApiError(
      res.status || 400,
      serverMessage || `GraphQL request failed (${res.status})`,
      parsed,
    );
  }

  if (!parsed?.data) {
    throw new ApiError(
      res.status || 500,
      "GraphQL request returned no data.",
      parsed,
    );
  }

  return parsed.data as T;
}
