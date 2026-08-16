"use client";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  toast,
} from "@repo/ui";
import { createProperty, updatePropertyStatus } from "lib/api/services/properties";
import type {
  ApiProperty,
  CreatePropertyPayload,
} from "lib/api/services/properties/types";
import { isLandPropertyType } from "lib/api/services/properties/types";
import Link from "next/link";
import { useState } from "react";
import type { MyListing } from "./constants";

interface ListingMenuProps {
  listing: MyListing;
  /** Called after a successful mutation so the list can reload. */
  onChanged: () => void;
}

/** Rebuild a create payload from an existing listing (for "Duplicate"). */
function toDuplicatePayload(p: ApiProperty): CreatePropertyPayload {
  const media: NonNullable<CreatePropertyPayload["media"]> = (p.media ?? []).map(
    (m) => ({
      type: "IMAGE",
      url: m.url,
      ...(m.altText ? { altText: m.altText } : {}),
      sortOrder: m.sortOrder,
      isCover: m.isCover,
    }),
  );

  return {
    title: `${p.title} (Copy)`,
    ...(p.description ? { description: p.description } : {}),
    propertyType: p.propertyType,
    askingPrice: p.askingPrice,
    // Per-aana is a land-pricing metric — never carry it onto a duplicate of a
    // building-type listing (a stale value would resurface the bogus rate).
    ...(isLandPropertyType(p.propertyType) && p.pricePerAana != null
      ? { pricePerAana: p.pricePerAana }
      : {}),
    ...(p.roadAccessWidthFt != null && {
      roadAccessWidthFt: p.roadAccessWidthFt,
    }),
    ...(p.roadType ? { roadType: p.roadType } : {}),
    ...(p.facing ? { facing: p.facing } : {}),
    isCornerPlot: p.isCornerPlot,
    landArea: p.landArea
      ? {
          ropani: p.landArea.ropani,
          aana: p.landArea.aana,
          paisa: p.landArea.paisa,
          daam: p.landArea.daam,
          ...(p.landArea.bigha != null ? { bigha: p.landArea.bigha } : {}),
          ...(p.landArea.katha != null ? { katha: p.landArea.katha } : {}),
          ...(p.landArea.dhur != null ? { dhur: p.landArea.dhur } : {}),
          totalSqFt: p.landArea.totalSqFt,
          totalSqMeters: p.landArea.totalSqMeters,
        }
      : {
          ropani: 0,
          aana: 0,
          paisa: 0,
          daam: 0,
          totalSqFt: 0,
          totalSqMeters: 0,
        },
    location: p.location
      ? {
          province: p.location.province,
          district: p.location.district,
          municipality: p.location.municipality,
          wardNumber: p.location.wardNumber,
          areaName: p.location.areaName,
          ...(p.location.addressText
            ? { addressText: p.location.addressText }
            : {}),
          ...(p.location.latitude != null ? { latitude: p.location.latitude } : {}),
          ...(p.location.longitude != null
            ? { longitude: p.location.longitude }
            : {}),
        }
      : {
          province: "",
          district: "",
          municipality: "",
          wardNumber: 0,
          areaName: "",
        },
    ...(media.length > 0 ? { media } : {}),
  };
}

type ActionKey = "markSold" | "archive" | "duplicate";

/**
 * Row `...` menu (DESIGN.md §5.2): Edit / View public page / Mark sold /
 * Archive / Duplicate. Link items navigate; the rest call the properties API
 * and then ask the parent to reload the list.
 */
export function ListingMenu({ listing, onChanged }: ListingMenuProps) {
  const [pending, setPending] = useState<ActionKey | null>(null);
  const isLive = listing.status === "LIVE";
  const isSold = listing.status === "SOLD";
  const isArchived = listing.status === "ARCHIVED";

  const run = async (action: ActionKey) => {
    if (pending) return;
    setPending(action);
    try {
      if (action === "markSold") {
        await updatePropertyStatus(listing.id, "SOLD");
        toast.success(`${listing.listingCode} marked as sold`, {
          description: listing.title,
        });
      } else if (action === "archive") {
        await updatePropertyStatus(listing.id, "ARCHIVED");
        toast.success(`${listing.listingCode} archived`, {
          description: listing.title,
        });
      } else {
        if (!listing.raw) throw new Error("Listing data is unavailable.");
        await createProperty(toDuplicatePayload(listing.raw));
        toast.success(`Duplicate of ${listing.listingCode} created`, {
          description: "Published live on the public feed as unverified.",
        });
      }
      onChanged();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Action failed — try again.",
      );
    } finally {
      setPending(null);
    }
  };

  const actionDisabled = pending !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Listing actions"
        >
          <Icon name="more_vert" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/my-listings/new?slug=${listing.slug}`}>
              <Icon name="edit" />
              Edit
            </Link>
          </DropdownMenuItem>

          {isLive ? (
            <DropdownMenuItem asChild>
              <Link href={`/listing/${listing.slug}`}>
                <Icon name="open_in_new" />
                View public page
              </Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled>
              <Icon name="open_in_new" />
              View public page
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            disabled={isSold || isArchived || actionDisabled}
            onSelect={() => void run("markSold")}
          >
            {pending === "markSold" ? (
              <Icon name="progress_activity" className="animate-spin" />
            ) : (
              <Icon name="sell" />
            )}
            {pending === "markSold" ? "Marking…" : "Mark sold"}
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={!listing.raw || actionDisabled}
            onSelect={() => void run("duplicate")}
          >
            {pending === "duplicate" ? (
              <Icon name="progress_activity" className="animate-spin" />
            ) : (
              <Icon name="content_copy" />
            )}
            {pending === "duplicate" ? "Duplicating…" : "Duplicate"}
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            disabled={isArchived || actionDisabled}
            onSelect={() => void run("archive")}
          >
            {pending === "archive" ? (
              <Icon name="progress_activity" className="animate-spin" />
            ) : (
              <Icon name="archive" />
            )}
            {pending === "archive" ? "Archiving…" : "Archive"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
