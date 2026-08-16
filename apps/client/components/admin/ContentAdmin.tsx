"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import type { HeroSlide, Category } from "constants/varibles-constants";
import type { ContentBlock } from "constants/gold/content-blocks";
import type { MetalId } from "constants/gold/metals";
import {
  useContentStore,
  defaultContentState,
  blankSlide,
} from "store/content";

type TabId = "hero" | "categories" | "contentBlocks";

const TABS: { id: TabId; label: string; hint: string }[] = [
  { id: "hero", label: "Hero Banner", hint: "Real-state homepage" },
  { id: "categories", label: "Categories", hint: "Real-state homepage" },
  { id: "contentBlocks", label: "Metal Content", hint: "Gold & metals pages" },
];

function cx(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

const inputClass =
  "w-full rounded-lg border border-white/[0.08] bg-[#0F1114] px-3 py-2 text-sm text-[#E8E6E1] placeholder:text-white/25 focus:border-[#C9A84C]/60 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-colors";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]/40",
        checked
          ? "border-[#C9A84C]/60 bg-[#C9A84C]"
          : "border-white/[0.12] bg-white/[0.06]",
      )}
    >
      <span
        className={cx(
          "inline-block h-4 w-4 transform rounded-full bg-[#0F1114] transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-[3px]",
        )}
      />
    </button>
  );
}

function IconButton({
  onClick,
  label,
  children,
  disabled,
  danger,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cx(
        "inline-flex size-8 items-center justify-center rounded-lg border border-white/[0.08] text-white/50 transition-colors",
        danger
          ? "cursor-pointer hover:border-[#F87171]/40 hover:text-[#F87171]"
          : "cursor-pointer hover:border-white/20 hover:text-[#E8E6E1]",
        disabled &&
          "cursor-not-allowed opacity-30 hover:border-white/[0.08] hover:text-white/50",
      )}
    >
      {children}
    </button>
  );
}

function EditedBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-[#C9A84C]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#C9A84C]">
      Edited
    </span>
  );
}

