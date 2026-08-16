"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Icon,
  Input,
  Label,
  Switch,
  Textarea,
  toast,
  Alert,
} from "@repo/ui";
import { PageHeader } from "components/ui/PageHeader";
import {
  goldMetals,
  goldSetOverride,
  goldUpsertMetal,
  MetalConfig,
} from "lib/api";

export default function GoldCmsPage() {
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
      <PageHeader
        icon="monitoring"
        title="Gold Price Management"
        description="Enable/disable metals, edit metadata, pin a manual price override or refresh FAQs."
      />
      <section className="mt-lg">
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
      </section>
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
