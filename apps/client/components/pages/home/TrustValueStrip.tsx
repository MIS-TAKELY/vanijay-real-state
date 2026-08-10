import { Icon } from "@repo/ui";
import { trustValues } from "constants/varibles-constants";

function TrustValueStrip() {
  return (
    <section className="bg-surface-container-low border-y border-outline-variant py-10 md:py-14 relative z-10">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {trustValues.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center text-center gap-3"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon name={item.icon} className="text-[24px]" />
              </span>
              <div>
                <h3 className="font-headline-md text-headline-md text-primary mb-1">
                  {item.title}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-snug">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { TrustValueStrip };
