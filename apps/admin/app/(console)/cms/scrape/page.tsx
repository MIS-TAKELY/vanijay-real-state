"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Loader2,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from "@repo/ui";
import { cn } from "@repo/ui";
import { AdminDataTable } from "components/AdminDataTable";
import { PageHeader } from "components/ui/PageHeader";
import { CategoryVisualEditor } from "./CategoryVisualEditor";
import {
  kabadiCategories,
  kabadiSetRates,
  kabadiUpsertItem,
  kabadiDeleteItem,
  type KabadiCategory,
} from "lib/api";

type EditableItem = {
  id?: string;
  name: string;
  nepali?: string;
  unit: "KG" | "PIECE";
  rate: string;
  popular: boolean;
  published: boolean;
  categoryId: string;
  note?: string;
  sortOrder: number;
};

export default function ScrapeCmsPage() {
  const [cats, setCats] = useState<KabadiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [items, setItems] = useState<EditableItem[]>([]);
  const [saving, setSaving] = useState(false);

  /* ── Add item dialog ── */
  const [addOpen, setAddOpen] = useState(false);
  const [newItem, setNewItem] = useState<{
    name: string;
    nepali: string;
    unit: "KG" | "PIECE";
    rate: string;
    popular: boolean;
    categoryId: string;
    note: string;
  }>({
    name: "",
    nepali: "",
    unit: "KG",
    rate: "",
    popular: false,
    categoryId: "",
    note: "",
  });

  /* ── Category visual editor ── */
  const [catEditorOpen, setCatEditorOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<KabadiCategory | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await kabadiCategories(true);
      setCats(data);
      const flat: EditableItem[] = data.flatMap((c, catIdx) =>
        c.items.map((i, itemIdx) => ({
          id: i.id,
          name: i.name,
          nepali: (i as any).nepali,
          unit: i.unit as "KG" | "PIECE",
          rate: i.rate,
          popular: i.popular,
          published: i.published,
          categoryId: c.id,
          note: (i as any).note,
          sortOrder: i.sortOrder ?? itemIdx,
        })),
      );
      setItems(flat);
      setError(null);
    } catch {
      setError(
        "Could not load kabadi rates. Ensure you are signed in and the API is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const catId = cats.find((c) => c.slug === filter)?.id;
    return items
      .filter((i) => !catId || i.categoryId === catId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [items, filter, cats]);

  // Global index counter for display
  const globalIndex = useCallback(
    (item: EditableItem) => {
      const allSorted = [...items].sort((a, b) => {
        const catA = cats.findIndex((c) => c.id === a.categoryId);
        const catB = cats.findIndex((c) => c.id === b.categoryId);
        if (catA !== catB) return catA - catB;
        return a.sortOrder - b.sortOrder;
      });
      return allSorted.findIndex((i) => i.id === item.id) + 1;
    },
    [items, cats],
  );

  function setRow(indexInFiltered: number, patch: Partial<EditableItem>) {
    const target = filtered[indexInFiltered];
    if (!target) return;
    setItems((prev) =>
      prev.map((i) =>
        (i.id ? i.id === target.id : i.name === target.name)
          ? { ...i, ...patch }
          : i,
      ),
    );
  }

  async function saveAll() {
    setSaving(true);
    try {
      await kabadiSetRates(
        filtered.map((i) => ({
          id: i.id,
          categoryId: i.categoryId,
          name: i.name,
          nepali: i.nepali,
          unit: i.unit,
          rate: Number(i.rate),
          popular: i.popular,
          published: i.published,
          note: i.note,
          sortOrder: i.sortOrder,
        })),
      );
      toast.success(`Saved ${filtered.length} rates`);
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddItem() {
    if (!newItem.name || !newItem.rate || !newItem.categoryId) {
      toast.error("Name, rate, and category are required");
      return;
    }
    try {
      const maxSort = items
        .filter((i) => i.categoryId === newItem.categoryId)
        .reduce((max, i) => Math.max(max, i.sortOrder), -1);
      await kabadiUpsertItem({
        categoryId: newItem.categoryId,
        name: newItem.name,
        nepali: newItem.nepali || undefined,
        unit: newItem.unit,
        rate: Number(newItem.rate),
        popular: newItem.popular,
        note: newItem.note || undefined,
        sortOrder: maxSort + 1,
        published: true,
      });
      toast.success(`Added "${newItem.name}"`);
      setAddOpen(false);
      setNewItem({
        name: "",
        nepali: "",
        unit: "KG",
        rate: "",
        popular: false,
        categoryId: newItem.categoryId,
        note: "",
      });
      load();
    } catch {
      toast.error("Failed to add item");
    }
  }

  async function handleDeleteItem(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await kabadiDeleteItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success(`Deleted "${name}"`);
    } catch {
      toast.error("Failed to delete item");
    }
  }



  const totalItems = items.length;
  const publishedItems = items.filter((i) => i.published).length;

  return (
    <>
      <PageHeader
        icon="recycling"
        title="Scrape / Kabadi Rates"
        description={`${totalItems} items across ${cats.length} categories — ${publishedItems} published`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Create a placeholder category for new ones
                setEditingCat({
                  id: "",
                  slug: "",
                  name: "",
                  nepali: "",
                  icon: "recycling",
                  blurb: "",
                  sortOrder: cats.length,
                  published: true,
                  seoTitle: "",
                  seoDescription: "",
                  seoKeywords: "",
                  heroImage: "",
                  body: "",
                  faq: null,
                  items: [],
                });
                setCatEditorOpen(true);
              }}
            >
              + Category
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNewItem((prev) => ({
                  ...prev,
                  categoryId:
                    cats.find((c) => c.slug === filter)?.id ?? cats[0]?.id ?? "",
                }));
                setAddOpen(true);
              }}
            >
              + Add Item
            </Button>
            <Button size="sm" disabled={saving} onClick={saveAll}>
              {saving ? "Saving…" : "Save all"}
            </Button>
          </div>
        }
      />

      <section className="mt-lg">
        {error && (
          <Alert className="mb-md border-error/40 text-error">{error}</Alert>
        )}
        {loading ? (
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Loader2 className="size-4 animate-spin" />
            Loading rates…
          </div>
        ) : (
          <>
            {/* Category chips + category management */}
            <div className="mb-md flex flex-wrap items-center gap-xs">
              <FilterChip
                active={filter === "all"}
                onClick={() => setFilter("all")}
              >
                All ({totalItems})
              </FilterChip>
              {cats.map((c) => (
                <div key={c.slug} className="flex items-center gap-1">
                  <FilterChip
                    active={filter === c.slug}
                    onClick={() => setFilter(c.slug)}
                  >
                    {c.name} ({c.items.length})
                  </FilterChip>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCat(c);
                      setCatEditorOpen(true);
                    }}
                    className="rounded p-1 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                    title={`Edit ${c.name}`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      edit
                    </span>
                  </button>
                </div>
              ))}
            </div>

            {/* Items table */}
            <AdminDataTable
              minWidth={800}
              columns={[
                "#",
                "Item",
                "Nepali",
                "Category",
                "Unit",
                "Rate (NPR)",
                "Note",
                "Popular",
                "Published",
                "Actions",
              ]}
              empty={filtered.length === 0}
              emptyMessage="No rates for this filter."
            >
              {filtered.map((item, idx) => {
                const cat = cats.find((c) => c.id === item.categoryId);
                return (
                  <AdminDataTable.Row key={item.id ?? item.name}>
                    <AdminDataTable.Cell className="py-2 w-10 text-center">
                      <span className="mono-stat text-[11px] text-on-surface-variant">
                        {globalIndex(item)}
                      </span>
                    </AdminDataTable.Cell>
                    <AdminDataTable.Cell className="py-2">
                      <Input
                        value={item.name}
                        onChange={(e) => setRow(idx, { name: e.target.value })}
                        className="h-9 bg-surface min-w-[120px]"
                      />
                    </AdminDataTable.Cell>
                    <AdminDataTable.Cell className="py-2">
                      <Input
                        value={item.nepali ?? ""}
                        onChange={(e) =>
                          setRow(idx, { nepali: e.target.value })
                        }
                        className="h-9 min-w-[120px] bg-surface"
                        placeholder="नेपाली"
                      />
                    </AdminDataTable.Cell>
                    <AdminDataTable.Cell className="py-2 text-on-surface-variant">
                      <span className="text-xs">{cat?.name}</span>
                    </AdminDataTable.Cell>
                    <AdminDataTable.Cell className="py-2">
                      <select
                        value={item.unit}
                        onChange={(e) =>
                          setRow(idx, {
                            unit: e.target.value as "KG" | "PIECE",
                          })
                        }
                        className="h-9 rounded-md border border-outline bg-surface px-2 text-sm"
                      >
                        <option value="KG">KG</option>
                        <option value="PIECE">Piece</option>
                      </select>
                    </AdminDataTable.Cell>
                    <AdminDataTable.Cell className="py-2">
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => setRow(idx, { rate: e.target.value })}
                        className="h-9 w-28 bg-surface mono-stat"
                      />
                    </AdminDataTable.Cell>
                    <AdminDataTable.Cell className="py-2">
                      <Input
                        value={item.note ?? ""}
                        onChange={(e) => setRow(idx, { note: e.target.value })}
                        className="h-9 w-32 bg-surface text-xs"
                        placeholder="Optional"
                      />
                    </AdminDataTable.Cell>
                    <AdminDataTable.Cell className="py-2">
                      <input
                        type="checkbox"
                        checked={item.popular}
                        onChange={(e) =>
                          setRow(idx, { popular: e.target.checked })
                        }
                      />
                    </AdminDataTable.Cell>
                    <AdminDataTable.Cell className="py-2">
                      <input
                        type="checkbox"
                        checked={item.published}
                        onChange={(e) =>
                          setRow(idx, { published: e.target.checked })
                        }
                      />
                    </AdminDataTable.Cell>
                    <AdminDataTable.Cell className="py-2">
                      <button
                        type="button"
                        onClick={() =>
                          item.id && handleDeleteItem(item.id, item.name)
                        }
                        className="rounded p-1 text-error/70 hover:bg-error/10 hover:text-error"
                        title={`Delete ${item.name}`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          delete
                        </span>
                      </button>
                    </AdminDataTable.Cell>
                  </AdminDataTable.Row>
                );
              })}
            </AdminDataTable>
          </>
        )}
      </section>

      {/* ── Add Item Dialog ── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Kabadi Item</DialogTitle>
            <DialogDescription>
              Add a new scrap item to the rate catalog.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Name *
              </Label>
              <Input
                placeholder="e.g. Newspaper"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Nepali Name
              </Label>
              <Input
                placeholder="e.g. पत्रिका"
                value={newItem.nepali}
                onChange={(e) =>
                  setNewItem((p) => ({ ...p, nepali: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Category *
                </Label>
                <select
                  value={newItem.categoryId}
                  onChange={(e) =>
                    setNewItem((p) => ({ ...p, categoryId: e.target.value }))
                  }
                  className="h-10 rounded-md border border-outline bg-surface px-3 text-sm"
                >
                  <option value="">Select…</option>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Unit *
                </Label>
                <select
                  value={newItem.unit}
                  onChange={(e) =>
                    setNewItem((p) => ({
                      ...p,
                      unit: e.target.value as "KG" | "PIECE",
                    }))
                  }
                  className="h-10 rounded-md border border-outline bg-surface px-3 text-sm"
                >
                  <option value="KG">KG</option>
                  <option value="PIECE">Piece</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Rate (NPR) *
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newItem.rate}
                  onChange={(e) =>
                    setNewItem((p) => ({ ...p, rate: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Note
                </Label>
                <Input
                  placeholder="e.g. Clean & dry"
                  value={newItem.note}
                  onChange={(e) =>
                    setNewItem((p) => ({ ...p, note: e.target.value }))
                  }
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-on-surface-variant">
              <input
                type="checkbox"
                checked={newItem.popular}
                onChange={(e) =>
                  setNewItem((p) => ({ ...p, popular: e.target.checked }))
                }
              />
              Mark as popular
            </label>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button size="sm" onClick={handleAddItem} className="gap-2">
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Category Visual Editor ── */}
      <CategoryVisualEditor
        open={catEditorOpen}
        onOpenChange={setCatEditorOpen}
        category={editingCat}
        onSaved={load}
      />
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex cursor-pointer rounded-full px-3 py-1.5 font-label-sm text-[11px] font-bold uppercase tracking-widest transition-colors " +
        (active
          ? "bg-primary text-on-primary"
          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high")
      }
    >
      {children}
    </button>
  );
}
