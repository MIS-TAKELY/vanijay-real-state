/**
 * Inquiries constants & mock data (DESIGN.md §5.5).
 *
 * Shapes mirror the real Prisma model `Inquiry` (see
 * `packages/db/prisma/schema.prisma`) — `InquiryType` and `InquiryStatus`
 * enums — so this skeleton can be wired to live data later without
 * reshaping the components.
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type InquiryType =
  | "WHATSAPP_CHAT"
  | "VIDEO_WALKTHROUGH_REQUEST"
  | "GENERAL_INQUIRY"
  | "EMI_CALCULATION";

export type InquiryStatus = "OPEN" | "IN_NEGOTIATION" | "CLOSED";

export type InquiryTab = "RECEIVED" | "SENT";

/** An inquiry row — Inquiry + display-only fields. */
export interface Inquiry {
  id: string;
  type: InquiryType;
  status: InquiryStatus;
  /** Inquirer (Received) or recipient (Sent) display name. */
  personName: string;
  isVerifiedLead: boolean;
  /** Property listing code chip. */
  propertyCode: string;
  /** Short message excerpt. */
  message: string;
  /** Pre-formatted date, rendered mono. */
  date: string;
  /** Thread messages (revealed on row click). */
  thread: InquiryMessage[];
}

export interface InquiryMessage {
  id: string;
  /** "mine" = secondary-container bubble; "theirs" = surface border. */
  side: "mine" | "theirs";
  author: string;
  body: string;
  /** Pre-formatted time, rendered mono. */
  time: string;
}

/* ------------------------------------------------------------------ */
/* Type → icon + label                                                 */
/* ------------------------------------------------------------------ */

export interface InquiryTypeMeta {
  /** Material Symbols icon name. */
  icon: string;
  label: string;
}

export const INQUIRY_TYPE_META: Record<InquiryType, InquiryTypeMeta> = {
  WHATSAPP_CHAT: { icon: "chat", label: "WhatsApp" },
  VIDEO_WALKTHROUGH_REQUEST: { icon: "videocam", label: "Video" },
  GENERAL_INQUIRY: { icon: "forum", label: "General" },
  EMI_CALCULATION: { icon: "calculate", label: "EMI" },
};

export const DEFAULT_INQUIRY_TYPE_META: InquiryTypeMeta = {
  icon: "forum",
  label: "General",
};

/* ------------------------------------------------------------------ */
/* Status chip styles                                                  */
/* ------------------------------------------------------------------ */

export interface InquiryStatusStyle {
  dot: string;
  chip: string;
  label: string;
}

export const DEFAULT_INQUIRY_STATUS_STYLE: InquiryStatusStyle = {
  dot: "bg-on-surface-variant",
  chip: "bg-surface-container-high text-on-surface-variant",
  label: "—",
};

export const INQUIRY_STATUS_STYLES: Record<InquiryStatus, InquiryStatusStyle> =
  {
    OPEN: {
      dot: "bg-[#b45309]",
      chip: "bg-[#b45309]/10 text-[#b45309]",
      label: "Open",
    },
    IN_NEGOTIATION: {
      dot: "bg-primary",
      chip: "bg-primary/10 text-primary",
      label: "Negotiating",
    },
    CLOSED: {
      dot: "bg-on-surface-variant",
      chip: "bg-surface-container text-on-surface-variant",
      label: "Closed",
    },
  };

/* ------------------------------------------------------------------ */
/* Tabs                                                                */
/* ------------------------------------------------------------------ */

export const INQUIRY_TABS: { key: InquiryTab; label: string }[] = [
  { key: "RECEIVED", label: "Received" },
  { key: "SENT", label: "Sent" },
];

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

