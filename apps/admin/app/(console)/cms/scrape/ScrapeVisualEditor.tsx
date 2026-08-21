"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ScrapeHome,
  type CTAContent,
  type HowItWorksStep,
  type TrustBadge,
  type ScrapeCategorySummary,
  Button,
  Loader2,
  toast,
} from "@repo/ui";
import { cmsListItems, cmsUpsertItem } from "lib/api";

/* ── Types ── */

interface ScrapeCmsData {
  cta: Partial<CTAContent>;
  howItWorks: {
    heading?: string;
    description?: string;
    steps?: HowItWorksStep[];
    trust?: TrustBadge[];
  };
}

const DEFAULT_STEPS: HowItWorksStep[] = [
  {
    icon: "CalendarCheck",
    step: "01",
    title: "Book a pickup",
    detail:
      "Call or book a time slot online. Tell us what you're selling — copper, paper, an old fridge — and we bring the right team.",
  },
  {
    icon: "Scale",
    step: "02",
    title: "Weigh at your door",
    detail:
      "No back-room scales. Your kabadi is weighed on a transparent digital scale in front of you, per the published rates.",
  },
  {
    icon: "Banknote",
    step: "03",
    title: "Cash on the spot",
    detail:
      "The total is calculated live and paid in cash (or bank transfer) before we leave. The rate you saw is the rate you get.",
  },
  {
    icon: "Recycle",
    step: "04",
    title: "Recycled responsibly",
    detail:
      "Your scrap goes to licensed recyclers and e-waste handlers — not a landfill. Selling kabadi becomes a climate win.",
  },
];

const DEFAULT_TRUST: TrustBadge[] = [
  { icon: "Scale", label: "Transparent digital weighing" },
  { icon: "Truck", label: "Same-day valley-wide pickup" },
  { icon: "ShieldCheck", label: "Licensed recyclers only" },
  { icon: "PhoneCall", label: "Rate confirmation before pickup" },
];

/* ── Component ── */

interface ScrapeVisualEditorProps {
  categories: ScrapeCategorySummary[];
  onSaved?: () => void;
}

