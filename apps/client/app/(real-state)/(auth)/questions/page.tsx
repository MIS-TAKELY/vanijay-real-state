import { DashboardHeader } from "components/real-state/pages/dashboard";
import {
  AskQuestionButton,
  MyQuestions,
} from "components/real-state/pages/dashboard/questions";

export default function MyQuestionsPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="My Questions"
        description="Questions you've asked the archive and answers you've given the community."
        action={<AskQuestionButton />}
      />

      <MyQuestions />
    </div>
  );
}
