"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "./RichTextEditor";
import { MAIN_CATEGORIES, SUB_TO_MAIN } from "./constants";
import { TITLE_MAX } from "./draft";
import { FieldError, type StepProps } from "./types";

export function StepBasics({ draft, update, errors }: StepProps) {
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

      {/* Category & Specific Type Dropdowns */}
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        {/* Main Category */}
        <div className="flex flex-col gap-xs">
          <Label htmlFor="w-main-category">Property category</Label>
          <Select
            value={draft.mainCategory || undefined}
            onValueChange={(val) => {
              const newSub =
                draft.subCategory && SUB_TO_MAIN[draft.subCategory] === val
                  ? draft.subCategory
                  : "";
              update({ mainCategory: val, subCategory: newSub });
            }}
          >
            <SelectTrigger
              id="w-main-category"
              className={cn(
                "h-11 w-full",
                errors.subCategory && !draft.mainCategory && "border-error",
              )}
            >
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {MAIN_CATEGORIES.map((mc) => (
                <SelectItem key={mc.key} value={mc.key}>
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded text-on-surface-variant">
                      <Icon name={mc.icon} className="text-[16px]" />
                    </span>
                    <span>{mc.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sub Category / Property Type */}
        <div className="flex flex-col gap-xs">
          <Label htmlFor="w-sub-category">Property type</Label>
          <Select
            value={draft.subCategory || undefined}
            disabled={!draft.mainCategory}
            onValueChange={(val) => {
              const mainKey = SUB_TO_MAIN[val] || draft.mainCategory;
              update({ mainCategory: mainKey, subCategory: val });
            }}
          >
            <SelectTrigger
              id="w-sub-category"
              className={cn(
                "h-11 w-full",
                errors.subCategory && "border-error",
              )}
            >
              <SelectValue
                placeholder={
                  draft.mainCategory
                    ? `Select ${selectedMainDef?.label.toLowerCase() || "property"} type`
                    : "Select category first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {selectedMainDef?.subCategories.map((sc) => (
                <SelectItem key={sc.key} value={sc.key}>
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded text-on-surface-variant">
                      <Icon name={sc.icon} className="text-[15px]" />
                    </span>
                    <span>{sc.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <FieldError message={errors.subCategory} />

      {/* Description — Rich Text Editor */}
      <div className="flex flex-col gap-xs">
        <Label htmlFor="w-desc">Description</Label>
        <RichTextEditor
          id="w-desc"
          value={draft.description}
          onChange={(html) => update({ description: html })}
          placeholder="Describe the plot, access, nearby facilities, and verification highlights…"
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
