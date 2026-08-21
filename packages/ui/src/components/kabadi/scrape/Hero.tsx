"use client";

import { Badge } from "../../ui/badge";
import { EditableField } from "./EditableField";
import type { OnSectionFieldChange } from "./types";

interface HeroProps {
  editable?: boolean;
  onFieldChange?: OnSectionFieldChange;
}

export function Hero({ editable = false, onFieldChange }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="kabadi-grid-bg absolute inset-0 pointer-events-none" />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[54rem] -translate-x-1/2 rounded-full bg-gold/15 blur-[110px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-container-max px-gutter py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="outline"
            className="border-primary/25 bg-accent px-4 py-1.5 font-label-sm text-label-sm font-semibold text-primary"
          >
            <EditableField
              tag="span"
              value="कबाडी बेच्नुहोस् · नगद पाउनुहोस्"
              onChange={(v) => onFieldChange?.("hero", "badgeNepali", v)}
              editable={editable}
            />
            <span className="text-muted-foreground">·</span>
            <EditableField
              tag="span"
              value="transparent Kathmandu rates"
              onChange={(v) => onFieldChange?.("hero", "badgeEnglish", v)}
              editable={editable}
            />
          </Badge>

          <EditableField
            tag="h1"
            value="Kabadi"
            onChange={(v) => onFieldChange?.("hero", "title", v)}
            editable={editable}
            className="mt-6 font-display-lg text-5xl leading-[1.04] tracking-tight text-foreground md:text-7xl"
          />
        </div>
      </div>
    </section>
  );
}
