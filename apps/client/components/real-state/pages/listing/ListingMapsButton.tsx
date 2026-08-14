import { Button, Icon } from "@repo/ui";
import type { ApiPropertyLocation } from "lib/api/services/properties/types";

export function googleMapsUrl(location: ApiPropertyLocation): string {
  if (location.latitude != null && location.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [
      location.addressText,
      location.areaName,
      location.municipality,
      location.district,
      location.province,
    ]
      .filter(Boolean)
      .join(", "),
  )}`;
}

type ListingMapsButtonProps = {
  location: ApiPropertyLocation;
};

export function ListingMapsButton({ location }: ListingMapsButtonProps) {
  return (
    <Button
      asChild
      size="sm"
      className="h-8 rounded-md px-3 font-semibold shadow-sm transition-[transform,background-color,box-shadow] duration-150 hover:shadow-md active:scale-[0.96]"
    >
      <a
        href={googleMapsUrl(location)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon name="map" className="text-[16px]" aria-hidden />
        View map
        <Icon name="open_in_new" className="text-[14px] opacity-80" aria-hidden />
      </a>
    </Button>
  );
}
