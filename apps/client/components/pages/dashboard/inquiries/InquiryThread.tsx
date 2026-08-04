"use client";

import { cn, Icon } from "@repo/ui";
import type { Inquiry } from "./constants";

interface InquiryThreadProps {
  inquiry: Inquiry;
}

export function InquiryThread({ inquiry }: InquiryThreadProps) {
  return (
    <div className="flex flex-col gap-sm border-t border-outline-variant bg-surface-container-low p-md">
      {/* Message history */}
      <div className="flex flex-col gap-sm">
        {inquiry.thread.map((msg) => {
          const mine = msg.side === "mine";
          return (
            <div
              key={msg.id}
              className={cn("flex", mine ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-md py-sm",
                  mine
                    ? "bg-secondary-container text-on-surface"
                    : "bg-surface border border-outline-variant text-on-surface",
                )}
              >
                {!mine ? (
                  <p className="mb-0.5 text-[11px] font-semibold text-on-surface-variant">
                    {msg.author}
                  </p>
                ) : null}
                <p className="text-sm leading-snug">{msg.body}</p>
                <p
                  className={cn(
                    "mono-stat mt-1 text-[10px]",
                    mine
                      ? "text-on-surface-variant"
                      : "text-on-surface-variant",
                  )}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-xs">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md border border-outline-variant px-3 py-1.5 text-label-sm font-medium text-on-surface hover:border-primary hover:text-primary transition-colors cursor-pointer"
        >
          <Icon name="chat" className="text-data-table" />
          WhatsApp
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md border border-outline-variant px-3 py-1.5 text-label-sm font-medium text-on-surface hover:border-primary hover:text-primary transition-colors cursor-pointer"
        >
          <Icon name="handshake" className="text-data-table" />
          Mark negotiating
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md border border-outline-variant px-3 py-1.5 text-label-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        >
          <Icon name="check_circle" className="text-data-table" />
          Close inquiry
        </button>
      </div>

      {/* Internal note box */}
      <div className="flex flex-col gap-xs">
        <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
          Internal note
        </span>
        <textarea
          rows={2}
          placeholder="Add a private note (only visible to you)…"
          className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
        />
      </div>
    </div>
  );
}
