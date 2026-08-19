"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "components/real-state/layout/dashboard/EmptyState";
import {
  RECEIVED_INQUIRIES,
  SENT_INQUIRIES,
  type InquiryTab,
} from "./constants";
import { InquiryRow } from "./InquiryRow";
import { InquiryTabs } from "./InquiryTabs";

export function InquiryList() {
  const [tab, setTab] = useState<InquiryTab>("RECEIVED");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const items = tab === "RECEIVED" ? RECEIVED_INQUIRIES : SENT_INQUIRIES;

  const counts = useMemo(
    () => ({
      RECEIVED: RECEIVED_INQUIRIES.length,
      SENT: SENT_INQUIRIES.length,
    }),
    [],
  );

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  if (RECEIVED_INQUIRIES.length === 0 && SENT_INQUIRIES.length === 0) {
    return (
      <EmptyState
        icon="forum"
        title="No inquiries yet"
        description="When buyers message your listings, their inquiries will appear here."
      />
    );
  }

  return (
    <div className="flex flex-col">
      <InquiryTabs active={tab} counts={counts} onChange={setTab} />

      <div className="rounded-2xl border border-outline-variant bg-surface">
        {/* Desktop header — visible md+ */}
        <div className="hidden md:grid grid-cols-[auto_minmax(160px,1.5fr)_1fr_auto_auto] items-center gap-sm border-b border-outline-variant bg-surface-container-low px-sm py-2.5">
          <span className="font-label-sm text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep">
            Type
          </span>
          <span className="font-label-sm text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep">
            Person
          </span>
          <span className="font-label-sm text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep">
            Message
          </span>
          <span className="font-label-sm text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep">
            Status
          </span>
          <span className="font-label-sm text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep">
            Date
          </span>
        </div>

          {items.length === 0 ? (
            <div className="px-sm py-md text-sm text-on-surface-variant">
              No {tab.toLowerCase()} inquiries.
            </div>
          ) : (
            items.map((inquiry) => (
              <InquiryRow
                key={inquiry.id}
                inquiry={inquiry}
                expanded={expandedId === inquiry.id}
                onToggle={toggle}
              />
            ))
        )}
      </div>
    </div>
  );
}
