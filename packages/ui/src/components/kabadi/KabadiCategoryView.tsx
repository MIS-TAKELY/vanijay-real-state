"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Flame, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RichTextEditor } from "@/components/listing-wizard/RichTextEditor";

/* ── Types ── */

export interface KabadiCategoryItem {
  id: string;
  name: string;
  nepali?: string | null;
  unit: string;
  rate: string;
  note?: string | null;
  popular: boolean;
  sortOrder: number;
  published: boolean;
}

export interface KabadiCategoryViewData {
  id: string;
  slug: string;
  name: string;
  nepali?: string | null;
  icon?: string | null;
  blurb?: string | null;
  heroImage?: string | null;
  body?: string | null;
  faq?: { q: string; a: string }[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  items: KabadiCategoryItem[];
}

export interface KabadiCategoryViewProps {
  /** Category data to display */
  category: KabadiCategoryViewData;
  /** Other categories for the "related" section */
  allCategories?: KabadiCategoryViewData[];
  /** Whether to enable inline editing (admin mode) */
  editable?: boolean;
  /** Called when any field is edited */
  onFieldChange?: (field: string, value: unknown) => void;
  /** Called when an item's field is edited */
  onItemChange?: (itemId: string, field: string, value: unknown) => void;
  /** Base path for links (default: "/scrape") */
  basePath?: string;
}

/* ── Helpers ── */

function formatNepaliNumber(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.round(Math.abs(value));
  const s = String(abs);
  if (s.length <= 3) return `${sign}${s}`;
  const last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  const groups: string[] = [last3];
  while (rest.length > 2) {
    groups.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest.length > 0) groups.unshift(rest);
  return `${sign}${groups.join(",")}`;
}

function formatRate(item: { rate: string; unit: string }): string {
  return `Rs ${formatNepaliNumber(Number(item.rate))} / ${item.unit === "KG" ? "kg" : "piece"}`;
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

const CATEGORY_ICONS: Record<string, string> = {
  newspaper: "📰",
  recycling: "♻️",
  hammer: "🔨",
  cpu: "💻",
  refrigerator: "🧊",
  bottle: "🍾",
};

/* ── Editable Field ── */

function EditableField({
  value,
  onChange,
  editable,
  tag: Tag = "span",
  className,
  placeholder,
  multiline = false,
}: {
  value: string;
  onChange?: (v: string) => void;
  editable?: boolean;
  tag?: "span" | "p" | "h1" | "h2";
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [focused, setFocused] = useState(false);

  const handleBlur = useCallback(() => {
    setFocused(false);
    if (ref.current && onChange) {
      const newValue = ref.current.textContent ?? "";
      if (newValue !== value) {
        onChange(newValue);
      }
    }
  }, [onChange, value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!multiline && e.key === "Enter") {
        e.preventDefault();
        ref.current?.blur();
      }
    },
    [multiline],
  );

  if (!editable) {
    return (
      <Tag className={className}>
        {value || <span className="text-kabadi-muted/50">{placeholder}</span>}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref as any}
      contentEditable
      suppressContentEditableWarning
      className={cn(
        "relative outline-none",
        focused && "ring-2 ring-kabadi-primary/30",
        !focused && "hover:ring-1 hover:ring-kabadi-primary/20",
        !value && "before:pointer-events-none before:absolute before:inset-0 before:flex before:items-center before:text-kabadi-muted/50",
        className,
      )}
      style={!value ? { "--tw-ring-color": "rgba(26,107,60,0.2)" } as React.CSSProperties : undefined}
      data-placeholder={!value ? placeholder : undefined}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      dangerouslySetInnerHTML={{ __html: value || "" }}
    />
  );
}

/* ── Main Component ── */

export function KabadiCategoryView({
  category,
  allCategories = [],
  editable = false,
  onFieldChange,
  onItemChange,
  basePath = "/scrape",
}: KabadiCategoryViewProps) {
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const q = normalize(query);
    if (!q) return category.items;
    return category.items.filter((item) => {
      const haystack = normalize(
        `${item.name} ${item.nepali ?? ""} ${item.note ?? ""}`,
      );
      return haystack.includes(q);
    });
  }, [query, category.items]);

  const otherCategories = allCategories.filter((c) => c.id !== category.id);
  const icon = CATEGORY_ICONS[category.icon ?? ""] ?? "♻️";
  const highestRate = category.items.length
    ? Math.max(...category.items.map((i) => Number(i.rate)))
    : 0;

  const handleField = useCallback(
    (field: string) => (value: string) => {
      onFieldChange?.(field, value);
    },
    [onFieldChange],
  );

