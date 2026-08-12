import { EmptyState } from "components/real-state/layout/dashboard/EmptyState";
import { AnswerGivenCard } from "./AnswerGivenCard";
import { MY_ANSWERS, MY_QUESTIONS } from "./constants";
import { QuestionCard } from "./QuestionCard";

export function MyQuestions() {
  return (
    <div className="flex flex-col gap-lg">
      {/* My asked questions */}
      <section className="flex flex-col gap-md">
        <h2 className="font-headline-md text-base font-semibold text-on-surface">
          My Questions
        </h2>
        {MY_QUESTIONS.length === 0 ? (
          <EmptyState
            icon="help"
            title="You haven't asked anything yet"
            description="Ask the archive about legal status, financing, or area-specific trends."
          />
        ) : (
          <div className="grid grid-cols-1 gap-md lg:grid-cols-2">
            {MY_QUESTIONS.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
        )}
      </section>

      {/* My answers given */}
      <section className="flex flex-col gap-md">
        <h2 className="font-headline-md text-base font-semibold text-on-surface">
          My Answers
        </h2>
        {MY_ANSWERS.length === 0 ? (
          <EmptyState
            icon="forum"
            title="No answers given yet"
            description="Share your expertise by answering community questions."
          />
        ) : (
          <div className="grid grid-cols-1 gap-md lg:grid-cols-2">
            {MY_ANSWERS.map((a) => (
              <AnswerGivenCard key={a.id} answer={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
