"use client";

import { useSession } from "@repo/auth/client";
import { Container, Skeleton } from "@repo/ui";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { DashboardSidebar } from "components/real-state/pages/dashboard";
import type { SessionUser } from "lib/auth-server";

import { SessionUserContext } from "./session-context";

const containerClass = "flex flex-col md:flex-row md:gap-lg py-md md:py-lg";

/**
 * Auth gate for the (auth) route group.
 *
 * The server (layout.tsx) resolves the session from the request cookie and
 * passes it in as `initialUser`, so the server HTML already contains the real
 * dashboard layout for signed-in users — no skeleton flash, and the first
 * client render agrees with the server (no hydration mismatch).
 *
 * While better-auth's client fetch is pending we trust the server-provided
 * session; once it resolves we switch to the live value, which also covers
 * sessions that expire mid-browsing.
 */
export function AuthGate({
  initialUser,
  children,
}: {
  initialUser: SessionUser | null;
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLoggedIn = !!session?.user;

  // Until the client session resolves, use the session the server already
  // verified — this is what keeps server HTML and first client render in sync.
  const loggedIn = isPending ? !!initialUser : isLoggedIn;

  // Redirect signed-out users to the home page, where AuthModalListener
  // picks up `?auth=signin` and opens the sign-in modal automatically.
  // The attempted path is passed back via `?redirect=` so the user can be
  // sent there after signing in.
  useEffect(() => {
    if (!isPending && !isLoggedIn) {
      router.replace(`/?auth=signin&redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isPending, isLoggedIn, router, pathname]);

  // While the session is loading (or the redirect is in flight), render a
  // skeleton shell instead of the dashboard so protected content never flashes.
  return (
    <SessionUserContext.Provider value={initialUser}>
      {!loggedIn ? (
        <Container className={containerClass}>
          <div className="hidden md:flex md:w-55 md:shrink-0 md:flex-col md:gap-md md:py-md">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-9 w-48" />
          </div>
          <div className="min-w-0 flex-1 space-y-4 py-md md:py-lg">
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </Container>
      ) : (
        <Container className={containerClass}>
          <DashboardSidebar />
          <div className="min-w-0 flex-1">{children}</div>
        </Container>
      )}
    </SessionUserContext.Provider>
  );
}
