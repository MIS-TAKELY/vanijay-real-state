"use client";

import { cn, Icon, Input, Label, Textarea, ToggleGroup, ToggleGroupItem } from "@repo/ui";
import { PROPERTY_TYPES } from "./constants";
import { DESC_MAX, TITLE_MAX } from "./draft";
import { FieldError, type StepProps } from "./types";

export function StepBasics({ draft, update, errors }: StepProps) {
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
            className={cn("h-11 pr-14", errors.title && "border-error")}
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
          className="grid grid-cols-2 gap-sm sm:grid-cols-3 justify-start"
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
              <span className="text-[11px] text-on-surface-variant">{pt.desc}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-xs">
        <Label htmlFor="w-desc">Description</Label>
        <Textarea
          id="w-desc"
          rows={4}
          value={draft.description}
          maxLength={DESC_MAX}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Describe the plot, access, nearby facilities, and verification highlights…"
          aria-invalid={!!errors.description}
          className={cn(errors.description && "border-error")}
        />
        <div className="flex items-start justify-between gap-sm">
          <FieldError message={errors.description} />
          <span className="mono-stat ml-auto shrink-0 text-[11px] text-on-surface-variant">
            {draft.description.length}/{DESC_MAX}
          </span>
        </div>
      </div>

      {/* Asking price */}
      <div className="flex flex-col gap-xs">
        <Label htmlFor="w-price">Asking price (NPR)</Label>
        <Input
          id="w-price"
          type="text"
          inputMode="numeric"
          value={draft.askingPrice}
          onChange={(e) =>
            update({ askingPrice: e.target.value.replace(/[^0-9,]/g, "") })
          }
          placeholder="2,45,00,000"
          aria-invalid={!!errors.askingPrice}
          className={cn("mono-stat h-11 sm:max-w-xs", errors.askingPrice && "border-error")}
        />
        <FieldError message={errors.askingPrice} />
      </div>
    </div>
  );
}
