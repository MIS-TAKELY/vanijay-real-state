"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RichTextEditor } from "./RichTextEditor";
import { MAIN_CATEGORIES, SUB_TO_MAIN } from "./constants";
import { DESC_MAX, TITLE_MAX } from "./draft";
import { stripHtml } from "./format";
import { FieldError, type StepProps } from "./types";
import { useState } from "react";

export function StepBasics({ draft, update, errors }: StepProps) {
  const cleanDesc = stripHtml(draft.description);
  const plainDescLength = cleanDesc.length;
  const isDescOverLimit =
    plainDescLength > DESC_MAX || draft.description.length > DESC_MAX;

  // Track which main category is expanded for sub-category selection
  const [expandedMain, setExpandedMain] = useState<string | null>(
    draft.mainCategory || null,
  );

  const handleMainSelect = (mainKey: string) => {
    if (expandedMain === mainKey) {
      // Toggle off if clicking the same one
      setExpandedMain(null);
    } else {
      setExpandedMain(mainKey);
      // Clear sub-category when switching main categories
      if (draft.mainCategory !== mainKey) {
        update({ mainCategory: mainKey, subCategory: "" });
      }
    }
  };

  const handleSubSelect = (subKey: string) => {
    const mainKey = SUB_TO_MAIN[subKey];
    if (mainKey) {
      update({ mainCategory: mainKey, subCategory: subKey });
    }
  };

  const selectedMainDef = MAIN_CATEGORIES.find(
    (mc) => mc.key === draft.mainCategory,
  );

  return (
    <div className="flex flex-col gap-md">
      {/* Title + char counter */}
      <div className="flex flex-col gap-xs">
        <Label htmlFor="w-title">Title</Label>
        <div className="relative">
          <Input
            id="w-title"
            type="text"
            value={draft.title}
            maxLength={TITLE_MAX}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="e.g. Bhaisepati Residential Land"
            aria-invalid={!!errors.title}
            className={cn("h-11 pr-14 ", errors.title && "border-error")}
          />
          <span className="mono-stat absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-on-surface-variant">
            {draft.title.length}/{TITLE_MAX}
          </span>
        </div>
        <FieldError message={errors.title} />
      </div>

      {/* Hierarchical Category Selection */}
      <div className="flex flex-col gap-xs">
        <Label>Property category</Label>

        {/* Main Categories */}
        <div className="grid grid-cols-2 gap-sm sm:grid-cols-3 justify-start w-full">
          {MAIN_CATEGORIES.map((mc) => (
            <button
              key={mc.key}
              type="button"
              onClick={() => handleMainSelect(mc.key)}
              className={cn(
                "flex flex-col items-start gap-xs rounded-xl border p-sm text-left transition-colors h-auto",
                draft.mainCategory === mc.key
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-outline-variant bg-surface hover:border-primary/40",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  draft.mainCategory === mc.key
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-variant",
                )}
              >
                <Icon name={mc.icon} className="text-[20px]" />
              </span>
              <span className="text-sm font-medium text-on-surface">
                {mc.label}
              </span>
              <span className="text-[11px] text-on-surface-variant">
                {mc.desc}
              </span>
            </button>
          ))}
        </div>

        {/* Sub Categories - shown when a main category is selected */}
        {expandedMain && selectedMainDef && (
          <div className="mt-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="mb-xs text-xs font-medium text-on-surface-variant">
              Select specific type for {selectedMainDef.label}:
            </p>
            <ToggleGroup
              type="single"
              value={draft.subCategory}
              onValueChange={(v) => {
                if (v) handleSubSelect(v);
              }}
              aria-label="Property sub-type"
              variant="outline"
              className="grid grid-cols-2 gap-sm sm:grid-cols-3 justify-start w-full"
            >
              {selectedMainDef.subCategories.map((sc) => (
                <ToggleGroupItem
                  key={sc.key}
                  value={sc.key}
                  aria-label={sc.label}
                  className={cn(
                    "flex flex-col items-start gap-xs rounded-xl border p-sm text-left transition-colors data-[state=on]:border-primary data-[state=on]:bg-primary/5 data-[state=on]:ring-1 data-[state=on]:ring-primary/30 data-[state=off]:border-outline-variant data-[state=off]:bg-surface data-[state=off]:hover:border-primary/40 h-auto",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      draft.subCategory === sc.key
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container text-on-surface-variant",
                    )}
                  >
                    <Icon name={sc.icon} className="text-[18px]" />
                  </span>
                  <span className="text-sm font-medium text-on-surface">
                    {sc.label}
                  </span>
                  <span className="text-[11px] text-on-surface-variant line-clamp-2">
                    {sc.desc}
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}

        <FieldError message={errors.subCategory} />
      </div>

      {/* Description — Rich Text Editor */}
      <div className="flex flex-col gap-xs">
        <div className="flex items-center justify-between">
          <Label htmlFor="w-desc">Description</Label>
          <span
            className={cn(
              "mono-stat text-[11px] transition-colors",
              isDescOverLimit
                ? "font-semibold text-error"
                : "text-on-surface-variant",
            )}
          >
            {plainDescLength}/{DESC_MAX}
          </span>
        </div>
        <RichTextEditor
          id="w-desc"
          value={draft.description}
          onChange={(html) => update({ description: html })}
          placeholder="Describe the plot, access, nearby facilities, and verification highlights…"
          aria-invalid={!!errors.description || isDescOverLimit}
          className={cn(
            (errors.description || isDescOverLimit) && "border-error",
          )}
        />
        <div className="flex items-start justify-between gap-sm min-h-[18px]">
          <FieldError message={errors.description} />
          {!errors.description && (
            <p className="text-[11px] text-on-surface-variant">
              Format using the toolbar above to highlight key property details.
            </p>
          )}
        </div>
      </div>

      {/* Price is negotiable — applies to every property type */}
      <div className="border-t border-outline-variant pt-md">
        <Label className="flex w-fit cursor-pointer items-center gap-sm text-sm text-on-surface transition-colors hover:text-on-surface-variant">
          <Switch
            checked={draft.isNegotiable}
            onCheckedChange={(v) => update({ isNegotiable: v })}
          />
          Price is negotiable
        </Label>
        <p className="mt-xs text-[11px] leading-4 text-on-surface-variant">
          Buyers may make offers below the asking price.
        </p>
      </div>
    </div>
  );
}
