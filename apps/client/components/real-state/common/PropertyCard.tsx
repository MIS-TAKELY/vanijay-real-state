"use client";

import { Icon, cn } from "@repo/ui";
import Link from "next/link";
import { useState } from "react";
import type { CardProperty } from "lib/api/services/properties/types";
import { useIsMobile } from "lib/use-is-mobile";
import { CompareToggleButton } from "./CompareToggleButton";
import { SaveToFavoritesButton } from "./SaveToFavoritesButton";

interface PropertyCardProps {
  property: {
    id: string;
    /** Real DB id — used by favorites/compare actions. */
    propertyId?: string;
    listingCode?: string;
    title: string;
    price: string;
    location: string;
    gradient: string;
    imageUrl?: string;
    /** All listing photos, cover first — powers the image carousel. */
    images?: string[];
    meta: string[];
    badge?: string;
    isVerified?: boolean;
    /** Market status pill — "For Sale" / "For Rent". */
    status?: string;
  };
  /** Fired when the save-to-favorites state changes (keeps wrappers in sync). */
  onFavoriteChange?: (isFavorite: boolean) => void;
  className?: string;
}

interface Spec {
  icon: string;
  value: string;
}

/** Normalize a price string so it always carries the "NPR" prefix. */
function normalizePrice(price: string): string {
  const trimmed = price.trim();
  return /^NPR\b/i.test(trimmed) ? trimmed : `NPR ${trimmed}`;
}

/** Extract the per-unit price (e.g. "NPR 197,530/aana") from the meta rows. */
function perUnitFromMeta(meta: string[]): string | null {
  const row = meta.find((m) => m.startsWith("Price/Aana: "));
  if (!row) return null;
  return `${normalizePrice(row.slice("Price/Aana: ".length))}/aana`;
}

/** Flatten the discovery `meta` strings into compact icon+text spec chips.
 *  Price/Aana is shown as the per-unit label beside the price, and
 *  verification is signalled on the listing page — both are skipped here. */
function toSpecs(meta: string[]): Spec[] {
  const specs: Spec[] = [];
  const push = (icon: string, value: string) => specs.push({ icon, value });

  for (const m of meta) {
    if (m.startsWith("Road: ")) {
      push("directions", m.slice("Road: ".length).trim().replace(/^(\d+)ft\b.*$/i, "$1 ft"));
    } else if (m.startsWith("Facing: ")) {
      push("my_location", m.slice("Facing: ".length).trim());
    } else if (m.startsWith("Corner Plot")) {
      push("fullscreen", "Corner");
    } else if (m.startsWith("Negotiable")) {
      push("handshake", "Negotiable");
    } else if (m.startsWith("Min: ")) {
      push("check", m.slice("Min: ".length).trim());
    } else if (m.startsWith("Price/Aana: ")) {
      /* shown as the per-unit label — skip */
    } else if (m.startsWith("Verification: ")) {
      /* shown elsewhere — skip */
    } else {
      push("landscape", m.trim());
    }
  }
  return specs;
}

/** Branded placeholder for listings without a photo — logo plate, not a gradient. */
function BrandedPlaceholder() {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#FBFAF7]"
      aria-hidden
    >
      <div className="absolute inset-0 topo-bg" />
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset */}
      <img src="/logo.webp" alt="" className="relative z-10 w-12 md:w-16 opacity-80" draggable={false} />
    </div>
  );
}

