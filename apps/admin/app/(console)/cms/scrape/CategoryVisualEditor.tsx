"use client";

import { useCallback, useRef, useState } from "react";
import { KabadiCategoryView, type KabadiCategoryViewData, Button, Loader2, toast } from "@repo/ui";
import { cn } from "@repo/ui";
import { adminUploadFile, kabadiUpdateCategory, type KabadiCategory } from "lib/api";

/* ── Editor Component ── */

interface CategoryVisualEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: KabadiCategory | null;
  onSaved: () => void;
}

export function CategoryVisualEditor({
  open,
  onOpenChange,
  category,
  onSaved,
}: CategoryVisualEditorProps) {
  const [saving, setSaving] = useState(false);

  // Track all edits in a mutable ref so we don't re-render on every keystroke
  const editsRef = useRef<Record<string, unknown>>({});
  const [dirty, setDirty] = useState(false);

  const resetEdits = useCallback(() => {
    editsRef.current = {};
    setDirty(false);
  }, []);

  // Build the view data, merging any edits on top of the original category
  const viewData: KabadiCategoryViewData | null = category
    ? {
        ...category,
        ...(editsRef.current as Partial<KabadiCategoryViewData>),
        items: category.items.map((i) => ({
          ...i,
          ...(editsRef.current[`item:${i.id}`] as Record<string, unknown> ?? {}),
        })),
      }
    : null;

  const allCategories: KabadiCategoryViewData[] = [];

  const handleFieldChange = useCallback(
    (field: string, value: unknown) => {
      editsRef.current[field] = value;
      setDirty(true);
    },
    [],
  );

  const handleItemChange = useCallback(
    (itemId: string, field: string, value: unknown) => {
      editsRef.current[`item:${itemId}`] = {
        ...(editsRef.current[`item:${itemId}`] as Record<string, unknown> ?? {}),
        [field]: value,
      };
      setDirty(true);
    },
    [],
  );

  async function handleSave() {
    if (!category?.slug) return;
    setSaving(true);
    try {
      const edits = editsRef.current;

      // Save category-level fields
      const catPatch: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(edits)) {
        if (key.startsWith("item:")) continue;
        if (key === "heroTitle") {
          catPatch.seoTitle = value;
        } else {
          catPatch[key] = value;
        }
      }

      if (Object.keys(catPatch).length > 0) {
        await kabadiUpdateCategory(category.slug, catPatch);
      }

      // Save item-level fields (rate changes)
      for (const [key, value] of Object.entries(edits)) {
        if (!key.startsWith("item:")) continue;
        const itemId = key.replace("item:", "");
        const itemEdits = value as Record<string, unknown>;
        if (itemEdits.rate !== undefined) {
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/admin/kabadi/items`,
            {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: itemId,
                categoryId: category.id,
                name: itemEdits.name ?? category.items.find((i) => i.id === itemId)?.name,
                rate: Number(itemEdits.rate ?? category.items.find((i) => i.id === itemId)?.rate),
              }),
            },
          );
        }
      }

      toast.success(`Saved "${category.name}"`);
      resetEdits();
      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  if (!open || !viewData) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              resetEdits();
              onOpenChange(false);
            }}
            className="flex size-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Editing: {category?.name}
            </h2>
            <p className="text-[11px] text-gray-400">
              Click any text to edit inline · changes preview live
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
              Unsaved changes
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              resetEdits();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={saving || !dirty}
            onClick={handleSave}
            className="gap-2"
          >
            {saving && <Loader2 className="size-3 animate-spin" />}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>

      {/* ── Editable page (the actual UI) ── */}
      <div className="kabadi-app flex-1 overflow-y-auto">
        <KabadiCategoryView
          category={viewData}
          allCategories={allCategories}
          editable
          onFieldChange={handleFieldChange}
          onItemChange={handleItemChange}
        />
      </div>

      {/* ── Hero image upload bar ── */}
      <HeroImageBar
        value={viewData.heroImage || ""}
        onChange={(url) => {
          editsRef.current.heroImage = url;
          setDirty(true);
        }}
      />
    </div>
  );
}

/* ── Hero image upload bar ── */

function HeroImageBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const asset = await adminUploadFile(file, "kabadi");
      onChange(asset.secureUrl || asset.url);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-3 border-t border-gray-200 bg-gray-50 px-6 py-2.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        Hero image
      </span>
      {value && (
        <img
          src={value}
          alt=""
          className="size-8 rounded object-cover"
        />
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded-md border border-gray-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
      >
        {uploading ? "Uploading…" : value ? "Replace" : "Upload image"}
      </button>
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="rounded-md px-2 py-1 text-[11px] font-medium text-red-500 hover:bg-red-50"
        >
          Remove
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
