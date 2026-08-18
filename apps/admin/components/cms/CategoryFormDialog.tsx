"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  MAIN_CATEGORIES,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@repo/ui";
import type { CmsContentItem } from "lib/api";
import { CmsImageField } from "./CmsImageField";

export interface CategoryFormValues {
  key: string;
  name: string;
  mainCategory: string;
  image: string;
  sortOrder: number;
  published: boolean;
  color: string;
  darkColor: string;
}

export const CATEGORY_DEFAULTS: {
  key: string;
  name: string;
  mainCategory: string;
  image: string;
  color: string;
  darkColor: string;
}[] = [
  {
    key: "residential",
    name: "Residential",
    mainCategory: "RESIDENTIAL",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=200&fit=crop",
    color: "from-blue-500 to-purple-600",
    darkColor: "from-blue-600 to-purple-700",
  },
  {
    key: "commercial",
    name: "Commercial",
    mainCategory: "COMMERCIAL",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=200&fit=crop",
    color: "from-amber-500 to-orange-600",
    darkColor: "from-amber-600 to-orange-700",
  },
  {
    key: "industrial",
    name: "Industrial",
    mainCategory: "INDUSTRIAL",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop",
    color: "from-slate-500 to-zinc-700",
    darkColor: "from-slate-600 to-zinc-800",
  },
  {
    key: "land",
    name: "Land",
    mainCategory: "LAND",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&h=200&fit=crop",
    color: "from-emerald-500 to-teal-600",
    darkColor: "from-emerald-600 to-teal-700",
  },
  {
    key: "institutional",
    name: "Special Purpose",
    mainCategory: "INSTITUTIONAL_SPECIALIZED",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop",
    color: "from-rose-500 to-pink-600",
    darkColor: "from-rose-600 to-pink-700",
  },
];

