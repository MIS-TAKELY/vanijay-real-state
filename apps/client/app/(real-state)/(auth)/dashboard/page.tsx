"use client";

import { useSession } from "@repo/auth/client";
import { Button, Icon } from "@repo/ui";
import { PhoneVerificationModal } from "components/real-state/modals/PhoneVerificationModal";
import {
  ActivityFeed,
  DashboardHeader,
  GreetingRow,
  ListingsSnapshot,
  StatGrid,
  UpcomingAppointments,
  VerificationBanner,
} from "components/real-state/pages/dashboard";
import type {
  DashboardActivityItem,
  DashboardAppointment,
  DashboardListingSnapshot,
  DashboardOverview,
  DashboardStats,
} from "lib/api/services/dashboard";
import { fetchDashboardOverview } from "lib/api/services/dashboard";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const session=useSession()

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchDashboardOverview()
      .then((overview) => {
        if (!cancelled) setData(overview);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load dashboard",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const stats: DashboardStats | undefined = data?.stats;
  const listings: DashboardListingSnapshot[] = data?.listings ?? [];
  const activity: DashboardActivityItem[] = data?.activity ?? [];
  const appointments: DashboardAppointment[] = data?.appointments ?? [];


  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Overview"
        description="Your archive at a glance — listings, inquiries and verification status."
        action={
          <Button asChild>
            <Link href="/my-listings/new">
              <Icon name="add" className="text-data-table" />
              New Listing
            </Link>
          </Button>
        }
      />

      <GreetingRow
        name={session.data?.user.name}
        verificationLevel={stats ? (stats.activeListings > 0 ? 2 : 1) : 0}
      />

      <VerificationBanner show={true} />

      {loading ? (
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4 mb-md">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-sm rounded-2xl border border-outline-variant bg-surface p-md"
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-24 rounded bg-surface-container" />
                <div className="h-8 w-8 rounded-lg bg-surface-container" />
              </div>
              <div className="h-8 w-16 rounded bg-surface-container" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <StatGrid
          stats={
            stats
              ? [
                  {
                    label: "Active Listings",
                    value: String(stats.activeListings),
                    icon: "list_alt",
                  },
                  {
                    label: "Total Views",
                    value: new Intl.NumberFormat("en-US").format(
                      stats.totalViews,
                    ),
                    icon: "visibility",
                  },
                  {
                    label: "Open Inquiries",
                    value: String(stats.openInquiries),
                    icon: "forum",
                  },
                  {
                    label: "Upcoming Appointments",
                    value: String(stats.upcomingAppointments),
                    icon: "event",
                  },
                ]
              : []
          }
        />
      )}

      <div className="grid grid-cols-1 gap-md lg:grid-cols-2">
        <ActivityFeed activity={activity} />
        <div className="flex flex-col gap-md">
          <ListingsSnapshot listings={listings} />
          <UpcomingAppointments appointments={appointments} />
        </div>
      </div>
    </div>
  );
}
