import { Icon } from "@repo/ui";
import {
  DEFAULT_CATEGORY_LABEL,
  QUESTION_CATEGORY_LABELS,
  type MyQuestion,
} from "./constants";

interface QuestionCardProps {
  question: MyQuestion;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const categoryLabel =
    QUESTION_CATEGORY_LABELS[question.category] ?? DEFAULT_CATEGORY_LABEL;

  return (
    <div className="flex flex-col gap-sm rounded-2xl border border-outline-variant bg-surface p-md transition-[transform,box-shadow,border-color] duration-300 hover:border-primary/40 hover:shadow-lg">
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-medium text-on-surface-variant">
          {categoryLabel}
        </span>
        {question.areaTag ? (
          <span className="inline-flex items-center gap-0.5 text-[11px] text-on-surface-variant">
            <Icon name="location_on" className="text-label-sm" />
            {question.areaTag}
          </span>
        ) : null}
        {question.answered ? (
          <span className="ml-auto inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            <Icon name="check_circle" filled className="text-label-sm" />
            Answered
          </span>
        ) : (
          <span className="ml-auto inline-flex items-center gap-0.5 rounded-full bg-[#b45309]/10 px-2 py-0.5 text-[11px] font-medium text-[#b45309]">
            <Icon name="schedule" filled className="text-label-sm" />
            Awaiting
          </span>
        )}
      </div>

      <p className="text-sm leading-snug text-on-surface">{question.body}</p>

      <div className="flex items-center justify-between border-t border-outline-variant pt-sm">
        <span className="mono-stat inline-flex items-center gap-1 text-[12px] text-on-surface-variant">
          <Icon name="forum" className="text-[15px]" />
          {question.answerCount} answer{question.answerCount === 1 ? "" : "s"}
        </span>
        <span className="mono-stat text-[12px] text-on-surface-variant">
          {question.askedAt}
        </span>
      </div>
    </div>
  );
}