  return (
    <div className="min-h-screen bg-kabadi-bg">
      {/* ── Breadcrumbs ── */}
      <nav
        className="mx-auto flex max-w-container-max items-center gap-1.5 px-gutter py-4 text-sm text-kabadi-muted"
        aria-label="Breadcrumb"
      >
        {!editable && (
          <>
            <a
              href={basePath}
              className="transition-colors hover:text-kabadi-primary"
            >
              Kabadi
            </a>
            <span className="text-kabadi-muted/50">/</span>
          </>
        )}
        <span className="font-medium text-kabadi-on-bg">{category.name}</span>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-kabadi-border">
        {category.heroImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${category.heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-kabadi-bg/95 via-kabadi-bg/80 to-kabadi-bg/60" />
          </div>
        )}
        <div
          className={cn(
            "relative mx-auto flex max-w-container-max flex-col gap-8 px-gutter py-16 md:flex-row md:items-center md:py-24",
            !category.heroImage && "bg-kabadi-primary-soft/30",
          )}
        >
          <div className="flex-1">
            <p className="font-label-sm text-label-sm font-semibold uppercase tracking-[0.2em] text-kabadi-primary">
              {category.name}
            </p>
            <EditableField
              tag="h1"
              value={
                editable
                  ? (onFieldChange ? "" : category.name)
                  : category.seoTitle?.split("|")[0]?.trim() ||
                    `Sell ${category.name} in Kathmandu`
              }
              onChange={handleField("heroTitle")}
              editable={editable}
              className="mt-2 font-display-lg text-4xl tracking-tight text-kabadi-on-bg md:text-5xl"
              placeholder="Page title..."
            />
            {category.nepali && (
              <EditableField
                tag="p"
                value={category.nepali}
                onChange={handleField("nepali")}
                editable={editable}
                className="mt-2 text-lg text-kabadi-primary"
              />
            )}
            <EditableField
              tag="p"
              value={category.seoDescription || category.blurb || ""}
              onChange={handleField("blurb")}
              editable={editable}
              className="mt-4 max-w-xl text-base leading-relaxed text-kabadi-muted"
              placeholder="Short description for this category..."
            />
            {!editable && (
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="bg-kabadi-accent px-5! text-kabadi-on-accent hover:bg-kabadi-accent-strong"
                >
                  <a href="#rates">
                    <Search className="size-4" />
                    View all rates
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-kabadi-border hover:bg-kabadi-primary-soft hover:text-kabadi-primary"
                >
                  <a href="#how-it-works">
                    Book a pickup
                  </a>
                </Button>
              </div>
            )}
          </div>
          <div className="flex size-24 items-center justify-center rounded-3xl bg-kabadi-surface text-5xl shadow-lg md:size-32">
            {icon}
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-b border-kabadi-border bg-kabadi-surface">
        <div className="mx-auto flex max-w-container-max flex-wrap items-center gap-6 px-gutter py-5">
          <div className="flex items-center gap-2">
            <span className="font-data-table text-2xl font-bold text-kabadi-primary">
              {category.items.length}
            </span>
            <span className="text-sm text-kabadi-muted">items</span>
          </div>
          <div className="h-5 w-px bg-kabadi-border" />
          <div className="flex items-center gap-2">
            <span className="font-data-table text-2xl font-bold text-kabadi-primary">
              Rs {formatNepaliNumber(highestRate)}
            </span>
            <span className="text-sm text-kabadi-muted">
              highest rate / {category.items[0]?.unit === "KG" ? "kg" : "piece"}
            </span>
          </div>
        </div>
      </section>

      {/* ── Rates table ── */}
      <section
        id="rates"
        className="scroll-mt-24 border-b border-kabadi-border py-16 md:py-24"
      >
        <div className="mx-auto max-w-container-max px-gutter">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="font-label-sm text-label-sm font-semibold uppercase tracking-[0.2em] text-kabadi-primary">
                Today&apos;s Rates
              </p>
              <EditableField
                tag="h2"
                value={`${category.name} prices`}
                editable={false}
                className="mt-2 font-display-lg text-3xl tracking-tight text-kabadi-on-bg md:text-4xl"
              />
              <EditableField
                tag="p"
                value={category.blurb || ""}
                onChange={handleField("blurb")}
                editable={editable}
                className="mt-3 text-base leading-relaxed text-kabadi-muted"
                placeholder="Category description..."
              />
            </div>
            {!editable && (
              <div className="relative w-full sm:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-kabadi-muted" />
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label={`Search ${category.name} items`}
                  placeholder="Search an item or Nepali name…"
                  className="h-11 pl-9"
                />
              </div>
            )}
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-kabadi-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-kabadi-border bg-kabadi-surface-2">
                  <TableHead className="pl-5 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-kabadi-muted">
                    Item
                  </TableHead>
                  <TableHead className="pr-5 text-right font-label-sm text-label-sm font-semibold uppercase tracking-wider text-kabadi-muted">
                    You receive
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-kabadi-border hover:bg-kabadi-primary-soft/50"
                  >
                    <TableCell className="py-3.5 pl-5">
                      <div className="flex items-center gap-2">
                        {editable && onItemChange ? (
                          <EditableField
                            value={item.name}
                            onChange={(v) => onItemChange(item.id, "name", v)}
                            editable
                            className="text-[15px] font-medium text-kabadi-on-bg"
                          />
                        ) : (
                          <p className="flex items-center gap-2 text-[15px] font-medium text-kabadi-on-bg">
                            {item.name}
                            {item.popular && (
                              <Badge className="bg-kabadi-accent/15 text-kabadi-accent-strong">
                                <Flame className="size-3" />
                                popular
                              </Badge>
                            )}
                          </p>
                        )}
                      </div>
                      <p className="mt-0.5 truncate font-label-sm text-label-sm text-kabadi-muted">
                        {item.nepali && (
                          <span className="mr-2 text-kabadi-primary">
                            {item.nepali}
                          </span>
                        )}
                        {item.note ?? category.name}
                      </p>
                    </TableCell>
                    <TableCell className="py-3.5 pr-5 text-right">
                      {editable && onItemChange ? (
                        <div className="flex flex-col items-end gap-1">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) =>
                              onItemChange(item.id, "rate", e.target.value)
                            }
                            className="w-24 rounded border border-kabadi-border bg-kabadi-surface px-2 py-1 text-right font-data-table text-lg font-semibold text-kabadi-primary focus:outline-none focus:ring-2 focus:ring-kabadi-primary/30"
                          />
                          <span className="font-label-sm text-label-sm text-kabadi-muted">
                            {item.unit === "KG" ? "per kilogram" : "per piece"}
                          </span>
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-nowrap font-data-table text-lg font-semibold text-kabadi-primary">
                            {formatRate(item)}
                          </p>
                          <p className="font-label-sm text-label-sm text-kabadi-muted">
                            {item.unit === "KG" ? "per kilogram" : "per piece"}
                          </p>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {items.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-base text-kabadi-muted">
                  {editable
                    ? "No items yet. Add items in the rates table below."
                    : `No items match "${query}". Try a different search term.`}
                </p>
              </div>
            )}
          </div>

