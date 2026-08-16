import { cookies } from "next/headers";
import { AdminDataTable } from "components/AdminDataTable";
import { PageHeader } from "components/ui/PageHeader";
import { AdminProperty } from "lib/api";
import { adminFetch } from "lib/server";

export const dynamic = "force-dynamic";

export default async function VerificationsPage() {
  const cookie = (await cookies()).toString();
  let rows: AdminProperty[] = [];
  try {
    rows = await adminFetch<AdminProperty[]>(
      cookie,
      "/api/v1/admin/verification-queue",
    );
  } catch {
    rows = [];
  }

  return (
    <>
      <PageHeader
        icon="verified"
        title="Verification Queue"
        description={`${rows.length} listings awaiting document and ownership verification.`}
      />
      <section className="mt-lg">
        <AdminDataTable
          minWidth={720}
          columns={[
            "Code",
            "Title",
            "Type",
            "Price",
            "Owner",
            "Location",
            "Submitted",
          ]}
          empty={rows.length === 0}
          emptyMessage="No listings in the verification queue."
        >
          {rows.map((r) => (
            <AdminDataTable.Row key={r.id}>
              <AdminDataTable.Cell className="mono-stat text-[12px] text-on-surface-variant">
                {r.listingCode}
              </AdminDataTable.Cell>
              <AdminDataTable.Cell className="font-medium text-on-surface">
                {r.title}
              </AdminDataTable.Cell>
              <AdminDataTable.Cell className="text-on-surface-variant">
                {r.propertyType}
              </AdminDataTable.Cell>
              <AdminDataTable.Cell className="mono-stat text-on-surface">
                {r.askingPrice}
              </AdminDataTable.Cell>
              <AdminDataTable.Cell className="text-on-surface-variant">
                {r.owner?.name || "—"}
              </AdminDataTable.Cell>
              <AdminDataTable.Cell className="text-on-surface-variant">
                {[r.location?.district, r.location?.municipality]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </AdminDataTable.Cell>
              <AdminDataTable.Cell className="mono-stat text-[12px] text-on-surface-variant">
                {new Date(r.createdAt).toLocaleDateString()}
              </AdminDataTable.Cell>
            </AdminDataTable.Row>
          ))}
        </AdminDataTable>
      </section>
    </>
  );
}
