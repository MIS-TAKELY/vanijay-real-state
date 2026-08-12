"use client";

import { Button, Icon } from "@repo/ui";
import { useState } from "react";
import { AppointmentStatusChip } from "./AppointmentStatusChip";
import {
  APPOINTMENT_TYPE_LABELS,
  DEFAULT_APPOINTMENT_TYPE_LABEL,
  type Appointment,
} from "./constants";

interface AppointmentRowProps {
  appointment: Appointment;
}

export function AppointmentRow({ appointment }: AppointmentRowProps) {
  const [expanded, setExpanded] = useState(false);
  const isCompleted = appointment.status === "COMPLETED";
  const typeLabel =
    APPOINTMENT_TYPE_LABELS[appointment.type] ?? DEFAULT_APPOINTMENT_TYPE_LABEL;

  return (
    <div className="border-b border-outline-variant last:border-b-0">
      <div className="flex flex-col gap-sm px-sm py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-md">
          {/* Date block */}
          <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-outline-variant bg-surface py-1.5">
            <span className="mono-stat text-lg font-bold text-on-surface leading-none">
              {appointment.day}
            </span>
            <span className="font-label-sm text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              {appointment.month}
            </span>
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-1.5">
              <span className="mono-stat text-[12px] text-on-surface-variant">
                {appointment.propertyCode}
              </span>
              <span className="text-[11px] text-outline-variant">·</span>
              <span className="truncate text-[12px] text-on-surface-variant">
                {appointment.propertyArea}
              </span>
            </div>
            <span className="text-sm font-medium text-on-surface">
              {typeLabel}
            </span>
            <span className="font-label-sm text-[11px] text-on-surface-variant">
              Officer: {appointment.officerName}
              {appointment.time !== "—" ? (
                <span className="mono-stat ml-1">· {appointment.time}</span>
              ) : null}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-sm sm:justify-end">
          <AppointmentStatusChip status={appointment.status} />
          <div className="flex items-center gap-xs">
            <Button
              type="button"
              variant="outline"
              className="inline-flex items-center gap-1 rounded-md border-outline-variant px-2.5 py-1.5 text-label-sm font-medium text-on-surface hover:border-primary hover:text-primary cursor-pointer"
            >
              <Icon name="event_repeat" className="text-data-table" />
              Reschedule
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Cancel appointment"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant hover:bg-error/10 hover:text-error cursor-pointer"
            >
              <Icon name="cancel" className="text-body-lg" />
            </Button>
            {isCompleted ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                aria-label="Toggle outcome notes"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface cursor-pointer"
              >
                <Icon
                  name={expanded ? "expand_less" : "expand_more"}
                  className="text-body-lg"
                />
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {isCompleted && expanded && appointment.outcomeNotes ? (
        <div className="mx-sm mb-sm rounded-xl border border-outline-variant bg-surface-container-low p-sm">
          <p className="mb-xs flex items-center gap-1 font-label-sm text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            <Icon name="task_alt" className="text-data-table text-primary" />
            Outcome notes
          </p>
          <p className="text-sm leading-snug text-on-surface">
            {appointment.outcomeNotes}
          </p>
        </div>
      ) : null}
    </div>
  );
}
