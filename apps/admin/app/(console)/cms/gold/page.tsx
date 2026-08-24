"use client";

import { useEffect, useState } from "react";
import {
  Alert,
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
import { PageHeader } from "components/ui/PageHeader";
import {
  goldMetals,
  goldSetOverride,
  goldUpsertMetal,
  cmsListItems,
  cmsUpsertItem,
  cmsDelete,
  cmsPublish,
  type CmsContentItem,
  type MetalConfig,
} from "lib/api";

const GOLD_PLACEMENT = "GOLD_HOME" as const;
const CONTENT_BLOCK_SLOT = "CONTENT_BLOCK" as const;

export default function GoldCmsPage() {
  const [tab, setTab] = useState("metals");

  return (
    <>
      <PageHeader
        icon="monitoring"
        title="Gold & Metals CMS"
        description="Manage metal configurations, price overrides, and content blocks displayed on gold/metal pages."
      />
      <section className="mt-lg">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="metals" className="px-4 py-2">
              Metals
            </TabsTrigger>
            <TabsTrigger value="content-blocks" className="px-4 py-2">
              Content Blocks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metals">
            <MetalsTab />
          </TabsContent>

          <TabsContent value="content-blocks">
            <ContentBlocksTab />
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
}

/* ─── Metals Tab ─── */

function MetalsTab() {
  const [metals, setMetals] = useState<MetalConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setMetals(await goldMetals());
      setError(null);
    } catch {
      setError(
        "Could not load metals. Ensure you are signed in and the API is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      {error && (
        <Alert className="mb-md border-error/40 text-error">{error}</Alert>
      )}
      {loading ? (
        <p className="text-on-surface-variant">Loading metals…</p>
      ) : (
        <div className="flex flex-col gap-md">
          {metals.map((m) => (
            <MetalCard key={m.id} metal={m} onChange={load} />
          ))}
          <AddMetal onAdded={load} />
        </div>
      )}
    </>
  );
}

function MetalCard({
  metal,
  onChange,
}: {
  metal: MetalConfig;
  onChange: () => void;
}) {
  const [name, setName] = useState(metal.name);
  const [symbol, setSymbol] = useState(metal.symbol ?? "");
  const [description, setDescription] = useState(metal.description ?? "");
  const [seoTitle, setSeoTitle] = useState(metal.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    metal.seoDescription ?? "",
  );
  const [enabled, setEnabled] = useState(metal.isEnabled);
  const [override, setOverride] = useState<{
    ask: string;
    bid: string;
    note: string;
  }>({ ask: "", bid: "", note: "" });

  async function save() {
    try {
      await goldUpsertMetal({
        slug: metal.slug,
        name,
        symbol,
        description,
        seoTitle,
        seoDescription,
        isEnabled: enabled,
      });
      toast.success(`Saved ${name}`);
      onChange();
    } catch {
      toast.error("Save failed");
    }
  }

  async function setOverrideNow() {
    try {
      await goldSetOverride({
        metalSlug: metal.slug,
        ask: override.ask ? Number(override.ask) : undefined,
        bid: override.bid ? Number(override.bid) : undefined,
        note: override.note,
      });
      toast.success(`Price override set for ${name}`);
      setOverride({ ask: "", bid: "", note: "" });
    } catch {
      toast.error("Override failed");
    }
  }

  return (
    <div className="admin-surface border border-outline-variant rounded-xl p-md">
      <div className="mb-sm flex items-center gap-sm">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: metal.accentColor || "#333", color: "#fff" }}
        >
          {metal.symbol || metal.slug.charAt(0).toUpperCase()}
        </span>
        <h3 className="font-headline-md text-lg font-semibold text-on-surface">
          {metal.name}
        </h3>
        <div className="ml-auto flex items-center gap-sm">
          <span className="font-label-sm text-[11px] uppercase text-on-surface-variant">
            {enabled ? "Enabled" : "Disabled"}
          </span>
          <Switch
            checked={enabled}
            onCheckedChange={(v) => {
              setEnabled(v);
            }}
            aria-label={`Enable ${metal.name}`}
          />
        </div>
      </div>
      <div className="grid gap-md md:grid-cols-2">
        <div className="flex flex-col gap-sm">
          <div className="flex gap-sm">
            <div className="flex-1">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-surface"
              />
            </div>
            <div className="w-24">
              <Label>Symbol</Label>
              <Input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="bg-surface"
              />
            </div>
          </div>
          <div>
            <Label>SEO title</Label>
            <Input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="bg-surface"
            />
          </div>
          <div>
            <Label>SEO description</Label>
            <Textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
              className="bg-surface"
            />
          </div>
        </div>
        <div className="flex flex-col gap-sm">
          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-surface"
            />
          </div>
        </div>
      </div>
      <div className="mt-md flex flex-wrap items-end gap-sm border-t border-outline-variant pt-md">
        <div className="w-32">
          <Label>Override Ask (NPR)</Label>
          <Input
            type="number"
            value={override.ask}
            onChange={(e) => setOverride({ ...override, ask: e.target.value })}
            className="bg-surface mono-stat"
          />
        </div>
        <div className="w-32">
          <Label>Override Bid</Label>
          <Input
            type="number"
            value={override.bid}
            onChange={(e) => setOverride({ ...override, bid: e.target.value })}
            className="bg-surface mono-stat"
          />
        </div>
        <div className="w-40">
          <Label>Note</Label>
          <Input
            value={override.note}
            onChange={(e) => setOverride({ ...override, note: e.target.value })}
            className="bg-surface"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-outline-variant"
          onClick={setOverrideNow}
        >
          <Icon name="push_pin" /> Pin override
        </Button>
        <div className="ml-auto">
          <Button size="sm" onClick={save}>
            Save metal
          </Button>
        </div>
      </div>
    </div>
  );
}