function HiddenBanner({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-5 rounded-lg border border-[#F87171]/20 bg-[#F87171]/5 px-4 py-3 text-sm text-[#F87171]"
      role="status"
    >
      {children}
    </div>
  );
}

function SectionShell({
  title,
  description,
  edited,
  onReset,
  viewHref,
  viewLabel,
  children,
}: {
  title: string;
  description: string;
  edited: boolean;
  onReset: () => void;
  viewHref: string;
  viewLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={title}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            className="text-xl font-semibold tracking-tight text-[#E8E6E1]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h2>
          <p className="mt-0.5 text-sm text-white/40">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {edited && <EditedBadge />}
          <Link
            href={viewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:border-white/20 hover:text-[#E8E6E1]"
          >
            <ExternalLink size={14} aria-hidden="true" />
            {viewLabel}
          </Link>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:border-[#F87171]/40 hover:text-[#F87171]"
          >
            <RotateCcw size={14} aria-hidden="true" />
            Reset to defaults
          </button>
        </div>
      </div>
      {children}
    </section>
  );
}

function HeroBannerEditor() {
  const heroEnabled = useContentStore((s) => s.heroEnabled);
  const heroSlides = useContentStore((s) => s.heroSlides);
  const setHeroEnabled = useContentStore((s) => s.setHeroEnabled);
  const setHeroSlides = useContentStore((s) => s.setHeroSlides);
  const resetSection = useContentStore((s) => s.resetSection);

  const edited =
    heroEnabled !== defaultContentState.heroEnabled ||
    JSON.stringify(heroSlides) !==
      JSON.stringify(defaultContentState.heroSlides);

  const update = (index: number, patch: Partial<HeroSlide>) => {
    setHeroSlides(
      heroSlides.map((slide, i) =>
        i === index ? { ...slide, ...patch } : slide,
      ),
    );
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= heroSlides.length) return;
    const next = [...heroSlides];
    const current = next[index];
    const swapped = next[target];
    if (current === undefined || swapped === undefined) return;
    next[index] = swapped;
    next[target] = current;
    setHeroSlides(next);
  };

  const remove = (index: number) => {
    setHeroSlides(heroSlides.filter((_, i) => i !== index));
  };

  const add = () => {
    setHeroSlides([...heroSlides, blankSlide()]);
  };

  return (
    <SectionShell
      title="Hero Banner"
      description="Slides shown in the full-width carousel at the top of the real-state homepage."
      edited={edited}
      onReset={() => resetSection("hero")}
      viewHref="/"
      viewLabel="View homepage"
    >
      <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-[#E8E6E1]">Show hero banner</p>
          <p className="text-xs text-white/40">
            {heroSlides.length} slide{heroSlides.length === 1 ? "" : "s"} ·{" "}
            {heroEnabled ? "visible on the homepage" : "hidden"}
          </p>
        </div>
        <Toggle
          checked={heroEnabled}
          onChange={setHeroEnabled}
          label="Toggle hero banner"
        />
      </div>

      {!heroEnabled && (
        <HiddenBanner>
          The hero banner is hidden. Turn on “Show hero banner” to display it on
          the homepage.
        </HiddenBanner>
      )}

      <div className="space-y-5">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className="rounded-xl border border-white/[0.06] bg-[#1A1D23]/50 p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                Slide {index + 1}
              </span>
              <div className="flex items-center gap-2">
                <IconButton
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  label="Move slide up"
                >
                  <ArrowUp size={16} />
                </IconButton>
                <IconButton
                  onClick={() => move(index, 1)}
                  disabled={index === heroSlides.length - 1}
                  label="Move slide down"
                >
                  <ArrowDown size={16} />
                </IconButton>
                <IconButton
                  onClick={() => remove(index)}
                  label="Delete slide"
                  danger
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Background image URL" className="sm:col-span-2">
                <input
                  className={inputClass}
                  value={slide.image}
                  onChange={(e) => update(index, { image: e.target.value })}
                  placeholder="https://…"
                />
              </Field>
              <Field label="Headline">
                <input
                  className={inputClass}
                  value={slide.headline}
                  onChange={(e) => update(index, { headline: e.target.value })}
                  placeholder="Find Your Dream Property"
                />
              </Field>
              <Field label="Primary CTA">
                <input
                  className={inputClass}
                  value={slide.ctaPrimary}
                  onChange={(e) =>
                    update(index, { ctaPrimary: e.target.value })
                  }
                  placeholder="Explore Properties"
                />
              </Field>
              <Field label="Subheadline" className="sm:col-span-2">
                <input
                  className={inputClass}
                  value={slide.subheadline}
                  onChange={(e) =>
                    update(index, { subheadline: e.target.value })
                  }
                  placeholder="Explore thousands of verified listings…"
                />
              </Field>
              <Field label="Secondary CTA">
                <input
                  className={inputClass}
                  value={slide.ctaSecondary}
                  onChange={(e) =>
                    update(index, { ctaSecondary: e.target.value })
                  }
                  placeholder="List Your Property"
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/[0.15] px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:border-[#C9A84C]/50 hover:text-[#C9A84C]"
      >
        <Plus size={16} aria-hidden="true" />
        Add slide
      </button>
    </SectionShell>
  );
}

function CategoriesEditor() {
  const categoriesEnabled = useContentStore((s) => s.categoriesEnabled);
  const categories = useContentStore((s) => s.categories);
  const setCategoriesEnabled = useContentStore((s) => s.setCategoriesEnabled);
  const setCategories = useContentStore((s) => s.setCategories);
  const resetSection = useContentStore((s) => s.resetSection);

  const edited =
    categoriesEnabled !== defaultContentState.categoriesEnabled ||
    JSON.stringify(categories) !==
      JSON.stringify(defaultContentState.categories);

  const update = (index: number, patch: Partial<Category>) => {
    setCategories(
      categories.map((cat, i) => (i === index ? { ...cat, ...patch } : cat)),
    );
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    const current = next[index];
    const swapped = next[target];
    if (current === undefined || swapped === undefined) return;
    next[index] = swapped;
    next[target] = current;
    setCategories(next);
  };

  const remove = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const add = () => {
    setCategories([...categories, { name: "", image: "" }]);
  };

  return (
    <SectionShell
      title="Categories"
      description="Property-type tiles in the “Browse by Category” strip on the real-state homepage."
      edited={edited}
      onReset={() => resetSection("categories")}
      viewHref="/"
      viewLabel="View homepage"
    >
      <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-[#E8E6E1]">
            Show category strip
          </p>
          <p className="text-xs text-white/40">
            {categories.length} categor{categories.length === 1 ? "y" : "ies"} ·{" "}
            {categoriesEnabled ? "visible on the homepage" : "hidden"}
          </p>
        </div>
        <Toggle
          checked={categoriesEnabled}
          onChange={setCategoriesEnabled}
          label="Toggle category strip"
        />
      </div>

      {!categoriesEnabled && (
        <HiddenBanner>
          The category strip is hidden. Turn on “Show category strip” to display
          it on the homepage.
        </HiddenBanner>
      )}

      <div className="space-y-3">
        {categories.map((cat, index) => (
          <div
            key={index}
            className="rounded-xl border border-white/[0.06] bg-[#1A1D23]/50 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <Field label={`Category ${index + 1} name`}>
                  <input
                    className={inputClass}
                    value={cat.name}
                    onChange={(e) => update(index, { name: e.target.value })}
                    placeholder="Apartments"
                  />
                </Field>
                <Field label="Image URL">
                  <input
                    className={inputClass}
                    value={cat.image}
                    onChange={(e) => update(index, { image: e.target.value })}
                    placeholder="https://…"
                  />
                </Field>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <IconButton
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  label="Move category up"
                >
                  <ArrowUp size={16} />
                </IconButton>
                <IconButton
                  onClick={() => move(index, 1)}
                  disabled={index === categories.length - 1}
                  label="Move category down"
                >
                  <ArrowDown size={16} />
                </IconButton>
                <IconButton
                  onClick={() => remove(index)}
                  label="Delete category"
                  danger
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/[0.15] px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:border-[#C9A84C]/50 hover:text-[#C9A84C]"
      >
        <Plus size={16} aria-hidden="true" />
        Add category
      </button>
    </SectionShell>
  );
}

const BLOCK_TYPE_LABELS: Record<ContentBlock["type"], string> = {
  hero: "Hero",
  article: "Article",
  infographic: "Infographic",
  comparison: "Comparison",
  faq: "FAQ",
  cta: "CTA",
};

function ContentBlocksEditor() {
  const contentBlocks = useContentStore((s) => s.contentBlocks);
  const setContentBlocks = useContentStore((s) => s.setContentBlocks);
  const updateContentBlock = useContentStore((s) => s.updateContentBlock);
  const resetSection = useContentStore((s) => s.resetSection);

  const edited =
    JSON.stringify(contentBlocks) !==
    JSON.stringify(defaultContentState.contentBlocks);

  const metalFilter = useMetalFilter(contentBlocks);

  const visible = useMemo(() => {
    const sorted = [...contentBlocks].sort((a, b) => a.order - b.order);
    return metalFilter.value === "all"
      ? sorted
      : sorted.filter((b) => b.metal === metalFilter.value);
  }, [contentBlocks, metalFilter.value]);

  const move = (id: string, dir: -1 | 1) => {
    const block = contentBlocks.find((b) => b.id === id);
    if (!block) return;
    const group = contentBlocks
      .filter((b) => b.metal === block.metal)
      .sort((a, b) => a.order - b.order);
    const index = group.findIndex((b) => b.id === id);
    const neighbor = group[index + dir];
    if (!neighbor) return;
    setContentBlocks(
      contentBlocks.map((b) => {
        if (b.id === id) return { ...b, order: neighbor.order };
        if (b.id === neighbor.id) return { ...b, order: block.order };
        return b;
      }),
    );
  };

  const remove = (id: string) => {
    setContentBlocks(contentBlocks.filter((b) => b.id !== id));
  };

  const add = () => {
    const metal: MetalId =
      metalFilter.value === "all" ? "gold" : metalFilter.value;
    const maxOrder = Math.max(
      0,
      ...contentBlocks.filter((b) => b.metal === metal).map((b) => b.order),
    );
    setContentBlocks([
      ...contentBlocks,
      {
        id: `custom-${Date.now()}`,
        metal,
        type: "article",
        order: maxOrder + 1,
        title: "",
        body: "",
        isPublished: true,
        updatedAt: new Date().toISOString(),
      },
    ]);
  };

  return (
    <SectionShell
      title="Metal Content Blocks"
      description="Articles, infographics, comparisons, and commentary rendered on the gold, silver, copper, diamond, and steel pages."
      edited={edited}
      onReset={() => resetSection("contentBlocks")}
      viewHref="/gold"
      viewLabel="View gold page"
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-white/40">
          Filter:
        </span>
        <button
          type="button"
          onClick={() => metalFilter.set("all")}
          aria-pressed={metalFilter.value === "all"}
          className={cx(
            "cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors",
            metalFilter.value === "all"
              ? "bg-white/[0.12] text-[#E8E6E1]"
              : "text-white/40 hover:text-white/70",
          )}
        >
          All
        </button>
        {metalFilter.options.map((metal) => (
          <button
            key={metal}
            type="button"
            onClick={() => metalFilter.set(metal)}
            aria-pressed={metalFilter.value === metal}
            className={cx(
              "cursor-pointer rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
              metalFilter.value === metal
                ? "bg-white/[0.12] text-[#E8E6E1]"
                : "text-white/40 hover:text-white/70",
            )}
          >
            {metal}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {visible.map((block) => (
          <div
            key={block.id}
            className="rounded-xl border border-white/[0.06] bg-[#1A1D23]/50 p-5"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/50">
                  {block.metal === "all" ? "Shared" : block.metal}
                </span>
                <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/50">
                  {BLOCK_TYPE_LABELS[block.type]}
                </span>
                {!block.isPublished && (
                  <span className="rounded-full bg-[#F87171]/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#F87171]">
                    Hidden
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/30">
                  {block.isPublished ? "Live" : "Draft"}
                </span>
                <Toggle
                  checked={block.isPublished}
                  onChange={(value) =>
                    updateContentBlock(block.id, { isPublished: value })
                  }
                  label={`${block.isPublished ? "Hide" : "Publish"} ${block.title || block.id}`}
                />
                <IconButton
                  onClick={() => move(block.id, -1)}
                  label="Move block up"
                >
                  <ArrowUp size={16} />
                </IconButton>
                <IconButton
                  onClick={() => move(block.id, 1)}
                  label="Move block down"
                >
                  <ArrowDown size={16} />
                </IconButton>
                <IconButton
                  onClick={() => remove(block.id)}
                  label="Delete block"
                  danger
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title">
                <input
                  className={inputClass}
                  value={block.title}
                  onChange={(e) =>
                    updateContentBlock(block.id, { title: e.target.value })
                  }
                  placeholder="What Affects Gold Prices?"
                />
              </Field>
              <Field label="Subtitle">
                <input
                  className={inputClass}
                  value={block.subtitle ?? ""}
                  onChange={(e) =>
                    updateContentBlock(block.id, { subtitle: e.target.value })
                  }
                  placeholder="Understanding the key drivers…"
                />
              </Field>
              <Field
                label="Body — supports **bold** and line breaks"
                className="sm:col-span-2"
              >
                <textarea
                  className={cx(inputClass, "min-h-[110px] resize-y")}
                  value={block.body}
                  onChange={(e) =>
                    updateContentBlock(block.id, { body: e.target.value })
                  }
                  placeholder="Write your content…"
                />
              </Field>
              <Field label="CTA text">
                <input
                  className={inputClass}
                  value={block.ctaText ?? ""}
                  onChange={(e) =>
                    updateContentBlock(block.id, { ctaText: e.target.value })
                  }
                  placeholder="Learn more"
                />
              </Field>
              <Field label="CTA link">
                <input
                  className={inputClass}
                  value={block.ctaLink ?? ""}
                  onChange={(e) =>
                    updateContentBlock(block.id, { ctaLink: e.target.value })
                  }
                  placeholder="https://…"
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/[0.15] px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:border-[#C9A84C]/50 hover:text-[#C9A84C]"
      >
        <Plus size={16} aria-hidden="true" />
        Add block
      </button>
    </SectionShell>
  );
}

/**
 * Metal filter chips derived from the blocks present in the store.
 */
function useMetalFilter(contentBlocks: ContentBlock[]) {
  const [value, setValue] = useState<"all" | MetalId>("all");
  const options = useMemo(() => {
    const seen = new Set<MetalId>();
    contentBlocks.forEach((b) => {
      if (b.metal !== "all") seen.add(b.metal);
    });
    return Array.from(seen);
  }, [contentBlocks]);
  return { value, set: setValue, options };
}

export function ContentAdmin() {
  const [tab, setTab] = useState<TabId>("hero");
  const resetAll = useContentStore((s) => s.resetAll);

  return (
    <div className="mx-auto w-full max-w-[1080px] px-6 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-semibold tracking-tight text-[#E8E6E1]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Content Management
          </h1>
          <p
            className="mt-1 text-sm text-white/40"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Control how content is displayed on the client. Changes save
            instantly to this browser — no backend changes required.
          </p>
        </div>
        <button
          type="button"
          onClick={resetAll}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#F87171]/30 px-4 py-2 text-sm font-medium text-[#F87171] transition-colors hover:bg-[#F87171]/10"
        >
          <RotateCcw size={15} aria-hidden="true" />
          Reset all content
        </button>
      </div>

      <div
        className="mb-6 flex flex-wrap items-center gap-1.5 rounded-xl border border-white/[0.06] bg-[#1A1D23]/50 p-1.5"
        role="tablist"
        aria-label="Content sections"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cx(
              "cursor-pointer rounded-lg px-4 py-2 text-left transition-colors",
              tab === item.id
                ? "bg-white/[0.08] text-[#E8E6E1]"
                : "text-white/40 hover:text-white/70",
            )}
          >
            <span className="block text-sm font-medium">{item.label}</span>
            <span className="block text-[10px] uppercase tracking-wider text-white/30">
              {item.hint}
            </span>
          </button>
        ))}
      </div>

      {tab === "hero" && <HeroBannerEditor />}
      {tab === "categories" && <CategoriesEditor />}
      {tab === "contentBlocks" && <ContentBlocksEditor />}
    </div>
  );
}
