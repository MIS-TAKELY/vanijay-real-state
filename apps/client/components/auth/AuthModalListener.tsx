"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAuthModalStore } from "../../app/store/auth-modal";

/**
 * Listens for `?auth=signin` in the URL and opens the sign-in modal
 * automatically. Removes the query param after triggering so the modal
 * doesn't re-open on subsequent navigation.
 *
 * Place this in the root layout inside a `<Suspense>` boundary.
 */
export function AuthModalListener() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("auth") === "signin") {
      useAuthModalStore.getState().open();
      // Clean up the URL to prevent re-triggering
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  return null;
}
