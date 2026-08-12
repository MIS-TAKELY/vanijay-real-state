/**
 * My Questions constants & mock data (DESIGN.md §5.7).
 *
 * Shapes mirror the real Prisma models `Question` / `Answer` (see
 * `packages/db/prisma/schema.prisma`) — `QuestionCategory` enum, `areaTag`,
 * `body` — so this skeleton can be wired to live data later without
 * reshaping the components.
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type QuestionCategory =
  | "LEGAL"
  | "FINANCING"
  | "NRN"
  | "AREA_SPECIFIC"
  | "GENERAL";

/** A question the current user asked. */
export interface MyQuestion {
  id: string;
  category: QuestionCategory;
  areaTag: string | null;
  body: string;
  /** Whether at least one answer has been accepted. */
  answered: boolean;
  /** Number of answers received, rendered mono. */
  answerCount: number;
  /** Pre-formatted "Asked" label, rendered mono. */
  askedAt: string;
}

/** An answer the current user gave to someone else's question. */
export interface MyAnswer {
  id: string;
  category: QuestionCategory;
  /** The question body this answer responds to (excerpt). */
  questionExcerpt: string;
  body: string;
  /** Upvote count, rendered mono. */
  upvotes: number;
  /** Whether this answer was accepted by the asker. */
  accepted: boolean;
  /** Pre-formatted "Answered" label, rendered mono. */
  answeredAt: string;
}

/* ------------------------------------------------------------------ */
/* Category labels                                                     */
/* ------------------------------------------------------------------ */

export const QUESTION_CATEGORY_LABELS: Record<QuestionCategory, string> = {
  LEGAL: "Legal",
  FINANCING: "Financing",
  NRN: "NRN",
  AREA_SPECIFIC: "Area",
  GENERAL: "General",
};

export const DEFAULT_CATEGORY_LABEL = "General";

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

export const MY_QUESTIONS: MyQuestion[] = [
  {
    id: "q1",
    category: "LEGAL",
    areaTag: "Bhaisepati",
    body: "How do I confirm a plot is free of Guthi trust encumbrance before making an offer?",
    answered: true,
    answerCount: 2,
    askedAt: "2d ago",
  },
  {
    id: "q2",
    category: "FINANCING",
    areaTag: null,
    body: "Which banks currently offer the best EMI terms for NRN citizens buying residential land?",
    answered: false,
    answerCount: 0,
    askedAt: "5d ago",
  },
  {
    id: "q3",
    category: "AREA_SPECIFIC",
    areaTag: "Pokhara · Ward 6",
    body: "Is the Lakeside bypass expansion expected to raise land values in Ward 6 over the next year?",
    answered: true,
    answerCount: 3,
    askedAt: "2w ago",
  },
];

export const MY_ANSWERS: MyAnswer[] = [
  {
    id: "a1",
    category: "LEGAL",
    questionExcerpt:
      "Can a Lalpurja with a bank lien be transferred without clearing the debt first?",
    body: "No — the lien must be cleared and a release letter obtained from the bank before the Malpot office will register the transfer. The archive flags these automatically.",
    upvotes: 14,
    accepted: true,
    answeredAt: "1w ago",
  },
  {
    id: "a2",
    category: "NRN",
    questionExcerpt:
      "What documents does an NRN need to register land purchased via POA?",
    body: "You'll need a notarised Power of Attorney, your NRN ID card, citizenship copy, and the POA holder's citizenship. The concierge desk can assemble the packet remotely.",
    upvotes: 7,
    accepted: false,
    answeredAt: "3d ago",
  },
];
