"use client";

import { useSession } from "@repo/auth/client";
import { usePathname } from "next/navigation";
import { useAuthModalStore } from "store/auth-modal";

/**
 * Gate for actions that require a signed-in user (favorites, cart).
 *
 * Returns `requireAuth()` — call it before hitting an authenticated endpoint.
 * If the session is still loading it returns false (callers should no-op),
 * and if the user is signed out it opens the sign-in modal (remembering the
 * current page so the sign-in flow can send them back).
 */
export function useRequireAuth() {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const openAuth = useAuthModalStore((state) => state.open);
  const setRedirect = useAuthModalStore((state) => state.setRedirect);

  const isSignedIn = !!session?.user;
  const sessionReady = !isPending;

  const requireAuth = (): boolean => {
    if (!sessionReady) return false;
    if (!isSignedIn) {
      setRedirect(pathname);
      openAuth();
      return false;
    }
    return true;
  };

  return { isSignedIn, sessionReady, requireAuth };
}