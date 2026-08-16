import { PageHeader } from "components/ui/PageHeader";
export default function DisputesPage() {
  return (
    <>
      <PageHeader
        icon="warning"
        title="Disputes"
        description="Ownership disputes, fraud reports and moderation escalations."
      />
      <section className="mt-lg">
        <div className="admin-surface border border-outline-variant rounded-xl p-md">
          <p className="text-on-surface-variant">
            Dispute resolution workflow is planned for a future release.
          </p>
        </div>
      </section>
    </>
  );
}
