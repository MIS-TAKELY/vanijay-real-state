"use client";

import { Button, Icon } from "@repo/ui";
import { AddToCartButton } from "components/real-state/common/AddToCartButton";
import { CallSellerButton } from "components/real-state/common/CallSellerButton";
import { SaveToFavoritesButton } from "components/real-state/common/SaveToFavoritesButton";
import type { ApiPropertyLocation } from "lib/api/services/properties/types";
import Link from "next/link";
import { ListingSidebarMap } from "./ListingSidebarMap";

interface ListingDecisionCardProps {
  propertyId: string;
  slug: string;
  title: string;
  askingPrice: string;
  pricePerAana?: string | null;
  location?: ApiPropertyLocation | null;
  verified: boolean;
}

export function ListingDecisionCard({
  propertyId,
  slug,
  title,
  askingPrice,
  pricePerAana,
  location,
  verified,
}: ListingDecisionCardProps) {
  const hasCoordinates =
    location?.latitude != null && location?.longitude != null;

  return (
    <div className="sticky top-24 flex flex-col gap-4 rounded-md border border-outline-variant bg-surface p-6">
      {/* Price */}
      <div>
        <p className="mono-stat text-2xl font-semibold text-primary">
          {askingPrice}
        </p>
        {pricePerAana && (
          <p className="mt-0.5 text-sm text-on-surface-variant">
            {pricePerAana} per Aana
          </p>
        )}
      </div>

     

      {/* Embedded map — location is the product */}
      {hasCoordinates && (
        <div className="overflow-hidden rounded-md border border-outline-variant">
          <ListingSidebarMap
            latitude={location!.latitude!}
            longitude={location!.longitude!}
            title={title}
          />
          <Link
            href={`https://www.google.com/maps/search/?api=1&query=${location!.latitude},${location!.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-center gap-1.5 border-t border-outline-variant bg-surface-container py-2 text-xs font-semibold text-on-surface transition-[background-color,color] duration-150 hover:bg-primary hover:text-on-primary"
          >
            <Icon name="map" className="text-[14px]" />
            Open in Google Maps
            <Icon name="open_in_new" className="text-[12px]" />
          </Link>
        </div>
      )}

  

      {/* CTAs */}
      <div className="flex flex-col gap-2">
        <Button asChild className="w-full rounded-md font-semibold">
          <Link href={`/inquiries?property=${slug}`}>
            <Icon name="chat" className="text-[18px]" />
            Send Inquiry
          </Link>
        </Button>
        <CallSellerButton
          propertyId={propertyId}
          className="w-full rounded-md border-outline-variant font-semibold"
        />
        <Button
          asChild
          variant="outline"
          className="w-full rounded-md border-outline-variant font-semibold"
        >
          <Link href="/appointments">
            <Icon name="event" className="text-[18px]" />
            Request Site Visit
          </Link>
        </Button>
        <AddToCartButton
          propertyId={propertyId}
          title={title}
          variant="outline"
          className="w-full rounded-md border-outline-variant font-semibold"
        />
        <SaveToFavoritesButton
          propertyId={propertyId}
          variant="ghost"
          className="w-full rounded-md font-semibold"
        />
      </div>

      {/* Verification notice */}
      {!verified && (
        <p className="rounded-md bg-surface-container p-3 text-xs leading-5 text-on-surface-variant">
          This listing has not completed verification yet. Independently
          confirm ownership documents (Lalpurja) before any payment.
        </p>
      )}
    </div>
  );
}