export const RECEIVED_INQUIRIES: Inquiry[] = [
  {
    id: "i1",
    type: "WHATSAPP_CHAT",
    status: "OPEN",
    personName: "Sujan Maharjan",
    isVerifiedLead: true,
    propertyCode: "LOT-442-BHA",
    message:
      "Is the road access paved all the way to the plot? Can we visit this weekend?",
    date: "10:42 AM",
    thread: [
      {
        id: "m1",
        side: "theirs",
        author: "Sujan Maharjan",
        body: "Is the road access paved all the way to the plot? Can we visit this weekend?",
        time: "10:42 AM",
      },
      {
        id: "m2",
        side: "mine",
        author: "You",
        body: "Yes, 20ft pitched road up to the boundary. Saturday morning works for a site visit.",
        time: "11:05 AM",
      },
    ],
  },
  {
    id: "i2",
    type: "EMI_CALCULATION",
    status: "IN_NEGOTIATION",
    personName: "Anita Gurung",
    isVerifiedLead: true,
    propertyCode: "KTM-209",
    message:
      "Can you share EMI estimates for a 15-year term at 10% on NPR 5 Cr?",
    date: "Yesterday",
    thread: [
      {
        id: "m3",
        side: "theirs",
        author: "Anita Gurung",
        body: "Can you share EMI estimates for a 15-year term at 10% on NPR 5 Cr?",
        time: "Yesterday",
      },
    ],
  },
  {
    id: "i3",
    type: "GENERAL_INQUIRY",
    status: "OPEN",
    personName: "Ramesh K.C.",
    isVerifiedLead: false,
    propertyCode: "IMD-073",
    message:
      "What is the status of the Lalpurja verification? Any disputes on this plot?",
    date: "2d ago",
    thread: [
      {
        id: "m4",
        side: "theirs",
        author: "Ramesh K.C.",
        body: "What is the status of the Lalpurja verification? Any disputes on this plot?",
        time: "2d ago",
      },
    ],
  },
  {
    id: "i4",
    type: "VIDEO_WALKTHROUGH_REQUEST",
    status: "CLOSED",
    personName: "Prakash Shrestha",
    isVerifiedLead: true,
    propertyCode: "LAL-318",
    message:
      "Could you arrange a video walkthrough of the heritage home interior?",
    date: "1w ago",
    thread: [
      {
        id: "m5",
        side: "theirs",
        author: "Prakash Shrestha",
        body: "Could you arrange a video walkthrough of the heritage home interior?",
        time: "1w ago",
      },
      {
        id: "m6",
        side: "mine",
        author: "You",
        body: "Walkthrough recorded and shared. Let me know if you'd like to proceed.",
        time: "1w ago",
      },
    ],
  },
];

export const SENT_INQUIRIES: Inquiry[] = [
  {
    id: "s1",
    type: "GENERAL_INQUIRY",
    status: "OPEN",
    personName: "Bhaisepati Land Owner",
    isVerifiedLead: true,
    propertyCode: "LOT-442-BHA",
    message:
      "Following up on the boundary measurement — has the surveyor confirmed the corners?",
    date: "3h ago",
    thread: [
      {
        id: "sm1",
        side: "mine",
        author: "You",
        body: "Following up on the boundary measurement — has the surveyor confirmed the corners?",
        time: "3h ago",
      },
    ],
  },
  {
    id: "s2",
    type: "WHATSAPP_CHAT",
    status: "IN_NEGOTIATION",
    personName: "Durbar Marg Agent",
    isVerifiedLead: true,
    propertyCode: "KTM-209",
    message:
      "The buyer is open to NPR 8.2 Cr with a 30-day escrow. Can we draft the offer?",
    date: "1d ago",
    thread: [
      {
        id: "sm2",
        side: "mine",
        author: "You",
        body: "The buyer is open to NPR 8.2 Cr with a 30-day escrow. Can we draft the offer?",
        time: "1d ago",
      },
      {
        id: "sm3",
        side: "theirs",
        author: "Durbar Marg Agent",
        body: "Will check with the seller and revert by tomorrow EOD.",
        time: "1d ago",
      },
    ],
  },
];
