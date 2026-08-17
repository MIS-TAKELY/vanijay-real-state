"use client";

import { useSession } from "@repo/auth/client";
import { createContext, useContext } from "react";

import type { SessionUser } from "lib/auth-server";

/**
 * The user resolved from the request cookie by the server layout. Provided by
 * <AuthGate /> so the whole (auth) tree can render session-dependent content
 * from server-known state.
 */
export const SessionUserContext = createContext<SessionUser | null>(null);

interface ServerSessionData {
  user: SessionUser;
  session: unknown;
}

type SessionRefetch = ReturnType<typeof useSession>["refetch"];

/**
 * Session state that always agrees with the server HTML.
 *
 * While better-auth's client-side session fetch is still pending, the value is
 * taken from the session the server already resolved (passed through
 * SessionUserContext). This guarantees the first client render matches the
 * server render, so session-dependent content never triggers a hydration
 * mismatch or flashes fallback content. Once the live fetch resolves, the real
 * value takes over — covering sessions that expired or were revoked between
 * the server render and hydration.
 *
 * Requires <AuthGate /> (or any provider of SessionUserContext) above.
 */
export function useSessionWithServer() {
  const initialUser = useContext(SessionUserContext);
  const { data, error, isPending, isRefetching, refetch } = useSession();

  if (isPending) {
    return {
      data: initialUser
        ? ({ user: initialUser, session: null } satisfies ServerSessionData)
        : null,
      error: null,
      isPending: false,
      isRefetching: false,
      refetch,
    };
  }

  return { data, error, isPending, isRefetching, refetch };
}

export type { SessionRefetch };
