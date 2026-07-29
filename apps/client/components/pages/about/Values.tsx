import { Icon } from "@repo/ui";

const values = [
  {
    icon: "verified",
    title: "Archival Rigour",
    desc: "Every document checked against the source. We accept nothing less than the master record from the Land Revenue Office — no photocopies, no hearsay.",
  },
  {
    icon: "location_on",
    title: "Physical Presence",
    desc: "We go to the plot. Our surveyors measure boundaries, verify road access, and document the site with drone footage before any listing is approved.",
  },
  {
    icon: "balance",
    title: "Legal Transparency",
    desc: "Disputes are flagged, not hidden. Whether an inheritance conflict, a banking lien, or a Guthi trust encroachment, we surface it before the buyer commits.",
  },
  {
    icon: "shield",
    title: "Institutional Trust",
    desc: "We operate as a public-trust archive. Every verified plot is indexed with a permanent Archival ID and published for anyone to reference.",
  },
];

export function Values() {
  return (
    <section className="border-b border-outline-variant bg-surface">
      <div className="mx-auto max-w-container-max px-gutter py-xl">
        <div className="mb-xl text-center max-w-2xl mx-auto">
          <p className="font-label-sm text-[11px] font-bold uppercase tracking-[0.8px] text-on-surface-variant mb-xs">
            Our Principles
          </p>
          <h2 className="font-headline-md text-headline-md text-primary mb-sm">
            The Values That Guide the Archive
          </h2>
          <p className="font-body-md text-on-surface-variant leading-relaxed">
            Four principles define every decision we make — from how we verify
            a plot to how we publish our findings.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
          {values.map((v) => (
            <div
              key={v.title}
              className="group rounded-2xl border border-outline-variant bg-surface p-lg transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-md flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300">
                <Icon name={v.icon} filled className="text-[22px]" />
              </div>
              <h3 className="font-headline-md text-lg font-semibold text-on-surface mb-xs">
                {v.title}
              </h3>
              <p className="text-sm leading-6 text-on-surface-variant">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}