function AddMetal({ onAdded }: { onAdded: () => void }) {
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  async function add() {
    if (!slug.trim() || !name.trim()) return;
    try {
      await goldUpsertMetal({
        slug: slug.trim().toLowerCase(),
        name: name.trim(),
      });
      toast.success(`Added ${name}`);
      setSlug("");
      setName("");
      onAdded();
    } catch {
      toast.error("Could not add metal");
    }
  }
  return (
    <div className="admin-surface border border-dashed border-outline-variant rounded-xl p-md flex flex-wrap items-end gap-sm">
      <div className="w-40">
        <Label>New metal slug</Label>
        <Input
          placeholder="platinum"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="bg-surface"
        />
      </div>
      <div className="w-48">
        <Label>Display name</Label>
        <Input
          placeholder="Platinum"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-surface"
        />
      </div>
      <Button size="sm" onClick={add}>
        <Icon name="add" /> Add metal
      </Button>
    </div>
  );
}

/* ─── Content Blocks Tab ─── */

const BLOCK_TYPES = ["article", "infographic", "comparison", "faq", "cta"] as const;
const BLOCK_TYPE_LABELS: Record<string, string> = {
  article: "Article",
  infographic: "Infographic",
  comparison: "Comparison",
  faq: "FAQ",
  cta: "CTA",
};
const METAL_OPTIONS = ["gold", "silver", "copper", "diamond", "steel", "all"] as const;

