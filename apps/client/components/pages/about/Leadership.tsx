export function Leadership() {
  const team = [
    {
      name: "Aayush Shrestha",
      role: "Founder & Archivist",
      bio: "Former surveyor at the Department of Land Reform & Management. Over a decade of experience in cadastral mapping and land dispute resolution across Bagmati and Gandaki provinces.",
    },
    {
      name: "Priya Sharma",
      role: "Director of Operations",
      bio: "Chartered accountant specializing in Nepali real estate compliance. Previously led due diligence for cross-border property investments at a Kathmandu-based law firm.",
    },
    {
      name: "Rabi Thapa",
      role: "Head of Field Verification",
      bio: "Licensed surveyor and GIS specialist. Has personally verified over 3,000 plots across 34 districts using drone photogrammetry and satellite overlay.",
    },
  ];

  return (
    <section className="border-b border-outline-variant bg-surface-container-low">
      <div className="mx-auto max-w-container-max px-gutter py-xl">
        <div className="mb-xl text-center max-w-2xl mx-auto">
          <p className="font-label-sm text-[11px] font-bold uppercase tracking-[0.8px] text-on-surface-variant mb-xs">
            The Team
          </p>
          <h2 className="font-headline-md text-headline-md text-primary mb-sm">
            Who Runs the Archive
          </h2>
          <p className="font-body-md text-on-surface-variant leading-relaxed">
            Our team combines decades of hands-on experience in land surveying,
            cadastral mapping, and Nepali property law.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-md md:grid-cols-3">
          {team.map((member) => (
            <div
              key={member.name}
              className="rounded-2xl border border-outline-variant bg-surface p-lg transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              {/* Avatar placeholder */}
              <div className="mb-md flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <span className="font-display-lg text-lg font-bold">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <h3 className="font-headline-md text-lg font-semibold text-on-surface mb-xs">
                {member.name}
              </h3>
              <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-primary mb-sm">
                {member.role}
              </p>
              <p className="text-sm leading-6 text-on-surface-variant">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}