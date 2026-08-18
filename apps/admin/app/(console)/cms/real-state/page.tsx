"use client";

import { useEffect, useRef, useState } from "react";
import {
  Alert,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Icon,
  Input,
  Label,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  toast,
} from "@repo/ui";
import { AdminDataTable } from "components/AdminDataTable";
import { BannerFormDialog, type BannerFormValues } from "components/cms/BannerFormDialog";
import {
  CATEGORY_DEFAULTS,
  CategoryFormDialog,
  type CategoryFormValues,
} from "components/cms/CategoryFormDialog";
import { PageHeader } from "components/ui/PageHeader";
import {
  cmsDelete,
  cmsListItems,
  cmsPublish,
  cmsReorder,
  cmsUpsertItem,
  listingPerformance,
  CmsContentItem,
} from "lib/api";

const PLACEMENT = "REAL_STATE_HOME" as const;
const CATEGORY_SLOT = "CATEGORY" as const;
const BANNER_SLOT = "HERO_BANNER" as const;

function asMeta(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function metaString(item: CmsContentItem, key: string) {
  const value = asMeta(item.metadata)[key];
  return typeof value === "string" ? value : "";
}

function gradientPreview(value: string) {
  const hexes = value.match(/#[0-9a-fA-F]{3,8}/g);
  if (hexes && hexes.length >= 2) {
    return `linear-gradient(to right, ${hexes.join(", ")})`;
  }
  if (hexes?.[0]) return hexes[0];
  return undefined;
}

function withSortOrder(items: CmsContentItem[]) {
  return items.map((item, index) => ({ ...item, sortOrder: index }));
}

export default function RealStateCmsPage() {
  const [banners, setBanners] = useState<CmsContentItem[]>([]);
  const [categories, setCategories] = useState<CmsContentItem[]>([]);
  const [items, setItems] = useState<CmsContentItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [bannerOpen, setBannerOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<CmsContentItem | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CmsContentItem | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<CmsContentItem | null>(null);
  const [tab, setTab] = useState("banners");

  async function seedDefaultCategories() {
    await Promise.all(
      CATEGORY_DEFAULTS.map((cat, index) =>
        cmsUpsertItem({
          placement: PLACEMENT,
          slot: CATEGORY_SLOT,
          key: cat.key,
          title: cat.name,
          image: cat.image,
          metadata: {
            mainCategory: cat.mainCategory,
            color: cat.color,
            darkColor: cat.darkColor,
          },
          sortOrder: index,
          published: true,
        }),
      ),
    );
  }

  async function load(silent = false) {
    if (!silent) setLoading(true);
    try {
      const [all, performance] = await Promise.all([
        cmsListItems(PLACEMENT),
        listingPerformance(365).catch(() => null),
      ]);
      let categoryItems = all.filter((i) => i.slot === CATEGORY_SLOT);
      // Reconcile the category cards to the five canonical main categories:
      // seed on first visit, and replace stale/legacy tiles (e.g. rows seeded
      // before this editor existed) whenever a canonical category is missing.
      // Once all five canonical keys exist, admin edits (rename, reorder,
      // extra cards) are left untouched.
      const missingCanonical = CATEGORY_DEFAULTS.some(
        (c) => !categoryItems.some((i) => i.key === c.key),
      );
      if (categoryItems.length === 0 || missingCanonical) {
        await Promise.all(categoryItems.map((i) => cmsDelete(i.id)));
        await seedDefaultCategories();
        categoryItems = await cmsListItems(PLACEMENT, CATEGORY_SLOT);
      }
      setCategories(
        categoryItems.slice().sort((a, b) => a.sortOrder - b.sortOrder),
      );
      setBanners(
        all
          .filter((i) => i.slot === BANNER_SLOT)
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder),
      );
      setItems(
        all.filter((i) => i.slot !== CATEGORY_SLOT && i.slot !== BANNER_SLOT),
      );
      const nextCounts: Record<string, number> = {};
      for (const row of performance?.byType ?? []) {
        nextCounts[row.mainCategory] = row._count._all;
      }
      setCounts(nextCounts);
      setError(null);
    } catch {
      setError(
        "Could not load CMS items. Ensure you are signed in and the API is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveBanner(values: BannerFormValues) {
    const key =
      editingBanner?.key ??
      `hero-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    setSaving(true);
    try {
      await cmsUpsertItem({
        placement: PLACEMENT,
        slot: BANNER_SLOT,
        key,
        title: values.title,
        subtitle: values.subtitle || null,
        image: values.image,
        ctaHref: values.ctaHref || null,
        ctaLabel: values.ctaLabel || null,
        sortOrder: values.sortOrder,
        published: values.published,
      });
      toast.success(editingBanner ? "Banner saved" : "Banner added");
      setBannerOpen(false);
      setEditingBanner(null);
      await load(true);
    } catch {
      toast.error("Could not save banner");
    } finally {
      setSaving(false);
    }
  }

  async function saveCategory(values: CategoryFormValues) {
    setSaving(true);
    try {
      await cmsUpsertItem({
        placement: PLACEMENT,
        slot: CATEGORY_SLOT,
        key: values.key,
        title: values.name,
        image: values.image || null,
        metadata: {
          mainCategory: values.mainCategory,
          color: values.color,
          darkColor: values.darkColor || undefined,
        },
        sortOrder: values.sortOrder,
        published: values.published,
      });
      toast.success(editingCategory ? "Category card saved" : "Category card added");
      setCategoryOpen(false);
      setEditingCategory(null);
      await load(true);
    } catch {
      toast.error("Could not save category card");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await cmsDelete(deleteTarget.id);
      toast.success(`Deleted ${deleteTarget.title || deleteTarget.key}`);
      setDeleteTarget(null);
      await load(true);
    } catch {
      toast.error("Delete failed");
    }
  }

  return (
    <>
      <PageHeader
        icon="home"
        title="Landing Page Content"
        description="Manage the content displayed on the buyer-facing landing page."
      />
      <section className="mt-lg">
        {error && (
          <Alert className="mb-md border-error/40 text-error">{error}</Alert>
        )}
        {loading ? (
          <p className="text-on-surface-variant">Loading content…</p>
        ) : (
          <Tabs value={tab} onValueChange={setTab} className="gap-md">
            <TabsList className="h-auto w-full max-w-full flex-wrap justify-start rounded-lg bg-surface-container p-1">
              <TabsTrigger value="banners" className="px-4 py-2">
                Hero Banners
              </TabsTrigger>
              <TabsTrigger value="categories" className="px-4 py-2">
                Category Cards
              </TabsTrigger>
              <TabsTrigger value="other" className="px-4 py-2">
                Other Content
              </TabsTrigger>
            </TabsList>

            <TabsContent value="banners">
              <BannerSection
                banners={banners}
                onAdd={() => {
                  setEditingBanner(null);
                  setBannerOpen(true);
                }}
                onEdit={(item) => {
                  setEditingBanner(item);
                  setBannerOpen(true);
                }}
                onDelete={setDeleteTarget}
                onOrdered={setBanners}
                onRestore={() => void load(true)}
              />
            </TabsContent>

            <TabsContent value="categories">
              <CategorySection
                categories={categories}
                counts={counts}
                onAdd={() => {
                  setEditingCategory(null);
                  setCategoryOpen(true);
                }}
                onEdit={(item) => {
                  setEditingCategory(item);
                  setCategoryOpen(true);
                }}
                onDelete={setDeleteTarget}
                onOrdered={setCategories}
                onRestore={() => void load(true)}
              />
            </TabsContent>

            <TabsContent value="other">
              <div className="flex flex-col gap-md">
                {items.map((item) => (
                  <CmsItemCard
                    key={item.id}
                    item={item}
                    onChange={() => void load(true)}
                  />
                ))}
                <AddCmsItem
                  placement={PLACEMENT}
                  onAdded={() => void load(true)}
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </section>

      <BannerFormDialog
        open={bannerOpen}
        item={editingBanner}
        nextSortOrder={banners.length}
        saving={saving}
        onOpenChange={(open) => {
          setBannerOpen(open);
          if (!open) setEditingBanner(null);
        }}
        onSave={saveBanner}
      />
      <CategoryFormDialog
        open={categoryOpen}
        item={editingCategory}
        usedKeys={categories.map((c) => c.key)}
        nextSortOrder={categories.length}
        saving={saving}
        onOpenChange={(open) => {
          setCategoryOpen(open);
          if (!open) setEditingCategory(null);
        }}
        onSave={saveCategory}
      />
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.title || deleteTarget?.key}” will be removed from
              the landing page. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void confirmDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SectionHeader({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="mb-md flex flex-wrap items-start justify-between gap-sm">
      <div>
        <h2 className="font-headline-md text-lg font-semibold text-on-surface">
          {title}
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant">{description}</p>
      </div>
      <Button
        onClick={onAction}
        className="bg-on-surface text-surface hover:bg-on-surface/90"
      >
        <Icon name="add" /> {actionLabel}
      </Button>
    </div>
  );
}

function BannerSection({
  banners,
  onAdd,
  onEdit,
  onDelete,
  onOrdered,
  onRestore,
}: {
  banners: CmsContentItem[];
  onAdd: () => void;
  onEdit: (item: CmsContentItem) => void;
  onDelete: (item: CmsContentItem) => void;
  onOrdered: (items: CmsContentItem[]) => void;
  onRestore: () => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [cards, setCards] = useState(banners);
  const cardsRef = useRef(cards);
  cardsRef.current = cards;

  useEffect(() => {
    setCards(banners);
  }, [banners]);

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragIndex === null || dragIndex === index) return;
    const next = [...cards];
    const [moved] = next.splice(dragIndex, 1);
    if (!moved) return;
    next.splice(index, 0, moved);
    setCards(withSortOrder(next));
    setDragIndex(index);
  }

  async function handleDragEnd() {
    const ordered = withSortOrder(cardsRef.current);
    const unchanged =
      ordered.length === banners.length &&
      ordered.every((item, i) => item.id === banners[i]?.id);
    onOrdered(ordered);
    setDragIndex(null);
    if (unchanged) return;
    try {
      await cmsReorder(
        PLACEMENT,
        BANNER_SLOT,
        ordered.map((r) => r.id),
      );
      toast.success("Banner order updated");
    } catch {
      toast.error("Order save failed");
      onRestore();
    }
  }

  return (
    <div>
      <SectionHeader
        title="Hero Banners"
        description="Drag cards to set the homepage carousel order."
        actionLabel="Add Banner"
        onAction={onAdd}
      />
      {cards.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          No banners yet — add one to get started.
        </p>
      ) : (
        <div className="grid gap-md sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((banner, index) => (
            <article
              key={banner.id}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => e.preventDefault()}
              className={`overflow-hidden rounded-xl border border-outline-variant bg-surface ${
                dragIndex === index ? "opacity-40" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => onEdit(banner)}
                className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Edit banner ${banner.title || banner.key}`}
              >
                <div className="aspect-[16/9] bg-surface-container">
                  {banner.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={banner.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-on-surface-variant">
                      <Icon name="image" className="text-[28px]" />
                    </div>
                  )}
                </div>
              </button>
              <div className="flex items-center gap-2 px-3 py-2.5">
                <button
                  type="button"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", String(index));
                    handleDragStart(index);
                  }}
                  onDragEnd={() => void handleDragEnd()}
                  className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-md text-on-surface-variant hover:bg-secondary-container hover:text-primary active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Reorder ${banner.title || banner.key}`}
                >
                  <Icon name="drag_indicator" />
                </button>
                <span className="text-sm text-on-surface-variant">
                  Order: {index}
                </span>
                {banner.ctaHref ? (
                  <a
                    href={banner.ctaHref}
                    target="_blank"
                    rel="noreferrer"
                    className="ms-auto inline-flex items-center gap-1 text-sm text-blue-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Link
                    <Icon name="open_in_new" className="text-[14px]" />
                  </a>
                ) : (
                  <span className="ms-auto text-sm text-on-surface-variant">
                    No link
                  </span>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Edit ${banner.title || banner.key}`}
                  onClick={() => onEdit(banner)}
                >
                  <Icon name="edit" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-error hover:text-error"
                  aria-label={`Delete ${banner.title || banner.key}`}
                  onClick={() => onDelete(banner)}
                >
                  <Icon name="delete" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function CategorySection({
  categories,
  counts,
  onAdd,
  onEdit,
  onDelete,
  onOrdered,
  onRestore,
}: {
  categories: CmsContentItem[];
  counts: Record<string, number>;
  onAdd: () => void;
  onEdit: (item: CmsContentItem) => void;
  onDelete: (item: CmsContentItem) => void;
  onOrdered: (items: CmsContentItem[]) => void;
  onRestore: () => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [rows, setRows] = useState(categories);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  useEffect(() => {
    setRows(categories);
  }, [categories]);

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragIndex === null || dragIndex === index) return;
    const next = [...rows];
    const [moved] = next.splice(dragIndex, 1);
    if (!moved) return;
    next.splice(index, 0, moved);
    setRows(withSortOrder(next));
    setDragIndex(index);
  }

  async function handleDragEnd() {
    const ordered = withSortOrder(rowsRef.current);
    const unchanged =
      ordered.length === categories.length &&
      ordered.every((item, i) => item.id === categories[i]?.id);
    onOrdered(ordered);
    setDragIndex(null);
    if (unchanged) return;
    try {
      await cmsReorder(
        PLACEMENT,
        CATEGORY_SLOT,
        ordered.map((r) => r.id),
      );
      toast.success("Category order updated");
    } catch {
      toast.error("Order save failed");
      onRestore();
    }
  }

  async function togglePublished(item: CmsContentItem, published: boolean) {
    try {
      await cmsPublish(item.id, published);
      onOrdered(
        rows.map((row) =>
          row.id === item.id ? { ...row, published } : row,
        ),
      );
      toast.success(published ? "Category activated" : "Category hidden");
    } catch {
      toast.error("Could not update status");
    }
  }

  return (
    <div>
      <SectionHeader
        title="Category Cards"
        description="Manage the category cards displayed at the top of the homepage."
        actionLabel="Add Category Card"
        onAction={onAdd}
      />
      <AdminDataTable
        minWidth={860}
        empty={rows.length === 0}
        emptyMessage="No category cards yet — add one to get started."
        columns={[
          { label: "", className: "w-10" },
          "Category",
          "Image",
          "Count",
          "Color",
          "Sort Order",
          "Active",
          { label: "Actions", align: "right" },
        ]}
      >
        {rows.map((row, index) => {
          const mainCategory = metaString(row, "mainCategory");
          const color = metaString(row, "color");
          const count = counts[mainCategory] ?? 0;
          const preview = gradientPreview(color);
          return (
            <AdminDataTable.Row
              key={row.id}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => e.preventDefault()}
              className={dragIndex === index ? "opacity-40" : undefined}
            >
              <AdminDataTable.Cell className="w-10">
                <button
                  type="button"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", String(index));
                    handleDragStart(index);
                  }}
                  onDragEnd={() => void handleDragEnd()}
                  className="flex h-9 w-9 cursor-grab items-center justify-center rounded-md text-on-surface-variant hover:bg-secondary-container hover:text-primary active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Reorder ${row.title || row.key}`}
                >
                  <Icon name="drag_indicator" />
                </button>
              </AdminDataTable.Cell>
              <AdminDataTable.Cell className="font-medium text-on-surface">
                {row.title || row.key}
              </AdminDataTable.Cell>
              <AdminDataTable.Cell>
                {row.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.image}
                    alt=""
                    className="size-10 rounded-md object-cover"
                  />
                ) : (
                  <span className="flex size-10 items-center justify-center rounded-md bg-surface-container text-on-surface-variant">
                    <Icon name="image" className="text-[18px]" />
                  </span>
                )}
              </AdminDataTable.Cell>
              <AdminDataTable.Cell className="text-on-surface-variant">
                {count}+ items
              </AdminDataTable.Cell>
              <AdminDataTable.Cell>
                {color ? (
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="size-5 shrink-0 rounded-md border border-outline-variant bg-gradient-to-r from-blue-500 to-purple-600"
                      style={preview ? { backgroundImage: preview } : undefined}
                      aria-hidden
                    />
                    <span className="max-w-[140px] truncate text-xs text-on-surface-variant">
                      {color}
                    </span>
                  </span>
                ) : (
                  <span className="text-on-surface-variant">—</span>
                )}
              </AdminDataTable.Cell>
              <AdminDataTable.Cell className="text-on-surface-variant">
                {index}
              </AdminDataTable.Cell>
              <AdminDataTable.Cell>
                <Switch
                  checked={row.published}
                  onCheckedChange={(checked) =>
                    void togglePublished(row, checked)
                  }
                  aria-label={`${row.published ? "Hide" : "Show"} ${row.title || row.key}`}
                />
              </AdminDataTable.Cell>
              <AdminDataTable.Cell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${row.title || row.key}`}
                    onClick={() => onEdit(row)}
                  >
                    <Icon name="edit" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-error hover:text-error"
                    aria-label={`Delete ${row.title || row.key}`}
                    onClick={() => onDelete(row)}
                  >
                    <Icon name="delete" />
                  </Button>
                </div>
              </AdminDataTable.Cell>
            </AdminDataTable.Row>
          );
        })}
      </AdminDataTable>
    </div>
  );
}

function CmsItemCard({
  item,
  onChange,
}: {
  item: CmsContentItem;
  onChange: () => void;
}) {
  const [slot, setSlot] = useState(item.slot);
  const [key, setKey] = useState(item.key);
  const [title, setTitle] = useState(item.title ?? "");
  const [body, setBody] = useState(item.body ?? "");
  const [meta, setMeta] = useState(
    item.metadata ? JSON.stringify(item.metadata, null, 2) : "",
  );

  async function save() {
    try {
      let parsedMeta: unknown = undefined;
      if (meta.trim()) {
        try {
          parsedMeta = JSON.parse(meta);
        } catch {
          toast.error("Meta JSON is invalid");
          return;
        }
      }
      await cmsUpsertItem({
        placement: item.placement,
        slot,
        key,
        title: title || null,
        body: body || null,
        metadata: parsedMeta ?? null,
      });
      toast.success(`Saved ${slot}/${key}`);
      onChange();
    } catch {
      toast.error("Save failed");
    }
  }

  return (
    <div className="admin-surface border border-outline-variant rounded-xl p-md">
      <div className="mb-sm flex items-center gap-sm">
        <span className="inline-flex rounded-full bg-secondary-container px-2 py-0.5 font-label-sm text-[11px] font-bold uppercase tracking-widest text-primary">
          {item.placement}
        </span>
        <h3 className="font-headline-md text-lg font-semibold text-on-surface">
          {slot} · {key}
        </h3>
      </div>
      <div className="grid gap-md md:grid-cols-2">
        <div className="flex flex-col gap-sm">
          <div className="flex gap-sm">
            <div className="flex-1">
              <Label>Slot</Label>
              <Input
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="bg-surface"
              />
            </div>
            <div className="flex-1">
              <Label>Key</Label>
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="bg-surface"
              />
            </div>
          </div>
          <div>
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-surface"
            />
          </div>
        </div>
        <div className="flex flex-col gap-sm">
          <div>
            <Label>Body</Label>
            <Textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="bg-surface"
            />
          </div>
          <div>
            <Label>Meta JSON</Label>
            <Textarea
              rows={3}
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
              className="bg-surface mono-stat text-xs"
            />
          </div>
        </div>
      </div>
      <div className="mt-md flex justify-end border-t border-outline-variant pt-md">
        <Button size="sm" onClick={save}>
          Save content
        </Button>
      </div>
    </div>
  );
}

function AddCmsItem({
  placement,
  onAdded,
}: {
  placement: string;
  onAdded: () => void;
}) {
  const [slot, setSlot] = useState("");
  const [key, setKey] = useState("");
  async function add() {
    if (!slot.trim() || !key.trim()) return;
    try {
      await cmsUpsertItem({ placement, slot: slot.trim(), key: key.trim() });
      toast.success(`Created ${slot}/${key}`);
      setSlot("");
      setKey("");
      onAdded();
    } catch {
      toast.error("Could not create content item");
    }
  }
  return (
    <div className="admin-surface border border-dashed border-outline-variant rounded-xl p-md flex flex-wrap items-end gap-sm">
      <div className="w-40">
        <Label>Slot</Label>
        <Input
          placeholder="hero"
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
          className="bg-surface"
        />
      </div>
      <div className="w-48">
        <Label>Key</Label>
        <Input
          placeholder="headline"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="bg-surface"
        />
      </div>
      <Button size="sm" onClick={add}>
        <Icon name="add" /> Add content
      </Button>
    </div>
  );
}