          <p className="mt-4 font-label-sm text-label-sm text-kabadi-muted">
            {items.length} item{items.length === 1 ? "" : "s"} · rates
            indicative · final price depends on condition, quantity &amp; market
          </p>
        </div>
      </section>

      {/* ── Long-form body content ── */}
      <section className="border-b border-kabadi-border py-16 md:py-24">
        <div className="mx-auto max-w-container-max px-gutter">
          {editable && onFieldChange ? (
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-kabadi-muted">
                Body Content
              </label>
              <RichTextEditor
                value={category.body || ""}
                onChange={(html) => onFieldChange("body", html)}
                placeholder="Write about this category — what items are accepted, tips for sellers, how rates work..."
              />
            </div>
          ) : category.body ? (
            <div
              className="prose prose-kabadi max-w-3xl text-kabadi-on-bg"
              dangerouslySetInnerHTML={{ __html: category.body }}
            />
          ) : null}
        </div>
      </section>

      {/* ── FAQ section ── */}
      {category.faq && category.faq.length > 0 && (
        <section
          id="faq"
          className="scroll-mt-24 border-b border-kabadi-border py-16 md:py-24"
        >
          <div className="mx-auto max-w-container-max px-gutter">
            <p className="font-label-sm text-label-sm font-semibold uppercase tracking-[0.2em] text-kabadi-primary">
              FAQ
            </p>
            <h2 className="mt-2 font-display-lg text-3xl tracking-tight text-kabadi-on-bg">
              Frequently asked questions
            </h2>
            <div className="mt-8 space-y-4">
              {category.faq.map((f, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border border-kabadi-border bg-kabadi-surface p-5"
                >
                  <summary className="cursor-pointer text-base font-semibold text-kabadi-on-bg transition-colors group-hover:text-kabadi-primary">
                    {f.q}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-kabadi-muted">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Other categories ── */}
      {!editable && otherCategories.length > 0 && (
        <section className="border-b border-kabadi-border py-16 md:py-24">
          <div className="mx-auto max-w-container-max px-gutter">
            <p className="font-label-sm text-label-sm font-semibold uppercase tracking-[0.2em] text-kabadi-primary">
              Other categories
            </p>
            <h2 className="mt-2 font-display-lg text-3xl tracking-tight text-kabadi-on-bg">
              Explore more kabadi categories
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherCategories.map((cat) => {
                const catIcon = CATEGORY_ICONS[cat.icon ?? ""] ?? "♻️";
                return (
                  <a
                    key={cat.id}
                    href={`${basePath}/${cat.slug}`}
                    className="group block"
                  >
                    <Card className="h-full rounded-2xl border-kabadi-border transition-all duration-300 group-hover:-translate-y-1 group-hover:border-kabadi-primary/40 group-hover:shadow-[0_20px_48px_-20px_rgba(26,107,60,0.35)]">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 items-center justify-center rounded-xl bg-kabadi-primary-soft text-xl">
                            {catIcon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-semibold text-kabadi-on-bg">
                              {cat.name}
                            </p>
                            <p className="text-xs text-kabadi-primary">
                              {cat.nepali}
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-kabadi-muted line-clamp-2">
                          {cat.blurb}
                        </p>
                      </CardContent>
                    </Card>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
