"use client";

import { ListingGallery } from "components/real-state/pages/listing/ListingGallery";

// 1x1 PNG data URL (blue so it's visible against the navy backdrop)
const BLUE_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const images = [
  { url: BLUE_PIXEL, altText: "Photo 1" },
  { url: BLUE_PIXEL, altText: "Photo 2" },
  { url: BLUE_PIXEL, altText: "Photo 3" },
];

export default function GalleryTestPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5">
      <ListingGallery
        images={images}
        title="Test Property"
        fallbackGradient="from-navy-deep to-primary"
      />
    </main>
  );
}