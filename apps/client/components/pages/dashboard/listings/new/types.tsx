import type { DraftErrors, ListingDraft } from "./draft";

/** Props handed to every wizard step — fully controlled by ListingWizard. */
export interface StepProps {
  draft: ListingDraft;
  update: (patch: Partial<ListingDraft>) => void;
  errors: DraftErrors;
}

/** Small inline error line rendered under invalid fields. */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-[12px] text-error">
      {message}
    </p>
  );
}
