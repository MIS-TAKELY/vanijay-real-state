"use client";

import { cn } from "@repo/ui";
import { useState } from "react";
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_ROWS,
  type NotificationChannel,
} from "./constants";

export function NotificationPreferences() {
  const [matrix, setMatrix] = useState<Record<string, Record<NotificationChannel, boolean>>>(
    () => {
      const init = {} as Record<string, Record<NotificationChannel, boolean>>;
      for (const row of NOTIFICATION_ROWS) {
        init[row.key] = { in_app: true, email: false };
      }
      // Weekly digest defaults to email on
      init.weekly_digest = { in_app: false, email: true };
      return init;
    },
  );

  const toggle = (rowKey: string, channel: NotificationChannel) =>
    setMatrix((prev) => {
      const current: Record<NotificationChannel, boolean> =
        prev[rowKey] ?? { in_app: false, email: false };
      return {
        ...prev,
        [rowKey]: { ...current, [channel]: !current[channel] },
      };
    });

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface p-md">
      <h2 className="mb-md font-headline-md text-base font-semibold text-on-surface">
        Notification Preferences
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse">
          <thead>
            <tr>
              <th className="w-full pb-sm text-left font-label-sm text-[11px] font-bold uppercase tracking-widest text-on-surface-variant" />
              {NOTIFICATION_CHANNELS.map((channel) => (
                <th
                  key={channel}
                  className="px-sm pb-sm text-center font-label-sm text-[11px] font-bold uppercase tracking-widest text-on-surface-variant"
                >
                  {NOTIFICATION_CHANNEL_LABELS[channel]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NOTIFICATION_ROWS.map((row) => (
              <tr key={row.key} className="border-t border-outline-variant">
                <td className="py-2.5 text-sm text-on-surface">{row.label}</td>
                {NOTIFICATION_CHANNELS.map((channel) => {
                  const on = matrix[row.key]?.[channel] ?? false;
                  return (
                    <td key={channel} className="px-sm py-2.5 text-center">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={on}
                        aria-label={`${row.label} — ${NOTIFICATION_CHANNEL_LABELS[channel]}`}
                        onClick={() => toggle(row.key, channel)}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer",
                          on ? "bg-primary" : "bg-surface-container-high",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-5 w-5 transform rounded-full bg-surface shadow transition-transform",
                            on ? "translate-x-5" : "translate-x-0.5",
                          )}
                        />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
