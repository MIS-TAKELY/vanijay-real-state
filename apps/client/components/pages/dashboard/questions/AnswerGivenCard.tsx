import { Icon } from "@repo/ui";
import {
  DEFAULT_CATEGORY_LABEL,
  QUESTION_CATEGORY_LABELS,
  type MyAnswer,
} from "./constants";

interface AnswerGivenCardProps {
  answer: MyAnswer;
}

export function AnswerGivenCard({ answer }: AnswerGivenCardProps) {
  const categoryLabel =
    QUESTION_CATEGORY_LABELS[answer.category] ?? DEFAULT_CATEGORY_LABEL;

  return (
    <div className="flex flex-col gap-sm rounded-2xl border border-outline-variant bg-surface p-md transition-[transform,box-shadow,border-color] duration-300 hover:border-primary/40 hover:shadow-lg">
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-medium text-on-surface-variant">
          {categoryLabel}
        </span>
        {answer.accepted ? (
          <span className="ml-auto inline-flex items-center gap-0.5 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-on-primary">
            <Icon name="verified" filled className="text-label-sm" />
            Accepted
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-xs">
        <p className="text-label-sm italic text-on-surface-variant">
          Q: {answer.questionExcerpt}
        </p>
        <p className="text-sm leading-snug text-on-surface">{answer.body}</p>
      </div>

      <div className="flex items-center justify-between border-t border-outline-variant pt-sm">
        <span className="mono-stat inline-flex items-center gap-1 text-[12px] text-on-surface-variant">
          <Icon name="arrow_upward" className="text-[15px]" />
          {answer.upvotes} upvotes
        </span>
        <span className="mono-stat text-[12px] text-on-surface-variant">
          {answer.answeredAt}
        </span>
      </div>
    </div>
  );
}
