"use client";

import { useState } from "react";
import { Card, CardContent, Badge, Button, Icon } from "@repo/ui";
import Link from "next/link";

export interface PropertyHorizontalCardProps {
  id: string;
  title: string;
  location: string;
  price: string;
  image: string;
  listingType: "For Sale" | "For Rent";
  beds?: number;
  baths?: number;
  sqft?: string;
  alt?: string;
  href?: string;
  badge?: string;
  onFavoriteChange?: (id: string, favorite: boolean) => void;
  className?: string;
}

export function PropertyHorizontalCard({
  id,
  title,
  location,
  price,
  image,
  listingType,
  beds,
  baths,
  sqft,
  alt,
  href = "/",
  badge,
  onFavoriteChange,
  className,
}: PropertyHorizontalCardProps) {
  const [favorite, setFavorite] = useState(false);

  const toggleFavorite = () => {
    const next = !favorite;
    setFavorite(next);
    onFavoriteChange?.(id, next);
  };

  return (
    <Card
      data-card
      className={[
        "min-w-[220px] max-w-[220px] sm:min-w-[240px] sm:max-w-[240px] md:min-w-[280px] md:max-w-[320px]",
        "bg-surface",
        "rounded-xl",
        "overflow-hidden",
        "md:hover:shadow-lg",
        "hover:border-primary/40",
        "transition-all duration-200",
        "md:hover:-translate-y-1",
        "snap-start",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] md:aspect-[4/3] overflow-hidden">
        <Link
          href={href}
          aria-label={`${title} — view details`}
          className="block h-full"
        >
          <img
            src={image}
            alt={alt ?? title}
            className="h-full w-full object-cover"
            loading="lazy"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
        </Link>

        {/* Listing type badge */}
        <div className="absolute top-2 left-2 md:top-3 md:left-3">
          <Badge variant={listingType === "For Sale" ? "default" : "secondary"} className="text-[10px] md:text-xs px-2 py-0 md:px-2.5 md:py-0.5">
            {listingType}
          </Badge>
        </div>

        {/* Optional extra badge */}
        {badge && (
          <div className="absolute top-3 right-14">
            <Badge variant="destructive" className="uppercase tracking-wide">
              {badge}
            </Badge>
          </div>
        )}

        {/* Favorite button */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleFavorite}
          className="absolute top-2 right-2 md:top-3 md:right-3 size-7 md:size-8 bg-white/80 backdrop-blur-sm hover:bg-white"
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Icon
            name="favorite"
            className="text-base md:text-lg"
            fill={favorite ? "currentColor" : "none"}
          />
        </Button>
      </div>

      {/* Details */}
      <CardContent className="p-3 md:p-4 flex flex-col gap-1.5 md:gap-2">
        <h4 className="font-body-md text-[13px] md:text-base font-semibold text-on-surface truncate">
          {title}
        </h4>
        <p className="font-label-sm text-[11px] md:text-label-sm text-on-surface-variant flex items-center gap-1">
          <Icon name="location_on" className="text-sm md:text-data-table" />
          {location}
        </p>
        <p className="font-data-price text-xl md:text-data-price text-gold-deep tracking-tight font-bold">
          {price}
        </p>

        {/* Specs */}
        <div className="flex items-center gap-2 md:gap-3 font-label-sm text-[10px] md:text-label-sm text-on-surface-variant">
          {beds !== undefined && (
            <span className="flex items-center gap-1">
              <Icon name="home" className="text-data-table" />
              {beds}
            </span>
          )}
          {baths !== undefined && (
            <span className="flex items-center gap-1">{baths} Baths</span>
          )}
          {sqft && <span className="flex items-center gap-1">{sqft}</span>}
        </div>

        {/* CTA */}
        <Button variant="outline" size="sm" className="w-full mt-1 h-8 md:h-9 text-xs md:text-sm" asChild>
          <Link href={href}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
