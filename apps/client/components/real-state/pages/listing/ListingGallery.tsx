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
  /** Cadastral maps (Naksa) — the documents shown on the listing page. */
  cadastralMaps?: ApiPropertyMedia[];
  title: string;
  fallbackGradient: string;
};

type MediaType = "photos" | "videos" | "documents";

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

  const defaultTab: MediaType = hasImages
    ? "photos"
    : hasVideos
      ? "videos"
      : "documents";

  const [activeTab, setActiveTab] = useState<MediaType>(defaultTab);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [activeDocIndex, setActiveDocIndex] = useState(0);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxTab, setLightboxTab] = useState<MediaType>("photos");
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Deep zoom & pan state for Lightbox
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // DOM Refs
  const thumbStripRef = useRef<HTMLDivElement>(null);
  const docThumbStripRef = useRef<HTMLDivElement>(null);
  const videoThumbStripRef = useRef<HTMLDivElement>(null);
  const lightboxThumbStripRef = useRef<HTMLDivElement>(null);
  const lightboxContainerRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  // Touch gesture state for main card carousel
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );
  const touchDeltaRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Touch & Pan refs for Lightbox
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panCurrentOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lightboxTouchStartRef = useRef<{
    x: number;
    y: number;
    time: number;
  } | null>(null);

  // Reset zoom & pan when switching items in lightbox
  const resetZoom = useCallback(() => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setRotation(0);
    panCurrentOffsetRef.current = { x: 0, y: 0 };
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomScale((prev) => Math.min(prev + 0.5, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) {
        setPanOffset({ x: 0, y: 0 });
        panCurrentOffsetRef.current = { x: 0, y: 0 };
      }
      return next;
    });
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const toggleDoubleTapZoom = useCallback(
    (clientX?: number, clientY?: number) => {
      setZoomScale((prev) => {
        if (prev > 1) {
          setPanOffset({ x: 0, y: 0 });
          panCurrentOffsetRef.current = { x: 0, y: 0 };
          return 1;
        } else {
          // Double-click/tap zoom in to 2.5x
          if (clientX != null && clientY != null) {
            // Slight bias towards click position
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const offsetX = (centerX - clientX) * 0.75;
            const offsetY = (centerY - clientY) * 0.75;
            setPanOffset({ x: offsetX, y: offsetY });
            panCurrentOffsetRef.current = { x: offsetX, y: offsetY };
          }
          return 2.5;
        }
      });
    },
    [],
  );

  // Toggle browser fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      if (lightboxContainerRef.current?.requestFullscreen) {
        lightboxContainerRef.current.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Slide navigation for main photo carousel
  const nextPhoto = useCallback(() => {
    if (images.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevPhoto = useCallback(() => {
    if (images.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Lightbox opening/closing
  const openLightbox = useCallback((tab: MediaType, index = 0) => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setLightboxTab(tab);
    setLightboxIndex(index);
    resetZoom();
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  }, [resetZoom]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    resetZoom();
    document.body.style.overflow = "";
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    // Sync main card indices with where the lightbox ended
    if (lightboxTab === "photos") {
      setActiveImageIndex(lightboxIndex);
    } else if (lightboxTab === "documents") {
      setActiveDocIndex(lightboxIndex);
    } else if (lightboxTab === "videos") {
      setActiveVideoIndex(lightboxIndex);
    }
    openerRef.current?.focus();
    openerRef.current = null;
  }, [lightboxIndex, lightboxTab, resetZoom]);

  // Lightbox next/prev navigation
  const getLightboxMediaCount = useCallback(() => {
    if (lightboxTab === "photos") return images.length;
    if (lightboxTab === "documents") return cadastralMaps.length;
    if (lightboxTab === "videos") return videos.length;
    return 0;
  }, [cadastralMaps.length, images.length, lightboxTab, videos.length]);

  const nextLightboxItem = useCallback(() => {
    const count = getLightboxMediaCount();
    if (count <= 1) return;
    resetZoom();
    setLightboxIndex((prev) => (prev + 1) % count);
  }, [getLightboxMediaCount, resetZoom]);

  const prevLightboxItem = useCallback(() => {
    const count = getLightboxMediaCount();
    if (count <= 1) return;
    resetZoom();
    setLightboxIndex((prev) => (prev - 1 + count) % count);
  }, [getLightboxMediaCount, resetZoom]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
        return;
      }

      if (e.key === "ArrowLeft") {
        if (zoomScale <= 1) {
          e.preventDefault();
          prevLightboxItem();
        }
      } else if (e.key === "ArrowRight") {
        if (zoomScale <= 1) {
          e.preventDefault();
          nextLightboxItem();
        }
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        resetZoom();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleRotate();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    lightboxOpen,
    zoomScale,
    closeLightbox,
    prevLightboxItem,
    nextLightboxItem,
    handleZoomIn,
    handleZoomOut,
    resetZoom,
    handleRotate,
    toggleFullscreen,
  ]);

  // Lock body scroll cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Smooth scroll active thumbnail into view in card thumbnail strip (container only)
  useEffect(() => {
    if (activeTab === "photos" && thumbStripRef.current) {
      const container = thumbStripRef.current;
      const activeEl = container.querySelector<HTMLElement>(
        `[data-thumb-index="${activeImageIndex}"]`,
      );
      if (activeEl) {
        const cRect = container.getBoundingClientRect();
        const aRect = activeEl.getBoundingClientRect();
        // Horizontal scroll
        if (container.scrollWidth > container.clientWidth) {
          const leftDiff = aRect.left - cRect.left;
          if (leftDiff < 0 || leftDiff + aRect.width > cRect.width) {
            container.scrollTo({
              left:
                container.scrollLeft +
                leftDiff -
                cRect.width / 2 +
                aRect.width / 2,
              behavior: "smooth",
            });
          }
        }
        // Vertical scroll
        if (container.scrollHeight > container.clientHeight) {
          const topDiff = aRect.top - cRect.top;
          if (topDiff < 0 || topDiff + aRect.height > cRect.height) {
            container.scrollTo({
              top:
                container.scrollTop +
                topDiff -
                cRect.height / 2 +
                aRect.height / 2,
              behavior: "smooth",
            });
          }
        }
      }
    }
  }, [activeImageIndex, activeTab]);

  // Smooth scroll active thumbnail in Lightbox filmstrip
  useEffect(() => {
    if (lightboxOpen && lightboxThumbStripRef.current) {
      const container = lightboxThumbStripRef.current;
      const activeEl = container.querySelector<HTMLElement>(
        `[data-lb-thumb-index="${lightboxIndex}"]`,
      );
      if (activeEl) {
        const cRect = container.getBoundingClientRect();
        const aRect = activeEl.getBoundingClientRect();
        const leftDiff = aRect.left - cRect.left;
        container.scrollTo({
          left:
            container.scrollLeft + leftDiff - cRect.width / 2 + aRect.width / 2,
          behavior: "smooth",
        });
      }
    }
  }, [lightboxIndex, lightboxOpen, lightboxTab]);

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

  const showingPhotos = activeTab === "photos" && hasImages;
  const showingVideos = activeTab === "videos" && hasVideos;
  const showingDocs = activeTab === "documents" && hasDocs;

  const currentImage = showingPhotos
    ? images[Math.min(activeImageIndex, images.length - 1)]!
    : null;
  const activeVideo = showingVideos ? videos[activeVideoIndex] : null;
  const activeDoc = showingDocs
    ? cadastralMaps[Math.min(activeDocIndex, cadastralMaps.length - 1)]
    : null;

  const availableTabsCount =
    (hasImages ? 1 : 0) + (hasVideos ? 1 : 0) + (hasDocs ? 1 : 0);

  const tabButtonClass = (isActive: boolean) =>
    cn(
      "inline-flex h-8 min-h-8 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-sm px-2 text-xs font-semibold transition-all duration-150",
      "@min-[22rem]:px-2.5 @min-[28rem]:px-3 @min-[28rem]:text-sm",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
      isActive
        ? "bg-primary text-on-primary shadow-xs"
        : "text-on-surface-variant hover:bg-surface/80 hover:text-on-surface",
    );

  // Get current active item in Lightbox
  const lightboxCurrentMedia = (() => {
    if (lightboxTab === "photos") {
      const item = images[lightboxIndex];
      return {
        url: item?.url || "",
        alt: item?.altText || `${title} - Photo ${lightboxIndex + 1}`,
        type: "photo" as const,
      };
    }
    if (lightboxTab === "documents") {
      const item = cadastralMaps[lightboxIndex];
      return {
        url: item?.url || "",
        alt: item?.altText || `Naksa (Cadastral Map) ${lightboxIndex + 1}`,
        type: "document" as const,
      };
    }
    if (lightboxTab === "videos") {
      const item = videos[lightboxIndex];
      return {
        url: item?.url || "",
        alt: item?.altText || `Video walkthrough ${lightboxIndex + 1}`,
        type: "video" as const,
      };
    }
    return { url: "", alt: "", type: "photo" as const };
  })();

  return (
    <section className="@container min-w-0">
      {/* Header with Title & Media Tabs */}
      <header className="mb-2 flex min-w-0 flex-col gap-2.5 @min-[36rem]:mb-3 @min-[36rem]:flex-row @min-[36rem]:items-center @min-[36rem]:justify-between @min-[36rem]:gap-3">
        <div className="flex min-w-0 shrink-0 items-center justify-between gap-2 @min-[36rem]:justify-start">
          <h2 className="font-headline-md text-base font-semibold tracking-tight text-navy @min-[22rem]:text-lg">
            <span className="@max-[19.9rem]:hidden">Media &amp; Documents</span>
            <span className="hidden @max-[19.9rem]:inline">Media</span>
          </h2>
          {availableTabsCount === 1 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant sm:text-sm">
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
            className="flex w-full min-w-0 flex-nowrap gap-1 rounded-md bg-surface-container p-1 shadow-2xs @min-[36rem]:ml-auto @min-[36rem]:w-auto @min-[36rem]:min-w-[min(100%,19rem)] @min-[36rem]:max-w-lg @min-[36rem]:flex-1"
          >
            {hasImages && (
              <button
                type="button"
                role="tab"
                id="tab-photos"
                aria-label={`Photos (${images.length})`}
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
                <span className="shrink-0 tabular-nums opacity-85">
                  ({images.length})
                </span>
              </button>
            )}
            {hasVideos && (
              <button
                type="button"
                role="tab"
                id="tab-videos"
                aria-label={`Videos (${videos.length})`}
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
                <span className="shrink-0 tabular-nums opacity-85">
                  ({videos.length})
                </span>
              </button>
            )}
            {hasDocs && (
              <button
                type="button"
                role="tab"
                id="tab-documents"
                aria-label={`Documents / Naksa (${cadastralMaps.length})`}
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
                  <span className="hidden @min-[28rem]:inline">Naksa / Docs</span>
                </span>
                <span className="shrink-0 tabular-nums opacity-85">
                  ({cadastralMaps.length})
                </span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* ─── PHOTOS VIEW ──────────────────────────────────────────────────────── */}
      {showingPhotos && currentImage && (
        <div
          role="tabpanel"
          id="panel-photos"
          aria-labelledby="tab-photos"
          className="flex min-w-0 flex-col-reverse gap-2 sm:flex-row sm:items-stretch sm:gap-3"
        >
          {/* Thumbnails list */}
          {images.length > 1 && (
            <div
              ref={thumbStripRef}
              className="no-scrollbar flex w-full flex-row gap-2 overflow-x-auto overscroll-x-contain py-1 sm:w-20 sm:shrink-0 sm:flex-col sm:overflow-y-auto sm:overscroll-y-contain sm:py-0.5"
              aria-label="Photo thumbnails"
            >
              {images.map((image, idx) => {
                const isActive = idx === activeImageIndex;
                return (
                  <button
                    key={`photo-thumb-${idx}-${image.url}`}
                    type="button"
                    data-thumb-index={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={cn(
                      "relative aspect-[4/3] w-14 shrink-0 overflow-hidden rounded-sm border bg-surface-container transition-all duration-150 sm:w-full",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      isActive
                        ? "border-primary ring-2 ring-primary/40 opacity-100 shadow-xs"
                        : "border-outline-variant/70 opacity-70 hover:border-primary/40 hover:opacity-100",
                    )}
                    aria-label={`View photo ${idx + 1}`}
                    aria-pressed={isActive}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt=""
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Main Photo Card Carousel */}
          <div
            className="relative aspect-[4/3] w-full min-w-0 flex-1 overflow-hidden rounded-sm border border-outline-variant bg-surface-container select-none sm:aspect-[16/11]"
            onTouchStart={(e) => {
              const t = e.touches[0];
              if (!t) return;
              touchStartRef.current = {
                x: t.clientX,
                y: t.clientY,
                time: Date.now(),
              };
              touchDeltaRef.current = { x: 0, y: 0 };
            }}
            onTouchMove={(e) => {
              const t = e.touches[0];
              if (!t || !touchStartRef.current) return;
              touchDeltaRef.current = {
                x: t.clientX - touchStartRef.current.x,
                y: t.clientY - touchStartRef.current.y,
              };
            }}
            onTouchEnd={() => {
              if (!touchStartRef.current) return;
              const { x: dx, y: dy } = touchDeltaRef.current;
              // Check if horizontal swipe
              if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
                if (dx < 0) {
                  nextPhoto();
                } else {
                  prevPhoto();
                }
              }
              touchStartRef.current = null;
              touchDeltaRef.current = { x: 0, y: 0 };
            }}
          >
            {/* Slide Image Container */}
            <div
              className="relative h-full w-full cursor-zoom-in overflow-hidden"
              onClick={() => openLightbox("photos", activeImageIndex)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={currentImage.url}
                src={currentImage.url}
                alt={currentImage.altText ?? `${title} - photo ${activeImageIndex + 1}`}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                className="h-full w-full object-contain transition-transform duration-250 ease-out hover:scale-[1.01]"
              />
            </div>

            {/* Counter Badge */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/60 via-black/20 to-transparent p-3 pt-8">
              <span className="rounded-sm bg-black/65 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white backdrop-blur-md">
                {activeImageIndex + 1} / {images.length}
              </span>
            </div>

            {/* Left/Right Navigation Arrows */}
            {images.length > 1 && (
              <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 sm:px-3">
                <button
                  type="button"
                  aria-label="Previous photo"
                  className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-sm bg-surface/95 text-on-surface shadow-md backdrop-blur-sm transition-all duration-150 hover:bg-surface hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:h-10 sm:w-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevPhoto();
                  }}
                >
                  <Icon name="chevron_left" className="text-[22px]" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-sm bg-surface/95 text-on-surface shadow-md backdrop-blur-sm transition-all duration-150 hover:bg-surface hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:h-10 sm:w-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextPhoto();
                  }}
                >
                  <Icon name="chevron_right" className="text-[22px]" />
                </button>
              </div>
            )}

            {/* Expand / Lightbox Trigger Button */}
            <button
              type="button"
              onClick={() => openLightbox("photos", activeImageIndex)}
              className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-sm bg-surface/95 text-on-surface shadow-md backdrop-blur-sm transition-all duration-150 hover:bg-surface hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:h-10 sm:w-10"
              aria-label="Open fullscreen gallery"
              title="Open full view"
            >
              <Icon name="fullscreen" className="text-[19px]" />
            </button>
          </div>
        </div>
      )}

      {/* ─── VIDEOS VIEW ──────────────────────────────────────────────────────── */}
      {showingVideos && activeVideo && (
        <div
          role="tabpanel"
          id="panel-videos"
          aria-labelledby="tab-videos"
          className="flex min-w-0 flex-col-reverse gap-2 sm:flex-row sm:items-stretch sm:gap-3"
        >
          {videos.length > 1 && (
            <div
              ref={videoThumbStripRef}
              className="no-scrollbar flex w-full flex-row gap-2 overflow-x-auto overscroll-x-contain py-1 sm:w-20 sm:shrink-0 sm:flex-col sm:overflow-y-auto sm:overscroll-y-contain sm:py-0.5"
              aria-label="Video thumbnails"
            >
              {videos.map((video, idx) => {
                const isActive = idx === activeVideoIndex;
                return (
                  <button
                    key={`vid-thumb-${idx}-${video.url}`}
                    type="button"
                    onClick={() => setActiveVideoIndex(idx)}
                    className={cn(
                      "group relative aspect-[4/3] w-14 shrink-0 overflow-hidden rounded-sm border bg-surface-container transition-all duration-150 sm:w-full",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      isActive
                        ? "border-primary ring-2 ring-primary/40 opacity-100 shadow-xs"
                        : "border-outline-variant/70 opacity-70 hover:border-primary/40 hover:opacity-100",
                    )}
                    aria-label={`Play video ${idx + 1}`}
                    aria-pressed={isActive}
                  >
                    <VideoPoster
                      url={video.url}
                      alt={video.altText ?? `Video ${idx + 1} thumbnail`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity group-hover:bg-black/45">
                      <Icon
                        name="play_circle"
                        className={cn(
                          "text-[22px] text-white drop-shadow-md sm:text-[26px]",
                          isActive && "text-primary",
                        )}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="relative w-full min-w-0 flex-1 overflow-hidden rounded-sm border border-outline-variant bg-surface-container">
            <ListingVideo
              url={activeVideo.url}
              title={activeVideo.altText ?? `${title} — video walkthrough`}
            />

            {videos.length > 1 && (
              <div className="pointer-events-none absolute inset-x-0 bottom-2.5 flex items-center justify-between px-3">
                <button
                  type="button"
                  aria-label="Previous video"
                  className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-sm bg-surface/90 text-on-surface shadow-md backdrop-blur-sm transition-all duration-150 hover:bg-surface active:scale-95"
                  onClick={() =>
                    setActiveVideoIndex(
                      (i) => (i - 1 + videos.length) % videos.length,
                    )
                  }
                >
                  <Icon name="chevron_left" className="text-[18px]" />
                </button>
                <span className="rounded-sm bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                  Video {activeVideoIndex + 1} of {videos.length}
                </span>
                <button
                  type="button"
                  aria-label="Next video"
                  className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-sm bg-surface/90 text-on-surface shadow-md backdrop-blur-sm transition-all duration-150 hover:bg-surface active:scale-95"
                  onClick={() =>
                    setActiveVideoIndex((i) => (i + 1) % videos.length)
                  }
                >
                  <Icon name="chevron_right" className="text-[18px]" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── DOCUMENTS / NAKSA (CADASTRAL MAP) VIEW ──────────────────────────── */}
      {showingDocs && activeDoc && (
        <div
          role="tabpanel"
          id="panel-documents"
          aria-labelledby="tab-documents"
          className="flex min-w-0 flex-col-reverse gap-2 sm:flex-row sm:items-stretch sm:gap-3"
        >
          {cadastralMaps.length > 1 && (
            <div
              ref={docThumbStripRef}
              className="no-scrollbar flex w-full flex-row gap-2 overflow-x-auto overscroll-x-contain py-1 sm:w-20 sm:shrink-0 sm:flex-col sm:overflow-y-auto sm:overscroll-y-contain sm:py-0.5"
              aria-label="Naksa thumbnails"
            >
              {cadastralMaps.map((map, idx) => {
                const isActive = idx === activeDocIndex;
                return (
                  <button
                    key={`naksa-thumb-${idx}-${map.url}`}
                    type="button"
                    onClick={() => setActiveDocIndex(idx)}
                    className={cn(
                      "relative aspect-[4/3] w-14 shrink-0 overflow-hidden rounded-sm border bg-surface transition-all duration-150 sm:w-full",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      isActive
                        ? "border-primary ring-2 ring-primary/40 opacity-100 shadow-xs"
                        : "border-outline-variant/70 opacity-70 hover:border-primary/40 hover:opacity-100",
                    )}
                    aria-label={`View cadastral map ${idx + 1}`}
                    aria-pressed={isActive}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={map.url}
                      alt=""
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      className="h-full w-full object-contain p-1"
                    />
                  </button>
                );
              })}
            </div>
          )}

          <div className="min-w-0 flex-1 overflow-hidden rounded-sm border border-outline-variant bg-surface">
            {/* Top Toolbar inside Document Card */}
            <div className="flex items-center justify-between gap-3 border-b border-outline-variant bg-surface-container/40 px-3.5 py-2 sm:px-4">
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex shrink-0 items-center rounded-sm bg-primary/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-primary">
                  Naksa
                </span>
                <span className="truncate text-xs font-semibold text-navy">
                  Cadastral Map (Parcel Record)
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {cadastralMaps.length > 1 && (
                  <span className="text-xs font-medium tabular-nums text-on-surface-variant">
                    {activeDocIndex + 1} / {cadastralMaps.length}
                  </span>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openLightbox("documents", activeDocIndex)}
                  className="h-7 gap-1 px-2 text-xs font-medium text-navy hover:border-primary hover:text-primary"
                >
                  <Icon name="zoom_in" className="text-[16px]" />
                  <span>Inspect &amp; Zoom</span>
                </Button>
              </div>
            </div>

            {/* Document Interactive Preview Card */}
            <div
              className="group relative aspect-[4/3] w-full cursor-zoom-in bg-surface-container/20 sm:aspect-[16/11]"
              onClick={() => openLightbox("documents", activeDocIndex)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeDoc.url}
                alt={activeDoc.altText ?? "Naksa (Cadastral Map)"}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                className="h-full w-full object-contain p-3 transition-transform duration-200 group-hover:scale-[1.015] sm:p-4"
              />

              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-150 group-hover:bg-black/5">
                <div className="pointer-events-none flex items-center gap-1.5 rounded-sm bg-surface/90 px-3 py-1.5 text-xs font-semibold text-navy shadow-sm backdrop-blur-sm opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <Icon name="zoom_in" className="text-[16px] text-primary" />
                  <span>Click to zoom &amp; inspect boundaries</span>
                </div>
              </div>

              {cadastralMaps.length > 1 && (
                <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
                  <button
                    type="button"
                    aria-label="Previous document"
                    className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-sm bg-surface/95 text-on-surface shadow-md backdrop-blur-sm transition-all duration-150 hover:bg-surface active:scale-95"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDocIndex(
                        (i) =>
                          (i - 1 + cadastralMaps.length) % cadastralMaps.length,
                      );
                    }}
                  >
                    <Icon name="chevron_left" className="text-[20px]" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next document"
                    className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-sm bg-surface/95 text-on-surface shadow-md backdrop-blur-sm transition-all duration-150 hover:bg-surface active:scale-95"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDocIndex(
                        (i) => (i + 1) % cadastralMaps.length,
                      );
                    }}
                  >
                    <Icon name="chevron_right" className="text-[20px]" />
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-outline-variant/60 bg-surface-container/20 px-3.5 py-2">
              <p className="text-[11px] leading-relaxed text-on-surface-variant">
                Naksa (cadastral map) is the official public land record showing
                parcel boundaries and access roads. Click to zoom in high
                resolution.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── FULL-FEATURED UNIFIED LIGHTBOX MODAL ────────────────────────────── */}
      {lightboxOpen && (
        <div
          ref={lightboxContainerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Media Lightbox Viewer"
          className="fixed inset-0 z-50 flex flex-col bg-navy-deep/95 text-surface select-none backdrop-blur-xl animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && zoomScale <= 1) {
              closeLightbox();
            }
          }}
        >
          {/* Top Bar: Title, Category Badge, Zoom Controls, Actions */}
          <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-black/40 px-3.5 py-2.5 backdrop-blur-md sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex shrink-0 items-center rounded-sm bg-primary/25 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                {lightboxTab === "photos"
                  ? "Photo"
                  : lightboxTab === "documents"
                    ? "Naksa"
                    : "Video"}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-surface sm:text-sm">
                  {lightboxCurrentMedia.alt || title}
                </p>
                <p className="text-[11px] font-medium tabular-nums text-surface-variant/80">
                  {lightboxIndex + 1} of {getLightboxMediaCount()}
                </p>
              </div>
            </div>

            {/* Center / Right Controls Toolbar */}
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              {/* Zoom controls for Photos and Documents */}
              {lightboxTab !== "videos" && (
                <div className="flex items-center gap-0.5 rounded-md border border-white/10 bg-white/5 p-0.5">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    disabled={zoomScale <= 1}
                    className="flex h-7 w-7 items-center justify-center rounded-sm text-surface/90 transition-colors hover:bg-white/15 disabled:opacity-30 sm:h-8 sm:w-8"
                    title="Zoom out (-)"
                    aria-label="Zoom out"
                  >
                    <Icon name="zoom_out" className="text-[18px]" />
                  </button>

                  <span className="min-w-[3rem] text-center text-[11px] font-semibold tabular-nums text-surface/90">
                    {Math.round(zoomScale * 100)}%
                  </span>

                  <button
                    type="button"
                    onClick={handleZoomIn}
                    disabled={zoomScale >= 4}
                    className="flex h-7 w-7 items-center justify-center rounded-sm text-surface/90 transition-colors hover:bg-white/15 disabled:opacity-30 sm:h-8 sm:w-8"
                    title="Zoom in (+)"
                    aria-label="Zoom in"
                  >
                    <Icon name="zoom_in" className="text-[18px]" />
                  </button>

                  {zoomScale > 1 && (
                    <button
                      type="button"
                      onClick={resetZoom}
                      className="flex h-7 w-7 items-center justify-center rounded-sm text-surface/90 transition-colors hover:bg-white/15 sm:h-8 sm:w-8"
                      title="Reset zoom (0)"
                      aria-label="Reset zoom"
                    >
                      <Icon name="restart_alt" className="text-[18px]" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleRotate}
                    className="flex h-7 w-7 items-center justify-center rounded-sm text-surface/90 transition-colors hover:bg-white/15 sm:h-8 sm:w-8"
                    title="Rotate 90° (r)"
                    aria-label="Rotate"
                  >
                    <Icon name="rotate_right" className="text-[18px]" />
                  </button>
                </div>
              )}

              {/* Open High-Res in New Tab */}
              {lightboxCurrentMedia.url && (
                <a
                  href={lightboxCurrentMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-surface transition-colors hover:bg-white/15 sm:flex"
                  title="Open original file"
                  aria-label="Open original"
                >
                  <Icon name="open_in_new" className="text-[17px]" />
                </a>
              )}

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="hidden h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-surface transition-colors hover:bg-white/15 sm:flex"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen (f)"}
                aria-label="Toggle fullscreen"
              >
                <Icon
                  name={isFullscreen ? "fullscreen_exit" : "fullscreen"}
                  className="text-[18px]"
                />
              </button>

              {/* Close Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeLightbox}
                className="h-8 w-8 rounded-md bg-white/10 text-white hover:bg-white/20 active:scale-95"
                aria-label="Close viewer (Esc)"
              >
                <Icon name="close" className="text-[20px]" />
              </Button>
            </div>
          </header>

          {/* Main Stage */}
          <div
            className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-2 sm:p-4"
            onWheel={(e) => {
              if (lightboxTab === "videos") return;
              e.preventDefault();
              if (e.deltaY < 0) {
                setZoomScale((prev) => Math.min(prev + 0.25, 4));
              } else if (e.deltaY > 0) {
                setZoomScale((prev) => {
                  const next = Math.max(prev - 0.25, 1);
                  if (next === 1) {
                    setPanOffset({ x: 0, y: 0 });
                    panCurrentOffsetRef.current = { x: 0, y: 0 };
                  }
                  return next;
                });
              }
            }}
            onMouseDown={(e) => {
              if (zoomScale <= 1 || lightboxTab === "videos") return;
              e.preventDefault();
              setIsPanning(true);
              panStartRef.current = {
                x: e.clientX - panOffset.x,
                y: e.clientY - panOffset.y,
              };
            }}
            onMouseMove={(e) => {
              if (!isPanning || zoomScale <= 1) return;
              const newX = e.clientX - panStartRef.current.x;
              const newY = e.clientY - panStartRef.current.y;
              setPanOffset({ x: newX, y: newY });
              panCurrentOffsetRef.current = { x: newX, y: newY };
            }}
            onMouseUp={() => setIsPanning(false)}
            onMouseLeave={() => setIsPanning(false)}
            onTouchStart={(e) => {
              const t = e.touches[0];
              if (!t) return;
              if (zoomScale > 1) {
                setIsPanning(true);
                panStartRef.current = {
                  x: t.clientX - panOffset.x,
                  y: t.clientY - panOffset.y,
                };
              } else {
                lightboxTouchStartRef.current = {
                  x: t.clientX,
                  y: t.clientY,
                  time: Date.now(),
                };
              }
            }}
            onTouchMove={(e) => {
              const t = e.touches[0];
              if (!t) return;
              if (zoomScale > 1 && isPanning) {
                const newX = t.clientX - panStartRef.current.x;
                const newY = t.clientY - panStartRef.current.y;
                setPanOffset({ x: newX, y: newY });
                panCurrentOffsetRef.current = { x: newX, y: newY };
              }
            }}
            onTouchEnd={(e) => {
              setIsPanning(false);
              if (zoomScale <= 1 && lightboxTouchStartRef.current) {
                const t = e.changedTouches[0];
                if (t) {
                  const dx = t.clientX - lightboxTouchStartRef.current.x;
                  const dy = t.clientY - lightboxTouchStartRef.current.y;
                  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
                    if (dx < 0) {
                      nextLightboxItem();
                    } else {
                      prevLightboxItem();
                    }
                  }
                }
                lightboxTouchStartRef.current = null;
              }
            }}
          >
            {/* Left Nav Arrow */}
            {getLightboxMediaCount() > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevLightboxItem();
                }}
                className="absolute left-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white shadow-xl backdrop-blur-md transition-all duration-150 hover:bg-black/85 hover:scale-105 active:scale-95 sm:left-6 sm:h-13 sm:w-13"
                aria-label="Previous item"
              >
                <Icon name="chevron_left" className="text-[26px] sm:text-[30px]" />
              </button>
            )}

            {/* Media Content Display */}
            <div
              className={cn(
                "relative flex h-full w-full items-center justify-center transition-transform duration-100",
                isPanning && "cursor-grabbing",
                zoomScale > 1 && !isPanning && "cursor-grab",
              )}
            >
              {lightboxTab === "videos" ? (
                <div className="h-full max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-xl bg-black shadow-2xl">
                  <ListingVideo
                    url={lightboxCurrentMedia.url}
                    title={lightboxCurrentMedia.alt}
                  />
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={lightboxCurrentMedia.url}
                  alt={lightboxCurrentMedia.alt}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  onDoubleClick={(e) => {
                    toggleDoubleTapZoom(e.clientX, e.clientY);
                  }}
                  style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale}) rotate(${rotation}deg)`,
                    transformOrigin: "center center",
                    transition: isPanning ? "none" : "transform 150ms ease-out",
                  }}
                  className="max-h-full max-w-full rounded-md object-contain shadow-2xl"
                />
              )}
            </div>

            {/* Right Nav Arrow */}
            {getLightboxMediaCount() > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextLightboxItem();
                }}
                className="absolute right-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white shadow-xl backdrop-blur-md transition-all duration-150 hover:bg-black/85 hover:scale-105 active:scale-95 sm:right-6 sm:h-13 sm:w-13"
                aria-label="Next item"
              >
                <Icon name="chevron_right" className="text-[26px] sm:text-[30px]" />
              </button>
            )}
          </div>

          {/* Bottom Filmstrip Thumbnails */}
          {getLightboxMediaCount() > 1 && (
            <footer className="border-t border-white/10 bg-black/50 px-4 py-2.5 backdrop-blur-md">
              <div
                ref={lightboxThumbStripRef}
                className="no-scrollbar mx-auto flex max-w-5xl items-center gap-2 overflow-x-auto py-1"
                aria-label="Lightbox thumbnails filmstrip"
              >
                {(lightboxTab === "photos"
                  ? images
                  : lightboxTab === "documents"
                    ? cadastralMaps
                    : videos
                ).map((item, idx) => {
                  const isActive = idx === lightboxIndex;
                  return (
                    <button
                      key={`lb-thumb-${idx}-${item.url}`}
                      type="button"
                      data-lb-thumb-index={idx}
                      onClick={() => {
                        resetZoom();
                        setLightboxIndex(idx);
                      }}
                      className={cn(
                        "relative aspect-[4/3] h-14 shrink-0 overflow-hidden rounded-sm border bg-black/40 transition-all duration-150",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        isActive
                          ? "border-primary ring-2 ring-primary/80 opacity-100 scale-105 shadow-md"
                          : "border-white/20 opacity-55 hover:border-white/60 hover:opacity-100",
                      )}
                      aria-label={`Go to item ${idx + 1}`}
                      aria-pressed={isActive}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt=""
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </footer>
          )}
        </div>
      )}
    </section>
  );
}
