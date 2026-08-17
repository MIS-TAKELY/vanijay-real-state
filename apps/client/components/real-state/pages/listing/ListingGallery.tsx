"use client";

import { Button, Icon, cn } from "@repo/ui";
import type { ApiPropertyMedia } from "lib/api/services/properties/types";
import { useEffect, useRef, useState } from "react";
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

  const showPrevPhoto = () => {
    setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1));
  };
  const showNextPhoto = () => {
    setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1));
  };

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

  if (!hasImages && !hasVideos && !hasDocs) {
    return (
      <div
        className={cn(
          "aspect-video overflow-hidden rounded-2xl bg-gradient-to-br",
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
    ? images[Math.min(activeImage, images.length - 1)]!
    : null;
  const activeVideo = showingVideos ? videos[activeVideoIndex] : null;
  const activeDoc = showingDocs
    ? cadastralMaps[Math.min(activeDocIndex, cadastralMaps.length - 1)]
    : null;

  const availableTabsCount =
    (hasImages ? 1 : 0) + (hasVideos ? 1 : 0) + (hasDocs ? 1 : 0);

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
    openerRef.current?.focus();
    openerRef.current = null;
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

  return (
    <section>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-headline-md text-lg font-semibold tracking-tight text-navy">
          Media &amp; Documents
        </h2>

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
            className="flex gap-1 rounded-lg bg-surface-container p-1 shadow-inner"
          >
            {hasImages && (
              <button
                type="button"
                role="tab"
                id="tab-photos"
                aria-selected={activeTab === "photos"}
                aria-controls="panel-photos"
                tabIndex={activeTab === "photos" ? 0 : -1}
                onClick={() => setActiveTab("photos")}
                className={cn(
                  "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium transition-all duration-150 sm:flex-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  activeTab === "photos"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                <Icon
                  name="photo_library"
                  className="text-[16px]"
                  aria-hidden
                />
                Photos
                <span className="tabular-nums">({images.length})</span>
              </button>
            )}
            {hasVideos && (
              <button
                type="button"
                role="tab"
                id="tab-videos"
                aria-selected={activeTab === "videos"}
                aria-controls="panel-videos"
                tabIndex={activeTab === "videos" ? 0 : -1}
                onClick={() => setActiveTab("videos")}
                className={cn(
                  "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium transition-all duration-150 sm:flex-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  activeTab === "videos"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                <Icon name="videocam" className="text-[16px]" aria-hidden />
                Videos
                <span className="tabular-nums">({videos.length})</span>
              </button>
            )}
            {hasDocs && (
              <button
                type="button"
                role="tab"
                id="tab-documents"
                aria-selected={activeTab === "documents"}
                aria-controls="panel-documents"
                tabIndex={activeTab === "documents" ? 0 : -1}
                onClick={() => setActiveTab("documents")}
                className={cn(
                  "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium transition-all duration-150 sm:flex-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  activeTab === "documents"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                <Icon name="map" className="text-[16px]" aria-hidden />
                Documents
                <span className="tabular-nums">({cadastralMaps.length})</span>
              </button>
            )}
          </div>
        )}

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

      {/* Photos View */}
      {showingPhotos && currentImage && (
        <div
          role="tabpanel"
          id="panel-photos"
          aria-labelledby="tab-photos"
          className="flex flex-col gap-2"
        >
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-surface-container shadow-sm">
            <button
              type="button"
              onClick={openPhotoLightbox}
              className="group block h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
              aria-label="Open photo gallery"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImage.url}
                alt={currentImage.altText ?? title}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="h-full w-full object-cover outline outline-1 -outline-offset-1 outline-black/10 transition-transform duration-200 group-hover:scale-[1.01]"
              />
            </button>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/55 to-transparent px-3 pb-3 pt-10">
              <span className="rounded-full bg-surface/95 px-2.5 py-1 text-[11px] font-medium tabular-nums text-on-surface backdrop-blur-sm">
                {activeImage + 1} / {images.length}
              </span>
            </div>
            {images.length > 1 && (
              <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3">
                <button
                  type="button"
                  aria-label="Previous photo"
                  className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-surface text-on-surface shadow-md transition-all duration-150 hover:bg-surface-container hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95"
                  onClick={showPrevPhoto}
                >
                  <Icon name="chevron_left" className="text-[22px]" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-surface text-on-surface shadow-md transition-all duration-150 hover:bg-surface-container hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95"
                  onClick={showNextPhoto}
                >
                  <Icon name="chevron_right" className="text-[22px]" />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={openPhotoLightbox}
              className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-surface text-on-surface shadow-md transition-all duration-150 hover:bg-surface-container hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95"
              aria-label="View all photos"
            >
              <Icon name="fullscreen" className="text-[18px]" />
            </button>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {images.map((image, idx) => (
                <button
                  key={`thumb-${image.url}-${idx}`}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    "flex-shrink-0 overflow-hidden rounded-lg border transition-all",
                    "w-24 sm:w-28",
                    idx === activeImage
                      ? "border-primary ring-1 ring-primary/40"
                      : "border-outline-variant opacity-70 hover:border-primary/40 hover:opacity-100",
                  )}
                  aria-label={`View photo ${idx + 1}`}
                  aria-pressed={idx === activeImage}
                >
                  <div className="aspect-video">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt=""
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Videos View */}
      {showingVideos && activeVideo && (
        <div
          role="tabpanel"
          id="panel-videos"
          aria-labelledby="tab-videos"
          className="flex flex-col gap-2"
        >
          <div className="relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-container shadow-sm">
            {/* No fixed aspect wrapper here — ListingVideo picks the right
                container shape per platform (16:9 for YouTube, portrait for
                Instagram Reels and TikTok, etc.). */}
            <ListingVideo
              url={activeVideo.url}
              title={activeVideo.altText ?? `${title} — video walkthrough`}
            />
          </div>

          {videos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {videos.map((video, idx) => {
                const isActive = idx === activeVideoIndex;
                return (
                  <button
                    key={`vid-thumb-${idx}`}
                    type="button"
                    onClick={() => setActiveVideoIndex(idx)}
                    className={cn(
                      "group relative flex-shrink-0 overflow-hidden rounded-lg border transition-all",
                      "w-24 sm:w-28",
                      isActive
                        ? "border-primary ring-1 ring-primary/40"
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
                    {isActive && (
                      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
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
          className="flex flex-col gap-2"
        >
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-outline-variant bg-surface-container shadow-sm">
            <button
              type="button"
              onClick={openDocLightbox}
              className="group block h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
              aria-label="Open naksa full view"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeDoc.url}
                alt={activeDoc.altText ?? "Naksa (Cadastral Map)"}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="h-full w-full bg-black/5 object-contain"
              />
            </button>

            {/* Document Header Bar */}
            <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 bg-gradient-to-b from-black/60 via-black/20 to-transparent p-3 text-white">
              <div className="flex items-center gap-2 truncate">
                <span className="rounded-md bg-primary/90 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground backdrop-blur-sm">
                  Naksa
                </span>
                <span className="truncate text-sm font-medium">
                  {activeDoc.altText ?? "Cadastral Map (Naksa)"}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={activeDoc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-surface/80 text-on-surface transition-transform hover:scale-105"
                  title="Open full size"
                >
                  <Icon name="open_in_new" className="text-[16px]" />
                </a>
                <button
                  type="button"
                  onClick={openDocLightbox}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-surface/80 text-on-surface transition-transform hover:scale-105"
                  title="Fullscreen preview"
                >
                  <Icon name="fullscreen" className="text-[16px]" />
                </button>
              </div>
            </div>

            {/* Document Footer */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/55 to-transparent px-3 pb-3 pt-8 text-white">
              <span className="inline-flex items-center gap-1 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-medium text-on-surface backdrop-blur-sm">
                <Icon name="map" className="text-[14px] text-primary" />
                Cadastral Map (Naksa)
              </span>
              <span className="rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-medium tabular-nums text-on-surface backdrop-blur-sm">
                {activeDocIndex + 1} / {cadastralMaps.length}
              </span>
            </div>
          </div>

          {cadastralMaps.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {cadastralMaps.map((map, idx) => {
                const isActive = idx === activeDocIndex;
                return (
                  <button
                    key={`naksa-thumb-${map.url}-${idx}`}
                    type="button"
                    onClick={() => setActiveDocIndex(idx)}
                    className={cn(
                      "group relative flex-shrink-0 overflow-hidden rounded-lg border transition-all",
                      "w-24 sm:w-28",
                      isActive
                        ? "border-primary ring-1 ring-primary/40"
                        : "border-outline-variant opacity-70 hover:border-primary/40 hover:opacity-100",
                    )}
                    aria-label={`View naksa ${idx + 1}`}
                    aria-pressed={isActive}
                  >
                    <div className="aspect-video bg-surface-container">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={map.url}
                        alt=""
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {isActive && (
                      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

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