function ContentBlocksTab() {
  const [blocks, setBlocks] = useState<CmsContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<CmsContentItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const all = await cmsListItems(GOLD_PLACEMENT, CONTENT_BLOCK_SLOT);
      setBlocks(all.slice().sort((a, b) => a.sortOrder - b.sortOrder));
      setError(null);
    } catch {
      setError("Could not load content blocks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(values: {
    key: string;
    title: string;
    subtitle: string;
    body: string;
    metal: string;
    type: string;
    published: boolean;
  }) {
    const meta: Record<string, unknown> = {
      metal: values.metal,
      type: values.type,
    };
    try {
      await cmsUpsertItem({
        placement: GOLD_PLACEMENT,
        slot: CONTENT_BLOCK_SLOT,
        key: editingBlock?.key ?? values.key,
        title: values.title,
        subtitle: values.subtitle || null,
        body: values.body,
        metadata: meta,
        sortOrder: editingBlock?.sortOrder ?? blocks.length,
        published: values.published,
      });
      toast.success(editingBlock ? "Block updated" : "Block added");
      setFormOpen(false);
      setEditingBlock(null);
      await load();
    } catch {
      toast.error("Could not save block");
    }
  }

  async function handleDelete(item: CmsContentItem) {
    try {
      await cmsDelete(item.id);
      toast.success("Block deleted");
      await load();
    } catch {
      toast.error("Delete failed");
    }
  }

  async function handleTogglePublish(item: CmsContentItem) {
    try {
      await cmsPublish(item.id, !item.published);
      toast.success(item.published ? "Block hidden" : "Block published");
      await load();
    } catch {
      toast.error("Could not update status");
    }
  }

  return (
    <div>
      <div className="mb-md flex items-center justify-between">
        <div>
          <h3 className="font-headline-md text-lg font-semibold text-on-surface">
            Metal Content Blocks
          </h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            Articles, infographics, comparisons, and commentary displayed on gold and metal pages.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingBlock(null);
            setFormOpen(true);
          }}
        >
          <Icon name="add" /> Add block
        </Button>
      </div>

      {error && (
        <Alert className="mb-md border-error/40 text-error">{error}</Alert>
      )}

      {loading ? (
        <p className="text-on-surface-variant">Loading blocks…</p>
      ) : blocks.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          No content blocks yet — add one to get started.
        </p>
      ) : (
        <div className="flex flex-col gap-sm">
          {blocks.map((block) => {
            const meta =
              block.metadata && typeof block.metadata === "object"
                ? (block.metadata as Record<string, unknown>)
                : {};
            const metal = typeof meta.metal === "string" ? meta.metal : "all";
            const type = typeof meta.type === "string" ? meta.type : "article";
            return (
              <div
                key={block.id}
                className="admin-surface border border-outline-variant rounded-xl p-md"
              >
                <div className="mb-sm flex flex-wrap items-center justify-between gap-sm">
                  <div className="flex flex-wrap items-center gap-sm">
                    <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">
                      {metal}
                    </span>
                    <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">
                      {BLOCK_TYPE_LABELS[type] ?? type}
                    </span>
                    {!block.published && (
                      <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-red-600">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-sm">
                    <Switch
                      checked={block.published}
                      onCheckedChange={() => void handleTogglePublish(block)}
                      aria-label={`${block.published ? "Hide" : "Show"} ${block.title || block.key}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setEditingBlock(block);
                        setFormOpen(true);
                      }}
                    >
                      <Icon name="edit" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-error hover:text-error"
                      onClick={() => void handleDelete(block)}
                    >
                      <Icon name="delete" />
                    </Button>
                  </div>
                </div>
                <h4 className="font-medium text-on-surface">{block.title || block.key}</h4>
                {block.subtitle && (
                  <p className="mt-0.5 text-sm text-on-surface-variant">{block.subtitle}</p>
                )}
                {block.body && (
                  <p className="mt-2 line-clamp-2 text-sm text-on-surface-variant">
                    {block.body}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {formOpen && (
        <ContentBlockForm
          block={editingBlock}
          onSave={handleSave}
          onClose={() => {
            setFormOpen(false);
            setEditingBlock(null);
          }}
        />
      )}
    </div>
  );
}

function ContentBlockForm({
  block,
  onSave,
  onClose,
}: {
  block: CmsContentItem | null;
  onSave: (values: {
    key: string;
    title: string;
    subtitle: string;
    body: string;
    metal: string;
    type: string;
    published: boolean;
  }) => Promise<void> | void;
  onClose: () => void;
}) {
  const meta =
    block?.metadata && typeof block.metadata === "object"
      ? (block.metadata as Record<string, unknown>)
      : {};

  const [key, setKey] = useState(
    block?.key ?? `block-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
  );
  const [title, setTitle] = useState(block?.title ?? "");
  const [subtitle, setSubtitle] = useState(block?.subtitle ?? "");
  const [body, setBody] = useState(block?.body ?? "");
  const [metal, setMetal] = useState(
    typeof meta.metal === "string" ? meta.metal : "gold",
  );
  const [type, setType] = useState(
    typeof meta.type === "string" ? meta.type : "article",
  );
  const [published, setPublished] = useState(block?.published ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        key,
        title: title.trim(),
        subtitle: subtitle.trim(),
        body: body.trim(),
        metal,
        type,
        published,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="admin-surface mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-outline-variant p-md shadow-xl">
        <div className="mb-md flex items-center justify-between">
          <h3 className="font-headline-md text-lg font-semibold text-on-surface">
            {block ? "Edit Content Block" : "Add Content Block"}
          </h3>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <Icon name="close" />
          </Button>
        </div>

        <div className="flex flex-col gap-md">
          <div className="grid gap-md sm:grid-cols-2">
            <div>
              <Label>Metal</Label>
              <select
                value={metal}
                onChange={(e) => setMetal(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface"
              >
                {METAL_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m === "all" ? "Shared (all metals)" : m.charAt(0).toUpperCase() + m.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Block Type</Label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface"
              >
                {BLOCK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {BLOCK_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label>Key</Label>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="unique-slug"
              className="bg-surface"
              disabled={Boolean(block)}
            />
          </div>

          <div>
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What Affects Gold Prices?"
              className="bg-surface"
            />
          </div>

          <div>
            <Label>Subtitle</Label>
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Understanding the key drivers…"
              className="bg-surface"
            />
          </div>

          <div>
            <Label>Body — supports **bold** and line breaks</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="Write your content…"
              className="bg-surface"
            />
          </div>

          <div className="flex items-center gap-sm">
            <Switch
              checked={published}
              onCheckedChange={setPublished}
              aria-label="Published"
            />
            <Label className="mb-0">Published</Label>
          </div>
        </div>

        <div className="mt-md flex justify-end gap-sm border-t border-outline-variant pt-md">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={saving}>
            {saving ? "Saving…" : block ? "Update block" : "Add block"}
          </Button>
        </div>
      </div>
    </div>
  );
}
