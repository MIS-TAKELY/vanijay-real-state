"use client";

import { Button, Icon, cn } from "@repo/ui";
import type { ApiPropertyMedia } from "lib/api/services/properties/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { ListingVideo } from "./ListingVideo";
import { VideoPoster } from "./VideoPoster";

export type GalleryImage = {
  url: string;
  altText?: string | null;
};

type ListingGalleryProps = {
  images: GalleryImage[];
  videos?: ApiPropertyMedia[];
  /** Cadastral maps (Naksa) — the only documents shown on the listing page. */
  cadastralMaps?: ApiPropertyMedia[];
  title: string;
  fallbackGradient: string;
};

export function ListingGallery({
  images,
  videos = [],
  cadastralMaps = [],
  title,
  fallbackGradient,
}: ListingGalleryProps) {
  const hasImages = images.length > 0;
  const hasVideos = videos.length > 0;
  const hasDocs = cadastralMaps.length > 0;

  const [activeTab, setActiveTab] = useState<"photos" | "videos" | "documents">(
    hasImages ? "photos" : hasVideos ? "videos" : "documents",
  );
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageSrc, setLightboxImageSrc] = useState<string | null>(null);
  const [lightboxCaption, setLightboxCaption] = useState<string | null>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const thumbStripRef = useRef<HTMLDivElement>(null);
  const photoTrackRef = useRef<HTMLDivElement>(null);
  const trackPhotosTabRef = useRef<boolean | null>(null);
  // Tracks whether a scroll-teleport is in progress to avoid recursive loops.
  const teleportingRef = useRef(false);

  // Video / Doc swipe detection state.
  const videoSwipeRef = useRef<number | null>(null);
  const docSwipeRef = useRef<number | null>(null);

  // --- Infinite photo track helpers ---
  // The track renders [lastClone, ...slides, firstClone] — total = n+2 slots.
  // Slot 0            → clone of last real slide  (sentinel-left)
  // Slots 1 … n       → real slides (index 0 … n-1)
  // Slot n+1          → clone of first real slide (sentinel-right)
  //
  // scrollToPhoto(realIndex) scrolls to slot realIndex+1.
  const scrollToPhoto = useCallback(
    (realIndex: number, animated = true) => {
      if (images.length === 0) return;
      const wrapped =
        ((realIndex % images.length) + images.length) % images.length;
      const track = photoTrackRef.current;
      if (!track || track.clientWidth === 0) {
        setActiveImage(wrapped);
        return;
      }
      // slot index for a real image is realIndex + 1 (because of the left clone)
      track.scrollTo({
        left: (wrapped + 1) * track.clientWidth,
        behavior: animated ? "smooth" : "instant",
      });
    },
    [images.length],
  );

  const showPrevPhoto = useCallback(() => {
    setActiveImage((i) => {
      const next = (i - 1 + images.length) % images.length;
      scrollToPhoto(next);
      return next;
    });
  }, [images.length, scrollToPhoto]);

  const showNextPhoto = useCallback(() => {
    setActiveImage((i) => {
      const next = (i + 1) % images.length;
      scrollToPhoto(next);
      return next;
    });
  }, [images.length, scrollToPhoto]);

  // On scroll-settle: detect when the user has swiped to a sentinel clone and
  // silently teleport back to the real slide so the loop feels infinite.
  const handlePhotoTrackScroll = useCallback(() => {
    const track = photoTrackRef.current;
    if (!track || track.clientWidth === 0) return;
    if (teleportingRef.current) return;

    const slotIndex = Math.round(track.scrollLeft / track.clientWidth);
    const total = images.length + 2; // sentinels on each side

    if (slotIndex === 0) {
      // Swiped left past the first real slide → teleport to last real slide.
      teleportingRef.current = true;
      const realIdx = images.length - 1;
      track.scrollTo({ left: (realIdx + 1) * track.clientWidth, behavior: "instant" });
      setActiveImage(realIdx);
      teleportingRef.current = false;
    } else if (slotIndex === total - 1) {
      // Swiped right past the last real slide → teleport to first real slide.
      teleportingRef.current = true;
      track.scrollTo({ left: track.clientWidth, behavior: "instant" });
      setActiveImage(0);
      teleportingRef.current = false;
    } else {
      setActiveImage(slotIndex - 1);
    }
  }, [images.length]);

  // Declared up here so the track-mount effect below (which runs before the
  // media early-return) can read it without hitting a temporal-dead-zone error.
  const showingPhotos = activeTab === "photos" && hasImages;

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
        return;
      }
      if (activeTab === "photos" && images.length > 1) {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1));
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1));
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, images.length, activeTab]);

  // Focus the close button on open and trap Tab focus inside the dialog.
  useEffect(() => {
    if (!lightboxOpen) return;
    const dialog = lightboxRef.current;
    dialog
      ?.querySelector<HTMLButtonElement>('button[aria-label="Close gallery"]')
      ?.focus();

    const onTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !dialog) return;
      const focusables = dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onTab);
    return () => window.removeEventListener("keydown", onTab);
  }, [lightboxOpen]);

  // Release the body scroll lock if the gallery unmounts while open.
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Keep the active photo thumb visible in the horizontal strip.
  useEffect(() => {
    if (activeTab !== "photos" || images.length <= 1) return;
    const active = thumbStripRef.current?.querySelector<HTMLElement>(
      `[data-thumb-index="${activeImage}"]`,
    );
    active?.scrollIntoView({
      behavior: "smooth",
      inline: "nearest",
      block: "nearest",
    });
  }, [activeImage, activeTab, images.length]);

  // On the very first render, position the track at slot 1 (first real slide)
  // so the left sentinel clone (slot 0) is never visible on load.
  useEffect(() => {
    const track = photoTrackRef.current;
    if (!track || images.length <= 1) return;
    track.scrollTo({ left: track.clientWidth, behavior: "instant" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once on mount only

  // When the photos tab (re)mounts after a tab switch, restore the active slide.
  // Offset by +1 to account for the left sentinel clone.
  useEffect(() => {
    const wasShowingPhotos = trackPhotosTabRef.current;
    trackPhotosTabRef.current = showingPhotos;
    if (wasShowingPhotos === null) return;
    if (wasShowingPhotos === showingPhotos) return;
    if (!showingPhotos) return;
    const track = photoTrackRef.current;
    if (!track || track.clientWidth === 0) return;
    track.scrollTo({
      left: (activeImage + 1) * track.clientWidth,
      behavior: "instant",
    });
  }, [showingPhotos, activeImage, images.length]);

  // Clamp the index if the media list shrinks while viewing.
  useEffect(() => {
    setActiveImage((prev) =>
      Math.min(Math.max(prev, 0), Math.max(images.length - 1, 0)),
    );
  }, [images.length]);

  if (!hasImages && !hasVideos && !hasDocs) {
    return (
      <div
        className={cn(
          "aspect-video overflow-hidden rounded-md bg-gradient-to-br",
          fallbackGradient,
        )}
        aria-label="No media available"
      />
    );
  }

  const showingVideos = activeTab === "videos" && hasVideos;
  const showingDocs = activeTab === "documents" && hasDocs;

  const currentImage = showingPhotos
    ? images[Math.min(activeImage, images.length - 1)]!
    : null;
  const activeVideo = showingVideos ? videos[activeVideoIndex] : null;
  const activeDoc = showingDocs
    ? cadastralMaps[Math.min(activeDocIndex, cadastralMaps.length - 1)]
    : null;

  const docTitle = (() => {
    const raw = activeDoc?.altText?.trim();
    if (!raw) return "Cadastral map";
    // Uploaded screenshots often keep the file name as alt text — show a
    // human label instead of "Screenshot From … .png".
    if (
      /\.(png|jpe?g|webp|gif|pdf)$/i.test(raw) ||
      /^screenshot\b/i.test(raw)
    ) {
      return "Cadastral map";
    }
    return raw;
  })();

  const availableTabsCount =
    (hasImages ? 1 : 0) + (hasVideos ? 1 : 0) + (hasDocs ? 1 : 0);

  const closeLightbox = () => {
    const wasPhotoGallery = !lightboxImageSrc;
    setLightboxOpen(false);
    document.body.style.overflow = "";
    openerRef.current?.focus();
    openerRef.current = null;
    // Re-sync the swipable track with the photo the lightbox settled on.
    if (wasPhotoGallery && showingPhotos && images.length > 1) {
      scrollToPhoto(activeImage);
    }
  };

  const openPhotoLightbox = () => {
    openerRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    setLightboxImageSrc(null);
    setLightboxCaption(null);
    setLightboxOpen(true);
  };

  const openDocLightbox = () => {
    if (!activeDoc) return;
    openerRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    setLightboxImageSrc(activeDoc.url);
    setLightboxCaption(activeDoc.altText ?? "Naksa (Cadastral Map)");
    setLightboxOpen(true);
  };

  const openPhotoLightboxAt = (index: number) => {
    setActiveImage(index);
    openPhotoLightbox();
  };

  const tabButtonClass = (isActive: boolean) =>
    cn(
      "inline-flex h-7 min-h-7 min-w-0 flex-1 items-center justify-center gap-1 rounded-sm px-1.5 text-xs font-medium transition-colors duration-150",
      "@min-[22rem]:gap-1.5 @min-[22rem]:px-2 @min-[28rem]:px-2.5 @min-[28rem]:text-sm",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
      isActive
        ? "bg-primary text-on-primary shadow-xs"
        : "text-on-surface-variant hover:bg-surface/70 hover:text-on-surface",
    );

  return (
    <section className="@container min-w-0">
      {/* Title + media-type tabs share one responsive header */}
      <header className="mb-2 flex min-w-0 flex-col gap-2.5 @min-[36rem]:mb-3 @min-[36rem]:flex-row @min-[36rem]:items-center @min-[36rem]:justify-between @min-[36rem]:gap-3">
        <div className="flex min-w-0 shrink-0 items-center justify-between gap-2 @min-[36rem]:justify-start">
          <h2 className="font-headline-md text-base font-semibold tracking-tight text-navy @min-[22rem]:text-lg">
            <span className="@max-[19.9rem]:hidden">Media &amp; Documents</span>
            <span className="hidden @max-[19.9rem]:inline">Media</span>
          </h2>
          {availableTabsCount === 1 && (
            <span className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant">
              {hasImages && (
                <>
                  <Icon name="photo_library" className="text-[16px]" />
                  <span className="tabular-nums">
                    {images.length} photo{images.length === 1 ? "" : "s"}
                  </span>
                </>
              )}
              {hasVideos && (
                <>
                  <Icon name="videocam" className="text-[16px]" />
                  <span className="tabular-nums">
                    {videos.length} video{videos.length === 1 ? "" : "s"}
                  </span>
                </>
              )}
              {hasDocs && (
                <>
                  <Icon name="map" className="text-[16px]" />
                  <span className="tabular-nums">
                    {cadastralMaps.length} naksa
                    {cadastralMaps.length === 1 ? "" : "s"}
                  </span>
                </>
              )}
            </span>
          )}
        </div>

        {availableTabsCount > 1 && (
          <div
            role="tablist"
            aria-label="Media type"
            onKeyDown={(e) => {
              const order: Array<"photos" | "videos" | "documents"> = [];
              if (hasImages) order.push("photos");
              if (hasVideos) order.push("videos");
              if (hasDocs) order.push("documents");
              if (order.length === 0) return;
              const idx = order.indexOf(activeTab);
              if (e.key === "ArrowRight") {
                e.preventDefault();
                setActiveTab(order[(idx + 1) % order.length]!);
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                setActiveTab(order[(idx - 1 + order.length) % order.length]!);
              }
            }}
            className="flex w-full min-w-0 flex-nowrap gap-0.5 rounded-sm bg-surface-container p-1 @min-[28rem]:gap-1 @min-[36rem]:ml-auto @min-[36rem]:w-auto @min-[36rem]:min-w-[min(100%,18rem)] @min-[36rem]:max-w-lg @min-[36rem]:flex-1"
          >
            {hasImages && (
              <button
                type="button"
                role="tab"
                id="tab-photos"
                aria-label={`Photos ${images.length}`}
                aria-selected={activeTab === "photos"}
                aria-controls="panel-photos"
                tabIndex={activeTab === "photos" ? 0 : -1}
                onClick={() => setActiveTab("photos")}
                className={tabButtonClass(activeTab === "photos")}
              >
                <Icon
                  name="photo_library"
                  className="shrink-0 text-[16px] @min-[22rem]:text-[18px]"
                  aria-hidden
                />
                <span className="truncate @max-[17.9rem]:hidden">Photos</span>
                <span className="shrink-0 tabular-nums opacity-80">
                  {images.length}
                </span>
              </button>
            )}
            {hasVideos && (
              <button
                type="button"
                role="tab"
                id="tab-videos"
                aria-label={`Videos ${videos.length}`}
                aria-selected={activeTab === "videos"}
                aria-controls="panel-videos"
                tabIndex={activeTab === "videos" ? 0 : -1}
                onClick={() => setActiveTab("videos")}
                className={tabButtonClass(activeTab === "videos")}
              >
                <Icon
                  name="videocam"
                  className="shrink-0 text-[16px] @min-[22rem]:text-[18px]"
                  aria-hidden
                />
                <span className="truncate @max-[17.9rem]:hidden">Videos</span>
                <span className="shrink-0 tabular-nums opacity-80">
                  {videos.length}
                </span>
              </button>
            )}
            {hasDocs && (
              <button
                type="button"
                role="tab"
                id="tab-documents"
                aria-label={`Documents ${cadastralMaps.length}`}
                aria-selected={activeTab === "documents"}
                aria-controls="panel-documents"
                tabIndex={activeTab === "documents" ? 0 : -1}
                onClick={() => setActiveTab("documents")}
                className={tabButtonClass(activeTab === "documents")}
              >
                <Icon
                  name="map"
                  className="shrink-0 text-[16px] @min-[22rem]:text-[18px]"
                  aria-hidden
                />
                <span className="truncate @max-[17.9rem]:hidden">
                  <span className="@min-[28rem]:hidden">Docs</span>
                  <span className="hidden @min-[28rem]:inline">Documents</span>
                </span>
                <span className="shrink-0 tabular-nums opacity-80">
                  {cadastralMaps.length}
                </span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Photos View */}
      {showingPhotos && currentImage && (
        <div
          role="tabpanel"
          id="panel-photos"
          aria-labelledby="tab-photos"
          className="flex min-w-0 flex-col-reverse gap-2 sm:flex-row sm:items-stretch sm:gap-3"
        >
          {images.length > 1 && (
            <div
              ref={thumbStripRef}
              className="no-scrollbar flex w-full flex-row gap-2 overflow-x-auto overscroll-x-contain py-1 snap-x sm:w-20 sm:shrink-0 sm:flex-col sm:overflow-y-auto sm:overscroll-y-contain sm:snap-y sm:py-0.5"
              aria-label="Photo thumbnails"
            >
              {images.map((image, idx) => (
                <button
                  key={`thumb-${image.url}-${idx}`}
                  type="button"
                  data-thumb-index={idx}
                  onClick={() => scrollToPhoto(idx)}
                  className={cn(
                    "relative aspect-[4/3] w-14 sm:w-full shrink-0 snap-start overflow-hidden rounded-sm border bg-surface-container transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    idx === activeImage
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-outline-variant/80 opacity-75 hover:border-primary/35 hover:opacity-100",
                  )}
                  aria-label={`View photo ${idx + 1}`}
                  aria-pressed={idx === activeImage}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt=""
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="relative w-full min-w-0 flex-1 aspect-[4/3] overflow-hidden rounded-sm border border-outline-variant bg-surface-container sm:aspect-[16/11]">
            {/* Infinite swipeable slider — renders [lastClone, ...slides, firstClone]
                so native scroll-snap can loop seamlessly. On settling at either
                sentinel the onScroll handler instantly teleports to the real slide. */}
            <div
              ref={photoTrackRef}
              onScroll={handlePhotoTrackScroll}
              aria-label="Photo viewer — swipe to browse"
              className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                touchAction: "pan-x pan-y pinch-zoom",
              }}
            >
              {/* Left sentinel — clone of last slide */}
              {images.length > 1 && (() => {
                const clone = images[images.length - 1]!;
                return (
                  <div
                    aria-hidden
                    className="relative h-full w-full shrink-0 snap-start"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={clone.url}
                      alt=""
                      draggable={false}
                      className="h-full w-full object-contain"
                    />
                  </div>
                );
              })()}

              {images.map((image, idx) => (
                <button
                  key={`slide-${image.url}-${idx}`}
                  type="button"
                  onClick={() => openPhotoLightboxAt(idx)}
                  className="group relative h-full w-full shrink-0 cursor-zoom-in snap-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
                  aria-label={`Open photo ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt=""
                    loading={idx === activeImage ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.01]"
                  />
                </button>
              ))}

              {/* Right sentinel — clone of first slide */}
              {images.length > 1 && (() => {
                const clone = images[0]!;
                return (
                  <div
                    aria-hidden
                    className="relative h-full w-full shrink-0 snap-start"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={clone.url}
                      alt=""
                      draggable={false}
                      className="h-full w-full object-contain"
                    />
                  </div>
                );
              })()}
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/50 to-transparent px-3 pb-3 pt-12">
              <span className="rounded-sm bg-surface/95 px-2.5 py-1 text-[11px] font-medium tabular-nums text-on-surface shadow-xs backdrop-blur-sm">
                {activeImage + 1} / {images.length}
              </span>
            </div>

            {images.length > 1 && (
              <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 sm:px-3">
                <button
                  type="button"
                  aria-label="Previous photo"
                  className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-sm bg-surface/95 text-on-surface shadow-xs backdrop-blur-sm transition-all duration-150 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95 sm:h-10 sm:w-10"
                  onClick={showPrevPhoto}
                >
                  <Icon name="chevron_left" className="text-[20px]" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-sm bg-surface/95 text-on-surface shadow-xs backdrop-blur-sm transition-all duration-150 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95 sm:h-10 sm:w-10"
                  onClick={showNextPhoto}
                >
                  <Icon name="chevron_right" className="text-[20px]" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={openPhotoLightbox}
              className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-sm bg-surface/95 text-on-surface shadow-xs backdrop-blur-sm transition-all duration-150 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95 sm:right-3 sm:top-3 sm:h-10 sm:w-10"
              aria-label="View all photos"
            >
              <Icon name="fullscreen" className="text-[17px]" />
            </button>
          </div>

        </div>
      )}

      {/* Videos View */}
      {showingVideos && activeVideo && (
        <div
          role="tabpanel"
          id="panel-videos"
          aria-labelledby="tab-videos"
          className="flex min-w-0 flex-col-reverse gap-2 sm:flex-row sm:items-stretch sm:gap-3"
        >
          {videos.length > 1 && (
            <div className="no-scrollbar flex w-full flex-row gap-2 overflow-x-auto overscroll-x-contain py-1 snap-x sm:w-20 sm:shrink-0 sm:flex-col sm:overflow-y-auto sm:overscroll-y-contain sm:snap-y sm:py-0.5" aria-label="Video thumbnails">
              {videos.map((video, idx) => {
                const isActive = idx === activeVideoIndex;
                return (
                  <button
                    key={`vid-thumb-${idx}`}
                    type="button"
                    onClick={() => setActiveVideoIndex(idx)}
                    className={cn(
                      "group relative aspect-[4/3] w-14 sm:w-full shrink-0 snap-start overflow-hidden rounded-sm border bg-surface-container transition-all",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      isActive
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-outline-variant/80 opacity-75 hover:border-primary/35 hover:opacity-100",
                    )}
                    aria-label={`Play video ${idx + 1}`}
                    aria-pressed={isActive}
                  >
                    <VideoPoster
                      url={video.url}
                      alt={video.altText ?? `Video ${idx + 1} thumbnail`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition-opacity group-hover:bg-black/35">
                      <Icon
                        name="play_circle"
                        className={cn(
                          "text-[22px] sm:text-[28px] text-white drop-shadow-md",
                          isActive && "text-primary",
                        )}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          <div
            className="relative w-full min-w-0 flex-1 overflow-hidden rounded-sm border border-outline-variant bg-surface-container"
            onTouchStart={(e) => { videoSwipeRef.current = e.touches[0]?.clientX ?? null; }}
            onTouchEnd={(e) => {
              const startX = videoSwipeRef.current;
              if (startX === null) return;
              const dx = (e.changedTouches[0]?.clientX ?? startX) - startX;
              if (Math.abs(dx) < 40) return;
              setActiveVideoIndex((i) =>
                dx < 0
                  ? (i + 1) % videos.length
                  : (i - 1 + videos.length) % videos.length,
              );
              videoSwipeRef.current = null;
            }}
          >
            <ListingVideo
              url={activeVideo.url}
              title={activeVideo.altText ?? `${title} — video walkthrough`}
            />
            {videos.length > 1 && (
              <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
                <button
                  type="button"
                  aria-label="Previous video"
                  className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-sm bg-surface/90 text-on-surface shadow-xs backdrop-blur-sm transition-all duration-150 hover:bg-surface active:scale-95"
                  onClick={() => setActiveVideoIndex((i) => (i - 1 + videos.length) % videos.length)}
                >
                  <Icon name="chevron_left" className="text-[20px]" />
                </button>
                <button
                  type="button"
                  aria-label="Next video"
                  className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-sm bg-surface/90 text-on-surface shadow-xs backdrop-blur-sm transition-all duration-150 hover:bg-surface active:scale-95"
                  onClick={() => setActiveVideoIndex((i) => (i + 1) % videos.length)}
                >
                  <Icon name="chevron_right" className="text-[20px]" />
                </button>
              </div>
            )}
          </div>

          <p className="text-xs leading-5 text-on-surface-variant">
            Video walkthroughs show the property as-is. Verify dimensions and
            condition during your site visit.
          </p>
        </div>
      )}

      {/* Documents View — naksa (cadastral map) only */}
      {showingDocs && activeDoc && (
        <div
          role="tabpanel"
          id="panel-documents"
          aria-labelledby="tab-documents"
          className="flex min-w-0 flex-col-reverse gap-2 sm:flex-row sm:items-stretch sm:gap-3"
        >
          {cadastralMaps.length > 1 && (
            <div className="no-scrollbar flex w-full flex-row gap-2 overflow-x-auto overscroll-x-contain py-1 snap-x sm:w-20 sm:shrink-0 sm:flex-col sm:overflow-y-auto sm:overscroll-y-contain sm:snap-y sm:py-0.5" aria-label="Naksa thumbnails">
              {cadastralMaps.map((map, idx) => {
                const isActive = idx === activeDocIndex;
                return (
                  <button
                    key={`naksa-thumb-${map.url}-${idx}`}
                    type="button"
                    onClick={() => setActiveDocIndex(idx)}
                    className={cn(
                      "relative aspect-[4/3] w-14 sm:w-full shrink-0 snap-start overflow-hidden rounded-sm border bg-surface-container transition-all",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      isActive
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-outline-variant/80 opacity-75 hover:border-primary/35 hover:opacity-100",
                    )}
                    aria-label={`View naksa ${idx + 1}`}
                    aria-pressed={isActive}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={map.url}
                      alt=""
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                      className="h-full w-full object-contain p-1"
                    />
                  </button>
                );
              })}
            </div>
          )}
          <div className="min-w-0 flex-1 overflow-hidden rounded-sm border border-outline-variant bg-surface">
            <div className="flex items-center justify-between gap-3 border-b border-outline-variant px-3 py-2.5 sm:px-4">
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex shrink-0 items-center rounded-sm bg-primary/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
                  Naksa
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {cadastralMaps.length > 1 && (
                  <span className="text-xs tabular-nums text-on-surface-variant">
                    {activeDocIndex + 1} / {cadastralMaps.length}
                  </span>
                )}
                <button
                  type="button"
                  onClick={openDocLightbox}
                  className="flex h-9 w-9 items-center justify-center rounded-sm text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label="Open naksa full view"
                >
                  <Icon name="fullscreen" className="text-[17px]" />
                </button>
              </div>
            </div>

            <div
              className="relative"
              onTouchStart={(e) => { docSwipeRef.current = e.touches[0]?.clientX ?? null; }}
              onTouchEnd={(e) => {
                const startX = docSwipeRef.current;
                if (startX === null) return;
                const dx = (e.changedTouches[0]?.clientX ?? startX) - startX;
                if (Math.abs(dx) < 40) return;
                setActiveDocIndex((i) =>
                  dx < 0
                    ? (i + 1) % cadastralMaps.length
                    : (i - 1 + cadastralMaps.length) % cadastralMaps.length,
                );
                docSwipeRef.current = null;
              }}
            >
              <button
                type="button"
                onClick={openDocLightbox}
                className="group relative block aspect-[4/3] w-full cursor-zoom-in bg-surface-container/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 sm:aspect-[16/11]"
                aria-label="Open naksa full view"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeDoc.url}
                  alt={activeDoc.altText ?? "Naksa (Cadastral Map)"}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  className="h-full w-full object-contain p-3 transition-transform duration-200 group-hover:scale-[1.01] sm:p-4"
                />
              </button>
              {cadastralMaps.length > 1 && (
                <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
                  <button
                    type="button"
                    aria-label="Previous document"
                    className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-md bg-surface/90 text-on-surface shadow-md backdrop-blur-sm transition-all duration-150 hover:bg-surface active:scale-95"
                    onClick={() => setActiveDocIndex((i) => (i - 1 + cadastralMaps.length) % cadastralMaps.length)}
                  >
                    <Icon name="chevron_left" className="text-[22px]" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next document"
                    className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-md bg-surface/90 text-on-surface shadow-md backdrop-blur-sm transition-all duration-150 hover:bg-surface active:scale-95"
                    onClick={() => setActiveDocIndex((i) => (i + 1) % cadastralMaps.length)}
                  >
                    <Icon name="chevron_right" className="text-[22px]" />
                  </button>
                </div>
              )}
            </div>
          </div>


          <p className="text-xs leading-5 text-on-surface-variant">
            Naksa (cadastral map) is a public land record showing the parcel
            boundaries. Verify it during your site visit.
          </p>
        </div>
      )}

      {/* Lightbox Dialog */}
      {lightboxOpen && (currentImage || lightboxImageSrc) && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Media gallery viewer"
          ref={lightboxRef}
          className="fixed inset-0 z-50 flex flex-col bg-on-surface/95 p-4 sm:p-6 backdrop-blur-md"
          onClick={closeLightbox}
        >
          <div className="mb-3 flex items-center justify-between text-surface">
            <p className="text-sm font-medium tabular-nums">
              {lightboxImageSrc
                ? (lightboxCaption ?? "Naksa (Cadastral Map)")
                : `${activeImage + 1} of ${images.length} photos`}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close gallery"
              className="text-surface hover:bg-surface/10"
              onClick={closeLightbox}
            >
              <Icon name="close" className="text-[22px]" />
            </Button>
          </div>

          <div
            className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 items-center gap-3 sm:gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {!lightboxImageSrc && images.length > 1 && (
              <button
                type="button"
                aria-label="Previous photo"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface text-on-surface shadow-md transition-all duration-150 hover:bg-surface-container hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95"
                onClick={showPrevPhoto}
              >
                <Icon name="chevron_left" className="text-[24px]" />
              </button>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxImageSrc ?? (currentImage ? currentImage.url : "")}
              alt={lightboxCaption ?? currentImage?.altText ?? title}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              className="mx-auto max-h-full min-w-0 flex-1 rounded-lg object-contain"
            />

            {!lightboxImageSrc && images.length > 1 && (
              <button
                type="button"
                aria-label="Next photo"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface text-on-surface shadow-md transition-all duration-150 hover:bg-surface-container hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95"
                onClick={showNextPhoto}
              >
                <Icon name="chevron_right" className="text-[24px]" />
              </button>
            )}
          </div>

          {!lightboxImageSrc && images.length > 1 && (
            <div
              className="mx-auto mt-3 grid max-w-5xl grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((image, idx) => (
                <button
                  key={`lb-${image.url}-${idx}`}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  aria-label={`View photo ${idx + 1}`}
                  aria-current={idx === activeImage ? "true" : undefined}
                  className={cn(
                    "aspect-video overflow-hidden rounded-md transition-all",
                    idx === activeImage
                      ? "ring-2 ring-primary"
                      : "opacity-70 hover:opacity-100",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt=""
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
