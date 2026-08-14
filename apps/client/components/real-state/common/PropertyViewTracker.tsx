"use client";

import { useEffect } from "react";
import { trackPropertyView } from "lib/api/services/analytics";

export function PropertyViewTracker({ propertyId }: { propertyId: string }) {
  useEffect(() => {
    // Track view once on mount
    trackPropertyView(propertyId).catch(() => {
      // Silently fail - analytics should not break the UI
      console.log("tracking fail")
    });
  }, [propertyId]);

  return null;
}
