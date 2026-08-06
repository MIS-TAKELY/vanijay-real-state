"use client";

import { useSession } from "@repo/auth/client";
import { Container, Skeleton } from "@repo/ui";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardSidebar } from "components/pages/dashboard";

const containerClass = "flex flex-col md:flex-row md:gap-lg py-md md:py-lg";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLoggedIn = !!session?.user;

  // Redirect signed-out users to the home page, where AuthModalListener
  // picks up `?auth=signin` and opens the sign-in modal automatically.
  // The attempted path is passed back via `?redirect=` so the user can be
  // sent there after signing in.
  useEffect(() => {
    if (!isPending && !isLoggedIn) {
      router.replace(
        `/?auth=signin&redirect=${encodeURIComponent(pathname)}`,
      );
    }
  }, [isPending, isLoggedIn, router, pathname]);

  // While the session is loading (or the redirect is in flight), render a
  // skeleton shell instead of the dashboard so protected content never flashes.
  if (isPending || !isLoggedIn) {
    return (
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
    );
  }

  return (
    <Container className={containerClass}>
      <DashboardSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </Container>
  );
}
