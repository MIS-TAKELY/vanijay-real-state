import { Icon } from "@repo/ui";

interface GreetingRowProps {
  name?: string;
  verificationLevel?: 0 | 1 | 2 | 3;
}

const VERIFICATION_LABELS: Record<number, string> = {
  0: "Unverified",
  1: "Level 1 Basic",
  2: "Document Verified",
  3: "Field Verified",
};

export function GreetingRow({
  name = "Archival User",
  verificationLevel = 0,
}: GreetingRowProps) {
  const isVerified = verificationLevel >= 2;

  return (
    <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between mb-md">
      <div className="flex items-center gap-md">
        <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
          Namaste, {name}
        </h2>
      </div>

      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
          isVerified
            ? "bg-primary/10 text-primary"
            : "bg-[#b45309]/10 text-[#b45309]"
        }`}
      >
        <Icon
          name={isVerified ? "verified" : "gpp_maybe"}
          filled={isVerified}
          className="text-data-table"
        />
        {VERIFICATION_LABELS[verificationLevel]}
      </span>
    </div>
  );
}
