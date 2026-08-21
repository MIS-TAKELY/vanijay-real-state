"use client";

import { ArrowRight, Phone, Truck } from "lucide-react";
import { Button } from "../../ui/button";
import { EditableField } from "./EditableField";
import type { CTAContent, OnSectionFieldChange } from "./types";

const DEFAULT_CONTENT: CTAContent = {
  heading: "Your kabadi is worth",
  headingHighlight: "more than you think.",
  description:
    "Check the rates, run the calculator, then book a pickup. We collect from your doorstep — same day in the Valley — and pay cash on the spot.",
  primaryButtonText: "Book a pickup",
  primaryButtonHref: "#how-it-works",
  secondaryButtonText: "9702634469",
  secondaryButtonHref: "tel:9800522234",
  phone: "9702634469",
};

interface CTAProps {
  content?: Partial<CTAContent>;
  editable?: boolean;
  onFieldChange?: OnSectionFieldChange;
}

export function CTA({
  content,
  editable = false,
  onFieldChange,
}: CTAProps) {
  const c = { ...DEFAULT_CONTENT, ...content };

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="kabadi-grid-bg absolute inset-0 pointer-events-none" />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-72 -translate-x-1/2 rounded-full bg-primary/10 blur-[110px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-container-max px-gutter text-center">
        <span className="mx-auto inline-flex size-16 items-center justify-center rounded-2xl bg-gold text-on-gold shadow-lg shadow-[color-mix(in_oklab,var(--color-gold)_30%,transparent)]">
          <Truck className="size-8" />
        </span>
        <h2 className="mt-6 font-display-lg text-4xl tracking-tight text-foreground md:text-5xl">
          <EditableField
            tag="span"
            value={c.heading}
            onChange={(v) => onFieldChange?.("cta", "heading", v)}
            editable={editable}
          />
          <span className="block bg-gradient-to-r from-primary via-gold-deep to-gold bg-clip-text text-transparent">
            <EditableField
              tag="span"
              value={c.headingHighlight}
              onChange={(v) => onFieldChange?.("cta", "headingHighlight", v)}
              editable={editable}
            />
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          <EditableField
            tag="span"
            value={c.description}
            onChange={(v) => onFieldChange?.("cta", "description", v)}
            editable={editable}
            multiline
          />
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="h-auto bg-gold px-7! py-3.5 text-base font-semibold text-on-gold hover:bg-gold-deep hover:shadow-[0_0_28px_rgba(201,162,39,0.4)]"
          >
            <a href={c.primaryButtonHref}>
              {editable ? (
                <EditableField
                  tag="span"
                  value={c.primaryButtonText}
                  onChange={(v) => onFieldChange?.("cta", "primaryButtonText", v)}
                  editable
                />
              ) : (
                c.primaryButtonText
              )}
              <ArrowRight />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-auto px-7! py-3.5 text-base font-semibold"
          >
            <a href={c.secondaryButtonHref}>
              <Phone />
              {editable ? (
                <EditableField
                  tag="span"
                  value={c.secondaryButtonText}
                  onChange={(v) => onFieldChange?.("cta", "secondaryButtonText", v)}
                  editable
                />
              ) : (
                c.secondaryButtonText
              )}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
