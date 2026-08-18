"use client";

import { useEffect, useId, useState } from "react";
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
  Switch,
} from "@repo/ui";
import type { CmsContentItem } from "lib/api";
import { CmsImageField } from "./CmsImageField";

export interface BannerFormValues {
  title: string;
  subtitle: string;
  image: string;
  ctaHref: string;
  ctaLabel: string;
  sortOrder: number;
  published: boolean;
}

interface BannerFormDialogProps {
  open: boolean;
  item: CmsContentItem | null;
  nextSortOrder: number;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: BannerFormValues) => Promise<void> | void;
}

export function BannerFormDialog({
  open,
  item,
  nextSortOrder,
  saving,
  onOpenChange,
  onSave,
}: BannerFormDialogProps) {
  const formId = useId();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState("");
  const [ctaHref, setCtaHref] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [published, setPublished] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setTitle(item?.title ?? "");
    setSubtitle(item?.subtitle ?? "");
    setImage(item?.image ?? "");
    setCtaHref(item?.ctaHref ?? "");
    setCtaLabel(item?.ctaLabel ?? "Explore Properties");
    setSortOrder(item?.sortOrder ?? nextSortOrder);
    setPublished(item?.published ?? true);
    setErrors({});
  }, [open, item, nextSortOrder]);

  function validate() {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Enter a banner title.";
    if (!image.trim()) next.image = "Add an image or paste an image URL.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSave({
      title: title.trim(),
      subtitle: subtitle.trim(),
      image: image.trim(),
      ctaHref: ctaHref.trim(),
      ctaLabel: ctaLabel.trim(),
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      published,
    });
  }

  const isEdit = Boolean(item);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Banner" : "Create Banner"}
          </DialogTitle>
          <DialogDescription>
            Configure the homepage hero carousel slide.
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
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="banner-title">Title *</Label>
                <Input
                  id="banner-title"
                  value={title}
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={errors.title ? "banner-title-error" : undefined}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-surface"
                />
                {errors.title ? (
                  <p id="banner-title-error" className="mt-1 text-xs text-error">
                    {errors.title}
                  </p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="banner-subtitle">Subtitle</Label>
                <Input
                  id="banner-subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="bg-surface"
                />
              </div>
              <div>
                <Label htmlFor="banner-link">Link URL</Label>
                <Input
                  id="banner-link"
                  type="url"
                  placeholder="/search"
                  value={ctaHref}
                  onChange={(e) => setCtaHref(e.target.value)}
                  className="bg-surface"
                />
              </div>
              <div>
                <Label htmlFor="banner-cta">Button label</Label>
                <Input
                  id="banner-cta"
                  placeholder="Explore Properties"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  className="bg-surface"
                />
              </div>
            </div>
            <CmsImageField
              value={image}
              onChange={setImage}
              recommended="Landscape (1600x900px)"
              error={errors.image}
              errorId="banner-image-error"
            />
          </div>
          <div className="flex flex-wrap items-end gap-6">
            <div className="w-32">
              <Label htmlFor="banner-order">Sort Order *</Label>
              <Input
                id="banner-order"
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="bg-surface"
              />
            </div>
            <div className="flex items-center gap-3 pb-1">
              <Switch
                id="banner-active"
                checked={published}
                onCheckedChange={setPublished}
              />
              <Label htmlFor="banner-active" className="cursor-pointer">
                Active
              </Label>
            </div>
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
