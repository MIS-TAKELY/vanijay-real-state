import { PageHeader } from "components/ui/PageHeader";
export default function RatesPage() {
  return (
    <>
      <PageHeader
        icon="public"
        title="Region Rates"
        description="Government-published land valuation rates by district and municipality."
      />
      <section className="mt-lg">
        <div className="admin-surface border border-outline-variant rounded-xl p-md">
          <p className="text-on-surface-variant">
            Region rate management will be available once the government rate
            import pipeline is configured.
          </p>
        </div>
      </section>
    </>
  );
}
