"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, Icon } from "@repo/ui";
import { useContentStore } from "store/content";

function HeroBannerCarousel() {
  const router = useRouter();
  const heroEnabled = useContentStore((s) => s.heroEnabled);
  const heroSlides = useContentStore((s) => s.heroSlides);
  const [current, setCurrent] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

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
      className="relative w-full h-[50vh] min-h-[480px] max-h-[720px] overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-hidden={index !== current}
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          {/* Gradient overlay — navy-tinted to echo the brand roundel */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/85 via-navy/45 to-navy/5" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy-deep/70 to-transparent" />
          {/* Content */}
          <div className="relative z-20 flex items-center h-full max-w-container-max mx-auto px-gutter">
            <div className="text-white max-w-2xl">
              <p className="mb-4 flex items-center gap-3 font-label-sm text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
                <span className="h-px w-8 bg-gold/70" aria-hidden />
                Nepal&apos;s Verified Land Archive
              </p>
              <h1 className="font-display-lg text-display-lg leading-tight mb-4">
                {slide.headline}
              </h1>
              <p className="font-body-lg text-white/85 leading-relaxed mb-8">
                {slide.subheadline}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-gold text-on-gold shadow-lg shadow-navy-deep/30 hover:bg-gold/90"
                  onClick={() => router.push("/")}
                >
                  {slide.ctaPrimary}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:border-gold/70 hover:bg-white/10 shadow-lg"
                  onClick={() => router.push("/nrn-concierge")}
                >
                  {slide.ctaSecondary}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Dot indicators — gold for the active slide */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
              index === current
                ? "w-8 bg-gold"
                : "w-2 bg-white/50 hover:bg-white/80"
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