export function PropertyCard({
  property,
  onFavoriteChange,
  className,
}: PropertyCardProps) {
  const isMobile = useIsMobile();
  const href = `/${property.id}`;
  const rawImages = (property.images ?? []).filter(Boolean);
  const images =
    rawImages.length > 0 ? rawImages : property.imageUrl ? [property.imageUrl] : [];
  const [active, setActive] = useState(0);
  const current = images.length > 0 ? Math.min(active, images.length - 1) : 0;

  const specs = toSpecs(property.meta);
  const specLimit = isMobile ? 2 : 3;
  const visibleSpecs = specs.slice(0, specLimit);
  const hiddenCount = Math.max(0, specs.length - specLimit);
  const perUnit = perUnitFromMeta(property.meta);
  const status = property.status ?? "For Sale";
  const price = normalizePrice(property.price);

  const step = (dir: 1 | -1) =>
    setActive((c) => (c + dir + images.length) % images.length);

  return (
    <article
      data-card
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-md border border-slate-100 bg-white shadow-sm transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-xl",
        className,
      )}
    >
      {/* Image area — fixed 3:2, carousel, overlays */}
      <div className="relative aspect-[16/10] md:aspect-[3/2] overflow-hidden bg-slate-100">
        {images.length > 0 ? (
          <div
            className="flex h-full w-full"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {images.map((src, i) => (
              <div key={`${src}-${i}`} className="relative h-full w-full shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element -- external upload URL */}
                <img
                  src={src}
                  alt={i === current ? property.title : ""}
                  loading={i === 0 ? "eager" : "lazy"}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        ) : (
          <BrandedPlaceholder />
        )}

        {/* Status pill — solid gold, top-left */}
        <span className="absolute left-2 top-2 md:left-3 md:top-3 z-[2] inline-flex items-center rounded-full bg-gold px-2 py-0.5 md:px-2.5 md:py-1 text-[9px] md:text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm">
          {status}
        </span>

        {/* Wishlist + compare — frosted glass, top-right */}
        <div className="absolute right-2 top-2 md:right-3 md:top-3 z-[2] flex items-center gap-1.5 md:gap-2">
          <SaveToFavoritesButton
            propertyId={property.propertyId ?? property.id}
            iconOnly
            size="icon-sm"
            onChange={onFavoriteChange}
            className="md:!size-9 rounded-full border border-white/40 bg-white/70 text-slate-700 shadow-sm backdrop-blur-md hover:bg-white hover:cursor-pointer"
          />
          <CompareToggleButton
            property={property as CardProperty}
            iconOnly
            size="icon-sm"
            className="md:!size-9 rounded-full border border-white/40 bg-white/70 text-slate-700 shadow-sm backdrop-blur-md hover:bg-white hover:cursor-pointer"
          />
        </div>

        {/* Carousel controls — arrows on hover, dots bottom-center */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => step(-1)}
              className="absolute left-2 top-1/2 z-[2] flex size-7 md:size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/70 text-slate-800 opacity-0 shadow-sm backdrop-blur-md transition-opacity duration-200 hover:bg-white focus-visible:opacity-100 group-hover:opacity-100 md:left-2.5"
            >
              <Icon name="chevron_left" className="text-base md:text-[18px]" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => step(1)}
              className="absolute right-2 top-1/2 z-[2] flex size-7 md:size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/70 text-slate-800 opacity-0 shadow-sm backdrop-blur-md transition-opacity duration-200 hover:bg-white focus-visible:opacity-100 group-hover:opacity-100 md:right-2.5"
            >
              <Icon name="chevron_right" className="text-base md:text-[18px]" />
            </button>
            <div className="absolute bottom-2 md:bottom-3 left-1/2 z-[2] flex -translate-x-1/2 items-center gap-1 md:gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Photo ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={cn(
                    "h-1.5 cursor-pointer rounded-full transition-all duration-300",
                    i === current ? "w-4 bg-white" : "w-1.5 bg-white/60 hover:bg-white/90",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content body */}
      <div className="flex flex-1 flex-col p-3 md:p-4">
        <h3 className="truncate text-[13px] md:text-[15px] font-semibold text-slate-900">
          {property.title}
        </h3>

        {/* Row 3 — location */}
        <p className="mt-0.5 md:mt-1 flex items-center gap-1 text-[11px] md:text-[13px] text-slate-500">
          <Icon name="location_on" className="shrink-0 text-xs md:text-[14px] text-slate-400" />
          <span className="truncate">{property.location}</span>
        </p>

        {/* Row 4 — spec chips (max 2 mobile / 3 desktop, then "+N more") */}
        {visibleSpecs.length > 0 && (
          <div className="mt-1.5 md:mt-2.5 flex flex-wrap items-center gap-x-1.5 md:gap-x-2 gap-y-0.5 md:gap-y-1 text-[10px] md:text-[12px] text-slate-600">
            {visibleSpecs.map((s, i) => (
              <span key={`${s.icon}-${i}`} className="flex items-center gap-1 md:gap-1.5">
                {i > 0 && (
                  <span aria-hidden className="mr-0.5 size-0.5 shrink-0 rounded-full bg-slate-300" />
                )}
                <Icon name={s.icon} className="shrink-0 text-[11px] md:text-[13px] text-slate-400" />
                <span className="whitespace-nowrap">{s.value}</span>
              </span>
            ))}
            {hiddenCount > 0 && (
              <span className="flex items-center gap-1 md:gap-1.5 whitespace-nowrap">
                <span aria-hidden className="size-0.5 shrink-0 rounded-full bg-slate-300" />
                +{hiddenCount} more
              </span>
            )}
          </div>
        )}

        {/* Row 5 — divider + full-width CTA */}
        <div className="mt-auto pt-2 md:pt-3">
          <div aria-hidden className="mb-2 md:mb-3 border-t border-slate-100" />
          <Link
            href={href}
            className="relative z-[2] flex w-full items-center justify-center gap-1 rounded-lg border border-[#1B2A4A] bg-white px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-semibold text-[#1B2A4A] transition-colors duration-200 hover:bg-[#1B2A4A] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          >
            View Details
            <Icon name="arrow_forward" className="text-sm md:text-[16px]" />
          </Link>
        </div>
      </div>

      {/* Whole-card navigation layer — above content, below interactive controls */}
      <Link
        href={href}
        aria-label={`${property.title} — view details`}
        className="absolute inset-0 z-[1] rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      />
    </article>
  );
}
