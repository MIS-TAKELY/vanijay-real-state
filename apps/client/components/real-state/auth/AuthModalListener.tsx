"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAuthModalStore } from "store/auth-modal";
// import { useAuthModalStore } from "../../store/auth-modal";

/**
 * Listens for `?auth=signin` in the URL and opens the sign-in modal
 * automatically. A `?redirect=/some/path` param is captured into the auth
 * modal store so the user can be sent back after signing in. Removes the
 * query params after triggering so the modal doesn't re-open on subsequent
 * navigation.
 *
 * Place this in the root layout inside a `<Suspense>` boundary.
 */
export function AuthModalListener() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("auth") === "signin") {
      const store = useAuthModalStore.getState();
      const redirect = searchParams.get("redirect");
      // Only accept internal paths. Resolving against the app origin and
      // comparing origins rejects external URLs, protocol-relative links
      // (`//evil.com`) and backslash tricks (`/\evil.com`), which browsers
      // normalize to external navigation — i.e. no open redirects.
      if (redirect) {
        try {
          const target = new URL(redirect, window.location.origin);
          if (target.origin === window.location.origin) {
            store.setRedirect(target.pathname + target.search);
          }
        } catch {
          // Malformed URL — ignore.
        }
      }
      store.open();
      // Clean up the URL to prevent re-triggering
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  return null;
}
