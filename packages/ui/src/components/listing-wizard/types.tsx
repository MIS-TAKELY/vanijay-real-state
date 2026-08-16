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

/** Upload infrastructure injected by the host app (client/admin REST layer). */
export interface WizardUploads {
  uploadFile: (
    file: File,
    folder: string,
  ) => Promise<{
    url: string;
    secureUrl?: string;
    publicId?: string;
    originalFilename?: string;
  }>;
  uploadFiles: (
    files: File[],
    folder: string,
  ) => Promise<
    {
      url: string;
      secureUrl?: string;
      publicId?: string;
      originalFilename?: string;
    }[]
  >;
  deleteUpload: (publicId: string) => Promise<unknown>;
}

/** Pull a user-safe message out of any thrown value (duck-typed ApiError). */
export function getErrorMessage(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) {
    const msg = (e as { message?: unknown }).message;
    if (typeof msg === "string" && msg) return msg;
  }
  if (e instanceof Error && e.message) return e.message;
  return "Something went wrong. Please try again.";
}
