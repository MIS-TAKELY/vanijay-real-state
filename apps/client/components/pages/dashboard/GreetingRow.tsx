import { Badge, Icon } from "@repo/ui";

interface GreetingRowProps {
  /** Display name for the greeting, e.g. "Aayush". */
  name?: string;
  /** Verification level: 0 = unverified, 1 = basic, 2 = doc verified, 3 = field verified. */
  verificationLevel?: 0 | 1 | 2 | 3;
  /** Optional role badges, e.g. ["Owner", "Agent"]. */
  roles?: string[];
}

const VERIFICATION_LABELS: Record<number, string> = {
  0: "Unverified",
  1: "Level 1 Basic",
  2: "Document Verified",
  3: "Field Verified",
};

/**
 * Greeting row (DESIGN.md §5.1): "Namaste, {name}" Fraunces 28px + role
 * badges + verification status chip.
 */
export function GreetingRow({
  name = "Archival User",
  verificationLevel = 0,
  roles = ["Owner"],
}: GreetingRowProps) {
  const isVerified = verificationLevel >= 2;

  return (
    <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between mb-md">
      <div className="flex items-center gap-md">
        <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
          Namaste, {name}
        </h2>
        <div className="flex items-center gap-xs">
          {roles.map((role) => (
            <Badge
              key={role}
              variant="outline"
              className="border-outline-variant text-on-surface-variant"
            >
              {role}
            </Badge>
          ))}
        </div>
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
          className="text-[16px]"
        />
        {VERIFICATION_LABELS[verificationLevel]}
      </span>
    </div>
  );
}
