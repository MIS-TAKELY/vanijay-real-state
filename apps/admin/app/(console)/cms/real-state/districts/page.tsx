"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Icon,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  toast,
} from "@repo/ui";
import { PageHeader } from "components/ui/PageHeader";
import {
  districtDelete,
  districtUpsert,
  districtsList,
  type DistrictMeta,
} from "lib/api";

const PROVINCES = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

const TOPOGRAPHIES = ["VALLEY", "TERAI", "HILL", "MOUNTAIN"] as const;
const TIERS = ["CADASTRAL", "FIELD", "PENDING"] as const;

const TIER_BADGE: Record<DistrictMeta["tier"], string> = {
  CADASTRAL: "border-primary/30 bg-secondary-container text-primary",
  FIELD: "border-outline-variant bg-surface-container text-on-surface",
  PENDING: "border-outline-variant bg-surface-container-low text-on-surface-variant",
};

type Draft = Pick<
  DistrictMeta,
  | "slug"
  | "name"
  | "province"
  | "topography"
  | "tier"
  | "avgRatePerAana"
  | "trendPct"
  | "description"
>;

export default function DistrictsCmsPage() {
  const [districts, setDistricts] = useState<DistrictMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [provinceFilter, setProvinceFilter] = useState<string>("all");

  async function load() {
    setLoading(true);
    try {
      setDistricts(await districtsList());
      setError(null);
    } catch {
      setError(
        "Could not load districts. Ensure you are signed in as ADMIN and the API is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return districts.filter(
      (d) =>
        (provinceFilter === "all" || d.province === provinceFilter) &&
        (!q ||
          d.name.toLowerCase().includes(q) ||
          d.slug.includes(q)),
    );
  }, [districts, search, provinceFilter]);

  async function handleAdd() {
    const name = window.prompt("District name (e.g. Dolakha)");
    if (!name?.trim()) return;
    try {
      await districtUpsert({
        slug: name.trim().toLowerCase().replace(/\s+/g, "-"),
        name: name.trim(),
        province: provinceFilter !== "all" ? provinceFilter : PROVINCES[0],
      });
      toast.success(`Added ${name.trim()}`);
      load();
    } catch {
      toast.error("Could not add district");
    }
  }

  return (
    <>
      <PageHeader
        icon="map"
        title="District Area-Guide Data"
        description="Manage curated land-market metadata for all Nepal districts — topography, verification tier, indicative rates and market notes."
      />

      <section className="mt-lg">
        <div className="mb-md flex flex-wrap items-center gap-sm">
          <div className="relative w-64">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search district…"
              aria-label="Search districts"
              className="bg-surface pl-9"
            />
          </div>
          <Select value={provinceFilter} onValueChange={setProvinceFilter}>
            <SelectTrigger aria-label="Filter by province" className="w-48">
              <SelectValue placeholder="All provinces" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All provinces</SelectItem>
              {PROVINCES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-on-surface-variant">
            {filtered.length} of {districts.length}
          </span>
          <Button size="sm" className="ml-auto" onClick={handleAdd}>
            <Icon name="add" /> Add district
          </Button>
        </div>

        {error && (
          <div className="mb-md rounded-xl border border-error/40 p-md text-error">
            {error}
          </div>
        )}
        {loading ? (
          <p className="text-on-surface-variant">Loading districts…</p>
        ) : (
          <div className="grid grid-cols-1 gap-sm lg:grid-cols-2 xl:grid-cols-3">
            {filtered.map((d) => (
              <DistrictRow key={d.slug} district={d} onChange={load} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function DistrictRow({
  district,
  onChange,
}: {
  district: DistrictMeta;
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    slug: district.slug,
    name: district.name,
    province: district.province,
    topography: district.topography,
    tier: district.tier,
    avgRatePerAana: district.avgRatePerAana,
    trendPct: district.trendPct,
    description: district.description ?? "",
  });

  const dirty =
    draft.name !== district.name ||
    draft.province !== district.province ||
    draft.topography !== district.topography ||
    draft.tier !== district.tier ||
    (draft.avgRatePerAana ?? null) !== district.avgRatePerAana ||
    (draft.trendPct ?? null) !== district.trendPct ||
    (draft.description ?? "") !== (district.description ?? "");

  async function save() {
    setSaving(true);
    try {
      await districtUpsert(draft);
      toast.success(`Saved ${draft.name}`);
      setOpen(false);
      onChange();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete ${district.name}? This cannot be undone.`))
      return;
    try {
      await districtDelete(district.slug);
      toast.success(`Deleted ${district.name}`);
      onChange();
    } catch {
      toast.error("Delete failed");
    }
  }

  return (
    <div className="admin-surface rounded-xl border border-outline-variant p-md">
      <div className="flex items-start justify-between gap-sm">
        <div>
          <h3 className="font-headline-md font-semibold text-on-surface">
            {district.name}
          </h3>
          <p className="text-[11px] uppercase tracking-[0.6px] text-on-surface-variant">
            {district.slug} · {district.province}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`${TIER_BADGE[district.tier]} text-[10px] font-bold uppercase`}
        >
          {district.tier}
        </Badge>
      </div>

      {!open && (
        <p className="mt-xs line-clamp-2 min-h-[32px] text-sm text-on-surface-variant">
          {district.description || "No description yet."}
        </p>
      )}

      {open && (
        <div className="mt-sm flex flex-col gap-sm border-t border-outline-variant pt-sm">
          <div className="grid grid-cols-2 gap-sm">
            <div>
              <Label>Name</Label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="bg-surface"
              />
            </div>
            <div>
              <Label>Province</Label>
              <Select
                value={draft.province}
                onValueChange={(v) => setDraft({ ...draft, province: v })}
              >
                <SelectTrigger aria-label="Province" className="bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Topography</Label>
              <Select
                value={draft.topography}
                onValueChange={(v) =>
                  setDraft({ ...draft, topography: v as DistrictMeta["topography"] })
                }
              >
                <SelectTrigger aria-label="Topography" className="bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TOPOGRAPHIES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Verification tier</Label>
              <Select
                value={draft.tier}
                onValueChange={(v) =>
                  setDraft({ ...draft, tier: v as DistrictMeta["tier"] })
                }
              >
                <SelectTrigger aria-label="Verification tier" className="bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIERS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Avg rate (NPR / Aana)</Label>
              <Input
                type="number"
                value={draft.avgRatePerAana ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    avgRatePerAana:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                placeholder="empty = awaiting survey"
                className="bg-surface mono-stat"
              />
            </div>
            <div>
              <Label>Trend (% YoY)</Label>
              <Input
                type="number"
                step="0.1"
                value={draft.trendPct ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    trendPct:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                placeholder="empty = stable/no data"
                className="bg-surface mono-stat"
              />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={draft.description ?? ""}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              className="bg-surface"
            />
          </div>
        </div>
      )}

      <div className="mt-sm flex items-center gap-sm">
        {open ? (
          <>
            <Button size="sm" onClick={save} disabled={!dirty || saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="border-outline-variant"
            onClick={() => setOpen(true)}
          >
            <Icon name="edit" /> Edit
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-error hover:text-error"
          onClick={remove}
          aria-label={`Delete ${district.name}`}
        >
          <Icon name="delete" /> Delete
        </Button>
      </div>
    </div>
  );
}
