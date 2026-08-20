import { SITE_URL } from "lib/site";
import type { Metadata } from "next";
import ComparePage from "./compare-client";

// Server component wrapper: metadata must be exported from a Server Component,
// while the compare UI itself (search params, zustand store) is client-side.
export const metadata: Metadata = {
  title: "Compare Properties Side by Side | MALPOTH",
  description:
    "Compare verified land and property listings in Nepal side by side — price, area, road access, facing and verification status in one table.",
  keywords: [
    "compare properties Nepal",
    "compare land listings Kathmandu",
    "property comparison tool Nepal",
  ],
  alternates: { canonical: "/compare" },
  openGraph: {
    title: "Compare Properties Side by Side | MALPOTH",
    description:
      "Put verified listings side by side — price, area, road access and verification status in one table.",
    url: `${SITE_URL}/compare`,
    siteName: "MALPOTH",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default ComparePage;