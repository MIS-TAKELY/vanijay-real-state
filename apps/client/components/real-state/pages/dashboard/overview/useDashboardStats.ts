"use client";

import type { DashboardStats } from "lib/api/services/dashboard";
import { fetchDashboardOverview } from "lib/api/services/dashboard";
import { useEffect, useState } from "react";

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchDashboardOverview()
      .then((overview) => {
        if (!cancelled) setStats(overview.stats);
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
}
