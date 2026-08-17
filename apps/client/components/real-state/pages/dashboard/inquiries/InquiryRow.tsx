"use client";

import { cn, Icon } from "@repo/ui";
import type { Inquiry } from "./constants";
import { InquiryStatusChip } from "./InquiryStatusChip";
import { InquiryThread } from "./InquiryThread";
import { InquiryTypeIcon } from "./InquiryTypeIcon";

interface InquiryRowProps {
  inquiry: Inquiry;
  expanded: boolean;
  onToggle: (id: string) => void;
}

export function InquiryRow({ inquiry, expanded, onToggle }: InquiryRowProps) {
  return (
    <div className="border-b border-outline-variant last:border-b-0">
      <button
        type="button"
        onClick={() => onToggle(inquiry.id)}
        aria-expanded={expanded}
        className={cn(
          "grid w-full cursor-pointer grid-cols-[auto_minmax(160px,1.5fr)_1fr_auto_auto] items-center gap-sm px-sm py-3 text-left transition-colors hover:bg-surface-container-high",
          expanded && "bg-surface-container-high",
        )}
      >
        <InquiryTypeIcon type={inquiry.type} />

        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-1">
            <span className="truncate text-sm font-medium text-on-surface">
              {inquiry.personName}
            </span>
            {inquiry.isVerifiedLead ? (
              <Icon
                name="verified"
                filled
                className="shrink-0 text-[14px] text-gold"
              />
            ) : null}
          </div>
          <span className="mono-stat truncate text-[12px] text-on-surface-variant">
            {inquiry.propertyCode}
          </span>
        </div>

        <p className="hidden truncate text-sm text-on-surface-variant md:block">
          {inquiry.message}
        </p>

        <span className="hidden sm:inline-flex">
          <InquiryStatusChip status={inquiry.status} />
        </span>

        {/* Date + reply caret */}
        <div className="flex items-center gap-xs">
          <span className="mono-stat hidden text-[12px] text-on-surface-variant sm:inline-block whitespace-nowrap">
            {inquiry.date}
          </span>
          <span className="flex items-center gap-1 text-label-sm font-medium text-on-surface-variant">
            <Icon name="reply" className="text-data-table" />
            <Icon
              name={expanded ? "expand_less" : "expand_more"}
              className="text-body-lg"
            />
          </span>
        </div>
      </button>

      {expanded ? <InquiryThread inquiry={inquiry} /> : null}
    </div>
  );
}
