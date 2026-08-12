import { cn } from "@repo/ui";
import { Icon } from "@repo/ui";
import { WIZARD_STEPS } from "./constants";

interface WizardProgressProps {
  currentStep: number;
}


export function WizardProgress({ currentStep }: WizardProgressProps) {
  return (
    <ol className="flex items-center gap-xs overflow-x-auto no-scrollbar mb-md p-1">
      {WIZARD_STEPS.map((step, i) => {
        const completed = i < currentStep;
        const active = i === currentStep;
        return (
          <li key={step.id} className="flex shrink-0 items-center gap-xs">
            <div
              className={cn(
                "flex items-center gap-1.5",
                completed
                  ? "text-primary"
                  : active
                    ? "text-on-surface"
                    : "text-on-surface-variant",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full mono-stat text-[12px] font-bold leading-none",
                  completed
                    ? "bg-primary text-on-primary"
                    : active
                      ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                      : "bg-surface-container text-on-surface-variant",
                )}
              >
                {completed ? (
                  <Icon name="check" className="text-[14px]" />
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={cn(
                  "font-label-sm text-[13px] font-medium whitespace-nowrap",
                  active && "font-semibold",
                )}
              >
                {step.title}
              </span>
            </div>

            {i < WIZARD_STEPS.length - 1 ? (
              <span className="mx-1 h-px w-5 bg-outline-variant" aria-hidden />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
