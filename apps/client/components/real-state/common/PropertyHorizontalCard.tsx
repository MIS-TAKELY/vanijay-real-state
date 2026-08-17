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
        "min-w-[280px] md:min-w-[320px] max-w-[320px]",
        "bg-surface",
        "rounded-xl",
        "overflow-hidden",
        "hover:shadow-lg",
        "hover:border-primary/40",
        "transition-all duration-200",
        "hover:-translate-y-1",
        "snap-start",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
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
          />
        </Link>

        {/* Listing type badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={listingType === "For Sale" ? "default" : "secondary"}>
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
          size="icon"
          onClick={toggleFavorite}
          className="absolute top-3 right-3 size-8 bg-white/80 backdrop-blur-sm hover:bg-white"
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Icon
            name="favorite"
            className="text-lg"
            fill={favorite ? "currentColor" : "none"}
          />
        </Button>
      </div>

      {/* Details */}
      <CardContent className="p-4 flex flex-col gap-2">
        <h4 className="font-body-md font-semibold text-on-surface truncate">
          {title}
        </h4>
        <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
          <Icon name="location_on" className="text-data-table" />
          {location}
        </p>
        <p className="font-data-price text-data-price text-gold-deep tracking-tight font-bold">
          {price}
        </p>

        {/* Specs */}
        <div className="flex items-center gap-3 font-label-sm text-label-sm text-on-surface-variant">
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
        <Button variant="outline" size="sm" className="w-full mt-1" asChild>
          <Link href={href}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
