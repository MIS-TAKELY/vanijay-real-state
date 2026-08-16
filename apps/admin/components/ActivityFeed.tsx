"use client";

import { Icon } from "@repo/ui";
import { RECENT_ACTIVITY } from "constants/operations";

/**
 * Recent activity timeline — a mixed log of verification, flags, and system
 * events. The icon tint encodes event type (green = positive, amber = alert,
 * vermillion = dispute, grey = neutral) so operators scan by color, not by
 * reading every line.
 */
const ICON_TONE: Record<string, string> = {
  verified: "text-primary",
  schedule: "text-amber",
  article: "text-secondary",
  warning: "text-tertiary",
};

export function ActivityFeed() {
  return (
    <div className="space-y-sm">
      {RECENT_ACTIVITY.map((item) => (
        <div key={item.id} className="flex items-start gap-sm">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-container-high">
            <Icon
              name={item.icon}
              className={
                "text-[15px] " +
                (ICON_TONE[item.icon] ?? "text-on-surface-variant")
              }
              filled
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-body-md text-body-md text-on-surface">
              {item.label}
            </p>
            <p className="font-label-sm text-[11px] text-on-surface-variant">
              {item.detail}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span className="mono-stat text-[11px] text-on-surface-variant">
              {item.time}
            </span>
            <span className="block mono-stat text-[10px] text-on-surface-variant/60">
              {item.mono}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
