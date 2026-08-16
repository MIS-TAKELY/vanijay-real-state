"use client";

import { Card, CardContent, CardHeader, CardTitle, Icon } from "@repo/ui";
import type { StatCardData } from "constants/operations";

const TONE_VALUE: Record<NonNullable<StatCardData["tone"]>, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
  amber: "text-amber",
  surface: "text-on-surface-variant",
};

const TONE_BG: Record<NonNullable<StatCardData["tone"]>, string> = {
  primary: "bg-primary/10 ring-primary/15",
  secondary: "bg-secondary/10 ring-secondary/15",
  tertiary: "bg-tertiary/10 ring-tertiary/15",
  amber: "bg-amber/10 ring-amber/15",
  surface: "bg-surface-container ring-outline-variant/30",
};

/** A single-key metric card. Value in monospace ledger style, never centered. */
export function StatCard({ stat }: { stat: StatCardData }) {
  return (
    <Card className="admin-surface border border-outline-variant">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-sm">
        <CardTitle className="font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant">
          {stat.label}
        </CardTitle>
        <div
          className={
            "flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-offset-0 " +
            TONE_BG[stat.tone] +
            " " +
            TONE_VALUE[stat.tone]
          }
        >
          <Icon name={stat.icon} className="text-[20px]" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div
          className={
            "mono-stat text-3xl font-bold tracking-tight " +
            TONE_VALUE[stat.tone]
          }
        >
          {stat.value}
        </div>
        {stat.hint ? (
          <p className="font-label-sm text-[11px] text-on-surface-variant">
            {stat.hint}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