export function slugFromName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function metaString(item: CmsContentItem | null, key: string) {
  const meta = item?.metadata;
  if (!meta || typeof meta !== "object") return "";
  const value = (meta as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

interface CategoryFormDialogProps {
  open: boolean;
  item: CmsContentItem | null;
  usedKeys: string[];
  nextSortOrder: number;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: CategoryFormValues) => Promise<void> | void;
}

export function CategoryFormDialog({
  open,
  item,
  usedKeys,
  nextSortOrder,
  saving,
  onOpenChange,
  onSave,
}: CategoryFormDialogProps) {
  const formId = useId();
  const [key, setKey] = useState("");
  const [image, setImage] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [published, setPublished] = useState(true);
  const [color, setColor] = useState("from-blue-500 to-purple-600");
  const [darkColor, setDarkColor] = useState("from-blue-600 to-purple-700");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const options = useMemo(() => {
    const fromDefaults = CATEGORY_DEFAULTS.map((c) => ({
      key: c.key,
      name: c.name,
      mainCategory: c.mainCategory,
    }));
    const extra = MAIN_CATEGORIES.filter(
      (mc) =>
        !fromDefaults.some((d) => d.mainCategory === mc.key),
    ).map((mc) => ({
      key: slugFromName(mc.label),
      name: mc.label,
      mainCategory: mc.key,
    }));
    if (item && !fromDefaults.some((d) => d.key === item.key) && !extra.some((d) => d.key === item.key)) {
      extra.push({
        key: item.key,
        name: item.title || item.key,
        mainCategory: metaString(item, "mainCategory") || item.key,
      });
    }
    return [...fromDefaults, ...extra];
  }, [item]);

  useEffect(() => {
    if (!open) return;
    const fallback =
      CATEGORY_DEFAULTS.find((c) => !usedKeys.includes(c.key)) ??
      CATEGORY_DEFAULTS[0];
    const selected = item
      ? options.find((o) => o.key === item.key)
      : fallback;
    const preset = selected
      ? CATEGORY_DEFAULTS.find((c) => c.key === selected.key)
      : undefined;
    setKey(item?.key ?? selected?.key ?? "");
    setImage(item?.image ?? preset?.image ?? "");
    setSortOrder(item?.sortOrder ?? nextSortOrder);
    setPublished(item?.published ?? true);
    setColor(metaString(item, "color") || preset?.color || "from-blue-500 to-purple-600");
    setDarkColor(
      metaString(item, "darkColor") ||
        preset?.darkColor ||
        "from-blue-600 to-purple-700",
    );
    setErrors({});
  }, [open, item, nextSortOrder, options, usedKeys]);

  const selected = options.find((o) => o.key === key);

  function applyPreset(nextKey: string) {
    setKey(nextKey);
    const preset = CATEGORY_DEFAULTS.find((c) => c.key === nextKey);
    if (!item && preset) {
      if (!image) setImage(preset.image);
      setColor(preset.color);
      setDarkColor(preset.darkColor);
    }
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!key) next.key = "Select a category.";
    if (!item && usedKeys.includes(key)) {
      next.key = "That category card already exists.";
    }
    if (!color.trim()) next.color = "Enter a Tailwind gradient.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !selected) return;
    await onSave({
      key: selected.key,
      name: selected.name,
      mainCategory: selected.mainCategory,
      image: image.trim(),
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      published,
      color: color.trim(),
      darkColor: darkColor.trim(),
    });
  }

  const isEdit = Boolean(item);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Category Card" : "Create Category Card"}
          </DialogTitle>
          <DialogDescription>
            Configure the category card that will appear on the homepage.
          </DialogDescription>
        </DialogHeader>
        <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
          {Object.keys(errors).length > 0 ? (
            <div
              role="alert"
              tabIndex={-1}
              className="rounded-md border border-error/40 bg-error/5 px-3 py-2 text-sm text-error"
            >
              Fix the highlighted fields before saving.
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="category-select">Category *</Label>
              <Select
                value={key}
                onValueChange={applyPreset}
                disabled={isEdit}
              >
                <SelectTrigger
                  id="category-select"
                  className="w-full bg-surface"
                  aria-invalid={Boolean(errors.key)}
                  aria-describedby={errors.key ? "category-select-error" : undefined}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem
                      key={option.key}
                      value={option.key}
                      disabled={!isEdit && usedKeys.includes(option.key)}
                    >
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.key ? (
                <p id="category-select-error" className="mt-1 text-xs text-error">
                  {errors.key}
                </p>
              ) : null}
            </div>
            <CmsImageField
              value={image}
              onChange={setImage}
              recommended="Square (500x500px)"
            />
          </div>
          <div className="flex flex-wrap items-end gap-6">
            <div className="w-32">
              <Label htmlFor="category-order">Sort Order *</Label>
              <Input
                id="category-order"
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="bg-surface"
              />
            </div>
            <div className="flex items-center gap-3 pb-1">
              <Switch
                id="category-active"
                checked={published}
                onCheckedChange={setPublished}
              />
              <Label htmlFor="category-active" className="cursor-pointer">
                Active
              </Label>
            </div>
          </div>
          <div>
            <Label htmlFor="category-color">Color (Tailwind gradient) *</Label>
            <Input
              id="category-color"
              placeholder="from-blue-500 to-purple-600"
              value={color}
              aria-invalid={Boolean(errors.color)}
              aria-describedby={errors.color ? "category-color-error" : undefined}
              onChange={(e) => setColor(e.target.value)}
              className="bg-surface"
            />
            {errors.color ? (
              <p id="category-color-error" className="mt-1 text-xs text-error">
                {errors.color}
              </p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="category-dark-color">Dark Color (optional)</Label>
            <Input
              id="category-dark-color"
              placeholder="from-blue-600 to-purple-700"
              value={darkColor}
              onChange={(e) => setDarkColor(e.target.value)}
              className="bg-surface"
            />
          </div>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="border-outline-variant"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={saving}
            className="bg-on-surface text-surface hover:bg-on-surface/90"
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
