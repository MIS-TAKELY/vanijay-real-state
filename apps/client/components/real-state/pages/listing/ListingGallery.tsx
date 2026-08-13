"use client";

import { Button, Icon, cn } from "@repo/ui";
import { useState } from "react";

export type GalleryImage = {
  url: string;
  altText?: string | null;
};

type ListingGalleryProps = {
  images: GalleryImage[];
  title: string;
  fallbackGradient: string;
};

export function ListingGallery({
  images,
  title,
  fallbackGradient,
}: ListingGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div
        className={cn(
          "aspect-video overflow-hidden rounded-2xl bg-gradient-to-br",
          fallbackGradient,
        )}
        aria-label="No photos available"
      />
    );
  }

  const current = images[Math.min(active, images.length - 1)]!;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-surface-container">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={current.altText ?? title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/55 to-transparent px-3 pb-3 pt-10">
          <span className="rounded-md bg-surface/95 px-2 py-1 text-[11px] font-medium text-on-surface">
            {active + 1} / {images.length}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 rounded-md bg-surface/95 text-xs font-semibold text-on-surface hover:bg-surface"
            onClick={() => setLightboxOpen(true)}
          >
            <Icon name="photo_camera" className="text-[16px]" />
            View all photos
          </Button>
        </div>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
          {images.map((image, idx) => (
            <button
              key={`${image.url}-${idx}`}
              type="button"
              onClick={() => setActive(idx)}
              aria-label={`Show photo ${idx + 1}`}
              aria-current={idx === active}
              className={cn(
                "aspect-video overflow-hidden rounded-lg bg-surface-container ring-offset-2 ring-offset-surface transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                idx === active
                  ? "ring-2 ring-primary"
                  : "opacity-80 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.altText ?? `${title} photo ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="All listing photos"
          className="fixed inset-0 z-50 flex flex-col bg-on-surface/90 p-4 sm:p-6"
          onClick={() => setLightboxOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setLightboxOpen(false);
          }}
        >
          <div className="mb-4 flex items-center justify-between text-surface">
            <p className="text-sm font-medium">
              {active + 1} of {images.length} photos
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close gallery"
              className="text-surface hover:bg-surface/10"
              onClick={() => setLightboxOpen(false)}
            >
              <Icon name="close" className="text-[22px]" />
            </Button>
          </div>

          <div
            className="relative mx-auto flex min-h-0 w-full max-w-5xl flex-1 items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {images.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Previous photo"
                className="absolute left-0 z-10 text-surface hover:bg-surface/10 sm:left-2"
                onClick={() =>
                  setActive((i) => (i === 0 ? images.length - 1 : i - 1))
                }
              >
                <Icon name="chevron_left" className="text-[28px]" />
              </Button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.url}
              alt={current.altText ?? title}
              className="max-h-full max-w-full rounded-lg object-contain"
            />
            {images.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Next photo"
                className="absolute right-0 z-10 text-surface hover:bg-surface/10 sm:right-2"
                onClick={() =>
                  setActive((i) => (i === images.length - 1 ? 0 : i + 1))
                }
              >
                <Icon name="chevron_right" className="text-[28px]" />
              </Button>
            )}
          </div>

          <div
            className="mx-auto mt-4 grid max-w-5xl grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((image, idx) => (
              <button
                key={`lb-${image.url}-${idx}`}
                type="button"
                onClick={() => setActive(idx)}
                className={cn(
                  "aspect-video overflow-hidden rounded-md",
                  idx === active ? "ring-2 ring-primary" : "opacity-70",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
