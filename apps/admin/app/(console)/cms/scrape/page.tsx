"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Icon, Input, toast } from "@repo/ui";
import { AdminDataTable } from "components/AdminDataTable";
import { PageHeader } from "components/ui/PageHeader";
import { kabadiCategories, kabadiSetRates, KabadiCategory } from "lib/api";

type EditableItem = {
  id?: string;
  name: string;
  unit: "KG" | "PIECE";
  rate: string;
  popular: boolean;
  published: boolean;
  categoryId: string;
};

export default function ScrapeCmsPage() {
  const [cats, setCats] = useState<KabadiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [items, setItems] = useState<EditableItem[]>([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await kabadiCategories(true);
      setCats(data);
      const flat: EditableItem[] = data.flatMap((c) =>
        c.items.map((i) => ({
          id: i.id,
          name: i.name,
          unit: i.unit as "KG" | "PIECE",
          rate: i.rate,
          popular: i.popular,
          published: i.published,
          categoryId: c.id,
        })),
      );
      setItems(flat);
      setError(null);
    } catch {
      setError("Could not load kabadi rates. Ensure you are signed in and the API is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const catId = cats.find((c) => c.slug === filter)?.id;
    return items.filter((i) => !catId || i.categoryId === catId);
  }, [items, filter, cats]);

  function setRow(indexInFiltered: number, patch: Partial<EditableItem>) {
    const target = filtered[indexInFiltered];
    if (!target) return;
    setItems((prev) => prev.map((i) => (i.id ? i.id === target.id : i.name === target.name) ? { ...i, ...patch } : i));
  }

  async function saveAll() {
    setSaving(true);
    try {
      await kabadiSetRates(filtered.map((i) => ({
        id: i.id, categoryId: i.categoryId, name: i.name, unit: i.unit, rate: Number(i.rate), popular: i.popular, published: i.published,
      })));
      toast.success(`Saved ${filtered.length} rates`);
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        icon="recycling"
        title="Scrape / Kabadi Rates"
        description="Manage scrap categories and per-kg / per-piece buy rates shown on the client."
        actions={<Button size="sm" disabled={saving} onClick={saveAll}>{saving ? "Saving…" : "Save all"}</Button>}
      />
      <section className="mt-lg">
        {error && <Alert className="mb-md border-error/40 text-error">{error}</Alert>}
        {loading ? (
          <p className="text-on-surface-variant">Loading rates…</p>
        ) : (
          <>
            <div className="mb-md flex flex-wrap gap-xs">
              <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All</FilterChip>
              {cats.map((c) => (
                <FilterChip key={c.slug} active={filter === c.slug} onClick={() => setFilter(c.slug)}>{c.name}</FilterChip>
              ))}
            </div>
            <AdminDataTable
              minWidth={640}
              columns={["Item", "Category", "Unit", "Rate (NPR)", "Popular", "Published"]}
              empty={filtered.length === 0}
              emptyMessage="No rates for this filter."
            >
              {filtered.map((item, idx) => {
                const cat = cats.find((c) => c.id === item.categoryId);
                return (
                  <AdminDataTable.Row key={item.id ?? item.name}>
                    <AdminDataTable.Cell className="py-2"><Input value={item.name} onChange={(e) => setRow(idx, { name: e.target.value })} className="h-9 bg-surface" /></AdminDataTable.Cell>
                    <AdminDataTable.Cell className="py-2 text-on-surface-variant">{cat?.name}</AdminDataTable.Cell>
                    <AdminDataTable.Cell className="py-2">
                      <select value={item.unit} onChange={(e) => setRow(idx, { unit: e.target.value as "KG" | "PIECE" })} className="h-9 rounded-md border border-outline bg-surface px-2 text-sm">
                        <option value="KG">KG</option>
                        <option value="PIECE">Piece</option>
                      </select>
                    </AdminDataTable.Cell>
                    <AdminDataTable.Cell className="py-2"><Input type="number" value={item.rate} onChange={(e) => setRow(idx, { rate: e.target.value })} className="h-9 w-28 bg-surface mono-stat" /></AdminDataTable.Cell>
                    <AdminDataTable.Cell className="py-2"><input type="checkbox" checked={item.popular} onChange={(e) => setRow(idx, { popular: e.target.checked })} /></AdminDataTable.Cell>
                    <AdminDataTable.Cell className="py-2"><input type="checkbox" checked={item.published} onChange={(e) => setRow(idx, { published: e.target.checked })} /></AdminDataTable.Cell>
                  </AdminDataTable.Row>
                );
              })}
            </AdminDataTable>
          </>
        )}
      </section>
    </>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={"inline-flex cursor-pointer rounded-full px-3 py-1.5 font-label-sm text-[11px] font-bold uppercase tracking-widest transition-colors " + (active ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high")}>
      {children}
    </button>
  );
}
