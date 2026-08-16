"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import {
  builtUpAreaNumber,
  askingPriceNumber,
  formatLandAreaLabel,
  isBuildingType,
  isLandType,
  totalSqFt,
} from "./draft";
import {
  FALLBACK_GRADIENT,
  TYPE_GRADIENTS,
  TYPE_LABELS,
  formatNPR,
  labelEnum,
  stripHtml,
} from "./format";
import { listingCoverImageUrl } from "./media";
import type { StepProps } from "./types";

interface ChecklistItem {
  label: string;
  ok: boolean;
  hint: string;
}

export function StepReview({ draft }: StepProps) {
  const cleanDesc = stripHtml(draft.description);
  const gradient = TYPE_GRADIENTS[draft.propertyType] ?? FALLBACK_GRADIENT;
  const price = askingPriceNumber(draft);
  const sqft = totalSqFt(draft);
  const area = formatLandAreaLabel(draft);
  const builtUp = builtUpAreaNumber(draft);
  const isBuilding = isBuildingType(draft.propertyType);
  const photoCount = draft.media.filter(
    (m) => m.type !== "VIDEO_WALKTHROUGH" && m.type !== "CADASTRAL_MAP",
  ).length;
  const hasNaksa = draft.media.some((m) => m.type === "CADASTRAL_MAP");
  const locationLine = [draft.areaName.trim(), draft.district]
    .filter(Boolean)
    .join(", ");

  // Land types are sold by land area; building types by built-up area (or
  // land area when the parcel is included but no built-up area is entered).
  const areaOk = isLandType(draft.propertyType)
    ? sqft > 0
    : builtUp > 0 || sqft > 0;
  const areaHint = isBuilding
    ? builtUp > 0
      ? `${builtUp.toLocaleString()} sq ft built-up`
      : sqft > 0
        ? `${sqft.toLocaleString()} sq ft land`
        : "missing"
    : sqft > 0
      ? `${sqft.toLocaleString()} sq ft`
      : "missing";

  const checklist: ChecklistItem[] = [
    {
      label: "Title",
      ok: draft.title.trim().length >= 5,
      hint: draft.title.trim().length >= 5 ? "ready" : "missing",
    },
    {
      label: "Photos",
      ok: photoCount > 0,
      hint: photoCount > 0 ? `${photoCount} uploaded` : "none",
    },
    {
      label: "Asking price",
      ok: price > 0,
      hint: price > 0 ? formatNPR(price) : "missing",
    },
    {
      label: "Location",
      ok: Boolean(
        draft.province && draft.district && draft.municipality && draft.ward && draft.areaName.trim(),
      ),
      hint: locationLine || "incomplete",
    },
    {
      label: isBuilding ? "Area" : "Land area",
      ok: areaOk,
      hint: areaHint,
    },
    {
      label: "Cadastral record (Naksa)",
      ok: hasNaksa,
      hint: hasNaksa ? "attached" : "not added yet",
    },
  ];

  const meta: string[] = [];
  if (area) meta.push(area);
  if (isBuilding && builtUp > 0) meta.push(`${builtUp.toLocaleString()} sq ft built-up`);
  if (draft.facing) meta.push(`${labelEnum(draft.facing, {})} facing`);
  if (draft.roadType || draft.roadWidthFt) {
    meta.push(
      [
        draft.roadWidthFt ? `${draft.roadWidthFt}ft` : null,
        draft.roadType ? labelEnum(draft.roadType, {}) : null,
      ]
        .filter(Boolean)
        .join(" ") + " road",
    );
  }
  if (draft.isCornerPlot) meta.push("Corner plot");

  // Type-specific spec chips (wizard-only fields — shown as entered).
  if (draft.propertyType === "RESIDENTIAL_HOUSE") {
    if (draft.propertySubtype)
      meta.push(labelEnum(draft.propertySubtype, {}));
    if (draft.bedrooms) meta.push(`${draft.bedrooms} BHK`);
    if (draft.bathrooms) meta.push(`${draft.bathrooms} bath`);
  }
  if (draft.propertyType === "COMMERCIAL_LAND" && draft.frontageFt)
    meta.push(`${draft.frontageFt} ft frontage`);
  if (draft.propertyType === "COMMERCIAL_SPACE") {
    if (draft.propertySubtype) meta.push(labelEnum(draft.propertySubtype, {}));
    if (draft.frontageFt) meta.push(`${draft.frontageFt} ft frontage`);
  }
  if (draft.propertyType === "AGRICULTURAL_LAND") {
    if (draft.landClassification)
      meta.push(labelEnum(draft.landClassification, {}));
  }
  if (draft.propertyType === "HERITAGE_HOME") {
    if (draft.heritageType) meta.push(labelEnum(draft.heritageType, {}));
    if (draft.bedrooms) meta.push(`${draft.bedrooms} bedrooms`);
  }
  if (draft.askingPrice && draft.isNegotiable) meta.push("Negotiable");

  const coverUrl = listingCoverImageUrl(draft.media);

  return (
    <div className="grid grid-cols-1 gap-md lg:grid-cols-3">
      {/* Preview mirror — same shape as the public feed card */}
      <div className="lg:col-span-2 flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface">
        <div
          className={cn("relative h-44 bg-gradient-to-br", gradient)}
          aria-hidden
        >
          {coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-surface/95 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-tertiary">
            <Icon name="pending_actions" className="text-[12px]" /> Unverified
          </span>
          {photoCount > 1 && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-surface/95 px-2 py-1 text-[10px] font-bold text-on-surface-variant">
              <Icon name="photo_camera" className="text-[12px]" />
              {photoCount}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-sm p-md">
          <span className="rounded bg-surface-container px-2 py-0.5 w-fit text-[11px] font-medium text-on-surface-variant">
            {labelEnum(draft.propertyType, TYPE_LABELS)}
          </span>
          <h3 className="font-headline-md text-lg font-medium text-on-surface">
            {draft.title.trim() || "Untitled listing"}
          </h3>
          <p className="mono-stat text-lg font-semibold text-primary">
            {price > 0 ? formatNPR(price) : "—"}
          </p>
          <p className="text-sm text-on-surface-variant">
            {locationLine || "Location not specified"}
          </p>
          {cleanDesc && (
            <p className="line-clamp-2 text-sm text-on-surface-variant">
              {cleanDesc}
            </p>
          )}
          {meta.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-outline-variant pt-sm text-sm text-on-surface-variant">
              {meta.map((m) => (
                <span
                  key={m}
                  className="rounded bg-surface-container px-2 py-0.5 text-[12px]"
                >
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Checklist sidebar — reflects the actual draft */}
      <div className="flex flex-col gap-md">
        <div className="rounded-2xl border border-outline-variant bg-surface p-md">
          <h4 className="mb-sm font-headline-md text-base font-semibold text-on-surface">
            Readiness checklist
          </h4>
          <ul className="flex flex-col gap-sm">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-sm text-sm">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    item.ok
                      ? "bg-primary text-on-primary"
                      : "bg-[#b45309]/10 text-[#b45309]",
                  )}
                >
                  <Icon
                    name={item.ok ? "check" : "pending"}
                    className="text-[16px]"
                  />
                </span>
                <span className="flex-1 text-on-surface">{item.label}</span>
                <span className="text-[11px] text-on-surface-variant">
                  {item.hint}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-md rounded-md bg-surface-container p-sm text-[12px] leading-5 text-on-surface-variant">
            Publishing puts the listing on the public feed immediately as{" "}
            <strong>UNVERIFIED</strong>. Our verification team then reviews
            ownership documents to raise the verification level.
          </p>
        </div>
      </div>
    </div>
  );
}
