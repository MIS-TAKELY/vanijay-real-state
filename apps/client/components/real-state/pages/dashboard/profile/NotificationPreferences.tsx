"use client";

import { Switch, Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@repo/ui";
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
        <Table className="w-full min-w-[420px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-full text-left font-label-sm text-[11px] font-bold uppercase tracking-widest text-on-surface-variant" />
              {NOTIFICATION_CHANNELS.map((channel) => (
                <TableHead
                  key={channel}
                  className="px-sm pb-sm text-center font-label-sm text-[11px] font-bold uppercase tracking-widest text-on-surface-variant"
                >
                  {NOTIFICATION_CHANNEL_LABELS[channel]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {NOTIFICATION_ROWS.map((row) => (
              <TableRow key={row.key} className="border-t border-outline-variant">
                <TableCell className="py-2.5 text-sm text-on-surface">{row.label}</TableCell>
                {NOTIFICATION_CHANNELS.map((channel) => {
                  const on = matrix[row.key]?.[channel] ?? false;
                  return (
                    <TableCell key={channel} className="px-sm py-2.5 text-center">
                      <Switch
                        checked={on}
                        onCheckedChange={() => toggle(row.key, channel)}
                        aria-label={`${row.label} — ${NOTIFICATION_CHANNEL_LABELS[channel]}`}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
