"use client";

import { useState } from "react";
import { Card, CardContent, Button, Icon } from "@repo/ui";
import Link from "next/link";

export interface PropertyCompactCardProps {
  id: string;
  title: string;
  location: string;
  price: string;
  image: string;
  alt?: string;
  href?: string;
  onFavoriteChange?: (id: string, favorite: boolean) => void;
}

export function PropertyCompactCard({
  id,
  title,
  location,
  price,
  image,
  alt,
  href = "/",
  onFavoriteChange,
}: PropertyCompactCardProps) {
  const [favorite, setFavorite] = useState(false);

  const toggleFavorite = () => {
    const next = !favorite;
    setFavorite(next);
    onFavoriteChange?.(id, next);
  };

  return (
    <Card
      data-card
      className="min-w-[240px] md:min-w-[280px] max-w-[280px] bg-surface rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 snap-start"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Link href={href} aria-label={`${title} — view details`} className="block h-full">
          <img
            src={image}
            alt={alt ?? title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </Link>
      </div>
      {/* Details */}
      <CardContent className="p-3 flex flex-col gap-1">
        <h4 className="font-body-md font-semibold text-on-surface truncate text-sm">
          {title}
        </h4>
        <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
          <Icon name="location_on" className="text-data-table" />
          {location}
        </p>
        <p className="font-data-price text-data-price text-primary tracking-tight font-bold text-base">
          {price}
        </p>
        {/* Action bar */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-outline-variant">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFavorite}
            className={`flex items-center gap-1 ${
              favorite
                ? "bg-primary/10 text-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-accent"
            }`}
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Icon name="favorite" className="text-sm" fill={favorite ? "currentColor" : "none"} />
            {favorite ? "Saved" : "Save"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 bg-surface-container text-on-surface-variant hover:bg-accent"
            aria-label="Contact agent"
          >
            <Icon name="phone" className="text-sm" />
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
