"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RichTextEditor } from "./RichTextEditor";
import { PROPERTY_TYPES } from "./constants";
import { DESC_MAX, TITLE_MAX } from "./draft";
import { stripHtml } from "./format";
import { FieldError, type StepProps } from "./types";

export function StepBasics({ draft, update, errors }: StepProps) {
  const cleanDesc = stripHtml(draft.description);
  const plainDescLength = cleanDesc.length;
  const isDescOverLimit =
    plainDescLength > DESC_MAX || draft.description.length > DESC_MAX;

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

      {/* Property type — 6 cards */}
      <div className="flex flex-col gap-xs">
        <Label>Property type</Label>
        <ToggleGroup
          type="single"
          value={draft.propertyType}
          onValueChange={(v) => {
            if (v) update({ propertyType: v });
          }}
          aria-label="Property type"
          variant="outline"
          className="grid grid-cols-2 gap-sm sm:grid-cols-3 justify-start w-full "
        >
          {PROPERTY_TYPES.map((pt) => (
            <ToggleGroupItem
              key={pt.key}
              value={pt.key}
              aria-label={pt.label}
              className={cn(
                "flex flex-col items-start gap-xs rounded-xl border p-sm text-left transition-colors data-[state=on]:border-primary data-[state=on]:bg-primary/5 data-[state=on]:ring-1 data-[state=on]:ring-primary/30 data-[state=off]:border-outline-variant data-[state=off]:bg-surface data-[state=off]:hover:border-primary/40 h-auto",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  draft.propertyType === pt.key
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-variant",
                )}
              >
                <Icon name={pt.icon} className="text-[20px]" />
              </span>
              <span className="text-sm font-medium text-on-surface">
                {pt.label}
              </span>
              <span className="text-[11px] text-on-surface-variant">
                {pt.desc}
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
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
          className={cn((errors.description || isDescOverLimit) && "border-error")}
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
