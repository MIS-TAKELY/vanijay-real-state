import { Icon } from "@repo/ui";

export function Story() {
  return (
    <section className="border-b border-outline-variant">
      <div className="mx-auto max-w-container-max px-gutter py-xl">
        <div className="grid grid-cols-1 items-start gap-xl lg:grid-cols-2">
          {/* Left — the problem */}
          <div>
            <p className="font-label-sm text-[11px] font-bold uppercase tracking-[0.8px] text-on-surface-variant mb-xs">
              The Problem
            </p>
            <h2 className="font-headline-md text-headline-md text-primary mb-sm">
              Why Nepal Needs a Land Archive
            </h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed mb-md">
              Land transactions in Nepal have long been plagued by title
              disputes — overlapping claims, unregistered inheritance transfers,
              fictitious plots, and missing cadastral records. For buyers, the
              risk of investing in contested land is devastating: legal battles
              that drag on for years, frozen assets, and at worst, complete loss
              of capital.
            </p>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              Existing registries are fragmented across 77 district Land Revenue
              Offices, making it nearly impossible to verify a property&apos;s
              full history without months of manual research. MALPOTH was
              founded to solve this asymmetry — by creating a single trusted
              archive that any buyer, investor, or agent can rely on.
            </p>
          </div>

          {/* Right — the solution */}
          <div className="rounded-2xl border border-outline-variant bg-surface p-lg shadow-sm">
            <div className="mb-md flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-on-primary">
              <Icon name="verified" filled className="text-[28px]" />
            </div>
            <p className="font-label-sm text-[11px] font-bold uppercase tracking-[0.8px] text-on-surface-variant mb-xs">
              The Solution
            </p>
            <h3 className="font-headline-md text-xl font-semibold text-on-surface mb-sm">
              Every Plot, Verified Before It&apos;s Listed
            </h3>
            <ul className="space-y-sm">
              {[
                "Cross-reference Lalpurja against Land Revenue Office master ledger",
                "Physical boundary measurement matched against official Naksha",
                "Clearance of inheritance disputes, banking liens, and Guthi encroachments",
                "Field-verified by certified surveyors with drone documentation",
                "Published into the public-trust archive with a unique Archival ID",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-sm text-sm text-on-surface"
                >
                  <Icon
                    name="check_circle"
                    filled
                    className="text-primary shrink-0 mt-0.5 text-body-lg"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
