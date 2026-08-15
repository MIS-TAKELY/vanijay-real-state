"use client";

import { Icon, cn } from "@repo/ui";
import type { ApiPropertyMedia } from "lib/api/services/properties/types";
import { useState } from "react";
import { ListingVideo } from "./ListingVideo";
import { VideoPoster } from "./VideoPoster";

interface ListingVideoSectionProps {
  videos: ApiPropertyMedia[];
  title: string;
}

/**
 * Dedicated video walkthrough section.
 * Separated from the photo gallery because video serves a distinct purpose:
 * experiencing spatial flow, not viewing static scenes.
 *
 * Uses a cinematic letterbox ratio (21:9) as its signature visual treatment,
 * distinguishing motion content from the standard 16:9 photo frames.
 */
export function ListingVideoSection({
  videos,
  title,
}: ListingVideoSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (videos.length === 0) return null;

  const activeVideo = videos[activeIndex];
  if (!activeVideo) return null;

  const hasMultiple = videos.length > 1;

  return (
    <section className="mt-10">
      {/* Section header */}
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="font-headline-md text-xl font-semibold tracking-tight text-on-surface">
          Walkthrough
        </h2>
        {hasMultiple && (
          <span className="mono-stat text-xs text-on-surface-variant">
            {activeIndex + 1} of {videos.length}
          </span>
        )}
      </div>

      {/* Player — ListingVideo picks its own aspect ratio per platform */}
      <div className="relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-container shadow-sm">
        <ListingVideo
          url={activeVideo.url}
          title={activeVideo.altText ?? `${title} — video walkthrough`}
        />
      </div>

      {/* Thumbnail strip for multiple videos */}
      {hasMultiple && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {videos.map((video, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={`vid-thumb-${idx}`}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "group relative flex-shrink-0 overflow-hidden rounded-lg border transition-all",
                  "w-28 sm:w-36",
                  isActive
                    ? "border-primary ring-1 ring-primary/30"
                    : "border-outline-variant opacity-70 hover:border-primary/40 hover:opacity-100",
                )}
                aria-label={`Play video ${idx + 1}`}
                aria-pressed={isActive}
              >
                <div className="aspect-video bg-surface-container">
                  <VideoPoster
                    url={video.url}
                    alt={video.altText ?? `Video ${idx + 1} thumbnail`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity group-hover:bg-black/30">
                    <Icon
                      name="play_circle"
                      className={cn(
                        "text-[24px] text-white drop-shadow-md",
                        isActive && "text-primary",
                      )}
                    />
                  </div>
                </div>
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Contextual note */}
      <p className="mt-3 text-xs leading-5 text-on-surface-variant">
        Video walkthroughs show the property as-is. Verify dimensions and
        condition during your site visit.
      </p>
    </section>
  );
}
