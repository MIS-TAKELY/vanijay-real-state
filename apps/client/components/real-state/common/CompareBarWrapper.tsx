"use client";

import { usePathname } from "next/navigation";
import { CompareBar } from "./CompareBar";

/**
 * Wraps CompareBar so it is hidden on the /compare page itself,
 * where the floating bar would be redundant with the comparison table.
 */
export function CompareBarWrapper() {
  const pathname = usePathname();
  if (pathname === "/compare") return null;
  return <CompareBar />;
}