export function ScrapeVisualEditor({
  categories,
  onSaved,
}: ScrapeVisualEditorProps) {
  const [data, setData] = useState<ScrapeCmsData>({
    cta: {},
    howItWorks: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Track pending edits in a ref to avoid re-renders on every keystroke
  const editsRef = useRef<Record<string, unknown>>({});
  const [dirty, setDirty] = useState(false);

  // Load existing CMS data on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const items = await cmsListItems("KABADI");
        const merged: ScrapeCmsData = { cta: {}, howItWorks: {} };

        for (const item of items) {
          const meta = (item.metadata as Record<string, unknown>) ?? {};
          if (item.slot === "CTA") {
            merged.cta = meta as Partial<CTAContent>;
          } else if (item.slot === "HOW_IT_WORKS") {
            merged.howItWorks = meta as ScrapeCmsData["howItWorks"];
          }
        }

        setData(merged);
      } catch {
        // No CMS data yet — use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Merge edits on top of loaded data for live preview
  const previewData: ScrapeCmsData = {
    cta: {
      ...data.cta,
      ...(editsRef.current["cta"] as Partial<CTAContent> | undefined) ?? {},
    },
    howItWorks: {
      ...data.howItWorks,
      ...(editsRef.current["howItWorks"] as Record<string, unknown> | undefined) ?? {},
    },
  };

  // Handle step/trust edits stored as step:N / trust:N keys
  const previewSteps: HowItWorksStep[] = (() => {
    const base = previewData.howItWorks.steps ?? DEFAULT_STEPS;
    return base.map((s, idx) => {
      const stepEdits = editsRef.current[`step:${idx}`] as
        | Record<string, string>
        | undefined;
      return stepEdits ? { ...s, ...stepEdits } : s;
    });
  })();

  const previewTrust: TrustBadge[] = (() => {
    const base = previewData.howItWorks.trust ?? DEFAULT_TRUST;
    return base.map((t, idx) => {
      const trustEdits = editsRef.current[`trust:${idx}`] as
        | Record<string, string>
        | undefined;
      return trustEdits ? { ...t, ...trustEdits } : t;
    });
  })();

  const handleFieldChange = useCallback(
    (section: string, field: string, value: unknown) => {
      if (section === "cta") {
        editsRef.current["cta"] = {
          ...((editsRef.current["cta"] as Partial<CTAContent>) ?? {}),
          [field]: value as string,
        };
      } else if (section === "howItWorks") {
        editsRef.current["howItWorks"] = {
          ...((editsRef.current["howItWorks"] as Record<string, unknown>) ?? {}),
          [field]: value,
        };
      } else if (section.startsWith("step:")) {
        editsRef.current[section] = {
          ...((editsRef.current[section] as Record<string, string>) ?? {}),
          [field]: value as string,
        };
      } else if (section.startsWith("trust:")) {
        editsRef.current[section] = {
          ...((editsRef.current[section] as Record<string, string>) ?? {}),
          [field]: value as string,
        };
      }
      setDirty(true);
    },
    [],
  );

  async function handleSave() {
    setSaving(true);
    try {
      const edits = editsRef.current;

      // Build CTA metadata
      const ctaEdits = edits["cta"] as Partial<CTAContent> | undefined;
      if (ctaEdits && Object.keys(ctaEdits).length > 0) {
        await cmsUpsertItem({
          placement: "KABADI",
          slot: "CTA",
          key: "cta",
          metadata: { ...data.cta, ...ctaEdits },
          published: true,
        });
      }

      // Build HowItWorks metadata (heading, description, steps, trust)
      const hiwEdits = edits["howItWorks"] as
        | Record<string, unknown>
        | undefined;
      const stepEdits: Record<number, Record<string, string>> = {};
      const trustEditsMap: Record<number, Record<string, string>> = {};

      for (const [key, value] of Object.entries(edits)) {
        if (key.startsWith("step:")) {
          const idx = parseInt(key.replace("step:", ""), 10);
          stepEdits[idx] = value as Record<string, string>;
        } else if (key.startsWith("trust:")) {
          const idx = parseInt(key.replace("trust:", ""), 10);
          trustEditsMap[idx] = value as Record<string, string>;
        }
      }

      const hasHiwChanges =
        (hiwEdits && Object.keys(hiwEdits).length > 0) ||
        Object.keys(stepEdits).length > 0 ||
        Object.keys(trustEditsMap).length > 0;

      if (hasHiwChanges) {
        // Merge step edits into steps array
        const baseSteps = data.howItWorks.steps ?? DEFAULT_STEPS;
        const mergedSteps = baseSteps.map((s, idx) =>
          stepEdits[idx] ? { ...s, ...stepEdits[idx] } : s,
        );

        // Merge trust edits into trust array
        const baseTrust = data.howItWorks.trust ?? DEFAULT_TRUST;
        const mergedTrust = baseTrust.map((t, idx) =>
          trustEditsMap[idx] ? { ...t, ...trustEditsMap[idx] } : t,
        );

        await cmsUpsertItem({
          placement: "KABADI",
          slot: "HOW_IT_WORKS",
          key: "how-it-works",
          metadata: {
            ...data.howItWorks,
            ...(hiwEdits ?? {}),
            steps: mergedSteps,
            trust: mergedTrust,
          },
          published: true,
        });
      }

      // Clear edits
      editsRef.current = {};
      setDirty(false);

      // Reload fresh data
      const items = await cmsListItems("KABADI");
      const merged: ScrapeCmsData = { cta: {}, howItWorks: {} };
      for (const item of items) {
        const meta = (item.metadata as Record<string, unknown>) ?? {};
        if (item.slot === "CTA")
          merged.cta = meta as Partial<CTAContent>;
        else if (item.slot === "HOW_IT_WORKS")
          merged.howItWorks = meta as ScrapeCmsData["howItWorks"];
      }
      setData(merged);

      toast.success("Scrape page content saved");
      onSaved?.();
    } catch {
      toast.error("Failed to save scrape page content");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-on-surface-variant">
        <Loader2 className="size-4 animate-spin" />
        Loading scrape page content…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Save bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between rounded-xl border border-outline bg-surface px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">edit_note</span>
          <div>
            <h3 className="text-sm font-semibold text-on-surface">
              Visual Editor — Scrape Page
            </h3>
            <p className="text-[11px] text-on-surface-variant">
              Click any text below to edit inline · changes preview live
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

      {/*
        Render the EXACT same template the public /scrape page uses, with
        inline editing switched on. `ScrapeHome` is shared from @repo/ui so the
        admin preview and the live client can never drift.
      */}
      <div className="overflow-hidden rounded-2xl border border-outline bg-white">
        <ScrapeHome
          categories={categories}
          howItWorks={{
            steps: previewSteps,
            trust: previewTrust,
          }}
          cta={previewData.cta}
          editable
          onFieldChange={handleFieldChange}
        />
      </div>
    </div>
  );
}