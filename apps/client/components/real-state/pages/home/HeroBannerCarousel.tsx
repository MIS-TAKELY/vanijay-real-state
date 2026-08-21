"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@repo/ui";
import { useContentStore } from "store/content";
import { fetchCmsHeroBanners, type CmsHeroSlide } from "lib/api/services/cms";
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

function HeroBannerCarousel() {
  const heroEnabled = useContentStore((s) => s.heroEnabled);
  const storeSlides = useContentStore((s) => s.heroSlides);
  const [cmsSlides, setCmsSlides] = useState<CmsHeroSlide[] | null>(null);
  const [current, setCurrent] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
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
  }, []);

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
      className="relative w-full overflow-hidden bg-navy-deep"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-label={activeSlide?.headline || "Hero banner"}
    >
      {/* Visually hidden page H1 — banner art carries the visible messaging */}
      <h1 className="sr-only">{activeSlide?.headline}</h1>

      {/* Intrinsic-height spacer: sizes the banner to the full image aspect
          so wide desktop artwork isn't cropped on mobile (object-cover). */}
      {/* eslint-disable-next-line @next/next/no-img-element -- height driver */}
      <img
        src={activeSlide?.image}
        alt=""
        aria-hidden
        draggable={false}
        className="block w-full h-auto opacity-0 pointer-events-none select-none"
      />

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
            src={slide.image}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain object-center"
          />
          {/* Soft overlays so carousel controls stay readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/25 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-16 md:h-28 bg-gradient-to-t from-navy-deep/50 to-transparent" />
        </div>
      ))}

      {/* Dot indicators — gold for the active slide */}
      <div className="absolute bottom-3 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 md:gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={`h-1.5 md:h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
              index === current
                ? "w-6 md:w-8 bg-gold"
                : "w-1.5 md:w-2 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Arrow navigation - desktop only */}
      <button
        onClick={goPrev}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 size-12 items-center justify-center rounded-full bg-navy-deep/30 text-white backdrop-blur-sm border border-white/15 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:border-gold/60 hover:bg-navy-deep/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        aria-label="Previous slide"
        style={{ opacity: isHovering ? 1 : undefined }}
      >
        <Icon name="chevron_left" className="text-xl" />
      </button>
      <button
        onClick={goNext}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 size-12 items-center justify-center rounded-full bg-navy-deep/30 text-white backdrop-blur-sm border border-white/15 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:border-gold/60 hover:bg-navy-deep/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        aria-label="Next slide"
        style={{ opacity: isHovering ? 1 : undefined }}
      >
        <Icon name="chevron_right" className="text-xl" />
      </button>
    </section>
  );
}

export { HeroBannerCarousel };
