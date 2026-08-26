"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@repo/ui";
import { useContentStore } from "store/content";
import {
  fetchCmsHeroBanners,
  type CmsHeroSlide,
} from "lib/api/services/cms";
import { optimizeImageUrl } from "lib/image-url";
import type { HeroSlide } from "constants/varibles-constants";

type Slide = HeroSlide & { key?: string; ctaHref?: string };

function toSlide(item: CmsHeroSlide): Slide {
  return {
    key: item.key,
    image: item.image,
    headline: item.headline,
    subheadline: item.subheadline,
    ctaPrimary: item.ctaPrimary,
    ctaSecondary: "List Your Property",
    ctaHref: item.ctaHref,
  };
}

interface HeroBannerCarouselProps {
  /** Slides already fetched on the server — skips the client-side CMS
   *  round-trip so the LCP image paints immediately. */
  initialSlides?: CmsHeroSlide[];
}

/** Rendered banner width ceiling — Cloudinary/Unsplash deliver a resized
 *  variant instead of the full upload (typically 1920px). */
const HERO_IMAGE_WIDTH = 1920;

/** Width variants for the responsive srcSet — the browser picks the
 *  cheapest candidate that still covers its viewport × DPR. */
const HERO_SRCSET_WIDTHS = [480, 640, 860, 1080, 1280, 1600, 1920];

function heroSrcSet(image: string): string {
  if (image.startsWith("/")) return "";
  return HERO_SRCSET_WIDTHS.map(
    (w) => `${optimizeImageUrl(image, w)} ${w}w`,
  ).join(", ");
}

function HeroBannerCarousel({ initialSlides }: HeroBannerCarouselProps) {
  const heroEnabled = useContentStore((s) => s.heroEnabled);
  const storeSlides = useContentStore((s) => s.heroSlides);
  // Seed from server data when available; null triggers the client fetch.
  const [cmsSlides, setCmsSlides] = useState<CmsHeroSlide[] | null>(
    initialSlides && initialSlides.length > 0 ? initialSlides : null,
  );
  const [current, setCurrent] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    // Skip the client fetch entirely when the server already provided slides.
    if (cmsSlides) return;
    let cancelled = false;
    fetchCmsHeroBanners()
      .then((slides) => {
        if (!cancelled) setCmsSlides(slides);
      })
      .catch(() => {
        if (!cancelled) setCmsSlides([]);
      });
    return () => {
      cancelled = true;
    };
  }, [cmsSlides]);

  const heroSlides: Slide[] =
    cmsSlides && cmsSlides.length > 0 ? cmsSlides.map(toSlide) : storeSlides;

  const goTo = useCallback(
    (index: number) => {
      setCurrent(() => (index + heroSlides.length) % heroSlides.length);
    },
    [heroSlides.length],
  );

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (isHovering || heroSlides.length === 0) return;
    const timer = setInterval(goNext, 4000);
    return () => clearInterval(timer);
  }, [goNext, isHovering, heroSlides.length]);

  useEffect(() => {
    // Clamp the index when the slide list shrinks (admin reorder/delete).
    setCurrent((prev) => Math.min(prev, Math.max(heroSlides.length - 1, 0)));
  }, [heroSlides.length]);

  if (!heroEnabled || heroSlides.length === 0) return null;

  const activeSlide = heroSlides[current];

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      setTouchStart(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null || !e.changedTouches[0]) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goNext();
      } else {
        goPrev();
      }
    }
    setTouchStart(null);
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-navy-deep aspect-[1920/500]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-label={activeSlide?.headline || "Hero banner"}
    >
      {/* Static SEO H1 — stable across all carousel slides for consistent indexing */}
      <h1 className="sr-only">Verified Land & Property Listings in Nepal — MALPOTH</h1>

      {heroSlides.map((slide, index) => (
        <div
          key={slide.key ?? index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-hidden={index !== current}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- hero slide image */}
          <img
            src={optimizeImageUrl(slide.image, HERO_IMAGE_WIDTH)}
            srcSet={heroSrcSet(slide.image) || undefined}
            sizes="100vw"
            alt={slide.headline || "MALPOTH verified property listings in Nepal"}
            draggable={false}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : undefined}
            decoding={index === 0 ? "sync" : "async"}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>
      ))}

      {/* Dot indicators — only when multiple slides exist */}
      {heroSlides.length > 1 && (
        <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 md:gap-1.5">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === current}
              className="flex size-6 items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-full"
            >
              <span
                className={`block h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                  index === current
                    ? "w-6 md:w-8 bg-gold shadow-sm"
                    : "w-1.5 md:w-2 bg-white/60 hover:bg-white/90"
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Arrow navigation - desktop only, when multiple slides exist */}
      {heroSlides.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 size-11 items-center justify-center rounded-full bg-navy-deep/40 text-white backdrop-blur-sm border border-white/20 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:border-gold/60 hover:bg-navy-deep/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 shadow-md"
            aria-label="Previous slide"
            style={{ opacity: isHovering ? 1 : undefined }}
          >
            <Icon name="chevron_left" className="text-xl" />
          </button>
          <button
            onClick={goNext}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 size-11 items-center justify-center rounded-full bg-navy-deep/40 text-white backdrop-blur-sm border border-white/20 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:border-gold/60 hover:bg-navy-deep/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 shadow-md"
            aria-label="Next slide"
            style={{ opacity: isHovering ? 1 : undefined }}
          >
            <Icon name="chevron_right" className="text-xl" />
          </button>
        </>
      )}
    </section>
  );
}

export { HeroBannerCarousel };
