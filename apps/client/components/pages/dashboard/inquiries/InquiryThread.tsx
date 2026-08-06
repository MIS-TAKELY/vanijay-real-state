"use client";

import { Button, cn, Icon, Textarea } from "@repo/ui";
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
        <Button
          type="button"
          variant="outline"
          className="inline-flex items-center gap-1 rounded-md border-outline-variant px-3 py-1.5 text-label-sm font-medium text-on-surface hover:border-primary hover:text-primary cursor-pointer"
        >
          <Icon name="chat" className="text-data-table" />
          WhatsApp
        </Button>
        <Button
          type="button"
          variant="outline"
          className="inline-flex items-center gap-1 rounded-md border-outline-variant px-3 py-1.5 text-label-sm font-medium text-on-surface hover:border-primary hover:text-primary cursor-pointer"
        >
          <Icon name="handshake" className="text-data-table" />
          Mark negotiating
        </Button>
        <Button
          type="button"
          variant="outline"
          className="inline-flex items-center gap-1 rounded-md border-outline-variant px-3 py-1.5 text-label-sm font-medium text-on-surface-variant hover:text-on-surface cursor-pointer"
        >
          <Icon name="check_circle" className="text-data-table" />
          Close inquiry
        </Button>
      </div>

      {/* Internal note box */}
      <div className="flex flex-col gap-xs">
        <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
          Internal note
        </span>
        <Textarea
          rows={2}
          placeholder="Add a private note (only visible to you)…"
          className="w-full rounded-md border-outline-variant bg-surface"
        />
      </div>
    </div>
  );
}
