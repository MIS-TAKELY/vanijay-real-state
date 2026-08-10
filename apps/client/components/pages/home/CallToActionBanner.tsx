import { Button } from "@repo/ui";

function CallToActionBanner() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=600&fit=crop")',
        }}
      />
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 max-w-container-max mx-auto px-gutter text-center">
        <h2 className="font-display-lg text-display-lg text-white leading-tight mb-4">
          Can&apos;t find what you&apos;re looking for?
        </h2>
        <p className="font-body-lg text-white/80 leading-relaxed max-w-2xl mx-auto mb-8">
          Let our agents help you find your perfect property. Tell us your requirements and we will match you with the best options.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" className="shadow-xl">
            Post a Requirement
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 shadow-xl"
          >
            Talk to an Agent
          </Button>
        </div>
      </div>
    </section>
  );
}

export { CallToActionBanner };
