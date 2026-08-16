"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Icon, Input, Label, Textarea, toast, Alert } from "@repo/ui";
import { PageHeader } from "components/ui/PageHeader";
import { cmsListItems, cmsUpsertItem, CmsContentItem } from "lib/api";

const PLACEMENT = "REAL_STATE" as const;

export default function RealStateCmsPage() {
  const [items, setItems] = useState<CmsContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setItems(await cmsListItems(PLACEMENT));
      setError(null);
    } catch {
      setError("Could not load CMS items. Ensure you are signed in and the API is running.");
    } finally {
      setLoading(false);
    }
  }

  const loadRef = useRef(load);
  loadRef.current = load;
  useEffect(() => {
    loadRef.current();
  }, []);

  return (
    <>
      <PageHeader
        icon="home"
        title="Real Estate Content"
        description="Manage hero copy, feature highlights, SEO snippets and slot-based content for the real-estate storefront."
      />
      <section className="mt-lg">
        {error && <Alert className="mb-md border-error/40 text-error">{error}</Alert>}
        {loading ? (
          <p className="text-on-surface-variant">Loading content…</p>
        ) : (
          <div className="flex flex-col gap-md">
            {items.map((item) => (
              <CmsItemCard key={item.id} item={item} onChange={load} />
            ))}
            <AddCmsItem placement={PLACEMENT} onAdded={load} />
          </div>
        )}
      </section>
    </>
  );
}

function CmsItemCard({ item, onChange }: { item: CmsContentItem; onChange: () => void }) {
  const [slot, setSlot] = useState(item.slot);
  const [key, setKey] = useState(item.key);
  const [title, setTitle] = useState(item.title ?? "");
  const [body, setBody] = useState(item.body ?? "");
  const [meta, setMeta] = useState(item.metaJson ? JSON.stringify(item.metaJson, null, 2) : "");

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
        metaJson: parsedMeta ?? null,
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
        <h3 className="font-headline-md text-lg font-semibold text-on-surface">{slot} · {key}</h3>
      </div>
      <div className="grid gap-md md:grid-cols-2">
        <div className="flex flex-col gap-sm">
          <div className="flex gap-sm">
            <div className="flex-1"><Label>Slot</Label><Input value={slot} onChange={(e) => setSlot(e.target.value)} className="bg-surface" /></div>
            <div className="flex-1"><Label>Key</Label><Input value={key} onChange={(e) => setKey(e.target.value)} className="bg-surface" /></div>
          </div>
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-surface" /></div>
        </div>
        <div className="flex flex-col gap-sm">
          <div><Label>Body</Label><Textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} className="bg-surface" /></div>
          <div><Label>Meta JSON</Label><Textarea rows={3} value={meta} onChange={(e) => setMeta(e.target.value)} className="bg-surface mono-stat text-xs" /></div>
        </div>
      </div>
      <div className="mt-md flex justify-end border-t border-outline-variant pt-md">
        <Button size="sm" onClick={save}>Save content</Button>
      </div>
    </div>
  );
}

function AddCmsItem({ placement, onAdded }: { placement: string; onAdded: () => void }) {
  const [slot, setSlot] = useState("");
  const [key, setKey] = useState("");
  async function add() {
    if (!slot.trim() || !key.trim()) return;
    try {
      await cmsUpsertItem({ placement, slot: slot.trim(), key: key.trim() });
      toast.success(`Created ${slot}/${key}`);
      setSlot(""); setKey("");
      onAdded();
    } catch {
      toast.error("Could not create content item");
    }
  }
  return (
    <div className="admin-surface border border-dashed border-outline-variant rounded-xl p-md flex flex-wrap items-end gap-sm">
      <div className="w-40"><Label>Slot</Label><Input placeholder="hero" value={slot} onChange={(e) => setSlot(e.target.value)} className="bg-surface" /></div>
      <div className="w-48"><Label>Key</Label><Input placeholder="headline" value={key} onChange={(e) => setKey(e.target.value)} className="bg-surface" /></div>
      <Button size="sm" onClick={add}><Icon name="add" /> Add content</Button>
    </div>
  );
}
